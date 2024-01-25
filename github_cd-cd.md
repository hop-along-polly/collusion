# Github CI/CD

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

## References
- [Code Owners](https://docs.github.com/en/enterprise-cloud@latest/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Teams](https://docs.github.com/en/enterprise-cloud@latest/organizations/organizing-members-into-teams/about-teams)
