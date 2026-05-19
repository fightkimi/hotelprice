# F-003 Investor Demo Prototype Enhancement Spec

## Role And Source Context

- Planner role: non-implementation. This spec responds to product feedback on the existing HTML prototype.
- Source prototype: `prototypes/client-demo/index.html`, `prototypes/client-demo/app.js`, `prototypes/client-demo/styles.css`, `prototypes/client-demo/README.md`
- Related feature: `F-002-client-demo-html-prototype`
- User feedback: the prototype lacks room-type distinction, platform comparison, holiday/event trend changes, and the visual design currently feels too rough for investment discussions.
- Superpowers order used for this Planner pass: using-superpowers, brainstorming, writing-plans, executing-plans, test-driven-development, verification-before-completion.

## Problem Statement

The current prototype communicates the daily customer workflow, but it reads like a lightweight single-channel monitor. For investor conversations, the product needs to show a larger vision: multiple room types, multiple OTA platforms, and holiday/event-driven demand trends. The enhanced prototype should demonstrate that the product can grow from price reminders into market intelligence and revenue-management assistance while remaining honest that all current data is demo/sample data.

## Current Prototype Gaps

- Room type: the current UI uses one fixed `标准大床房`口径 and does not show room-type normalization or room-level price movement.
- Platform: the current UI uses one `携程演示源` and does not show platform price gaps or channel strategy.
- Holiday/event trend: the current UI marks weekends but does not distinguish holiday, exhibition, concert, or event-driven demand.
- Visual quality: the current UI is serviceable but reads as a basic admin page. It lacks premium charting, refined spacing, strong data visualization, and investor-grade presentation polish.
- Investor story: the current UI is operationally useful, but does not visibly show data coverage, expansion potential, or market intelligence depth.

## Recommended Enhancement Approach

Keep the static client demo as one self-contained HTML app, but add an "投资人演示" layer inside the product interface:

- add global controls for room type, platform, and demand context;
- expand demo data to include room types, platforms, and events;
- add new views or panels for platform price comparison and holiday/event trend insight;
- replace purely tabular signals with richer visualizations such as trend lines, heatmap cells, event annotations, and platform gap bars;
- keep the dashboard first, and make the expanded capability visible within the first screen.

This should not become a pitch deck or marketing landing page. It should still feel like a real operator dashboard that happens to reveal the broader investable product thesis.

## In Scope

- Extend existing static prototype files.
- Add room-type segmented control with at least:
  - 标准大床房
  - 标准双床房
  - 亲子房
  - 套房
- Add platform comparison with at least:
  - 携程演示源
  - 美团演示源
  - 飞猪演示源
  - 同程演示源
- Add holiday/event trend data with demo labels:
  - 周末
  - 端午演示假期
  - 会展演示日
  - 演唱会演示日
  - 普通工作日
- Add investor-relevant summary signals:
  - monitored room-type coverage;
  - platform coverage;
  - event trend lift;
  - cross-platform price gap;
  - data-quality sample marker.
- Update existing overview, calendar, competitor monitor, and alert center to reflect selected room type and platform.
- Add or extend a dedicated insight panel for "平台价差" and "节假日趋势".
- Maintain demo/sample labeling and "需人工复核" wording.
- Upgrade the visual design to investor-demo quality with refined spacing, polished chart modules, and premium operational SaaS styling.

## Out Of Scope

- Real OTA collection or scraping.
- Login, accounts, backend, database, persistence, billing, or export.
- Actual holiday API or event API integration.
- Automatic pricing.
- Claims that demo trends are real market data.
- Complex AI recommendations.
- Decorative marketing hero pages, stock-photo hero banners, or purely ornamental gradients that do not communicate product data.

## Data Model Requirements For Demo State

The JavaScript demo data should visibly support these concepts:

- `roomTypes`: id, label, category, capacity, base owner rate, normalization note.
- `platforms`: id, label, sample coverage, caveat.
- `demandEvents`: date, label, type, expected lift, confidence/sample marker.
- `rateMatrix`: platform, room type, date, owner rate, core average, min, max, movement, sample size.
- `platformGaps`: hotel or market-level price differences by platform.
- `alerts`: include room type, platform, event context, and rationale.

The prototype can keep everything in local constants; no external data file is required.

## Required UX Changes

### Premium Visual System

The enhanced prototype should feel like a polished B2B data product:

- refined neutral surfaces with selective accent colors for price up, price down, event lift, and data caveats;
- compact but readable spacing, with consistent 8px radii and stable component dimensions;
- subtle depth and dividers, not heavy shadows or nested card stacks;
- chart-forward layout where important movement is visible before reading tables;
- no oversized hero text, no decorative blobs, and no one-note color palette.

Required visual modules:

- market trend line chart for selected room type/platform;
- mini sparklines in KPI or competitor rows;
- heatmap-style calendar intensity for demand/price lift;
- platform gap bar comparison;
- event trend timeline with annotations for holiday, exhibition, and concert days.

### Global Analysis Controls

Add compact controls near the top of the workspace:

- room type selector;
- platform selector;
- trend context selector or event filter.

Changing controls should update KPI text, calendar details, competitor rows, and relevant alerts.

### Overview Dashboard

Add an investor-grade capability strip without turning it into a landing page:

- 房型覆盖: 4 类房型
- 平台覆盖: 4 个演示平台
- 事件趋势: 节假日/会展/演唱会
- 价差洞察: 跨平台最大价差

Existing KPIs should reflect the selected room type and selected platform.

The overview should include a prominent market trend visualization that shows owner rate, core competitor average, and event lift over the next 14 to 30 days.

### Price Calendar

Each date should show:

- selected room type;
- selected platform;
- core average;
- demand tag such as 周末, 端午演示假期, 会展演示日;
- event lift or risk marker.

The detail panel should show event context and a small room-type breakdown.

Calendar cells should behave as a compact heatmap: stronger event/price movement should be visually distinguishable without relying only on text.

### Competitor Monitor

Rows should show selected room-type rate and selected platform rate. Add a compact indicator for whether the competitor has cross-platform spread worth attention.

### Alert Center

Add filters or labels for:

- 房型价差
- 平台价差
- 节假日趋势

Alert details should include room type, platform, event context, and human-review caveat.

### Platform And Event Insight Panel

Add a panel or view that helps investors see scale:

- platform comparison table for the selected room type;
- platform gap bar chart for the selected date;
- event trend timeline;
- trend line or mini chart showing average lift around event dates;
- top cross-platform gaps;
- sample/coverage caveats.

## Acceptance Criteria

1. Prototype still opens locally from `prototypes/client-demo/index.html` with no build step.
2. Dashboard remains the first screen and does not become a marketing hero.
3. Room-type selector changes visible room type context and derived demo metrics.
4. Platform selector changes visible platform context and platform comparison output.
5. Holiday/event trend data is visible in the calendar and insight panel.
6. Alerts include at least one room-type alert, one platform-gap alert, and one holiday/event trend alert.
7. Tests cover room-type filtering, platform selection, event classification, and alert filtering before implementation.
8. UI copy clearly says demo/sample data and avoids claims of real market accuracy.
9. No live OTA scraping, network calls, credentials, cookies, tokens, browser automation logic, or automatic pricing logic are added.
10. Desktop and mobile screenshots show the new controls and panels without text overlap.
11. Overview includes a visible trend chart, not only numeric KPI cards.
12. Calendar uses visual intensity or heatmap styling for event/price movement.
13. Platform comparison includes a bar or chart-style visualization, not only text rows.
14. Visual QA confirms the prototype looks polished enough for investor screening: refined spacing, balanced palette, legible chart labels, and no crude default-table feel.

## Generator Handoff Summary

Generator should implement this as an enhancement to the existing F-002 prototype using `docs/superpowers/plans/2026-05-18-investor-demo-prototype-enhancement.md`. Use test-first changes in `tests/client_demo_prototype.test.js` before modifying prototype behavior.

## Evaluator Handoff Summary

Evaluator should verify that the enhanced prototype supports room-type, platform, and holiday/event trend narratives, remains locally runnable, keeps demo/compliance boundaries clear, and looks credible for investor conversations.
