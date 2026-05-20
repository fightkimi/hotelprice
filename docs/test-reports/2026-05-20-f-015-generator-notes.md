# F-015 Generator Notes

Feature: `F-015-alert-review-workflow-depth`

Role: Generator

## Scope

Implemented the approved Alert Review workflow slice only:

- added typed `alertReview` workflow data to the local `DemoDataset` contract;
- derived alert-review items from existing fixture/manual alert candidates and UI signals;
- made Alert Review rows selectable with accessible selected state;
- added a selected alert detail panel with local review status, local review notes, note presets, rate boundaries, sample state, and evidence roles;
- kept review status and notes in component state only, with no backend, file, browser storage, or persistence layer;
- refreshed the Alert Review Playwright screenshot gates for desktop, mobile, and wide observatory view.

No F-008 alert math, live OTA collection, backend route, persistence, credentials, cookies, sessions, CAPTCHA handling, browser storage, file upload, recommended price, or automatic pricing behavior was added.

## TDD Evidence

- RED data contract: `/opt/homebrew/bin/npm --prefix app test -- tests/data/domainDrivenDataset.test.ts` failed because `dataset.alertReview.items` was undefined.
- GREEN data contract: `/opt/homebrew/bin/npm --prefix app test -- tests/data/domainDrivenDataset.test.ts` passed with 1 file / 15 tests after adding the typed contract and adapter derivation.
- RED screen workflow: `/opt/homebrew/bin/npm --prefix app test -- tests/components/alertReviewScreen.test.tsx` failed because the selected-detail anchor, local review status, and local note controls did not exist.
- GREEN screen workflow: `/opt/homebrew/bin/npm --prefix app test -- tests/components/alertReviewScreen.test.tsx` passed with 1 file / 2 tests after wiring selectable rows, local status, notes, presets, and evidence detail.
- Component regression: `/opt/homebrew/bin/npm --prefix app test -- tests/components/alertReviewScreen.test.tsx tests/components/revenueObservatoryScreens.test.tsx tests/components/evidenceDrawer.test.tsx` passed with 3 files / 5 tests.
- Playwright interaction: non-escalated run failed to bind `127.0.0.1:42317` in the sandbox; escalated `/opt/homebrew/bin/npm --prefix app run screenshots -- --grep "alert review selection"` passed with 1 test.
- A duplicate React key warning in competitor evidence rows was fixed during the green loop and the focused component and Playwright tests were rerun successfully.

## Verification

- F-015 targeted regression: `/opt/homebrew/bin/npm --prefix app test -- tests/data/domainDrivenDataset.test.ts tests/components/alertReviewScreen.test.tsx tests/components/revenueObservatoryScreens.test.tsx tests/components/evidenceDrawer.test.tsx` passed with 4 files / 20 tests.
- Full app verification: `/opt/homebrew/bin/npm --prefix app run verify` passed after sandbox escalation for the local Playwright server: build passed, Vitest passed with 16 files / 80 tests, Playwright passed with 20 tests.
- Full screenshot matrix: `/opt/homebrew/bin/npm --prefix app run screenshots` passed with 20 Playwright tests.
- Project checks:
  - `python3 scripts/triad_doctor.py` passed.
  - `python3 scripts/test_triad_doctor.py` passed.
  - `python3 -m json.tool progress.json` passed.
  - `python3 -m json.tool features.json` passed.
  - `python3 -m json.tool backlog.json` passed.
  - `node tests/client_demo_prototype.test.js` passed with 14 checks.
  - `git diff --check` passed.
- Static safety scans over `app/src` found no live collection, credential, cookie, browser-storage, recommended-price, or automatic-pricing matches.

## Screenshot Artifacts

Full screenshot verification refreshed the Alert Review screenshots affected by the new workflow:

- `docs/test-reports/f-007-app-foundation/alert-review-drawer-open--1440x900.png`
- `docs/test-reports/f-007-app-foundation/alert-review-drawer-open--390x844.png`
- `docs/test-reports/f-007-app-foundation/alert-review-observatory--2048x1352.png`

The Playwright screenshot matrix asserted each PNG dimension equals its viewport.

## Handoff

F-015 is ready for Evaluator verification through `B-055`. This is not a final acceptance conclusion.
