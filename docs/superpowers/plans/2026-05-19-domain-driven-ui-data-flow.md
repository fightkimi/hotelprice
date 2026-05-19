# Domain-Driven UI Data Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to execute this plan task-by-task. Use `superpowers:test-driven-development` for every coding task: write the failing test first, verify red, implement the smallest change, verify green, then refactor.

**Goal:** Replace the F-007 hand-authored demo dataset source with a domain-driven fixture pipeline that uses the accepted F-008 pricing domain core and feeds the existing F-007 UI contract.

**Architecture:** Keep F-007 screens and components as the presentation layer. Add fixture/manual seed data plus a pure adapter under `app/src/data/`. The adapter calls F-008 domain functions and returns the existing `DemoDataset` shape.

**Tech Stack:** TypeScript, React, Vitest, Testing Library, Playwright, existing Vite app workspace, no new runtime dependencies.

---

## Scope Check

This feature connects accepted domain logic to accepted UI data contracts. It does not add live collection, API routes, persistence, auth, connector code, browser automation, external requests, automatic pricing, or recommended new prices.

B-027 owner-position evidence enrichment is non-blocking. Do not change F-008 evidence semantics only to close B-027 during this slice. Adapter-level owner-position copy may use existing top-level owner alert fields plus competitor evidence.

## Planned File Changes

Create:

- `app/src/data/domainSeed.ts`
- `app/src/data/domainDrivenDataset.ts`
- `app/tests/data/domainDrivenDataset.test.ts`
- `docs/test-reports/2026-05-19-f-009-generator-notes.md`

Modify:

- `app/src/data/demoDataset.ts`
- `app/src/App.tsx` only if the app imports need a direct generated dataset name.
- `app/tests/contract/demoDataset.test.ts`
- `features.json`
- `progress.json`
- `backlog.json`
- `.auto-memory/project-status.md`

Avoid modifying unless a failing test proves it is necessary:

- `app/src/screens/*`
- `app/src/components/*`
- `app/src/styles/*`
- `app/src/domain/pricing/*`
- `app/tests/e2e/app-foundation.spec.ts`
- package or build configuration

## Task 1: Domain Fixture Seed

**Files:**

- Create: `app/src/data/domainSeed.ts`
- Test: `app/tests/data/domainDrivenDataset.test.ts`

- [ ] **Step 1: Write the failing seed tests**

Create `app/tests/data/domainDrivenDataset.test.ts` with a first describe block that imports `domainSeed` from `../../src/data/domainSeed`.

Test requirements:

- seed has one active owner hotel;
- seed has at least three active core competitors in the same `ownerPropertyId` and `competitorGroupId`;
- every snapshot uses `sourceKind: "fixture"` or `"manual"`;
- every snapshot has a comparable rate key with channel, source id, stay date, checkout date, currency, occupancy, room type, meal plan, cancellation policy, and tax/fee basis;
- seed includes at least one unavailable/no-rate/source-error/stale-prone snapshot so missing-data UI behavior is tested;
- seed includes event annotations for weekend, Dragon Boat demo holiday, expo demo day, and concert demo day.

Suggested test skeleton:

```ts
import { describe, expect, it } from 'vitest';
import { domainSeed } from '../../src/data/domainSeed';

describe('domain seed data', () => {
  it('contains one owner and at least three active core competitors in the same market', () => {
    const ownerHotels = domainSeed.hotels.filter((hotel) => hotel.role === 'owner' && hotel.active);
    const coreCompetitors = domainSeed.hotels.filter((hotel) => hotel.role === 'competitor' && hotel.competitorLevel === 'core' && hotel.active);

    expect(ownerHotels).toHaveLength(1);
    expect(coreCompetitors.length).toBeGreaterThanOrEqual(3);
    expect(new Set(coreCompetitors.map((hotel) => hotel.ownerPropertyId))).toEqual(new Set([ownerHotels[0].ownerPropertyId]));
    expect(new Set(coreCompetitors.map((hotel) => hotel.competitorGroupId))).toEqual(new Set([ownerHotels[0].competitorGroupId]));
  });

  it('keeps snapshots fixture or manual and fully comparable', () => {
    for (const snapshot of domainSeed.snapshots) {
      expect(['fixture', 'manual']).toContain(snapshot.sourceKind);
      expect(snapshot.rateKey.channel).toBeTruthy();
      expect(snapshot.rateKey.sourceId).toBeTruthy();
      expect(snapshot.rateKey.stayDate).toMatch(/^2026-/);
      expect(snapshot.rateKey.checkoutDate).toMatch(/^2026-/);
      expect(snapshot.rateKey.currency).toBe('CNY');
      expect(snapshot.rateKey.occupancyAdults).toBeGreaterThan(0);
      expect(snapshot.rateKey.roomTypeKey).toBeTruthy();
      expect(snapshot.rateKey.mealPlan).toBeTruthy();
      expect(snapshot.rateKey.cancellationPolicy).toBeTruthy();
      expect(snapshot.rateKey.taxFeeBasis).toBeTruthy();
    }
  });
});
```

- [ ] **Step 2: Verify RED**

Run:

```bash
cd app
npm test -- tests/data/domainDrivenDataset.test.ts
```

Expected: FAIL because `domainSeed` does not exist.

- [ ] **Step 3: Implement the domain seed**

Create `app/src/data/domainSeed.ts`.

Export:

- `domainSeed.hotels`
- `domainSeed.snapshots`
- `domainSeed.events`
- `domainSeed.now`
- `domainSeed.context`

Implementation constraints:

- Use `HotelProfile` and `RateSnapshot` from `../domain/pricing`.
- Use only fixture/manual data.
- Include enough snapshots to emit at least one alert candidate from `generateAlertCandidates`.
- Include unavailable/no-rate/source-error examples that are preserved as evidence for missing UI states but do not create pricing alerts.
- Keep dates aligned with F-007 demo dates around `2026-05-24` to `2026-06-02`.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
cd app
npm test -- tests/data/domainDrivenDataset.test.ts
```

Expected: PASS for the seed tests.

## Task 2: Alert Candidate To Signal Adapter

**Files:**

- Create: `app/src/data/domainDrivenDataset.ts`
- Modify: `app/tests/data/domainDrivenDataset.test.ts`

- [ ] **Step 1: Add failing adapter tests for signals**

Extend `app/tests/data/domainDrivenDataset.test.ts`:

```ts
import { buildDomainDrivenDemoDataset } from '../../src/data/domainDrivenDataset';

describe('domain-driven demo dataset signals', () => {
  it('builds pricing-sensitive signals from domain alert candidates', () => {
    const dataset = buildDomainDrivenDemoDataset(domainSeed);

    expect(dataset.signals.length).toBeGreaterThan(0);
    expect(dataset.signals.every((signal) => signal.humanReviewRequired)).toBe(true);
    expect(dataset.signals.some((signal) => signal.id.includes('owner') || signal.id.includes('market') || signal.id.includes('competitor'))).toBe(true);
  });

  it('maps domain evidence into customer-safe evidence markers', () => {
    const dataset = buildDomainDrivenDemoDataset(domainSeed);

    for (const signal of dataset.signals) {
      expect(signal.evidenceMarkers.length).toBeGreaterThan(0);
      for (const marker of signal.evidenceMarkers) {
        expect(marker.source).toMatch(/演示源|fixture|manual/i);
        expect(marker.captureTime).toMatch(/^2026-/);
        expect(marker.sampleSize).toBeGreaterThan(0);
      }
    }
  });
});
```

- [ ] **Step 2: Verify RED**

Run:

```bash
cd app
npm test -- tests/data/domainDrivenDataset.test.ts
```

Expected: FAIL because the adapter does not exist.

- [ ] **Step 3: Implement signal mapping**

Create `app/src/data/domainDrivenDataset.ts`.

Core API:

```ts
import { generateAlertCandidates } from '../domain/pricing';
import type { AlertCandidate } from '../domain/pricing';
import type { DemoDataset, EvidenceMarker, Signal } from '../types/contracts';
import { domainSeed } from './domainSeed';

export interface DomainDrivenDemoSeed {
  hotels: typeof domainSeed.hotels;
  snapshots: typeof domainSeed.snapshots;
  events: typeof domainSeed.events;
  now: string;
  context: typeof domainSeed.context;
}

export function buildDomainDrivenDemoDataset(seed: DomainDrivenDemoSeed = domainSeed): DemoDataset {
  const alerts = generateAlertCandidates({
    hotels: seed.hotels,
    snapshots: seed.snapshots,
    now: seed.now
  });

  return {
    sourceKind: 'fixture-demo',
    liveCollectionEnabled: false,
    demoDisclosure: '演示数据：本页仅使用静态样例，不连接真实平台或客户系统。',
    context: buildContext(seed),
    trend: buildTrend(seed),
    heatmap: buildHeatmap(seed),
    platformGaps: buildPlatformGaps(seed),
    signals: alerts.map(mapAlertToSignal)
  };
}

export const domainDrivenDemoDataset = buildDomainDrivenDemoDataset(domainSeed);
```

Mapping guidance:

- `competitor_increase` and `competitor_decrease` become competitor movement signals.
- `market_increase` and `market_decrease` become market trend signals.
- `owner_low_risk` and `owner_high_risk` become owner-position review signals.
- `severity: "risk"` maps to `Signal.severity: "risk"`.
- domain `warning` maps to UI `warning`.
- domain `info` maps to UI `normal` unless the signal is specifically a sample-quality caveat.
- `primaryMetric` can use rounded CNY delta for price alerts or rounded percentage for movement alerts, but copy must avoid recommended price language.
- `EvidenceMarker.confidence` should be `sample` when sample size is at least 3, otherwise `partial`; unavailable markers use `unavailable`.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
cd app
npm test -- tests/data/domainDrivenDataset.test.ts
```

Expected: PASS.

## Task 3: Trend, Heatmap, And Platform Gap Adapter

**Files:**

- Modify: `app/src/data/domainDrivenDataset.ts`
- Modify: `app/tests/data/domainDrivenDataset.test.ts`

- [ ] **Step 1: Add failing chart and missing-data tests**

Extend `app/tests/data/domainDrivenDataset.test.ts`:

```ts
describe('domain-driven demo dataset charts', () => {
  it('builds trend series and platform gaps from comparable domain snapshots', () => {
    const dataset = buildDomainDrivenDemoDataset(domainSeed);

    expect(dataset.trend.series.map((series) => series.id)).toEqual(['owner-rate', 'core-average', 'event-lift']);
    expect(dataset.platformGaps.rows.length).toBeGreaterThanOrEqual(3);

    for (const series of dataset.trend.series) {
      for (const point of series.points) {
        expect(point.currency).toBe('CNY');
        expect(point.rateKey.roomType).toBe(dataset.context.roomType);
        expect(point.rateKey.competitorGroupId).toBeTruthy();
        expect(point.taxFeeBasis).toBeTruthy();
        expect(point.cancellationPolicy).toBeTruthy();
      }
    }
  });

  it('renders unavailable source states as null values rather than zero prices', () => {
    const dataset = buildDomainDrivenDemoDataset(domainSeed);
    const unavailableDays = dataset.heatmap.days.filter((day) => day.status === 'unavailable');

    expect(unavailableDays.length).toBeGreaterThan(0);
    for (const day of unavailableDays) {
      expect(day.intensity).toBeNull();
      expect(day.ownerRate).toBeNull();
      expect(day.coreAverage).toBeNull();
      expect(day.sampleSize).toBe(0);
    }

    const allPointValues = dataset.trend.series.flatMap((series) => series.points.map((point) => point.value));
    expect(allPointValues).not.toContain(0);
  });
});
```

- [ ] **Step 2: Verify RED**

Run:

```bash
cd app
npm test -- tests/data/domainDrivenDataset.test.ts
```

Expected: FAIL until chart and missing-data mapping is implemented.

- [ ] **Step 3: Implement chart mapping**

Implementation guidance:

- Derive latest available owner prices by stay date for `owner-rate`.
- Derive active core competitor average by stay date for `core-average`.
- Derive `event-lift` from seed event annotations, not from live data.
- Generate `HeatmapDay` from the same stay-date set.
- Use `null` for unavailable or insufficient sample dates.
- Generate `PlatformGapRow` by platform/source from latest comparable owner rate and active core average.
- Compute `coverage` from available samples divided by expected core competitor samples for that platform/date context.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
cd app
npm test -- tests/data/domainDrivenDataset.test.ts
```

Expected: PASS.

## Task 4: Wire The Existing UI To The Domain-Driven Dataset

**Files:**

- Modify: `app/src/data/demoDataset.ts`
- Modify: `app/src/App.tsx` only if import naming requires it.
- Modify: `app/tests/contract/demoDataset.test.ts`

- [ ] **Step 1: Add failing contract tests for domain source of truth**

Update `app/tests/contract/demoDataset.test.ts` so it verifies:

- `demoDataset` equals or re-exports `domainDrivenDemoDataset`;
- `demoDataset.signals` remains non-empty and human-review-only;
- no generated signal summary contains automatic pricing or live collection language;
- generated trend and heatmap data include at least one unavailable/missing state.

Suggested assertion:

```ts
import { domainDrivenDemoDataset } from '../../src/data/domainDrivenDataset';

it('uses the domain-driven dataset as the UI source of truth', () => {
  expect(demoDataset).toBe(domainDrivenDemoDataset);
});
```

- [ ] **Step 2: Verify RED**

Run:

```bash
cd app
npm test -- tests/contract/demoDataset.test.ts
```

Expected: FAIL while `demoDataset` remains hand-authored.

- [ ] **Step 3: Re-export generated dataset**

Replace `app/src/data/demoDataset.ts` with a compatibility export:

```ts
export { domainDrivenDemoDataset as demoDataset } from './domainDrivenDataset';
```

If `App.tsx` imports `demoDataset`, no app wiring change should be needed. If a clearer generated name is preferred, update the import and keep tests explicit.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
cd app
npm test -- tests/contract/demoDataset.test.ts tests/data/domainDrivenDataset.test.ts
```

Expected: PASS.

## Task 5: Safety, Regression, And Visual Verification

**Files:**

- Update: `docs/test-reports/2026-05-19-f-009-generator-notes.md`
- Update status files after verification.

- [ ] **Step 1: Add or extend a static safety test if needed**

If the existing domain compliance scan does not cover `app/src/data/domainSeed.ts` and `app/src/data/domainDrivenDataset.ts`, extend a test to scan those files for prohibited live-collection behavior.

Required prohibited patterns include:

- `fetch`
- `XMLHttpRequest`
- `axios`
- `http`
- `https`
- `socket`
- `playwright`
- `selenium`
- `puppeteer`
- `cookie`
- `captcha`
- `token`
- `password`
- `apiKey`
- automatic pricing or automatic rate update wording in customer-facing strings

- [ ] **Step 2: Run focused tests**

Run:

```bash
cd app
npm test -- tests/data/domainDrivenDataset.test.ts tests/contract/demoDataset.test.ts tests/domain
```

Expected: PASS.

- [ ] **Step 3: Run full app verification**

Run:

```bash
cd app
npm run verify
```

Expected: PASS, including build, Vitest, and Playwright screenshot matrix.

- [ ] **Step 4: Run project-level regression checks**

Run from repository root:

```bash
python3 scripts/triad_doctor.py
python3 scripts/test_triad_doctor.py
python3 -m json.tool progress.json
python3 -m json.tool features.json
python3 -m json.tool backlog.json
node tests/client_demo_prototype.test.js
```

Expected: PASS. The static prototype regression should remain unaffected.

- [ ] **Step 5: Record Generator notes**

Create `docs/test-reports/2026-05-19-f-009-generator-notes.md` with:

- red/green evidence for each TDD step;
- commands run and outcomes;
- confirmation that data is fixture/manual only;
- confirmation that F-007 UI gates still pass;
- confirmation that F-008 domain tests still pass;
- note that B-027 remains non-blocking unless separately implemented.

## Task 6: Status Updates And Handoff

**Files:**

- Modify: `features.json`
- Modify: `progress.json`
- Modify: `backlog.json`
- Modify: `.auto-memory/project-status.md`

- [ ] **Step 1: Update feature and backlog state**

After successful Generator verification:

- set `F-009-domain-driven-ui-data-flow` to `verifying`;
- mark the Generator backlog item done;
- add or activate the Evaluator verification backlog item;
- keep B-027 non-blocking unless a separate accepted change explicitly closes it.

- [ ] **Step 2: Update project status**

Update `.auto-memory/project-status.md` with:

- implemented files;
- verification commands and outcomes;
- remaining risks;
- next step for Evaluator.

- [ ] **Step 3: Commit the F-009 implementation**

Use a feature-branch commit message such as:

```bash
git add app/src/data/domainSeed.ts app/src/data/domainDrivenDataset.ts app/src/data/demoDataset.ts app/tests/data/domainDrivenDataset.test.ts app/tests/contract/demoDataset.test.ts docs/test-reports/2026-05-19-f-009-generator-notes.md features.json progress.json backlog.json .auto-memory/project-status.md
git commit -m "feat: connect domain core to app dataset"
```

Do not push directly to `main` or `master`.
