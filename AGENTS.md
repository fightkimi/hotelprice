# AGENTS.md

## Harness Rules

This project uses a lightweight Triad Workflow. Read and follow `harness-rules.md`, while treating this file and `CLAUDE.md` as the project-specific overrides.

## Superpowers Skills Hard Rule

For any requirement, plan, implementation, bug fix, review, or acceptance task in this project, first read `.auto-memory/superpowers-workflow.md` and use Superpowers Skills in order. Do not skip stages.

1. Requirement understanding and task breakdown: `superpowers:brainstorming`
2. Implementation planning: `superpowers:writing-plans`
3. Plan execution: `superpowers:executing-plans` or `superpowers:subagent-driven-development`
4. Feature coding: `superpowers:test-driven-development`
5. Final verification: `superpowers:verification-before-completion`

If the current Codex session does not expose `superpowers:*` as direct skill handles, read the corresponding `SKILL.md` from the local Superpowers plugin cache and follow that workflow. Superpowers does not relax role boundaries: Planner does not write product code, Generator does not produce final signoff, and Evaluator does not silently implement product changes.

## Codex Roles

Codex may act as `Planner`, `Generator`, or `Evaluator`. Prefer separate sessions for separate roles.

- `Planner-Codex`: analyzes requirements, maintains specs, plans, `features.json`, `progress.json`, and backlog.
- `Generator-Codex`: implements the current approved feature slice with tests and build checks.
- `Evaluator-Codex`: independently reviews code, product behavior, data correctness, UI, tests, and PR readiness.

Do not complete implementation and final acceptance in the same role without calling out the self-review risk.

## Hotel Pricing Capture Boundaries

Before making changes, classify the work:

- Which domain is affected: hotel/property profile, competitor set, channel/source connector, rate capture job, normalization, pricing comparison, alerting, reporting, or admin settings.
- Whether the data is property-bound, competitor-bound, channel-bound, or global.
- Whether the data is real production data, seed/demo data, or mocked fixture data.
- Whether prices include taxes, fees, currency conversion, cancellation policy, occupancy, meal plan, and room type normalization.
- Whether the capture method is compliant with source terms and rate limits.
- Whether automation suggests decisions or directly changes pricing. Human approval is required for pricing decisions unless explicitly specified.

## Required Reading

Each session starts by reading:

1. `.auto-memory/MEMORY.md`
2. `.auto-memory/project-status.md`
3. `.auto-memory/superpowers-workflow.md`
4. `progress.json`
5. The current role file: `planner.md`, `generator.md`, or `evaluator.md`
6. `CLAUDE.md`

Read these as needed:

- `docs/dev/triad-midstage-workflow.md`
- `docs/dev/triad-cursor-team-kit.md`
- Current feature specs under `docs/specs/`
- Current Superpowers plans under `docs/superpowers/plans/`

## Work Boundaries

- Planner may modify only specs, plans, backlog, status files, memory, and acceptance drafts.
- Planner must not modify product code, migrations, tests, build config, scripts that affect runtime behavior, or UI implementation.
- Generator may modify product code only for the current feature slice and must add or update relevant tests.
- Generator must not write final acceptance/signoff reports.
- Evaluator defaults to no product code changes; it writes reports, test assets, and acceptance findings. If asked to fix something, separate the fix from the final acceptance conclusion.
- Back-end changes should keep business logic out of thin API handlers.
- Data models and queries must preserve property/channel/date/currency boundaries.
- User-visible flows must not leak debug fields, raw traces, credentials, cookies, API tokens, or internal scraper details.

## Branches And PRs

- Use feature branches and PRs.
- Do not commit or push directly to `main` or `master`.
- If an old template or generated instruction says `git push origin main`, this section overrides it.
- PR, CI, verification, and review tasks should use `docs/dev/triad-cursor-team-kit.md`.

## Verification

Prefer project-native commands once the application exists. Until then, run:

```bash
python3 scripts/triad_doctor.py
python3 scripts/test_triad_doctor.py
python3 -m json.tool progress.json
python3 -m json.tool features.json
python3 -m json.tool backlog.json
```

## Conflict Priority

Current user instruction > project rules in this file and `CLAUDE.md` > role files > `harness-rules.md` > older templates.
