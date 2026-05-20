# Production Revenue Observatory Visual Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the formal React app into a cohesive Revenue Observatory visual system across all five screens without changing accepted business semantics.

**Architecture:** Keep the existing React, TypeScript, Vite, CSS-token, and demo dataset architecture. Add global Revenue Observatory tokens and CSS primitives, then apply those primitives through small JSX class/structure changes in the shell, screens, and chart components. Tests must prove visual coverage, screenshot dimensions, no overflow, chart nonblank behavior, and unchanged human-review/data-boundary semantics.

**Tech Stack:** TypeScript, React, CSS variables, Vitest, Testing Library, Playwright, existing Vite app workspace, no new dependencies.

---

## Scope Check

This is a visual-system implementation slice. It must not change domain alert math, `DemoDataset` semantics, capture-entry behavior, real collection status, persistence, authentication, or pricing-decision behavior.

F-012 depends on F-010 and F-011. If `main` does not yet contain those accepted slices, implement on a branch based on the accepted F-011 head and rebase before PR preparation so the final PR diff is bounded to F-012 visual-system changes.

## Planned File Changes

Modify:

- `app/src/components/layout/AppShell.tsx`
- `app/src/screens/OverviewScreen.tsx`
- `app/src/screens/CalendarScreen.tsx`
- `app/src/screens/MarketComparisonScreen.tsx`
- `app/src/screens/AlertReviewScreen.tsx`
- `app/src/screens/SetupDataScopeScreen.tsx`
- `app/src/components/charts/TrendChart.tsx`
- `app/src/components/charts/CalendarHeatmap.tsx`
- `app/src/components/charts/PlatformGapBars.tsx`
- `app/src/components/charts/EventTimeline.tsx`
- `app/src/components/primitives/SignalPanel.tsx`
- `app/src/styles/tokens.css`
- `app/src/styles/layout.css`
- `app/tests/contract/tokens.test.ts`
- `app/tests/components/charts.test.tsx`
- `app/tests/e2e/app-foundation.spec.ts`
- `features.json`
- `progress.json`
- `backlog.json`
- `.auto-memory/project-status.md`

Create:

- `app/tests/components/revenueObservatoryScreens.test.tsx`
- `docs/test-reports/2026-05-20-f-012-generator-notes.md`

Do not modify:

- `app/src/domain/pricing/*`
- `app/src/data/domainSeed.ts`
- `app/src/data/domainDrivenDataset.ts`
- `app/src/data/dataScope.ts`
- `app/src/data/demoDataset.ts`
- package, build, Vite, or Playwright config
- backend, persistence, migration, connector, or upload files

## Task 1: Add Fail-First Visual Contract Tests

**Files:**

- Modify: `app/tests/contract/tokens.test.ts`
- Create: `app/tests/components/revenueObservatoryScreens.test.tsx`

- [ ] **Step 1: Extend token and primitive contract test**

Add these expectations to the existing `defines Revenue Observatory surfaces through token-layer variables` test in `app/tests/contract/tokens.test.ts`:

```ts
    expect(css).toContain('--observatory-shell-max: 2000px;');
    expect(css).toContain('--observatory-page-surface:');
    expect(css).toContain('--observatory-instrument-surface:');
    expect(css).toContain('--observatory-chart-frame:');
    expect(css).toContain('--observatory-insight-surface:');
    expect(css).toContain('--observatory-signal-rail:');
    expect(layoutCss).toContain('.app-shell[data-visual-system="revenue-observatory"]');
    expect(layoutCss).toContain('.app-header__signal-rail');
    expect(layoutCss).toContain('.observatory-panel');
    expect(layoutCss).toContain('.instrument-header');
    expect(layoutCss).toContain('.metric-lattice');
    expect(layoutCss).toContain('.insight-rail');
    expect(layoutCss).toContain('.chart-frame');
```

- [ ] **Step 2: Create global screen visual coverage test**

Create `app/tests/components/revenueObservatoryScreens.test.tsx`:

```tsx
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppShell } from '../../src/components/layout/AppShell';
import { demoDataset } from '../../src/data/demoDataset';
import { AlertReviewScreen } from '../../src/screens/AlertReviewScreen';
import { CalendarScreen } from '../../src/screens/CalendarScreen';
import { MarketComparisonScreen } from '../../src/screens/MarketComparisonScreen';
import { OverviewScreen } from '../../src/screens/OverviewScreen';
import { SetupDataScopeScreen } from '../../src/screens/SetupDataScopeScreen';

describe('Revenue Observatory global visual system', () => {
  it('marks the app shell as the global observatory visual system', () => {
    const { container } = render(
      <AppShell context={demoDataset.context} sourceKind={demoDataset.sourceKind} currentScreen="overview" state="normal">
        <OverviewScreen dataset={demoDataset} state="normal" />
      </AppShell>
    );

    expect(container.querySelector('.app-shell[data-visual-system="revenue-observatory"]')).not.toBeNull();
    expect(container.querySelector('.app-header__signal-rail')).not.toBeNull();
    expect(container.querySelector('.metric-lattice')).not.toBeNull();
    expect(container.querySelector('.chart-frame')).not.toBeNull();
  });

  it('applies observatory primitives across all five screens', () => {
    const screens = [
      <OverviewScreen key="overview" dataset={demoDataset} state="normal" />,
      <CalendarScreen key="calendar" dataset={demoDataset} detailOpen />,
      <MarketComparisonScreen key="market" dataset={demoDataset} />,
      <AlertReviewScreen key="alerts" dataset={demoDataset} drawerOpen />,
      <SetupDataScopeScreen key="setup" dataset={demoDataset} />
    ];

    for (const screen of screens) {
      const { container, unmount } = render(screen);

      expect(container.querySelector('.observatory-screen')).not.toBeNull();
      expect(container.querySelectorAll('.observatory-panel, .observatory-glass-panel').length).toBeGreaterThanOrEqual(1);
      expect(container.querySelector('.instrument-header')).not.toBeNull();

      unmount();
    }
  });
});
```

- [ ] **Step 3: Run visual contract tests and verify RED**

Run:

```bash
cd app
/opt/homebrew/bin/npm test -- tests/contract/tokens.test.ts tests/components/revenueObservatoryScreens.test.tsx
```

Expected: FAIL because shell-level `data-visual-system`, global primitive selectors, and all-screen visual classes do not exist yet.

## Task 2: Add Global Tokens And App Shell Structure

**Files:**

- Modify: `app/src/styles/tokens.css`
- Modify: `app/src/styles/layout.css`
- Modify: `app/src/components/layout/AppShell.tsx`

- [ ] **Step 1: Add Revenue Observatory global tokens**

Append these token variables inside the existing `:root` block in `app/src/styles/tokens.css`, near the current observatory variables:

```css
  --observatory-shell-max: 2000px;
  --observatory-page-surface:
    radial-gradient(circle at 88% 8%, rgba(0, 200, 220, 0.16), transparent 28%),
    linear-gradient(180deg, rgba(238, 243, 242, 0.96), rgba(243, 246, 247, 0.9));
  --observatory-instrument-surface:
    linear-gradient(135deg, rgba(20, 32, 42, 0.98), rgba(31, 49, 60, 0.94));
  --observatory-chart-frame:
    linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(247, 251, 252, 0.82));
  --observatory-insight-surface:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(244, 249, 250, 0.8));
  --observatory-signal-rail:
    linear-gradient(90deg, rgba(10, 108, 255, 0.82), rgba(0, 200, 220, 0.72), rgba(184, 117, 26, 0.5));
  --observatory-panel-shadow: 0 24px 60px rgba(16, 36, 48, 0.13);
  --observatory-chart-grid:
    linear-gradient(var(--observatory-grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--observatory-grid-line) 1px, transparent 1px);
```

- [ ] **Step 2: Mark AppShell as the global visual system**

Change the root element in `app/src/components/layout/AppShell.tsx`:

```tsx
    <div className="app-shell" data-state={state} data-visual-system="revenue-observatory">
```

Replace the header identity block with:

```tsx
          <div className="app-header__identity">
            <span className="app-header__eyebrow">Revenue Observatory</span>
            <h1 className="app-title">酒店价格情报工作台</h1>
            <p className="app-subtitle">以房型、平台、事件和样本质量为边界的演示数据分析视图。</p>
          </div>
          <div className="app-header__signal-rail" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
```

Keep the existing navigation markup after this identity block.

- [ ] **Step 3: Add shell and primitive CSS**

Add this section to `app/src/styles/layout.css` after the base shell/layout rules and before screen-specific rules:

```css
.app-shell[data-visual-system="revenue-observatory"] {
  background: var(--observatory-page-surface);
}

.app-shell[data-visual-system="revenue-observatory"] .app-shell__inner {
  width: min(var(--observatory-shell-max), calc(100vw - 48px));
}

.app-shell[data-visual-system="revenue-observatory"] .app-header {
  position: relative;
  overflow: hidden;
  border-color: var(--observatory-inset-line);
  background: var(--observatory-glass-surface);
  box-shadow: var(--observatory-panel-shadow);
}

.app-header__identity {
  display: grid;
  gap: var(--space-4);
}

.app-header__eyebrow {
  color: var(--color-blue);
  font-size: var(--font-meta-size);
  font-weight: 700;
  line-height: var(--font-meta-line);
}

.app-header__signal-rail {
  display: grid;
  grid-template-columns: repeat(3, minmax(32px, 1fr));
  gap: var(--space-8);
  min-width: 180px;
  height: 8px;
}

.app-header__signal-rail span {
  border-radius: var(--radius-pill);
  background: var(--observatory-signal-rail);
}

.observatory-screen {
  position: relative;
}

.observatory-panel {
  border: var(--border-width) solid var(--observatory-inset-line);
  background: var(--observatory-glass-surface);
  box-shadow: var(--observatory-panel-shadow);
}

.instrument-header {
  border-radius: var(--radius-panel);
  background: var(--observatory-instrument-surface);
  color: var(--color-surface);
}

.instrument-header .panel__meta,
.instrument-header .muted {
  color: var(--color-disabled-bg);
}

.metric-lattice {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-16);
}

.insight-rail {
  background: var(--observatory-insight-surface);
}

.chart-frame {
  background-image: var(--observatory-chart-grid), var(--observatory-chart-frame);
  background-size: 32px 32px, 32px 32px, auto;
}

@media (max-width: 760px) {
  .app-shell[data-visual-system="revenue-observatory"] .app-shell__inner {
    width: min(100%, calc(100vw - 24px));
  }

  .app-header__signal-rail {
    width: 100%;
    min-width: 0;
  }

  .metric-lattice {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 4: Run contract tests and verify GREEN for shell/token scope**

Run:

```bash
cd app
/opt/homebrew/bin/npm test -- tests/contract/tokens.test.ts
```

Expected: PASS for token and primitive selector checks. If layout CSS contains raw `rgba(...)`, move that color into `tokens.css` and reference a variable.

- [ ] **Step 5: Commit shell/token work**

Run:

```bash
git add app/src/styles/tokens.css app/src/styles/layout.css app/src/components/layout/AppShell.tsx app/tests/contract/tokens.test.ts
git commit -m "feat: add revenue observatory global shell"
```

## Task 3: Apply Visual Primitives Across The Five Screens

**Files:**

- Modify: `app/src/screens/OverviewScreen.tsx`
- Modify: `app/src/screens/CalendarScreen.tsx`
- Modify: `app/src/screens/MarketComparisonScreen.tsx`
- Modify: `app/src/screens/AlertReviewScreen.tsx`
- Modify: `app/src/screens/SetupDataScopeScreen.tsx`
- Modify: `app/src/components/primitives/SignalPanel.tsx`
- Modify: `app/src/styles/layout.css`
- Modify: `app/tests/components/revenueObservatoryScreens.test.tsx`

- [ ] **Step 1: Update screen wrapper classes**

Apply these wrapper class changes:

```tsx
// Overview normal state
<section className="screen-grid observatory-screen">

// Overview signal card grid
<div className="metric-lattice">

// Calendar
<section className="screen-grid screen-grid--two observatory-screen">

// Market
<section className="screen-grid screen-grid--two observatory-screen">

// Alerts
<section className="screen-grid screen-grid--two observatory-screen">

// Setup keeps setup-specific class and gains general observatory marker
<section className="screen-grid screen-grid--two setup-observatory observatory-screen" data-visual-system="revenue-observatory">
```

Keep the existing loading and empty states in `OverviewScreen`, but add `observatory-screen` to their top-level sections too.

- [ ] **Step 2: Add primitive classes to panels**

Apply these class changes:

```tsx
// SignalPanel root for all non-loading and loading variants
<article className="panel signal-panel observatory-panel" ...>

// Calendar detail panel
<aside className="panel detail-panel observatory-panel insight-rail" ...>

// Market context aside
<aside className="panel observatory-panel insight-rail">

// Alert list panel
<div className="panel observatory-panel">

// Setup existing panels
<div className="panel observatory-glass-panel observatory-panel">
<aside className="panel observatory-glass-panel observatory-panel">
```

- [ ] **Step 3: Add instrument header classes**

Change panel header class names for top analytical panels:

```tsx
<div className="panel__header instrument-header">
```

Apply this in:

- `MarketComparisonScreen.tsx`
- `AlertReviewScreen.tsx`
- `SetupDataScopeScreen.tsx`

Do not apply it inside `EvidenceDrawer` unless its existing component already exposes a matching header class.

- [ ] **Step 4: Run screen coverage test and verify GREEN**

Run:

```bash
cd app
/opt/homebrew/bin/npm test -- tests/components/revenueObservatoryScreens.test.tsx tests/components/setupDataScopeScreen.test.tsx
```

Expected: PASS. Existing Setup screen expectations for `scope-observatory-map`, `capture-signal-rail`, and `observatory-glass-panel` must still pass.

- [ ] **Step 5: Commit screen primitive work**

Run:

```bash
git add app/src/screens app/src/components/primitives/SignalPanel.tsx app/src/styles/layout.css app/tests/components/revenueObservatoryScreens.test.tsx
git commit -m "feat: apply observatory primitives across screens"
```

## Task 4: Upgrade Chart Frames Without Changing Data Semantics

**Files:**

- Modify: `app/src/components/charts/TrendChart.tsx`
- Modify: `app/src/components/charts/CalendarHeatmap.tsx`
- Modify: `app/src/components/charts/PlatformGapBars.tsx`
- Modify: `app/src/components/charts/EventTimeline.tsx`
- Modify: `app/src/styles/layout.css`
- Modify: `app/tests/components/charts.test.tsx`

- [ ] **Step 1: Add fail-first chart visual primitive checks**

Append these assertions to `app/tests/components/charts.test.tsx`:

```tsx
  it('applies Revenue Observatory chart frames without removing semantic markers', () => {
    const { container: trend } = render(<TrendChart data={demoDataset.trend} />);
    expect(trend.querySelector('.chart-frame')).not.toBeNull();
    expect(trend.querySelectorAll('[data-testid="trend-segment"]').length).toBeGreaterThan(0);

    const { container: heatmap } = render(<CalendarHeatmap days={demoDataset.heatmap.days} selectedDate="2026-05-31" />);
    expect(heatmap.querySelector('.chart-frame')).not.toBeNull();
    expect(screen.getByText(/暂无可比样本/)).toBeVisible();

    const { container: platformBars } = render(
      <PlatformGapBars rows={demoDataset.platformGaps.rows} maxGap={demoDataset.platformGaps.maxGap} unit="CNY" />
    );
    expect(platformBars.querySelector('.chart-frame')).not.toBeNull();
    expect(screen.getByText(/CNY 0/)).toBeVisible();
  });
```

- [ ] **Step 2: Run chart tests and verify RED**

Run:

```bash
cd app
/opt/homebrew/bin/npm test -- tests/components/charts.test.tsx
```

Expected: FAIL because chart components do not all expose `chart-frame` yet.

- [ ] **Step 3: Apply chart frame classes**

Change chart root class names:

```tsx
// TrendChart
<section className="chart-panel trend-chart chart-frame observatory-panel">

// CalendarHeatmap
<section className="chart-panel calendar-heatmap chart-frame observatory-panel">

// PlatformGapBars
<section className="chart-panel platform-bars chart-frame observatory-panel">

// EventTimeline
<section className="chart-panel event-timeline chart-frame observatory-panel">
```

- [ ] **Step 4: Add chart polish CSS**

Add this CSS near existing chart styles in `app/src/styles/layout.css`:

```css
.chart-frame {
  overflow: hidden;
  border-color: var(--observatory-inset-line);
}

.chart-frame .chart-panel__header {
  border-bottom: var(--border-width) solid var(--observatory-inset-line);
  padding-bottom: var(--space-12);
}

.trend-chart__svg,
.heatmap-grid,
.platform-bars__list,
.event-timeline__list {
  position: relative;
  z-index: 1;
}

.chart-grid-line {
  stroke: var(--observatory-inset-line);
}

.event-marker-line {
  stroke: var(--color-amber);
  stroke-dasharray: 4 4;
}

.chart-annotation {
  fill: var(--color-amber);
  font-size: var(--font-meta-size);
  font-weight: 700;
}
```

If any of these selectors already exist, merge the declarations instead of duplicating selectors.

- [ ] **Step 5: Run chart tests and verify GREEN**

Run:

```bash
cd app
/opt/homebrew/bin/npm test -- tests/components/charts.test.tsx
```

Expected: PASS. The test must still see trend segments, unavailable heatmap copy, and `CNY 0`.

- [ ] **Step 6: Commit chart visual work**

Run:

```bash
git add app/src/components/charts app/src/styles/layout.css app/tests/components/charts.test.tsx
git commit -m "feat: upgrade observatory chart frames"
```

## Task 5: Expand Screenshot And Mobile Visual Gates

**Files:**

- Modify: `app/tests/e2e/app-foundation.spec.ts`

- [ ] **Step 1: Add wide-screen screenshot cases**

Add these cases to the `cases` array in `app/tests/e2e/app-foundation.spec.ts`:

```ts
  ['overview-observatory--2048x1352.png', '/?screen=overview&state=normal', { width: 2048, height: 1352 }],
  ['calendar-observatory--2048x1352.png', '/?screen=calendar&state=detail-open', { width: 2048, height: 1352 }],
  ['market-observatory--2048x1352.png', '/?screen=market&state=normal', { width: 2048, height: 1352 }],
  ['alert-review-observatory--2048x1352.png', '/?screen=alerts&state=drawer-open', { width: 2048, height: 1352 }],
  ['setup-observatory--2048x1352.png', '/?screen=setup&state=normal', { width: 2048, height: 1352 }],
```

- [ ] **Step 2: Add visual-system assertions to each screenshot test**

Inside the existing screenshot test, after `await page.goto(path);`, add:

```ts
    await expect(page.locator('.app-shell[data-visual-system="revenue-observatory"]')).toBeVisible();
    await expect(page.locator('.observatory-screen').first()).toBeVisible();
```

Inside the same test, after the overflow assertion, add:

```ts
    const chartCount = await page.locator('.chart-frame').count();
    if (!path.includes('setup')) {
      expect(chartCount).toBeGreaterThan(0);
    }
```

- [ ] **Step 3: Run Playwright screenshots and verify RED or GREEN**

Run:

```bash
cd app
/opt/homebrew/bin/npm run test:e2e
```

Expected before implementation is complete: FAIL on missing global visual selectors or generated screenshots. Expected after Tasks 2-4: PASS with exact PNG dimensions for the existing matrix and the new `2048x1352` captures.

If the non-escalated local server cannot bind `127.0.0.1` under the sandbox, rerun the same command with approved sandbox escalation and document both outputs in Generator notes.

- [ ] **Step 4: Commit screenshot gate work**

Run:

```bash
git add app/tests/e2e/app-foundation.spec.ts docs/test-reports/f-007-app-foundation
git commit -m "test: add observatory screenshot gates"
```

## Task 6: Full Verification, Safety Scan, And Generator Notes

**Files:**

- Create: `docs/test-reports/2026-05-20-f-012-generator-notes.md`
- Modify: `features.json`
- Modify: `progress.json`
- Modify: `backlog.json`
- Modify: `.auto-memory/project-status.md`

- [ ] **Step 1: Run targeted visual regression**

Run:

```bash
cd app
/opt/homebrew/bin/npm test -- tests/contract/tokens.test.ts tests/components/revenueObservatoryScreens.test.tsx tests/components/charts.test.tsx tests/components/setupDataScopeScreen.test.tsx
```

Expected: PASS with all targeted visual contract tests passing.

- [ ] **Step 2: Run existing contract/data/domain regression**

Run:

```bash
cd app
/opt/homebrew/bin/npm test -- tests/contract/demoDataset.test.ts tests/data/domainDrivenDataset.test.ts tests/domain
```

Expected: PASS. No domain alert, evidence, data-scope, or capture-entry behavior may regress.

- [ ] **Step 3: Run full app verification**

Run:

```bash
cd app
/opt/homebrew/bin/npm run verify
```

Expected: build passes, Vitest passes, and Playwright passes. Record the exact file and test counts in Generator notes.

- [ ] **Step 4: Run project checks**

Run:

```bash
python3 scripts/triad_doctor.py
python3 scripts/test_triad_doctor.py
python3 -m json.tool progress.json
python3 -m json.tool features.json
python3 -m json.tool backlog.json
node tests/client_demo_prototype.test.js
```

Expected: all commands pass. If the H5 prototype regression count differs from the last recorded count, document the exact count and confirm no F-012 product-code change caused it.

- [ ] **Step 5: Run static safety scan**

Run:

```bash
rg -n "(cookie|token|credential|captcha|scrap|scrape|crawler|puppeteer|playwright|fetch\\(|XMLHttpRequest|axios|localStorage|sessionStorage|IndexedDB|automatic pricing|auto[- ]?price|recommendedPriceCents|recommendedPrice|自动调价|自动改价|爬虫|抓取|验证码|凭证|密钥)" app/src/components app/src/screens app/src/styles app/src/types
```

Expected: no unsafe matches in user-visible source or runtime paths. The term `playwright` should not appear in app source paths; it may appear only in test files outside this scan.

- [ ] **Step 6: Write Generator notes**

Create `docs/test-reports/2026-05-20-f-012-generator-notes.md` with:

```md
# F-012 Generator Notes

Feature: `F-012-production-revenue-observatory-visual-upgrade`

Role: Generator

## Scope

Implemented the approved visual-system slice only:

- added Revenue Observatory global tokens;
- marked the formal app shell with `data-visual-system="revenue-observatory"`;
- applied observatory panel, instrument header, metric lattice, insight rail, and chart frame primitives across all five screens;
- upgraded chart presentation while preserving missing/unavailable data semantics;
- added `2048x1352` screenshot gates.

No domain alert math, dataset semantics, live collection, persistence, credentials, file upload, recommended price, or automatic pricing behavior was added.

## TDD Evidence

Record RED and GREEN command outputs for:

- token and shell visual contract;
- five-screen visual primitive coverage;
- chart frame semantic preservation;
- screenshot gate update.

## Verification

Record exact outputs for targeted visual tests, domain/data regression, full `npm run verify`, project checks, and safety scan.

## Screenshot Artifacts

List all new `2048x1352` PNG artifacts and confirm exact dimensions.

## Handoff

F-012 is ready for Evaluator verification through the next backlog item. This is not a final acceptance conclusion.
```

Replace each "Record" instruction with the actual command output summary before handoff.

- [ ] **Step 7: Update status files for handoff**

Set:

- `features.json`: `F-012-production-revenue-observatory-visual-upgrade` status to `verifying`, executor `generator`, artifacts include changed app files, tests, screenshots, and Generator notes.
- `progress.json`: status `verifying`, batch id `production-revenue-observatory-visual-upgrade`, current sprint `F-012-production-revenue-observatory-visual-upgrade`.
- `backlog.json`: mark Generator item done, add or keep Evaluator item new.
- `.auto-memory/project-status.md`: current role `Generator`, current batch F-012, summary of visual-system implementation and verification evidence, next step Evaluator verification.

- [ ] **Step 8: Commit final handoff**

Run:

```bash
git add app docs/test-reports/2026-05-20-f-012-generator-notes.md features.json progress.json backlog.json .auto-memory/project-status.md
git commit -m "chore: hand off f-012 for verification"
```

## Evaluator Checklist

Evaluator must independently verify:

- all five screens use the global Revenue Observatory visual system;
- all new screenshot files exist and match exact dimensions;
- `2048x1352` layouts use the wide shell and do not look like a narrow centered card;
- `390x844` mobile layouts have no horizontal overflow or incoherent overlap;
- chart components still preserve gaps, unavailable states, zero-gap markers, event markers, coverage, and human-review evidence;
- app source has no live collection, credentials, browser automation, storage, recommended price, or automatic pricing behavior;
- PR diff is bounded to F-012 visual-system files after F-010/F-011 dependency cleanup.
