# F-014 Generator Notes

Feature: `F-014-interactive-price-calendar-detail-workflow`

Role: Generator

## Scope

Implemented the approved interactive calendar detail slice only:

- added `CalendarDayDetail` and `calendarDetails.byDate` to the local `DemoDataset` contract;
- derived date details from existing fixture/manual domain seed data after stale normalization;
- made `CalendarHeatmap` selectable with accessible selected state;
- wired `CalendarScreen` selected-date state to a detail rail with platform gaps, evidence sources, capture time, sample count, rate basis, event impact, missing-sample state, and human-review markers;
- added component and Playwright click-flow coverage for available and unavailable dates.

No F-008 alert math, live OTA collection, backend, persistence, credentials, cookies, sessions, CAPTCHA handling, storage, file upload, recommended price, or automatic pricing behavior was added.

## TDD Evidence

- RED data contract: `/opt/homebrew/bin/npm --prefix app test -- tests/data/domainDrivenDataset.test.ts` failed with 2 failing tests because `dataset.calendarDetails.byDate` was undefined.
- GREEN data contract: `/opt/homebrew/bin/npm --prefix app test -- tests/data/domainDrivenDataset.test.ts` passed with 1 file / 13 tests after adding the typed contract and pure detail derivation.
- RED heatmap interaction: `/opt/homebrew/bin/npm --prefix app test -- tests/components/charts.test.tsx` failed because selected date cells had no `aria-pressed` state.
- GREEN heatmap interaction: `/opt/homebrew/bin/npm --prefix app test -- tests/components/charts.test.tsx` passed with 1 file / 5 tests after adding `onSelectDate`, `aria-pressed`, and accessible date labels.
- RED screen workflow: `/opt/homebrew/bin/npm --prefix app test -- tests/components/calendarScreen.test.tsx` failed because the detail panel was still hardcoded and had no `calendar-detail-panel` test anchor.
- GREEN screen workflow: `/opt/homebrew/bin/npm --prefix app test -- tests/components/calendarScreen.test.tsx` passed with 1 file / 2 tests after wiring selected-date state and detail rendering.
- Component regression: `/opt/homebrew/bin/npm --prefix app test -- tests/components` passed with 6 files / 13 tests.
- Playwright interaction: non-escalated run failed to bind `127.0.0.1:42317` in the sandbox; escalated `/opt/homebrew/bin/npm --prefix app run screenshots -- --grep "calendar date click"` passed with 1 test.

## Verification

- F-014 targeted regression: `/opt/homebrew/bin/npm --prefix app test -- tests/data/domainDrivenDataset.test.ts tests/components/charts.test.tsx tests/components/calendarScreen.test.tsx` passed with 3 files / 20 tests.
- Full app verification: `/opt/homebrew/bin/npm --prefix app run verify` passed after sandbox escalation for the local Playwright server: build passed, Vitest passed with 15 files / 76 tests, Playwright passed with 19 tests.
- Project checks:
  - `python3 scripts/triad_doctor.py` passed.
  - `python3 scripts/test_triad_doctor.py` passed.
  - `python3 -m json.tool progress.json` passed.
  - `python3 -m json.tool features.json` passed.
  - `python3 -m json.tool backlog.json` passed.
  - `node tests/client_demo_prototype.test.js` passed with 14 checks.
  - `git diff --check` passed.
- Static safety scan over `app/src` and `app/tests` found matches only in negative guardrail tests and forbidden-copy assertions, not in product code.

## Screenshot Artifacts

Full app verification refreshed the calendar screenshots affected by the new detail rail:

- `docs/test-reports/f-007-app-foundation/calendar-detail-open--1440x900.png`
- `docs/test-reports/f-007-app-foundation/calendar-detail-open--390x844.png`
- `docs/test-reports/f-007-app-foundation/calendar-observatory--2048x1352.png`

The Playwright screenshot matrix asserted each PNG dimension equals its viewport.

## Handoff

F-014 is ready for Evaluator verification through `B-051`. This is not a final acceptance conclusion.
