# Data Scope And Capture Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing Setup/Data Scope screen into a typed data-scope and capture-entry preview, derived from the domain seed and safe for customer demos.

**Architecture:** Extend the existing `DemoDataset` contract with `dataScope` and `captureEntry`, derive those objects from `domainSeed` through a pure data helper, and render them in `SetupDataScopeScreen`. Keep all behavior local and fixture/manual-only. Do not add backend routes, persistence, file uploads, network requests, credentials, browser automation, or automatic pricing.

**Tech Stack:** TypeScript, React, Vitest, Testing Library, Playwright, existing Vite app workspace, no new dependencies.

---

## Scope Check

This slice is a setup/data-contract slice. It does not collect real data. It only presents a compliant entry preview for local fixture data, manual import readiness, and approved API readiness.

## Planned File Changes

Modify:

- `app/src/types/contracts.ts`
- `app/src/data/domainDrivenDataset.ts`
- `app/src/screens/SetupDataScopeScreen.tsx`
- `app/src/styles/layout.css`
- `app/tests/contract/demoDataset.test.ts`
- `app/tests/data/domainDrivenDataset.test.ts`
- `app/tests/domain/complianceScan.test.ts`
- `app/tests/e2e/app-foundation.spec.ts`
- `features.json`
- `progress.json`
- `backlog.json`
- `.auto-memory/project-status.md`

Create:

- `app/src/data/dataScope.ts`
- `app/tests/components/setupDataScopeScreen.test.tsx`
- `docs/test-reports/2026-05-19-f-011-generator-notes.md`

Do not modify:

- Domain alert thresholds.
- `app/src/domain/pricing/alertRules.ts` unless a failing F-011 test proves a direct type compatibility issue.
- Package/build config.
- Backend, persistence, or API files.

## Task 1: Add Dataset Contract Tests

**Files:**

- Modify: `app/tests/contract/demoDataset.test.ts`
- Modify: `app/tests/data/domainDrivenDataset.test.ts`

- [ ] **Step 1: Add a failing contract test for data scope and capture entry**

Append this test to `app/tests/contract/demoDataset.test.ts`:

```ts
  it('exposes bounded data scope and capture entry preview', () => {
    expect(demoDataset.dataScope.ownerPropertyId).toBeTruthy();
    expect(demoDataset.dataScope.ownerHotelId).toBeTruthy();
    expect(demoDataset.dataScope.competitorGroupId).toBeTruthy();
    expect(demoDataset.dataScope.competitorCoverage.coreCount).toBeGreaterThanOrEqual(3);
    expect(demoDataset.dataScope.platforms.length).toBeGreaterThanOrEqual(4);
    expect(demoDataset.dataScope.stayWindow.totalStayDates).toBeGreaterThan(0);
    expect(demoDataset.dataScope.rateBasis.currency).toBe('CNY');
    expect(demoDataset.dataScope.rateBasis.roomTypes.length).toBeGreaterThan(0);
    expect(demoDataset.dataScope.rateBasis.taxFeeBasis.length).toBeGreaterThan(0);

    expect(demoDataset.captureEntry.productionConnectionEnabled).toBe(false);
    expect(demoDataset.captureEntry.activeEntryId).toBe('fixture-demo');
    expect(demoDataset.captureEntry.options.map((option) => option.id)).toEqual([
      'fixture-demo',
      'manual-import',
      'approved-api'
    ]);
    expect(demoDataset.captureEntry.options.every((option) => option.humanReviewRequired)).toBe(true);
  });
```

- [ ] **Step 2: Add a failing adapter derivation test**

Append this test to `app/tests/data/domainDrivenDataset.test.ts`:

```ts
describe('domain-driven data scope and capture entry', () => {
  it('derives scope boundaries from domain seed hotels and snapshots', () => {
    const dataset = buildDomainDrivenDemoDataset(domainSeed);

    expect(dataset.dataScope.ownerPropertyId).toBe(domainSeed.context.ownerPropertyId);
    expect(dataset.dataScope.ownerHotelId).toBe(domainSeed.context.ownerHotelId);
    expect(dataset.dataScope.competitorGroupId).toBe(domainSeed.context.competitorGroupId);
    expect(dataset.dataScope.competitorCoverage.coreCount).toBeGreaterThanOrEqual(3);
    expect(dataset.dataScope.platforms.map((platform) => platform.label)).toEqual(
      domainSeed.platforms.map((platform) => platform.label)
    );
    expect(dataset.dataScope.stayWindow).toMatchObject({
      startDate: '2026-05-24',
      endDate: '2026-06-02',
      focusDate: domainSeed.context.platformFocusDate
    });
    expect(dataset.dataScope.freshness.staleAfterHours).toBe(36);
  });

  it('keeps capture entry local, review-gated, and production-disabled', () => {
    const dataset = buildDomainDrivenDemoDataset(domainSeed);

    expect(dataset.captureEntry.productionConnectionEnabled).toBe(false);
    expect(dataset.captureEntry.options).toEqual([
      expect.objectContaining({ id: 'fixture-demo', status: 'active', sourceKind: 'fixture', humanReviewRequired: true }),
      expect.objectContaining({ id: 'manual-import', status: 'available', sourceKind: 'manual', humanReviewRequired: true }),
      expect.objectContaining({ id: 'approved-api', status: 'requires-approval', sourceKind: 'approved_api', humanReviewRequired: true })
    ]);
  });
});
```

- [ ] **Step 3: Run the tests and verify RED**

Run:

```bash
cd app
/opt/homebrew/bin/npm test -- tests/contract/demoDataset.test.ts tests/data/domainDrivenDataset.test.ts
```

Expected: FAIL because `DemoDataset` does not yet expose `dataScope` or `captureEntry`.

## Task 2: Add Data Scope Types And Pure Derivation

**Files:**

- Modify: `app/src/types/contracts.ts`
- Create: `app/src/data/dataScope.ts`
- Modify: `app/src/data/domainDrivenDataset.ts`

- [ ] **Step 1: Extend contract types**

Add these types to `app/src/types/contracts.ts`:

```ts
export interface DataScopePlatform {
  label: string;
  channel: string;
  sourceId: string;
  sourceKind: 'fixture' | 'manual' | 'approved_api';
  enabled: boolean;
}

export interface DataScopeSummary {
  ownerPropertyId: string;
  ownerHotelId: string;
  ownerHotelName: string;
  competitorGroupId: string;
  competitorGroupLabel: string;
  competitorCoverage: {
    coreCount: number;
    referenceCount: number;
    activeHotelIds: string[];
  };
  platforms: DataScopePlatform[];
  stayWindow: {
    startDate: string;
    endDate: string;
    totalStayDates: number;
    focusDate: string;
  };
  rateBasis: {
    currency: 'CNY';
    occupancyAdults: number[];
    roomTypes: string[];
    mealPlans: string[];
    cancellationPolicies: string[];
    taxFeeBasis: string[];
  };
  freshness: {
    currentCaptureTime: string;
    staleAfterHours: number;
  };
  guardrails: string[];
}

export type CaptureEntryId = 'fixture-demo' | 'manual-import' | 'approved-api';
export type CaptureEntryStatus = 'active' | 'available' | 'requires-approval' | 'blocked';

export interface CaptureEntryOption {
  id: CaptureEntryId;
  label: string;
  sourceKind: 'fixture' | 'manual' | 'approved_api';
  status: CaptureEntryStatus;
  description: string;
  humanReviewRequired: boolean;
}

export interface CaptureEntryPreview {
  productionConnectionEnabled: false;
  activeEntryId: CaptureEntryId;
  options: CaptureEntryOption[];
  policyNotes: string[];
}
```

Then add these fields to `DemoDataset`:

```ts
  dataScope: DataScopeSummary;
  captureEntry: CaptureEntryPreview;
```

- [ ] **Step 2: Create a pure data-scope helper**

Create `app/src/data/dataScope.ts`:

```ts
import type { CaptureEntryPreview, DataScopeSummary } from '../types/contracts';
import type { DomainDemoSeed } from './domainSeed';

const staleAfterHours = 36;

function uniqueSorted<T extends string | number>(values: T[]): T[] {
  return [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b)));
}

function sourceKindForSource(seed: DomainDemoSeed, sourceId: string): DataScopeSummary['platforms'][number]['sourceKind'] {
  const kinds = new Set(seed.snapshots.filter((snapshot) => snapshot.rateKey.sourceId === sourceId).map((snapshot) => snapshot.sourceKind));
  if (kinds.has('manual')) {
    return 'manual';
  }
  if (kinds.has('approved_api')) {
    return 'approved_api';
  }
  return 'fixture';
}

export function buildDataScopeSummary(seed: DomainDemoSeed): DataScopeSummary {
  const owner = seed.hotels.find((hotel) => hotel.role === 'owner' && hotel.active);
  if (!owner) {
    throw new Error('Data scope requires one active owner hotel.');
  }

  const activeCompetitors = seed.hotels.filter((hotel) => hotel.role === 'competitor' && hotel.active);
  const stayDates = uniqueSorted(seed.snapshots.map((snapshot) => snapshot.rateKey.stayDate));
  const rateKeys = seed.snapshots.map((snapshot) => snapshot.rateKey);

  return {
    ownerPropertyId: seed.context.ownerPropertyId,
    ownerHotelId: seed.context.ownerHotelId,
    ownerHotelName: owner.name,
    competitorGroupId: seed.context.competitorGroupId,
    competitorGroupLabel: '核心竞品组 A：同商圈中高端酒店',
    competitorCoverage: {
      coreCount: activeCompetitors.filter((hotel) => hotel.competitorLevel === 'core').length,
      referenceCount: activeCompetitors.filter((hotel) => hotel.competitorLevel === 'reference').length,
      activeHotelIds: activeCompetitors.map((hotel) => hotel.hotelId)
    },
    platforms: seed.platforms.map((platform) => ({
      label: platform.label,
      channel: platform.channel,
      sourceId: platform.sourceId,
      sourceKind: sourceKindForSource(seed, platform.sourceId),
      enabled: true
    })),
    stayWindow: {
      startDate: stayDates[0],
      endDate: stayDates[stayDates.length - 1],
      totalStayDates: stayDates.length,
      focusDate: seed.context.platformFocusDate
    },
    rateBasis: {
      currency: 'CNY',
      occupancyAdults: uniqueSorted(rateKeys.map((rateKey) => rateKey.occupancyAdults)),
      roomTypes: [seed.context.roomTypeLabel],
      mealPlans: uniqueSorted(rateKeys.map((rateKey) => rateKey.mealPlan)),
      cancellationPolicies: uniqueSorted(rateKeys.map((rateKey) => rateKey.cancellationPolicy)),
      taxFeeBasis: uniqueSorted(rateKeys.map((rateKey) => rateKey.taxFeeBasis))
    },
    freshness: {
      currentCaptureTime: seed.now,
      staleAfterHours
    },
    guardrails: ['演示样本', '人工复核', '生产连接关闭', '按房型与税费口径比较']
  };
}

export function buildCaptureEntryPreview(): CaptureEntryPreview {
  return {
    productionConnectionEnabled: false,
    activeEntryId: 'fixture-demo',
    options: [
      {
        id: 'fixture-demo',
        label: '当前演示样本',
        sourceKind: 'fixture',
        status: 'active',
        description: '使用本地样例数据展示范围、覆盖率和复核入口。',
        humanReviewRequired: true
      },
      {
        id: 'manual-import',
        label: '手工导入预览',
        sourceKind: 'manual',
        status: 'available',
        description: '用于后续接收人工整理的数据表，并进入人工复核。',
        humanReviewRequired: true
      },
      {
        id: 'approved-api',
        label: '批准接口预览',
        sourceKind: 'approved_api',
        status: 'requires-approval',
        description: '仅在完成授权与速率规则后开放，当前不连接真实平台。',
        humanReviewRequired: true
      }
    ],
    policyNotes: ['不连接真实平台', '不保存生产账号', '不执行价格动作', '所有结果进入人工复核']
  };
}
```

- [ ] **Step 3: Attach scope and entry to the dataset**

In `app/src/data/domainDrivenDataset.ts`, import:

```ts
import { buildCaptureEntryPreview, buildDataScopeSummary } from './dataScope';
```

In `buildDomainDrivenDemoDataset(seed)`, add:

```ts
dataScope: buildDataScopeSummary(seed),
captureEntry: buildCaptureEntryPreview(),
```

- [ ] **Step 4: Run the dataset tests and verify GREEN**

Run:

```bash
cd app
/opt/homebrew/bin/npm test -- tests/contract/demoDataset.test.ts tests/data/domainDrivenDataset.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit data scope contract**

Run:

```bash
git add app/src/types/contracts.ts app/src/data/dataScope.ts app/src/data/domainDrivenDataset.ts app/tests/contract/demoDataset.test.ts app/tests/data/domainDrivenDataset.test.ts
git commit -m "feat: add data scope and capture entry contract"
```

## Task 3: Render Data Scope And Capture Entry

**Files:**

- Modify: `app/src/screens/SetupDataScopeScreen.tsx`
- Modify: `app/src/styles/layout.css`
- Create: `app/tests/components/setupDataScopeScreen.test.tsx`
- Modify: `app/tests/e2e/app-foundation.spec.ts`

- [ ] **Step 1: Add failing component test**

Create `app/tests/components/setupDataScopeScreen.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { demoDataset } from '../../src/data/demoDataset';
import { SetupDataScopeScreen } from '../../src/screens/SetupDataScopeScreen';

describe('SetupDataScopeScreen', () => {
  it('renders data scope and capture entry preview without unsafe visible copy', () => {
    render(<SetupDataScopeScreen dataset={demoDataset} />);

    expect(screen.getByRole('heading', { name: '数据范围' })).toBeVisible();
    expect(screen.getByRole('heading', { name: '采集入口' })).toBeVisible();
    expect(screen.getByText('当前演示样本')).toBeVisible();
    expect(screen.getByText('手工导入预览')).toBeVisible();
    expect(screen.getByText('批准接口预览')).toBeVisible();
    expect(screen.getByText(/核心竞品/)).toBeVisible();
    expect(screen.getByText(/入住日期/)).toBeVisible();
    expect(screen.getByText(/含税/)).toBeVisible();
    expect(screen.getAllByText(/人工复核/).length).toBeGreaterThan(0);
    expect(screen.getByText('当前关闭')).toBeVisible();

    const visibleText = document.body.innerText;
    expect(visibleText).not.toMatch(/自动调价|自动改价|cookie|token|crawler|scraper|captcha|recommendedPrice/i);
  });
});
```

- [ ] **Step 2: Run the component test and verify RED**

Run:

```bash
cd app
/opt/homebrew/bin/npm test -- tests/components/setupDataScopeScreen.test.tsx
```

Expected: FAIL because the current setup screen does not render the new headings and capture entries.

- [ ] **Step 3: Update the setup screen**

In `app/src/screens/SetupDataScopeScreen.tsx`:

- render a primary panel titled `数据范围`;
- render scope rows from `dataset.dataScope`;
- render platform rows from `dataset.dataScope.platforms`;
- render a side panel titled `采集入口`;
- render each `dataset.captureEntry.options` as a row with status chip and human review marker;
- keep `生产连接` as `当前关闭`;
- use safe visible copy only.

Use existing classes where possible:

```tsx
const statusLabel = {
  active: '当前使用',
  available: '可进入复核',
  'requires-approval': '需完成授权',
  blocked: '暂不可用'
} satisfies Record<CaptureEntryStatus, string>;
```

Keep any action text read-only, for example `进入人工复核预览`; do not add real upload or network behavior.

- [ ] **Step 4: Add focused layout styles**

In `app/src/styles/layout.css`, add small scoped classes near the existing setup styles:

```css
.scope-grid,
.capture-entry-list,
.platform-scope-list {
  display: grid;
  gap: var(--space-12);
}

.scope-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.capture-entry-row,
.platform-scope-row {
  display: grid;
  gap: var(--space-8);
  min-width: 0;
  padding: var(--space-12);
  border: var(--border-width) solid var(--color-line);
  border-radius: var(--radius-panel);
  background: var(--color-surface-raised);
}

.capture-entry-row__top,
.platform-scope-row__top {
  display: flex;
  gap: var(--space-8);
  align-items: flex-start;
  justify-content: space-between;
}
```

Inside the existing mobile media query, add:

```css
  .scope-grid {
    grid-template-columns: 1fr;
  }
```

- [ ] **Step 5: Verify component test GREEN**

Run:

```bash
cd app
/opt/homebrew/bin/npm test -- tests/components/setupDataScopeScreen.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Update setup screenshot test only if needed**

Run the existing Playwright gate in full verification later. If setup screenshot artifacts change, include the changed setup screenshot PNG files in the feature commit. Do not remove other screenshot gates.

- [ ] **Step 7: Commit setup UI**

Run:

```bash
git add app/src/screens/SetupDataScopeScreen.tsx app/src/styles/layout.css app/tests/components/setupDataScopeScreen.test.tsx app/tests/e2e/app-foundation.spec.ts docs/test-reports/f-007-app-foundation/
git commit -m "feat: render data scope capture entry"
```

## Task 4: Safety And Regression Verification

**Files:**

- Modify: `app/tests/domain/complianceScan.test.ts`
- Create: `docs/test-reports/2026-05-19-f-011-generator-notes.md`
- Modify: `features.json`
- Modify: `progress.json`
- Modify: `backlog.json`
- Modify: `.auto-memory/project-status.md`

- [ ] **Step 1: Extend the compliance scan**

In `app/tests/domain/complianceScan.test.ts`, add `src/data/dataScope.ts` to the scanned files.

- [ ] **Step 2: Run targeted tests**

Run:

```bash
cd app
/opt/homebrew/bin/npm test -- tests/contract/demoDataset.test.ts tests/data/domainDrivenDataset.test.ts tests/components/setupDataScopeScreen.test.tsx tests/domain/complianceScan.test.ts
```

Expected: PASS.

- [ ] **Step 3: Run full app verification**

Run:

```bash
cd app
/opt/homebrew/bin/npm run verify
```

Expected: build passes, Vitest passes, and Playwright screenshot gate passes.

- [ ] **Step 4: Run project checks**

Run from project root:

```bash
python3 scripts/triad_doctor.py
python3 scripts/test_triad_doctor.py
python3 -m json.tool progress.json
python3 -m json.tool features.json
python3 -m json.tool backlog.json
node tests/client_demo_prototype.test.js
```

Expected: all commands exit 0.

- [ ] **Step 5: Run static safety scan**

Run:

```bash
rg -n "(cookie|token|credential|captcha|scrap|scrape|crawler|puppeteer|playwright|fetch\\(|XMLHttpRequest|axios|localStorage|sessionStorage|IndexedDB|automatic pricing|auto[- ]?price|recommendedPriceCents|recommendedPrice|自动调价|自动改价|爬虫|抓取|验证码|凭证|密钥)" app/src/data/dataScope.ts app/src/data/domainDrivenDataset.ts app/src/screens/SetupDataScopeScreen.tsx app/src/types/contracts.ts
```

Expected: no matches.

- [ ] **Step 6: Record Generator notes**

Create `docs/test-reports/2026-05-19-f-011-generator-notes.md` with red/green evidence for:

- dataset contract test;
- adapter derivation test;
- setup component test;
- targeted regression;
- full app verification;
- static safety scan;
- any changed setup screenshot artifacts.

- [ ] **Step 7: Update state for Evaluator**

Update:

- `features.json`: set `F-011-data-scope-capture-entry` to `verifying`, executor `generator`, and add source/test/report artifacts.
- `progress.json`: set `status` to `verifying`, `batch_id` to `data-scope-capture-entry`, and `current_sprint` to `F-011-data-scope-capture-entry`.
- `backlog.json`: mark the Generator item done and keep the Evaluator item new.
- `.auto-memory/project-status.md`: record implementation facts and make Evaluator verification the next step.

- [ ] **Step 8: Commit handoff state**

Run:

```bash
git add docs/test-reports/2026-05-19-f-011-generator-notes.md features.json progress.json backlog.json .auto-memory/project-status.md
git commit -m "chore: hand off f-011 for verification"
```

## Evaluator Checklist

- Dataset exposes `dataScope` and `captureEntry`.
- Data scope derives from domain seed and preserves property, competitor, channel, stay date, room type, occupancy, currency, tax/fee, meal plan, cancellation, freshness, and capture-time boundaries.
- Capture entry options are fixture/manual/approved API only.
- Production connection remains disabled.
- Every entry and pricing-sensitive result requires human review.
- Setup screen visibly shows scope, capture entry, source status, rate basis, sample coverage, and production-closed state.
- No visible or source-level unsafe collection terms or automatic pricing fields were introduced.
- Full app verification, Triad checks, JSON checks, prototype regression, safety scan, and PR hygiene pass.
- If PR #4 is still open, F-011 branch dependency on F-010 is explicit and not accidentally proposed as a PR against `main` before rebasing.

## Planner Self-Review

- Spec coverage: every F-011 acceptance criterion maps to at least one task above.
- Scope: one setup/data-contract slice, no live collection or persistence.
- Placeholder scan target: no unresolved placeholder wording should remain in this plan.
- TDD handoff: each implementation task starts with a failing test and explicit red/green verification.
