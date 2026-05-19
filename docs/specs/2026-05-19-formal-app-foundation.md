# F-007 Formal App Foundation Spec

## Role And Source Context

- Planner role: non-implementation. This spec prepares the Generator-ready formal app foundation slice.
- Source contract: `docs/specs/2026-05-19-production-ui-contract.md`.
- Source evaluation: `docs/test-reports/2026-05-19-f-006-production-ui-contract-evaluator.md`.
- Superpowers order used for this Planner pass: brainstorming, writing-plans, executing-plans, test-driven-development, verification-before-completion.

## Problem Statement

The investor prototype proved the product story, but it remains a static demo with rough visual and interaction quality. F-007 starts the formal product app foundation: a premium, testable, tokenized frontend shell that demonstrates hotel pricing intelligence with room type, platform, holiday/event trend, evidence, and human-review boundaries.

F-007 must not copy prototype CSS into production. It must translate F-006 into typed components, chart primitives, screenshot gates, contrast checks, and visible-copy checks that can become the baseline for later domain features.

## Scope Classification

- Affected domains: reporting, pricing comparison, alert review, setup/data scope, and formal UI foundation.
- Data binding: screens are property-bound, room-type-bound, platform/channel-bound, competitor-group-bound, date-range-bound, and capture-time-bound.
- Data type: fixture/demo data only. No real production data, no live OTA collection, no credentials, and no external source automation.
- Price basis: fixture rates must carry currency, tax/fee basis, cancellation policy, occupancy, meal plan, room type, platform/source, stay date, and capture time.
- Compliance: no live scraping, no CAPTCHA bypass, no cookie/session handling, and no customer-facing claims of automatic pricing.
- Pricing automation: insights may suggest review priorities only. Pricing-sensitive surfaces must show source, capture time, sample size, and `需人工复核`.

## Product Experience Direction

F-007 should feel like an executive revenue desk rather than a marketing page. The first screen is a working product surface: context controls, rate signals, trend evidence, and reviewable insight cards.

Design language:

- quiet analytical confidence;
- dense but legible workspace;
- restrained surfaces with exact F-006 tokens;
- clear hierarchy between decision context, evidence, and review actions;
- chart-first insight, not decorative cards;
- no oversized hero, no gradient-orb decoration, no one-note purple/blue palette.

## Recommended Stack

Use a small React + TypeScript + Vite app with CSS variables, native SVG chart primitives, Vitest, Testing Library, and Playwright.

Rationale:

- React + TypeScript gives explicit component and data contracts.
- CSS variables directly enforce the F-006 token contract.
- Native SVG charts keep the chart behavior inspectable and testable without hiding missing-data behavior inside a chart library.
- Vitest covers component contracts and token/contrast checks.
- Playwright covers viewport, screenshot, overflow, visible-copy, and drawer-state gates.

## Formal Screens

F-007 must render five fixture-backed screens:

1. Overview: context ribbon, opportunity/risk signals, room-type trend chart, event markers.
2. Calendar: demand calendar/heatmap with date detail state.
3. Market comparison: platform gap bars, competitor context, coverage markers.
4. Alert review: alert list plus evidence drawer open/closed states.
5. Setup/data scope: property profile, competitor group, source scope, demo-data caveat.

## Required Components And Contracts

Implement the F-006 primitives as typed components:

- `AppShell`
- `ContextRibbon`
- `SignalPanel`
- `EvidenceDrawer`
- `TrendChart`
- `CalendarHeatmap`
- `PlatformGapBars`
- `EventTimeline`

The typed data contracts must include:

- `RateKey`
- `PricePoint`
- `ContextSelection`
- `EvidenceMarker`
- `Signal`
- `TrendSeries`
- `EventMarker`
- `HeatmapDay`
- `PlatformGapRow`
- `DemoDataset`

## Contrast Matrix

F-007 must implement a machine-checkable contrast test using the F-006 token values.

| Pair | Foreground | Background | Minimum |
| --- | --- | --- | ---: |
| primary text on surface | `--color-ink` | `--color-surface` | 4.5 |
| primary text on app background | `--color-ink` | `--color-bg` | 4.5 |
| muted text on surface | `--color-muted` | `--color-surface` | 4.5 |
| primary action text | white | `--color-teal` | 4.5 |
| risk text | `--color-red` | `--color-risk-bg` | 4.5 |
| white text on red | white | `--color-red` | 4.5 |
| white text on green | white | `--color-green` | 4.5 |
| white text on violet | white | `--color-violet` | 4.5 |
| focus ring against surface | `--color-focus` | `--color-surface` | 3.0 |
| status chip text | `--color-ink` | warning/risk/success/info backgrounds | 4.5 |

Rules:

- `--color-amber` and `--color-blue` may be used for charts, icons, dividers, and non-text visual encoding.
- Do not place white body text on `--color-amber`.
- Do not place normal-size body text in `--color-green`, `--color-blue`, or `--color-amber` on pale status backgrounds.

## Visible Copy Gate

The forbidden-copy gate must scan customer-visible rendered text, not every source file.

Forbidden in rendered UI text:

- `自动调价`
- `自动改价`
- `爬虫`
- `抓取`
- `cookie`
- `验证码`
- `token`

Scope rule:

- The word `token` is allowed in design-token implementation files, tests, docs, and developer-only comments.
- The word `token` is not allowed in rendered customer-facing DOM text.

Required visible wording:

- fixture/demo data surfaces must show a clear demo/source marker;
- pricing-sensitive insight surfaces must show `需人工复核`;
- evidence drawer must show source, capture time, room type, platform/source, tax/fee basis, sample size, and confidence.

## Screenshot Matrix

Generator must produce the F-006 screenshot artifacts exactly under:

`docs/test-reports/f-007-app-foundation/`

Required files:

- `overview-normal--1440x900.png`
- `overview-loading--1440x900.png`
- `overview-empty--1440x900.png`
- `overview-normal--390x844.png`
- `calendar-detail-open--1440x900.png`
- `calendar-detail-open--390x844.png`
- `market-comparison-platform-bars--1440x900.png`
- `market-comparison-platform-bars--390x844.png`
- `alert-review-drawer-open--1440x900.png`
- `alert-review-drawer-open--390x844.png`
- `setup-data-scope--1280x800.png`
- `setup-data-scope--768x1024.png`

## Repository Gate

Formal coding must not start while `git status --short` fails. Before Generator edits product files, the workspace must be a Git repository on a non-main feature branch suitable for PR-only workflow.

Allowed readiness outcomes:

- attach this directory to the intended repository and create `feature/f-007-formal-app-foundation`;
- or initialize a new repository only after explicit owner approval, set the expected remote, and create `feature/f-007-formal-app-foundation`.

## Out Of Scope

- live OTA data;
- channel manager/PMS integrations;
- authentication and user management;
- database persistence;
- production deployment;
- billing;
- automatic pricing or automatic rate changes;
- replacing F-001 domain modeling.

## Acceptance Criteria

1. Repository readiness is resolved before Generator product-code edits begin.
2. React + TypeScript + Vite app foundation exists with tokenized CSS and typed fixture contracts.
3. F-006 token values are implemented exactly and verified by tests.
4. Contrast matrix has automated coverage with WCAG thresholds.
5. Visible-copy gate scans rendered/customer-facing text and avoids false positives in token docs/tests.
6. App shell, context ribbon, signal panels, evidence drawer, and chart primitives satisfy F-006 props/states/responsive/accessibility contracts.
7. Five formal screens render fixture/demo data with property, room type, platform, date, source, sample, and human-review context.
8. Missing chart data renders as unavailable/gap state, not zero.
9. Required screenshots are generated with the exact file names and viewports from the F-006 contract.
10. Verification commands pass except for no allowed warnings beyond documented environment limitations.

## Generator Handoff

Use `docs/superpowers/plans/2026-05-19-formal-app-foundation.md`.

Generator must use `superpowers:test-driven-development`: write fail-first tests, verify red, implement the minimum app foundation, verify green, and only then refactor.

## Evaluator Handoff

Evaluator must use `superpowers:verification-before-completion` and independently verify:

- fresh Git readiness evidence;
- token exactness;
- contrast thresholds;
- visible-copy gate scope;
- primitive behavior;
- chart nonblank and missing-data behavior;
- screenshot completeness and visual quality;
- no live data collection or automatic pricing claims.
