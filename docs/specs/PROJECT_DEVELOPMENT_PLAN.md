# 酒店竞品价格雷达项目开发计划

版本: 2026-05-20
状态: 项目级 roadmap 真源, 随每个已验收 feature 更新
当前主线: `main` includes F-013 and F-014 through PR #10, merge commit `a91102f`; F-015 已通过 Evaluator 验收, 待 B-056 PR 收口
当前规划切片: F-016 market comparison drilldown

## 1. 开发原则

- 以正式 React app 为生产基线, H5 prototype 只作为演示参考和历史回归对象。
- 每个产品能力必须保持 hotel/property、competitor、channel/source、date、currency、tax/fee、room type、occupancy 和 cancellation policy 边界。
- 不实现未授权实时采集、凭证存储、cookie/session、验证码处理或自动调价。
- 视觉升级必须进入 token、layout primitive、chart primitive 和截图门禁, 不能只堆 CSS 效果。
- PR 仍是交付闸门, 但规划要围绕连续可用的产品能力, 避免把 PR 当成产品目标。

## 2. 当前完成状态

### 已进入正式 app 基线

- F-007 formal app foundation: 正式 React app、五个屏幕、基础 UI primitives 和截图门禁。
- F-008 domain core rate boundaries: 价格可比边界、availability/stale、snapshot ordering 和 alert math。
- F-009 domain-driven UI data flow: 领域数据到 UI dataset 的纯转换。
- F-010 owner-position evidence enrichment: 本店与竞品证据角色、人工复核语义。
- F-011 data scope and capture entry preview: 数据范围、采集入口预览、production connection disabled。
- F-012 production Revenue Observatory visual upgrade: 全局高级视觉系统、宽屏观测舱、五屏一致性和图表框架。
- F-013 project PRD and development plan maintenance: 项目级 PRD、项目级开发计划、F-013 验收和每周文档维护机制。
- F-014 interactive price calendar and date detail workflow: 日期点击详情、平台价差、证据来源、采集时间、样本数、可比口径、missing sample state 和人工复核标记。

### 已验收、待 PR 或文档基线

- F-015 alert review workflow depth: 可选择提醒、选中详情、本地复核状态、本地备注、备注模板、owner/competitor 证据角色和边界可见性。

### 历史与参考基线

- F-001 manual competitor lowest-rate monitoring MVP: 早期需求规划, 其数据边界风险已被 F-008 继承。
- F-002 client demo HTML prototype: 静态 H5 demo, 仍有 prototype regression。
- F-003 investor demo prototype enhancement: 房型、平台和事件趋势演示参考。
- F-004 到 F-006: 正式设计哲学、premium system 和 production UI contract, 已被 F-007 到 F-012 吸收。

## 3. 推荐开发路线

### Phase 1: 正式产品骨架和核心语义

状态: 基本完成。

完成内容:

- 正式 app foundation。
- 价格领域核心。
- UI 数据流。
- 证据角色。
- 数据范围和采集入口预览。
- Revenue Observatory 视觉系统。

剩余动作:

- 保持项目级 PRD 和开发计划同步。
- 不再把 H5 prototype 当成正式 UI contract。

### Phase 2: 业务工作流深度

状态: 进行中。F-013 和 F-014 已通过 PR #10 进入 `main`, F-015 已验收并等待 B-056 PR 收口。

目标: 让用户不仅看到指标, 还能沿日期、房型、平台和事件追溯到可解释详情。

推荐 feature queue:

1. F-013 project PRD and development plan maintenance
   - 建立项目级 PRD、项目级开发计划和文档维护门禁。
   - 不改产品代码。
2. F-014 interactive price calendar and date detail workflow
   - 支持点击日期查看详情。
   - 日期详情展示本店价格、核心竞品均价、平台价差、事件上下文、可用性、证据来源、采集时间、样本数和可比口径。
   - 保持 fixture/manual seed, 不接真实采集。
   - 已通过 B-051 Evaluator 验收, 并通过 PR #10 落地到 `main`。
3. F-015 alert review workflow depth
   - 增强提醒复核列表、证据抽屉、人工状态和复核备注的前端工作流。
   - 只做本地状态或 fixture 状态, 不引入持久化。
   - 已通过 B-055 Evaluator 验收, 待 B-056 PR 收口。
4. F-016 market comparison drilldown
   - 平台价差从汇总条扩展到竞品、房型和日期组合。
   - 增加缺失数据、过期样本和不可用样本的解释。

### Phase 3: 数据输入和合规来源

状态: 待 Planner 进一步拆分。

目标: 在不越过合规边界的情况下, 让产品能承接真实客户数据。

候选 feature:

- Manual import preview: 用户上传或粘贴 CSV/Excel 的本地预览、字段映射和校验, 不直接写入生产。
- Source strategy specification: 梳理官方 API、合作数据源、channel manager、PMS 和用户手动导出的可行性。
- Capture job model specification: 只设计任务状态、source policy、rate limit 和审计字段, 不实现未授权抓取。
- Data quality report: 样本覆盖、缺失、过期、平台偏差和可比性评分。

### Phase 4: 报告、导出和客户演示

状态: 后续。

目标: 支持业主、投资人和收益团队的不同信息粒度。

候选 feature:

- Daily digest: 今日市场变化、异常提醒、事件影响和待复核事项。
- Investor report view: 更偏叙事化的趋势、覆盖率和增长空间展示。
- Export preview: CSV/PDF 前端预览, 需先定义数据口径和安全边界。

### Phase 5: 生产化基础

状态: 后续。

目标: 从 demo/fixture app 走向可部署产品。

候选 feature:

- Auth and roles: 收益经理、管理员、只读业主视图。
- Persistence boundary: 设计 property、competitor、channel、snapshot、event、review 状态模型。
- Deployment readiness: 环境变量、安全扫描、日志边界和部署文档。
- Source compliance gate: 对每个生产来源建立条款、授权、rate limit 和审计证据。

## 4. F-016 建议规格方向

F-016 应作为下一个产品开发切片, 因为 F-014 已经补强日期详情, F-015 已补强提醒复核, 下一步应把 Market Comparison 从平台汇总扩展到竞品、房型和日期组合的可解释 drilldown。

建议目标:

- 在 Market Comparison screen 支持按竞品、房型、平台和日期组合查看价差详情。
- Drilldown 详情展示:
  - 本酒店价格、核心竞品价格区间和各竞品样本状态。
  - 平台、房型、入住日期、入住人数、餐食、税费和取消政策。
  - 可用、缺失、过期、不可用和来源错误样本的客户安全解释。
  - 与 F-014/F-015 一致的证据来源、采集时间和 human-review-only 语义。
- 移动端保持无横向溢出, 详情区不得遮挡关键证据。

F-016 非目标:

- 不新增真实采集。
- 不新增后端、数据库或持久化。
- 不改变 F-008 alert math。
- 不引入自动调价。

## 5. 每个 Feature 的标准交付

Planner 必须交付:

- `docs/specs/YYYY-MM-DD-<feature>.md`
- `docs/superpowers/plans/YYYY-MM-DD-<feature>.md`
- 更新 `features.json`, `progress.json`, `backlog.json`, `.auto-memory/project-status.md`
- 若 feature 改变项目方向, 同步更新 `docs/specs/PROJECT_PRD.md` 和本文件。

Generator 必须交付:

- 严格 TDD 的 RED/GREEN 证据。
- 与 feature 相关的产品代码和测试。
- 不改 final acceptance report。
- 不越过数据采集、凭证、自动调价和用户可见调试字段边界。

Evaluator 必须交付:

- 独立验收报告。
- 目标测试、完整 verify、JSON 校验、Triad 校验和必要截图证据。
- PR hygiene 和安全扫描。
- 检查项目级 PRD 与开发计划是否需要同步。

## 6. 文档维护节奏

必须更新项目级文档的时机:

- 每个 feature accepted 后。
- 每个 PR merged 后。
- 下一个 feature queue 改变时。
- 用户提出新的演示目标、投资人叙事、真实数据来源或合规限制时。
- 发现当前 PRD 与实现事实不一致时。

固定节奏:

- 每个 Planner session 开始时读取项目级 PRD 和开发计划。
- 每周一上午由项目级文档周更 automation 执行一次 PRD、开发计划、status、features、progress、backlog 和近期 test reports 巡检。
- 每 3 个 feature 额外做一次人工 Planner 巡检, 用于调整路线和拆分后续 feature queue。
- Evaluator 在验收报告里增加一项: project docs freshness。
- 若项目级文档滞后, backlog 新增文档修复项, 并在下一次产品实现前处理。

## 7. 当前风险与处置

- 数据来源合规风险: Phase 3 前必须先完成 source strategy specification。
- 价格可比性风险: F-015 到 F-016 必须继续保留房型、税费、取消政策和入住人数边界。
- 视觉一致性风险: 新 UI 必须复用 F-012 Revenue Observatory primitives。
- PR 堆叠风险: 开发可以连续推进, 但每个 feature branch 应尽量从最新 `main` 创建, 合并后及时同步本地。
- 文档漂移风险: F-013 建立项目级文档真源、维护门禁和每周固定周更 automation。

## 8. 当前下一步

1. 执行 B-056, 准备一个 bounded F-015 PR 到 `main`。
2. PR 合并后同步 `main`、project status、PRD、开发计划和 backlog。
3. Planner 准备 F-016 market comparison drilldown 规格和 Generator-ready plan。
