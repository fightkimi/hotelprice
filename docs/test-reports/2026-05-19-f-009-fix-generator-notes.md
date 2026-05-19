# F-009 Fix Generator Notes

## Role And Scope

- Role: Generator-Codex.
- Feature: `F-009-domain-driven-ui-data-flow`.
- Trigger: B-031 Evaluator report rejected F-009 due a P1 stale-data UI regression.
- Scope fixed: apply F-008 freshness normalization before building all F-009 UI view models.
- Not changed: F-008 domain alert semantics, B-027 owner-position evidence enrichment, live collection, persistence, API routes, automatic pricing, or recommended prices.

## P1 Finding

Evaluator found that `signals` used `generateAlertCandidates`, which internally applies stale normalization, but `trend`, `heatmap`, and `platformGaps` still read raw `seed.snapshots` directly. An available-looking snapshot older than 36 hours could render as a usable UI price.

## Fix

- Added a permanent stale regression in `app/tests/data/domainDrivenDataset.test.ts`.
- Updated `app/src/data/domainDrivenDataset.ts` so `buildDomainDrivenDemoDataset()` creates a `normalizedSeed` by calling `markStaleSnapshots(seed.snapshots, seed.now)`.
- All UI paths now read the same normalized snapshots:
  - signals;
  - owner trend;
  - core-average trend;
  - heatmap days;
  - platform gap rows;
  - sample counts.

## TDD Evidence

- RED: `npm test -- tests/data/domainDrivenDataset.test.ts`
  - Result: 1 failed test, expected stale owner trend point to be `null` but received `528`.
- GREEN: `npm test -- tests/data/domainDrivenDataset.test.ts`
  - Result: 1 file passed, 8 tests passed.

## Verification Commands

- `npm test -- tests/data/domainDrivenDataset.test.ts tests/contract/demoDataset.test.ts tests/domain`
  - Result: 7 files passed, 39 tests passed.
- `npm run verify`
  - Result: build passed, Vitest 12 files / 59 tests passed, Playwright 13 tests passed.

## Handoff

- F-009 is ready for Evaluator reverification through B-033.
- Evaluator should rerun the stale boundary scenario from `docs/test-reports/2026-05-19-f-009-domain-driven-ui-data-flow-evaluator.md` and verify `trend`, `heatmap`, and `platformGaps` all consume normalized snapshots.
