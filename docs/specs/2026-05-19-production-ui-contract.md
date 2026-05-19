# F-006 Production UI Contract And Generator-Ready App Foundation Spec

## Role And Source Context

- Planner role: non-implementation. This spec converts F-005 into a concrete production UI contract.
- Trigger: F-005 Evaluator accepted the premium experience baseline but found it insufficient for direct Generator coding.
- Source report: `docs/test-reports/2026-05-19-f-005-premium-product-experience-system-evaluator.md`
- Related baseline: `docs/specs/2026-05-19-premium-product-experience-system.md`
- Superpowers order used for this Planner pass: brainstorming, writing-plans, executing-plans, test-driven-development, verification-before-completion.

## Problem Statement

F-005 defines a strong visual direction, but it still leaves too much room for Generator interpretation. Before formal app foundation coding starts, the project needs a production UI contract with concrete token values, primitive APIs, chart schemas, screenshot artifact naming, required UI states, and hard pass/fail gates.

This F-006 contract is the missing bridge between design philosophy and implementation.

## Required Status Changes

- F-005 should be treated as `done` with the Evaluator report attached.
- F-006 becomes the active Planner slice.
- Generator must not start formal app coding until F-006 is accepted.
- Git repository readiness remains a blocking prerequisite for PR-based coding.

## Concrete Design Tokens

F-007 app foundation must implement these tokens as CSS variables or framework-equivalent design tokens.

### Color Tokens

| Token | Value | Use | Contrast Rule |
| --- | --- | --- | --- |
| `--color-bg` | `#EEF3F2` | app background | text not placed directly except muted labels |
| `--color-surface` | `#FFFFFF` | primary panels | `--color-ink` text passes 12px+ |
| `--color-surface-raised` | `#F8FAF9` | secondary panels | `--color-ink` text passes 12px+ |
| `--color-ink` | `#17211D` | primary text | on surface/bg only |
| `--color-muted` | `#66736E` | secondary text | not below 12px |
| `--color-line` | `#D9E2DF` | dividers/borders | non-text only |
| `--color-teal` | `#087E78` | opportunity/primary accent | white text only at 14px semibold+ |
| `--color-blue` | `#2D7FA6` | platform/source series | chart/legend |
| `--color-amber` | `#B8751A` | event lift/holiday | chart/legend |
| `--color-red` | `#B54848` | risk/upward pressure | chart/legend or warning |
| `--color-green` | `#2F7D4F` | price softness/downward pressure | chart/legend |
| `--color-violet` | `#6857A8` | room-type comparison | chart/legend |
| `--color-focus` | `#0A6CFF` | focus ring | visible 2px outline |
| `--color-disabled-bg` | `#EDF1EF` | disabled controls | noninteractive state |
| `--color-disabled-text` | `#8A9691` | disabled labels | no critical info |

### State Tokens

- Hover surface: `#F2F6F4`
- Active surface: `#E0F2EE`
- Selected border: `#087E78`
- Warning background: `#FFF4E2`
- Risk background: `#FDECEC`
- Success/softness background: `#E8F3EC`
- Info background: `#EAF2F7`

### Typography Tokens

| Token | Size/Line | Weight | Use |
| --- | ---: | ---: | --- |
| `--font-title` | 28/34 | 700 | page title |
| `--font-section` | 18/24 | 700 | section headings |
| `--font-body` | 14/20 | 400 | body/table text |
| `--font-meta` | 12/17 | 400 | metadata/evidence markers |
| `--font-kpi` | 30/34 | 700 | primary numbers |
| `--font-tabular` | inherit | 600 | prices/percentages/dates with tabular numerals |

Rules:

- `letter-spacing: 0`.
- Use `font-variant-numeric: tabular-nums` for prices, percentages, dates, and axes.
- No hero-scale typography inside product workspace.

### Layout Tokens

- Spacing scale: `4, 8, 12, 16, 24, 32, 48`.
- Radius: `8px` panels/controls, `999px` pills only.
- Border width: `1px`.
- App max width: `1440px`.
- Desktop grid: 12 columns, 24px gutter.
- Tablet grid: 8 columns, 16px gutter.
- Mobile grid: 1 column, 12px gutter.
- Chart minimum height: 220px desktop, 180px mobile.
- Sticky context ribbon height target: 64px desktop, auto-wrap on mobile.

## Primitive Contracts

### `AppShell`

Required props:

- `title`
- `propertyName`
- `activeNav`
- `navItems`
- `context`

States:

- loading context
- normal
- data caveat visible

Rules:

- persistent context ribbon must remain visible above analytical content;
- nav active state must be keyboard focusable and visibly selected.

### `ContextRibbon`

Required props:

- `property`
- `roomType`
- `platform`
- `dateRange`
- `competitorGroup`
- `demandContext`
- `sourceKind`
- `captureTime`

Responsive behavior:

- desktop: one row, grouped controls;
- tablet: two rows;
- mobile: stacked controls, no horizontal overflow.

Accessibility:

- each selector must have a visible label;
- keyboard focus ring uses `--color-focus`;
- disabled selectors remain readable but noninteractive.

### `SignalPanel`

Required props:

- `title`
- `primaryMetric`
- `metricUnit`
- `summary`
- `severity`
- `evidenceMarkers`
- optional `sparklineSeries`

States:

- normal
- warning
- risk
- no comparable sample
- loading

Rules:

- must show at least one evidence marker when not loading;
- cannot present an action as automatic pricing.

### `EvidenceDrawer`

Required props:

- `heading`
- `rateKey`
- `source`
- `captureTime`
- `sampleSize`
- `confidence`
- `rationale`
- `humanReviewRequired`

States:

- closed
- open
- loading
- unavailable source
- no comparable sample

Rules:

- must show room type, platform/source, tax/fee basis, and sample size;
- must include `需人工复核` for pricing-sensitive insight.

### `TrendChart`

Input schema:

```json
{
  "series": [
    {"id": "owner", "label": "本酒店价", "colorToken": "--color-teal", "points": [{"date": "2026-05-30", "value": 428}]},
    {"id": "coreAverage", "label": "核心竞品均价", "colorToken": "--color-violet", "points": [{"date": "2026-05-30", "value": 497}]}
  ],
  "events": [
    {"date": "2026-05-31", "label": "端午演示假期", "type": "holiday", "lift": 32}
  ],
  "yAxisUnit": "CNY",
  "sampleSize": 10
}
```

Rules:

- missing value renders a gap, not zero;
- legend must map series color to label;
- mobile shows fewer x-axis labels and preserves event markers;
- nonblank check: at least one visible path/polyline/line segment when any series has two or more values.

### `CalendarHeatmap`

Input schema:

```json
{
  "days": [
    {
      "date": "2026-05-31",
      "label": "5/31",
      "intensity": 0.82,
      "coreAverage": 497,
      "ownerRate": 428,
      "eventLabel": "端午演示假期",
      "sampleSize": 10,
      "status": "event-lift"
    }
  ]
}
```

Rules:

- intensity clamps between 0 and 1;
- unavailable day uses neutral hatch/empty state;
- selected day must remain visible independent of intensity color;
- mobile grid uses 2 columns or single-column list if labels would overlap.

### `PlatformGapBars`

Input schema:

```json
{
  "rows": [
    {"platform": "携程演示源", "ownerRate": 428, "coreAverage": 497, "gap": 69, "coverage": 0.92}
  ],
  "maxGap": 98,
  "unit": "CNY"
}
```

Rules:

- bar width is proportional to absolute gap against `maxGap`;
- negative/positive gap uses semantic color tokens;
- row must display coverage percentage;
- zero gap still displays a minimum visual marker and numeric `CNY 0`.

### `EventTimeline`

Input schema:

```json
{
  "events": [
    {"date": "2026-05-31", "label": "端午演示假期", "type": "holiday", "lift": 32, "confidence": "sample"}
  ]
}
```

Rules:

- event type maps to semantic color;
- confidence/sample marker must render;
- mobile stacks events vertically.

## Screenshot Contract

Screenshots must be written under `docs/test-reports/f-007-app-foundation/`.

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

Each screenshot must include:

- visible context ribbon;
- demo/source marker when using fixture data;
- no overlapping labels;
- no clipped controls;
- at least one evidence marker on analytical screens.

## Hard Pass/Fail Gates

F-007 Generator output must fail review if any of these occur:

- token values are absent or hard-coded outside the token layer;
- context controls lack labels or focus state;
- chart renders blank with valid data;
- missing data is rendered as zero without explicit unavailable marker;
- screenshots are missing from the required list;
- any required viewport has horizontal page overflow over 8px;
- customer-facing text includes `自动调价`, `自动改价`, `爬虫`, `抓取`, `token`, `cookie`, or `验证码`;
- pricing insights lack source, capture time, room type/platform context, sample size, or human-review marker;
- prototype CSS is copied directly as the production stylesheet without tokenization and primitive boundaries.

## F-007 Generator-Ready Feature Shape

The next coding feature should be `F-007-formal-app-foundation`.

Minimum implementation scope:

- choose/initialize frontend stack after repository readiness is solved;
- implement token layer;
- implement `AppShell`, `ContextRibbon`, `SignalPanel`, `EvidenceDrawer`;
- implement `TrendChart`, `CalendarHeatmap`, `PlatformGapBars`, `EventTimeline`;
- implement fixture/demo data mode only;
- implement screenshot and contract verification scripts;
- render five formal app screens using fixture data:
  - overview;
  - calendar;
  - market comparison;
  - alert review;
  - setup/data scope.

Out of scope:

- live OTA data;
- authentication;
- database persistence;
- automatic pricing;
- billing;
- production deployment.

## Carryover Risks

- F-003 remains `verifying`; formal app can supersede its design findings only after Evaluator accepts this F-006 contract.
- F-001 precheck P1 issues must be resolved in domain-core planning:
  - unavailable-source modeling;
  - `hotel_id + rate_key` isolation for competitor movement.
- Git repository readiness is a formal blocker for PR-only development.

## Acceptance Criteria

1. F-005 is marked as accepted baseline with Evaluator report artifact.
2. F-006 defines concrete design token values and state tokens.
3. F-006 defines primitive contracts with props, states, responsive behavior, and accessibility expectations.
4. F-006 defines chart primitive schemas and missing-data behavior.
5. F-006 defines exact screenshot artifact paths and required state/viewport combinations.
6. F-006 defines hard pass/fail gates suitable for Generator and Evaluator use.
7. F-006 explicitly blocks coding until repository readiness is resolved.
8. F-006 defines `F-007-formal-app-foundation` as the next Generator-ready coding slice.

## Generator Handoff Summary

Do not start coding from F-006 until Evaluator accepts it and repository readiness is resolved. After acceptance, Planner should create `F-007-formal-app-foundation` with exact files, framework choice, failing tests, implementation steps, screenshot commands, and verification scripts.

## Evaluator Handoff Summary

Evaluator should verify whether this contract is concrete enough to become the source of truth for F-007 app foundation planning and whether it resolves the F-005 P1/P2 findings.
