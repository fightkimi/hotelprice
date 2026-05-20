# F-015 Alert Review Workflow Depth

日期: 2026-05-20
角色: Planner
状态: Generator-ready planning

## Problem Statement

F-014 已经让用户可以从价格日历点击日期进入可解释的日期详情，但 Alert Review screen 仍然偏静态：默认读取第一条 signal、没有真正的提醒选择、没有本地复核状态、没有复核备注，也没有把 owner observation 与 competitor sample 证据角色组织成一个可操作的复核工作流。

F-015 要把提醒复核从“展示证据”推进到“可操作的人工复核入口”。用户应能选择一条提醒，查看触发原因、影响日期、证据角色、价格边界和样本状态，并在本地 UI 中标记复核状态和填写备注。该状态只用于前端演示和工作流表达，不得暗示已经持久化或触发任何价格动作。

## Current Project Facts

- PR #10 已将 F-013 和 F-014 合并到 `main`, merge commit 为 `a91102f`。
- 正式产品基线是 React Revenue Observatory app。
- F-008 已建立 alert math、availability/stale、snapshot ordering 和 human-review-only 语义。
- F-010 已把 owner-position evidence 拆成 owner observation 与 competitor sample。
- F-012 已建立全局 Revenue Observatory 视觉系统和截图门禁。
- F-014 已建立日期详情、平台价差、证据来源、采集时间、样本数、可比口径和 missing sample state。
- 当前 `AlertReviewScreen` 仍使用 `dataset.signals[0]` 作为静态选中项，并把第一条趋势点传给 `EvidenceDrawer`。

## Chosen Route

采用“提醒复核数据契约 + 本地 UI 工作流”路线。

原因:

- 只做 UI state 会继续缺少结构化复核数据，Evaluator 难以验证证据角色、影响日期和 rate boundary。
- 直接做后端/持久化会越过当前产品阶段，也会引入权限、审计和数据合规问题。
- 当前最有价值的切片是让正式 app 能演示收益经理真实复核路径，同时保持 fixture/manual seed 和 human-review-only 边界。

## Scope

F-015 Generator 可以修改:

- `app/src/types/contracts.ts`
- `app/src/data/domainDrivenDataset.ts`
- `app/src/screens/AlertReviewScreen.tsx`
- `app/src/components/primitives/EvidenceDrawer.tsx` 或新增局部复核组件
- `app/src/styles/layout.css`
- 相关 app tests 和 Playwright tests
- F-015 Generator notes under `docs/test-reports/`

Planner 本切片只修改文档和状态文件。

## Product Requirements

### Alert Review Data Contract

新增 `DemoDataset.alertReview` 契约，基于现有 fixture/manual alert candidates 派生，不改 F-008 alert math。

建议字段:

- `items`: 复核提醒列表。
- `selectedItemId`: 默认选中项, 应与最高优先级提醒一致。
- `statusOptions`: 本地 UI 可切换状态, 至少包含 `needs_review`, `reviewing`, `noted`。
- `notePresets`: 本地备注模板, 例如“等待人工确认竞品样本”“需要核对房态和库存”“已记录为人工关注项”。
- `guardrails`: 面向 UI 的安全边界, 必须表达“仅本地复核演示、不保存、不自动调价”。

每个 `AlertReviewItem` 至少包含:

- `id` 与 `signalId`。
- `title`, `summary`, `severity`, `primaryMetric`, `metricUnit`。
- `alertType`。
- `affectedStayDate`。
- `reviewPriority`: `high`, `medium`, `watch`。
- `defaultStatus`: 初始为 `needs_review`。
- `defaultNote`: 客户安全的本地备注初始值。
- `rateKey`: 房型、平台、入住日期、入住人数、餐食、税费和取消政策。
- `evidenceRows`: 结构化证据行, 保留 owner observation、competitor sample、market sample、latest/previous observation 等角色。
- `sampleSize`, `captureTime`, `humanReviewRequired`。

### Alert Selection

- Alert row 必须可点击或可通过键盘选择。
- 选中项必须有可见 selected state 和可访问状态。
- 默认选中 `dataset.alertReview.selectedItemId`。
- 切换提醒时右侧详情、证据、状态控件和备注区域必须一起更新。

### Review Status And Notes

- 用户可以在本地切换复核状态: 待复核、复核中、已记录。
- 用户可以填写或选择本地备注。
- 状态和备注只存在 React local state 中, 不进入 localStorage、sessionStorage、IndexedDB、后端、文件或网络请求。
- UI 文案必须避免暗示“已保存到生产系统”或“已执行价格动作”。

### Detail Content

选中提醒详情至少展示:

- 触发原因和影响入住日期。
- 指标变化值和优先级。
- owner observation 与 competitor sample 证据角色。
- 来源平台、采集时间、样本数和置信度。
- 房型、入住人数、餐食、税费、取消政策。
- 事件或日期上下文可以引用 F-014 的日历详情, 但 F-015 不需要新增跨屏路由。
- `需人工复核` 和 human-review-only 边界。

### Empty And Missing Data States

- 如果某条提醒缺少某类证据, 详情应展示客户安全的“样本不足/等待人工补充”状态。
- 不得渲染 `CNY null`, `CNY 0`, 空 rateKey, 空来源或伪造价格。
- 当前 fixture seed 至少应生成一条 owner-position alert, 并能展示 owner observation 与 competitor sample。

## Visual And Accessibility Requirements

- 继续复用 F-012 Revenue Observatory 视觉系统。
- Alert rows 在桌面上保持列表 + 详情工作台布局, 移动端转为单列或安全堆叠。
- 复核状态控件使用 segmented buttons 或等效按钮组, 不使用含糊的自由文本按钮。
- 备注输入必须有 label, 不依赖 placeholder 作为唯一说明。
- `390x844`, `1440x900`, `2048x1352` 相关截图不得横向溢出。
- 禁止出现用户可见的抓取、凭证、cookie、验证码、自动调价、推荐价格等文案。

## Non-Goals

- 不新增真实 OTA 或其他 live collection。
- 不新增后端、数据库、持久化、文件上传或浏览器自动化。
- 不改变 F-008 alert math。
- 不改写 F-014 Calendar date detail workflow。
- 不新增自动调价、推荐价格、自动发布价格或任何价格动作。
- 不保存复核备注到浏览器存储或远端服务。

## Acceptance Criteria

- `DemoDataset.alertReview.items` 与 `dataset.signals` 保持一一或明确映射。
- 每条 `AlertReviewItem` 都有 `affectedStayDate`, `rateKey`, `evidenceRows`, `sampleSize`, `captureTime`, `humanReviewRequired: true`。
- owner-position alert 至少展示一条 owner observation 和一条 competitor sample 证据。
- 点击不同 alert row 后, 详情标题、影响日期、证据、状态控件和备注区联动。
- 复核状态切换只影响当前页面 local state, 不写入 browser storage 或网络。
- 备注输入只影响当前页面 local state, 切换提醒后能保留该提醒在本次页面会话中的备注。
- Playwright 覆盖移动端 alert selection + status + note 流程, 且无横向溢出。
- 完整 app verification、Triad、JSON、prototype regression、diff check 和安全扫描通过。

## Generator Task Summary

- B-054: Implement F-015 with strict TDD from `docs/superpowers/plans/2026-05-20-alert-review-workflow-depth.md`.
- Keep commits small: data contract, UI interaction, screenshot/e2e coverage, Generator notes.
- Do not produce final acceptance conclusion.

## Evaluator Checklist

- Verify data contract and mapping from signals/alert candidates.
- Verify alert selection and selected detail content.
- Verify local-only status and notes with browser storage/network safety checks.
- Verify evidence roles and rate-boundary visibility.
- Verify responsive no-overflow behavior and screenshot dimensions.
- Verify no F-008 alert math change.
- Verify no live collection, persistence, credentials, cookie/session/CAPTCHA, recommended price, or automatic pricing.
- Verify project docs freshness after implementation.
