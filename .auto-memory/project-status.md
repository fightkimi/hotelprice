# Project Status

## Current State

- Project: Hotel Pricing Capture
- Workflow: Triad Workflow with Planner / Generator / Evaluator roles
- Current role for this pass: Generator / F-009 implementation
- Superpowers: mandatory sequence recorded in `.auto-memory/superpowers-workflow.md`
- Branch rule: feature branch + PR only; no direct push to `main` / `master`

## Current Batch

- Batch id: `domain-driven-ui-data-flow`
- Goal: connect the accepted F-008 domain core to the accepted F-007 formal React/TypeScript UI through fixture/manual seed data and a pure view-model adapter
- Status: verifying

## Current Facts

- F-007 is accepted, merged through PR #1, and available on `origin/main`.
- F-007 merge commit: `dd43b3beda70323314db20740cba92bc416429e7`.
- F-008 is accepted, merged through PR #2, and available on `origin/main`.
- F-008 merge commit: `a303c2f`.
- Local work is on `feature/f-009-domain-driven-ui-planning`.
- F-009 spec: `docs/specs/2026-05-19-domain-driven-ui-data-flow.md`.
- F-009 plan: `docs/superpowers/plans/2026-05-19-domain-driven-ui-data-flow.md`.
- B-029 is complete.
- B-030 is complete with strict TDD evidence recorded in `docs/test-reports/2026-05-19-f-009-generator-notes.md`.
- B-031 is the next Evaluator verification task.
- B-027 owner-position evidence enrichment remains non-blocking and can be handled as a separate small slice if needed.

## Generator Implementation Facts

- Added fixture/manual domain seed data under `app/src/data/domainSeed.ts`.
- Added a pure adapter under `app/src/data/domainDrivenDataset.ts`.
- `app/src/data/demoDataset.ts` now re-exports `domainDrivenDemoDataset`, so the existing F-007 UI import is connected to the domain-driven data flow.
- Adapter calls F-008 `generateAlertCandidates` and maps alert candidates into F-007 `Signal` objects.
- Adapter builds owner trend, core-average trend, event-lift trend, heatmap days, and platform gap rows from domain snapshots.
- Unavailable/no-rate/source-error samples produce null chart values and unavailable heatmap days, not zero prices.
- All generated pricing-sensitive signals keep `humanReviewRequired: true`.
- Safety scan now covers `app/src/data/domainSeed.ts`, `app/src/data/domainDrivenDataset.ts`, and `app/src/data/demoDataset.ts`.
- F-008 domain evidence semantics were not changed; B-027 remains open and non-blocking.

## Verification Evidence

- `npm test -- tests/data/domainDrivenDataset.test.ts tests/contract/demoDataset.test.ts tests/domain`: 7 files passed, 38 tests passed.
- `npm run verify`: first sandbox run failed only at Playwright dev-server startup due `EPERM` on local port binding; escalated rerun passed build, Vitest 12 files / 58 tests, and Playwright 13 tests.
- `python3 scripts/triad_doctor.py`: healthy enough to proceed.
- `python3 scripts/test_triad_doctor.py`: smoke test passed.
- `python3 -m json.tool progress.json`: valid JSON.
- `python3 -m json.tool features.json`: valid JSON.
- `python3 -m json.tool backlog.json`: valid JSON.
- `node tests/client_demo_prototype.test.js`: 14 prototype regression checks passed.

## Next Step

Start B-031 with Evaluator-Codex. Evaluator should verify the F-009 data flow, UI behavior, unavailable-data null handling, human-review-only boundaries, F-007 app gates, F-008 domain regression, safety scan, and PR readiness.
