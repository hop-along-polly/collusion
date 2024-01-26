# Github CI/CD

Table of Contents
 - [Github Teams](#github-teams)
 - [Code Owners](#codeowners)
 - [Github Actions](#github-actions)

## GitHub Teams

The 2 primary use cases for GitHub teams is to grant permissions in a consistent and organized way to members of an organization and secondly to coordinate which members get notified for which events.

Teams are often used to reflect an organizations hierarchy and only members of the organization can be added to the organizations teams. Each team can of course have multiple members, and members of the organization can be assigned to multiple teams.

Teams can also have child teams. Child teams will inherit the permissions granted to the parent team and any time the parent team is mentioned the child team will receive a notification, but when a child team is mentioned the parent team will not be mentioned. An example of using child teams would be created a `devops` team that includes all devops engineers and then having 2 child teams, an `azure` team including all the devops engineers that are Azure experts, and an `aws` team including all the devops engineers that are AWS experts. This would allow the general engineering teams to tag a group of engineers specifically based on expertise.

Each team has it's own page which includes a list of the members, repositories the team owns, and the child teams nested under it.


## CODEOWNERS

A `CODEOWNERS` file specifies which teams/users are the code owner(s) for various parts of a repository's code base. Each entry in a `CODEOWNERS` file contains a file path/pattern and a list of users and/or teams that are the code owner(s) for that path/pattern. When a PR is created GitHub will use the `CODEOWNERS` file to determine the code owner(s) so that they can be tagged as a reviewer for the pull request.

The path/pattern syntax for a `CODEOWNERS` file is the same pattern syntax used in a `.gitignore` file, however there are a few syntax rules that CANNOT be used in a `CODEOWNERS` file. See [CODEOWNERS Syntax](#codeowners-syntax) for more details and examples.

Code owners are generally referenced by thier Github handle i.e. `@ttestofferson` for a user, or `@testerozza/testers` for a team. Additionally users can be referenced by their email address and GitHub will search up the user associated with that email address just like it does for commit authors.

It is important to note that the last matching pattern in a `CODEOWNERS` file will be the entry that determines the code owners that are tagged for review on that PR. For example given the following `CODEOWNERS` file and a PR that updates a `go` source code file in the `build/` directory the second pattern takes precedence over the first so the user `@ttestofferson` would be tagged to review the PR.

```
/build @testerozza/devops-team

*.go @ttestofferson
```

Each branch of a repository can have it's own `CODEOWNERS` file.
That file must be located in the `.github/`, root, or `docs/` directory of the repository.
Only the first `CODEOWNERS` file is used to determine code owners AND it will only determine code owners for that git branch. The precedence of `CODEOWNERS` files is `.github/` > root > `docs/`.


### CODEOWNERS Syntax

The following patterns are NOT supported in `CODEOWNERS` files

1. `\` cannot be used to escape a patternt that starts with `#`. This lines will always be interpreted as comments.
2. `!` cannot be used to negate a pattern
3. `[]` cannot be used to define a character range (i.e. [A-Za-z])

**Example**
```
# This specifies the global code owners for the repository. If a PR does not match another rule these owners will be tagged as reviewers.
# NOTE: This rule should be the first rule in the CODEOWNERS file because it will take precedence over any rule defined before it.
 @testerozza/engineering-team

# This rule specifies the DevOps team as the code owner for any files ending in .tf that exists under the root-level build directory.
build/**/*.tf @testerozza/devops-team
```

## Github Actions

GitHub Actions is the CI/CD feature of GitHub allows developers to define the automated, build, testing, and deployment workflows in a yaml file that exists in the same repository as the source code itself. Additionally GitHub actions can be used to automate maintenance tasks for a repository.

**NOTE: GitHub Actions has uses some very general terms such as "Action", "Event", "Job" etc. to refer to very specific concepts within GitHub Actions. To avoid confusion when you see a term like Action this refers to the Proper Noun for Action as defined by GitHub Actions, and action is just the general term for action.**

### Components
 - `Workflow`: Automated processes defined by a yaml file located in the `.github/workflows` directory of a repository.
 - `Runner`: A server that a Workflow runs on when it is triggered.
 - `Event`: A specific activity that occurs in a repository to trigger a Workflow. (i.e. opening a PR, or creating an issue)
 - `Job`: A set of Steps within a Workflow executed in syncronous order and on the same Runner.
 - `Action`: Customized plug-n-play applications that can be used as a Step in a Job.

### Workflows

A repository's workflow(s) are defined by yaml files located in the `.github/workflows` directory of the repository itself. A repository can contain any number of Workflow yaml files.

A Workflow's yaml file at a minimum must include
 - 1 or more Events that trigger the Workflow.
 - 1 or more Jobs that will be run as part of the Workflow.
 - 1 or more Steps per Job in the Workflow that define that tasks needed to complete the Job.

GitHub offers an excellent example for [Understanding a Workflow yaml file](https://docs.github.com/en/enterprise-cloud@latest/actions/using-workflows/about-workflows#understanding-the-workflow-file)

**Reusing Workflows**

There are 2 way's to reuse workflows. "Reusable Workflows", "Starter Workflows"

Workflows can reference other workflows, however there can only be 4 levels of inception in a Workflow (i.e. Workflows can only be nested up to 4-levels deep). Additionally when calling another workflow it is take it or leave it. You CANNOT spin up services or add steps to a called work flow.

That being said there are 2 work arounds/hacks for adding additional functionality hen calling a reusable workflow.

1. As the author of a workflow you can accept inputs that alter the behaviour of a step or enable/disable it entirely. See [Configurable Workflows](#configurable-workflows)
2. A Workflow that calls a reusable workflow can define other jobs that are dependant on the reusable workflow. See [Reusable Workflows and Dependent Jobs](#reusable-workflows-and-dependent-jobs)

# TODO Research jobs being dependant on a reusable workflow

Follow GitHub's guide for [Creating a Reusbale Workflow](https://docs.github.com/en/enterprise-cloud@latest/actions/using-workflows/reusing-workflows#creating-a-reusable-workflow) if you're interested in writing your own Workflows.

# TODO Research Starter workflows
https://docs.github.com/en/enterprise-cloud@latest/actions/using-workflows/creating-starter-workflows-for-your-organization

### Reusable Workflows and Dependent Jobs

Given the following reusable Workflow
```yaml
name: Reusable Workflow

on:
  workflow_call:
    inputs:

jobs:
  ci:
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.10'
      - name: Check Python Version
        run: python --version
```

You can configure a Job to run before or after it using the `needs` property.
```yaml
name: Experiments
on:
  pull_request:
    branches:
      - main
  push:

jobs:
  pre-reusable-workflow:
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v2
      - name: Run Pre Shared Workflow Stuff
        run: echo "Pre shared workflow"
  call-reusable-workflow:
    needs: pre-reusable-workflow
    uses: <github-username>/<repo-name>/.github/workflows/reusable.yaml@main
  post-reusable-workflow:
    runs-on: self-hosted
    needs: call-reusable-workflow
    steps:
      - uses: actions/checkout@v2
      - name: Run Post Shared Workflow Stuff
        run: echo "Post shared workflow"
```

In this example the `Experiments` Workflow would run the `pre-reusable-workflow` Job first, then all the Jobs in the `call-reusable-workflow` Job would run, and finally the `post-reusable-workflow` Job would run.

**NOTE: Each of these jobs will execute with a clean Runner anything created/setup in the `pre-reusable-workflow` Job would not be available in the `call-reusable-workflow` Job.**


### Configurable Workflows

# TODO Create an example of a workflow with a step that can be disabled.


# TODO Experiment with making a reusable workflow dependent on a step running prior and running a step after a reusable workflow.
https://docs.github.com/en/enterprise-cloud@latest/actions/using-workflows/about-workflows#creating-dependent-jobs

### Runners
    - single job at a time
    - Ubunut, Windows, and MacOS runners provided
    - We can opt for self-hosted runners as well.
    - Each workflow starts w/ a fresh copy of the runner.
    - 

### Events
    - Complete list of events found [here](https://docs.github.com/en/enterprise-cloud@latest/actions/using-workflows/events-that-trigger-workflows)

### Jobs

 Jobs are run in parallel but can assume dependencies on other jobs. See [Jobs](#jobs) for more details.

### Actions



## References
- [Code Owners](https://docs.github.com/en/enterprise-cloud@latest/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Teams](https://docs.github.com/en/enterprise-cloud@latest/organizations/organizing-members-into-teams/about-teams)
