# F-016 Generator Notes

Date: 2026-05-21

Feature: `F-016-market-comparison-drilldown`

Role: Generator-Codex

## Scope

- Added `DemoDataset.marketDrilldown` fixture/manual data contract.
- Added selectable Market Comparison drilldown options by platform, stay date, and room type.
- Added selected detail panel with owner rate, core average, gap, competitor range, competitor sample rows, evidence, capture time, rate basis, missing-sample explanations, and human-review-only guardrails.
- Added component and Playwright coverage for available and missing-sample states.
- Refreshed Market Comparison screenshots for `1440x900`, `390x844`, and `2048x1352`.

## TDD Evidence

- RED: `tests/data/domainDrivenDataset.test.ts` failed with 3 failing tests because `dataset.marketDrilldown` was undefined.
- RED after type contract: the same dataset tests still failed because `buildDomainDrivenDemoDataset` did not populate `marketDrilldown`.
- GREEN: `tests/data/domainDrivenDataset.test.ts` passed with 1 file / 18 tests after the data adapter implementation.
- GREEN nearby regression: `tests/data/domainDrivenDataset.test.ts tests/components/charts.test.tsx` passed with 2 files / 23 tests.
- RED: `tests/components/marketComparisonScreen.test.tsx` failed with 2 failing tests because `market-drilldown-detail` and drilldown option buttons did not exist.
- GREEN: `tests/components/marketComparisonScreen.test.tsx` passed with 1 file / 2 tests after Market screen selection/detail implementation.
- GREEN screen regression: `tests/data/domainDrivenDataset.test.ts tests/components/marketComparisonScreen.test.tsx tests/components/revenueObservatoryScreens.test.tsx` passed with 3 files / 22 tests.
- RED: focused Playwright first failed in the sandbox with `listen EPERM: operation not permitted 127.0.0.1:42317`; the escalated run then failed as intended because `/?screen=market&state=normal` still rendered the detail panel as `data-state="open"`.
- GREEN: escalated focused Playwright `npm --prefix app run screenshots -- --grep "market comparison drilldown"` passed with 1 test after App state wiring and responsive CSS.

## Verification

- Targeted F-016 regression: `npm --prefix app test -- tests/data/domainDrivenDataset.test.ts tests/components/marketComparisonScreen.test.tsx tests/components/revenueObservatoryScreens.test.tsx` passed with 3 files / 22 tests.
- Full app verification: `npm --prefix app run verify` passed after sandbox escalation for the local Playwright server: production build passed, Vitest passed with 17 files / 85 tests, and Playwright passed with 21 tests.
- Full screenshot matrix: `npm --prefix app run screenshots` passed with 21 Playwright tests.
- Project checks:
  - `python3 scripts/triad_doctor.py` passed.
  - `python3 scripts/test_triad_doctor.py` passed.
  - `python3 -m json.tool progress.json` passed.
  - `python3 -m json.tool features.json` passed.
  - `python3 -m json.tool backlog.json` passed.
  - `node tests/client_demo_prototype.test.js` passed with 14 checks.
  - `git diff --check` passed.
- Static safety scans over `app/src` found no live collection, credential, cookie/session, browser-storage, CAPTCHA, recommended-price, or automatic-pricing matches.
- `git diff --name-only main...HEAD -- app/src/domain/pricing app/tests/domain` produced no output.
- `git ls-files app/node_modules app/dist app/test-results app/playwright-report app/tsconfig.tsbuildinfo .DS_Store` produced no output.

## Boundaries

- Did not change F-008 alert math.
- Did not change F-014 Calendar workflow.
- Did not change F-015 Alert Review workflow.
- Did not add live collection, backend persistence, credentials, browser storage, recommended price, or automatic pricing.

## Handoff

F-016 is ready for Evaluator verification through `B-059`. This is not a final acceptance conclusion.
