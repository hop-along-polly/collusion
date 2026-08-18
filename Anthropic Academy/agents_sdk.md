# Agents SDK

Anthropic's Agents SDK wraps the execution engine, ReAct loop, built-in tools, subagents etc. that is used in Claude Code.
This puts the Agents SDK at a higher level of abstraction than the Client SDK which gives a developer access to the core
Messages API.

**Use Case**: Use the Agents SDK when building an Agent without implementing a custom tool loop.

The Agents SDK includes the following capabilities:

- `Built-in Tools`: Provides ready-to-use tools that can be imported and invoked by agents, eliminating the need to implement common tool functionality from scratch.
- `Hooks`: Provides lifecycle hooks for executing custom code at defined points during agent execution without having to manage the underlying lifecycle logic.
- `Subagents`: Provides APIs for creating and orchestrating specialized agents to handle subtasks, including managing their execution as part of the parent agent's workflow.
- `MCP Client`: Provides a built-in MCP client that handles the MCP connection lifecycle, including initialization, authentication, tool discovery, and tool invocation.
- `Permissions Engine`: Provides configurable tool-level permissions and enforcement, eliminating the need to build custom authorization logic around tool execution.
- `Session Management`: Provides session persistence and lifecycle management, including saving, resuming, and forking sessions without requiring a custom session storage and management implementation.
- `Skills, Commands & Memory`: Provides mechanisms for storing and loading skills, commands, and memory from `.claude` and `~/.claude` directories, removing the need to implement custom discovery and loading mechanisms.
- `Plugin Framework`: Provides an extensible framework for creating and integrating third-party plugins without having to design and implement a plugin architecture.

## Terminology

 - `ReAct Loop`: a.k.a Agentic Loop. ReAct is derived from Reason + Act because this loop involves reasoning about an input, deciding to call tools if needed and then interpreting those results and is the core construct of how any agentic system works.
 - `Turn`: A turn is a single round trip in the ReAct loop meaning the Model receives input, produces an output including a `ToolUseBlock`, the Tool is called, and the Tool results are returned to the Model.
 - `Tool Overload`: A phenomenon where an Agent has to many Tools to choose from and the Model starts making poor choices on which tool to use. Also referred to as Tool Bloat or the Tool choice selection problem.

## Core Concepts

### ReAct Loop

The Agent SDK includes the Claude Code ReAct Loop. Every Agent session follows this cycle
 1. `Receive Prompt`: The User Prompt + System Prompt + Message History + Tool Definitions are received as sent to the Model for initial reasoning.
 2. `Evaluate and Respond`: The Model evalutes the input received, and determines if it can generate a final answer of if it needs to call Tools. If tools need to be called a `ToolUseBlock` is returned describing which tool should be called and what inputs should be provided. More on Tool Use in [Building with Claude API](./building_with_claude_api.md#tool-use).
 3. `Call Tools`: For each `ToolUseBlock` returned and send results back to the Model. `Hooks` can be used to intercept, modify or block tool calls at this stage of the cycle.
 4. `Repeat`: Steps 2 & 3 repeat until there are no `ToolUseBlocks` returned or the Max Turns limit has been reached.
 5. `Return Result`: The final result is returned.

### Turns

Each Turn within the ReAct loop consists of; receiving input, requesting Tool calls, calling Tools, and receiving Tool results. All of these steps happen before control is returned from the SDK.

The number of Turns that call Tools can be limited by setting the `max_turns` in the Python SDK or `maxTurns` in the Javascript SDK.


### ReAct Loop Execution Controls

The following settings can be used to control how the ReAct Loop runs.

 - `max_budget_usd`: Limits the cost that a ReAct loop can run.
 - `effort`: Limits how much reasoning the Model will do before responding. Valid values are `low`, `medium`, `high`m `xhigh`, `max`

## Built-in Tools

The following tools are built into the Agents SDK.

| Category | Tools | What they do |
| -------- | ----- | ------------ |
| File Operations | `Read`, `Edit`, `Write` | read, modify and create files |
| Search | `Glob`, `Grep` | Find files by pattern and search content of files using regex |
| Execution | `Bash` | Run shell commands and scripts |
| Web | `WebSearch`, `WebFetch` | Search the web, fetch content, and parse web pages |
| Discovery | `ToolSearch` | Find and load Tools on-demand instead of pre-loading them all. |
| Orchestration | `Agent`, `Skill`, `AskUserQuestion`, `Task Create`, `taskUpdate` | Spawn subagents, invoke skills, ask the user questions and track task progress |

The `allowed_tools` and `disallowed_tools` arguments can be used to explicitly allow/deny specific Tools.

> [!NOTE]
> Read only Tools (e.g. Read, Glob, Grep) can be run in parallel while Tools that modify state (e.g. Edit, Write) will be run sequentially. Custom Tools default to running sequentially.

> [!NOTE]
> The `SendMessage` Tool allows an Agent to send a message to any other named Agent including Agents running in a different session.

## Hooks

Hooks are callbacks (literal function calls) executed at specific points of the ReAct Loop. The Hook trigger points are
 - `PreToolUse`: before a tool is called.
 - `PostTooluse`: after a tool returns results.
 - `UserPromptSubmit`: after a prompt is sent (both User and Assistant) 
 - `Stop`: after the Model generates a stop_sequence message block, or stops for any other reason
 - `SubagentStart`: before a subagent spawns
 - `SubagentStop`: after a subagent completes
 - `PreCompact`: before the context window is compacted

> [!NOTE]
> Hooks run in the application process and do not consume context.

## Subagents

Subagents are separate Agent instances that your main Agent can spawn to handle focused subtasks. A Subagent essentially starts out with a blank slate but the things it receives from the main Agent are
 - a specialized System Prompt tailored for the subtask it will be working on
 - a list of the main Agent's Tool definitions (or a subset of them) specified in the `tools` argument.

The Subagent will **NOT** receive the following from the main Agent.
 - the main Agent's conversation history
 - the main Agent's System Prompt
 - preloaded skill content (unless explicitly listed in `AgentDefinition.skills`)

The list of Tools a subagent has access to can be restricted when it is spawned. This reduces the chances of Tool overload.

> [!NOTE]
> When a Subagent is spawned with `fork` main Agent's System Prompt, entire conversation history, and Tools are inherited by the Subagent.

### Defining Subagents

Subagents can be defined programmatically (recommeneded), or as markdown files in the `.claude/agents` directory.

When defining agents programatically you can inlcude the `Agent` tool in `allowed_tools` to auto-approve spawning Subagents.
The following parameters are available when defining an Agent
 - `description`: a description of when to use the agent
 - `prompt`: the System Prompt the Agent will use
 - `tools`: the list of tools available to the Agent. If omitted every Tool available to Subagents will be inherited.
 - `disallowedTools`: a list of tools that the Agent cannot use. MCP level patterns (e.g. `mcp__server__*`) are also supported.
 - `model`: the name of the LLM the Agent will use for reasoning
 - `skills`: the list of skills to preload into the Agents context window. Unlisted skills can still be called.
 - `memory`: what scope of memory the Agent should have access to. `user` loads memory from `~/.claude/CLAUDE.md` while `project` additionally loads `~/.claude/projects/<project_name>/memory`
 - `mcpServers`: the MCP Servers that are available to this Agent
 - `initialPrompt`: an auto submitted User Message when the Agent is run as the main Agent. This is ignored when the Agent is spawned as a subagent. 
 - `maxTurns`: the maximum # of Turns the Agent can take before stopping
 - `background`: a flag indicating if the Agent will be run as a non-blocking background task or not. `True` runs the Agent in the background `False` does not.
 - `effort`: the level of Reasoning effort the Agent will use
 - `permissionMode`: how much permission the Agent has based on the predefined rules in the various modes; `default`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, and `plan`

> [!NOTE]
> A programmatically defined agent takes precedence over a filesystem-based Agent.

### Resuming Subagents

Subagents can be resumed which retains the
 - full conversation history
 - previous tool calls
 - reasoning blocks

Before a Subagent can be resumed you will need to capture the `session_id` and the `agent_id`. When resuming the Subagent pass the session id in as the `resume` parameter in `query`.
