# Superpowers Workflow

## Scope

For any requirement, plan, implementation, bug fix, review, or acceptance task in this project, follow this workflow before acting. The order is mandatory and must not be skipped.

## Required Skill Order

| Stage | Required Skill |
| --- | --- |
| Requirement understanding and task breakdown | `superpowers:brainstorming` |
| Implementation planning | `superpowers:writing-plans` |
| Plan execution | `superpowers:executing-plans` or `superpowers:subagent-driven-development` |
| Feature coding | `superpowers:test-driven-development` |
| Final verification | `superpowers:verification-before-completion` |

## Execution Rules

- Start by confirming the current role and reading the relevant Superpowers `SKILL.md`.
- Do not write implementation code before there is an approved plan.
- For feature or bug-fix code, write a failing test first, verify it fails, implement the minimum change, then verify it passes.
- Before claiming completion, run fresh verification commands and summarize the actual output.
- If a Superpowers skill is unavailable in the current session, state that clearly and follow the nearest available local `SKILL.md` workflow.
- Planner may only turn coding phases into Generator/Evaluator tasks; Planner does not implement product code.
