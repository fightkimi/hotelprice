# Project Status

## Current State

- Project: Hotel Pricing Capture
- Workflow: Triad Workflow with Planner / Generator / Evaluator roles
- Current role for this pass: Evaluator
- Superpowers: mandatory sequence recorded in `.auto-memory/superpowers-workflow.md`
- Branch rule: feature branch + PR only; no direct push to `main` / `master`

## Current Batch

- Batch id: `production-revenue-observatory-visual-upgrade`
- Goal: implement the F-012 global Revenue Observatory visual-system upgrade for the formal React app without changing accepted business semantics
- Status: done

## Current Facts

- F-007 is accepted, merged through PR #1, and available on `origin/main`.
- F-007 merge commit: `dd43b3beda70323314db20740cba92bc416429e7`.
- F-008 is accepted, merged through PR #2, and available on `origin/main`.
- F-008 merge commit: `a303c2f`.
- F-009 is accepted, merged through PR #3, and available on `origin/main`.
- F-009 merge commit: `48ab7bb`.
- F-010 owner-position evidence enrichment is accepted and recorded as PR #4.
- F-011 data scope and capture entry is accepted for product behavior and data-boundary coverage.
- F-011 PR: #5 `F-011 Data scope and capture entry`, stacked on `feature/f-010-owner-position-evidence-planning`, https://github.com/fightkimi/hotelprice/pull/5.
- F-012 PR: #6 `F-012 Production Revenue Observatory visual upgrade`, stacked on `feature/f-011-data-scope-capture-entry-planning`, https://github.com/fightkimi/hotelprice/pull/6.
- Current branch: `feature/f-012-production-revenue-observatory-visual-upgrade-planning`.
- F-012 selected route: Option A, global Revenue Observatory visual system upgrade.
- F-012 spec: `docs/specs/2026-05-20-production-revenue-observatory-visual-upgrade.md`.
- F-012 plan: `docs/superpowers/plans/2026-05-20-production-revenue-observatory-visual-upgrade.md`.
- F-012 Generator notes: `docs/test-reports/2026-05-20-f-012-generator-notes.md`.
- B-042 is complete.
- B-043 is complete.
- B-044 Evaluator verification accepted F-012.
- B-044 report: `docs/test-reports/2026-05-20-f-012-production-revenue-observatory-visual-upgrade-evaluator.md`.
- B-041 and B-045 are complete through stacked PRs.

## F-012 Implementation Summary

F-012 upgraded the formal app into a cohesive Revenue Observatory visual system:

- added global shell, page, instrument, chart-frame, insight, and signal-rail tokens;
- marked the formal app shell with `data-visual-system="revenue-observatory"`;
- widened the observatory shell target to `2000px`;
- applied observatory panel, instrument header, metric lattice, insight rail, and chart frame primitives across Overview, Calendar, Market Comparison, Alert Review, and Setup/Data Scope;
- upgraded trend, heatmap, platform gap, and event timeline chart frames while preserving existing chart schemas and semantic markers;
- added five `2048x1352` screenshot artifacts and exact-dimension gates;
- scoped the F-011 setup-only grid pseudo-element so the global shell no longer causes horizontal overflow.

## F-012 Generator Evidence

- RED visual contract: missing observatory tokens, app-shell marker, screen wrappers, and chart frames failed as expected.
- GREEN token/shell test: `1 file / 4 tests`.
- RED chart-frame test: missing chart-frame class failed as expected.
- GREEN chart tests: `1 file / 4 tests`, preserving trend segments, unavailable heatmap copy, and `CNY 0`.
- GREEN five-screen tests: `2 files / 4 tests`.
- Targeted visual regression: `4 files / 12 tests`.
- Domain/data regression: `7 files / 45 tests`.
- Full `/opt/homebrew/bin/npm run verify`: build passed, Vitest `14 files / 71 tests`, Playwright `18 tests`.
- Project checks passed: `triad_doctor.py`, `test_triad_doctor.py`, JSON parsing for progress/features/backlog, and H5 prototype regression with 14 checks.
- Static safety scan over app source paths produced no matches after renaming a harmless chart helper parameter from `token` to `cssVariable`.
- New screenshot artifacts confirmed by `sips` at exact `2048x1352` dimensions:
  - `docs/test-reports/f-007-app-foundation/overview-observatory--2048x1352.png`
  - `docs/test-reports/f-007-app-foundation/calendar-observatory--2048x1352.png`
  - `docs/test-reports/f-007-app-foundation/market-observatory--2048x1352.png`
  - `docs/test-reports/f-007-app-foundation/alert-review-observatory--2048x1352.png`
  - `docs/test-reports/f-007-app-foundation/setup-observatory--2048x1352.png`

## F-012 Evaluator Evidence

- Independent temporary Evaluator Playwright check passed: 7 tests. It verified five-screen observatory markers, no mobile overflow at 390x844, unsafe visible-copy absence, 2000px wide-shell behavior at 2048x1352, chart semantic markers, alert human-review markers, and setup production-connection disabled copy.
- Targeted visual regression passed: 4 files / 12 tests.
- Domain/data regression passed: 7 files / 45 tests.
- Full app verification passed: build passed, Vitest 14 files / 71 tests passed, Playwright 18 tests passed.
- Triad checks, JSON checks, and H5 prototype regression passed; prototype regression reports 14 checks.
- Static safety scan found no live collection, credential, cookie, CAPTCHA, storage, browser automation, recommended-price, or automatic-pricing terms in app source paths.
- `layout.css` has no raw `rgba(...)` or hex color functions.
- Screenshot evidence dimensions remain exact for five 2048x1352 observatory captures, mobile 390x844 captures, and setup tablet 768x1024.
- PR hygiene: working tree was clean before report/status updates. Relative to F-011 head, diff is bounded to F-012 visual-system files, screenshots, tests, docs, and status files. Relative to `origin/main`, branch is ahead by 19 commits because F-010 and F-011 are dependency commits and must be reflected in base before F-012 PR.

## Boundaries

- F-012 is a visual-system and responsive-layout slice only.
- No domain alert math changes.
- No `DemoDataset` semantic changes.
- No real OTA collection, browser automation, file upload, backend route, persistence, migration, credentials, cookies, CAPTCHA handling, storage, recommended price, or automatic pricing.
- Existing F-008/F-009/F-010/F-011 boundaries must continue to pass.

## Next Step

Review and merge the stacked PR chain in order:

1. PR #4: F-010 into `main`.
2. PR #5: F-011 into the F-010 branch, or retarget to `main` after PR #4 is merged.
3. PR #6: F-012 into the F-011 branch, or retarget to `main` after PR #5 is merged.

Do not push directly to `main` or `master`.
