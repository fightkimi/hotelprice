# Manual Import Preview And Field Mapping Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local-only manual import preview to Setup/Data Scope so users can inspect pasted CSV-like rows, field mapping, validation results and rate-boundary completeness before any production ingestion exists.

**Architecture:** Add a typed `manualImportPreview` contract to `DemoDataset`, backed by a pure parser/mapper/validator in `app/src/data/manualImportPreview.ts`. The Setup/Data Scope screen uses dataset sample CSV as local component state, recomputes preview on text edits, and renders mapping, validation summary, row preview and guardrails without upload, persistence, network calls or external connectors.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, Playwright, existing Revenue Observatory CSS primitives.

---

## Required Context

Before implementation, read:

- `docs/specs/2026-05-21-manual-import-preview-and-field-mapping.md`
- `docs/specs/2026-05-21-source-strategy-and-compliance-gate.md`
- `docs/specs/PROJECT_PRD.md`
- `docs/specs/PROJECT_DEVELOPMENT_PLAN.md`
- `app/src/types/contracts.ts`
- `app/src/data/domainDrivenDataset.ts`
- `app/src/data/dataScope.ts`
- `app/src/screens/SetupDataScopeScreen.tsx`
- `app/tests/data/domainDrivenDataset.test.ts`
- `app/tests/components/setupDataScopeScreen.test.tsx`
- `app/tests/domain/complianceScan.test.ts`
- `app/tests/e2e/app-foundation.spec.ts`

Use strict TDD. Do not modify production behavior before watching the relevant test fail.

Use this command prefix for app tests on this machine:

```bash
PATH=/Users/kimi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin
```

---

### Task 1: Define Manual Import Contract With Failing Tests

**Files:**
- Modify: `app/src/types/contracts.ts`
- Create: `app/tests/data/manualImportPreview.test.ts`
- Modify: `app/tests/data/domainDrivenDataset.test.ts`

- [ ] **Step 1: Write failing pure preview tests**

Create `app/tests/data/manualImportPreview.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { buildManualImportPreview, MANUAL_IMPORT_SAMPLE_CSV } from '../../src/data/manualImportPreview';

describe('manual import preview', () => {
  it('maps local sample rows into rate-boundary fields without production connection', () => {
    const preview = buildManualImportPreview(MANUAL_IMPORT_SAMPLE_CSV);

    expect(preview.sourceClass).toBe('user_manual_import');
    expect(preview.inputMode).toBe('sample_csv');
    expect(preview.productionConnectionEnabled).toBe(false);
    expect(preview.persistenceEnabled).toBe(false);
    expect(preview.humanReviewRequired).toBe(true);
    expect(preview.mappings.filter((mapping) => mapping.required).every((mapping) => mapping.status === 'mapped')).toBe(true);
    expect(preview.rateBoundarySummary.requiredFields).toEqual([
      'hotelName',
      'hotelRole',
      'platform',
      'source',
      'roomType',
      'stayDate',
      'captureTime',
      'price',
      'currency',
      'availability',
      'occupancy',
      'mealPlan',
      'taxFeeBasis',
      'cancellationPolicy'
    ]);
    expect(preview.validationSummary.totalRows).toBeGreaterThanOrEqual(4);
    expect(preview.validationSummary.comparableRows).toBeGreaterThanOrEqual(2);
    expect(preview.rows.some((row) => row.importable && row.normalized.rateKey !== null)).toBe(true);
    expect(preview.guardrails.join(' ')).toContain('不保存');
  });

  it('keeps invalid and non-available rows customer-safe without pseudo prices', () => {
    const preview = buildManualImportPreview(MANUAL_IMPORT_SAMPLE_CSV);
    const invalidRows = preview.rows.filter((row) => row.validationStatus === 'invalid');
    const nonAvailableRows = preview.rows.filter((row) => row.normalized.availability !== 'available');

    expect(invalidRows.length).toBeGreaterThanOrEqual(1);
    expect(nonAvailableRows.length).toBeGreaterThanOrEqual(1);
    expect(invalidRows.every((row) => row.displayPrice !== 'CNY 0' && row.displayPrice !== 'CNY null')).toBe(true);
    expect(nonAvailableRows.every((row) => row.displayPrice !== 'CNY 0' && row.displayPrice !== 'CNY null')).toBe(true);
    expect(invalidRows.flatMap((row) => row.issues).some((issue) => issue.severity === 'error')).toBe(true);
  });

  it('marks missing required fields as invalid for comparison', () => {
    const csv = [
      'hotelName,hotelRole,platform,source,roomType,stayDate,captureTime,price,currency,availability,occupancy,mealPlan,taxFeeBasis,cancellationPolicy',
      '云栖城市酒店,owner,携程演示源,ctrip-demo,亲子房,,2026-05-18T08:30:00.000Z,798,CNY,available,2,双早,含税含服务费,入住前24小时可取消'
    ].join('\n');
    const preview = buildManualImportPreview(csv, 'pasted_rows');
    const row = preview.rows[0];

    expect(row.validationStatus).toBe('invalid');
    expect(row.importable).toBe(false);
    expect(row.normalized.rateKey).toBeNull();
    expect(row.issues.map((issue) => issue.field)).toContain('stayDate');
  });
});
```

- [ ] **Step 2: Write failing dataset contract test**

Append to `app/tests/data/domainDrivenDataset.test.ts`:

```typescript
describe('domain-driven manual import preview', () => {
  it('exposes a local-only manual import preview in the demo dataset', () => {
    const dataset = buildDomainDrivenDemoDataset(domainSeed);

    expect(dataset.manualImportPreview.productionConnectionEnabled).toBe(false);
    expect(dataset.manualImportPreview.persistenceEnabled).toBe(false);
    expect(dataset.manualImportPreview.humanReviewRequired).toBe(true);
    expect(dataset.manualImportPreview.validationSummary.totalRows).toBeGreaterThanOrEqual(4);
    expect(dataset.manualImportPreview.validationSummary.comparableRows).toBeGreaterThanOrEqual(2);
    expect(dataset.manualImportPreview.mappings.some((mapping) => mapping.targetField === 'stayDate')).toBe(true);
    expect(dataset.manualImportPreview.rows.some((row) => row.normalized.rateKey !== null)).toBe(true);
  });
});
```

- [ ] **Step 3: Run tests and verify RED**

Run:

```bash
PATH=/Users/kimi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin /opt/homebrew/bin/npm --prefix app test -- tests/data/manualImportPreview.test.ts tests/data/domainDrivenDataset.test.ts
```

Expected: FAIL because `manualImportPreview.ts` and `DemoDataset.manualImportPreview` do not exist.

- [ ] **Step 4: Add contract types**

In `app/src/types/contracts.ts`, add after `CaptureEntryPreview`:

```typescript
export type ManualImportSourceClass = 'user_manual_import';
export type ManualImportInputMode = 'sample_csv' | 'pasted_rows';
export type ManualImportFieldKey =
  | 'hotelName'
  | 'hotelRole'
  | 'platform'
  | 'source'
  | 'roomType'
  | 'stayDate'
  | 'captureTime'
  | 'price'
  | 'currency'
  | 'availability'
  | 'occupancy'
  | 'mealPlan'
  | 'taxFeeBasis'
  | 'cancellationPolicy';
export type ManualImportHotelRole = 'owner' | 'competitor';
export type ManualImportAvailability = 'available' | 'unavailable' | 'no_rate' | 'source_error' | 'stale';
export type ManualImportValidationStatus = 'valid' | 'warning' | 'invalid';

export interface ManualImportColumnMapping {
  targetField: ManualImportFieldKey;
  sourceColumn: string | null;
  required: boolean;
  status: 'mapped' | 'missing';
  sampleValue: string | null;
}

export interface ManualImportValidationIssue {
  field: ManualImportFieldKey | 'row';
  severity: 'warning' | 'error';
  message: string;
}

export interface ManualImportNormalizedRow {
  hotelName: string;
  hotelRole: ManualImportHotelRole | null;
  platform: string;
  source: string;
  roomType: string;
  stayDate: string;
  captureTime: string;
  price: number | null;
  currency: 'CNY' | null;
  availability: ManualImportAvailability | null;
  occupancy: number | null;
  mealPlan: string;
  taxFeeBasis: string;
  cancellationPolicy: string;
  rateKey: RateKey | null;
}

export interface ManualImportPreviewRow {
  rowNumber: number;
  raw: Record<string, string>;
  normalized: ManualImportNormalizedRow;
  validationStatus: ManualImportValidationStatus;
  importable: boolean;
  comparable: boolean;
  displayPrice: string;
  issues: ManualImportValidationIssue[];
}

export interface ManualImportValidationSummary {
  totalRows: number;
  validRows: number;
  warningRows: number;
  invalidRows: number;
  comparableRows: number;
}

export interface ManualImportRateBoundarySummary {
  requiredFields: ManualImportFieldKey[];
  mappedRequiredFields: ManualImportFieldKey[];
  missingRequiredFields: ManualImportFieldKey[];
}

export interface ManualImportPreview {
  sourceClass: ManualImportSourceClass;
  inputMode: ManualImportInputMode;
  productionConnectionEnabled: false;
  persistenceEnabled: false;
  humanReviewRequired: true;
  sampleCsv: string;
  columns: string[];
  mappings: ManualImportColumnMapping[];
  rows: ManualImportPreviewRow[];
  validationSummary: ManualImportValidationSummary;
  rateBoundarySummary: ManualImportRateBoundarySummary;
  guardrails: string[];
}
```

Add this field to `DemoDataset` near `captureEntry`:

```typescript
manualImportPreview: ManualImportPreview;
```

- [ ] **Step 5: Run tests and verify RED remains implementation-level**

Run the same targeted test command.

Expected: FAIL because `manualImportPreview.ts` and dataset wiring are still missing.

- [ ] **Step 6: Commit RED contract**

```bash
git add app/src/types/contracts.ts app/tests/data/manualImportPreview.test.ts app/tests/data/domainDrivenDataset.test.ts
git commit -m "test: define manual import preview contract"
```

---

### Task 2: Implement Pure Parser, Mapping And Validation

**Files:**
- Create: `app/src/data/manualImportPreview.ts`
- Modify: `app/src/data/domainDrivenDataset.ts`
- Test: `app/tests/data/manualImportPreview.test.ts`
- Test: `app/tests/data/domainDrivenDataset.test.ts`

- [ ] **Step 1: Create parser and validator**

Create `app/src/data/manualImportPreview.ts`:

```typescript
import type {
  ManualImportAvailability,
  ManualImportColumnMapping,
  ManualImportFieldKey,
  ManualImportInputMode,
  ManualImportPreview,
  ManualImportPreviewRow,
  ManualImportValidationIssue,
  RateKey
} from '../types/contracts';

export const MANUAL_IMPORT_SAMPLE_CSV = [
  'hotelName,hotelRole,platform,source,roomType,stayDate,captureTime,price,currency,availability,occupancy,mealPlan,taxFeeBasis,cancellationPolicy',
  '云栖城市酒店,owner,携程演示源,ctrip-demo,亲子房,2026-05-31,2026-05-18T08:30:00.000Z,798,CNY,available,2,双早,含税含服务费,入住前24小时可取消',
  '钱江亲子酒店,competitor,携程演示源,ctrip-demo,亲子房,2026-05-31,2026-05-18T08:30:00.000Z,876,CNY,available,2,双早,含税含服务费,入住前24小时可取消',
  '西湖城市酒店,competitor,美团演示源,meituan-demo,亲子房,2026-06-06,2026-05-18T08:30:00.000Z,,CNY,no_rate,2,双早,含税含服务费,入住前24小时可取消',
  '运河商务酒店,competitor,飞猪演示源,fliggy-demo,亲子房,2026-06-13,无效时间,912,CNY,available,2,双早,含税含服务费,入住前24小时可取消'
].join('\n');

const requiredFields: ManualImportFieldKey[] = [
  'hotelName',
  'hotelRole',
  'platform',
  'source',
  'roomType',
  'stayDate',
  'captureTime',
  'price',
  'currency',
  'availability',
  'occupancy',
  'mealPlan',
  'taxFeeBasis',
  'cancellationPolicy'
];

function splitLine(line: string): string[] {
  return line.split(',').map((cell) => cell.trim());
}

function parseRows(csvText: string): Array<Record<string, string>> {
  const [headerLine, ...rowLines] = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!headerLine) return [];
  const headers = splitLine(headerLine);
  return rowLines.map((line) => {
    const values = splitLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
  });
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isIsoDateTime(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

function normalizeAvailability(value: string): ManualImportAvailability | null {
  if (['available', 'unavailable', 'no_rate', 'source_error', 'stale'].includes(value)) {
    return value as ManualImportAvailability;
  }
  return null;
}

function displayPrice(price: number | null, availability: ManualImportAvailability | null): string {
  if (availability !== 'available' || price === null) return '无可比价格';
  return `CNY ${price}`;
}

function buildRateKey(raw: Record<string, string>, occupancy: number): RateKey {
  return {
    hotelId: raw.hotelName,
    competitorGroupId: 'manual-import-preview',
    roomType: raw.roomType,
    platform: raw.platform,
    stayDate: raw.stayDate,
    occupancy,
    mealPlan: raw.mealPlan,
    taxFeeBasis: raw.taxFeeBasis,
    cancellationPolicy: raw.cancellationPolicy
  };
}

function validateRow(raw: Record<string, string>, rowNumber: number): ManualImportPreviewRow {
  const issues: ManualImportValidationIssue[] = [];
  for (const field of requiredFields) {
    if (!raw[field]) {
      issues.push({ field, severity: 'error', message: `${field} 为必填字段` });
    }
  }
  if (raw.stayDate && !isIsoDate(raw.stayDate)) {
    issues.push({ field: 'stayDate', severity: 'error', message: '入住日期必须为 YYYY-MM-DD' });
  }
  if (raw.captureTime && !isIsoDateTime(raw.captureTime)) {
    issues.push({ field: 'captureTime', severity: 'error', message: '采集时间必须为 ISO 时间' });
  }
  if (raw.currency && raw.currency !== 'CNY') {
    issues.push({ field: 'currency', severity: 'error', message: '当前预览仅支持 CNY' });
  }

  const occupancy = Number(raw.occupancy);
  if (!Number.isInteger(occupancy) || occupancy <= 0) {
    issues.push({ field: 'occupancy', severity: 'error', message: '入住人数必须为正整数' });
  }

  const availability = normalizeAvailability(raw.availability);
  if (raw.availability && availability === null) {
    issues.push({ field: 'availability', severity: 'error', message: '可用性状态不在允许范围内' });
  }

  const price = raw.price ? Number(raw.price) : null;
  if (availability === 'available' && (price === null || Number.isNaN(price) || price <= 0)) {
    issues.push({ field: 'price', severity: 'error', message: '可售样本必须包含正数价格' });
  }

  const hotelRole = raw.hotelRole === 'owner' || raw.hotelRole === 'competitor' ? raw.hotelRole : null;
  if (raw.hotelRole && hotelRole === null) {
    issues.push({ field: 'hotelRole', severity: 'error', message: '酒店角色必须为 owner 或 competitor' });
  }

  const hasRateBoundary = issues.every((issue) =>
    !['hotelName', 'platform', 'roomType', 'stayDate', 'occupancy', 'mealPlan', 'taxFeeBasis', 'cancellationPolicy'].includes(issue.field)
  );

  const importable = issues.every((issue) => issue.severity !== 'error');
  const comparable = importable && availability === 'available' && price !== null && hasRateBoundary;

  return {
    rowNumber,
    raw,
    normalized: {
      hotelName: raw.hotelName,
      hotelRole,
      platform: raw.platform,
      source: raw.source,
      roomType: raw.roomType,
      stayDate: raw.stayDate,
      captureTime: raw.captureTime,
      price: Number.isNaN(price) ? null : price,
      currency: raw.currency === 'CNY' ? 'CNY' : null,
      availability,
      occupancy: Number.isInteger(occupancy) && occupancy > 0 ? occupancy : null,
      mealPlan: raw.mealPlan,
      taxFeeBasis: raw.taxFeeBasis,
      cancellationPolicy: raw.cancellationPolicy,
      rateKey: hasRateBoundary && Number.isInteger(occupancy) && occupancy > 0 ? buildRateKey(raw, occupancy) : null
    },
    validationStatus: importable ? 'valid' : 'invalid',
    importable,
    comparable,
    displayPrice: displayPrice(Number.isNaN(price) ? null : price, availability),
    issues
  };
}

function buildMappings(columns: string[], rows: Array<Record<string, string>>): ManualImportColumnMapping[] {
  return requiredFields.map((field) => ({
    targetField: field,
    sourceColumn: columns.includes(field) ? field : null,
    required: true,
    status: columns.includes(field) ? 'mapped' : 'missing',
    sampleValue: columns.includes(field) ? rows[0]?.[field] ?? null : null
  }));
}

export function buildManualImportPreview(
  csvText: string = MANUAL_IMPORT_SAMPLE_CSV,
  inputMode: ManualImportInputMode = 'sample_csv'
): ManualImportPreview {
  const [headerLine] = csvText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const columns = headerLine ? splitLine(headerLine) : [];
  const rawRows = parseRows(csvText);
  const rows = rawRows.map((row, index) => validateRow(row, index + 1));
  const mappings = buildMappings(columns, rawRows);
  const mappedRequiredFields = mappings.filter((mapping) => mapping.status === 'mapped').map((mapping) => mapping.targetField);
  const missingRequiredFields = mappings.filter((mapping) => mapping.status === 'missing').map((mapping) => mapping.targetField);

  return {
    sourceClass: 'user_manual_import',
    inputMode,
    productionConnectionEnabled: false,
    persistenceEnabled: false,
    humanReviewRequired: true,
    sampleCsv: MANUAL_IMPORT_SAMPLE_CSV,
    columns,
    mappings,
    rows,
    validationSummary: {
      totalRows: rows.length,
      validRows: rows.filter((row) => row.validationStatus === 'valid').length,
      warningRows: rows.filter((row) => row.validationStatus === 'warning').length,
      invalidRows: rows.filter((row) => row.validationStatus === 'invalid').length,
      comparableRows: rows.filter((row) => row.comparable).length
    },
    rateBoundarySummary: {
      requiredFields,
      mappedRequiredFields,
      missingRequiredFields
    },
    guardrails: ['本地预览', '不上传', '不保存', '不连接生产来源', '人工复核后才可进入后续流程']
  };
}
```

- [ ] **Step 2: Wire dataset**

In `app/src/data/domainDrivenDataset.ts`, import:

```typescript
import { buildManualImportPreview } from './manualImportPreview';
```

Add this to the object returned by `buildDomainDrivenDemoDataset` near `captureEntry`:

```typescript
manualImportPreview: buildManualImportPreview(),
```

- [ ] **Step 3: Run targeted tests and verify GREEN**

Run:

```bash
PATH=/Users/kimi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin /opt/homebrew/bin/npm --prefix app test -- tests/data/manualImportPreview.test.ts tests/data/domainDrivenDataset.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit parser and dataset wiring**

```bash
git add app/src/data/manualImportPreview.ts app/src/data/domainDrivenDataset.ts
git commit -m "feat: add manual import preview dataset"
```

---

### Task 3: Render Manual Import Preview In Setup/Data Scope

**Files:**
- Modify: `app/src/screens/SetupDataScopeScreen.tsx`
- Modify: `app/src/styles/layout.css`
- Test: `app/tests/components/setupDataScopeScreen.test.tsx`

- [ ] **Step 1: Write failing component tests**

Append to `app/tests/components/setupDataScopeScreen.test.tsx`:

```typescript
import userEvent from '@testing-library/user-event';

it('renders local manual import mapping and validation preview', () => {
  render(<SetupDataScopeScreen dataset={demoDataset} />);

  expect(screen.getByRole('heading', { name: '手工导入预览' })).toBeVisible();
  expect(screen.getByLabelText('手工导入预览数据')).toBeVisible();
  expect(screen.getByText('字段映射')).toBeVisible();
  expect(screen.getByText('校验结果')).toBeVisible();
  expect(screen.getByText(/可比样本/)).toBeVisible();
  expect(screen.getAllByText(/hotelName|stayDate|captureTime|cancellationPolicy/).length).toBeGreaterThan(0);
  expect(screen.getByText(/不上传/)).toBeVisible();
  expect(screen.getByText(/不保存/)).toBeVisible();

  const visibleText = document.body.textContent ?? '';
  expect(visibleText).not.toMatch(/cookie|token|captcha|crawler|scraper|自动调价|推荐价格/i);
});

it('updates manual import preview from pasted rows without storage or network', async () => {
  const user = userEvent.setup();
  render(<SetupDataScopeScreen dataset={demoDataset} />);
  const input = screen.getByLabelText('手工导入预览数据');

  await user.clear(input);
  await user.type(
    input,
    [
      'hotelName,hotelRole,platform,source,roomType,stayDate,captureTime,price,currency,availability,occupancy,mealPlan,taxFeeBasis,cancellationPolicy',
      '云栖城市酒店,owner,携程演示源,ctrip-demo,亲子房,,2026-05-18T08:30:00.000Z,798,CNY,available,2,双早,含税含服务费,入住前24小时可取消'
    ].join('\n')
  );

  expect(screen.getByText(/入住日期必须/)).toBeVisible();
  expect(document.body.textContent).not.toContain('CNY 0');
});
```

- [ ] **Step 2: Run component tests and verify RED**

Run:

```bash
PATH=/Users/kimi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin /opt/homebrew/bin/npm --prefix app test -- tests/components/setupDataScopeScreen.test.tsx
```

Expected: FAIL because the manual import preview UI is not rendered.

- [ ] **Step 3: Implement UI**

In `app/src/screens/SetupDataScopeScreen.tsx`, import:

```typescript
import { useMemo, useState } from 'react';
import { buildManualImportPreview } from '../data/manualImportPreview';
```

Inside `SetupDataScopeScreen`, add:

```typescript
const [manualImportText, setManualImportText] = useState(dataset.manualImportPreview.sampleCsv);
const manualImportPreview = useMemo(
  () => buildManualImportPreview(manualImportText, manualImportText === dataset.manualImportPreview.sampleCsv ? 'sample_csv' : 'pasted_rows'),
  [dataset.manualImportPreview.sampleCsv, manualImportText]
);
```

Render this section below the existing capture entry list:

```tsx
<section className="manual-import-preview observatory-panel" aria-labelledby="manual-import-preview-title">
  <div className="panel__header instrument-header">
    <div>
      <h2 className="panel__title" id="manual-import-preview-title">手工导入预览</h2>
      <p className="panel__meta">仅在本地解析粘贴内容, 不上传、不保存、不连接生产来源。</p>
    </div>
    <span className="demo-badge">Preview</span>
  </div>
  <label className="manual-import-preview__input">
    <span className="meta-label">手工导入预览数据</span>
    <textarea
      aria-label="手工导入预览数据"
      value={manualImportText}
      onChange={(event) => setManualImportText(event.currentTarget.value)}
      rows={6}
      spellCheck={false}
    />
  </label>
  <div className="manual-import-summary" aria-label="校验结果">
    <div className="setup-item">
      <span className="meta-label">校验结果</span>
      <strong>
        {manualImportPreview.validationSummary.validRows} 有效 / {manualImportPreview.validationSummary.invalidRows} 异常
      </strong>
    </div>
    <div className="setup-item">
      <span className="meta-label">可比样本</span>
      <strong>{manualImportPreview.validationSummary.comparableRows} / {manualImportPreview.validationSummary.totalRows}</strong>
    </div>
  </div>
  <div className="manual-import-mapping">
    <h3>字段映射</h3>
    <div className="manual-import-mapping__grid">
      {manualImportPreview.mappings.map((mapping) => (
        <div className="setup-item" key={mapping.targetField}>
          <span className="meta-label">{mapping.targetField}</span>
          <strong>{mapping.sourceColumn ?? '未映射'}</strong>
          <p className="panel__meta">{mapping.sampleValue ?? '无样例值'}</p>
        </div>
      ))}
    </div>
  </div>
  <div className="manual-import-rows">
    {manualImportPreview.rows.map((row) => (
      <article className="manual-import-row" key={row.rowNumber}>
        <div>
          <strong>{row.normalized.hotelName || `第 ${row.rowNumber} 行`}</strong>
          <p className="panel__meta">
            {row.normalized.platform || '平台缺失'} · {row.normalized.roomType || '房型缺失'} · {row.normalized.stayDate || '入住日期缺失'}
          </p>
        </div>
        <span className="status-chip">{row.validationStatus === 'valid' ? '可预览' : '需修正'}</span>
        <strong>{row.displayPrice}</strong>
        {row.issues.length > 0 ? (
          <ul className="manual-import-row__issues">
            {row.issues.map((issue) => (
              <li key={`${row.rowNumber}-${issue.field}-${issue.message}`}>{issue.message}</li>
            ))}
          </ul>
        ) : null}
      </article>
    ))}
  </div>
  <div className="cluster">
    {manualImportPreview.guardrails.map((guardrail) => (
      <span className="status-chip status-chip--review" key={guardrail}>{guardrail}</span>
    ))}
  </div>
</section>
```

- [ ] **Step 4: Add scoped responsive styles**

In `app/src/styles/layout.css`, add classes for `.manual-import-preview`, `.manual-import-preview__input textarea`, `.manual-import-summary`, `.manual-import-mapping__grid`, `.manual-import-row`, and `.manual-import-row__issues`. Use existing token variables; do not add raw hex outside `tokens.css`.

- [ ] **Step 5: Run component tests and verify GREEN**

Run the same component test command.

Expected: PASS.

- [ ] **Step 6: Commit UI**

```bash
git add app/src/screens/SetupDataScopeScreen.tsx app/src/styles/layout.css app/tests/components/setupDataScopeScreen.test.tsx
git commit -m "feat: render manual import preview"
```

---

### Task 4: Add E2E, Safety Scans And Generator Notes

**Files:**
- Modify: `app/tests/e2e/app-foundation.spec.ts`
- Modify: `app/tests/domain/complianceScan.test.ts`
- Create: `docs/test-reports/2026-05-21-f-018-generator-notes.md`
- Screenshot artifacts under: `docs/test-reports/f-007-app-foundation/`

- [ ] **Step 1: Add safety scan coverage**

In `app/tests/domain/complianceScan.test.ts`, add `src/data/manualImportPreview.ts` to `scannedFiles`.

Also add assertions that source does not include:

```typescript
expect(source).not.toMatch(/FileReader|input\s+type=['"]file|FormData|navigator\.clipboard/);
```

- [ ] **Step 2: Extend Playwright setup flow**

In `app/tests/e2e/app-foundation.spec.ts`, add a setup-screen test or extend the existing setup test:

```typescript
await page.getByRole('button', { name: /设置预览/ }).click();
await expect(page.getByRole('heading', { name: '手工导入预览' })).toBeVisible();
await expect(page.getByLabel('手工导入预览数据')).toBeVisible();
await page.getByLabel('手工导入预览数据').fill([
  'hotelName,hotelRole,platform,source,roomType,stayDate,captureTime,price,currency,availability,occupancy,mealPlan,taxFeeBasis,cancellationPolicy',
  '云栖城市酒店,owner,携程演示源,ctrip-demo,亲子房,,2026-05-18T08:30:00.000Z,798,CNY,available,2,双早,含税含服务费,入住前24小时可取消'
].join('\n'));
await expect(page.getByText(/入住日期必须/)).toBeVisible();
await expect(page.locator('body')).not.toContainText('CNY 0');
```

Ensure `390x844` setup screenshot still has no horizontal overflow.

- [ ] **Step 3: Run targeted verification**

Run:

```bash
PATH=/Users/kimi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin /opt/homebrew/bin/npm --prefix app test -- tests/data/manualImportPreview.test.ts tests/data/domainDrivenDataset.test.ts tests/components/setupDataScopeScreen.test.tsx tests/domain/complianceScan.test.ts
PATH=/Users/kimi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin /opt/homebrew/bin/npm --prefix app run verify
```

Expected: targeted tests pass and full verify passes.

- [ ] **Step 4: Write Generator notes**

Create `docs/test-reports/2026-05-21-f-018-generator-notes.md` with:

```markdown
# F-018 Generator Notes

Implemented local-only manual import preview and field mapping.

Red/Green evidence:
- manual import parser tests failed before `manualImportPreview.ts` existed, then passed after implementation.
- dataset contract tests failed before `DemoDataset.manualImportPreview`, then passed after wiring.
- Setup/Data Scope tests failed before UI rendering, then passed after local preview UI.
- Playwright covered manual import preview interaction and mobile no-overflow.

Boundaries:
- No file upload.
- No network request.
- No persistence.
- No credentials, cookies, sessions, tokens or CAPTCHA handling.
- No live collection.
- No recommended price or automatic pricing.
```

- [ ] **Step 5: Commit verification artifacts**

```bash
git add app/tests/e2e/app-foundation.spec.ts app/tests/domain/complianceScan.test.ts docs/test-reports/2026-05-21-f-018-generator-notes.md docs/test-reports/f-007-app-foundation/
git commit -m "test: cover manual import preview flow"
```

---

### Task 5: Handoff For Evaluator

**Files:**
- No product changes unless verification requires a small fix.

- [ ] **Step 1: Final checks**

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

- [ ] **Step 2: Confirm unsafe methods absent**

Run:

```bash
rg -n "fetch\\(|XMLHttpRequest|FileReader|FormData|localStorage|sessionStorage|document\\.cookie|api[_-]?key|access[_-]?token|auth[_-]?token|secret|password|credential|captcha|crawler|scrap|recommendedPrice|automatic pricing|auto price" app/src app/tests
```

Expected: no unsafe implementation hits. Existing test assertions may include prohibited terms only as negative scans.

- [ ] **Step 3: Handoff**

Report:

```markdown
F-018 Generator implementation is ready for Evaluator review.

Key artifacts:
- app/src/data/manualImportPreview.ts
- app/src/screens/SetupDataScopeScreen.tsx
- app/tests/data/manualImportPreview.test.ts
- app/tests/components/setupDataScopeScreen.test.tsx
- app/tests/e2e/app-foundation.spec.ts
- docs/test-reports/2026-05-21-f-018-generator-notes.md

Next:
- Evaluator verifies F-018 manual import preview and field mapping.
```
