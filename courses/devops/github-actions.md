# GitHub Actions

A study track rather than a certification. It covers automating software delivery on GitHub:
how work is triggered and run, and the repository controls that decide who reviews it.

## Topics covered

| # | Topic | Notes | Flashcards |
|---|-------|-------|------------|
| 1 | Teams, notifications and CODEOWNERS | [github_cd-cd.md](../../notes/devops/github_cd-cd.md) | GitHub CI/CD |
| 2 | Workflows, jobs and runners | [github_cd-cd.md](../../notes/devops/github_cd-cd.md) | GitHub CI/CD |
| 3 | Reusable workflows and composite actions | [github_cd-cd.md](../../notes/devops/github_cd-cd.md) | GitHub CI/CD |

## What to focus on

Two areas carry most of the practical weight:

- **CODEOWNERS precedence.** The last matching pattern wins, not the most specific one. This is
  the opposite of how most people assume it works, and it is the usual cause of a review request
  landing on the wrong team.
- **Reusable workflows versus composite actions.** Both remove duplication, but at different
  levels: a reusable workflow is called as a whole job, while a composite action bundles steps
  inside someone else's job. Choosing wrongly means fighting the model rather than using it.
