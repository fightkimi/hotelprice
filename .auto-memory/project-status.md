# Project Status

## Current State

- Project: Hotel Pricing Capture
- Workflow: Triad Workflow with Planner / Generator / Evaluator roles
- Current role for this pass: Planner
- Superpowers: mandatory sequence recorded in `.auto-memory/superpowers-workflow.md`
- Branch rule: feature branch + PR only; no direct push to `main` / `master`

## Current Batch

- Batch id: `alert-review-workflow-depth`
- Feature: `F-015-alert-review-workflow-depth`
- Goal: plan the next business-workflow slice for Alert Review selection, evidence detail, local review status, and review notes
- Status: Generator-ready planning
- Current branch: `feature/f-015-alert-review-workflow-depth-planning`

## Current Facts

- `origin/main` is available and local `main` is synchronized to merge commit `a91102f`.
- F-007 is accepted, merged through PR #1, and available on `main`.
- F-008 is accepted, merged through PR #2, and available on `main`.
- F-009 is accepted, merged through PR #3, and available on `main`.
- F-010 owner-position evidence enrichment is accepted, merged through PR #4, and available on `main`.
- F-011 data scope and capture entry is accepted, merged through PR #7, and available on `main`.
- F-012 production Revenue Observatory visual upgrade is accepted, merged through PR #8, and available on `main`.
- F-013 project PRD and development plan maintenance is accepted and landed on `main` through PR #10.
- F-014 interactive price calendar detail workflow is accepted, merged into the F-013 stacked branch through PR #9, and landed on `main` through PR #10.
- Latest known main merge commit after PR #10: `a91102f`.
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

## F-015 Scope

F-015 is a Planner-defined product slice for the Alert Review screen.

It should add a Generator-ready plan for:

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

## Boundaries

- No live OTA collection.
- No credential, cookie, session, CAPTCHA, browser automation, storage, backend route, migration, file upload, recommended-price, or automatic-pricing work is allowed in F-015.
- Future real-data work must first pass a source compliance specification.
- Future product work must read `docs/specs/PROJECT_PRD.md` and `docs/specs/PROJECT_DEVELOPMENT_PLAN.md` before planning or implementation.
- Project-level PRD and development plan must be checked weekly, even when no feature has been accepted that week.

## Next Step

Generator should implement `F-015-alert-review-workflow-depth` from the approved plan using strict TDD. Evaluator should independently verify alert selection, local-only review status/notes, evidence role visibility, rate-boundary visibility, safety scans, mobile no-overflow behavior, full app verification, and project-doc freshness. B-048 remains the standing weekly project-documentation maintenance item.
