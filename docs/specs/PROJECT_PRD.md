# 酒店竞品价格雷达项目 PRD

版本: 2026-05-20
状态: 项目级需求真源, 随每个已验收 feature 更新
维护角色: Planner
当前正式产品基线: F-012 Production Revenue Observatory Visual Upgrade, 已合并至 `main` through PR #8
当前规划切片: F-014 Interactive Price Calendar Detail Workflow

## 1. 产品定位

酒店竞品价格雷达是面向单体酒店、酒店集团收益团队和业主方的竞品价格观测产品。产品帮助用户在房型、平台、日期、节假日和市场事件维度上理解本酒店与核心竞品的价格差异、趋势变化和异常信号。

产品不是自动调价系统。所有价格动作必须保持人工复核和人工决策。系统可以展示信号、证据、风险和建议关注点，但不能直接修改价格、发布房价或暗示无需人工确认的自动化定价。

## 2. 目标用户

- 收益经理: 需要每天检查本酒店与竞品在关键日期、房型和平台上的价格位置。
- 酒店总经理: 需要快速理解市场趋势、节假日冲击和本店风险。
- 业主或投资人: 需要看到产品能解释市场机会、数据覆盖和商业价值。
- 运营负责人: 需要确认数据来源、采集范围、异常提醒和复核流程可控。
- 系统管理员: 需要维护酒店档案、竞品集合、平台范围、数据范围和合规状态。

## 3. 用户问题

- 竞品价格变化分散在多个平台和日期里, 靠人工巡检容易遗漏。
- 不同房型、含税口径、入住人数、取消政策和平台来源会造成不可比价格。
- 节假日、会展、演唱会等事件会影响价格, 但影响路径不容易被解释。
- 只看到价差不足够, 用户还需要知道证据来自哪里、是否过期、是否可用、是否需要复核。
- 投资人和客户演示需要高级数据产品质感, 但正式产品不能只是静态 H5 视觉。

## 4. 产品目标

1. 建立可解释的竞品价格观测中心, 覆盖房型、平台、日期、事件和本店位置。
2. 将价格数据纳入明确边界: 酒店、竞品、平台、入住日期、采集时间、币种、税费、房型、入住人数、餐食和取消政策。
3. 用趋势图、日历热力、平台价差、事件时间线和提醒复核来展示信号。
4. 保持数据来源合规: 当前产品只使用演示数据、fixture/manual seed、手动或获授权来源预览。
5. 建立项目级文档真源, 让后续 feature、验收和客户沟通始终对齐。

## 5. 非目标

- 不做未授权 OTA 实时抓取。
- 不接收或展示用户凭证、cookie、session、验证码绕过能力或内部采集调试字段。
- 不提供自动调价、自动发布价格或无需人工确认的定价建议。
- 不把 H5 prototype CSS 直接搬进正式 React app。
- 不在未定义合规来源前实现生产数据采集任务。

## 6. 核心领域概念

- Property: 本酒店或管理范围内的酒店资产。
- Competitor: 与本酒店可比较的竞品酒店。
- Competitor Set: 针对一个 Property 维护的竞品集合。
- Channel 或 Source: 价格来源平台, 例如携程、美团、飞猪、同程或获授权数据源。
- Room Type: 可比较房型, 必须考虑房型归一化。
- Comparable Rate Key: 判断价格是否可比的组合键, 至少包含酒店、房型、入住日期、平台、币种、税费口径、入住人数和取消政策。
- Rate Snapshot: 某个采集时间点的价格观测, 包含可用性、价格、币种、采集时间、来源和证据状态。
- Availability State: `available`, `unavailable`, `no_rate`, `source_error`, `stale` 等状态, 不可把不可用或过期样本渲染成有效价格。
- Event Context: 节假日、会展、演唱会等需求事件, 只用于解释趋势, 不直接触发自动调价。
- Evidence: 支撑提醒和价差的证据, 需要区分本店观测和竞品样本。
- Human Review: 人工复核状态, 任何价格动作都必须停在人工复核前。

## 7. 当前产品基线

已合并到 `main` 的正式 app 基线包括:

- F-007: React formal app foundation, 含 AppShell、ContextRibbon、SignalPanel、EvidenceDrawer 和四类图表 primitives。
- F-008: domain core rate boundaries, 含 comparable rate key、availability/stale、snapshot ordering、alert rules 和 compliance scan。
- F-009: domain-driven UI data flow, 将领域 seed 数据转换为正式 UI dataset。
- F-010: owner-position evidence enrichment, 区分本店观测和竞品证据。
- F-011: data scope and capture entry preview, 展示数据范围、采集入口和 production connection disabled 状态。
- F-012: Revenue Observatory visual upgrade, 覆盖 overview、calendar、market comparison、alert review 和 setup/data scope 五个屏, 提供宽屏观测舱、图表框架和移动端无溢出门禁。
- F-013: project PRD and development plan maintenance, 建立项目级 PRD、项目级开发计划和每周维护机制。

历史 H5 prototype 仍可作为演示灵感和回归测试对象, 但正式产品的实现真源是 React app 和已验收 feature 文档。

## 8. 核心功能需求

### 8.1 今日概览

- 展示本酒店价格位置、市场变化、平台覆盖、房型覆盖、异常提醒和本店风险。
- 指标必须区分演示数据、样本覆盖和人工复核状态。
- 视觉上使用 Revenue Observatory 语言: 仪表头、信号轨、metric lattice、insight rail 和 chart frame。

### 8.2 价格日历

- 按入住日期展示价格、可用性、事件影响和异常信号。
- 不可用、无价格、来源错误和过期样本必须有明确状态, 不能伪装成有效价格。
- 当前规划重点是 F-014: 支持日期点击、日期详情、平台价差、证据来源、采集时间、可比口径和 missing sample state。

### 8.3 竞品监控与平台价差

- 按平台展示本店与竞品的价差、覆盖率和样本质量。
- 保留 platform-bound、competitor-bound、room-type-bound 和 date-bound 边界。
- 图表 tooltip 和证据必须说明来源、时间和可比口径。

### 8.4 异常提醒与复核

- 只展示需要人工关注的信号, 不自动执行价格动作。
- 证据需要区分 owner observation 和 competitor sample。
- 复核流应支持用户理解触发原因、样本状态、影响日期和后续人工动作。

### 8.5 数据范围与采集入口

- 展示当前启用的酒店、竞品、平台、房型、事件和样本范围。
- 当前正式产品必须保持 production connection disabled。
- 后续真实数据只能来自合规来源: 官方 API、合作数据源、channel manager、PMS、用户上传或手动导入。

### 8.6 视觉与交互体验

- 正式产品应呈现投资级数据产品质感, 不是粗糙后台。
- 宽屏下应充分利用 2048px 级别空间, 移动端 390x844 不横向溢出。
- 所有屏幕保持同一视觉系统, 不出现 H5 prototype 和 React app 两套割裂语言。
- 图表必须可读、非空、保留语义标记, 并能解释缺失数据和不可用数据。

## 9. 数据与合规边界

- 所有 demo、seed、fixture、mock 数据必须明确标记。
- 价格展示必须保留币种、税费、入住人数、房型、取消政策和采集时间边界。
- 未授权 live collection、browser automation、cookie/session、credential、CAPTCHA handling、storage 和 automatic pricing 都在当前禁止范围内。
- 任何新的数据来源 feature 必须先经过 Planner 合规规格, 再由 Generator TDD 实现, 最后由 Evaluator 独立验收。

## 10. 成功指标

- 收益用户能在一个首页内识别今日最重要的市场信号。
- 用户能从任意提醒追溯到可解释证据和样本状态。
- 投资人演示时能看出房型、平台、节假日和趋势变化的完整性。
- 每个正式 feature 都有可复跑测试、截图或静态扫描证据。
- 项目级 PRD、开发计划、features、progress、backlog 和 project-status 在每个已验收 feature 后保持同步。

## 11. 质量门禁

- `python3 scripts/triad_doctor.py`
- `python3 scripts/test_triad_doctor.py`
- `python3 -m json.tool progress.json`
- `python3 -m json.tool features.json`
- `python3 -m json.tool backlog.json`
- `node tests/client_demo_prototype.test.js`
- 正式 app feature 需要 `/opt/homebrew/bin/npm run verify`
- UI feature 需要覆盖桌面和移动端截图矩阵, 至少包含 `2048x1352`, `1440x900`, `390x844` 中相关视口。
- 安全扫描不得命中未授权采集、凭证、cookie、session、验证码绕过、自动调价或用户可见敏感调试字段。

## 12. 项目文档维护协议

必须在以下事件发生后更新本 PRD 和项目开发计划:

- 一个 feature 被 Evaluator accepted。
- 一个 PR 合并到 `main`。
- 用户提出新的产品方向、投资人演示要求或合规边界调整。
- 数据来源、房型归一化、税费口径、自动化边界或视觉系统发生变化。
- 当前计划中的 next feature 被重新排序。
- 每周固定进行一次项目级文档巡检, 即使当周没有产品代码变更, 也要确认 PRD、开发计划、status、features、progress 和 backlog 没有漂移。

维护规则:

- Planner 负责更新 `docs/specs/PROJECT_PRD.md`, `docs/specs/PROJECT_DEVELOPMENT_PLAN.md`, `.auto-memory/project-status.md`, `progress.json`, `features.json`, `backlog.json`。
- Generator 开始新 feature 前必须读取本 PRD 和项目开发计划。
- Evaluator 验收时应检查项目级文档是否反映本次 feature 结果。
- 若项目级文档滞后, 下一个 feature 不应进入 Generator 实现。
- 周更 automation 已启用, 每周一上午执行项目级文档巡检；若发现漂移, 只允许修改 Planner 边界内的文档和状态文件。

## 13. 当前开放问题

- 生产数据来源的合规路径: 官方 API、合作数据源、channel manager、PMS 或用户上传的优先级仍需产品决策。
- 房型归一化策略: 标准大床、双床、亲子房、套房等映射需要真实客户样本验证。
- 税费和取消政策: 不同平台展示口径不同, 需要在真实数据接入前定义更严格的比较规则。
- 事件数据来源: 节假日可以内置, 会展和演唱会需要授权或公开可靠来源。
- 报告输出: 投资人、业主和收益经理可能需要不同粒度的导出和日报。
