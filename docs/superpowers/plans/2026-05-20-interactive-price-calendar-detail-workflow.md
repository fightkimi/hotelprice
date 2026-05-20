# Interactive Price Calendar Detail Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Calendar screen into an interactive date-level review workflow backed by a typed `CalendarDayDetail` dataset contract.

**Architecture:** Extend the fixture/manual UI adapter first so every heatmap date has a rich date-detail record. Then wire `CalendarHeatmap` button clicks into `CalendarScreen` local state and render the selected `CalendarDayDetail` without changing F-008 domain alert math. Keep the work front-end only, local-data only, and human-review only.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, Playwright, existing Revenue Observatory CSS primitives.

---

### Task 1: Add Calendar Day Detail Contract And Adapter Data

**Files:**
- Modify: `app/src/types/contracts.ts`
- Modify: `app/src/data/domainDrivenDataset.ts`
- Test: `app/tests/data/domainDrivenDataset.test.ts`

- [ ] **Step 1: Write the failing dataset contract tests**

Append these tests to `app/tests/data/domainDrivenDataset.test.ts` inside `describe('domain-driven demo dataset charts', () => { ... })` or as a new `describe('domain-driven calendar details', () => { ... })` block:

```typescript
describe('domain-driven calendar details', () => {
  it('builds one calendar detail for every heatmap day with review evidence', () => {
    const dataset = buildDomainDrivenDemoDataset(domainSeed);
    const detailDates = Object.keys(dataset.calendarDetails.byDate).sort();

    expect(detailDates).toEqual(dataset.heatmap.days.map((day) => day.date).sort());

    const concertDetail = dataset.calendarDetails.byDate['2026-05-31'];
    expect(concertDetail).toMatchObject({
      stayDate: '2026-05-31',
      label: '05/31',
      status: 'event-lift',
      currency: 'CNY',
      humanReviewRequired: true,
      eventImpact: expect.objectContaining({
        label: '演唱会演示日',
        type: 'concert',
        confidence: 'partial'
      }),
      rateBasis: expect.objectContaining({
        roomType: dataset.context.roomType,
        occupancy: 2,
        mealPlan: '双早',
        taxFeeBasis: '含税含服务费',
        cancellationPolicy: '入住前24小时可取消'
      })
    });
    expect(concertDetail.ownerRate).toBeGreaterThan(0);
    expect(concertDetail.coreAverage).toBeGreaterThan(0);
    expect(concertDetail.gap).toBe(concertDetail.ownerRate! - concertDetail.coreAverage!);
    expect(concertDetail.platformGaps).toHaveLength(4);
    expect(concertDetail.platformGaps.some((row) => row.platform === '携程演示源' && row.status === 'available')).toBe(true);
    expect(concertDetail.evidenceMarkers.length).toBeGreaterThanOrEqual(2);
    expect(concertDetail.evidenceMarkers.some((marker) => marker.label.startsWith('本酒店观测'))).toBe(true);
    expect(concertDetail.evidenceMarkers.some((marker) => marker.label.startsWith('核心竞品样本'))).toBe(true);
  });

  it('keeps unavailable calendar details as missing samples rather than zero prices', () => {
    const dataset = buildDomainDrivenDemoDataset(domainSeed);
    const unavailableDetail = dataset.calendarDetails.byDate['2026-05-27'];

    expect(unavailableDetail).toMatchObject({
      stayDate: '2026-05-27',
      status: 'unavailable',
      ownerRate: null,
      coreAverage: null,
      gap: null,
      sampleSize: 0,
      missingSampleReason: '暂无可比样本，需要等待人工导入或获授权来源补充。',
      humanReviewRequired: true
    });
    expect(unavailableDetail.platformGaps.every((row) => row.status === 'missing-sample')).toBe(true);
    expect(unavailableDetail.platformGaps.every((row) => row.ownerRate === null && row.coreAverage === null && row.gap === null)).toBe(true);
    expect(unavailableDetail.evidenceMarkers.every((marker) => marker.confidence === 'unavailable')).toBe(true);
  });
});
```

- [ ] **Step 2: Run the dataset tests and verify they fail**

Run: `/opt/homebrew/bin/npm --prefix app test -- tests/data/domainDrivenDataset.test.ts`

Expected: fail with TypeScript/test errors indicating `calendarDetails` does not exist on `DemoDataset`.

- [ ] **Step 3: Extend the TypeScript contract**

In `app/src/types/contracts.ts`, add these interfaces after `PlatformGapRow`:

```typescript
export interface CalendarPlatformGapRow {
  platform: string;
  ownerRate: number | null;
  coreAverage: number | null;
  gap: number | null;
  coverage: number;
  sampleSize: number;
  status: 'available' | 'missing-sample';
}

export interface CalendarEventImpact {
  label: string;
  type: 'none' | 'weekend' | 'holiday' | 'expo' | 'concert';
  lift: number;
  confidence: 'sample' | 'partial' | 'unavailable';
}

export interface CalendarRateBasis {
  roomType: string;
  platformScope: string;
  occupancy: number;
  mealPlan: string;
  taxFeeBasis: string;
  cancellationPolicy: string;
}

export interface CalendarDayDetail {
  stayDate: string;
  label: string;
  status: HeatmapDay['status'];
  ownerRate: number | null;
  coreAverage: number | null;
  gap: number | null;
  currency: 'CNY';
  eventImpact: CalendarEventImpact;
  platformGaps: CalendarPlatformGapRow[];
  evidenceMarkers: EvidenceMarker[];
  sampleSize: number;
  missingSampleReason: string | null;
  rateBasis: CalendarRateBasis;
  captureTime: string;
  humanReviewRequired: true;
}
```

Then add this field to `DemoDataset`:

```typescript
calendarDetails: { byDate: Record<string, CalendarDayDetail> };
```

- [ ] **Step 4: Implement calendar detail derivation in the adapter**

In `app/src/data/domainDrivenDataset.ts`, add `CalendarDayDetail`, `CalendarPlatformGapRow`, and `CalendarEventImpact` to the type import list.

Add these helper functions after `buildHeatmap`:

```typescript
function eventImpactForDate(seed: DomainDemoSeed, date: string): CalendarEventImpact {
  const event = eventForDate(seed, date);
  if (!event) {
    return {
      label: '普通工作日',
      type: 'none',
      lift: 0,
      confidence: 'sample'
    };
  }
  return {
    label: event.label,
    type: event.type,
    lift: event.lift,
    confidence: event.confidence
  };
}

function calendarPlatformGapRows(seed: DomainDemoSeed, stayDate: string): CalendarPlatformGapRow[] {
  const owner = ownerHotel(seed);
  const coreCount = coreCompetitors(seed).length;
  return seed.platforms.map((platform) => {
    const ownerSample = latestAvailableForHotelDateSource(seed, owner.hotelId, stayDate, platform.sourceId);
    const samples = coreSamples(seed, stayDate, platform.sourceId);
    const average = averageCents(samples);
    const sampleSize = (ownerSample ? 1 : 0) + samples.length;

    if (!ownerSample || average === null) {
      return {
        platform: platform.label,
        ownerRate: null,
        coreAverage: null,
        gap: null,
        coverage: samples.length / Math.max(coreCount, 1),
        sampleSize,
        status: 'missing-sample'
      };
    }

    const ownerRate = yuan(ownerSample.priceCents);
    const coreAverage = yuan(average);
    return {
      platform: platform.label,
      ownerRate,
      coreAverage,
      gap: ownerRate - coreAverage,
      coverage: samples.length / Math.max(coreCount, 1),
      sampleSize,
      status: 'available'
    };
  });
}

function calendarEvidenceMarkers(seed: DomainDemoSeed, stayDate: string, platformRows: CalendarPlatformGapRow[]): EvidenceMarker[] {
  const availableRows = platformRows.filter((row) => row.status === 'available');
  if (availableRows.length === 0) {
    return [
      {
        label: `${stayDate} · 缺失样本`,
        source: '演示数据',
        captureTime: seed.now,
        sampleSize: 0,
        confidence: 'unavailable'
      }
    ];
  }

  const totalSamples = availableRows.reduce((sum, row) => sum + row.sampleSize, 0);
  return [
    {
      label: `本酒店观测 · ${seed.context.roomTypeLabel} · ${stayDate}`,
      source: availableRows.map((row) => row.platform).join(' / '),
      captureTime: seed.now,
      sampleSize: availableRows.length,
      confidence: 'sample'
    },
    {
      label: `核心竞品样本 · ${seed.context.roomTypeLabel} · ${stayDate}`,
      source: availableRows.map((row) => row.platform).join(' / '),
      captureTime: seed.now,
      sampleSize: totalSamples,
      confidence: totalSamples >= 4 ? 'sample' : 'partial'
    }
  ];
}

function buildCalendarDetails(seed: DomainDemoSeed, heatmap: { days: HeatmapDay[] }): DemoDataset['calendarDetails'] {
  const byDate: Record<string, CalendarDayDetail> = {};
  for (const day of heatmap.days) {
    const platformGaps = calendarPlatformGapRows(seed, day.date);
    const evidenceMarkers = calendarEvidenceMarkers(seed, day.date, platformGaps);
    byDate[day.date] = {
      stayDate: day.date,
      label: day.label,
      status: day.status,
      ownerRate: day.ownerRate,
      coreAverage: day.coreAverage,
      gap: day.ownerRate === null || day.coreAverage === null ? null : day.ownerRate - day.coreAverage,
      currency: 'CNY',
      eventImpact: eventImpactForDate(seed, day.date),
      platformGaps,
      evidenceMarkers,
      sampleSize: day.sampleSize,
      missingSampleReason: day.sampleSize === 0 ? '暂无可比样本，需要等待人工导入或获授权来源补充。' : null,
      rateBasis: {
        roomType: seed.context.roomTypeLabel,
        platformScope: seed.platforms.map((platform) => platform.label).join(' / '),
        occupancy: 2,
        mealPlan: '双早',
        taxFeeBasis: '含税含服务费',
        cancellationPolicy: '入住前24小时可取消'
      },
      captureTime: seed.now,
      humanReviewRequired: true
    };
  }
  return { byDate };
}
```

Update `buildDomainDrivenDemoDataset` to build heatmap once and reuse it:

```typescript
const heatmap = buildHeatmap(normalizedSeed);

return {
  sourceKind: 'fixture-demo',
  liveCollectionEnabled: false,
  demoDisclosure: '演示数据：本页仅使用静态样例，不连接真实平台或客户系统。',
  context: buildContext(normalizedSeed),
  dataScope: buildDataScopeSummary(normalizedSeed),
  captureEntry: buildCaptureEntryPreview(),
  trend: buildTrend(normalizedSeed),
  heatmap,
  calendarDetails: buildCalendarDetails(normalizedSeed, heatmap),
  platformGaps: buildPlatformGaps(normalizedSeed),
  signals: alerts.map((alert) => mapAlertToSignal(normalizedSeed, alert))
};
```

- [ ] **Step 5: Run the dataset tests and verify they pass**

Run: `/opt/homebrew/bin/npm --prefix app test -- tests/data/domainDrivenDataset.test.ts`

Expected: all tests in `domainDrivenDataset.test.ts` pass.

- [ ] **Step 6: Commit the data contract**

Run:

```bash
git add app/src/types/contracts.ts app/src/data/domainDrivenDataset.ts app/tests/data/domainDrivenDataset.test.ts
git commit -m "feat: add calendar detail dataset contract"
```

### Task 2: Add Heatmap Date Selection Callback

**Files:**
- Modify: `app/src/components/charts/CalendarHeatmap.tsx`
- Test: `app/tests/components/charts.test.tsx`

- [ ] **Step 1: Write the failing interaction test**

In `app/tests/components/charts.test.tsx`, update imports:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
```

Append this test inside `describe('chart primitives', () => { ... })`:

```typescript
it('calls onSelectDate when a heatmap date is clicked and exposes selected state', async () => {
  const user = userEvent.setup();
  const onSelectDate = vi.fn();

  render(<CalendarHeatmap days={demoDataset.heatmap.days} selectedDate="2026-05-31" onSelectDate={onSelectDate} />);

  const selectedDate = screen.getByRole('gridcell', { name: /05\/31/ });
  expect(selectedDate).toHaveAttribute('aria-pressed', 'true');

  await user.click(screen.getByRole('gridcell', { name: /05\/30/ }));

  expect(onSelectDate).toHaveBeenCalledWith('2026-05-30');
});
```

- [ ] **Step 2: Run the chart test and verify it fails**

Run: `/opt/homebrew/bin/npm --prefix app test -- tests/components/charts.test.tsx`

Expected: fail because `onSelectDate` is not a `CalendarHeatmap` prop and/or `aria-pressed` is missing.

- [ ] **Step 3: Implement the callback and accessible selected state**

In `app/src/components/charts/CalendarHeatmap.tsx`, change props and function signature:

```typescript
interface CalendarHeatmapProps {
  days: HeatmapDay[];
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
}

export function CalendarHeatmap({ days, selectedDate, onSelectDate }: CalendarHeatmapProps) {
```

Inside the `button`, add:

```typescript
onClick={() => onSelectDate?.(day.date)}
aria-pressed={selected}
aria-label={`${day.label} ${day.status === 'unavailable' ? '暂无可比样本' : `本酒店价 CNY ${day.ownerRate}`} ${day.eventLabel ?? '普通工作日'}`}
```

Keep `role="gridcell"`, `data-selected`, `data-status`, and existing visual markup.

- [ ] **Step 4: Run the chart tests and verify they pass**

Run: `/opt/homebrew/bin/npm --prefix app test -- tests/components/charts.test.tsx`

Expected: chart tests pass.

- [ ] **Step 5: Commit the heatmap interaction**

Run:

```bash
git add app/src/components/charts/CalendarHeatmap.tsx app/tests/components/charts.test.tsx
git commit -m "feat: add heatmap date selection callback"
```

### Task 3: Render Interactive Calendar Detail Panel

**Files:**
- Modify: `app/src/screens/CalendarScreen.tsx`
- Modify: `app/src/styles/layout.css`
- Test: `app/tests/components/calendarScreen.test.tsx`

- [ ] **Step 1: Write the failing CalendarScreen tests**

Create `app/tests/components/calendarScreen.test.tsx`:

```typescript
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { demoDataset } from '../../src/data/demoDataset';
import { CalendarScreen } from '../../src/screens/CalendarScreen';

describe('CalendarScreen interactive date details', () => {
  it('updates the detail panel when a date is selected', async () => {
    const user = userEvent.setup();

    render(<CalendarScreen dataset={demoDataset} detailOpen />);

    expect(screen.getByText('演唱会演示日')).toBeVisible();

    await user.click(screen.getByRole('gridcell', { name: /05\/30/ }));

    const detailPanel = screen.getByTestId('calendar-detail-panel');
    expect(within(detailPanel).getByText('2026-05-30')).toBeVisible();
    expect(within(detailPanel).getByText('端午演示假期')).toBeVisible();
    expect(within(detailPanel).getByText('平台价差')).toBeVisible();
    expect(within(detailPanel).getByText('证据来源')).toBeVisible();
    expect(within(detailPanel).getByText('采集时间')).toBeVisible();
    expect(within(detailPanel).getByText('含税含服务费')).toBeVisible();
    expect(within(detailPanel).getByText('需人工复核')).toBeVisible();
  });

  it('renders missing sample details without fake zero or null prices', async () => {
    const user = userEvent.setup();

    render(<CalendarScreen dataset={demoDataset} detailOpen />);

    await user.click(screen.getByRole('gridcell', { name: /05\/27/ }));

    const detailPanel = screen.getByTestId('calendar-detail-panel');
    expect(within(detailPanel).getByText('2026-05-27')).toBeVisible();
    expect(within(detailPanel).getByText('暂无可比样本')).toBeVisible();
    expect(within(detailPanel).getByText('暂无可比样本，需要等待人工导入或获授权来源补充。')).toBeVisible();
    expect(detailPanel.textContent).not.toContain('CNY null');
    expect(detailPanel.textContent).not.toContain('CNY 0');
  });
});
```

- [ ] **Step 2: Run the CalendarScreen tests and verify they fail**

Run: `/opt/homebrew/bin/npm --prefix app test -- tests/components/calendarScreen.test.tsx`

Expected: fail because the test file is new and `CalendarScreen` does not expose interactive detail content.

- [ ] **Step 3: Implement selected date state and detail lookup**

Replace `CalendarScreen` logic in `app/src/screens/CalendarScreen.tsx` with local state:

```typescript
import { useMemo, useState } from 'react';
import { CalendarHeatmap } from '../components/charts/CalendarHeatmap';
import type { CalendarDayDetail, DemoDataset } from '../types/contracts';
```

Add helpers:

```typescript
function formatRate(value: number | null): string {
  return value === null ? '暂无可比样本' : `CNY ${value}`;
}

function formatGap(detail: CalendarDayDetail): string {
  if (detail.gap === null) {
    return '暂无可比样本';
  }
  if (detail.gap === 0) {
    return 'CNY 0';
  }
  return `${detail.gap > 0 ? '+' : '-'}CNY ${Math.abs(detail.gap)}`;
}
```

In the component:

```typescript
const detailDates = useMemo(() => Object.keys(dataset.calendarDetails.byDate), [dataset.calendarDetails.byDate]);
const initialDate = dataset.dataScope.stayWindow.focusDate ?? detailDates[0] ?? dataset.heatmap.days[0]?.date;
const [selectedDate, setSelectedDate] = useState(initialDate);
const selected = dataset.calendarDetails.byDate[selectedDate] ?? dataset.calendarDetails.byDate[detailDates[0]];
```

Pass the callback:

```tsx
<CalendarHeatmap days={dataset.heatmap.days} selectedDate={selected.stayDate} onSelectDate={setSelectedDate} />
```

- [ ] **Step 4: Render the complete detail panel**

In the aside, add `data-testid="calendar-detail-panel"` and render sections for:

```tsx
<span className="status-chip status-chip--review">需人工复核</span>
```

Metrics:

```tsx
<div className="detail-metric">
  <span className="meta-label">本酒店价</span>
  <strong>{formatRate(selected.ownerRate)}</strong>
</div>
<div className="detail-metric">
  <span className="meta-label">核心竞品均价</span>
  <strong>{formatRate(selected.coreAverage)}</strong>
</div>
<div className="detail-metric">
  <span className="meta-label">价差</span>
  <strong>{formatGap(selected)}</strong>
</div>
<div className="detail-metric">
  <span className="meta-label">样本</span>
  <strong>{selected.sampleSize} 条</strong>
</div>
```

Platform rows:

```tsx
<section className="calendar-detail-section">
  <h3>平台价差</h3>
  <div className="calendar-platform-list">
    {selected.platformGaps.map((row) => (
      <div className="calendar-platform-row" key={row.platform} data-status={row.status}>
        <span>{row.platform}</span>
        <strong>{row.status === 'available' ? formatGap({ ...selected, gap: row.gap }) : '暂无可比样本'}</strong>
        <small>覆盖率 {Math.round(row.coverage * 100)}% · 样本 {row.sampleSize}</small>
      </div>
    ))}
  </div>
</section>
```

Evidence and rate basis:

```tsx
<section className="calendar-detail-section">
  <h3>证据来源</h3>
  {selected.evidenceMarkers.map((marker) => (
    <p className="muted" key={`${marker.label}-${marker.source}`}>
      {marker.label} · {marker.source} · 样本 {marker.sampleSize}
    </p>
  ))}
</section>
<section className="calendar-detail-section">
  <h3>采集时间</h3>
  <p className="muted">{selected.captureTime}</p>
  <p className="muted">
    {selected.rateBasis.roomType} · {selected.rateBasis.platformScope} · {selected.rateBasis.occupancy}成人 · {selected.rateBasis.mealPlan} · {selected.rateBasis.taxFeeBasis} · {selected.rateBasis.cancellationPolicy}
  </p>
</section>
```

Missing state:

```tsx
{selected.missingSampleReason ? <p className="muted">{selected.missingSampleReason}</p> : null}
```

- [ ] **Step 5: Add focused responsive CSS**

In `app/src/styles/layout.css`, add small scoped styles near `.detail-panel`:

```css
.calendar-detail-section {
  display: grid;
  gap: var(--space-2);
}

.calendar-detail-section h3 {
  margin: 0;
  color: var(--text-strong);
  font-size: var(--font-size-sm);
}

.calendar-platform-list {
  display: grid;
  gap: var(--space-2);
}

.calendar-platform-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--space-1) var(--space-3);
  align-items: center;
  border: 1px solid var(--border-muted);
  border-radius: var(--radius-sm);
  padding: var(--space-3);
  background: var(--surface-raised);
}

.calendar-platform-row small {
  grid-column: 1 / -1;
  color: var(--text-muted);
}

.calendar-platform-row[data-status="missing-sample"] strong {
  color: var(--text-muted);
}
```

Use existing tokens only.

- [ ] **Step 6: Run the CalendarScreen tests and verify they pass**

Run: `/opt/homebrew/bin/npm --prefix app test -- tests/components/calendarScreen.test.tsx`

Expected: CalendarScreen tests pass.

- [ ] **Step 7: Run related component tests**

Run: `/opt/homebrew/bin/npm --prefix app test -- tests/components`

Expected: component test suite passes.

- [ ] **Step 8: Commit the screen interaction**

Run:

```bash
git add app/src/screens/CalendarScreen.tsx app/src/styles/layout.css app/tests/components/calendarScreen.test.tsx
git commit -m "feat: render interactive calendar date details"
```

### Task 4: Add Playwright Calendar Click Flow

**Files:**
- Modify: `app/tests/e2e/app-foundation.spec.ts`

- [ ] **Step 1: Write the failing Playwright flow**

Append this test to `app/tests/e2e/app-foundation.spec.ts`:

```typescript
test('calendar date click updates detail panel and keeps mobile layout contained', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?screen=calendar&state=detail-open');

  await page.getByRole('gridcell', { name: /05\/30/ }).click();
  await expect(page.getByTestId('calendar-detail-panel')).toContainText('2026-05-30');
  await expect(page.getByTestId('calendar-detail-panel')).toContainText('端午演示假期');
  await expect(page.getByTestId('calendar-detail-panel')).toContainText('平台价差');
  await expect(page.getByTestId('calendar-detail-panel')).toContainText('证据来源');
  await expect(page.getByTestId('calendar-detail-panel')).toContainText('需人工复核');

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(8);
});
```

- [ ] **Step 2: Run the Playwright flow and verify it fails before the implementation commit or passes after Task 3**

Run: `/opt/homebrew/bin/npm --prefix app exec playwright -- test tests/e2e/app-foundation.spec.ts`

Expected after Task 3: all Playwright tests pass.

- [ ] **Step 3: Commit the E2E flow**

Run:

```bash
git add app/tests/e2e/app-foundation.spec.ts
git commit -m "test: cover calendar date detail interaction"
```

### Task 5: Add Generator Notes And Run Full Verification

**Files:**
- Create: `docs/test-reports/2026-05-20-f-014-generator-notes.md`

- [ ] **Step 1: Write Generator notes**

Create `docs/test-reports/2026-05-20-f-014-generator-notes.md` with:

```markdown
# F-014 Generator Notes

Date: 2026-05-20
Feature: F-014-interactive-price-calendar-detail-workflow
Role: Generator-Codex

## Scope

Implemented the interactive Calendar date detail workflow with local fixture/manual data only.

## TDD Evidence

- RED/GREEN dataset contract for `calendarDetails.byDate`.
- RED/GREEN heatmap `onSelectDate` callback and selected accessibility state.
- RED/GREEN CalendarScreen selected-date detail panel.
- Playwright calendar date click flow.

## Boundaries

- Did not change F-008 domain alert math.
- Did not add live OTA collection.
- Did not add credentials, cookies, sessions, CAPTCHA handling, storage, backend routes, persistence, recommended price, or automatic pricing.
- Kept all pricing decisions human-review only.

## Verification

- `/opt/homebrew/bin/npm --prefix app test -- tests/data/domainDrivenDataset.test.ts`
- `/opt/homebrew/bin/npm --prefix app test -- tests/components`
- `/opt/homebrew/bin/npm --prefix app exec playwright -- test tests/e2e/app-foundation.spec.ts`
- `/opt/homebrew/bin/npm --prefix app run verify`
- `python3 scripts/triad_doctor.py`
- `python3 scripts/test_triad_doctor.py`
- `python3 -m json.tool progress.json`
- `python3 -m json.tool features.json`
- `python3 -m json.tool backlog.json`
- `node tests/client_demo_prototype.test.js`
- `git diff --check`
```

- [ ] **Step 2: Run targeted tests**

Run:

```bash
/opt/homebrew/bin/npm --prefix app test -- tests/data/domainDrivenDataset.test.ts
/opt/homebrew/bin/npm --prefix app test -- tests/components
/opt/homebrew/bin/npm --prefix app exec playwright -- test tests/e2e/app-foundation.spec.ts
```

Expected: all targeted checks pass.

- [ ] **Step 3: Run full app verification**

Run: `/opt/homebrew/bin/npm --prefix app run verify`

Expected: build, Vitest, and Playwright all pass.

- [ ] **Step 4: Run project verification**

Run:

```bash
python3 scripts/triad_doctor.py
python3 scripts/test_triad_doctor.py
python3 -m json.tool progress.json
python3 -m json.tool features.json
python3 -m json.tool backlog.json
node tests/client_demo_prototype.test.js
git diff --check
```

Expected: all commands pass.

- [ ] **Step 5: Run safety scan**

Run:

```bash
rg -n "live collection|credential|cookie|session|CAPTCHA|browser automation|localStorage|sessionStorage|recommended price|automatic pricing|自动调价|自动改价|爬虫|抓取|验证码" app/src app/tests
```

Expected: no unsafe capability is introduced. Existing negative guardrail terms in tests are acceptable only when asserting absence or disabled behavior.

- [ ] **Step 6: Commit verification notes**

Run:

```bash
git add docs/test-reports/2026-05-20-f-014-generator-notes.md
git commit -m "chore: hand off f-014 for verification"
```

## Evaluator Handoff

After Generator completes, Evaluator should verify:

- every `heatmap.days` date has a `calendarDetails.byDate` detail;
- `2026-05-31` includes four platform rows, event impact, evidence markers, capture time, rate basis, and human review;
- unavailable `2026-05-27` does not render fake zero/null prices;
- clicking `05/30` updates the detail panel;
- mobile `390x844` has no horizontal overflow;
- F-008 domain alert math is unchanged;
- no real collection, credential, cookie/session, CAPTCHA, storage, recommended-price, or automatic-pricing capability appears;
- full `/opt/homebrew/bin/npm --prefix app run verify`, Triad, JSON, prototype regression, and `git diff --check` pass.
