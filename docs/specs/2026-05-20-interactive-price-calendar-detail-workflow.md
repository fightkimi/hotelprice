# F-014 Interactive Price Calendar Detail Workflow

日期: 2026-05-20
角色: Planner
状态: Generator-ready planning

## Problem Statement

当前正式 React app 的 Calendar screen 仍是展示型日历。`CalendarScreen` 写死 `selectedDate = '2026-05-31'`，`CalendarHeatmap` 虽然把日期格渲染为 button，但没有 `onSelectDate` 回调；右侧详情只读取 `HeatmapDay` 的本酒店价、核心竞品均价、事件和样本数，缺少平台价差、证据来源、采集时间、样本状态、可比口径和人工复核解释。

F-014 要把日历从静态展示推进成可操作复核入口：用户点击任意入住日期后，右侧详情即时联动，并展示该日期的本店、竞品、平台、事件、样本和证据边界。

## Current Project Facts

- F-013 项目级 PRD 和开发计划已被 Evaluator accepted。
- 正式产品基线是 F-012 Revenue Observatory app。
- F-008 已建立 rate boundary、availability/stale 和 alert math。
- F-009 已建立 domain seed 到 `DemoDataset` 的纯 UI adapter。
- F-010 已建立 owner/competitor evidence roles。
- F-011 已建立 data scope 和 capture entry preview。
- F-014 不改变 domain alert math，不接真实数据，不新增后端或持久化。

## Chosen Route

采用方案 B：日期详情数据契约 + UI 联动。

原因:

- UI-only 会让右侧详情继续依赖粗粒度 `HeatmapDay`，无法形成业务复核闭环。
- 更大范围 alert workflow 会引入跨屏状态和路由设计，适合 F-015 以后。
- F-014 当前最有价值的边界是给 `CalendarScreen` 一个明确、可测试、可解释的 date-detail contract。

## Scope

F-014 Generator 可以修改:

- `app/src/types/contracts.ts`
- `app/src/data/domainDrivenDataset.ts`
- `app/src/components/charts/CalendarHeatmap.tsx`
- `app/src/screens/CalendarScreen.tsx`
- `app/src/styles/layout.css`
- 相关 app tests 和 Playwright tests
- F-014 Generator notes under `docs/test-reports/`

Planner 本切片只修改文档和状态文件。

## New Data Contract

新增 `CalendarDayDetail` 契约，并挂到 `DemoDataset.calendarDetails.byDate`。

建议字段:

- `stayDate`: 入住日期, 例如 `2026-05-31`。
- `label`: UI 日期短标签, 例如 `05/31`。
- `status`: 与 `HeatmapDay.status` 对齐, 至少支持 `normal`, `event-lift`, `unavailable`。
- `ownerRate`: 本酒店价格, 缺失时为 `null`。
- `coreAverage`: 核心竞品均价, 缺失时为 `null`。
- `gap`: 本酒店价减核心竞品均价, 缺失时为 `null`。
- `currency`: `CNY`。
- `eventImpact`: 事件解释, 包含 `label`, `type`, `lift`, `confidence`。
- `platformGaps`: 按平台列出 owner/core/gap/coverage/sample/status。
- `evidenceMarkers`: 证据来源, 复用或扩展安全的 `EvidenceMarker` 展示结构。
- `sampleSize`: 该日期可比样本总数。
- `missingSampleReason`: 缺失样本的客户安全解释。
- `rateBasis`: 房型、入住人数、餐食、税费、取消政策和平台范围。
- `captureTime`: 该日期详情使用的最新采集时间。
- `humanReviewRequired`: 固定为 `true`。

## Interaction Requirements

- `CalendarHeatmap` 接收 `selectedDate` 和 `onSelectDate`。
- 点击日期 button 后调用 `onSelectDate(day.date)`。
- 选中日期必须有可见选中态和可访问状态。
- `CalendarScreen` 用 React state 管理选中日期，初始值优先取 `dataset.dataScope.stayWindow.focusDate`，否则取第一个 `calendarDetails.byDate` key 或第一天 heatmap day。
- 右侧详情读取 `dataset.calendarDetails.byDate[selectedDate]`。
- 若点击不可用日期, 详情展示 missing sample state，不渲染 `CNY null` 或 `CNY 0` 伪价格。
- `detailOpen=false` 时仍保留数据状态，但响应布局遵循现有 drawer/panel state。

## Detail Panel Content

右侧详情至少展示:

- 入住日期和事件上下文。
- 本酒店价。
- 核心竞品均价。
- 价差。
- 平台价差 rows。
- 证据来源。
- 采集时间。
- 样本数。
- 房型、平台范围、含税口径、入住人数、取消政策。
- `需人工复核`。

不可用日期详情至少展示:

- 日期。
- 事件上下文, 如果存在。
- `暂无可比样本` 或同等客户安全文案。
- 缺失原因。
- 样本数为 0 或可用样本数解释。
- 人工复核提示。

## Visual And Accessibility Requirements

- 继续复用 F-012 Revenue Observatory visual primitives。
- 不引入新的视觉语言或 H5 prototype CSS。
- 平台价差 rows 在桌面详情面板中可扫描，移动端不能造成横向溢出。
- 日期格 button 需要有清晰的 `aria-label`，包含日期、状态、事件或样本提示。
- 选中日期需要 `aria-pressed` 或等效可访问状态。
- 详情 panel 需要能通过 Testing Library 文本和 role 查询验证。

## Non-Goals

- 不接真实 OTA。
- 不新增后端、数据库、持久化或文件上传。
- 不改变 F-008 alert math。
- 不新增跨屏路由或全局 selectedDate store。
- 不自动打开 Alert Review drawer。
- 不推荐价格、不自动调价、不自动发布价格。

## Acceptance Criteria

- `DemoDataset` 暴露 `calendarDetails.byDate`，且每个 `heatmap.days` 日期都有对应详情。
- `2026-05-31` 详情包含四个平台价差 rows、事件影响、证据来源、采集时间、样本数、rate basis 和 `humanReviewRequired: true`。
- `2026-05-27` 或不可用日期详情显示 missing sample state, `ownerRate/coreAverage/gap` 为 `null`，且 UI 不渲染 `CNY null` 或 `CNY 0` 伪价格。
- `CalendarHeatmap` 点击日期会调用 `onSelectDate` 并更新选中态。
- `CalendarScreen` 点击 `05/30` 后右侧详情从初始日期切到端午演示假期详情。
- Playwright 覆盖 `/?screen=calendar&state=detail-open` 的日期点击流程。
- 移动端 `390x844` 无横向溢出。
- 完整 `/opt/homebrew/bin/npm run verify` 通过。
- Triad、JSON、prototype regression 和 `git diff --check` 通过。
- 静态安全扫描不出现 live collection、credential、cookie/session、CAPTCHA、browser automation、storage、recommended-price 或 automatic-pricing 能力。

## Generator Task List

1. 用 TDD 扩展 `DemoDataset` 和 `domainDrivenDataset`，生成 `calendarDetails.byDate`。
2. 用 TDD 给 `CalendarHeatmap` 增加 `onSelectDate` 和可访问选中态。
3. 用 TDD 让 `CalendarScreen` 管理 selected date，并渲染完整日期详情。
4. 增加 Playwright 日期点击流程和移动端无溢出检查。
5. 运行 targeted tests、完整 verify、Triad/JSON/prototype checks，并写 F-014 Generator notes。

## Evaluator Checklist

Evaluator 应独立检查:

- 数据契约是否每个 heatmap day 都有详情。
- 详情是否保留 property、competitor、channel/source、stay date、currency、tax/fee、room type、occupancy 和 cancellation policy 边界。
- 不可用、无价格、source error、stale 是否不会显示为有效价格。
- 点击日期是否真实联动右侧详情。
- 平台价差、证据来源、采集时间、样本数和人工复核是否可见。
- UI 是否复用 Revenue Observatory primitives。
- 移动端和 2048 宽屏是否无横向溢出。
- 无真实采集、凭证、cookie/session、验证码、storage、推荐价或自动调价能力。
- F-014 是否没有改变 F-008 alert math。
