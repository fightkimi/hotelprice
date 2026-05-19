# Project Status

## Current State

- Project: Hotel Pricing Capture
- Workflow: Triad Workflow with Planner / Generator / Evaluator roles
- Current role for this pass: Planner
- Superpowers: mandatory sequence recorded in `.auto-memory/superpowers-workflow.md`
- Branch rule: feature branch + PR only; no direct push to `main` / `master`

## Current Batch

- Batch id: `owner-position-evidence-enrichment`
- Goal: close the F-008/F-009 owner-position evidence follow-up by adding explicit owner-side evidence and customer-safe evidence labels
- Status: planning

## Current Facts

- F-007 is accepted, merged through PR #1, and available on `origin/main`.
- F-007 merge commit: `dd43b3beda70323314db20740cba92bc416429e7`.
- F-008 is accepted, merged through PR #2, and available on `origin/main`.
- F-008 merge commit: `a303c2f`.
- F-009 is accepted, merged through PR #3, and available on `origin/main`.
- F-009 merge commit: `48ab7bb`.
- Local `main` has been fast-forwarded to `origin/main`.
- Current branch: `feature/f-010-owner-position-evidence-planning`.
- F-010 spec: `docs/specs/2026-05-19-owner-position-evidence-enrichment.md`.
- F-010 plan: `docs/superpowers/plans/2026-05-19-owner-position-evidence-enrichment.md`.
- B-027 is now closed as a tracking item because it has been promoted into F-010.
- B-035 is the next Generator task.
- B-036 is the following Evaluator task.

## Current Design Decision

F-010 will enrich the existing F-008/F-009 evidence contract rather than changing pricing thresholds or UI layout:

- add explicit domain evidence roles;
- add `priceCents` to alert evidence;
- include one `owner_observation` record in owner low/high risk alerts;
- label owner and competitor evidence separately in F-009 evidence markers;
- preserve human-review-only behavior and avoid recommended prices or automatic pricing actions.

## Boundaries

- Data remains fixture/manual demo data only.
- No live OTA collection, browser automation, storage, credentials, cookies, CAPTCHA handling, network connector, persistence, API routes, or automatic pricing.
- F-008 alert thresholds and F-009 screen layout remain unchanged unless a failing test proves a narrow contract issue.

## Next Step

Generator should implement B-035 from `docs/superpowers/plans/2026-05-19-owner-position-evidence-enrichment.md` using strict TDD, then hand off to Evaluator for B-036.
