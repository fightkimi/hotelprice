# F-018 Manual Import Preview And Field Mapping

日期: 2026-05-21
角色: Planner
状态: Generator-ready planning

## Problem Statement

F-017 已经接受为 Phase 3 的数据来源策略与合规闸门, 明确下一步应优先做 `F-018-manual-import-preview-and-field-mapping`。当前正式 app 仍只展示数据范围和采集入口状态。Setup/Data Scope 屏幕说明了“手工导入预览”这个入口, 但用户还不能看到一份手动数据如何被识别、映射、校验, 也不能看到导入前哪些字段会影响 comparable rate key。

F-018 要把手工导入入口推进成一个安全的本地预览工作流: 用户可以查看或粘贴 CSV-like 文本, 系统在前端本地解析为预览行, 展示字段映射、校验问题、样本覆盖、可比口径和人工复核边界。该功能只做 preview 和 validation, 不上传、不保存、不接真实 OTA、不处理凭证、不触发自动调价。

## Current Project Facts

- PR #13 已合并到 `main`, merge commit 为 `5c4eef3`。
- F-017 已通过 B-063 Evaluator 验收, 下一步是 B-064 准备 F-018。
- F-011 已在 Setup/Data Scope 中展示 data scope 与 capture entry preview, 其中 `manual-import` 是可进入复核的入口。
- F-008 已定义 rate key 边界: hotel/property, competitor group, platform/source, stay date, room type, occupancy, meal plan, tax/fee basis, cancellation policy, currency and capture time。
- F-014/F-016 已要求缺失、不可用、过期或来源错误样本不能显示为伪价格。
- F-017 要求 manual import preview 保持本地预览, 不持久化, 不连接外部系统。

## Domain Classification

- Affected domains: channel/source connector preview, manual import, field mapping, rate capture boundary validation, data quality precheck, admin setup.
- Data binding: user-provided/manual data, property-bound, competitor-bound, channel-bound, stay-date-bound, capture-time-bound, currency-bound, room-type-bound, occupancy-bound, tax/fee-bound and cancellation-policy-bound.
- Data type: local pasted text or local fixture sample for preview only. No production data storage, no backend write, no real platform connection.
- Capture method: manual import preview only. No live collection, no browser automation, no credential/cookie/session/CAPTCHA handling.
- Pricing automation: no recommendations, no automatic pricing, no channel writeback. Every preview row remains human-review-only.

## Route Options

### Option A: Static Manual Import Mock

Only add static copy under Setup/Data Scope explaining which columns are required. Low risk, but too weak: customers cannot see whether the product can map real-looking rows into rate boundaries.

### Option B: Local CSV/Pasted-Row Preview With Field Mapping

Add a pure local parser/mapper/validator and a Setup screen preview panel. Use sample CSV by default, allow text editing in component state, and derive field mapping plus validation results locally. This demonstrates product value while preserving F-017 boundaries.

### Option C: File Upload Preview

Allow selecting a local CSV file in the browser. This feels closer to the production workflow, but introduces file APIs and file handling before the project has a persistence/security model. It is better left for a later slice.

## Chosen Route

Choose Option B: **Local CSV/Pasted-Row Preview With Field Mapping**.

Rationale:

- It gives customers a tangible Phase 3 workflow without crossing into upload, storage or live connection.
- It can be implemented entirely with pure functions and local React state.
- It directly tests the F-008/F-014/F-016 rate-boundary model against manually supplied rows.
- It keeps F-017 source strategy intact: user manual import is allowed only as preview and local validation.

## Scope

F-018 Generator may modify:

- `app/src/types/contracts.ts`
- `app/src/data/manualImportPreview.ts`
- `app/src/data/domainDrivenDataset.ts`
- `app/src/screens/SetupDataScopeScreen.tsx`
- `app/src/styles/layout.css`
- `app/tests/data/manualImportPreview.test.ts`
- `app/tests/data/domainDrivenDataset.test.ts`
- `app/tests/components/setupDataScopeScreen.test.tsx`
- `app/tests/e2e/app-foundation.spec.ts`
- `app/tests/domain/complianceScan.test.ts`
- `docs/test-reports/2026-05-21-f-018-generator-notes.md`
- F-018 related screenshots under `docs/test-reports/f-007-app-foundation/`

Planner may modify only docs/status files for this planning slice.

## Manual Import Contract

Add `manualImportPreview` to `DemoDataset`.

Required top-level fields:

- `sourceClass: 'user_manual_import'`
- `inputMode: 'sample_csv' | 'pasted_rows'`
- `productionConnectionEnabled: false`
- `persistenceEnabled: false`
- `humanReviewRequired: true`
- `sampleCsv`
- `columns`
- `mappings`
- `rows`
- `validationSummary`
- `rateBoundarySummary`
- `guardrails`

Required mapped fields:

- `hotelName`
- `hotelRole`: owner or competitor
- `platform`
- `source`
- `roomType`
- `stayDate`
- `captureTime`
- `price`
- `currency`
- `availability`
- `occupancy`
- `mealPlan`
- `taxFeeBasis`
- `cancellationPolicy`

Required validation statuses:

- `valid`
- `warning`
- `invalid`

Required row states:

- `available`
- `unavailable`
- `no_rate`
- `source_error`
- `stale`

## Validation Rules

F-018 should validate preview rows with these rules:

- Required fields must be present: hotel name, hotel role, platform, source, room type, stay date, capture time, currency, availability, occupancy, meal plan, tax/fee basis and cancellation policy.
- `stayDate` must be `YYYY-MM-DD`.
- `captureTime` must be parseable as an ISO timestamp.
- `currency` must be `CNY` for this slice.
- `occupancy` must be a positive integer.
- `availability=available` requires a positive numeric price.
- `availability` values of `unavailable`, `no_rate` or `source_error` may have blank price, but must not render as `CNY 0`.
- Rows missing rate-key fields are invalid for comparison.
- Rows with valid boundaries but non-available state are previewable but not comparable.
- Every row remains human-review-only.

## UI Requirements

Setup/Data Scope should gain a manual import preview section that shows:

- source class and preview-only status;
- a textarea seeded with sample CSV text, or equivalent local input control;
- a field mapping table with required/optional status and sample value;
- validation summary: total rows, valid rows, warning rows, invalid rows, comparable rows;
- row preview list showing hotel role, hotel name, platform, room type, stay date, availability, price display, validation issues and rate-key boundaries;
- guardrails: no upload, no storage, no production connection, no automatic pricing, human review required.

Mobile layout must remain single-column and no-overflow at `390x844`.

## Non-Goals

- No file upload.
- No Excel binary parsing.
- No backend route or persistence.
- No localStorage/sessionStorage.
- No live OTA collection.
- No browser automation.
- No credential, cookie, session, token or CAPTCHA handling.
- No source API connector.
- No price recommendation or automatic pricing.
- No change to F-008 alert math.
- No change to F-014 calendar workflow, F-015 alert review workflow or F-016 market drilldown workflow.

## Acceptance Criteria

- `DemoDataset.manualImportPreview` exists and is generated from a local sample CSV through a pure helper.
- Manual import preview exposes mappings for all required rate-boundary fields.
- At least one sample row is valid and comparable.
- At least one sample row shows customer-safe validation issues.
- Invalid or non-available rows do not render pseudo prices such as `CNY 0` or `CNY null`.
- Setup/Data Scope renders the manual import preview, field mappings, validation summary, row issues and guardrails.
- Textarea edits update preview state locally without network calls, storage writes or file upload.
- Safety scans confirm no `fetch`, `XMLHttpRequest`, `localStorage`, `sessionStorage`, `document.cookie`, browser automation, credential, token, CAPTCHA, recommended pricing or automatic pricing code.
- Playwright covers Setup/Data Scope manual import preview at desktop and mobile, including no horizontal overflow.
- Full app verification, Triad, JSON, prototype regression and `git diff --check` pass.

## Generator Task Summary

- B-065: Implement F-018 with strict TDD from `docs/superpowers/plans/2026-05-21-manual-import-preview-and-field-mapping.md`.
- Keep commits small: contract/parser tests, dataset wiring, UI interaction, e2e/safety/screenshots, Generator notes.
- Do not create final acceptance report.

## Evaluator Checklist

- Verify the import preview is local-only and preview-only.
- Verify no file upload, network call, persistence, credential/session/CAPTCHA handling, live collection, recommended price or automatic pricing.
- Verify mapping covers all required rate-key fields.
- Verify validation rules for missing fields, invalid dates, invalid capture time, currency, occupancy, availability and price.
- Verify non-available and invalid rows do not render pseudo prices.
- Verify Setup/Data Scope UI interaction and responsive no-overflow behavior.
- Verify F-008/F-014/F-015/F-016 behavior is not regressed.
- Verify project docs freshness and PR hygiene.
