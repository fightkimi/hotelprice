# Project Status

## Current State

- Project: Hotel Pricing Capture
- Workflow: Triad Workflow with Planner / Generator / Evaluator roles
- Current role for this pass: Generator
- Superpowers: mandatory sequence recorded in `.auto-memory/superpowers-workflow.md`
- Branch rule: feature branch + PR only; no direct push to `main` / `master`

## Current Batch

- Batch id: `production-revenue-observatory-visual-upgrade`
- Goal: implement the F-012 global Revenue Observatory visual-system upgrade for the formal React app without changing accepted business semantics
- Status: verifying

## Current Facts

- F-007 is accepted, merged through PR #1, and available on `origin/main`.
- F-007 merge commit: `dd43b3beda70323314db20740cba92bc416429e7`.
- F-008 is accepted, merged through PR #2, and available on `origin/main`.
- F-008 merge commit: `a303c2f`.
- F-009 is accepted, merged through PR #3, and available on `origin/main`.
- F-009 merge commit: `48ab7bb`.
- F-010 owner-position evidence enrichment is accepted and recorded as PR #4.
- F-011 data scope and capture entry is accepted for product behavior and data-boundary coverage.
- Current branch: `feature/f-012-production-revenue-observatory-visual-upgrade-planning`.
- F-012 selected route: Option A, global Revenue Observatory visual system upgrade.
- F-012 spec: `docs/specs/2026-05-20-production-revenue-observatory-visual-upgrade.md`.
- F-012 plan: `docs/superpowers/plans/2026-05-20-production-revenue-observatory-visual-upgrade.md`.
- F-012 Generator notes: `docs/test-reports/2026-05-20-f-012-generator-notes.md`.
- B-042 is complete.
- B-043 is complete.
- B-044 is the next Evaluator verification task.

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

## Boundaries

- F-012 is a visual-system and responsive-layout slice only.
- No domain alert math changes.
- No `DemoDataset` semantic changes.
- No real OTA collection, browser automation, file upload, backend route, persistence, migration, credentials, cookies, CAPTCHA handling, storage, recommended price, or automatic pricing.
- Existing F-008/F-009/F-010/F-011 boundaries must continue to pass.

## Next Step

B-044 should run Evaluator verification for F-012. Evaluator should independently verify global visual coverage, exact screenshot dimensions, 2048 wide-shell behavior, mobile no-overflow behavior, chart semantic preservation, customer-safe copy, no live collection or automatic pricing, and PR diff hygiene. Do not push directly to `main` or `master`.
