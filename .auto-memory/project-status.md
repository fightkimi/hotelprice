# Project Status

## Current State

- Project: Hotel Pricing Capture
- Workflow: Triad Workflow with Planner / Generator / Evaluator roles
- Current role for this pass: Evaluator
- Superpowers: mandatory sequence recorded in `.auto-memory/superpowers-workflow.md`
- Branch rule: feature branch + PR only; no direct push to `main` / `master`

## Current Batch

- Batch id: `data-scope-capture-entry`
- Goal: define the F-011 data-scope contract and compliant capture-entry preview before any live source or persistence work
- Status: done

## Current Facts

- F-007 is accepted, merged through PR #1, and available on `origin/main`.
- F-007 merge commit: `dd43b3beda70323314db20740cba92bc416429e7`.
- F-008 is accepted, merged through PR #2, and available on `origin/main`.
- F-008 merge commit: `a303c2f`.
- F-009 is accepted, merged through PR #3, and available on `origin/main`.
- F-009 merge commit: `48ab7bb`.
- Local `main` has been fast-forwarded to `origin/main`.
- Current branch: `feature/f-011-data-scope-capture-entry-planning`.
- F-010 spec: `docs/specs/2026-05-19-owner-position-evidence-enrichment.md`.
- F-010 plan: `docs/superpowers/plans/2026-05-19-owner-position-evidence-enrichment.md`.
- B-027 is now closed as a tracking item because it has been promoted into F-010.
- B-035 is complete.
- B-036 Evaluator verification accepted F-010.
- B-036 report: `docs/test-reports/2026-05-19-f-010-owner-position-evidence-enrichment-evaluator.md`.
- B-037 is complete.
- F-010 PR: #4 `F-010 Owner-position evidence enrichment` at https://github.com/fightkimi/hotelprice/pull/4.
- `origin/main` still points at the F-009 merge commit `48ab7bb`; PR #4 is not reflected in `origin/main` in this local checkout.
- F-011 spec: `docs/specs/2026-05-19-data-scope-capture-entry.md`.
- F-011 plan: `docs/superpowers/plans/2026-05-19-data-scope-capture-entry.md`.
- B-038 is complete.
- B-039 is complete.
- B-040 Evaluator verification accepted F-011 for product behavior and data-boundary coverage.
- B-040 report: `docs/test-reports/2026-05-19-f-011-data-scope-capture-entry-evaluator.md`.
- B-041 is the PR-preparation task after F-011 acceptance.

## Current Design Decision

F-011 enriched the Setup/Data Scope surface and dataset contract rather than adding real collection:

- added typed `dataScope` and `captureEntry` objects to `DemoDataset`;
- derived scope from `domainSeed` so property, competitor, channel, stay-date, room-type, occupancy, currency, tax/fee, meal-plan, cancellation, freshness, and capture-time boundaries stay explicit;
- rendered a customer-safe capture-entry preview for fixture demo, manual import preview, and approved API preview;
- migrated the H5 `Revenue Observatory` visual language into the formal Setup/Data Scope surface with token-layer glass panels, precision grid, scope map, and capture signal rail;
- kept `productionConnectionEnabled` false;
- preserved human-review-only behavior and avoided recommended prices or automatic pricing actions.

## F-011 Generator Evidence

- Dataset contract and adapter TDD red/green completed.
- Setup screen component TDD red/green completed.
- Revenue Observatory visual contract TDD red/green completed from the H5 visual philosophy reference, without staging or committing H5 prototype files.
- Targeted regression passed after visual migration: `5 files / 24 tests`.
- Full app verification passed after sandbox escalation for the Playwright local server: build, Vitest `13 files / 68 tests`, Playwright `13 tests`.
- Triad checks, JSON checks, and prototype regression passed after the Revenue Observatory visual migration and handoff state refresh; current H5 prototype regression reports `15 checks`.
- Static safety scan found no live collection, credential, cookie, CAPTCHA, storage, browser automation, recommended-price, or automatic-pricing terms in the F-011 touched paths.
- Updated setup screenshots: `setup-data-scope--1280x800.png` and `setup-data-scope--768x1024.png`.
- Generator notes: `docs/test-reports/2026-05-19-f-011-generator-notes.md`.

## Generator Evidence

- Domain evidence role TDD red/green completed.
- UI evidence marker TDD red/green completed.
- Targeted regression passed: `4 files / 27 tests`.
- Full app verification passed: build, Vitest `12 files / 62 tests`, Playwright `13 tests`.
- Triad checks, JSON checks, and prototype regression passed.
- Static safety scan found no live collection, credential, cookie, CAPTCHA, storage, browser automation, recommended-price, or automatic-pricing terms in the F-010 touched pricing/data paths.
- Generator notes: `docs/test-reports/2026-05-19-f-010-generator-notes.md`.

## Evaluator Evidence

- Independent B-040 data-scope/capture-entry reverify test: 1 file / 3 tests passed.
- Targeted F-011 regression passed: 5 files / 24 tests.
- Full app verification passed after sandbox escalation for the Playwright local server: build passed, Vitest 13 files / 68 tests passed, Playwright 13 tests passed.
- Triad checks, JSON checks, and prototype regression passed; current H5 prototype regression reports 15 checks because local H5 visual-reference files are present.
- Static safety scan found no live collection, credential, cookie, CAPTCHA, storage, browser automation, recommended-price, or automatic-pricing terms in the F-011 touched paths.
- Screenshot evidence dimensions remain correct for setup captures: 1280x800 and 768x1024; F-007 matrix captures remain dimension-matched.
- PR hygiene: current branch is ahead of `origin/main` by 13 commits because it contains accepted F-010 work plus F-011. Before opening F-011 PR, resolve the F-010 PR #4 dependency and clean or separately isolate unstaged H5 reference files.

## Previous Evaluator Evidence

- Independent B-036 evidence role test: 1 file / 3 tests passed.
- Targeted F-010 regression: 4 files / 27 tests passed.
- Full app verification: build passed, Vitest 12 files / 62 tests passed, Playwright 13 tests passed.
- Triad checks, JSON checks, and prototype regression passed.
- Static safety scan found no matches in `app/src/data/domainDrivenDataset.ts` and `app/src/domain/pricing`.
- PR hygiene passed on `feature/f-010-owner-position-evidence-planning`: branch was ahead of `origin/main` by 4 F-010 commits before the Evaluator report/status updates.

## Boundaries

- Data remains fixture/manual demo data only.
- No live OTA collection, browser automation, storage, credentials, cookies, CAPTCHA handling, network connector, persistence, API routes, or automatic pricing.
- No file upload is included in F-011.
- F-008 alert thresholds, F-009 data flow, and F-010 evidence semantics remain unchanged unless a failing test proves a narrow contract issue.

## Next Step

B-041 should prepare the F-011 PR. Before opening it, resolve the F-010 PR #4 dependency by rebasing after F-010 is merged or otherwise ensuring F-011 does not duplicate F-010 changes, and clean/stash/commit separately the local H5 visual reference files. Do not push directly to `main` or `master`.
