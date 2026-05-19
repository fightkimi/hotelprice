# F-005 Premium Product Experience System And App Foundation Spec

## Role And Source Context

- Planner role: non-implementation. This spec turns the F-004 conditional baseline into an executable formal-development entry point.
- Trigger: F-004 Evaluator accepted the baseline conditionally, but found visual gates too directional and not operational enough.
- User feedback on 2026-05-19: the design philosophy still does not feel strong enough; formal development needs a more tasteful, concrete design upgrade before production UI work begins.
- Design skills applied:
  - `brand-guidelines`: used for disciplined token thinking, typography hierarchy, and restrained accent systems. The product is not branded as OpenAI.
  - `deslop`: used as an anti-slop quality lens to avoid generic AI SaaS visuals, unnecessary decorative complexity, and vague "premium" language.
  - `canvas-design`: used only for visual-philosophy framing. No PNG/PDF artifact is produced in this Planner pass.
- Related artifacts:
  - `docs/test-reports/2026-05-19-f-004-formal-design-philosophy-roadmap-evaluator.md`
  - `docs/test-reports/2026-05-18-investor-demo-desktop-overview.png`
  - `docs/specs/2026-05-19-formal-product-design-philosophy-roadmap.md`

## Problem Statement

The current prototype has useful product signals, but it still feels like a dense internal admin page. Formal development needs a stronger visual and interaction philosophy before any production app shell is built. The next step is not "make the prototype prettier"; it is to establish a product experience system that makes every future screen feel deliberate, calm, data-rich, and credible.

## Product Design Movement: Quiet Yield

Quiet Yield is the visual philosophy for this product: a calm operating console for revenue-sensitive decisions. It should feel closer to a boutique financial terminal for hotel operators than a generic SaaS dashboard. The interface must communicate discipline, evidence, and control without becoming cold or intimidating.

The design should use restraint as a mark of confidence. Space is not emptiness; it is a decision aid. The most important movement, risk, and opportunity signals should emerge through chart rhythm, density shifts, and precise contrast rather than loud color. Every line, label, and surface should feel deliberately placed.

Charts are the native language of the product. Tables remain available as evidence, but the first read must come from trend, variance, gap, confidence, and event impact. Good screens should answer "what changed and why does it matter?" before the user starts reading rows.

The product should not look like a scraped-data control panel. It should make data provenance visible without foregrounding technical plumbing. Source, capture time, room type, platform, tax/fee basis, sample size, and human review status should appear as quiet evidence markers.

Craft matters. The final product should look as if an expert team tuned spacing, type, charts, and states over many passes. No generic card grids, no decorative gradient blobs, no crude default tables, no stock admin template feel.

## Formal Visual Identity Direction

### Tone

- Calm, exact, operational.
- Premium but not luxurious.
- Analytical but not hostile.
- Investor-credible and operator-useful.

### Color Tokens

Use semantic color, not decorative color.

- `ink`: near-black text for primary decisions.
- `graphite`: secondary text and chart axes.
- `fog`: page background.
- `paper`: primary surface.
- `line`: subtle dividers.
- `teal`: attention/opportunity accent.
- `blue`: platform/source comparison accent.
- `amber`: holiday/event lift accent.
- `red`: risk or overpricing warning.
- `green`: price decrease or softness.
- `violet`: room-type comparison accent, used sparingly.

Acceptance rule: no screen may be dominated by one hue family. Teal can lead the brand, but blue, amber, red, green, and neutrals must carry distinct data meanings.

### Typography Tokens

- UI font: system sans with Inter/PingFang/Arial fallback.
- Numeric font behavior: tabular numerals for prices, percentages, and dates.
- Suggested scale:
  - page title: 28/34
  - section title: 18/24
  - body: 14/20
  - metadata: 12/17
  - KPI numeric: 30/34
- Letter spacing: 0.
- No hero-scale typography inside the product workspace.

### Layout Tokens

- Base grid: 12-column desktop, 8-column tablet, single-column mobile.
- Spacing: 4, 8, 12, 16, 24, 32.
- Radius: 8px for panels and controls, 999px only for pills/badges.
- Borders: subtle and purposeful; avoid stacking borders inside borders.
- Minimum chart height: 220px desktop, 180px mobile.
- Controls must have stable dimensions and cannot resize layout on active state.

## Production Information Architecture

1. Morning Brief / Overview
   - "What changed since the last capture?"
   - "Which dates deserve attention?"
   - "What evidence supports this?"

2. Price Calendar
   - Heatmap of stay dates, demand events, and pricing lift.
   - Date detail side panel.

3. Market Comparison
   - Competitor, room type, and platform comparison.
   - Cross-platform price gap view.

4. Alert Review
   - Grouped by decision category, not raw trigger type.
   - Every alert has evidence and human-review status.

5. Setup And Data Scope
   - Property, competitor set, room type, platform/source, cadence, and caveats.

6. Reports / Digest, later phase
   - Weekly operating summary and export.

## Design Primitives For Formal Development

### Layout Primitives

- `AppShell`: top-level app frame with persistent context ribbon.
- `ContextRibbon`: property, room type, platform, date range, competitor group, demand context.
- `SignalPanel`: high-level decision signal with evidence markers.
- `EvidenceDrawer`: drill-down panel for source, sample, and rule rationale.
- `SplitWorkspace`: chart-led main area plus secondary evidence column.
- `DataDensityToggle`: compact/comfortable view without changing information hierarchy.

### Chart Primitives

- `TrendChart`: owner rate, core average, event lift, and selected context.
- `CalendarHeatmap`: stay-date cells with event and price movement intensity.
- `PlatformGapBars`: horizontal bars for platform price spread.
- `Sparkline`: compact row-level trend.
- `EventTimeline`: holiday, exhibition, concert, weekend, normal day annotations.
- `ConfidenceBand`: sample size and data quality indicator.

### Data Evidence Primitives

- `SourceBadge`: platform/source and demo/live/approved status.
- `CaptureTime`: last successful capture time.
- `RateKeyPill`: room type, occupancy, cancellation, meal plan, tax/fee basis.
- `SampleMarker`: sample size and unavailable-source status.
- `HumanReviewMarker`: "需人工复核" status.

## Visual Pass/Fail Gates

F-005 and all future front-end work must include these gates:

### Viewport Matrix

- Desktop: 1440x900
- Desktop narrow: 1280x800
- Tablet: 768x1024
- Mobile: 390x844

### Screenshot Matrix

At minimum:

- overview / morning brief
- price calendar with date detail
- market comparison with platform bars
- alert review with evidence drawer
- setup/data scope

### Pass Criteria

- No text overlap or clipped controls.
- Charts are nonblank and visually framed.
- Axis/legend/event labels remain readable.
- Primary action and primary insight are visible above the fold on desktop.
- On mobile, context controls wrap into a readable stacked layout.
- No nested card stacks.
- No decorative gradient blobs or stock hero patterns.
- Tables do not dominate the first read when charts are present.
- Copy uses "建议关注" and "需人工复核", not automatic pricing language.
- Data provenance markers are visible on all analytical screens.

### Automated/Scripted Checks To Add Later

- Screenshot existence and dimensions.
- Canvas/SVG/chart nonblank pixel or DOM checks.
- No forbidden terms in customer-facing files.
- No fetch/network collection code in demo mode.
- Color token usage lint for semantic names.
- Basic accessibility checks for buttons, labels, focus states, and contrast.

## Formal Development Plan

### Gate 0: Close Or Supersede Prototype Evaluation

Before Generator starts formal app code:

- F-003 must receive a final Evaluator verdict, or its findings must be explicitly superseded by F-005.
- F-004 conditional findings must be carried forward.
- Known F-001 precheck P1 issues must be inherited into domain-core planning:
  - unavailable-source modeling;
  - `hotel_id + rate_key` isolation for competitor movement.

### Gate 1: Repository Readiness

The project currently is not a git repository. PR-only workflow cannot be real until this is fixed.

Before production coding:

- initialize or attach the project to a git repository;
- create a non-main feature branch;
- confirm `git status --short` works;
- preserve existing files.

### F-005: Product Experience System And App Foundation

Recommended formal coding slice:

- establish app shell;
- add design tokens;
- build layout primitives;
- build chart primitives;
- add fixture/demo data mode;
- add test harness;
- add screenshot verification matrix.

### F-006: Rate Monitoring Domain Core

- implement hotel, competitor, room type, platform/source, rate key, snapshot, unavailable-source, and alert domain models;
- resolve F-001 precheck P1 findings;
- keep scraping/live collection out of scope.

### F-007: First Product Vertical Slice

- morning brief;
- price calendar;
- market comparison;
- alert review;
- setup/data scope;
- demo/fixture data integration.

### F-008: Compliant Data Source Strategy

- official API/partner feed exploration;
- PMS/channel manager options;
- manual import fallback;
- legal/rate-limit/commercial risk review.

## Non-Goals

- Do not polish the old prototype into production code.
- Do not begin production UI before F-005 design tokens and visual gates exist.
- Do not use a generic admin template.
- Do not rely on live OTA scraping to make the product feel real.
- Do not add automatic price changes.

## Acceptance Criteria

1. The product has a named design movement and concrete visual principles.
2. Design tokens are specific enough for F-005 implementation planning.
3. Layout, chart, and evidence primitives are defined.
4. Screenshot and viewport gates are explicit.
5. F-004 Evaluator P1/P2 findings are carried forward.
6. F-001 data-boundary P1 risks are explicitly inherited into the formal roadmap.
7. Repository readiness is called out as a blocker before PR-based formal coding.
8. The roadmap clearly separates design system foundation, domain core, product vertical slice, and data-source strategy.

## Generator Handoff Summary

Generator should not start coding from this spec alone. After Evaluator accepts F-005 planning, Generator should implement the app foundation from `docs/superpowers/plans/2026-05-19-premium-product-experience-system.md`, beginning with failing tests and visual verification scaffolding.

## Evaluator Handoff Summary

Evaluator should verify whether this spec is concrete enough to start production app foundation planning and whether it resolves the weaknesses called out in the F-004 report.
