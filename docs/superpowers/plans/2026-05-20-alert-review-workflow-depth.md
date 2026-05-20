# Alert Review Workflow Depth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Alert Review into a selectable, local-only human review workflow with structured evidence roles, review status, notes, and responsive verification gates.

**Architecture:** Extend the fixture/manual `DemoDataset` with an `alertReview` workflow contract derived from existing alert candidates, without changing F-008 alert math. Then update `AlertReviewScreen` to manage selected alert, local review status, and local notes in React state while reusing F-012 Revenue Observatory primitives and preserving human-review-only boundaries.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, Playwright, existing Revenue Observatory CSS primitives.

---

### Task 1: Add Alert Review Workflow Data Contract

**Files:**
- Modify: `app/src/types/contracts.ts`
- Modify: `app/src/data/domainDrivenDataset.ts`
- Test: `app/tests/data/domainDrivenDataset.test.ts`

- [ ] **Step 1: Write the failing dataset tests**

Append this block to `app/tests/data/domainDrivenDataset.test.ts` after the existing `domain-driven demo dataset signals` tests:

```typescript
describe('domain-driven alert review workflow', () => {
  it('builds one local review item for every pricing-sensitive signal', () => {
    const dataset = buildDomainDrivenDemoDataset(domainSeed);

    expect(dataset.alertReview.items).toHaveLength(dataset.signals.length);
    expect(dataset.alertReview.selectedItemId).toBe(dataset.alertReview.items[0].id);
    expect(dataset.alertReview.statusOptions.map((option) => option.id)).toEqual(['needs_review', 'reviewing', 'noted']);
    expect(dataset.alertReview.guardrails.join(' ')).toContain('本地');
    expect(dataset.alertReview.guardrails.join(' ')).toContain('人工复核');

    for (const item of dataset.alertReview.items) {
      expect(item.humanReviewRequired).toBe(true);
      expect(item.defaultStatus).toBe('needs_review');
      expect(item.affectedStayDate).toMatch(/^2026-/);
      expect(item.rateKey.roomType).toBe(dataset.context.roomType);
      expect(item.rateKey.taxFeeBasis).toBeTruthy();
      expect(item.rateKey.cancellationPolicy).toBeTruthy();
      expect(item.evidenceRows.length).toBeGreaterThan(0);
      expect(item.captureTime).toMatch(/^2026-/);
      expect(item.sampleSize).toBeGreaterThan(0);
    }
  });

  it('keeps owner-position evidence roles structured for review', () => {
    const dataset = buildDomainDrivenDemoDataset(domainSeed);
    const ownerItem = dataset.alertReview.items.find((item) => item.alertType === 'owner_low_risk' || item.alertType === 'owner_high_risk');

    expect(ownerItem).toBeDefined();
    expect(ownerItem?.evidenceRows.some((row) => row.role === 'owner_observation' && row.label.startsWith('本酒店观测'))).toBe(true);
    expect(ownerItem?.evidenceRows.some((row) => row.role === 'competitor_sample' && row.label.startsWith('核心竞品样本'))).toBe(true);
    expect(ownerItem?.reviewPriority).toBe('high');
  });
});
```

- [ ] **Step 2: Run the dataset test and verify RED**

Run:

```bash
/opt/homebrew/bin/npm --prefix app test -- tests/data/domainDrivenDataset.test.ts
```

Expected: FAIL because `dataset.alertReview` does not exist.

- [ ] **Step 3: Extend contracts**

In `app/src/types/contracts.ts`, add these types after `Signal`:

```typescript
export type AlertReviewStatus = 'needs_review' | 'reviewing' | 'noted';
export type AlertReviewPriority = 'high' | 'medium' | 'watch';

export interface AlertReviewStatusOption {
  id: AlertReviewStatus;
  label: string;
  description: string;
}

export interface AlertReviewNotePreset {
  id: string;
  label: string;
  text: string;
}

export interface AlertReviewEvidenceRow extends EvidenceMarker {
  role: 'latest_observation' | 'previous_observation' | 'market_sample' | 'owner_observation' | 'competitor_sample';
  price: number | null;
  status: 'available' | 'missing-sample';
}

export interface AlertReviewItem {
  id: string;
  signalId: string;
  alertType:
    | 'competitor_increase'
    | 'competitor_decrease'
    | 'market_increase'
    | 'market_decrease'
    | 'owner_low_risk'
    | 'owner_high_risk';
  title: string;
  summary: string;
  severity: Severity;
  primaryMetric: number;
  metricUnit: string;
  affectedStayDate: string;
  reviewPriority: AlertReviewPriority;
  defaultStatus: AlertReviewStatus;
  defaultNote: string;
  rateKey: RateKey;
  evidenceRows: AlertReviewEvidenceRow[];
  sampleSize: number;
  captureTime: string;
  humanReviewRequired: true;
}

export interface AlertReviewWorkflow {
  items: AlertReviewItem[];
  selectedItemId: string;
  statusOptions: AlertReviewStatusOption[];
  notePresets: AlertReviewNotePreset[];
  guardrails: string[];
}
```

Then add this field to `DemoDataset`:

```typescript
alertReview: AlertReviewWorkflow;
```

- [ ] **Step 4: Implement the adapter helpers**

In `app/src/data/domainDrivenDataset.ts`, add `AlertReviewEvidenceRow`, `AlertReviewItem`, and `AlertReviewWorkflow` to the UI contract import list.

Add these helpers near the existing signal helpers:

```typescript
function reviewPriority(alert: AlertCandidate): AlertReviewItem['reviewPriority'] {
  if (alert.alertType === 'owner_low_risk' || alert.alertType === 'owner_high_risk') {
    return 'high';
  }
  if (alert.alertType === 'market_increase' || alert.alertType === 'market_decrease') {
    return 'medium';
  }
  return 'watch';
}

function alertReviewEvidenceRows(seed: DomainDemoSeed, alert: AlertCandidate): AlertReviewEvidenceRow[] {
  return alert.evidence.map((evidence) => ({
    role: evidence.role,
    label: `${evidenceRoleLabel(evidence.role)} · ${alert.rateKey.roomTypeKey} · ${alert.rateKey.stayDate}`,
    source: platformLabel(seed, alert.rateKey.sourceId),
    captureTime: evidence.capturedAt,
    sampleSize: evidence.sampleSize,
    confidence: evidence.sampleSize >= 3 ? 'sample' : evidence.sampleSize > 0 ? 'partial' : 'unavailable',
    price: evidence.priceCents === null ? null : yuan(evidence.priceCents),
    status: evidence.priceCents === null ? 'missing-sample' : 'available'
  }));
}

function alertReviewRateKey(seed: DomainDemoSeed, alert: AlertCandidate): RateKey {
  const snapshot = representativeSnapshot(seed, alert.rateKey.stayDate, alert.rateKey.sourceId);
  return uiRateKey(seed, { ...snapshot, rateKey: alert.rateKey, hotelId: alert.hotelId, competitorGroupId: alert.competitorGroupId });
}

function buildAlertReviewWorkflow(seed: DomainDemoSeed, alerts: AlertCandidate[], signals: Signal[]): AlertReviewWorkflow {
  const signalById = new Map(signals.map((signal) => [signal.id, signal]));
  const items = alerts.map((alert) => {
    const signal = signalById.get(alert.alertId);
    if (!signal) {
      throw new Error(`Missing UI signal for alert ${alert.alertId}`);
    }
    const evidenceRows = alertReviewEvidenceRows(seed, alert);
    const captureTime = evidenceRows[0]?.captureTime ?? seed.now;
    return {
      id: `review-${alert.alertId}`,
      signalId: signal.id,
      alertType: alert.alertType,
      title: signal.title,
      summary: signal.summary,
      severity: signal.severity,
      primaryMetric: signal.primaryMetric,
      metricUnit: signal.metricUnit,
      affectedStayDate: alert.rateKey.stayDate,
      reviewPriority: reviewPriority(alert),
      defaultStatus: 'needs_review',
      defaultNote: '本地复核备注：等待收益经理核对房态、库存和竞品样本。',
      rateKey: alertReviewRateKey(seed, alert),
      evidenceRows,
      sampleSize: alert.sampleSize,
      captureTime,
      humanReviewRequired: true
    };
  });

  return {
    items,
    selectedItemId: items[0]?.id ?? '',
    statusOptions: [
      { id: 'needs_review', label: '待复核', description: '进入人工复核队列，尚未记录判断。' },
      { id: 'reviewing', label: '复核中', description: '收益经理正在核对样本与房态。' },
      { id: 'noted', label: '已记录', description: '仅在本页记录人工关注点，不保存到生产系统。' }
    ],
    notePresets: [
      { id: 'check-inventory', label: '核对房态', text: '需要核对本酒店库存、房态和取消政策后再判断。' },
      { id: 'check-samples', label: '核对样本', text: '需要确认核心竞品样本是否仍然可用且口径一致。' },
      { id: 'owner-watch', label: '人工关注', text: '已记录为人工关注项，不触发任何自动价格动作。' }
    ],
    guardrails: ['本页仅使用 fixture/manual 演示数据。', '复核状态和备注仅保存在当前页面本地状态。', '所有价格动作必须人工确认。']
  };
}
```

- [ ] **Step 5: Wire `alertReview` into `buildDomainDrivenDemoDataset`**

Replace the final `signals` mapping with a local variable before the return:

```typescript
const signals = alerts.map((alert) => mapAlertToSignal(normalizedSeed, alert));
```

Then return both fields:

```typescript
signals,
alertReview: buildAlertReviewWorkflow(normalizedSeed, alerts, signals)
```

- [ ] **Step 6: Run dataset tests and verify GREEN**

Run:

```bash
/opt/homebrew/bin/npm --prefix app test -- tests/data/domainDrivenDataset.test.ts
```

Expected: PASS, including the new alert review workflow tests.

- [ ] **Step 7: Commit Task 1**

Run:

```bash
git add app/src/types/contracts.ts app/src/data/domainDrivenDataset.ts app/tests/data/domainDrivenDataset.test.ts
git commit -m "feat: add alert review workflow data"
```

### Task 2: Implement Selectable Alert Review UI With Local State

**Files:**
- Modify: `app/src/screens/AlertReviewScreen.tsx`
- Modify: `app/src/styles/layout.css`
- Test: `app/tests/components/alertReviewScreen.test.tsx`

- [ ] **Step 1: Write failing component tests**

Create `app/tests/components/alertReviewScreen.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { demoDataset } from '../../src/data/demoDataset';
import { AlertReviewScreen } from '../../src/screens/AlertReviewScreen';

describe('AlertReviewScreen workflow', () => {
  it('selects alerts and updates the review detail panel', async () => {
    const user = userEvent.setup();
    render(<AlertReviewScreen dataset={demoDataset} drawerOpen />);

    const items = demoDataset.alertReview.items;
    expect(items.length).toBeGreaterThan(1);

    const first = items[0];
    const second = items[1];
    expect(screen.getByTestId('alert-review-detail')).toHaveTextContent(first.title);
    expect(screen.getByTestId('alert-review-detail')).toHaveTextContent(first.affectedStayDate);

    await user.click(screen.getByRole('button', { name: new RegExp(second.title) }));

    expect(screen.getByTestId('alert-review-detail')).toHaveTextContent(second.title);
    expect(screen.getByTestId('alert-review-detail')).toHaveTextContent(second.affectedStayDate);
    expect(screen.getByRole('button', { name: new RegExp(second.title) })).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps review status and notes local to the selected alert', async () => {
    const user = userEvent.setup();
    render(<AlertReviewScreen dataset={demoDataset} drawerOpen />);

    const first = demoDataset.alertReview.items[0];
    const second = demoDataset.alertReview.items[1];

    await user.click(screen.getByRole('button', { name: '复核中' }));
    await user.clear(screen.getByLabelText('本地复核备注'));
    await user.type(screen.getByLabelText('本地复核备注'), '核对亲子房库存后再判断');

    expect(screen.getByTestId('alert-review-detail')).toHaveTextContent('复核中');
    expect(screen.getByLabelText('本地复核备注')).toHaveValue('核对亲子房库存后再判断');

    await user.click(screen.getByRole('button', { name: new RegExp(second.title) }));
    expect(screen.getByLabelText('本地复核备注')).toHaveValue(second.defaultNote);

    await user.click(screen.getByRole('button', { name: new RegExp(first.title) }));
    expect(screen.getByLabelText('本地复核备注')).toHaveValue('核对亲子房库存后再判断');
  });
});
```

- [ ] **Step 2: Run component tests and verify RED**

Run:

```bash
/opt/homebrew/bin/npm --prefix app test -- tests/components/alertReviewScreen.test.tsx
```

Expected: FAIL because `alertReviewScreen.test.tsx` references `dataset.alertReview`, `data-testid="alert-review-detail"`, alert selection, status buttons, and note controls that do not exist yet.

- [ ] **Step 3: Implement `AlertReviewScreen` local workflow**

Rewrite `app/src/screens/AlertReviewScreen.tsx` around `dataset.alertReview`. Keep the existing component signature:

```typescript
import { useMemo, useState } from 'react';
import { EvidenceDrawer } from '../components/primitives/EvidenceDrawer';
import type { AlertReviewStatus, DemoDataset } from '../types/contracts';

interface AlertReviewScreenProps {
  dataset: DemoDataset;
  drawerOpen: boolean;
}

export function AlertReviewScreen({ dataset, drawerOpen }: AlertReviewScreenProps) {
  const workflow = dataset.alertReview;
  const [selectedItemId, setSelectedItemId] = useState(workflow.selectedItemId);
  const [statusById, setStatusById] = useState<Record<string, AlertReviewStatus>>({});
  const [notesById, setNotesById] = useState<Record<string, string>>({});

  const selectedItem = useMemo(
    () => workflow.items.find((item) => item.id === selectedItemId) ?? workflow.items[0],
    [selectedItemId, workflow.items]
  );
  const selectedEvidence = selectedItem.evidenceRows[0];
  const selectedStatus = statusById[selectedItem.id] ?? selectedItem.defaultStatus;
  const selectedStatusLabel = workflow.statusOptions.find((option) => option.id === selectedStatus)?.label ?? '待复核';
  const selectedNote = notesById[selectedItem.id] ?? selectedItem.defaultNote;

  return (
    <section className="screen-grid screen-grid--two observatory-screen alert-review-workflow">
      <div className="panel observatory-panel">
        <div className="panel__header instrument-header">
          <div>
            <h2 className="panel__title">异常提醒中心</h2>
            <p className="panel__meta">所有价格敏感提醒先进入人工复核。</p>
          </div>
          <span className="demo-badge">演示数据</span>
        </div>
        <div className="table-list" aria-label="异常提醒列表">
          {workflow.items.map((item) => {
            const itemStatus = statusById[item.id] ?? item.defaultStatus;
            const itemStatusLabel = workflow.statusOptions.find((option) => option.id === itemStatus)?.label ?? '待复核';
            return (
              <button
                className="alert-row alert-row--button"
                data-selected={item.id === selectedItem.id}
                key={item.id}
                type="button"
                aria-pressed={item.id === selectedItem.id}
                onClick={() => setSelectedItemId(item.id)}
              >
                <span className="stack stack--tight">
                  <span className="cluster">
                    <strong>{item.title}</strong>
                    <span className="status-chip status-chip--review">{itemStatusLabel}</span>
                    <span className="status-chip status-chip--warning">{item.reviewPriority === 'high' ? '高优先级' : '关注'}</span>
                  </span>
                  <span className="muted">{item.summary}</span>
                  <span className="panel__meta">
                    {item.affectedStayDate} · {item.captureTime} · 样本 {item.sampleSize}
                  </span>
                </span>
                <span className="metric alert-row__metric">
                  {item.primaryMetric > 0 ? '+' : ''}
                  {item.primaryMetric}
                  <span className="metric__unit">{item.metricUnit}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="stack">
        <article className="panel observatory-panel alert-review-detail" data-testid="alert-review-detail">
          <div className="panel__header instrument-header">
            <div>
              <h2 className="panel__title">{selectedItem.title}</h2>
              <p className="panel__meta">
                影响入住日 {selectedItem.affectedStayDate} · {selectedItem.rateKey.roomType} · {selectedItem.rateKey.platform}
              </p>
            </div>
            <span className="status-chip status-chip--review">需人工复核</span>
          </div>

          <p>{selectedItem.summary}</p>

          <div className="review-status-control" role="group" aria-label="复核状态">
            {workflow.statusOptions.map((option) => (
              <button
                className="filter-chip"
                data-active={option.id === selectedStatus}
                key={option.id}
                type="button"
                onClick={() => setStatusById((current) => ({ ...current, [selectedItem.id]: option.id }))}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="panel__meta">当前状态：{selectedStatusLabel} · 仅当前页面本地记录</p>

          <dl className="evidence-grid">
            <div>
              <dt>房型</dt>
              <dd>{selectedItem.rateKey.roomType}</dd>
            </div>
            <div>
              <dt>入住人数</dt>
              <dd>{selectedItem.rateKey.occupancy} 人</dd>
            </div>
            <div>
              <dt>税费口径</dt>
              <dd>{selectedItem.rateKey.taxFeeBasis}</dd>
            </div>
            <div>
              <dt>取消政策</dt>
              <dd>{selectedItem.rateKey.cancellationPolicy}</dd>
            </div>
          </dl>

          <div className="alert-evidence-list">
            {selectedItem.evidenceRows.map((row) => (
              <div className="calendar-evidence-row" key={`${row.role}-${row.captureTime}-${row.label}`}>
                <strong>{row.label}</strong>
                <span className="panel__meta">
                  {row.source} · {row.captureTime} · 样本 {row.sampleSize}
                </span>
              </div>
            ))}
          </div>

          <label className="stack stack--tight">
            <span className="panel__meta">本地复核备注</span>
            <textarea
              className="review-note"
              value={selectedNote}
              onChange={(event) => setNotesById((current) => ({ ...current, [selectedItem.id]: event.target.value }))}
            />
          </label>
        </article>

        <EvidenceDrawer
          open={drawerOpen}
          heading="提醒证据复核"
          rateKey={selectedItem.rateKey}
          source={selectedEvidence.source}
          captureTime={selectedEvidence.captureTime}
          sampleSize={selectedEvidence.sampleSize}
          confidence={selectedEvidence.confidence}
          rationale={selectedItem.summary}
          humanReviewRequired={selectedItem.humanReviewRequired}
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Add minimal layout styles**

Append these styles near the existing alert row CSS in `app/src/styles/layout.css`:

```css
.alert-row--button {
  width: 100%;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.alert-row--button[data-selected="true"] {
  border-color: var(--color-teal);
  box-shadow: var(--shadow-focus);
}

.alert-review-detail {
  display: grid;
  gap: var(--space-16);
}

.review-status-control {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-8);
}

.alert-evidence-list {
  display: grid;
  gap: var(--space-10);
}

.review-note {
  min-height: 96px;
  resize: vertical;
  border: var(--border-width) solid var(--color-line);
  border-radius: var(--radius-control);
  padding: var(--space-10);
  background: var(--color-surface-raised);
  color: var(--color-text);
  font: inherit;
}
```

- [ ] **Step 5: Run component tests and verify GREEN**

Run:

```bash
/opt/homebrew/bin/npm --prefix app test -- tests/components/alertReviewScreen.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Run nearby component regression**

Run:

```bash
/opt/homebrew/bin/npm --prefix app test -- tests/components/alertReviewScreen.test.tsx tests/components/revenueObservatoryScreens.test.tsx tests/components/evidenceDrawer.test.tsx
```

Expected: PASS for all listed files.

- [ ] **Step 7: Commit Task 2**

Run:

```bash
git add app/src/screens/AlertReviewScreen.tsx app/src/styles/layout.css app/tests/components/alertReviewScreen.test.tsx
git commit -m "feat: add local alert review workflow"
```

### Task 3: Add Playwright Alert Review Workflow Coverage

**Files:**
- Modify: `app/tests/e2e/app-foundation.spec.ts`
- Update generated screenshots under: `docs/test-reports/f-007-app-foundation/`

- [ ] **Step 1: Add Playwright workflow coverage**

Append this test to `app/tests/e2e/app-foundation.spec.ts`:

```typescript
test('alert review selection keeps status and notes local on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?screen=alerts&state=drawer-open');

  const detail = page.getByTestId('alert-review-detail');
  await expect(detail).toContainText('需人工复核');
  await expect(detail).toContainText('本地复核备注');

  const secondAlert = page.locator('.alert-row--button').nth(1);
  const secondTitle = await secondAlert.locator('strong').innerText();
  await secondAlert.click();
  await expect(detail).toContainText(secondTitle);

  await page.getByRole('button', { name: '复核中' }).click();
  await expect(detail).toContainText('当前状态：复核中');

  const note = page.getByLabel('本地复核备注');
  await note.fill('移动端本地备注：核对样本后再判断');
  await expect(note).toHaveValue('移动端本地备注：核对样本后再判断');

  const storageWrites = await page.evaluate(() => ({
    localStorage: window.localStorage.length,
    sessionStorage: window.sessionStorage.length
  }));
  expect(storageWrites).toEqual({ localStorage: 0, sessionStorage: 0 });

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(8);
});
```

- [ ] **Step 2: Run the focused Playwright workflow test**

Run:

```bash
/opt/homebrew/bin/npm --prefix app run screenshots -- --grep "alert review selection"
```

Expected: PASS after Task 2. If it fails, fix only the F-015 alert review UI or responsive styling needed to satisfy the workflow and no-overflow assertion.

- [ ] **Step 3: Ensure screenshot matrix still captures alert review**

Keep these existing screenshot cases active:

```typescript
['alert-review-drawer-open--1440x900.png', '/?screen=alerts&state=drawer-open', { width: 1440, height: 900 }],
['alert-review-drawer-open--390x844.png', '/?screen=alerts&state=drawer-open', { width: 390, height: 844 }],
['alert-review-observatory--2048x1352.png', '/?screen=alerts&state=drawer-open', { width: 2048, height: 1352 }]
```

Do not use `fullPage: true`; screenshots must remain exact viewport dimensions.

- [ ] **Step 4: Run Playwright workflow and screenshot verification**

Run:

```bash
/opt/homebrew/bin/npm --prefix app run screenshots
```

Expected: PASS, including existing screenshot dimensions and the new alert review workflow test.

- [ ] **Step 5: Commit Task 3**

Run:

```bash
git add app/tests/e2e/app-foundation.spec.ts docs/test-reports/f-007-app-foundation
git commit -m "test: cover alert review workflow"
```

### Task 4: Add Generator Notes And Run Full Verification

**Files:**
- Create: `docs/test-reports/2026-05-20-f-015-generator-notes.md`

- [ ] **Step 1: Create Generator notes**

Create `docs/test-reports/2026-05-20-f-015-generator-notes.md` with:

```markdown
# F-015 Generator Notes

Date: 2026-05-20
Feature: `F-015-alert-review-workflow-depth`

## Summary

- Added typed `alertReview` workflow data derived from fixture/manual alert candidates.
- Added selectable Alert Review rows, selected detail, local-only status controls, and local-only review notes.
- Preserved owner observation and competitor sample evidence roles.
- Preserved rate boundaries: platform, stay date, room type, occupancy, meal plan, tax/fee basis, cancellation policy, capture time, and sample state.

## Boundaries

- No F-008 alert math changes.
- No live collection, backend, persistence, browser storage, credentials, cookies, sessions, CAPTCHA handling, recommended price, or automatic pricing.
- Review status and notes are React local state only.

## Verification

- Targeted dataset tests:
- Targeted component tests:
- Playwright screenshots/workflow:
- Full app verify:
- Triad/JSON/prototype checks:
```

Fill each verification bullet with the exact commands and results from this implementation session.

- [ ] **Step 2: Run targeted tests**

Run:

```bash
/opt/homebrew/bin/npm --prefix app test -- tests/data/domainDrivenDataset.test.ts tests/components/alertReviewScreen.test.tsx tests/components/revenueObservatoryScreens.test.tsx tests/components/evidenceDrawer.test.tsx
```

Expected: PASS.

- [ ] **Step 3: Run full app verification**

Run:

```bash
/opt/homebrew/bin/npm --prefix app run verify
```

Expected: build PASS, Vitest PASS, Playwright PASS.

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

Expected: all PASS. `triad_doctor.py` may warn if run on a feature branch or main mismatch, but it must remain healthy enough to proceed.

- [ ] **Step 5: Run safety scans**

Run:

```bash
rg -n "(fetch\\(|XMLHttpRequest|axios|puppeteer|crawler|scrap|scrape|cookie|credential|api[_-]?key|localStorage|sessionStorage|indexedDB)" app/src
rg -n "(推荐价格|建议价格|自动定价|自动调价|自动改价|recommendedPrice|recommended price|auto[- ]?pricing|automatic pricing|pricing action)" app/src
```

Expected: no unsafe hits in F-015 implementation files. If a test intentionally mentions `localStorage` or `sessionStorage`, that is acceptable only in tests that assert storage remains empty.

- [ ] **Step 6: Commit Generator notes**

Run:

```bash
git add docs/test-reports/2026-05-20-f-015-generator-notes.md
git commit -m "chore: hand off f-015 for verification"
```

### Task 5: Generator Handoff

**Files:**
- Modify: `progress.json`
- Modify: `features.json`
- Modify: `backlog.json`
- Modify: `.auto-memory/project-status.md`

- [ ] **Step 1: Update status for Evaluator handoff**

After implementation and verification, update:

- `progress.json`: `status` becomes `verifying`, `current_sprint` remains `F-015-alert-review-workflow-depth`.
- `features.json`: F-015 `status` becomes `verifying`, `executor` becomes `generator`, artifacts include implementation files/tests/screenshots and Generator notes.
- `backlog.json`: B-054 becomes `done`, B-055 remains `new`.
- `.auto-memory/project-status.md`: current role becomes `Generator`, status records F-015 is ready for Evaluator verification.

- [ ] **Step 2: Validate status files**

Run:

```bash
python3 -m json.tool progress.json
python3 -m json.tool features.json
python3 -m json.tool backlog.json
python3 scripts/triad_doctor.py
```

Expected: JSON PASS and Triad healthy enough to proceed.

- [ ] **Step 3: Commit status handoff**

Run:

```bash
git add progress.json features.json backlog.json .auto-memory/project-status.md
git commit -m "chore: hand off f-015 for verification"
```

## Evaluator Checklist

- Verify `DemoDataset.alertReview` exists and maps to pricing-sensitive signals.
- Verify every review item has impact date, rate boundary, evidence rows, sample size, capture time, and `humanReviewRequired: true`.
- Verify owner-position alert includes owner observation and competitor sample evidence rows.
- Verify alert row selection updates detail content and selected state.
- Verify review status controls are local UI state only.
- Verify note entry is local UI state only and does not write to browser storage.
- Verify mobile alert review flow has no horizontal overflow at `390x844`.
- Verify screenshot matrix remains exact viewport size for alert review cases.
- Verify no F-008 alert math changed.
- Verify no live collection, persistence, credentials, cookie/session/CAPTCHA, storage, recommended price, or automatic pricing.
- Verify project PRD and development plan still reflect the latest main baseline and F-015 status.
