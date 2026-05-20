# F-012 Production Revenue Observatory Visual Upgrade Spec

## Role And Source Context

- Planner role: non-implementation.
- Branch: `feature/f-012-production-revenue-observatory-visual-upgrade-planning`.
- Selected route: Option A, global Revenue Observatory visual system upgrade without changing business semantics.
- Baseline UI: F-007 formal app foundation.
- Baseline domain core and data flow: F-008, F-009, F-010, and F-011.
- F-011 status: accepted for product behavior and data-boundary coverage, with PR preparation still dependent on resolving the F-010/F-011 branch base.
- Design source: F-006 production UI contract, F-005 Quiet Yield philosophy, and F-011 Revenue Observatory setup-surface migration.
- Superpowers order used for this Planner pass: brainstorming, writing-plans, executing-plans, test-driven-development, verification-before-completion.

## Problem Statement

The formal React app now has credible domain contracts, human-review alert boundaries, owner-position evidence, and a typed data-scope/capture-entry preview. F-011 also proved that the Revenue Observatory visual language works on the Setup/Data Scope surface.

The rest of the formal app still reads closer to the earlier app foundation: useful, disciplined, and testable, but not yet as complete or investment-grade as the current product story requires. Overview, Calendar, Market Comparison, Alert Review, and Setup/Data Scope should feel like one cohesive revenue observatory, not a mixture of early foundation screens and one polished setup screen.

F-012 upgrades the global visual system of the formal app while explicitly preserving all accepted product semantics. It is a visual-system and interaction-polish slice, not a data-model, alert-math, collection, persistence, or pricing-decision slice.

## Feature Slice

Feature id: `F-012-production-revenue-observatory-visual-upgrade`

Upgrade the formal app's global presentation layer:

1. Extend the token layer with Revenue Observatory shell, panel, chart, rail, and insight-surface tokens.
2. Apply a wide observatory shell to the app frame so 2K desktop viewports no longer feel like a small centered card.
3. Introduce shared visual primitives through CSS classes and existing React structure: observatory panel, instrument header, signal rail, metric lattice, insight rail, chart frame, and responsive stack rules.
4. Upgrade Overview, Calendar, Market Comparison, Alert Review, and Setup/Data Scope into one consistent visual system.
5. Upgrade chart presentation for trend, calendar heatmap, platform bars, and event timeline without changing chart input schemas or domain-derived data.
6. Add hard visual gates for desktop wide, desktop standard, and mobile viewports.

## Domain Classification

- Affected domains: reporting UI, chart visualization, alert review presentation, setup/data-scope presentation.
- Data binding: unchanged. The app must preserve property, competitor group, platform/source, stay date, room type, occupancy, meal plan, cancellation policy, tax/fee basis, currency, capture time, freshness, evidence, and human-review boundaries already established by F-008 through F-011.
- Data type: fixture/manual demo data only.
- Capture method: unchanged. No live OTA collection, browser automation, approved API implementation, file upload, persistence, backend route, queue, or scheduled job.
- Pricing automation: unchanged. F-012 must not introduce recommended prices, automatic pricing, automatic rate edits, or action copy that implies autopilot behavior.

## Visual Direction

F-012 should make the formal app feel like an operational revenue observatory:

- calm wide canvas with visible analytical structure;
- darker executive/instrument surfaces used sparingly for orientation;
- precise grid texture and signal rails as product structure, not decoration;
- glass-like analytical panels built through tokens, not ad hoc raw colors;
- chart-led reading order before tables;
- denser but more controlled KPI and evidence hierarchy;
- investor-grade polish while retaining operator usability.

The implementation must not copy old H5 CSS directly. Generator should translate the visual language into the existing formal app token and component structure.

## Required Visual Contracts

### Token Layer

Add or normalize token-layer variables for:

- observatory shell max width and background;
- glass panel surface, border, shadow, and inset line;
- instrument header surface;
- signal rail gradient;
- chart frame surface and grid line;
- insight rail surface;
- event copper, cyan signal, and blue signal accents.

All raw `rgba(...)`, gradients, and hex colors used by F-012 must live in `app/src/styles/tokens.css`. `app/src/styles/layout.css` must continue to use variables instead of raw color functions.

### App Shell

The top-level shell must expose `data-visual-system="revenue-observatory"` and use a wide workspace:

- desktop wide: target shell max width `2000px`;
- desktop standard: still readable at `1440x900`;
- tablet/mobile: no horizontal overflow and controls wrap cleanly.

Header treatment should gain an instrument identity and signal rail, while preserving existing title, subtitle, navigation labels, and focusable nav buttons.

### Shared Visual Primitives

Generator should implement these as class-level primitives, reusing current components where possible:

- `observatory-panel`: elevated analytical panel;
- `instrument-header`: compact title/meta/status region;
- `signal-rail`: thin visual rail for capture or context signal;
- `metric-lattice`: grid for KPI and signal cards;
- `insight-rail`: secondary analytical column;
- `chart-frame`: chart container with controlled grid texture;
- `observatory-screen`: page-level visual system wrapper.

These primitives must not require new business props or data contracts.

### Five-Screen Coverage

F-012 must cover:

- Overview: signal cards, trend chart, and event timeline use metric lattice and chart frame treatment.
- Calendar: heatmap and date detail become a chart-led split workspace with an insight rail.
- Market Comparison: platform bars and platform context panel share the same chart frame and insight rail language.
- Alert Review: alert list and evidence drawer use the observatory panel treatment while preserving all human-review and evidence markers.
- Setup/Data Scope: retain and refine the F-011 Revenue Observatory treatment without changing F-011 data/capture semantics.

### Chart Visual Upgrade

Chart components must keep their current schemas and safety behavior:

- `TrendChart`: preserve missing-data gaps, event markers, legend, and `data-testid="trend-segment"` checks.
- `CalendarHeatmap`: preserve unavailable state as non-zero, selected-day visibility, and grid role.
- `PlatformGapBars`: preserve proportional bars, zero-gap marker, direction semantics, and coverage.
- `EventTimeline`: preserve event type labels, confidence wording, and human-review-only framing.

The upgrade is visual: frame, hierarchy, axis/grid polish, density, spacing, and responsive behavior.

## In Scope

- CSS token additions in `tokens.css`.
- CSS class additions and responsive rules in `layout.css`.
- Minimal JSX class/structure changes to existing layout, screen, primitive, and chart components.
- Tests that prove the global Revenue Observatory structure exists across all five screens.
- Tests that prove chart primitives still expose nonblank elements and missing/unavailable semantics.
- Playwright screenshot matrix updates for `2048x1352`, `1440x900`, and `390x844`.
- Safety scans for visible copy and touched source paths.
- Generator notes with TDD red/green evidence.

## Out Of Scope

- Domain alert math changes.
- `DemoDataset` semantic changes.
- F-008/F-009/F-010/F-011 data contract changes unless a failing visual integration test reveals a narrow type incompatibility.
- Real OTA collection.
- Browser automation for source collection.
- Credentials, cookies, CAPTCHA, API keys, source login, local storage, or session storage.
- Backend APIs, persistence, queues, migrations, file upload, or imports.
- Automatic pricing, recommended new prices, or automatic rate changes.
- New chart libraries or new dependencies.
- Final acceptance by Generator.

## Acceptance Criteria

1. App shell exposes the Revenue Observatory visual system globally and keeps all nav/context controls accessible.
2. Token contract includes measurable Revenue Observatory tokens, and layout CSS does not introduce raw color functions.
3. Overview, Calendar, Market, Alerts, and Setup screens each expose observatory visual primitives.
4. Chart components preserve their existing input schemas and missing/unavailable data semantics.
5. Overview, Calendar, Market, Alerts, and Setup screenshots exist for the required matrix and match exact viewport dimensions.
6. `2048x1352` desktop screenshots show a wide observatory canvas rather than a narrow centered app.
7. `390x844` mobile screenshots have no horizontal overflow, clipped controls, unreadable chart labels, or incoherent overlap.
8. Visible copy keeps fixture/demo and human-review framing and does not include forbidden collection, credential, CAPTCHA, storage, recommended-price, or automatic-pricing language.
9. Existing F-008/F-009/F-010/F-011 domain, data-flow, and setup tests continue to pass.
10. No new dependencies, backend routes, persistence, real collection, or pricing automation are introduced.

## Generator Handoff

Use `docs/superpowers/plans/2026-05-20-production-revenue-observatory-visual-upgrade.md`.

Generator must use strict `superpowers:test-driven-development`: write failing visual contract and screenshot matrix tests first, verify red, implement the minimum token/class/JSX/CSS changes, verify green, then run full app verification and safety scans. Generator must not alter business semantics or data contracts to make visual tests pass.

## Evaluator Handoff

Evaluator must independently verify:

- global visual coverage across all five screens;
- screenshot dimensions and no horizontal overflow;
- chart nonblank behavior and missing/unavailable preservation;
- no unsafe visible copy or source-code terms;
- no live collection, persistence, credential handling, or automatic pricing;
- PR diff bounded to F-012 visual-system work after F-010/F-011 dependencies are resolved.
