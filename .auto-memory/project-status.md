# Project Status

## Current State

- Project: Hotel Pricing Capture
- Workflow: Triad Workflow with Planner / Generator / Evaluator roles
- Superpowers: mandatory sequence recorded in `.auto-memory/superpowers-workflow.md`
- Branch rule: feature branch + PR only; no direct push to `main` / `master`

## Current Batch

- Batch id: `formal-app-foundation`
- Goal: enter formal product development with a tokenized, testable React app foundation based on the accepted F-006 production UI contract
- Status: reverifying after B-020 Generator fixes

## Current Facts

- `F-006-production-ui-contract` is accepted by Evaluator as the source of truth for F-007.
- `F-007-formal-app-foundation` has a React + TypeScript formal app foundation implemented by Generator.
- F-007 app verification passed: `/opt/homebrew/bin/npm run verify` from `app/` completed build, Vitest, and Playwright screenshot gates.
- F-007 screenshot artifacts were generated under `docs/test-reports/f-007-app-foundation/`.
- F-007 Evaluator report: `docs/test-reports/2026-05-19-f-007-formal-app-foundation-evaluator.md`.
- F-007 is not accepted yet; B-020 Generator fixes are ready for Evaluator reverification.
- B-020 fixed P1 blockers: `.gitignore` added for generated artifacts, screenshot captures now assert exact viewport PNG dimensions, and `ContextRibbon` includes competitor group, demand context, and focusable read-only selector controls.
- B-020 fixed P2 follow-ups: raw `rgba(...)` values were moved from `layout.css` into token variables, and Generator red/green evidence is recorded in `docs/test-reports/2026-05-19-f-007-fix-generator-notes.md`.
- F-007 fix plan: `docs/superpowers/plans/2026-05-19-f-007-formal-app-foundation-fixes.md`.
- Current workspace is a Git repository on `feature/f-007-formal-app-foundation`.
- `origin` is set to `https://github.com/fightkimi/hotelprice.git`.
- Remote `main` exists with initialization commit `616838c88806aa3b40d1b4e62ebd15e9578827f0`.
- Local `feature/f-007-formal-app-foundation` starts from `origin/main`.

## Next Step

Run Evaluator reverification for `F-007-formal-app-foundation` using `B-021`.
