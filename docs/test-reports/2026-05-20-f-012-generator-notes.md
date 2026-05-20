# F-012 Generator Notes

Feature: `F-012-production-revenue-observatory-visual-upgrade`

Role: Generator

## Scope

Implemented the approved visual-system slice only:

- added Revenue Observatory global tokens;
- marked the formal app shell with `data-visual-system="revenue-observatory"`;
- applied observatory panel, instrument header, metric lattice, insight rail, and chart frame primitives across all five screens;
- upgraded chart presentation while preserving missing/unavailable data semantics;
- added `2048x1352` screenshot gates.

No domain alert math, dataset semantics, live collection, persistence, credentials, file upload, recommended price, or automatic pricing behavior was added.

## TDD Evidence

- RED visual contract: `/opt/homebrew/bin/npm test -- tests/contract/tokens.test.ts tests/components/revenueObservatoryScreens.test.tsx` failed with missing `--observatory-shell-max`, missing `.app-shell[data-visual-system="revenue-observatory"]`, missing `.observatory-screen`, and missing `.chart-frame`.
- GREEN token/shell scope: `/opt/homebrew/bin/npm test -- tests/contract/tokens.test.ts` passed with 1 file / 4 tests.
- RED chart frame scope: `/opt/homebrew/bin/npm test -- tests/components/charts.test.tsx` failed because chart components did not expose `.chart-frame`.
- GREEN chart semantics: `/opt/homebrew/bin/npm test -- tests/components/charts.test.tsx` passed with 1 file / 4 tests after chart frames were added; trend segments, unavailable heatmap copy, and `CNY 0` zero-gap marker remained visible.
- GREEN five-screen scope: `/opt/homebrew/bin/npm test -- tests/components/revenueObservatoryScreens.test.tsx tests/components/setupDataScopeScreen.test.tsx` passed with 2 files / 4 tests after all five screens exposed observatory primitives.
- Screenshot gate RED/GREEN: non-escalated Playwright failed to bind `127.0.0.1`; escalated run first caught a 10px overflow from the setup-only grid pseudo-element being applied to the global app shell, then passed after scoping that pseudo-element to `.setup-observatory`. The chart-frame assertion was also narrowed to chart-led screens because loading, empty, alert-review, and setup states are intentionally not chart surfaces.

## Verification

- Targeted visual regression: `/opt/homebrew/bin/npm test -- tests/contract/tokens.test.ts tests/components/revenueObservatoryScreens.test.tsx tests/components/charts.test.tsx tests/components/setupDataScopeScreen.test.tsx` passed with 4 files / 12 tests.
- Domain/data regression: `/opt/homebrew/bin/npm test -- tests/contract/demoDataset.test.ts tests/data/domainDrivenDataset.test.ts tests/domain` passed with 7 files / 45 tests.
- Full app verification: `/opt/homebrew/bin/npm run verify` passed after sandbox escalation for the local Playwright server: build passed, Vitest passed with 14 files / 71 tests, Playwright passed with 18 tests.
- Project checks:
  - `python3 scripts/triad_doctor.py` passed.
  - `python3 scripts/test_triad_doctor.py` passed.
  - `python3 -m json.tool progress.json` passed.
  - `python3 -m json.tool features.json` passed.
  - `python3 -m json.tool backlog.json` passed.
  - `node tests/client_demo_prototype.test.js` passed with 14 checks.
- Static safety scan over `app/src/components`, `app/src/screens`, `app/src/styles`, and `app/src/types` produced no matches after renaming a harmless chart helper parameter from `token` to `cssVariable`.

## Screenshot Artifacts

New wide-screen artifacts:

- `docs/test-reports/f-007-app-foundation/overview-observatory--2048x1352.png`
- `docs/test-reports/f-007-app-foundation/calendar-observatory--2048x1352.png`
- `docs/test-reports/f-007-app-foundation/market-observatory--2048x1352.png`
- `docs/test-reports/f-007-app-foundation/alert-review-observatory--2048x1352.png`
- `docs/test-reports/f-007-app-foundation/setup-observatory--2048x1352.png`

`sips -g pixelWidth -g pixelHeight` confirmed each artifact is exactly `2048x1352`.

## Handoff

F-012 is ready for Evaluator verification through `B-044`. This is not a final acceptance conclusion.
