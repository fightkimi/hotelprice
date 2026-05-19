# F-004 Formal Product Design Philosophy And Roadmap Spec

## Role And Source Context

- Planner role: non-implementation. This spec defines the next formal development plan and design philosophy baseline.
- Current prototype: `prototypes/client-demo/index.html`
- Current status: `F-003-investor-demo-prototype-enhancement` is in verification.
- User feedback on 2026-05-19: the prototype visual and interaction design are still not good enough; formal development should include a design philosophy upgrade.
- Superpowers order used for this Planner pass: brainstorming, writing-plans, executing-plans, test-driven-development, verification-before-completion.

## Problem Statement

The prototype has enough functional signals to discuss the product, but the visual and interaction direction still feels like an engineered dashboard rather than a mature product. If formal development starts from the current prototype style, the team will likely carry rough layout, weak hierarchy, and inconsistent data visualization into the production app. Before coding the formal application, the project needs a product design philosophy, interaction model, visual system, chart language, and development sequence.

## Current Project Facts

- `F-001` defines the compliance-safe rate monitoring core.
- `F-002` produced a static customer demo prototype.
- `F-003` enhanced the prototype with room types, platforms, holiday/event trends, and premium chart requirements.
- Screenshot review of `docs/test-reports/2026-05-18-investor-demo-desktop-overview.png` shows stronger data coverage, but the UI still reads as a dense admin surface with limited product personality.
- The workspace is still not a git repository, so branch/PR workflow is blocked until repository setup is handled.

## Design Philosophy Upgrade

### Product Metaphor

Move from "price monitor" to "market command center for small hotel operators."

The product should not feel like a scraper dashboard. It should feel like a calm operating console that answers:

- What changed?
- Why might it matter?
- Which date, room type, platform, or competitor should I review?
- What evidence supports the signal?
- What still requires human judgment?

### Core Experience Principles

1. Decision before data.
   Every screen should lead with the operational decision, then show supporting evidence.

2. Calm intelligence over alert noise.
   Alerts should be prioritized, grouped, and explained. The UI should not create panic.

3. Evidence over magic.
   Every insight must show source, capture time, sample size, room type, platform, and confidence/demo caveat.

4. Chart first, table second.
   Charts should reveal trends, spikes, gaps, and event lift before users inspect rows.

5. Context is a first-class control.
   Room type, platform, date range, demand event, and competitor set should be persistent controls, not hidden filters.

6. Human-in-the-loop pricing.
   The product may suggest attention, but should not imply automatic price changes without approval.

7. Dense but elegant.
   The target user is operational, so the UI should be scan-friendly and compact, but spacing, typography, and hierarchy must feel intentional.

8. Investor-grade credibility.
   The product should visually communicate data coverage, scalability, and market intelligence without becoming a marketing landing page.

## Formal Product UX Direction

### Information Architecture

Recommended production IA:

- Overview command center
- Price calendar and event trends
- Competitor monitor
- Platform and room-type comparison
- Alert center
- Setup and data-source configuration
- Reports and weekly digest, later phase

### Persistent Context Controls

The formal app should keep these controls visible near the top of analysis surfaces:

- property/hotel selector;
- room type;
- platform/source;
- date range;
- competitor group;
- demand context, such as holiday, weekend, event, or normal day.

### Visual System Direction

- Use a restrained light interface with layered neutral surfaces.
- Use color for meaning only: up, down, event, warning, sample/data caveat.
- Avoid decorative gradients, blobs, hero layouts, and one-note palettes.
- Use compact 8px-radius panels and controls.
- Use small multiples, heatmaps, sparklines, line charts, and bar comparisons as native product language.
- Keep tables, but use them as drill-down evidence rather than the main experience.

### Interaction Model

- Start from a top-level signal, then drill into date, competitor, room type, and source evidence.
- Use linked interactions: selecting a date should update trend, competitor rows, and alerts.
- Use drawer or side panel details for evidence, not modal-heavy workflows.
- Keep destructive or pricing actions out of the prototype until a future explicit approval flow is designed.

## Proposed Development Sequence

### Phase 0: Finish Prototype Evaluation

- Complete Evaluator review for `F-003`.
- Collect design debt findings from screenshots and interaction checks.
- Decide which prototype ideas are worth carrying into the formal product.

### Phase 1: Establish Design Philosophy And UX System

Feature: `F-004-formal-design-philosophy-roadmap`

Deliver:

- product design philosophy;
- production IA;
- interaction model;
- visual system direction;
- chart and data visualization rules;
- design acceptance gates for future Generator/Evaluator sessions.

### Phase 2: Formal Product App Foundation

Future feature candidate: `F-005-product-app-foundation`

Deliver:

- formal app shell;
- design tokens;
- reusable layout primitives;
- chart primitives;
- responsive shell;
- test and screenshot verification harness.

This should be done before moving prototype UI into production app code.

### Phase 3: Domain Core And Demo Data Integration

Future feature candidate: `F-006-rate-monitoring-domain-core`

Deliver:

- owner hotel and competitor model;
- room type/platform/date/source contracts;
- fixture/manual data source;
- alert calculation and comparison boundaries.

This can reuse or supersede the existing `F-001` plan.

### Phase 4: First Vertical Product Slice

Future feature candidate: `F-007-rate-watch-command-center`

Deliver:

- overview command center;
- price calendar;
- competitor detail;
- alert center;
- demo/fixture data integration;
- no live scraping.

### Phase 5: Compliant Data Source Exploration

Future feature candidate: `F-008-compliant-source-strategy`

Deliver:

- official API or partner feed options;
- channel manager/PMS integration options;
- manual import fallback;
- compliance and rate-limit boundaries.

## Non-Goals

- Do not start formal app coding until F-004 design and acceptance gates are agreed.
- Do not treat the current prototype CSS as the production design system.
- Do not add live OTA scraping to solve demo realism.
- Do not introduce automatic price changes.
- Do not let investment polish remove operational clarity.

## Acceptance Criteria

1. A formal design philosophy exists and can guide future UI decisions.
2. The formal development roadmap explicitly separates prototype validation, design-system foundation, domain core, vertical slice, and data-source strategy.
3. Future front-end tasks include visual quality gates, not only functional tests.
4. The plan calls out current prototype design debt and prevents direct production reuse of rough prototype UI.
5. The roadmap preserves hotel pricing data boundaries: room type, platform, date, source, currency, tax/fee basis, sample size, and human review.
6. Generator and Evaluator handoffs include screenshot-based visual verification for formal UI work.

## Generator Handoff Summary

Generator should not yet start formal app implementation from the current prototype. The next Generator-ready coding feature should be created after F-004 is accepted, likely `F-005-product-app-foundation`.

## Evaluator Handoff Summary

Evaluator should treat F-004 as a planning baseline: review whether the design philosophy and roadmap are specific enough to prevent rough prototype patterns from leaking into formal development.
