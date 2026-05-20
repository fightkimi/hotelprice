# Project Status

## Current State

- Project: Hotel Pricing Capture
- Workflow: Triad Workflow with Planner / Generator / Evaluator roles
- Current role for this pass: Planner
- Superpowers: mandatory sequence recorded in `.auto-memory/superpowers-workflow.md`
- Branch rule: feature branch + PR only; no direct push to `main` / `master`

## Current Batch

- Batch id: `project-prd-and-development-plan-maintenance`
- Feature: `F-013-project-prd-and-development-plan-maintenance`
- Goal: establish and maintain project-level PRD and project-level development plan as the source of truth for future product work
- Status: verifying after Planner documentation update
- Current branch: `feature/f-013-project-prd-roadmap-maintenance`

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

## Boundaries

- No live OTA collection.
- No credential, cookie, session, CAPTCHA, browser automation, storage, backend route, migration, file upload, recommended-price, or automatic-pricing work is introduced by F-013.
- Future real-data work must first pass a source compliance specification.
- Future product work must read `docs/specs/PROJECT_PRD.md` and `docs/specs/PROJECT_DEVELOPMENT_PLAN.md` before planning or implementation.

## Next Step

B-047 should have an Evaluator verify the F-013 project documentation baseline, including PRD freshness, development-plan freshness, state consistency, and no product-code changes. After F-013 is accepted, the recommended next product slice is F-014 interactive price calendar and date detail workflow from the latest `main`.
