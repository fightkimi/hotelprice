# Project Status

## Current State

- Project: Hotel Pricing Capture
- Workflow: Triad Workflow with Planner / Generator / Evaluator roles
- Current role for this pass: Planner
- Superpowers: mandatory sequence recorded in `.auto-memory/superpowers-workflow.md`
- Branch rule: feature branch + PR only; no direct push to `main` / `master`

## Current Batch

- Batch id: `production-revenue-observatory-visual-upgrade`
- Goal: plan the F-012 global Revenue Observatory visual-system upgrade for the formal React app without changing accepted business semantics
- Status: planning complete; ready for Generator after dependency cleanup decision

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
- B-042 is complete.
- B-043 is the next Generator implementation task.

## F-012 Design Decision

F-012 upgrades the formal app from a functional app-foundation look into a cohesive Revenue Observatory product surface:

- extend the token layer for shell, glass panels, instrument surfaces, signal rails, chart frames, and insight rails;
- mark the app shell with `data-visual-system="revenue-observatory"`;
- use a wide desktop shell with target max width `2000px`;
- apply shared visual primitives across Overview, Calendar, Market Comparison, Alert Review, and Setup/Data Scope;
- upgrade trend, heatmap, platform gap, and event timeline presentation while preserving current data schemas;
- expand screenshot gates to include `2048x1352`, `1440x900`, and `390x844` coverage.

## Boundaries

- F-012 is a visual-system and responsive-layout slice only.
- No domain alert math changes.
- No `DemoDataset` semantic changes.
- No real OTA collection, browser automation, file upload, backend route, persistence, migration, credentials, cookies, CAPTCHA handling, storage, recommended price, or automatic pricing.
- Existing F-008/F-009/F-010/F-011 boundaries must continue to pass.

## Generator Handoff

Use `docs/superpowers/plans/2026-05-20-production-revenue-observatory-visual-upgrade.md`.

Generator must use strict `superpowers:test-driven-development`:

- write failing token/shell visual contract tests;
- write failing five-screen observatory primitive tests;
- write failing chart-frame preservation tests;
- update Playwright screenshot gates;
- implement the minimum token, CSS, and JSX class changes;
- verify with targeted tests, full `npm run verify`, Triad/JSON/prototype checks, and safety scans.

## Evaluator Handoff

Evaluator must independently verify global visual coverage, exact screenshot dimensions, wide-shell behavior, mobile no-overflow behavior, chart semantic preservation, customer-safe copy, no live collection or automatic pricing, and PR diff hygiene.

## Next Step

B-043 should implement F-012 after the team decides whether to continue as a stacked branch on the accepted F-011 head or wait until F-010/F-011 are reflected in the base branch. Do not push directly to `main` or `master`.
