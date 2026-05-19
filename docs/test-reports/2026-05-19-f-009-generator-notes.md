# F-009 Generator Notes

## Role And Scope

- Role: Generator-Codex.
- Feature: `F-009-domain-driven-ui-data-flow`.
- Backlog item: `B-030`.
- Scope implemented: fixture/manual domain seed data, pure adapter from F-008 domain contracts to F-007 `DemoDataset`, compatibility export for the existing formal UI, safety scan extension, and verification evidence.
- Not implemented: live collection, API routes, persistence, authentication, connector code, browser automation, automatic pricing, recommended prices, or B-027 domain evidence enrichment.

## Domain Boundary Summary

- Affected domains: reporting, pricing comparison, alerting, setup/data scope, and UI data transformation.
- Data binding preserved: owner property, hotel, competitor group, channel/source, stay date, checkout date, room type, occupancy, meal plan, cancellation policy, tax/fee basis, currency, capture time, and availability status.
- Data type: fixture/manual seed data only.
- Pricing output: all generated pricing-sensitive signals keep `humanReviewRequired: true`.
- Missing data: unavailable/no-rate/source-error samples become null chart values and unavailable heatmap states, not zero prices.

## TDD Evidence

### Seed Data

- RED: `npm test -- tests/data/domainDrivenDataset.test.ts`
  - Result: failed because `../../src/data/domainSeed` did not exist.
- GREEN: `npm test -- tests/data/domainDrivenDataset.test.ts`
  - Result: 1 file passed, 3 tests passed.
- Implementation: `app/src/data/domainSeed.ts`.

### Alert Candidate To Signal Adapter

- RED: `npm test -- tests/data/domainDrivenDataset.test.ts`
  - Result: failed because `../../src/data/domainDrivenDataset` did not exist.
- GREEN: `npm test -- tests/data/domainDrivenDataset.test.ts`
  - Result: 1 file passed, 5 tests passed.
- Implementation: `app/src/data/domainDrivenDataset.ts` maps F-008 alert candidates into F-007 signals with evidence markers and human-review flags.

### Trend, Heatmap, And Platform Gaps

- RED: `npm test -- tests/data/domainDrivenDataset.test.ts`
  - Result: 2 chart tests failed because trend series and unavailable heatmap states were empty.
- GREEN: `npm test -- tests/data/domainDrivenDataset.test.ts`
  - Result: 1 file passed, 7 tests passed.
- Implementation: adapter builds owner trend, core-average trend, event-lift trend, heatmap days, platform gap bars, and null missing states from domain snapshots.

### UI Source Of Truth

- RED: `npm test -- tests/contract/demoDataset.test.ts`
  - Result: failed because `demoDataset` was still the hand-authored object rather than `domainDrivenDemoDataset`.
- GREEN: `npm test -- tests/contract/demoDataset.test.ts tests/data/domainDrivenDataset.test.ts`
  - Result: 2 files passed, 12 tests passed.
- Implementation: `app/src/data/demoDataset.ts` now re-exports `domainDrivenDemoDataset` for the existing UI import.

### Safety Scan

- Command: `npm test -- tests/domain/complianceScan.test.ts tests/data/domainDrivenDataset.test.ts tests/contract/demoDataset.test.ts`
- Result: 3 files passed, 13 tests passed.
- Implementation: domain compliance scan now covers `src/data/domainSeed.ts`, `src/data/domainDrivenDataset.ts`, and `src/data/demoDataset.ts`.

## Verification Commands

- `npm test -- tests/data/domainDrivenDataset.test.ts tests/contract/demoDataset.test.ts tests/domain`
  - Result: 7 files passed, 38 tests passed.
- `npm run verify`
  - First sandbox run: build and Vitest passed; Playwright could not start the local dev server because sandbox port binding returned `EPERM`.
  - Escalated rerun: build passed, Vitest passed with 12 files / 58 tests, Playwright passed with 13 screenshot/evidence tests.
- `python3 scripts/triad_doctor.py`
  - Result: healthy enough to proceed.
- `python3 scripts/test_triad_doctor.py`
  - Result: smoke test passed.
- `python3 -m json.tool progress.json`
  - Result: valid JSON.
- `python3 -m json.tool features.json`
  - Result: valid JSON.
- `python3 -m json.tool backlog.json`
  - Result: valid JSON.
- `node tests/client_demo_prototype.test.js`
  - Result: 14 prototype regression checks passed.

## Files Changed

- Created `app/src/data/domainSeed.ts`.
- Created `app/src/data/domainDrivenDataset.ts`.
- Replaced `app/src/data/demoDataset.ts` with a compatibility export.
- Created `app/tests/data/domainDrivenDataset.test.ts`.
- Updated `app/tests/contract/demoDataset.test.ts`.
- Updated `app/tests/domain/complianceScan.test.ts`.
- Created `docs/test-reports/2026-05-19-f-009-generator-notes.md`.
- Updated `features.json`, `progress.json`, `backlog.json`, and `.auto-memory/project-status.md` for Generator handoff.

## Handoff

- F-009 is ready for Evaluator verification through `B-031`.
- B-027 remains non-blocking. F-009 documents owner-position signals as human-review-only using existing top-level owner alert fields plus competitor evidence; it does not change F-008 domain evidence semantics.
