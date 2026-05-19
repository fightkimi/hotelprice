# Project Status

## Current State

- Project: Hotel Pricing Capture
- Workflow: Triad Workflow with Planner / Generator / Evaluator roles
- Current role for this pass: Generator
- Superpowers: mandatory sequence recorded in `.auto-memory/superpowers-workflow.md`
- Branch rule: feature branch + PR only; no direct push to `main` / `master`

## Current Batch

- Batch id: `domain-core-rate-boundaries`
- Goal: carry the F-001 data-boundary precheck into the formal F-007 React/TypeScript app foundation as a tested domain core
- Status: reverifying

## Current Facts

- F-007 is accepted, merged through PR #1, and available on `origin/main`.
- F-007 merge commit: `dd43b3beda70323314db20740cba92bc416429e7`.
- Local work has been synced from `origin/main` and moved onto `feature/f-008-domain-core-planning`.
- F-008 Generator implementation received B-024 Evaluator review, then a P1 fix was implemented and is ready for reverification.
- F-008 spec: `docs/specs/2026-05-19-domain-core-rate-boundaries.md`.
- F-008 plan: `docs/superpowers/plans/2026-05-19-domain-core-rate-boundaries.md`.
- F-008 adds pure TypeScript domain modules and Vitest domain tests only; F-007 UI, app screens, demo dataset, package config, migrations, persistence, and live collection remain unchanged.
- F-001 precheck carryovers now made explicit for F-008:
  - unavailable, no-rate, source-error, and stale snapshots are modeled and suppress pricing alerts;
  - competitor movement is isolated by `hotelId + comparableRateKey`;
  - latest/previous ordering is deterministic by `capturedAt` and `snapshotId`;
  - market movement requires at least three active core competitor samples;
  - owner-position alerts require exact comparable-rate-key matching;
  - alerts are human-review-only and do not include recommended prices;
  - domain code must pass a static no-live-collection scan.
- B-014 is complete.
- B-023 is complete with strict TDD evidence recorded in `docs/test-reports/2026-05-19-f-008-generator-notes.md`.
- B-024 Evaluator review is complete and not accepted due to a P1 intermittent availability regression.
- B-025 Generator fix is complete with strict TDD evidence recorded in `docs/test-reports/2026-05-19-f-008-fix-generator-notes.md`.
- B-026 is the next Evaluator reverification task.

## Generator Implementation Facts

- Added domain contracts and helpers under `app/src/domain/pricing/`.
- Added Vitest domain tests under `app/tests/domain/`.
- `ComparableRateKey` serialization includes channel, source, stay/checkout dates, currency, occupancy, room type, meal plan, cancellation policy, and tax/fee basis.
- Competitor movement groups by `hotelId + comparableRateKey`.
- Market math groups by `ownerPropertyId + competitorGroupId + comparableRateKey`.
- Availability helpers suppress unavailable, no-rate, source-error, stale, and non-positive-price snapshots from pricing alerts.
- Snapshot ordering is deterministic by `capturedAt`, then lexicographic `snapshotId`; duplicate same-capture snapshots keep the lexicographically last id.
- Alert generation emits competitor movement, market movement, and owner-position risk candidates with evidence and `requiresHumanReview: true`.
- Alert candidates do not include recommended price fields or automatic pricing actions.
- Static compliance scan guards against live collection, credentials, browser/storage access, and automatic pricing code in the domain module.

## B-024 Findings And B-025 Fix

- Evaluator report: `docs/test-reports/2026-05-19-f-008-domain-core-rate-boundaries-evaluator.md`.
- B-024 P1: `available -> unavailable/no-rate/source-error -> available` for the same `hotelId + comparableRateKey` returned no competitor movement alert.
- Root cause: competitor movement selected latest/previous across all snapshots, then suppressed if the selected previous snapshot was not alertable.
- Fix: competitor movement now requires latest overall to be alertable and selects the prior alertable available capture as previous, skipping intermittent unavailable/no-rate/source-error observations.
- Regression: `app/tests/domain/alertRules.test.ts` covers all three intermittent states.
- F-007 UI, app screens, demo dataset, package config, E2E config, persistence, live collection, and automatic pricing remain unchanged.

## Next Step

Evaluator should run `B-026` using the B-024 Evaluator report, `docs/test-reports/2026-05-19-f-008-fix-generator-notes.md`, the F-008 spec/plan, and fresh verification of the intermittent availability regression, domain rules, app regression, prototype regression, compliance scan, and PR readiness.
