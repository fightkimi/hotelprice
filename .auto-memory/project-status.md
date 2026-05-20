# Project Status

## Current State

- Project: Hotel Pricing Capture
- Workflow: Triad Workflow with Planner / Generator / Evaluator roles
- Current role for this pass: Planner
- Superpowers: mandatory sequence recorded in `.auto-memory/superpowers-workflow.md`
- Branch rule: feature branch + PR only; no direct push to `main` / `master`

## Current Batch

- Batch id: `interactive-price-calendar-detail-workflow`
- Feature: `F-014-interactive-price-calendar-detail-workflow`
- Goal: plan the date-detail data contract and Calendar UI interaction workflow for Generator implementation
- Status: planning
- Current branch: `feature/f-014-interactive-price-calendar-detail-workflow-planning`

## Current Facts

- `origin/main` is available and current local `main` contains the merged F-012 baseline.
- F-007 is accepted, merged through PR #1, and available on `main`.
- F-008 is accepted, merged through PR #2, and available on `main`.
- F-009 is accepted, merged through PR #3, and available on `main`.
- F-010 owner-position evidence enrichment is accepted and merged through PR #4.
- F-011 data scope and capture entry is accepted and merged through PR #7.
- F-012 production Revenue Observatory visual upgrade is accepted and merged through PR #8.
- Latest known main merge commit after PR #8: `455f0a3`.
- Project-level PRD: `docs/specs/PROJECT_PRD.md`.
- Project-level development plan: `docs/specs/PROJECT_DEVELOPMENT_PLAN.md`.
- F-013 spec: `docs/specs/2026-05-20-project-prd-and-development-plan-maintenance.md`.
- F-013 plan: `docs/superpowers/plans/2026-05-20-project-prd-and-development-plan-maintenance.md`.
- B-047 Evaluator verification accepted F-013.
- B-047 report: `docs/test-reports/2026-05-20-f-013-project-prd-and-development-plan-maintenance-evaluator.md`.
- Weekly project-document maintenance automation is active for this workspace and runs as Planner governance work.
- F-014 selected route: date-detail data contract plus UI interaction workflow.
- F-014 spec: `docs/specs/2026-05-20-interactive-price-calendar-detail-workflow.md`.
- F-014 plan: `docs/superpowers/plans/2026-05-20-interactive-price-calendar-detail-workflow.md`.

## Product Baseline

The formal product baseline is the React Revenue Observatory app:

- F-007 formal app foundation created the production app shell, chart primitives, formal screens, screenshot gates, and safe visible-copy checks.
- F-008 added domain core rate boundaries for comparable rate keys, availability/stale modeling, deterministic snapshot ordering, alert rules, evidence, and compliance scans.
- F-009 connected the domain core to UI data through fixture/manual seed data and a pure adapter.
- F-010 enriched owner-position alert evidence with owner and competitor evidence roles.
- F-011 added typed data scope and capture-entry preview while keeping production connection disabled.
- F-012 upgraded the app to the global Revenue Observatory visual system across Overview, Calendar, Market Comparison, Alert Review, and Setup/Data Scope.

## F-013 Scope

F-013 is a Planner-only documentation and state slice.

It adds:

- a complete project PRD;
- a complete project development plan;
- a maintenance protocol for keeping project-level documentation fresh;
- state updates so future Planner, Generator, and Evaluator sessions begin from current facts.

It does not modify:

- product source code;
- product tests;
- migrations;
- build, package, deployment, or runtime configuration;
- production data collection behavior.

## F-013 Evaluator Evidence

- PROJECT_PRD and PROJECT_DEVELOPMENT_PLAN match the F-012 / PR #8 main baseline and identify F-014 interactive price calendar and date detail workflow as the next recommended product slice.
- Project docs cover product positioning, target users, user problems, non-goals, domain concepts, formal app baseline, feature requirements, data/compliance boundaries, quality gates, maintenance cadence, and open risks.
- Development plan covers completed baseline, phased roadmap, standard Planner/Generator/Evaluator deliverables, documentation maintenance cadence, and current next step.
- Diff is documentation/state-only relative to `main`; no product code, product tests, scripts, package/build/runtime config, backend, migration, or prototype files changed.
- Placeholder scan passed with no planned-pattern matches.
- `git diff --check` passed.
- Triad doctor, Triad doctor smoke test, JSON parsing, and H5 prototype regression passed; prototype regression reports 14 checks.
- Weekly local automation `酒店定价捕捉项目级文档周更` is ACTIVE for this workspace and reinforces B-048 recurring maintenance.

## F-014 Scope

F-014 is planned as a product implementation slice for Generator:

- add `CalendarDayDetail` and `calendarDetails.byDate` to the local `DemoDataset` contract;
- derive date details from existing fixture/manual domain seed data;
- add `CalendarHeatmap` date selection callback and accessible selected state;
- update `CalendarScreen` to use local selected-date state and render platform gaps, evidence sources, capture time, sample count, rate basis, event impact, missing sample state, and human-review markers;
- add Testing Library and Playwright coverage for date click behavior and mobile no-overflow.

F-014 must not:

- change F-008 domain alert math;
- add live OTA collection;
- add backend, persistence, credentials, cookies, sessions, CAPTCHA handling, storage, file upload, recommended price, or automatic pricing.

## Boundaries

- No live OTA collection.
- No credential, cookie, session, CAPTCHA, browser automation, storage, backend route, migration, file upload, recommended-price, or automatic-pricing work is introduced by F-014.
- Future real-data work must first pass a source compliance specification.
- Future product work must read `docs/specs/PROJECT_PRD.md` and `docs/specs/PROJECT_DEVELOPMENT_PLAN.md` before planning or implementation.
- Project-level PRD and development plan must be checked weekly, even when no feature has been accepted that week.

## Next Step

B-050 should have Generator implement F-014 from `docs/superpowers/plans/2026-05-20-interactive-price-calendar-detail-workflow.md` using strict TDD. B-048 remains the standing weekly project-documentation maintenance item.
