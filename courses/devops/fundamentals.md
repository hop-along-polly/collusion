# DevOps Fundamentals

A study track rather than a certification. It covers two complementary halves of automating
software delivery: continuous integration and deployment with GitHub Actions, and configuration
management with Ansible.

## Topics covered

The two topics are independent — read them in either order.

| # | Topic | Notes | Flashcards |
|---|-------|-------|------------|
| 1 | GitHub teams, CODEOWNERS and Actions | [github_cd-cd.md](../../notes/devops/github_cd-cd.md) | [GitHub CI/CD](/devops/github-cicd) |
| 2 | Ansible: inventory, playbooks, variables and roles | [Ansible.md](../../notes/devops/Ansible.md) | [Ansible Fundamentals](/devops/ansible) |

## How the two fit together

GitHub Actions answers *when* something runs and *what triggers it* — workflows, jobs, runners,
and the reusable pieces that stop every repository reinventing the same pipeline.

Ansible answers *what the target machine should look like* once you get there — an agentless,
idempotent description of desired state rather than a script of steps.

A full delivery pipeline usually uses both: Actions reacts to the push and orchestrates the run,
Ansible brings the servers to the state that run expects.
