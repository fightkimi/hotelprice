# Investor Demo Prototype Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the existing static HTML prototype so it credibly demonstrates room-type comparison, multi-platform pricing, holiday/event trend intelligence, and investor-grade visual polish.

**Architecture:** Extend the current `prototypes/client-demo/` static app with richer local demo data and a small interaction state model for selected room type, selected platform, and selected demand context. Keep all behavior in vanilla JavaScript, update the existing local Node test file first, and keep the prototype offline, demo-only, and free of live collection logic.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, Node.js built-in `assert` test harness, optional Browser/Playwright screenshot verification if available.

---

## Scope Check

This plan enhances the existing F-002 prototype. It does not build backend ingestion, live OTA collection, actual holiday/event API integration, authentication, persistence, or automatic pricing actions.

## Planned File Changes

- Modify `prototypes/client-demo/index.html`: add stable containers/labels for global analysis controls and investor insight panels if needed.
- Modify `prototypes/client-demo/app.js`: add room types, platforms, demand events, rate matrix, platform gaps, selectors, derived metrics, chart helpers, and new render sections.
- Modify `prototypes/client-demo/styles.css`: add responsive styles for controls, matrix views, premium chart modules, platform comparison, event timeline, and investor capability strip.
- Modify `prototypes/client-demo/README.md`: update walkthrough for investor demo mode and demo-data caveats.
- Modify `tests/client_demo_prototype.test.js`: add failing tests for room type, platform, event trend, and enhanced alert behavior before implementation.
- Create or update `docs/test-reports/2026-05-18-investor-demo-prototype-enhancement-evaluator-checklist.md`.

### Task 1: Add Failing Tests For Investor Demo Data Model

**Files:**
- Modify: `tests/client_demo_prototype.test.js`

- [ ] **Step 1: Add tests for room types**

Add assertions that `app.demoData.roomTypes` exists, has exactly 4 entries, and includes `标准大床房`, `标准双床房`, `亲子房`, and `套房`.

- [ ] **Step 2: Add tests for platforms**

Add assertions that `app.demoData.platforms` exists, has exactly 4 entries, and includes `携程演示源`, `美团演示源`, `飞猪演示源`, and `同程演示源`.

- [ ] **Step 3: Add tests for demand events**

Add assertions that `app.demoData.demandEvents` includes event types for `holiday`, `exhibition`, `concert`, `weekend`, and `weekday`, and that every event has a demo/sample marker.

- [ ] **Step 4: Run tests and verify failure**

Run: `node tests/client_demo_prototype.test.js`

Expected: FAIL because room types, platforms, and demand events do not exist yet.

### Task 2: Implement Investor Demo Data Model

**Files:**
- Modify: `prototypes/client-demo/app.js`

- [ ] **Step 1: Add room type constants**

Add local demo constants for four room types with id, label, capacity, base owner rate, and normalization note.

- [ ] **Step 2: Add platform constants**

Add four demo platforms with id, label, coverage note, and caveat.

- [ ] **Step 3: Add demand event constants**

Add 30-day event classification with demo labels for weekend, weekday, holiday, exhibition, and concert. Mark holiday/event data as demo/sample.

- [ ] **Step 4: Add derived rate matrix helpers**

Add pure helper functions for selected room type and platform:

- `getRoomType(id, data)`
- `getPlatform(id, data)`
- `getDemandEvent(date, data)`
- `getRateForContext(date, roomTypeId, platformId, data)`
- `deriveInvestorMetrics(roomTypeId, platformId, data)`

- [ ] **Step 5: Run tests and verify data-model tests pass**

Run: `node tests/client_demo_prototype.test.js`

Expected: existing tests and new data-model tests pass.

### Task 3: Add Global Analysis Controls

**Files:**
- Modify: `prototypes/client-demo/index.html`
- Modify: `prototypes/client-demo/app.js`
- Modify: `prototypes/client-demo/styles.css`
- Modify: `tests/client_demo_prototype.test.js`

- [ ] **Step 1: Add failing tests for selector helpers**

Add tests that:

- changing room type changes `deriveInvestorMetrics(...).selectedRoomType`;
- changing platform changes `deriveInvestorMetrics(...).selectedPlatform`;
- selected platform and room type are reflected in `getDateDetail(...)` or the replacement context detail helper.

Run: `node tests/client_demo_prototype.test.js`

Expected: FAIL until selectors/helpers are wired.

- [ ] **Step 2: Add selector state**

Extend state with:

- `activeRoomType`
- `activePlatform`
- `activeDemandFilter`

- [ ] **Step 3: Render top analysis controls**

Add a compact control row below navigation:

- 房型 selector;
- 平台 selector;
- 趋势 context selector.

Use button/segmented controls, not text-only pseudo controls.

- [ ] **Step 4: Wire controls to rerender views**

Changing controls should rerender overview, calendar, competitors, alerts, and insight panel.

- [ ] **Step 5: Verify tests pass**

Run: `node tests/client_demo_prototype.test.js`

Expected: PASS for selector helper tests.

### Task 4: Upgrade Overview Dashboard For Investment Narrative

**Files:**
- Modify: `prototypes/client-demo/app.js`
- Modify: `prototypes/client-demo/styles.css`
- Modify: `tests/client_demo_prototype.test.js`

- [ ] **Step 1: Add failing tests for investor metrics**

Add tests that:

- `deriveInvestorMetrics` returns room coverage count 4;
- platform coverage count 4;
- event trend lift text includes demo event context;
- platform gap value is numeric or formatted as CNY.

Run: `node tests/client_demo_prototype.test.js`

Expected: FAIL until metrics exist.

- [ ] **Step 2: Add capability strip to overview**

Render compact metrics:

- 房型覆盖 4 类;
- 平台覆盖 4 个;
- 事件趋势 includes holiday/event lift;
- 最大价差 includes selected room/platform context.

- [ ] **Step 3: Add premium trend visualization**

Render a chart-forward section showing:

- selected room type;
- selected platform;
- owner rate line;
- core competitor average line;
- event lift annotations for holiday, exhibition, and concert demo dates.

Use inline SVG or semantic HTML/CSS generated from local demo data. Do not add external chart libraries unless explicitly approved.

- [ ] **Step 4: Update existing KPIs by selected context**

Existing market movement, alert count, weekend opportunity, and owner risk should reference selected room type and platform.

- [ ] **Step 5: Run tests**

Run: `node tests/client_demo_prototype.test.js`

Expected: PASS.

### Task 5: Upgrade Calendar With Holiday/Event Trends And Room Breakdown

**Files:**
- Modify: `prototypes/client-demo/app.js`
- Modify: `prototypes/client-demo/styles.css`
- Modify: `tests/client_demo_prototype.test.js`

- [ ] **Step 1: Add failing tests for event calendar detail**

Add tests that:

- an event date returns a demand event label;
- calendar/detail helper returns selected room type;
- detail helper includes a room-type breakdown array with 4 room types.

Run: `node tests/client_demo_prototype.test.js`

Expected: FAIL until calendar context helpers are implemented.

- [ ] **Step 2: Add event tags and heatmap intensity to calendar cells**

Show event labels such as `端午演示假期`, `会展演示日`, and `演唱会演示日` on relevant cells.

Calendar cells should visually encode movement strength through a controlled heat/intensity style while keeping text legible.

- [ ] **Step 3: Add room-type breakdown and mini trend to date detail**

Date detail panel should show selected room type first and then a compact 4-room-type comparison.

- [ ] **Step 4: Add failing tests for visual data helpers**

Add tests that:

- a high-lift event date maps to a stronger calendar intensity than a normal weekday;
- room breakdown returns four values with positive rates;
- chart series helper returns owner and core average series.

Run: `node tests/client_demo_prototype.test.js`

Expected: FAIL until visual data helpers are implemented.

- [ ] **Step 5: Implement visual helper functions**

Add pure helper functions exported through `module.exports`:

- `getCalendarIntensity(date, roomTypeId, platformId, data)`
- `getRoomBreakdown(date, platformId, data)`
- `getTrendSeries(roomTypeId, platformId, data)`

- [ ] **Step 6: Run tests**

Run: `node tests/client_demo_prototype.test.js`

Expected: PASS.

### Task 6: Add Platform Comparison And Price Gap Insight

**Files:**
- Modify: `prototypes/client-demo/app.js`
- Modify: `prototypes/client-demo/styles.css`
- Modify: `tests/client_demo_prototype.test.js`

- [ ] **Step 1: Add failing tests for platform comparison**

Add tests that:

- `getPlatformComparison(roomTypeId, date, data)` returns 4 platform rows;
- each row includes platform label, owner rate, core average, and gap amount;
- at least one row has a nonzero cross-platform gap.

Run: `node tests/client_demo_prototype.test.js`

Expected: FAIL until platform comparison helper is implemented.

- [ ] **Step 2: Implement platform comparison helper**

Add `getPlatformComparison(roomTypeId, date, data)` as a pure helper exported through `module.exports`.

- [ ] **Step 3: Render insight panel with chart-style comparison**

Add a visible panel or view section for:

- platform comparison table;
- horizontal platform gap bars with stable dimensions;
- top cross-platform gap;
- channel caveat that all values are demo data.

- [ ] **Step 4: Run tests**

Run: `node tests/client_demo_prototype.test.js`

Expected: PASS.

### Task 6A: Add Premium Visual Design System

**Files:**
- Modify: `prototypes/client-demo/styles.css`
- Modify: `prototypes/client-demo/app.js`
- Modify: `tests/client_demo_prototype.test.js`

- [ ] **Step 1: Add failing design-contract tests**

Add tests that inspect generated/static content and verify:

- chart helper output exists for trend series;
- CSS includes classes for `trend-chart`, `heatmap`, `platform-bars`, and `event-timeline`;
- customer-facing files do not contain generic placeholder chart labels such as `Chart 1` or `Lorem`.

Run: `node tests/client_demo_prototype.test.js`

Expected: FAIL until visual components/styles exist.

- [ ] **Step 2: Define visual tokens**

Update CSS tokens for:

- neutral background/surface hierarchy;
- restrained accent palette for up/down/event/data-quality states;
- chart grid line color;
- axis/label color;
- stable chart and bar heights.

Avoid a single dominant hue family and avoid decorative gradient blobs.

- [ ] **Step 3: Implement chart modules**

Add render helpers for:

- `trend-chart`: inline SVG line chart with two lines and event markers;
- `platform-bars`: horizontal comparison bars;
- `event-timeline`: annotated event sequence;
- `mini-sparkline`: small competitor or KPI trend accents.

- [ ] **Step 4: Polish layout density**

Ensure:

- dashboard first viewport shows controls, capability strip, and trend chart;
- chart labels fit on mobile and desktop;
- tables support charts rather than dominating the page;
- no nested card stacks.

- [ ] **Step 5: Run tests**

Run: `node tests/client_demo_prototype.test.js`

Expected: PASS.

### Task 7: Upgrade Competitor Monitor And Alerts

**Files:**
- Modify: `prototypes/client-demo/app.js`
- Modify: `prototypes/client-demo/styles.css`
- Modify: `tests/client_demo_prototype.test.js`

- [ ] **Step 1: Add failing tests for enhanced alerts**

Add tests that:

- at least one alert has filter `房型价差`;
- at least one alert has filter `平台价差`;
- at least one alert has filter `节假日趋势`;
- every alert includes room type, platform, event context, and human-review wording.

Run: `node tests/client_demo_prototype.test.js`

Expected: FAIL until alert data and filters are updated.

- [ ] **Step 2: Add competitor room/platform context**

Competitor rows should show rate for selected room type and selected platform, plus a cross-platform gap marker.

- [ ] **Step 3: Add alert filters**

Extend alert center filters to include:

- 房型价差
- 平台价差
- 节假日趋势

- [ ] **Step 4: Update alert detail**

Alert details should show room type, platform, demand event, source caveat, and `需人工复核`.

- [ ] **Step 5: Run tests**

Run: `node tests/client_demo_prototype.test.js`

Expected: PASS.

### Task 8: Update README And Investor Walkthrough

**Files:**
- Modify: `prototypes/client-demo/README.md`

- [ ] **Step 1: Update walkthrough**

Add an investor walkthrough:

- show dashboard capability strip;
- switch room type;
- switch platform;
- click holiday/event date;
- show platform gap insight;
- show alert center with room/platform/event alerts.

- [ ] **Step 2: Reinforce demo boundaries**

State that room, platform, and holiday/event data are sample data and not verified market data.

### Task 9: Visual And Compliance Verification

**Files:**
- Create: `docs/test-reports/2026-05-18-investor-demo-prototype-enhancement-evaluator-checklist.md`

- [ ] **Step 1: Run unit/behavior tests**

Run: `node tests/client_demo_prototype.test.js`

Expected: PASS.

- [ ] **Step 2: Run Triad checks**

Run:

```bash
python3 scripts/triad_doctor.py
python3 scripts/test_triad_doctor.py
python3 -m json.tool progress.json
python3 -m json.tool features.json
python3 -m json.tool backlog.json
```

Expected: all commands exit 0, with only the known git-repository warning if the workspace is still not initialized as git.

- [ ] **Step 3: Capture screenshots**

Capture:

- desktop overview with room/platform controls;
- desktop overview trend chart and capability strip;
- desktop calendar with event trend detail;
- desktop platform comparison;
- mobile overview with controls;
- mobile alert center with enhanced filters.

- [ ] **Step 4: Compliance scan**

Search prototype files for disallowed behavior:

- `fetch(`
- `XMLHttpRequest`
- `document.cookie`
- `token`
- `验证码`
- `爬虫`
- `抓取`
- `自动调价`
- `自动改价`

Expected: no matches in executable/customer-visible files except where an Evaluator checklist explicitly names forbidden terms.

- [ ] **Step 5: Write Evaluator checklist**

Include checks for:

- room type controls;
- platform controls;
- holiday/event trend visibility;
- trend chart visual quality;
- heatmap calendar readability;
- platform bar chart readability;
- event timeline clarity;
- premium visual polish compared with the original rough prototype;
- investor capability narrative;
- mobile layout;
- demo-data caveats;
- absence of live collection and automatic pricing.
