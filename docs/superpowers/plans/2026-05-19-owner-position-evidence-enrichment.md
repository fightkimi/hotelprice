# Owner-Position Evidence Enrichment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enrich owner-position alert evidence with an explicit owner observation and evidence roles, then surface those roles in the domain-driven UI evidence markers.

**Architecture:** Keep the existing F-008 alert math and F-009 UI layout intact. Extend the pure domain evidence contract, assign evidence roles inside `app/src/domain/pricing/alertRules.ts`, and update the F-009 adapter labels without adding live collection, storage, credentials, or automatic pricing.

**Tech Stack:** TypeScript, Vitest, existing React/Vite app workspace, no new dependencies.

---

## Scope Check

This plan closes `B-027`. It does not change pricing thresholds, add screens, add API routes, add persistence, or introduce live source integration.

## Planned File Changes

Modify:

- `app/src/domain/pricing/types.ts`
- `app/src/domain/pricing/reportEvidence.ts`
- `app/src/domain/pricing/alertRules.ts`
- `app/src/data/domainDrivenDataset.ts`
- `app/tests/domain/alertRules.test.ts`
- `app/tests/data/domainDrivenDataset.test.ts`
- `docs/test-reports/2026-05-19-f-010-generator-notes.md`
- `features.json`
- `progress.json`
- `backlog.json`
- `.auto-memory/project-status.md`

Do not modify:

- F-007 layout/components/screens unless a failing test proves a display contract issue.
- Package/build config.
- E2E config.
- Domain pricing thresholds.

## Task 1: Add Domain Evidence Roles

**Files:**

- Modify: `app/src/domain/pricing/types.ts`
- Modify: `app/src/domain/pricing/reportEvidence.ts`
- Modify: `app/tests/domain/alertRules.test.ts`

- [ ] **Step 1: Add failing domain evidence-role tests**

Append these tests to `app/tests/domain/alertRules.test.ts`:

```ts
  it('adds owner observation and competitor sample evidence to owner-position alerts', () => {
    const alerts = generate([
      snap('owner-1', 'owner', '2026-05-19T12:00:00.000Z', 30000),
      snap('a2', 'comp-a', '2026-05-19T12:00:00.000Z', 50000),
      snap('b2', 'comp-b', '2026-05-19T12:00:00.000Z', 50000),
      snap('c2', 'comp-c', '2026-05-19T12:00:00.000Z', 50000)
    ]);

    const ownerAlert = alerts.find((alert) => alert.alertType === 'owner_low_risk');

    expect(ownerAlert?.evidence).toEqual([
      expect.objectContaining({
        role: 'owner_observation',
        hotelId: 'owner',
        capturedAt: '2026-05-19T12:00:00.000Z',
        priceCents: 30000,
        sampleSize: 3
      }),
      expect.objectContaining({ role: 'competitor_sample', hotelId: 'comp-a', priceCents: 50000, sampleSize: 3 }),
      expect.objectContaining({ role: 'competitor_sample', hotelId: 'comp-b', priceCents: 50000, sampleSize: 3 }),
      expect.objectContaining({ role: 'competitor_sample', hotelId: 'comp-c', priceCents: 50000, sampleSize: 3 })
    ]);
  });

  it('labels competitor movement evidence as latest and previous observations', () => {
    const [alert] = generate([
      snap('a1', 'comp-a', '2026-05-19T08:00:00.000Z', 40000),
      snap('a2', 'comp-a', '2026-05-19T12:00:00.000Z', 44000)
    ]);

    expect(alert.evidence).toEqual([
      expect.objectContaining({ role: 'latest_observation', hotelId: 'comp-a', priceCents: 44000 }),
      expect.objectContaining({ role: 'previous_observation', hotelId: 'comp-a', priceCents: 40000 })
    ]);
  });
```

- [ ] **Step 2: Run the domain alert tests and verify RED**

Run:

```bash
cd app
/opt/homebrew/bin/npm test -- tests/domain/alertRules.test.ts
```

Expected: FAIL because `AlertEvidence` does not include `role` or `priceCents`, and owner-position evidence does not include the owner observation.

- [ ] **Step 3: Extend evidence types and helper**

In `app/src/domain/pricing/types.ts`, add:

```ts
export type AlertEvidenceRole =
  | 'latest_observation'
  | 'previous_observation'
  | 'market_sample'
  | 'owner_observation'
  | 'competitor_sample';
```

Update `AlertEvidence`:

```ts
export interface AlertEvidence {
  role: AlertEvidenceRole;
  sourceKind: SourceKind;
  capturedAt: string;
  hotelId: string;
  rateKeyId: string;
  sampleSize: number;
  priceCents: number | null;
}
```

Update `app/src/domain/pricing/reportEvidence.ts`:

```ts
import { comparableRateKeyId } from './rateKey';
import type { AlertEvidence, AlertEvidenceRole, RateSnapshot } from './types';

export function evidenceForSnapshot(snapshot: RateSnapshot, sampleSize: number, role: AlertEvidenceRole): AlertEvidence {
  return {
    role,
    sourceKind: snapshot.sourceKind,
    capturedAt: snapshot.capturedAt,
    hotelId: snapshot.hotelId,
    rateKeyId: comparableRateKeyId(snapshot.rateKey),
    sampleSize,
    priceCents: snapshot.priceCents
  };
}
```

- [ ] **Step 4: Verify type errors remain focused**

Run:

```bash
cd app
/opt/homebrew/bin/npm test -- tests/domain/alertRules.test.ts
```

Expected: FAIL with TypeScript errors or test failures because existing `evidenceForSnapshot()` calls need a role.

## Task 2: Assign Evidence Roles In Alert Rules

**Files:**

- Modify: `app/src/domain/pricing/alertRules.ts`
- Test: `app/tests/domain/alertRules.test.ts`

- [ ] **Step 1: Update competitor movement evidence roles**

In `app/src/domain/pricing/alertRules.ts`, update competitor increase/decrease evidence arrays:

```ts
evidence: [evidenceForSnapshot(latest, 1, 'latest_observation'), evidenceForSnapshot(previous, 1, 'previous_observation')]
```

- [ ] **Step 2: Update market sample evidence roles**

In `captureAverage()`, update:

```ts
evidence: samples.map((snapshot) => evidenceForSnapshot(snapshot, samples.length, 'market_sample')),
```

- [ ] **Step 3: Add owner-position owner evidence**

In `generateOwnerPositionAlerts()`, replace the evidence assignment with:

```ts
const evidence = [
  evidenceForSnapshot(ownerSnapshot, competitorSamples.length, 'owner_observation'),
  ...competitorSamples.map((snapshot) => evidenceForSnapshot(snapshot, competitorSamples.length, 'competitor_sample'))
];
```

- [ ] **Step 4: Verify domain alert tests GREEN**

Run:

```bash
cd app
/opt/homebrew/bin/npm test -- tests/domain/alertRules.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit domain evidence roles**

Run:

```bash
git add app/src/domain/pricing/types.ts app/src/domain/pricing/reportEvidence.ts app/src/domain/pricing/alertRules.ts app/tests/domain/alertRules.test.ts
git commit -m "feat: enrich owner position alert evidence"
```

## Task 3: Surface Owner Evidence In UI Adapter

**Files:**

- Modify: `app/src/data/domainDrivenDataset.ts`
- Modify: `app/tests/data/domainDrivenDataset.test.ts`

- [ ] **Step 1: Add failing UI evidence marker test**

Append to `app/tests/data/domainDrivenDataset.test.ts`:

```ts
  it('surfaces owner-position owner evidence separately from competitor samples', () => {
    const dataset = buildDomainDrivenDemoDataset(domainSeed);
    const ownerSignal = dataset.signals.find((signal) => signal.id.includes('owner_low_risk') || signal.id.includes('owner_high_risk'));

    expect(ownerSignal).toBeDefined();
    expect(ownerSignal?.humanReviewRequired).toBe(true);
    expect(ownerSignal?.evidenceMarkers.some((marker) => marker.label.startsWith('本酒店观测'))).toBe(true);
    expect(ownerSignal?.evidenceMarkers.filter((marker) => marker.label.startsWith('核心竞品样本')).length).toBeGreaterThanOrEqual(3);
  });
```

- [ ] **Step 2: Run the adapter test and verify RED**

Run:

```bash
cd app
/opt/homebrew/bin/npm test -- tests/data/domainDrivenDataset.test.ts
```

Expected: FAIL because evidence labels do not distinguish owner and competitor roles.

- [ ] **Step 3: Update evidence labels**

In `app/src/data/domainDrivenDataset.ts`, add:

```ts
function evidenceRoleLabel(role: AlertCandidate['evidence'][number]['role']): string {
  const labels: Record<AlertCandidate['evidence'][number]['role'], string> = {
    latest_observation: '最新观测',
    previous_observation: '上一观测',
    market_sample: '市场样本',
    owner_observation: '本酒店观测',
    competitor_sample: '核心竞品样本'
  };
  return labels[role];
}
```

Update `mapEvidence()` label:

```ts
label: `${evidenceRoleLabel(evidence.role)} · ${alert.rateKey.roomTypeKey} · ${alert.rateKey.stayDate}`,
```

- [ ] **Step 4: Verify adapter tests GREEN**

Run:

```bash
cd app
/opt/homebrew/bin/npm test -- tests/data/domainDrivenDataset.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit UI evidence mapping**

Run:

```bash
git add app/src/data/domainDrivenDataset.ts app/tests/data/domainDrivenDataset.test.ts
git commit -m "feat: label owner position evidence markers"
```

## Task 4: Safety And Regression Verification

**Files:**

- Create: `docs/test-reports/2026-05-19-f-010-generator-notes.md`
- Modify: `features.json`
- Modify: `progress.json`
- Modify: `backlog.json`
- Modify: `.auto-memory/project-status.md`

- [ ] **Step 1: Run targeted tests**

Run:

```bash
cd app
/opt/homebrew/bin/npm test -- tests/domain/alertRules.test.ts tests/data/domainDrivenDataset.test.ts tests/contract/demoDataset.test.ts tests/domain/complianceScan.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run full app verification**

Run:

```bash
cd app
/opt/homebrew/bin/npm run verify
```

Expected: build passes, Vitest passes, Playwright screenshot gate passes.

- [ ] **Step 3: Run project checks**

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

- [ ] **Step 4: Run static safety scan**

Run:

```bash
rg -n "(cookie|token|credential|captcha|scrap|scrape|crawler|puppeteer|playwright|fetch\\(|localStorage|sessionStorage|IndexedDB|automatic pricing|auto[- ]?price|recommendedPriceCents|自动调价|自动改价|爬虫|抓取|验证码|凭证|密钥)" app/src/data/domainDrivenDataset.ts app/src/domain/pricing
```

Expected: no matches.

- [ ] **Step 5: Record Generator notes**

Create `docs/test-reports/2026-05-19-f-010-generator-notes.md` with red/green evidence for:

- owner-position domain evidence role test;
- competitor movement evidence role test;
- UI owner/competitor evidence marker test;
- targeted tests;
- full app verification;
- safety scan.

- [ ] **Step 6: Update state for Evaluator**

Update:

- `features.json`: set `F-010-owner-position-evidence-enrichment` to `verifying`, executor `generator`, and add source/test/report artifacts.
- `progress.json`: set `status` to `verifying`, `batch_id` to `owner-position-evidence-enrichment`, and `current_sprint` to `F-010-owner-position-evidence-enrichment`.
- `backlog.json`: mark the Generator item done and keep the Evaluator item new.
- `.auto-memory/project-status.md`: record implementation facts and make Evaluator verification the next step.

- [ ] **Step 7: Commit handoff state**

Run:

```bash
git add docs/test-reports/2026-05-19-f-010-generator-notes.md features.json progress.json backlog.json .auto-memory/project-status.md
git commit -m "chore: hand off f-010 for verification"
```

## Evaluator Checklist

- Owner low/high risk alert evidence includes one `owner_observation`.
- Owner observation evidence includes source kind, capture time, owner hotel id, rate key id, sample size, and owner price.
- Owner low/high risk alert evidence includes at least three `competitor_sample` records when alerting.
- Competitor movement evidence uses latest/previous roles.
- Market movement evidence uses market sample roles.
- UI owner-position evidence markers distinguish owner observation from competitor samples.
- All pricing-sensitive signals still require human review.
- No recommended price, automatic pricing, live collection, credential, cookie, CAPTCHA, browser automation, or storage behavior appears.
- Full app verification, Triad checks, JSON checks, prototype regression, and PR hygiene pass.

## Planner Self-Review

- Spec coverage: all F-010 acceptance criteria map to tasks above.
- Placeholder scan: no unresolved placeholder wording is intentionally left for Generator.
- Type consistency: `AlertEvidenceRole`, `AlertEvidence.role`, `AlertEvidence.priceCents`, and `evidenceForSnapshot(snapshot, sampleSize, role)` are introduced before later tasks depend on them.
