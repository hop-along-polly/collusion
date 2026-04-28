## Terminology

 - Subagent: A separate execution context used to complete tasks in isolation from the main context.
 - Hook: Event driven actions Claude will take for instance before or after tool calls.
 - Skill: Markdown files that provide task specific expertise and instructions for common tasks i.e. Commit Task, Review code etc.


## When to Use

 - CLAUDE.md: when providing context, standards and constraints that always apply to the repo/project.
 - Skills: when providing task specific context and instructions to improve the execution of a common task.
 - Hooks: when providing event specific context, guardrails or validation (i.e. when saving a file or pushing a commit)
 - Subagents: when you want to isolate the execution of a task to a separate context with access to diffent tools.


## Best Practices

 - Keep `skill.md` files under 500 lines.
 - Use Progressive Disclosure (i.e. essential instructions in `skill.md` with links to additional markdown files containing detailed reference information)
 - Use `CLAUDE.md` for project wide standards and constraints and Skills for task specific expertise and only re
 - 


## Sharing Skills

A skill's **scope** determines where it's stored, who can use it, and how it's shared.

| Scope | Stored in | Available to | Good for |
|---|---|---|---|
| `Plugin` | `<pluginRoot>/skills/` | Any session where the plugin is enabled | General community skills distributed via a plugin repo |
| `Project` | `<repoRoot>/.claude/skills/` | Anyone working in that repo (commit to version control) | Repo-specific conventions and workflows |
| `Personal` | `~/.claude/skills/` | All your projects on this machine | Your own cross-project utilities |
| `Enterprise` | Managed settings (configured by org admins) `managed-settings.json` | All users in the organization | Enforcing standards across the org |

### Order of Precedence

The order of precendence for Skills with the same name from highest priority to lowest is `Enterprise` > `Personal` > `Project`.

**NOTE: `Plugin` skills sit *outside* this chain — they're namespaced as `plugin-name:skill-name`, so they can't collide with the other scopes and don't have a precedence relationship with them..**

**NOTE: Subagents don't inherently get skills from the parent process. List skills explicitly for custom subagents in the `skills` metadata field of the agent.md. file**


## Troubleshooting Skills

The broad categories of Skill failures are; the skill
  1. doesn't trigger
  2. doesn't Load
  3. has conflicts with other skills
  4. Fails at runtime

**Q:** Claude isn't using my skill when I expect it to.
**A:** Since Claude uses semantic matching to find an appropriate skill to handle the users prompt you need to ensure the name and description have overlap with how users a prompting claude. i.e. Prompting Claude to "Release the Kraken" won't trigger the App Deploy skill unless "Release" and or "Kraken" appear in the description.

**Q:** My Skill doesn't show up when I use `/skill`
**A:** Verify the `SKILL.md` file is spelled exactly as shown, that is exists in a named directory (i.e. pr-description) and that folder is under the `.claude/` directory. You can also run `claude --debug` and look for loading errors in the output. **Pro Tip: grep for your skill name so you don't have to sift through all the logs.**

**Q:** There are multiple skills with the same name causing conflicts so my skill is never used.
**A:** Ensure your skills description differentiates it from the other available skills. Also refer to the [Order of Precendence](#order-of-precedence)


**Q:** My Skills fails during execution.
**A:** Verify 3rd party packages are pre-installed or get installed by the skill. Grant execute permissions `chmod +x` for any scripts in the `./claude/scripts/` directory.


## Resources
 - [Claude Skill Metadata fields](https://code.claude.com/docs/en/skills#frontmatter-reference)
