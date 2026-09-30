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

GitHub Actions is the CI/CD feature of GitHub allowing developers to define the automated, build, testing, and deployment workflows in yaml files that exists in the same repository as the source code itself. Additionally GitHub actions can be used to automate maintenance tasks for a repository.

**NOTE: GitHub Actions has uses some very general terms such as "Action", "Event", "Job" etc. that refer to very specific concepts within GitHub Actions. To avoid confusion when you see a one of these upper-case nouns (i.e. Action) this refers to the proper noun for Action as defined by GitHub Actions, and lower-case action is just the general term for action.**

### Components
 - `Workflow`: Automated processes defined by a yaml file located in the `.github/workflows` directory of a repository.
 - `Runner`: A server that a Workflow runs on when it is triggered.
 - `Event`: A specific activity that occurs in a repository to trigger a Workflow. (i.e. opening a PR, or creating an issue)
 - `Job`: A set of Steps within a Workflow executed in syncronous order and on the same Runner. Steps are bash commands that will be executed during the Step.
 - `Action`: Customized plug-n-play applications that can be used as a Step in a Job.
 - `Variables`: See the list of pre-defined environment variables provided by Github [here](https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables)

### Workflows

A repository's Workflow(s) are defined by yaml files located in the `.github/workflows` directory of the repository itself. A repository can contain any number of Workflow yaml files.

There are 3 types of Workflows supported by GitHub Actions.
 - `Standard Workflows`: This is not an official term defined by GitHub Actions. I use it to refer to the basic run of the mill Workflows that don't have special functionality like the other types of Workflows.
 - `Starter Workflows`: Starter Workflows are templates that allows a developer to start with something other than a blank slate. GitHub Enterprise offers Starter Workflows, but you can also define your own custom Starter Workflows.
 - `Reusable Workflows`: Reusable Workflows are Workflows that CAN be called by another Workflow. I think Callable Workflow would be a better term.

**Standard Workflows**

When writing a Workflow there are essentially 5 things you can do
1. Write the custom Steps in a Job.
2. Call a custom Action
3. Call an Action from the [GitHub Marketplace](https://github.com/marketplace?type=actions)
4. Spin up service containers (i.e. sidecars) needed by the Job
5. Call a Reusable Workflow

At a minimum a Workflow must include
 - 1 or more Events that trigger the Workflow.
 - 1 or more Jobs that will be run as part of the Workflow.
 - 1 or more Steps per Job in the Workflow that define that tasks needed to complete the Job.

 GitHub offers an excellent example for [Understanding a Workflow yaml file](https://docs.github.com/en/enterprise-cloud@latest/actions/using-workflows/about-workflows#understanding-the-workflow-file).

**Starter Workflows**

[TODO Research Started Workflows](https://docs.github.com/en/enterprise-cloud@latest/actions/using-workflows/creating-starter-workflows-for-your-organization)

**Reusable Workflows**

Reusing a Workflow happens at the Job level. Essentially when calling a Workflow it is acting as a Job in the calling Workflow. There are a few important caveats when calling Workflows.
Workflows CANNOT exceed 4 levels of inception, meaning Workflow A can call Workflow B and B can call Workflow C which can call Workflow D, but Workflow D cannot call another Workflow.
A Workflow CAN define Jobs that will run before or after a called Workflow using the `needs` field.
A Workflow CANNOT define Steps that will run before or after a called Workflow unless those Steps exist in a Job that will run before or after the called Workflow.
A Workflow CANNOT define service containers that will spin up before calling a Workflow.

To make a Workflow callable the following Event needs to be added as a trigger for the Workflow.
```yaml
on:
  workflow_call:
    inputs:
      example_input:
        type: string
        required: false
        description: An example of an input. This can be deleted or modified
    secrets:
      example_secret:
        description: An example of a secret. This can be deleted or modified.
        required: false
```

### Runners

Runners are the servers that Workflows execute on. GitHub offers Ubuntu, Windows, and MacOS X runners, however you can opt into using Self Hosted Runners.
Each Worfklow starts with a fresh copy of the Runner. While executing the Workflow a Runner will execute one Job at a time.

### Events

GitHub provides a complete list of [events](https://docs.github.com/en/enterprise-cloud@latest/actions/using-workflows/events-that-trigger-workflows) that can trigger a Workflow.

Each Workflow will have 1 or more Events that trigger it and each Event type has additional filters that can be used to refine the conditions under which the Event triggers the Workflow.

Here are some common examples. Refer to GitHubs [Triggering A Workflow](https://docs.github.com/en/enterprise-cloud@latest/actions/using-workflows/triggering-a-workflow) docs for all the possible ways to trigger a Workflow.

**Trigger a Workflow when a commits are added to the "main" branch.**
```
on:
  push:
    branches:
      - main
```

**Trigger a Workflow when a PR is opened against "main", or a branch prefixed with "releases/".**
```
on:
  pull_request:
    - main
    - releases/**
```

### Jobs

By default Jobs defined in a Workflow will run in parallel. Dependencied between jobs can be created with `needs` field. When a Job needs or depends on another Job it will wait until it completes before starting up.

Here is an example of a Job needing another Job
```
on: push

jobs:
  stand-alone-job:
    steps:
      ...

  dependent-job:
    needs: stand-alone-job
    steps:
      ...
```

### Actions

A repository can define it's own Actions as Yaml files in the `.github/actions` directory. 3rd party Actions can be found in the [GitHub Marketplace](https://github.com/marketplace?type=actions).

This is an example of an custom Action defined in a repositories `.github/actions` directory. The `using: composite` directive allows the actions to specify multiple run commands in the Action.
```
name: A reusable Action
description: An action that can be used in a Workflow

inputs:
  example_input:
    type: string
    description:
    required: true

runs:
  using: composite
  steps:
    - name: Say Hello
      run: echo Hello World!
```

## References
- [Code Owners](https://docs.github.com/en/enterprise-cloud@latest/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Teams](https://docs.github.com/en/enterprise-cloud@latest/organizations/organizing-members-into-teams/about-teams)
