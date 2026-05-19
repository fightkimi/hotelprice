# Client Demo HTML Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-contained static HTML prototype that lets customers experience the hotel competitor price monitoring product through realistic demo data and polished operational screens.

**Architecture:** Use a static `prototypes/client-demo/` app with separate HTML, CSS, JavaScript, and optional local demo assets. Keep all demo data in JavaScript constants, render views client-side, and avoid any live OTA collection, backend calls, credentials, or automatic pricing actions.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, optional Playwright or browser automation for screenshots if available, no external runtime dependency required to open the prototype.

---

## Scope Check

This plan creates a customer-facing static prototype only. It intentionally does not implement the backend feature from `F-001`, real data ingestion, live scraping, authentication, persistence, billing, or automatic pricing.

## Planned File Structure

- Create `prototypes/client-demo/index.html`: app shell, semantic sections, tab buttons, and demo containers.
- Create `prototypes/client-demo/styles.css`: responsive operational SaaS styling, tables, calendar grid, alert drawer, mobile rules.
- Create `prototypes/client-demo/app.js`: embedded demo data, render functions, tab switching, alert filtering, calendar detail, competitor toggle.
- Create `prototypes/client-demo/README.md`: how to open, demo caveats, and walkthrough script.
- Optional create `prototypes/client-demo/assets/`: only if Generator uses locally generated visual assets.
- Create `docs/test-reports/2026-05-18-client-demo-html-prototype-evaluator-checklist.md`: Evaluator checklist draft.

### Task 1: Define Prototype Information Architecture

**Files:**
- Create: `prototypes/client-demo/README.md`

- [ ] **Step 1: Write the walkthrough outline before implementation**

Create a README with:

- demo purpose;
- how to open `index.html`;
- recommended customer walkthrough order: overview, calendar, competitor monitor, alert center, setup preview;
- demo-data disclaimer;
- compliance caveat: no live OTA capture and no automatic pricing.

- [ ] **Step 2: Review against the spec**

Check the README references all five required views and does not promise real integrations.

### Task 2: Build Static App Shell

**Files:**
- Create: `prototypes/client-demo/index.html`
- Create: `prototypes/client-demo/styles.css`

- [ ] **Step 1: Create the HTML skeleton**

Create a product-first app shell with:

- top bar containing product name, owner hotel, channel, capture time, and demo badge;
- navigation buttons for overview, price calendar, competitor monitor, alert center, setup preview;
- empty containers with stable IDs: `overview-view`, `calendar-view`, `competitors-view`, `alerts-view`, `setup-view`;
- script reference to `app.js`;
- stylesheet reference to `styles.css`.

- [ ] **Step 2: Create responsive base styles**

Add CSS for:

- desktop app layout;
- mobile layout below 760px;
- compact KPI blocks;
- data tables/lists;
- calendar grid with stable cell dimensions;
- alert severity markers;
- no nested card composition.

- [ ] **Step 3: Open locally and confirm the shell renders**

Open `prototypes/client-demo/index.html` in a browser or via a static server.

Expected: app shell renders with no external dependency errors.

### Task 3: Add Demo Data And Overview Rendering

**Files:**
- Create: `prototypes/client-demo/app.js`

- [ ] **Step 1: Write behavior checks before wiring UI**

Add a small local test harness or documented console checks for:

- overview metrics derive from demo data;
- "建议关注" language appears for recommendations;
- source kind is displayed as demo/sample.

- [ ] **Step 2: Implement demo data constants**

Include:

- one owner hotel;
- ten competitors with six core and four reference entries;
- 30 days of rate summary data;
- alerts covering market increase, competitor decrease, owner low-price risk, and sample-size warning.

- [ ] **Step 3: Render overview dashboard**

Implement render logic for:

- market movement metric;
- alert count;
- weekend opportunity;
- owner price risk;
- seven-day trend strip;
- top three alert queue.

- [ ] **Step 4: Verify overview copy**

Confirm the overview uses "建议关注" or equivalent soft guidance and never says the system has changed prices automatically.

### Task 4: Add Calendar And Date Detail Interaction

**Files:**
- Modify: `prototypes/client-demo/app.js`
- Modify: `prototypes/client-demo/styles.css`

- [ ] **Step 1: Write behavior checks for date selection**

Before implementing the final UI behavior, define checks that:

- selecting a date changes the active date;
- the detail panel shows that date's average, min, max, and alert reason;
- weekend dates have a visual marker.

- [ ] **Step 2: Render the 30-day calendar**

Render a fixed 30-day grid with:

- date label;
- core competitor average;
- min/max range;
- movement tag;
- weekend marker.

- [ ] **Step 3: Implement click-to-detail behavior**

Clicking a date updates a side/detail panel without page reload.

- [ ] **Step 4: Verify desktop and mobile layouts**

Check at desktop width and mobile width that date cell text does not overlap and the detail panel remains readable.

### Task 5: Add Competitor Monitor Interaction

**Files:**
- Modify: `prototypes/client-demo/app.js`
- Modify: `prototypes/client-demo/styles.css`

- [ ] **Step 1: Write behavior checks for level filtering**

Before implementation, define checks that:

- core filter shows six competitors;
- reference filter shows four competitors;
- all filter shows ten competitors.

- [ ] **Step 2: Render competitor table/list**

Include:

- competitor name;
- core/reference level;
- distance;
- current lowest rate;
- percent change;
- last capture time;
- monitoring status.

- [ ] **Step 3: Implement segmented filter controls**

The filter should update the visible competitor list without reload.

- [ ] **Step 4: Verify operational copy**

Make sure labels describe monitoring status and source data without exposing internal scraper/debug terms.

### Task 6: Add Alert Center Interaction

**Files:**
- Modify: `prototypes/client-demo/app.js`
- Modify: `prototypes/client-demo/styles.css`

- [ ] **Step 1: Write behavior checks for alert filters**

Before implementation, define checks that:

- all filter shows every alert;
-涨价 filter shows market or competitor increase alerts;
-降价 filter shows competitor decrease alerts;
-低价风险 filter shows owner risk alerts.

- [ ] **Step 2: Render alert queue**

Each alert row should include:

- severity;
- alert type;
- affected stay date;
- old/new price or average;
- change rate;
- human review marker.

- [ ] **Step 3: Implement alert detail panel**

Clicking an alert updates the detail panel with rationale, source, capture time, and "需人工复核".

- [ ] **Step 4: Verify pricing advice language**

Confirm alert copy suggests attention/review and never gives a hard command such as "自动调到 398 元".

### Task 7: Add Setup Preview

**Files:**
- Modify: `prototypes/client-demo/app.js`
- Modify: `prototypes/client-demo/styles.css`

- [ ] **Step 1: Render setup preview steps**

Show a compact preview:

- hotel profile;
- competitor selection;
- channel/date range;
- review monitoring summary.

- [ ] **Step 2: Label setup as illustrative**

Add visible wording that the view is demo setup and does not connect to live OTA systems.

### Task 8: Visual Polish And Accessibility Pass

**Files:**
- Modify: `prototypes/client-demo/index.html`
- Modify: `prototypes/client-demo/styles.css`
- Modify: `prototypes/client-demo/app.js`

- [ ] **Step 1: Polish operational visual hierarchy**

Ensure:

- first screen is the dashboard;
- typography is dashboard-appropriate, not hero-scale;
- colors are not one-note purple, dark blue, beige, or orange;
- controls have stable dimensions;
- buttons/icons/labels are understandable.

- [ ] **Step 2: Add accessibility basics**

Ensure:

- buttons use `button` elements;
- active tab/filter state is visible;
- important dynamic panels have headings;
- color is not the only signal for alert severity.

- [ ] **Step 3: Check text fitting**

Review desktop and mobile widths for overlapping labels, clipped buttons, or unreadable price/date cells.

### Task 9: Verification And Evaluator Handoff

**Files:**
- Create: `docs/test-reports/2026-05-18-client-demo-html-prototype-evaluator-checklist.md`

- [ ] **Step 1: Run static/local verification**

Open `prototypes/client-demo/index.html` directly or through a local static server.

Expected: no console errors, dashboard appears first, all tabs work.

- [ ] **Step 2: Run interaction checks**

Verify:

- tab switching;
- alert filtering;
- date click detail;
- competitor level filtering;
- alert detail panel.

- [ ] **Step 3: Capture visual evidence**

Use Browser, Playwright, or screenshots for:

- desktop dashboard;
- desktop calendar detail;
- mobile dashboard;
- mobile alert center.

- [ ] **Step 4: Confirm compliance boundaries**

Inspect files and verify:

- no network collection calls;
- no OTA scraping language in executable code;
- no credential/cookie/token handling;
- no automatic pricing action;
- all data is local demo/sample data.

- [ ] **Step 5: Prepare Evaluator checklist**

Write a checklist covering:

- PRD alignment;
- visual quality;
- interaction behavior;
- responsive behavior;
- compliance wording;
- absence of live data collection code.
