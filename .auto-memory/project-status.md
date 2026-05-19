# Project Status

## Current State

- Project: Hotel Pricing Capture
- Workflow: Triad Workflow with Planner / Generator / Evaluator roles
- Current role for this pass: Generator
- Superpowers: mandatory sequence recorded in `.auto-memory/superpowers-workflow.md`
- Branch rule: feature branch + PR only; no direct push to `main` / `master`

## Current Batch

- Batch id: `owner-position-evidence-enrichment`
- Goal: close the F-008/F-009 owner-position evidence follow-up by adding explicit owner-side evidence and customer-safe evidence labels
- Status: verifying

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
- B-035 is complete.
- B-036 is the next Evaluator task.

## Current Design Decision

F-010 enriched the existing F-008/F-009 evidence contract without changing pricing thresholds or UI layout:

- added explicit domain evidence roles;
- added `priceCents` to alert evidence;
- included one `owner_observation` record in owner low/high risk alerts;
- included `competitor_sample` records for active core competitor samples;
- labeled owner and competitor evidence separately in F-009 evidence markers;
- preserved human-review-only behavior and avoided recommended prices or automatic pricing actions.

## Generator Evidence

- Domain evidence role TDD red/green completed.
- UI evidence marker TDD red/green completed.
- Targeted regression passed: `4 files / 27 tests`.
- Full app verification passed: build, Vitest `12 files / 62 tests`, Playwright `13 tests`.
- Triad checks, JSON checks, and prototype regression passed.
- Static safety scan found no live collection, credential, cookie, CAPTCHA, storage, browser automation, recommended-price, or automatic-pricing terms in the F-010 touched pricing/data paths.
- Generator notes: `docs/test-reports/2026-05-19-f-010-generator-notes.md`.

## Boundaries

- Data remains fixture/manual demo data only.
- No live OTA collection, browser automation, storage, credentials, cookies, CAPTCHA handling, network connector, persistence, API routes, or automatic pricing.
- F-008 alert thresholds and F-009 screen layout remain unchanged unless a failing test proves a narrow contract issue.

## Next Step

Evaluator should verify B-036 from `docs/superpowers/plans/2026-05-19-owner-position-evidence-enrichment.md`, including owner/competitor evidence roles, customer-safe UI evidence labels, human-review-only behavior, safety scans, app/domain/prototype regression, and PR readiness.
