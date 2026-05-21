# F-016 Market Comparison Drilldown

日期: 2026-05-21
角色: Planner
状态: Generator-ready planning

## Problem Statement

F-014 已经让价格日历可以按日期查看平台价差、证据来源、采集时间和可比口径。F-015 又把 Alert Review 推进成可选择、可备注、仅本地状态的人工复核工作流。但 Market Comparison screen 仍停留在平台汇总条: 用户只能看到每个平台的本酒店价、核心竞品均价、价差和覆盖率，无法下钻到具体竞品、房型、入住日期、样本状态和证据。

F-016 要把 Market Comparison 从“平台汇总图”推进到“可解释的竞品价差工作台”。用户应能选择一个平台/日期/房型组合，查看本酒店价格、核心竞品价格区间、每个竞品样本状态、缺失/过期/不可用解释、证据来源、采集时间和可比口径。该工作流仍只使用 fixture/manual seed 数据，不接真实平台，不保存状态，不提供推荐价格或自动调价。

## Current Project Facts

- PR #11 已将 F-015 合并到 `main`, merge commit 为 `185e883`。
- 正式产品基线是 React Revenue Observatory app。
- F-008 已建立 comparable rate key、availability/stale、snapshot ordering、alert math 和 compliance scan。
- F-009 已建立领域 seed 到 UI dataset 的纯转换。
- F-012 已建立 Revenue Observatory 视觉系统和 `2048x1352` / `1440x900` / `390x844` 截图门禁。
- F-014 已建立 `calendarDetails.byDate`、日期点击详情、平台价差 rows、证据来源、采集时间、rate basis 和 missing-sample state。
- F-015 已建立 `alertReview` workflow、提醒选择、本地状态/备注、证据角色和 rate-boundary visibility。
- 当前 `MarketComparisonScreen` 只读取 `dataset.platformGaps.rows` 并渲染 `PlatformGapBars` 与右侧平台列表。
- 当前 `PlatformGapRow` 只有 `platform`, `ownerRate`, `coreAverage`, `gap`, `coverage`，缺少 stay date、competitor samples、sample status、capture time、evidence 和 rate basis。

## Route Options

### Option A: UI-only Drilldown

只在 `MarketComparisonScreen` 里用现有 `platformGaps.rows` 做本地选择和详情。实现快，但无法展示竞品样本状态、缺失解释和证据来源，业务解释力不足。

### Option B: Data Contract + UI Drilldown

新增 `DemoDataset.marketDrilldown` 契约，由 `domainSeed` 的 fixture/manual snapshots 派生 `platform x stayDate x roomType` 组合。Market screen 用本地 selected id 展示详情。该方案能被单元测试和 Playwright 验证，也继承 F-008/F-014/F-015 的数据边界。

### Option C: Cross-screen Drilldown Router

把 Calendar、Market 和 Alert Review 的选中状态抽成全局 context 或路由参数。想象力更大，但会引入跨屏状态设计，超出本切片。

## Chosen Route

采用 Option B: **Market Comparison data contract + local UI drilldown**。

原因:

- F-016 的价值是解释价差来源，而不是只给平台汇总图加点击效果。
- `domainDrivenDataset.ts` 已有足够 helper 可复用: `latestForHotelDateSource`, `latestAvailableForHotelDateSource`, `coreCompetitors`, `averageCents`, `representativeSnapshot`, `eventImpactForDate`, `rateBasisForDate`。
- 本切片能保持 fixture/manual seed、human-review-only 和 no-live-collection 边界。
- 跨屏路由可以留到后续 F-017 或更大的 workflow integration。

## Scope

F-016 Generator 可以修改:

- `app/src/types/contracts.ts`
- `app/src/data/domainDrivenDataset.ts`
- `app/src/screens/MarketComparisonScreen.tsx`
- `app/src/App.tsx`
- `app/src/styles/layout.css`
- `app/tests/data/domainDrivenDataset.test.ts`
- `app/tests/components/marketComparisonScreen.test.tsx` 或扩展 `revenueObservatoryScreens.test.tsx`
- `app/tests/e2e/app-foundation.spec.ts`
- `docs/test-reports/2026-05-21-f-016-generator-notes.md`
- F-016 相关 screenshot artifacts under `docs/test-reports/f-007-app-foundation/`

Planner 本切片只修改文档和状态文件。

## Product Requirements

### Market Drilldown Data Contract

新增 `DemoDataset.marketDrilldown` 契约，基于现有 fixture/manual domain seed 派生，不改 F-008 alert math。

建议字段:

- `options`: 可选择的 market drilldown 组合列表。
- `selectedOptionId`: 默认选中项，应优先指向 `dataScope.stayWindow.focusDate` 和第一可用平台。
- `byId`: 详情字典，key 为 option id。
- `guardrails`: 面向 UI 的安全边界，必须表达“fixture/manual 演示数据、仅供人工复核、不自动调价、不保存状态”。

每个 `MarketDrilldownOption` 至少包含:

- `id`
- `platform`
- `stayDate`
- `roomType`
- `label`
- `eventLabel`
- `status`: `available` 或 `missing-sample`
- `gap`
- `coverage`
- `sampleSize`

每个 `MarketDrilldownDetail` 至少包含:

- `id`
- `platform`
- `stayDate`
- `roomType`
- `currency: 'CNY'`
- `ownerRate`
- `coreAverage`
- `gap`
- `competitorRange`
- `coverage`
- `sampleSize`
- `captureTime`
- `eventImpact`
- `rateBasis`
- `competitorSamples`
- `evidenceMarkers`
- `missingSampleReason`
- `humanReviewRequired: true`

每个 `MarketCompetitorSample` 至少包含:

- `hotelId`
- `hotelName`
- `competitorLevel`
- `price`
- `gapToOwner`
- `status`: `available`, `missing-sample`, `stale`, `unavailable`, `source-error`
- `statusLabel`
- `explanation`
- `source`
- `captureTime`
- `rateKey`

### Drilldown Option Selection

- Market screen 必须有可点击或键盘可聚焦的 drilldown options。
- 默认选中 `dataset.marketDrilldown.selectedOptionId`。
- 选中态必须可见，并可通过 `aria-pressed` 或等效状态表达。
- 点击不同组合后，详情面板必须更新 platform、stay date、owner/core rate、competitor samples、evidence、capture time 和 rate basis。

### Detail Content

选中详情至少展示:

- 平台、入住日期、房型和事件上下文。
- 本酒店价、核心竞品均价、价差、核心竞品价格区间。
- 每个核心竞品的价格或客户安全状态。
- 样本覆盖、样本数、采集时间。
- 证据来源，至少包含本酒店观测和核心竞品样本。
- 可比口径: 入住人数、餐食、税费、取消政策。
- `需人工复核` 和 human-review-only 边界。

### Missing, Stale, And Unavailable States

- 缺少本酒店价或核心竞品均价时，不得渲染 `CNY null` 或 `CNY 0`。
- `no_rate` 映射为客户安全的 `missing-sample`。
- `source_error` 映射为客户安全的 `source-error`，文案使用“来源样本暂不可用”一类表达，不暴露内部调试字段。
- `unavailable` 映射为“暂不可售/不可比样本”。
- `stale` 映射为“样本过期，需等待人工导入或获授权来源补充”。
- 如果整组缺少可比样本，详情展示 `missingSampleReason`，但仍保留 platform、stay date、room type、rate basis、human review 和 guardrails。

### Visual And Accessibility Requirements

- 继续复用 F-012 Revenue Observatory primitives: `observatory-screen`, `observatory-panel`, `instrument-header`, `insight-rail`, `chart-frame`。
- 桌面建议为左侧平台/日期组合与图表，右侧 sticky detail rail。
- 移动端必须单列堆叠，详情区不得遮挡样本证据。
- 竞品样本列表必须可扫描，status chip 不挤压酒店名或价格。
- `390x844`, `1440x900`, `2048x1352` 相关截图不得横向溢出。
- 禁止出现用户可见的抓取、凭证、cookie、验证码、自动调价、推荐价格等文案。

## Non-Goals

- 不新增真实 OTA 或其他 live collection。
- 不新增后端、数据库、持久化、文件上传或浏览器自动化。
- 不改变 F-008 alert math。
- 不改写 F-014 Calendar date detail workflow。
- 不改写 F-015 Alert Review local workflow。
- 不新增自动调价、推荐价格、自动发布价格或任何价格动作。
- 不新增跨屏全局 selected-date/router 状态。

## Acceptance Criteria

- `DemoDataset.marketDrilldown.options` 覆盖 platform/date/room type 组合，并至少包含 `platformFocusDate` 的全部演示平台。
- `selectedOptionId` 指向存在的 detail，默认 detail 与 context focus date 对齐。
- available detail 展示本酒店价、核心竞品均价、价差、价格区间、样本覆盖、采集时间、rate basis、evidence 和至少 3 条核心竞品样本。
- missing/unavailable/stale/source-error detail 不渲染 `CNY null` 或 `CNY 0` 伪价格，并展示客户安全解释。
- 每条 competitor sample 保留 `hotelId`, `hotelName`, `competitorLevel`, `status`, `source`, `captureTime`, `rateKey`。
- Market screen 点击不同 option 后，详情 platform、stay date、竞品样本和状态解释联动。
- Playwright 覆盖移动端 market drilldown selection，且无横向溢出。
- 完整 app verification、Triad、JSON、prototype regression、diff check 和安全扫描通过。

## Generator Task Summary

- B-058: Implement F-016 with strict TDD from `docs/superpowers/plans/2026-05-21-market-comparison-drilldown.md`.
- Keep commits small: data contract, UI interaction, screenshot/e2e coverage, Generator notes.
- Do not produce final acceptance conclusion.

## Evaluator Checklist

- Verify `marketDrilldown` data contract and option/detail mapping.
- Verify available detail math, competitor range and sample coverage.
- Verify missing/stale/unavailable/source-error states and absence of pseudo prices.
- Verify rate boundaries: platform, room type, stay date, occupancy, meal plan, tax/fee basis, cancellation policy, currency and capture time.
- Verify Market screen selection, selected state and detail updates.
- Verify responsive no-overflow behavior and screenshot dimensions.
- Verify no F-008 alert math, F-014 calendar workflow or F-015 alert review workflow regression.
- Verify no live collection, persistence, credentials, cookie/session/CAPTCHA, storage, recommended price or automatic pricing.
- Verify project docs freshness after implementation.
