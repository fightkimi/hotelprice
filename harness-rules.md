# Harness Rules

## Triad Workflow

Use three roles:

- Planner: requirement analysis, scope, specs, plans, backlog, and acceptance criteria.
- Generator: implementation against an approved plan with tests.
- Evaluator: independent verification and acceptance.

## Status Model

Use this simple status flow in `features.json`:

```text
new -> planning -> building -> verifying -> fixing -> reverifying -> done
```

The project can use `new`, `building`, and `done` for lightweight batches, but role handoff must remain explicit.

## PR-Only Override

All changes go through feature branches and PRs. Do not push directly to `main` or `master`.

## Role Boundaries

- Planner does not implement.
- Generator does not sign off final acceptance.
- Evaluator does not hide implementation fixes inside an acceptance report.

## Required Workflow

For every requirement, follow `.auto-memory/superpowers-workflow.md`.
