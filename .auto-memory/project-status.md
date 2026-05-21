# Project Status

## Current State

- Project: Hotel Pricing Capture
- Workflow: Triad Workflow with Planner / Generator / Evaluator roles
- Current role for this pass: Planner
- Superpowers: mandatory sequence recorded in `.auto-memory/superpowers-workflow.md`
- Branch rule: feature branch + PR only; no direct push to `main` / `master`

## Current Batch

- Batch id: `manual-import-preview`
- Feature: `F-018-manual-import-preview-and-field-mapping`
- Goal: prepare a local-only manual import preview, field mapping and rate-boundary validation workflow
- Status: B-064 Planner preparation complete; ready for B-065 Generator implementation
- Current branch: `feature/f-018-manual-import-preview-planning`

## Current Facts

- `origin/main` is available and local `main` is synchronized to PR #13 merge commit `5c4eef3`.
- F-007 is accepted, merged through PR #1, and available on `main`.
- F-008 is accepted, merged through PR #2, and available on `main`.
- F-009 is accepted, merged through PR #3, and available on `main`.
- F-010 owner-position evidence enrichment is accepted, merged through PR #4, and available on `main`.
- F-011 data scope and capture entry is accepted, merged through PR #7, and available on `main`.
- F-012 production Revenue Observatory visual upgrade is accepted, merged through PR #8, and available on `main`.
- F-013 project PRD and development plan maintenance is accepted and landed on `main` through PR #10.
- F-014 interactive price calendar detail workflow is accepted, merged into the F-013 stacked branch through PR #9, and landed on `main` through PR #10.
- F-015 alert review workflow depth is accepted, merged through PR #11, and available on `main`.
- F-016 market comparison drilldown is accepted, merged through PR #12, and available on `main`.
- PR #13 merged the F-016 post-merge status update into `main`.
- Latest known main merge commit after PR #13: `5c4eef3`.
- F-017 selects source strategy and compliance gate as the first Phase 3 slice and has been accepted by B-063 Evaluator verification.
- F-018 has been prepared by Planner as the next safe Phase 3 implementation slice: manual import preview and field mapping.
- Project-level PRD: `docs/specs/PROJECT_PRD.md`.
- Project-level development plan: `docs/specs/PROJECT_DEVELOPMENT_PLAN.md`.
- Weekly project-document maintenance automation is active for this workspace and runs as Planner governance work.

## Product Baseline

The formal product baseline is the React Revenue Observatory app on `main`:

- F-007 formal app foundation created the production app shell, chart primitives, formal screens, screenshot gates, and safe visible-copy checks.
- F-008 added domain core rate boundaries for comparable rate keys, availability/stale modeling, deterministic snapshot ordering, alert rules, evidence, and compliance scans.
- F-009 connected the domain core to UI data through fixture/manual seed data and a pure adapter.
- F-010 enriched owner-position alert evidence with owner and competitor evidence roles.
- F-011 added typed data scope and capture-entry preview while keeping production connection disabled.
- F-012 upgraded the app to the global Revenue Observatory visual system across Overview, Calendar, Market Comparison, Alert Review, and Setup/Data Scope.
- F-013 established project-level PRD, project-level development plan, and weekly maintenance protocol.
- F-014 added an accepted interactive calendar date-detail workflow with platform gaps, evidence, capture time, rate basis, missing-sample state, and human-review markers.
- F-015 added an accepted local Alert Review workflow with selectable alerts, selected detail, local review status, local notes, owner/competitor evidence roles, and explicit rate boundaries.
- F-016 added an accepted Market Comparison drilldown by platform, stay date, room type and competitor sample, using fixture/manual data only. It is merged through PR #12 and available on `main`.

## F-017 Planner Result

F-017 is a Planner-only governance slice for Phase 3 data-source work.

The plan establishes:

- allowed source classes: user manual import, official API, partner/licensed data feed, channel manager or PMS export, and public event context;
- prohibited methods: unauthorized OTA scraping, browser automation, credential/cookie/session/CAPTCHA handling, bot-protection circumvention, disallowed terms, persistence without a future model, recommended pricing and automatic pricing;
- source decision matrix fields for authorization evidence, terms status, data boundary coverage, refresh model, rate limits, secret handling, storage status, audit evidence and product permission;
- next slice recommendation: F-018 manual import preview and field mapping, after F-017 Evaluator acceptance.

F-017 must not:

- modify product source, product tests, runtime scripts, package files, migrations or screenshot artifacts;
- implement live collection, connectors, storage, credential handling or capture jobs;
- change F-008 alert math, F-014 calendar workflow, F-015 alert review workflow or F-016 market drilldown behavior.

## F-017 Planner Artifacts

- F-017 spec: `docs/specs/2026-05-21-source-strategy-and-compliance-gate.md`
- F-017 plan: `docs/superpowers/plans/2026-05-21-source-strategy-and-compliance-gate.md`

## F-017 Evaluator Evidence

- B-063 accepted F-017 for source-strategy governance, compliance-gate specificity, documentation/state-only scope, next-slice ordering, project-doc freshness, and PR readiness.
- Evaluator report: `docs/test-reports/2026-05-21-f-017-source-strategy-and-compliance-gate-evaluator.md`.
- Diff review confirmed F-017 modifies only documentation/status artifacts: project-status, backlog, progress, features, PRD, development plan, F-017 spec and F-017 plan.
- Product source, product tests, package files, runtime scripts, generated artifacts and screenshot artifacts have no diff.
- Source classes, prohibited methods, source decision matrix fields and F-018 manual import preview ordering are explicit in the F-017 spec and project docs.
- Triad doctor, Triad doctor smoke test, JSON parsing, prototype regression, generated-artifact check and `git diff --check` passed.

## F-018 Planner Result

F-018 is a Generator-ready Planner slice for a safe first data-input workflow.

The plan establishes:

- `DemoDataset.manualImportPreview` as a typed preview-only contract;
- a pure local CSV/pasted-row parser, mapper and validator;
- required field mappings for hotel name, hotel role, platform, source, room type, stay date, capture time, price, currency, availability, occupancy, meal plan, tax/fee basis and cancellation policy;
- validation rules for required fields, ISO dates, capture time, CNY currency, positive occupancy, availability values and positive price for available rows;
- Setup/Data Scope UI for sample/pasted text, field mapping table, validation summary, row preview, rate-boundary completeness and guardrails;
- acceptance gates for no upload, no persistence, no network calls, no storage writes, no credentials, no browser automation, no CAPTCHA handling, no recommended pricing and no automatic pricing.

F-018 must not:

- implement file upload, Excel binary parsing, backend routes, database writes, localStorage/sessionStorage or connector code;
- implement live OTA collection, browser automation, credential/cookie/session/CAPTCHA handling or source API calls;
- change F-008 alert math, F-014 calendar workflow, F-015 alert review workflow or F-016 market drilldown behavior;
- render invalid or non-available rows as pseudo prices such as `CNY 0` or `CNY null`.

## F-018 Planner Artifacts

- F-018 spec: `docs/specs/2026-05-21-manual-import-preview-and-field-mapping.md`
- F-018 plan: `docs/superpowers/plans/2026-05-21-manual-import-preview-and-field-mapping.md`

## F-016 Generator Result

F-016 is now implemented as a Generator slice for the Market Comparison screen.

The implementation adds:

- `DemoDataset.marketDrilldown` with selectable platform/date/room-type options, selected detail, guardrails and detail lookup;
- competitor sample rows with hotel identity, sample status, price, source, capture time and rate key boundaries;
- customer-safe handling for missing, stale, unavailable and source-error samples;
- Market screen local selection state and selected detail panel;
- Playwright mobile drilldown coverage and refreshed market screenshots;
- safety gates for no live collection, no persistence, no recommended price and no automatic pricing.

F-016 must not:

- change F-008 alert math;
- change F-014 Calendar date-detail workflow;
- change F-015 Alert Review workflow;
- add live OTA collection, backend, persistence, credentials, cookies, sessions, CAPTCHA handling, browser storage, file upload, recommended price or automatic pricing.

## F-016 Planner Artifacts

- F-016 spec: `docs/specs/2026-05-21-market-comparison-drilldown.md`
- F-016 plan: `docs/superpowers/plans/2026-05-21-market-comparison-drilldown.md`

## F-016 Generator Artifacts

- Generator notes: `docs/test-reports/2026-05-21-f-016-generator-notes.md`
- Product code: `app/src/types/contracts.ts`, `app/src/data/domainDrivenDataset.ts`, `app/src/screens/MarketComparisonScreen.tsx`, `app/src/App.tsx`, `app/src/styles/layout.css`
- Tests: `app/tests/data/domainDrivenDataset.test.ts`, `app/tests/components/marketComparisonScreen.test.tsx`, `app/tests/e2e/app-foundation.spec.ts`
- Screenshots: `docs/test-reports/f-007-app-foundation/market-comparison-platform-bars--1440x900.png`, `docs/test-reports/f-007-app-foundation/market-comparison-platform-bars--390x844.png`, `docs/test-reports/f-007-app-foundation/market-observatory--2048x1352.png`

## F-016 Generator Verification

- Targeted F-016 regression passed with 3 files / 22 tests.
- Full app verification passed: production build, Vitest 17 files / 85 tests, and Playwright 21 tests.
- Full screenshot matrix passed with 21 Playwright tests.
- Triad doctor, Triad doctor smoke test, JSON validation, prototype regression, `git diff --check`, F-008 domain-diff check, generated-artifact check, and static `app/src` safety scans passed.

## F-016 Evaluator Evidence

- B-059 accepted F-016 for Market Comparison drilldown behavior, data-boundary coverage, missing/unavailable sample safety, responsive behavior, and PR readiness.
- Evaluator report: `docs/test-reports/2026-05-21-f-016-market-comparison-drilldown-evaluator.md`.
- Independent temporary Evaluator Vitest probe passed `1 file / 3 tests`; it verified option/detail contract consistency, all focus-date platforms, available detail math, competitor range, sample rate keys, missing/source-error/unavailable states, local UI selection, no storage/network writes, and no `CNY null` / pseudo `CNY 0` missing prices. The temporary probe was removed after the run.
- Targeted F-016 app regression passed: `3 files / 22 tests`.
- Full app verification passed: production build, Vitest `17 files / 85 tests`, and Playwright `21 tests`.
- Triad doctor, Triad doctor smoke test, JSON parsing, prototype regression, screenshot dimensions, `git diff --check`, generated-artifact check, and product safety scans passed.
- F-016 diff is bounded against `main` at PR #11 merge commit `185e883`; no F-008 domain pricing or domain tests changed.
- Project PRD and development plan were refreshed after acceptance, after B-060, and after PR #12 merge to show F-016 on `main`.

## F-016 PR Handoff And Merge

- B-060 is complete.
- PR #12 was merged from `feature/f-016-market-comparison-drilldown-planning` to `main`: https://github.com/fightkimi/hotelprice/pull/12.
- Local `main` has been fast-forwarded to merge commit `d5bcdcf`.
- The merged PR is bounded to F-016 planning, implementation, tests, screenshots, evaluator report, and status/documentation updates.
- F-017 has now selected source strategy and compliance gate as the first Phase 3 slice. Do not start live collection before this source-compliance spec is accepted.

## F-015 Generator Result

F-015 was implemented as a Generator slice for the Alert Review screen, accepted by B-055 Evaluator verification, and merged into `main` through PR #11.

The implementation adds:

- typed alert review workflow data derived from existing fixture/manual alert candidates;
- selectable alert rows;
- a selected alert detail panel or drawer;
- local review status controls;
- local review note/preset text state;
- evidence rows with owner observation and competitor sample roles;
- visible rate boundaries including platform, room type, occupancy, tax/fee basis, meal plan, cancellation policy, stay date, capture time, and sample state;
- mobile no-overflow behavior and updated screenshot/interaction gates.

F-015 must not:

- change F-008 alert math;
- add live OTA collection;
- add backend, persistence, credentials, cookies, sessions, CAPTCHA handling, storage, file upload, recommended price, or automatic pricing;
- present review status or notes as saved server data.

## F-015 Planner Artifacts

- F-015 spec: `docs/specs/2026-05-20-alert-review-workflow-depth.md`
- F-015 plan: `docs/superpowers/plans/2026-05-20-alert-review-workflow-depth.md`

## F-015 Generator Artifacts

- Generator notes: `docs/test-reports/2026-05-20-f-015-generator-notes.md`
- Product code: `app/src/types/contracts.ts`, `app/src/data/domainDrivenDataset.ts`, `app/src/screens/AlertReviewScreen.tsx`, `app/src/styles/layout.css`
- Tests: `app/tests/data/domainDrivenDataset.test.ts`, `app/tests/components/alertReviewScreen.test.tsx`, `app/tests/e2e/app-foundation.spec.ts`
- Screenshots: `docs/test-reports/f-007-app-foundation/alert-review-drawer-open--1440x900.png`, `docs/test-reports/f-007-app-foundation/alert-review-drawer-open--390x844.png`, `docs/test-reports/f-007-app-foundation/alert-review-observatory--2048x1352.png`

## F-015 Generator Verification

- Targeted app tests passed with 4 files / 20 tests.
- Full app verification passed: build, Vitest 16 files / 80 tests, and Playwright 20 tests.
- Full screenshot matrix passed with 20 Playwright tests.
- Triad doctor, triad doctor smoke test, JSON validation, prototype regression, `git diff --check`, and static `app/src` safety scans passed.

## F-015 Evaluator Evidence

- B-055 accepted F-015 for alert-review workflow behavior, data-boundary coverage, local-only review state, evidence-role visibility, responsive behavior, and PR readiness.
- Independent temporary Evaluator Vitest probe passed `1 file / 2 tests`; it verified alertReview-to-signal mapping, rate boundaries, owner/competitor evidence roles, alert selection, page-local status/notes, no storage/network writes, and no `CNY null` / `CNY 0` pseudo prices. The temporary probe was removed after the run.
- Targeted F-015 app regression passed: `4 files / 20 tests`.
- Full app verification passed: production build, Vitest `16 files / 80 tests`, and Playwright `20 tests`.
- Triad doctor, Triad doctor smoke test, JSON parsing, prototype regression, screenshot dimensions, `git diff --check`, generated-artifact check, and product safety scans passed.
- F-015 diff was bounded against `main` at PR #10 merge commit `a91102f`; no F-008 domain pricing or domain tests changed.
- PR #11 merged F-015 into `main` at merge commit `185e883`.
- Project PRD and development plan were refreshed after acceptance to show F-015 accepted and F-016 as the next recommended planning slice.

## Boundaries

- No live OTA collection.
- No credential, cookie, session, CAPTCHA, browser automation, storage, backend route, migration, file upload, recommended-price, or automatic-pricing work is allowed in current or next planned slices unless a future source-compliance spec explicitly approves it.
- Future real-data work must first pass a source compliance specification.
- Future product work must read `docs/specs/PROJECT_PRD.md` and `docs/specs/PROJECT_DEVELOPMENT_PLAN.md` before planning or implementation.
- Project-level PRD and development plan must be checked weekly, even when no feature has been accepted that week.

## Next Step

B-064 is complete. Next, Generator should execute B-065 and implement F-018 from `docs/superpowers/plans/2026-05-21-manual-import-preview-and-field-mapping.md` with strict TDD. Then Evaluator should execute B-066. B-048 remains the standing weekly project-documentation maintenance item.
