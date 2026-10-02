# Claude Certified Architect - Foundations (CCAR-F)

Anthropic's foundational certification for building on Claude: the API and its request
handling, tool use and structured output, the Model Context Protocol, agent design, and
multi-agent orchestration.

## Topics covered

Work through these topics in order. Each links to its flashcard set for self-testing.

| # | Topic | Notes | Flashcards |
|---|-------|-------|------------|
| 1 | Claude fundamentals and prompting | [claude_101.md](../../notes/anthropic/claude_101.md) | Claude 101 |
| 2 | Working effectively with AI | [ai_fluency.md](../../notes/anthropic/ai_fluency.md) | AI Fluency |
| 3 | The Claude API end to end | [building_with_claude_api.md](../../notes/anthropic/building_with_claude_api.md), [claude_on_google_cloud.md](../../notes/anthropic/claude_on_google_cloud.md) | Building with the Claude API |
| 4 | Model Context Protocol | [intro_to_mcp.md](../../notes/anthropic/intro_to_mcp.md) | Model Context Protocol |
| 5 | Agents and the ReAct loop | [agents_sdk.md](../../notes/anthropic/agents_sdk.md) | Agents SDK |
| 6 | Multi-agent orchestration | [multi_agent_pipelines.md](../../notes/anthropic/multi_agent_pipelines.md) | Multi-Agent Pipelines |
| 7 | Agent Skills | [agent_skills.md](../../notes/anthropic/agent_skills.md) | Agent Skills |
| 8 | Claude in CI/CD | [code_review_cicd.md](../../notes/anthropic/code_review_cicd.md) | Code Review & CI/CD |

---

## Where this guide goes deeper

The eight topics above cover the whole exam. Two of them reward design judgment rather
than recall, and the lessons below treat those two in depth: **multi-agent orchestration**
and **structured JSON output**.

What makes them harder is that each question asks how several moving parts fit together -
how work is divided between a coordinator and its workers, how state survives an
interruption, how a schema leaves room for "unknown" instead of forcing a guess. Knowing
the definition of a term is rarely enough to pick the right answer.

### Multi-agent orchestration and subagents

The objectives in this cluster:

- Evaluate orchestration patterns: coordinator-worker, parallel, sequential
- Diagnose misconfigured subagent spawning - tool permissions, `AgentDefinition`, wiring
- Design state persistence for resumable multi-agent pipelines
- Use `context: fork` for isolated Skill and slash-command execution
- Structure iterative refinement workflows
- Write subagent prompts that carry every finding and all metadata, so no round-trip is needed
- Choose between goal-oriented and procedural delegation

### Structured JSON output and extraction

The objectives in this cluster:

- Synthesize sources without discarding their uncertainty
- Design extraction schemas using optional, nullable and enum fields
- Route work to human review by confidence score
- Combine `tool_choice` with a JSON schema to force structured output

---

## LESSON 1 - Multi-agent orchestration patterns

The hard line Anthropic draws:

> **Workflows** = LLMs and tools orchestrated through *predefined code paths*.
> **Agents** = LLMs *dynamically* directing their own process and tool usage.

The five patterns from *Building Effective Agents*:

1. **Prompt chaining** - sequential steps, each feeds the next. For tasks that cleanly decompose into fixed subtasks. Trades latency for reliability.
2. **Routing** - classify input, send to a specialized follow-up. When categories are distinct and better handled separately.
3. **Parallelization** - run subtasks *simultaneously* (sectioning) or run the same task multiple times for voting. Independent subtasks → **lower latency**; multiple runs → reliability via consensus.
4. **Orchestrator-workers** - a central LLM *dynamically* decomposes tasks, delegates to workers, synthesizes results. Key distinction from parallelization: **subtasks are NOT predefined** - the orchestrator decides them from the input. This is the exam's "coordinator-worker."
5. **Evaluator-optimizer** - one LLM generates, another critiques in a loop (see Lesson 9).

**The exam trap:** parallel vs. orchestrator-worker.
- Subtask count/shape knowable up front → **parallelization**.
- Subtasks depend on what's discovered → **orchestrator-worker**.
- Latency-sensitive + independent work → **parallel**.
- Coverage of unknown scope → **orchestrator**.

📖 [Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)
📖 [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)

---

## LESSON 2 - Diagnosing broken subagent spawning

A subagent fails to work for three diagnosable reasons - the triage list:

1. **Missing tool permissions** - the subagent's `tools:` frontmatter (or `allowedTools` in the SDK) omits a tool it needs. A research subagent with no search/read tool returns empty. Note: *omitting* `tools` inherits all tools - the real bug is often over-restriction.
2. **Incorrect `AgentDefinition` parameters** - in the Agent SDK a subagent is defined by an `AgentDefinition` (`description`, `prompt`, `tools`, `model`). Wrong/missing fields → the coordinator can't route to it, or it spawns with the wrong system prompt.
3. **Absent coordinator-to-subagent wiring** - the orchestrator has no way to *invoke* the subagent (not registered/available to the Agent tool). Perfectly defined, never called.

Subagents are Markdown files with YAML frontmatter (`name`, `description`, `tools`, `model`), stored at `~/.claude/agents/` (user) or `.claude/agents/` (project). The `description` is what the coordinator uses to *decide* delegation - a vague description is itself a wiring bug.

📖 [Create custom subagents (Claude Code)](https://docs.claude.com/en/docs/claude-code/sub-agents)
📖 [Subagents in the SDK](https://docs.claude.com/en/docs/agent-sdk/subagents)

---

## LESSON 3 - Delegation strategy & self-contained subagent prompts

**Goal-oriented vs. procedural delegation.**
- Procedural = "do step 1, then 2, then 3."
- Goal-oriented = "achieve this outcome; here's what success looks like."
- **Goal-oriented enables adaptive behavior** - the subagent adjusts to what it finds - while the coordinator keeps visibility via the returned result. Pick goal-oriented when the path can't be predicted; procedural only when steps are truly fixed and must not vary.

**Self-contained subagent prompts.**
Each subagent runs in an **isolated context window** - it does NOT see the coordinator's conversation, files already read, or other subagents' work. So the delegation prompt must include **everything the subagent needs**: all relevant findings, structured data, and source metadata. If it must return to the coordinator for missing context, the wiring is wrong. Detailed task descriptions (objective, output format, boundaries) are the single biggest lever on subagent quality.

📖 [Multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)
📖 [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

---

## LESSON 4 - State persistence & resumable pipelines

Keep two things apart here. Resuming a single interrupted session is handled for you; persisting state across a multi-agent pipeline is something you have to design.

To resume after interruption **without repeating completed work or losing findings**, persist **intermediate state to durable storage** as each stage completes - not just in the context window:

- **Checkpoint completed work** to external memory (files/scratchpad/store), keyed so a restart detects "stage 3 done, skip to 4."
- **Structured state objects** that survive context compaction - read state back rather than re-deriving it.
- Persist **findings as they're produced**, so an interrupted subagent's partial results aren't lost.

Same "external memory" idea as context engineering, applied to a multi-step pipeline instead of one long conversation.

📖 [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
📖 [Building agents with the Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)

---

## LESSON 5 - `context: fork`

Default: a Skill or slash command runs **in your current session**, sharing context. Add **`context: fork`** to the frontmatter and it runs in an **isolated subagent** - a fresh context window that does NOT see conversation history, preventing cross-contamination of session state.

Exam details:
- `context: fork` only makes sense for skills with an **explicit task** - a fork of pure "guidelines" content produces no meaningful output (no actionable prompt).
- The fork **runs in the background** by default; set `background: false` to wait for the result in the invoking turn.
- Pick the `agent:` type to execute it (e.g. `agent: Explore` sees only the SKILL.md + that agent's system prompt).

📖 [Extend Claude with skills (Claude Code)](https://docs.claude.com/en/docs/claude-code/skills)

---

## LESSON 6 - Structured JSON output & `tool_choice`

Three ways to get structured output, ascending strictness:

1. **Prompt-based** - ask for JSON, maybe prefill `{`. Cheapest, least reliable.
2. **Tool use with a JSON `input_schema`** - define a tool whose schema is your target shape; Claude "calls" it with structured args.
3. **Structured outputs (strict)** - *guaranteed* schema conformance.

**The two levers the exam hammers:**

- **`tool_choice`** forces a tool to be called. `{"type": "any"}` guarantees *some* tool is used; `{"type": "tool", "name": "..."}` forces a *specific* one. Use when a conversational (non-tool) reply would break downstream parsing. Default `{"type": "auto"}` does NOT guarantee invocation, which is the trap.
- **`strict: true` + structured outputs** - set `strict: true` on the tool definition (or use `output_format: {type: "json_schema"}` for JSON responses) with beta header `structured-outputs-2025-11-13`. Guarantees type-safe params (`passengers: 2`, never `"two"`). Combine `tool_choice: {"type":"any"}` **with** strict tool use to guarantee both *that* a tool is called and that its inputs match schema.

📖 [Structured outputs](https://docs.claude.com/en/docs/build-with-claude/structured-outputs) - newest, most exam-relevant
📖 [How to implement tool use](https://docs.claude.com/en/docs/agents-and-tools/tool-use/implement-tool-use)
📖 [Increase output consistency](https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/increase-consistency)

---

## LESSON 7 - Extraction schemas: optional / nullable / enum

A naive schema *forces the model to fabricate* values for absent fields. Make "I don't know" representable:

- **Optional fields** - don't put a field in `required` if it may be absent.
- **Nullable values** - allow `null` (e.g. `"type": ["string", "null"]`) so the model can say "missing" instead of hallucinating.
- **Enums** - constrain a field to a fixed value set so the model can't drift into free-text variants; include an explicit `"unknown"`/`"other"` member for ambiguous cases.

Pair the schema with **format-normalization instructions** and **few-shot examples** to cut hallucination and hold consistency across varied document formats. Schema design and few-shot design work together: the schema says what may be absent, the examples show what a filled-in answer looks like.

📖 [Structured outputs](https://docs.claude.com/en/docs/build-with-claude/structured-outputs)
📖 [Tool use overview](https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview)

---

## LESSON 8 - Synthesis with preserved uncertainty & confidence-based review routing

**Preserve source-level uncertainty.** A synthesis agent must NOT collapse conflicting sources into one confident statement. Correct behavior: distinguish **well-established findings** from **contested claims**, surface disagreement, carry confidence/uncertainty through to output. Flattening conflict is a silent reliability failure.

**Route human review by confidence, not randomly.** Don't randomly sample extractions for QA. Route on **confidence scores, document characteristics, and field-level ambiguity** - send uncertain/ambiguous/low-confidence extractions to humans, auto-accept high-confidence ones. This requires your schema (Lesson 7) to emit per-field confidence - which is why these objectives cluster.

📖 [Multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)
📖 [Reduce hallucinations](https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)

---

## LESSON 9 - Iterative refinement workflows

The **evaluator-optimizer** pattern applied to refinement. Give the model:

- **Concrete input→output examples** (few-shot showing the desired transformation),
- **Targeted feedback on specific failures** - "field X was wrong because Y," not "make it better,"
- **Batched issue descriptions** so multiple problems are evaluated in one consolidated pass, not one-at-a-time round-trips.

The exam contrasts *specific, batched, example-driven* feedback against vague global feedback. Specific + batched wins.

📖 [Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents) - evaluator-optimizer section

---

## LESSON 10 - Codebase exploration tools

- **Glob** - find files by *name/path pattern* (`**/*.ts`).
- **Grep** - find files/lines by *content* (regex).
- **Read** - open a *specific known* file.
- **Bash** - when you need to *run* something (git, build, script), not for searching (prefer Grep/Glob over `grep`/`find`).

Strategy: Glob/Grep to *locate*, Read to *understand*, build understanding *incrementally* to respect the context window - don't Read everything up front.

📖 [Claude Code built-in tools / subagents](https://docs.claude.com/en/docs/claude-code/sub-agents)
📖 [Writing effective tools for AI agents](https://www.anthropic.com/engineering/writing-tools-for-agents)

---

## Prioritized study plan

Read these **three** first - between them they cover most of the material above:

1. **[Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)** → Lessons 1, 9
2. **[How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)** → Lessons 1, 3, 8
3. **[Structured outputs](https://docs.claude.com/en/docs/build-with-claude/structured-outputs)** → Lessons 6, 7

Then the Claude Code / SDK mechanics:
- [Create custom subagents](https://docs.claude.com/en/docs/claude-code/sub-agents)
- [Subagents in the SDK](https://docs.claude.com/en/docs/agent-sdk/subagents)
- [Skills / `context: fork`](https://docs.claude.com/en/docs/claude-code/skills)
- [Effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) (Lesson 4)

