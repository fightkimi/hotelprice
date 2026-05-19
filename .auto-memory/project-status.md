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
- Status: verifying

## Current Facts

- F-007 is accepted, merged through PR #1, and available on `origin/main`.
- F-007 merge commit: `dd43b3beda70323314db20740cba92bc416429e7`.
- Local work has been synced from `origin/main` and moved onto `feature/f-008-domain-core-planning`.
- F-008 Generator implementation is complete and ready for Evaluator verification.
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
- B-024 is the next Evaluator task.

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

## Next Step

Evaluator should run `B-024` using `docs/test-reports/2026-05-19-f-008-generator-notes.md`, the F-008 spec/plan, and fresh verification of domain rules, app regression, prototype regression, compliance scan, and PR readiness.
