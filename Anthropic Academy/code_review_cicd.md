# Claude Code Review & CI/CD

Automatic code reviews can be enabled for a Github Repository using Anthropics hosted `Code Review` solution or the `Claude Code` Github Action.

## Claude Github App

The `Claude` Github App is shared by every Claude feature that integrates with Github including `Code Review` and the `Claude Code` Github Action. The app can be installed from a local claude code instance using the `/install-github-app` slash command. That slash command automatically sets up the apps permissions. If setting up the app manually you will need to grant the following permissions.

| Permission | Access |
| ---------- | ------ |
| Actions | read & write |
| Checks | read & write |
| Contents | read & write |
| Discussions | read & write |
| Issues | read & write |
| Members | read |
| Metadata | read |
| Pull Requests | read & write |
| Repo Hooks | read & write |
| Statuses | read |
| Workflows | read & write |

> [!IMPORTANT]
> The `Claude Code` Github App must be installed on the repository the `claude-code-action` will be used in.

 ---

## Claude Code Github Action

The official name of the Github Action is `claude-code-action` and can be found on the [Github Actions Marketplace](https://github.com/marketplace/actions/claude-code-action-official). Just like Claude Code the `claude-code-action` loads the repositories `CLAUDE.md` file into context each session. Include the following in the `CLAUDE.md` file as a best practice when using the `claude-code-action`
  - style guidelines
  - review criteria
  - project-specific rules
  - preferred patterns

The Claude Code Action can be run in an `Interactive` mode or a `Automation` mode. Regardless of which mode the `claude-code-action` runs in it will check for the following things before running.
 - If the user has `write` access to the repository for Issue and Pull Request events.
   - This event is skipped for any event not triggered by a user.
   - User's without write access to the repository can still be allowed if they are specified in the `allowed_non_write_users` field and a `github_token` is passed in to the action. 
 - Was the event triggered by a human user.
   - Events triggered by a bot are rejected unless the bot is listed in the `allowed_bots` field.

### Interactive mode

Interactive mode is used to respond to the `@claude` mentions (a.k.a the Trigger Phrase) in Pull Requests, and Issues.

> [!NOTE]
> To enable Interactive mode on a `claude-code-action` step you **MUST** omit the `prompt` field. The `prompt` comes from the event payload where the trigger phrase was used and is not staticly defined in the workflow file.

When talking about Interactive mode it is important to understand the Github Action Workflow is triggered by one of the standard Github Actions event types (e.g. `issue_comment`, `pull_request_review_comment` etc.) not the `@claude` trigger phrase. If the payload of the event (e.g. `issue_comment`) includes the `@claude` trigger phrase then the `claude-code-action` step(s) in that workflow will run. Otherwise that `claude-code-action` step logs "No trigger found" and is skipped.

The following Github event types best lend themselves to using `claude-code-action` in Interactive Mode
| Event | Types | Description |
| ----- | ----- | ----------- |
| `issue_comment` | created | Runs when a comment has been added to an Issue |
| `pull_request` | opened | Runs when a new PR is opened and include `@claude` in the Title or Description |
| `pull_request_review` | submitted, edited | Runs when a PR Review was submitted or updated |
| `pull_request_review_comment` | created | Runs when a comment has been added to an Issue |
| `issues` | opened, assigned, labeled | Runs when <ul><li>an issue is created and uses the `@claude` trigger phrase in the Title or Body.</li><li>When the issue is assigned to "claude"</li><li>when the claude label is applied to the issue.</li></ul> | 

**Example**
```yaml
name: Interactive Mode Example

on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
  pull_request_review:
    types: [submitted, edited]
  issues:
    types: [opened, assigned, labeled]
  pull_request:
    types: [opened]

permissions:
  contents: write
  pull-requests: write
  issues: write
  id-token: write
  actions: read

jobs:
  answer_comment:
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          # No `prompt:` — this is what selects interactive mode
```

> [!WARNING]
> A `claude-code-action` Step in a Workflow that triggers on an event like `push` will never trigger because that events payload will never include the `@claude` trigger phase.

### Automation mode

Automation mode is best used when some specific action should be taken because a specific event occurs.

> [!NOTE]
> To enable Automation mode you **MUST** provide a value for the `prompt` field on the `claude-code-action` step(s).

The following Github event types best lend themselves to using `claude-code-action` in Automation Mode
| Event | Types | Description |
| ----- | ----- | ----------- |
| `pull_request` | opened, syncronize, ready_for_review, reopened | Runs when <ul><li>a PR is opened</li><li>any commits are pushed to the PR branch</li><li>the PR is changed from Draft to Ready for Review.</li></ul> |
| `schedule` | * | Runs on a schedule with no user triggering the event |
| `workflow_dispatch` | * | Runs when the workflow is called by a user. |
| `push` | * | Runs when commits are pushed to a branch. |

**Example**
```yaml
name: Claude Code Review
on: push
  branches:
    - main

jobs:
  review_code:
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with: ${{ secrets.ANTHROPIC_API_KEY }} # This will be automatically set by the /install-github-app slash command
        prompt: Regenerate the Open API Docs and store them in the Developer Portal S3 bucket.
```

### Claude Code Action Inputs

The following inputs are available for the `claude-code-action` and can be used to customize the behaviour of the Action. The full list can be found [here](https://github.com/anthropics/claude-code-action/blob/main/docs/usage.md#inputs).

| Field | Required | Default | Description | 
| ----- | -------- | ------- | ----------- |
| `prompt` ||| Instructions for Claude. If Omitted the `@claude` trigger phrase is used for the prompt. |
| `claude_args` || Claude Code CLI Flags (i.e. `--agent`, `--allowedTools`, etc.) See [Claude Code CLI Flags](#claude-code-cli-flags) for more details |
| `include_fix_links` || True | Adds 'Fix This' links in code reviews that opens Claude Code with Context to fix the issue |

### Claude Code CLI Flags

All of the Claude Code CLI Arguments can be passed in as values to the `claude_args` input field for the `claude-code-action`. The following table explains some of the more useful ones for customizing the Actions behavior.

| Flag | Description |
| `--system-prompt` | Replaces the entire System Prompt. (i.e. Overrides the value from the Actions `prompt` field.) |
| `--system-prompt-file` | Loads a System Prompt from a file replacing the default System Prompt |
| `--append-system-prompt` | Appends instructions to the System Prompt provided in `--system-prompt` and/or the `prompt` input |
| `--append-system-prompt-file` | Appends instructions from a file to the System Prompt provided in `--system-prompt` and/or the `prompt` input |
| `--append-subagent-system-prompt` | Appends customer instructions to every Subagents System Prompt |
| `--allowedTools` | A list of pre-approved tools Claude can use this session |
| `--disallowedTools` | A list of disallowed tools Claude cannot use this session and should not even ask permission to use. |
| `--model` | Selects which Anthropic Model to use this session |
| `--effort` | Selects Effort level to use this session |

### Advanced Usage

The `claude-code-action` can run Skills defined in your repositories `.claude/skills` directory or from a Plugin.

When using a Skill defined in `.claude/skills` you **MUST** use the `actions/checkout` action before the `anthropics/claude-code-action`. This ensures the Skill files exist on the Runner. To invoke the Skill pass the Skill name as the value for the `prompt` field (i.e. `prompt='/code-review'`)

When using a Skill defined in a Plugin you **MUST** use the `plugin_marketplace` and `plugin` inputs for the `claude-code-action` to install the plugin. To invoke the skill pass `/plugin-name:skill-name` as the `prompt`.

**Example**
```yaml
- uses: anthropics/claude-code-action@v1
  with:
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    plugin_marketplaces: "https://github.com/anthropics/claude-code.git"
    plugins: "code-review@claude-code-plugins"
    prompt: "/code-review:code-review --comment ${{ github.repository }}/pull/${{ github.event.pull_request.number }}"
    claude_args: '--allowedTools "mcp__github_inline_comment__create_inline_comment"'
```

### Managing Costs

The following are Best Practices or cost optimizing the Github Action Minutes and Tokens the `claude-code-action` consumes.
 - Use self-hosted runners to avoid paying for Github Runners. This is the single best optimization to reduce Github Action Minutes consumed
 - Use Github Actions concurrency controls to limit parallel execution
 - Set workflow level timeouts to avoid runaway jobs
 - Set the `--max-turns` in `claude_args` to limit iterations
 - Use issue templates to provide context up front
 - Be specific in `@claude` requests so it takes fewer turns to complete the task
 - Keep the `CLAUDE.md` file concise

### Troubleshooting

**If Claude is not responding to `@claude` commands**
  1. Verify the Claude Github App has been installed for the Repository
  2. Check that Workflows are enabled for the Repository
  3. Ensure the API Key or OAuth Token is set as a Repository secret
  4. Confirm the command uses `@claude` and not `/claude` or `@claude-bot`
  5. Confirm the commenting user has the appropriate write permissions

**CI Does Not Running when Claude Adds Commits Action**
 1. Ensure the `GITHUB_TOKEN` is not being passed to the `claude-code-action`. Github Actions **don't** run on commits added with the default `GITHUB_TOKEN`
 2. Ensure the CI Workflows include the event triggers activated when Claude pushes commits.

**Auth Erros**
 1. Confirm the API Key or OAuth Token works with a local `claude` instance
 2. Reference the Cloud Porviders troubleshooting docs IF using Bedrock, Microsoft Foundry or Google Cloud Agent's Platform.

 --- 

## Code Review

Claude Code Review is a managed service that reviews Github Pull Requests using a fleet of specialized Subagents. Findings are tagged by severity and left as inline comments. Code Review runs when
 - A new PR is opened
 - A PR is updated
 - It is manually trigged using `@claude review` in a comment.

> [!NOTE]
> To Subscribe Code Review to a PR add `@claude review always` to a comment.

**Severity Levels**: Code Review will tag each finding with one of the following severity levels
 - `Important`: The issue should be fixed before the PR is merged
 - `Nit`: A minor issue that should be fixed but does not block the PR
 - `Pre-Existing`: A bug that exists but was not introduced by this PR

> [!NOTE]
> Code Review does **not** Approve/Block Pull Requests it analyzes.

You can respond to each review comment with a 👍 (Useful comment) or 👎 (Unhelpful comment). Anthropic collects your responses to fine-tune the reviewer Subagents.

### Customizing Reviews

You can fine tune what Code Review flags by adding rules and acceptable patterns to `CLAUDE.md` and/or `REVIEW.md`.

`CLAUDE.md` files should include project/directory level instructions that apply to all tasks and not specifically code reviews. 
 - Code Review reads `CLAUDE.md` files in every directory. A `CLAUDE.md` file only applied to the directory it is in and the subdirectories. So a `CLAUDE.md` at the root of the repository applies to everything, but a `CLAUDE.md` file in the `src/ui/components` directory only applies to the `components` directory and subdirectories in `components`.
 - Code Review flags any code the violates a rule or pattern in `CLAUDE.md` as a `nit` level finding. If the code changes making a `CLAUDE.md` statement outdated the `CLAUDE.md` file gets tagged with a `nit` finding.

`REVIEW.md` lives at the repository root, includes code review specific guidance and is only used by subagents during code reviews. Common rules a `REVIEW.md` file include but are not limited to
 - `Severity`: Redefine what class(es) of findings should be flagged as `important` or `nit` findings.
 - `Nit Volume`: Set a hard cap on how many `nit` findings can be included in a review
 - `Skip rules`: List paths, branch patterns and finding categories that Code REview should **not** post any findings for.
 - `Repo-specific checks`: Include rules for checks that should be performed for a specific repository. For instance a repo with a Rest API might include the rule, "All API routes **must** have an integration test."
 - `Verification bar`: Requires evidence before a class of finding is reported. For example "include a `file:line` citation for any behaviour claims. Do not rely on inference from naming". This cuts down on flase positives.
 - `Re-review Convergence`: Tell Code Review how to handle reviewing a PR that has already been reviewed. A rule such as "IF the PR has already been reviewed do not flag new `nit` findings". This prevents one-line changes from spiraling into multiple reviews
 - `Summary Shape`: Creat a rule defining how the review body should be formatted. For example "Include a one-line tally such as 4 factual, 2 stlye in the review body"

> [!NOTE]
> `@import` syntax is not supported for `REVIEW.md`
