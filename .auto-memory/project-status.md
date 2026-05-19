# Project Status

## Current State

- Project: Hotel Pricing Capture
- Workflow: Triad Workflow with Planner / Generator / Evaluator roles
- Current role for this pass: Planner / PR preparation
- Superpowers: mandatory sequence recorded in `.auto-memory/superpowers-workflow.md`
- Branch rule: feature branch + PR only; no direct push to `main` / `master`

## Current Batch

- Batch id: `domain-driven-ui-data-flow`
- Goal: connect the accepted F-008 domain core to the accepted F-007 formal React/TypeScript UI through fixture/manual seed data and a pure view-model adapter
- Status: done; PR preparation in progress

## Current Facts

- F-007 is accepted, merged through PR #1, and available on `origin/main`.
- F-007 merge commit: `dd43b3beda70323314db20740cba92bc416429e7`.
- F-008 is accepted, merged through PR #2, and available on `origin/main`.
- F-008 merge commit: `a303c2f`.
- Local work is on `feature/f-009-domain-driven-ui-planning`.
- F-009 spec: `docs/specs/2026-05-19-domain-driven-ui-data-flow.md`.
- F-009 plan: `docs/superpowers/plans/2026-05-19-domain-driven-ui-data-flow.md`.
- B-030 completed the initial F-009 implementation.
- B-031 Evaluator verification rejected F-009 due P1 stale snapshot UI normalization.
- B-031 report: `docs/test-reports/2026-05-19-f-009-domain-driven-ui-data-flow-evaluator.md`.
- B-032 Generator fix is complete with strict TDD evidence recorded in `docs/test-reports/2026-05-19-f-009-fix-generator-notes.md`.
- B-033 Evaluator reverification accepted F-009.
- B-033 report: `docs/test-reports/2026-05-19-f-009-domain-driven-ui-data-flow-reverification.md`.
- B-027 owner-position evidence enrichment remains non-blocking and can be handled as a separate small slice if needed.
- B-034 tracks F-009 PR preparation.

## B-031 Finding And B-032 Fix

- Finding: `signals` flowed through `generateAlertCandidates`, but `trend`, `heatmap`, and `platformGaps` used raw seed snapshots directly.
- Risk: an available-looking snapshot older than the F-008 36-hour freshness window could render as a usable UI price.
- Regression: `app/tests/data/domainDrivenDataset.test.ts` now mutates owner snapshots older than 36 hours and verifies:
  - owner trend point becomes `null`;
  - heatmap day becomes `unavailable` with null price fields and sample size 0;
  - stale platform owner row is excluded from platform gaps.
- Fix: `buildDomainDrivenDemoDataset()` now calls `markStaleSnapshots(seed.snapshots, seed.now)` once and uses the normalized snapshot set for signals, trend, heatmap, platform gaps, and sample counts.
- F-008 domain evidence semantics were not changed.

## Verification Evidence

- `npm test -- tests/data/domainDrivenDataset.test.ts`: red before fix with `expected 528 to be null`; green after fix with 1 file / 8 tests passed.
- `npm test -- tests/data/domainDrivenDataset.test.ts tests/contract/demoDataset.test.ts tests/domain`: 7 files passed, 39 tests passed.
- `npm run verify`: build passed, Vitest 12 files / 59 tests passed, Playwright 13 tests passed.
- B-033 independent stale boundary test: 1 file / 1 test passed.
- B-033 targeted F-009/F-008 tests: 7 files / 39 tests passed.
- B-033 full `npm run verify`: build passed, Vitest 12 files / 59 tests passed, Playwright 13 tests passed.
- B-033 Triad/JSON/prototype checks: passed.
- B-033 static safety scan: no matches in `app/src/data/*` and `app/src/domain/pricing`.

## Next Step

Prepare the F-009 PR from `feature/f-009-domain-driven-ui-planning`, then mark B-034 done with the PR number once created. Do not push directly to `main` or `master`. Keep B-027 owner-position evidence enrichment as a non-blocking follow-up unless it is split into a separate accepted slice.
