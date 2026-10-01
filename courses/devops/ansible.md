# Ansible

A study track rather than a certification. It covers configuration management with Ansible:
describing the state a machine should be in, and letting Ansible make it so.

## Topics covered

| # | Topic | Notes | Flashcards |
|---|-------|-------|------------|
| 1 | The agentless model and platform constraints | [Ansible.md](../../notes/devops/Ansible.md) | [Ansible Fundamentals](/devops/ansible) |
| 2 | Inventory: parameters, grouping and connection | [Ansible.md](../../notes/devops/Ansible.md) | [Ansible Fundamentals](/devops/ansible) |
| 3 | Playbooks, plays, tasks and idempotency | [Ansible.md](../../notes/devops/Ansible.md) | [Ansible Fundamentals](/devops/ansible) |
| 4 | Variables, conditionals and roles | [Ansible.md](../../notes/devops/Ansible.md) | [Ansible Fundamentals](/devops/ansible) |

## What to focus on

- **Idempotency** is the central idea. A playbook describes the state you want, not the steps to
  get there, so running it twice changes nothing the second time. Most Ansible mistakes come from
  writing it as a script of commands instead.
- **The agentless model** means nothing is installed on the managed hosts; Ansible connects over
  SSH and runs from the control node. That single design choice explains most of the platform
  constraints around what can be managed and how.
