# Market Comparison Drilldown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Market Comparison from platform summary bars into a selectable, explainable drilldown by platform, stay date, room type, competitor sample, and rate boundary.

**Architecture:** Extend the fixture/manual `DemoDataset` with a `marketDrilldown` contract derived from existing domain seed snapshots, without changing F-008 alert math. Then update `MarketComparisonScreen` to manage a local selected drilldown option and render competitor sample details using F-012 Revenue Observatory primitives and F-014/F-015 human-review-only boundaries.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, Playwright, existing Revenue Observatory CSS primitives.

---

## Required Context

Before implementation, read:

- `docs/specs/2026-05-21-market-comparison-drilldown.md`
- `docs/specs/PROJECT_PRD.md`
- `docs/specs/PROJECT_DEVELOPMENT_PLAN.md`
- `app/src/types/contracts.ts`
- `app/src/data/domainDrivenDataset.ts`
- `app/src/data/domainSeed.ts`
- `app/src/screens/MarketComparisonScreen.tsx`
- `app/src/components/charts/PlatformGapBars.tsx`
- `app/tests/data/domainDrivenDataset.test.ts`
- `app/tests/e2e/app-foundation.spec.ts`

Use strict TDD. Do not change F-008 alert math, F-014 calendar workflow, or F-015 alert review workflow unless a test proves the change is required for F-016 and the diff remains bounded.

Use this command prefix for app tests on this machine to avoid local native-binding signature issues:

```bash
PATH=/Users/kimi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin
```

---

### Task 1: Add Market Drilldown Contract Tests And Types

**Files:**
- Modify: `app/src/types/contracts.ts`
- Test: `app/tests/data/domainDrivenDataset.test.ts`

- [ ] **Step 1: Write the failing dataset tests**

Append this block to `app/tests/data/domainDrivenDataset.test.ts` after the existing `domain-driven demo dataset charts` tests:

```typescript
describe('domain-driven market comparison drilldown', () => {
  it('builds selectable platform and date drilldown details with competitor samples', () => {
    const dataset = buildDomainDrivenDemoDataset(domainSeed);
    const selected = dataset.marketDrilldown.byId[dataset.marketDrilldown.selectedOptionId];

    expect(dataset.marketDrilldown.options.length).toBeGreaterThanOrEqual(dataset.platformGaps.rows.length);
    expect(selected).toBeDefined();
    expect(selected.stayDate).toBe(domainSeed.context.platformFocusDate);
    expect(selected.roomType).toBe(dataset.context.roomType);
    expect(selected.platform).toMatch(/演示源/);
    expect(selected.currency).toBe('CNY');
    expect(selected.humanReviewRequired).toBe(true);
    expect(selected.ownerRate).toBeGreaterThan(0);
    expect(selected.coreAverage).toBeGreaterThan(0);
    expect(selected.gap).toBe(selected.ownerRate! - selected.coreAverage!);
    expect(selected.competitorSamples.length).toBeGreaterThanOrEqual(3);
    expect(selected.competitorSamples.some((sample) => sample.status === 'available' && sample.price !== null)).toBe(true);
    expect(selected.competitorRange?.min).toBeGreaterThan(0);
    expect(selected.competitorRange?.max).toBeGreaterThanOrEqual(selected.competitorRange!.min);
    expect(selected.evidenceMarkers.some((marker) => marker.label.startsWith('本酒店观测'))).toBe(true);
    expect(selected.evidenceMarkers.some((marker) => marker.label.startsWith('核心竞品样本'))).toBe(true);
    expect(selected.rateBasis).toMatchObject({
      roomType: dataset.context.roomType,
      occupancy: 2,
      mealPlan: '双早',
      taxFeeBasis: '含税含服务费',
      cancellationPolicy: '入住前24小时可取消'
    });
  });

  it('keeps missing market drilldown samples customer-safe without pseudo prices', () => {
    const dataset = buildDomainDrivenDemoDataset(domainSeed);
    const missingOption = dataset.marketDrilldown.options.find((option) => option.stayDate === '2026-05-27');

    expect(missingOption).toBeDefined();

    const detail = dataset.marketDrilldown.byId[missingOption!.id];
    expect(detail).toMatchObject({
      stayDate: '2026-05-27',
      status: 'missing-sample',
      ownerRate: null,
      coreAverage: null,
      gap: null,
      competitorRange: null,
      humanReviewRequired: true
    });
    expect(detail.missingSampleReason).toContain('暂无可比样本');
    expect(detail.competitorSamples.length).toBeGreaterThanOrEqual(3);
    expect(detail.competitorSamples.every((sample) => sample.price === null && sample.gapToOwner === null)).toBe(true);
    expect(detail.competitorSamples.some((sample) => sample.status === 'missing-sample')).toBe(true);
    expect(detail.competitorSamples.some((sample) => sample.status === 'source-error')).toBe(true);
    expect(detail.competitorSamples.some((sample) => sample.status === 'unavailable')).toBe(true);
  });

  it('marks stale market drilldown samples as unavailable for comparison', () => {
    const staleSeed = {
      ...domainSeed,
      snapshots: domainSeed.snapshots.map((snapshot) =>
        snapshot.snapshotId === 'owner-0531-ctrip-latest'
          ? { ...snapshot, capturedAt: '2026-05-17T20:00:00.000Z' }
          : snapshot
      )
    };
    const dataset = buildDomainDrivenDemoDataset(staleSeed);
    const selected = dataset.marketDrilldown.byId[dataset.marketDrilldown.selectedOptionId];

    expect(selected.ownerRate).toBeNull();
    expect(selected.status).toBe('missing-sample');
    expect(selected.competitorSamples.every((sample) => sample.rateKey.roomType === dataset.context.roomType)).toBe(true);
    expect(selected.competitorSamples.every((sample) => sample.rateKey.taxFeeBasis)).toBe(true);
    expect(selected.competitorSamples.every((sample) => sample.rateKey.cancellationPolicy)).toBe(true);
  });
});
```

- [ ] **Step 2: Run the dataset test and verify RED**

Run:

```bash
PATH=/Users/kimi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin /opt/homebrew/bin/npm --prefix app test -- tests/data/domainDrivenDataset.test.ts
```

Expected: FAIL because `dataset.marketDrilldown` does not exist.

- [ ] **Step 3: Extend UI contracts**

In `app/src/types/contracts.ts`, add these types after `PlatformGapRow`:

```typescript
export type MarketSampleStatus = 'available' | 'missing-sample' | 'stale' | 'unavailable' | 'source-error';

export interface MarketCompetitorSample {
  hotelId: string;
  hotelName: string;
  competitorLevel: 'core' | 'reference';
  price: number | null;
  gapToOwner: number | null;
  status: MarketSampleStatus;
  statusLabel: string;
  explanation: string;
  source: string;
  captureTime: string | null;
  rateKey: RateKey;
}

export interface MarketDrilldownOption {
  id: string;
  label: string;
  platform: string;
  stayDate: string;
  roomType: string;
  eventLabel: string;
  status: 'available' | 'missing-sample';
  gap: number | null;
  coverage: number;
  sampleSize: number;
}

export interface MarketCompetitorRange {
  min: number;
  max: number;
}

export interface MarketDrilldownDetail {
  id: string;
  platform: string;
  stayDate: string;
  roomType: string;
  status: 'available' | 'missing-sample';
  currency: 'CNY';
  ownerRate: number | null;
  coreAverage: number | null;
  gap: number | null;
  competitorRange: MarketCompetitorRange | null;
  coverage: number;
  sampleSize: number;
  captureTime: string | null;
  eventImpact: CalendarEventImpact;
  rateBasis: CalendarRateBasis;
  competitorSamples: MarketCompetitorSample[];
  evidenceMarkers: EvidenceMarker[];
  missingSampleReason?: string;
  humanReviewRequired: true;
}

export interface MarketComparisonDrilldown {
  options: MarketDrilldownOption[];
  selectedOptionId: string;
  byId: Record<string, MarketDrilldownDetail>;
  guardrails: string[];
}
```

Then add this field to `DemoDataset` near `platformGaps`:

```typescript
marketDrilldown: MarketComparisonDrilldown;
```

- [ ] **Step 4: Run the dataset test and verify type-level RED remains**

Run:

```bash
PATH=/Users/kimi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin /opt/homebrew/bin/npm --prefix app test -- tests/data/domainDrivenDataset.test.ts
```

Expected: FAIL because `buildDomainDrivenDemoDataset` does not populate `marketDrilldown`.

- [ ] **Step 5: Commit the failing test and contract**

Commit only the test and contract once RED is observed:

```bash
git add app/src/types/contracts.ts app/tests/data/domainDrivenDataset.test.ts
git commit -m "test: define market comparison drilldown contract"
```

### Task 2: Build Market Drilldown Data From Domain Seed

**Files:**
- Modify: `app/src/data/domainDrivenDataset.ts`
- Test: `app/tests/data/domainDrivenDataset.test.ts`

- [ ] **Step 1: Import the new contract types**

In `app/src/data/domainDrivenDataset.ts`, add these to the existing contract import list:

```typescript
MarketCompetitorSample,
MarketDrilldownDetail,
MarketDrilldownOption,
MarketSampleStatus,
```

- [ ] **Step 2: Add sample status helpers**

Add these helpers near `calendarPlatformGapRows`:

```typescript
function marketOptionId(stayDate: string, sourceId: string): string {
  return `market-${stayDate}-${sourceId}`;
}

function marketSampleStatus(snapshot: RateSnapshot | undefined): MarketSampleStatus {
  if (!snapshot) {
    return 'missing-sample';
  }
  if (snapshot.availabilityStatus === 'available' && snapshot.priceCents !== null) {
    return 'available';
  }
  if (snapshot.availabilityStatus === 'stale') {
    return 'stale';
  }
  if (snapshot.availabilityStatus === 'source_error') {
    return 'source-error';
  }
  if (snapshot.availabilityStatus === 'no_rate') {
    return 'missing-sample';
  }
  return 'unavailable';
}

function marketSampleStatusLabel(status: MarketSampleStatus): string {
  const labels: Record<MarketSampleStatus, string> = {
    available: '可比样本',
    'missing-sample': '缺少可比样本',
    stale: '样本过期',
    unavailable: '暂不可售',
    'source-error': '来源样本暂不可用'
  };
  return labels[status];
}

function marketSampleExplanation(status: MarketSampleStatus): string {
  const explanations: Record<MarketSampleStatus, string> = {
    available: '该样本满足当前平台、入住日期、房型和价格口径。',
    'missing-sample': '暂无可比公开样本，需要等待人工导入或获授权来源补充。',
    stale: '样本已超过新鲜度阈值，不能作为有效价差判断。',
    unavailable: '该竞品当前样本暂不可售或不可比。',
    'source-error': '演示来源样本暂不可用，需要人工复核后再判断。'
  };
  return explanations[status];
}
```

- [ ] **Step 3: Add competitor sample and evidence builders**

Add this block after the helpers from Step 2:

```typescript
function marketCompetitorSamples(seed: DomainDemoSeed, stayDate: string, sourceId: string, ownerRate: number | null): MarketCompetitorSample[] {
  return coreCompetitors(seed).map((hotel) => {
    const snapshot = latestForHotelDateSource(seed, hotel.hotelId, stayDate, sourceId);
    const status = marketSampleStatus(snapshot);
    const price = status === 'available' && snapshot?.priceCents !== null && snapshot?.priceCents !== undefined ? yuan(snapshot.priceCents) : null;
    const representative = snapshot ?? representativeSnapshot(seed, stayDate, sourceId);

    return {
      hotelId: hotel.hotelId,
      hotelName: hotel.name,
      competitorLevel: 'core',
      price,
      gapToOwner: ownerRate !== null && price !== null ? ownerRate - price : null,
      status,
      statusLabel: marketSampleStatusLabel(status),
      explanation: marketSampleExplanation(status),
      source: platformLabel(seed, sourceId),
      captureTime: snapshot?.capturedAt ?? null,
      rateKey: uiRateKey(seed, representative)
    };
  });
}

function marketCompetitorRange(samples: MarketCompetitorSample[]): MarketDrilldownDetail['competitorRange'] {
  const prices = samples.flatMap((sample) => (sample.price === null ? [] : [sample.price]));
  if (prices.length === 0) {
    return null;
  }
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
}

function marketEvidenceMarkers(seed: DomainDemoSeed, detail: Pick<MarketDrilldownDetail, 'stayDate' | 'platform' | 'sampleSize' | 'captureTime' | 'status'>): EvidenceMarker[] {
  if (detail.status === 'missing-sample') {
    return [
      {
        label: `暂无可比样本 · ${detail.stayDate}`,
        source: detail.platform,
        captureTime: detail.captureTime ?? detail.stayDate,
        sampleSize: 0,
        confidence: 'unavailable'
      }
    ];
  }

  return [
    {
      label: `本酒店观测 · ${seed.context.roomTypeKey} · ${detail.stayDate}`,
      source: detail.platform,
      captureTime: detail.captureTime ?? seed.now,
      sampleSize: 1,
      confidence: 'partial'
    },
    {
      label: `核心竞品样本 · ${seed.context.roomTypeKey} · ${detail.stayDate}`,
      source: detail.platform,
      captureTime: detail.captureTime ?? seed.now,
      sampleSize: Math.max(detail.sampleSize - 1, 0),
      confidence: detail.sampleSize >= 4 ? 'sample' : 'partial'
    }
  ];
}
```

- [ ] **Step 4: Add the market drilldown builder**

Add this function before `buildDomainDrivenDemoDataset`:

```typescript
function buildMarketDrilldown(seed: DomainDemoSeed): DemoDataset['marketDrilldown'] {
  const owner = ownerHotel(seed);
  const coreCount = coreCompetitors(seed).length;
  const byId: Record<string, MarketDrilldownDetail> = {};
  const options: MarketDrilldownOption[] = [];

  for (const stayDate of displayDates(seed)) {
    for (const platform of seed.platforms) {
      const ownerSample = latestAvailableForHotelDateSource(seed, owner.hotelId, stayDate, platform.sourceId);
      const ownerRate = ownerSample ? yuan(ownerSample.priceCents) : null;
      const competitorSamples = marketCompetitorSamples(seed, stayDate, platform.sourceId, ownerRate);
      const availableCompetitors = competitorSamples.filter((sample) => sample.status === 'available' && sample.price !== null);
      const coreAverage =
        availableCompetitors.length === 0
          ? null
          : round(availableCompetitors.reduce((sum, sample) => sum + (sample.price ?? 0), 0) / availableCompetitors.length);
      const sampleSize = (ownerRate === null ? 0 : 1) + availableCompetitors.length;
      const status: MarketDrilldownDetail['status'] = ownerRate !== null && coreAverage !== null ? 'available' : 'missing-sample';
      const captureTime = latestCaptureTime([
        ...(ownerSample ? [ownerSample] : []),
        ...seed.snapshots.filter((snapshot) => snapshot.rateKey.stayDate === stayDate && snapshot.rateKey.sourceId === platform.sourceId)
      ]);

      const id = marketOptionId(stayDate, platform.sourceId);
      const detailBase = {
        id,
        platform: platform.label,
        stayDate,
        roomType: seed.context.roomTypeLabel,
        status,
        currency: 'CNY' as const,
        ownerRate,
        coreAverage,
        gap: ownerRate !== null && coreAverage !== null ? ownerRate - coreAverage : null,
        competitorRange: marketCompetitorRange(competitorSamples),
        coverage: availableCompetitors.length / Math.max(coreCount, 1),
        sampleSize,
        captureTime,
        eventImpact: eventImpactForDate(seed, stayDate),
        rateBasis: rateBasisForDate(seed, stayDate),
        competitorSamples,
        missingSampleReason: status === 'missing-sample' ? '暂无可比样本，需要等待人工导入或获授权来源补充。' : undefined,
        humanReviewRequired: true as const
      };
      const detail: MarketDrilldownDetail = {
        ...detailBase,
        evidenceMarkers: marketEvidenceMarkers(seed, detailBase)
      };

      byId[id] = detail;
      options.push({
        id,
        label: `${platform.label} · ${stayDate.slice(5).replace('-', '/')}`,
        platform: platform.label,
        stayDate,
        roomType: seed.context.roomTypeLabel,
        eventLabel: detail.eventImpact.label,
        status,
        gap: detail.gap,
        coverage: detail.coverage,
        sampleSize: detail.sampleSize
      });
    }
  }

  const preferredId = marketOptionId(seed.context.platformFocusDate, primarySourceId(seed));
  return {
    options,
    selectedOptionId: byId[preferredId] ? preferredId : (options[0]?.id ?? ''),
    byId,
    guardrails: ['本页仅使用 fixture/manual 演示数据。', '价差详情只作为人工复核线索。', '不保存状态，也不触发任何自动价格动作。']
  };
}
```

- [ ] **Step 5: Wire `marketDrilldown` into the dataset**

In `buildDomainDrivenDemoDataset`, add `marketDrilldown` immediately after `platformGaps`:

```typescript
platformGaps: buildPlatformGaps(normalizedSeed),
marketDrilldown: buildMarketDrilldown(normalizedSeed),
signals,
```

- [ ] **Step 6: Run the dataset test and verify GREEN**

Run:

```bash
PATH=/Users/kimi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin /opt/homebrew/bin/npm --prefix app test -- tests/data/domainDrivenDataset.test.ts
```

Expected: PASS, including the new `domain-driven market comparison drilldown` tests.

- [ ] **Step 7: Run targeted data and chart tests**

Run:

```bash
PATH=/Users/kimi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin /opt/homebrew/bin/npm --prefix app test -- tests/data/domainDrivenDataset.test.ts tests/components/charts.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit the data adapter**

```bash
git add app/src/data/domainDrivenDataset.ts app/tests/data/domainDrivenDataset.test.ts
git commit -m "feat: add market comparison drilldown data"
```

### Task 3: Implement Market Screen Selection And Detail UI

**Files:**
- Modify: `app/src/screens/MarketComparisonScreen.tsx`
- Create: `app/tests/components/marketComparisonScreen.test.tsx`

- [ ] **Step 1: Write failing component tests**

Create `app/tests/components/marketComparisonScreen.test.tsx`:

```typescript
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { demoDataset } from '../../src/data/demoDataset';
import { MarketComparisonScreen } from '../../src/screens/MarketComparisonScreen';

describe('MarketComparisonScreen drilldown workflow', () => {
  it('renders selected market drilldown detail with competitor samples and boundaries', () => {
    render(<MarketComparisonScreen dataset={demoDataset} detailOpen />);

    const detail = screen.getByTestId('market-drilldown-detail');
    expect(detail).toHaveTextContent('需人工复核');
    expect(detail).toHaveTextContent('2026-05-31');
    expect(detail).toHaveTextContent('标准大床房');
    expect(detail).toHaveTextContent('核心竞品价格区间');
    expect(detail).toHaveTextContent('竞品样本');
    expect(detail).toHaveTextContent('采集时间');
    expect(detail).toHaveTextContent('含税含服务费');
    expect(detail).toHaveTextContent('入住前24小时可取消');
    expect(within(detail).getAllByText(/可比样本|缺少可比样本|来源样本暂不可用|暂不可售|样本过期/).length).toBeGreaterThan(0);
  });

  it('updates detail when a missing-sample option is selected without pseudo prices', async () => {
    const user = userEvent.setup();
    render(<MarketComparisonScreen dataset={demoDataset} detailOpen />);

    await user.click(screen.getByRole('button', { name: /05\/27/ }));

    const detail = screen.getByTestId('market-drilldown-detail');
    expect(detail).toHaveTextContent('2026-05-27');
    expect(detail).toHaveTextContent('暂无可比样本，需要等待人工导入或获授权来源补充。');
    expect(detail).toHaveTextContent('缺少可比样本');
    expect(detail).toHaveTextContent('来源样本暂不可用');
    expect(detail).toHaveTextContent('暂不可售');
    expect(detail).not.toHaveTextContent('CNY null');
    expect(detail).not.toHaveTextContent('CNY 0');
  });
});
```

- [ ] **Step 2: Run the component test and verify RED**

Run:

```bash
PATH=/Users/kimi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin /opt/homebrew/bin/npm --prefix app test -- tests/components/marketComparisonScreen.test.tsx
```

Expected: FAIL because `detailOpen` and `market-drilldown-detail` do not exist.

- [ ] **Step 3: Replace `MarketComparisonScreen.tsx` with local selection UI**

Use this implementation for `app/src/screens/MarketComparisonScreen.tsx`:

```typescript
import { useMemo, useState } from 'react';
import { PlatformGapBars } from '../components/charts/PlatformGapBars';
import type { DemoDataset, MarketCompetitorSample, MarketDrilldownDetail, MarketDrilldownOption } from '../types/contracts';

interface MarketComparisonScreenProps {
  dataset: DemoDataset;
  detailOpen?: boolean;
}

function formatRate(value: number | null): string {
  return value === null ? '暂无可比样本' : `CNY ${value}`;
}

function formatGap(value: number | null): string {
  if (value === null) {
    return '缺少可比样本';
  }
  if (value === 0) {
    return 'CNY 0';
  }
  return value > 0 ? `高于竞品 CNY ${Math.abs(value)}` : `低于竞品 CNY ${Math.abs(value)}`;
}

function formatCaptureTime(value: string | null): string {
  return value ? value.replace('T', ' ').slice(0, 16) : '暂无采集时间';
}

function formatCoverage(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatRange(detail: MarketDrilldownDetail): string {
  return detail.competitorRange === null ? '暂无可比样本' : `CNY ${detail.competitorRange.min} - ${detail.competitorRange.max}`;
}

function DrilldownOptionButton({
  option,
  selected,
  onSelect
}: {
  option: MarketDrilldownOption;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button className="market-option-button" type="button" aria-pressed={selected} data-selected={selected} onClick={() => onSelect(option.id)}>
      <span>
        <strong>{option.label}</strong>
        <small>{option.roomType} · {option.eventLabel}</small>
      </span>
      <span className={option.status === 'available' ? 'status-chip' : 'status-chip status-chip--warning'}>{formatGap(option.gap)}</span>
    </button>
  );
}

function CompetitorSampleRow({ sample }: { sample: MarketCompetitorSample }) {
  return (
    <div className="market-sample-row" data-status={sample.status}>
      <div>
        <strong>{sample.hotelName}</strong>
        <small>
          {sample.source} · {formatCaptureTime(sample.captureTime)}
        </small>
      </div>
      <div className="market-sample-row__rate">
        <span>{formatRate(sample.price)}</span>
        <span className="status-chip">{sample.statusLabel}</span>
      </div>
      <small>{sample.explanation}</small>
    </div>
  );
}

export function MarketComparisonScreen({ dataset, detailOpen = true }: MarketComparisonScreenProps) {
  const options = dataset.marketDrilldown.options;
  const initialOptionId = dataset.marketDrilldown.byId[dataset.marketDrilldown.selectedOptionId]
    ? dataset.marketDrilldown.selectedOptionId
    : (options[0]?.id ?? '');
  const [selectedOptionId, setSelectedOptionId] = useState(initialOptionId);
  const selected = useMemo(
    () => dataset.marketDrilldown.byId[selectedOptionId] ?? dataset.marketDrilldown.byId[initialOptionId],
    [dataset.marketDrilldown.byId, initialOptionId, selectedOptionId]
  );

  if (!selected) {
    return (
      <section className="screen-grid screen-grid--two observatory-screen">
        <PlatformGapBars rows={dataset.platformGaps.rows} maxGap={dataset.platformGaps.maxGap} unit={dataset.platformGaps.unit} />
        <aside className="panel observatory-panel insight-rail">
          <p className="muted">暂无市场价差详情。</p>
        </aside>
      </section>
    );
  }

  return (
    <section className="screen-grid screen-grid--two observatory-screen market-drilldown-screen">
      <div className="stack">
        <PlatformGapBars rows={dataset.platformGaps.rows} maxGap={dataset.platformGaps.maxGap} unit={dataset.platformGaps.unit} />
        <section className="panel observatory-panel market-option-panel" aria-label="市场价差下钻组合">
          <div className="panel__header instrument-header">
            <div>
              <h2 className="panel__title">下钻组合</h2>
              <p className="panel__meta">按平台、日期和房型查看可比样本</p>
            </div>
            <span className="demo-badge">演示数据</span>
          </div>
          <div className="market-option-list">
            {options.map((option) => (
              <DrilldownOptionButton key={option.id} option={option} selected={option.id === selected.id} onSelect={setSelectedOptionId} />
            ))}
          </div>
        </section>
      </div>

      <aside
        className="panel observatory-panel insight-rail detail-panel market-detail-panel"
        data-state={detailOpen ? 'open' : 'closed'}
        data-testid="market-drilldown-detail"
      >
        <div className="panel__header instrument-header">
          <div>
            <h2 className="panel__title">竞品价差详情</h2>
            <p className="panel__meta">
              {selected.platform} · {selected.stayDate} · {selected.roomType}
            </p>
          </div>
          <span className="status-chip status-chip--review">需人工复核</span>
        </div>

        <div className="stack">
          <div className="detail-metric">
            <span className="meta-label">本酒店价</span>
            <strong>{formatRate(selected.ownerRate)}</strong>
          </div>
          <div className="detail-metric">
            <span className="meta-label">核心竞品均价</span>
            <strong>{formatRate(selected.coreAverage)}</strong>
          </div>
          <div className="detail-metric">
            <span className="meta-label">平台价差</span>
            <strong>{formatGap(selected.gap)}</strong>
          </div>
          <div className="detail-metric">
            <span className="meta-label">核心竞品价格区间</span>
            <strong>{formatRange(selected)}</strong>
            <small>覆盖率 {formatCoverage(selected.coverage)} · 样本 {selected.sampleSize} 条</small>
          </div>

          {selected.missingSampleReason ? <p className="calendar-detail-warning">{selected.missingSampleReason}</p> : null}

          <section className="market-detail-section" aria-label="竞品样本">
            <h3>竞品样本</h3>
            <div className="market-sample-list">
              {selected.competitorSamples.map((sample) => (
                <CompetitorSampleRow key={sample.hotelId} sample={sample} />
              ))}
            </div>
          </section>

          <section className="market-detail-section" aria-label="采集时间和价格口径">
            <h3>采集时间</h3>
            <div className="calendar-rate-basis">
              <span>{formatCaptureTime(selected.captureTime)}</span>
              <span>
                {selected.rateBasis.roomType} · {selected.rateBasis.occupancy} 成人 · {selected.rateBasis.mealPlan}
              </span>
              <span>
                {selected.rateBasis.taxFeeBasis} · {selected.rateBasis.cancellationPolicy}
              </span>
            </div>
          </section>

          <section className="market-detail-section" aria-label="证据来源">
            <h3>证据来源</h3>
            <div className="calendar-evidence-list">
              {selected.evidenceMarkers.map((marker) => (
                <div className="calendar-evidence-row" key={`${marker.label}-${marker.source}-${marker.captureTime}`}>
                  <strong>{marker.label}</strong>
                  <small>
                    {marker.source} · {formatCaptureTime(marker.captureTime)} · 样本 {marker.sampleSize} 条
                  </small>
                </div>
              ))}
            </div>
          </section>

          <p className="muted">{dataset.marketDrilldown.guardrails.join(' ')}</p>
        </div>
      </aside>
    </section>
  );
}
```

- [ ] **Step 4: Run the component test and verify GREEN**

Run:

```bash
PATH=/Users/kimi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin /opt/homebrew/bin/npm --prefix app test -- tests/components/marketComparisonScreen.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Run screen regression tests**

Run:

```bash
PATH=/Users/kimi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin /opt/homebrew/bin/npm --prefix app test -- tests/components/marketComparisonScreen.test.tsx tests/components/revenueObservatoryScreens.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit the UI workflow**

```bash
git add app/src/screens/MarketComparisonScreen.tsx app/tests/components/marketComparisonScreen.test.tsx
git commit -m "feat: add market comparison drilldown UI"
```

### Task 4: Add Responsive Styling, App State, And Playwright Coverage

**Files:**
- Modify: `app/src/App.tsx`
- Modify: `app/src/styles/layout.css`
- Modify: `app/tests/e2e/app-foundation.spec.ts`

- [ ] **Step 1: Write failing Playwright expectations**

In `app/tests/e2e/app-foundation.spec.ts`, update the market screenshot cases to use detail-open state:

```typescript
['market-comparison-platform-bars--1440x900.png', '/?screen=market&state=detail-open', { width: 1440, height: 900 }],
['market-comparison-platform-bars--390x844.png', '/?screen=market&state=detail-open', { width: 390, height: 844 }],
['market-observatory--2048x1352.png', '/?screen=market&state=detail-open', { width: 2048, height: 1352 }],
```

Add this test after the calendar mobile test:

```typescript
test('market comparison drilldown updates mobile detail workflow without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?screen=market&state=detail-open');

  const detail = page.getByTestId('market-drilldown-detail');
  await expect(detail).toContainText('竞品价差详情');
  await expect(detail).toContainText('2026-05-31');
  await expect(detail).toContainText('竞品样本');
  await expect(detail).toContainText('采集时间');
  await expect(detail).toContainText('需人工复核');

  await page.getByRole('button', { name: /05\/27/ }).click();
  await expect(detail).toContainText('2026-05-27');
  await expect(detail).toContainText('暂无可比样本，需要等待人工导入或获授权来源补充。');
  await expect(detail).toContainText('缺少可比样本');
  await expect(detail).not.toContainText('CNY null');
  await expect(detail).not.toContainText('CNY 0');

  const storageWrites = await page.evaluate(() => ({
    localStorage: window.localStorage.length,
    sessionStorage: window.sessionStorage.length
  }));
  expect(storageWrites).toEqual({ localStorage: 0, sessionStorage: 0 });

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(8);
});
```

- [ ] **Step 2: Run the focused Playwright test and verify RED**

Run:

```bash
PATH=/Users/kimi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin /opt/homebrew/bin/npm --prefix app run screenshots -- --grep "market comparison drilldown"
```

Expected: FAIL before App/CSS support is complete. If the local Vite server cannot bind to `127.0.0.1`, rerun with elevated local permission and record that in Generator notes.

- [ ] **Step 3: Wire market detail state through App**

In `app/src/App.tsx`, replace the market content entry:

```typescript
market: <MarketComparisonScreen dataset={demoDataset} />,
```

with:

```typescript
market: <MarketComparisonScreen dataset={demoDataset} detailOpen={state === 'detail-open'} />,
```

- [ ] **Step 4: Add responsive CSS**

Append these styles near the existing market/platform/calendar detail styles in `app/src/styles/layout.css`:

```css
.market-drilldown-screen {
  align-items: start;
}

.market-option-panel,
.market-detail-panel,
.market-detail-section,
.market-option-list,
.market-sample-list {
  min-width: 0;
}

.market-option-list,
.market-sample-list,
.market-detail-section {
  display: grid;
  gap: var(--space-8);
}

.market-option-button {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--space-12);
  align-items: center;
  width: 100%;
  min-width: 0;
  padding: var(--space-12);
  border: var(--border-width) solid var(--observatory-inset-line);
  border-radius: var(--radius-panel);
  background: var(--observatory-node-surface);
  color: var(--color-ink);
  text-align: left;
}

.market-option-button[data-selected="true"] {
  border-color: var(--color-teal);
  box-shadow: 0 0 0 3px var(--color-active-surface), var(--shadow-soft);
}

.market-option-button strong,
.market-option-button small {
  display: block;
  overflow-wrap: anywhere;
}

.market-option-button small,
.market-sample-row small {
  color: var(--color-muted);
  font-size: var(--font-meta-size);
  line-height: var(--font-meta-line);
}

.market-sample-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--space-8) var(--space-12);
  align-items: center;
  min-width: 0;
  padding: var(--space-12);
  border: var(--border-width) solid var(--observatory-inset-line);
  border-radius: var(--radius-panel);
  background: var(--observatory-node-surface);
}

.market-sample-row > small {
  grid-column: 1 / -1;
}

.market-sample-row__rate {
  display: grid;
  gap: var(--space-4);
  justify-items: end;
  text-align: right;
}

.market-sample-row[data-status="missing-sample"],
.market-sample-row[data-status="stale"],
.market-sample-row[data-status="unavailable"],
.market-sample-row[data-status="source-error"] {
  border-style: dashed;
}
```

Inside the existing `@media (max-width: 900px)` block, add:

```css
.market-option-button,
.market-sample-row {
  grid-template-columns: minmax(0, 1fr);
}

.market-sample-row__rate {
  justify-items: start;
  text-align: left;
}
```

- [ ] **Step 5: Run focused Playwright and verify GREEN**

Run:

```bash
PATH=/Users/kimi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin /opt/homebrew/bin/npm --prefix app run screenshots -- --grep "market comparison drilldown"
```

Expected: PASS. If local server binding requires elevated permission, rerun with permission and record the exact reason in Generator notes.

- [ ] **Step 6: Run screenshot matrix**

Run:

```bash
PATH=/Users/kimi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin /opt/homebrew/bin/npm --prefix app run screenshots
```

Expected: PASS with all Playwright screenshot tests, including updated market screenshots at exact viewport sizes.

- [ ] **Step 7: Commit responsive/e2e coverage**

```bash
git add app/src/App.tsx app/src/styles/layout.css app/tests/e2e/app-foundation.spec.ts docs/test-reports/f-007-app-foundation
git commit -m "test: cover market comparison drilldown flow"
```

### Task 5: Add Generator Notes And Run Full Verification

**Files:**
- Create: `docs/test-reports/2026-05-21-f-016-generator-notes.md`

- [ ] **Step 1: Create Generator notes**

Create `docs/test-reports/2026-05-21-f-016-generator-notes.md` with:

```markdown
# F-016 Generator Notes

Date: 2026-05-21

Feature: `F-016-market-comparison-drilldown`

Role: Generator-Codex

## Scope

- Added `DemoDataset.marketDrilldown` fixture/manual data contract.
- Added selectable Market Comparison drilldown options by platform and stay date.
- Added selected detail panel with owner rate, core average, gap, competitor range, competitor sample rows, evidence, capture time, rate basis, missing-sample explanations, and human-review-only guardrails.
- Added component and Playwright coverage for available and missing-sample states.

## TDD Evidence

- RED: `tests/data/domainDrivenDataset.test.ts` failed before `marketDrilldown` existed.
- GREEN: dataset contract passed after data adapter implementation.
- RED: `tests/components/marketComparisonScreen.test.tsx` failed before selected detail UI existed.
- GREEN: component workflow passed after Market screen implementation.
- RED/GREEN: Playwright mobile drilldown test failed before App/CSS/e2e wiring and passed after implementation.

## Verification

- `PATH=/Users/kimi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin /opt/homebrew/bin/npm --prefix app test -- tests/data/domainDrivenDataset.test.ts tests/components/marketComparisonScreen.test.tsx tests/components/revenueObservatoryScreens.test.tsx`
- `PATH=/Users/kimi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin /opt/homebrew/bin/npm --prefix app run verify`
- `python3 scripts/triad_doctor.py`
- `python3 scripts/test_triad_doctor.py`
- `python3 -m json.tool progress.json`
- `python3 -m json.tool features.json`
- `python3 -m json.tool backlog.json`
- `node tests/client_demo_prototype.test.js`
- `git diff --check`

## Boundaries

- Did not change F-008 alert math.
- Did not change F-014 Calendar workflow.
- Did not change F-015 Alert Review workflow.
- Did not add live collection, backend persistence, credentials, browser storage, recommended price, or automatic pricing.
```

Replace the verification bullets with exact pass/fail outputs from the implementation session before handoff.

- [ ] **Step 2: Run targeted F-016 regression**

Run:

```bash
PATH=/Users/kimi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin /opt/homebrew/bin/npm --prefix app test -- tests/data/domainDrivenDataset.test.ts tests/components/marketComparisonScreen.test.tsx tests/components/revenueObservatoryScreens.test.tsx
```

Expected: PASS.

- [ ] **Step 3: Run full app verification**

Run:

```bash
PATH=/Users/kimi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin /opt/homebrew/bin/npm --prefix app run verify
```

Expected: production build passes, Vitest passes, Playwright passes. Playwright may require elevated local permission to bind `127.0.0.1`; record that fact if it happens.

- [ ] **Step 4: Run project checks**

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

Expected: all pass.

- [ ] **Step 5: Run product safety scans**

Run:

```bash
rg -n "(fetch\\(|XMLHttpRequest|axios|puppeteer|crawler|scrap|scrape|cookie|credential|api[_-]?key|localStorage|sessionStorage|indexedDB|CAPTCHA|captcha)" app/src
rg -n "(推荐价格|建议价格|自动定价|自动调价|自动改价|recommendedPrice|recommended price|auto[- ]?pricing|automatic pricing|pricing action)" app/src
git diff --name-only main...HEAD -- app/src/domain/pricing app/tests/domain
git ls-files app/node_modules app/dist app/test-results app/playwright-report app/tsconfig.tsbuildinfo .DS_Store
```

Expected: no unsafe hits in `app/src`, no F-008 domain pricing diff, and no generated artifacts tracked.

- [ ] **Step 6: Commit Generator handoff**

```bash
git add docs/test-reports/2026-05-21-f-016-generator-notes.md
git commit -m "chore: hand off f-016 for verification"
```

## Evaluator Handoff Checklist

Evaluator should verify:

- `marketDrilldown.options`, `selectedOptionId`, and `byId` are internally consistent.
- Available drilldown details calculate owner rate, core average, gap and competitor range from fixture/manual comparable snapshots.
- Missing, stale, unavailable and source-error samples are customer-safe and do not render `CNY null` or `CNY 0`.
- Competitor samples expose hotel identity, source, capture time and rate key boundaries.
- Market screen option selection updates detail content and selected state.
- Mobile `390x844`, desktop `1440x900`, and wide `2048x1352` screenshots have no horizontal overflow.
- No F-008 alert math, F-014 calendar workflow or F-015 alert review workflow regression.
- No live collection, backend persistence, credentials, cookie/session/CAPTCHA, browser storage, recommended price or automatic pricing.
- Project PRD and development plan remain fresh after implementation.

## Plan Self-Review

- Spec coverage: Tasks 1-2 cover data contract and missing/stale status rules; Task 3 covers UI selection and detail; Task 4 covers responsive Playwright behavior; Task 5 covers verification and handoff.
- Placeholder scan: This plan contains concrete file paths, code snippets, commands, expected RED/GREEN results and commit messages.
- Type consistency: `MarketComparisonDrilldown`, `MarketDrilldownOption`, `MarketDrilldownDetail`, `MarketCompetitorSample`, `MarketSampleStatus`, `CalendarEventImpact`, and `CalendarRateBasis` are introduced in Task 1 and used consistently in later tasks.
