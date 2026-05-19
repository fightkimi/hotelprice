# F-001 Hotel Rate Watch MVP Evaluator Precheck

日期：2026-05-18
角色：Evaluator-Codex
Feature：`F-001-hotel-rate-watch-mvp`
当前状态：`planning`

## Superpowers 顺序

本会话没有暴露直接可调用的 `superpowers:*` skill handle，因此按项目 fallback 读取本地 Superpowers 插件缓存的 `SKILL.md`，并按要求顺序执行：

1. `superpowers:brainstorming`
2. `superpowers:writing-plans`
3. `superpowers:executing-plans`
4. `superpowers:test-driven-development`
5. `superpowers:verification-before-completion`

## 范围分类

- 影响域：酒店/物业档案、竞品集、渠道/来源、价格快照、标准化比较、提醒、报告。
- 数据边界：owner hotel 为 property-bound；竞品为 competitor-bound；来源为 channel-bound；每条价格为 stay-date-bound 和 capture-time-bound。
- 数据类型：当前计划只允许 fixture/manual/user-provided 数据；真实生产数据和自动 OTA 采集不在本 slice。
- 价格边界：spec/plan 要求保留 channel、stay date、checkout date、captured_at、currency、occupancy、room_type_label、meal_plan、cancellation_policy、tax_fee_basis、source_kind。
- 合规边界：禁止 live OTA scraping、登录自动化、CAPTCHA 绕过、私有 API 逆向、高频采集和网络收集代码。
- 定价边界：只生成提醒候选，必须标记人工复核，不自动改价，不给具体新价格。

## 已读材料

- 当前 spec：`docs/specs/2026-05-18-hotel-rate-watch-mvp.md`
- 当前 plan：`docs/superpowers/plans/2026-05-18-hotel-rate-watch-mvp.md`
- Source PRD：`/Users/kimi/Desktop/hotel_competitor_price_monitor_prd_v0.1.md`
- 状态文件：`progress.json`、`features.json`、`backlog.json`、`.auto-memory/project-status.md`
- 角色/规则文件：`AGENTS.md`、`CLAUDE.md`、`harness-rules.md`、`evaluator.md`、`generator.md`

未发现 F-001 的 Generator 实现说明或完成 handoff；`features.json` 显示该 feature 仍为 `planning`，`backlog.json` 中 Generator 任务仍为 `new`。

## Fresh Verification Evidence

Command：`python3 scripts/triad_doctor.py`

Result：exit 0。关键输出：

- `OK progress.features matches features.json`
- `OK progress.total_features matches features.json`
- `OK progress.completed_features matches done feature count`
- `OK required Superpowers skills are available in plugin cache`
- `OK Superpowers required skills are listed in order`
- `OK PR-only override is present in core rule files`
- `OK planner.md boundary is present`
- `OK generator.md boundary is present`
- `OK evaluator.md boundary is present`
- `WARN not a git repository yet or branch unavailable`
- `Triad doctor: healthy enough to proceed`

Command：`python3 scripts/test_triad_doctor.py`

Result：exit 0。输出：

- `OK triad_doctor smoke test passed`

Command：`PYTHONPATH=src python3 -m unittest discover -s tests -v`

Result：exit 1。关键输出：

- `ImportError: Start directory is not importable: 'tests'`

Command：`find src tests -maxdepth 3 -type f`

Result：exit 1。关键输出：

- `find: src: No such file or directory`
- `find: tests: No such file or directory`

Interpretation：F-001 还没有产品实现或测试目录；这与 `planning` 状态一致，但阻止任何功能验收通过结论。

## Findings

### P0 - 当前没有可验收的 Generator 实现

`features.json` 中 F-001 是 `planning`，`backlog.json` 中 Generator 任务是 `new`，并且 `src/`、`tests/` 均不存在。没有实现文件、测试文件、red/green TDD 输出、构建输出或 Generator 完成说明。

Impact：Evaluator 不能对 F-001 作“实现通过”或“功能完成”结论。当前只能做 spec/plan 预审。

### P1 - `source data marked unavailable` 验收标准缺少数据模型支持

Spec 的 Acceptance Criteria 5 要求当 `source data is marked unavailable` 时不触发 alert，但 `Rate Snapshot` 合同没有 `available`、`availability_status` 或等价字段，plan 的 Task 1/2/3 测试也没有覆盖不可用来源。

Impact：Generator 按当前 plan 实现后，无法完整满足 AC5；最低可订价也无法区分“无价格”和“不可订/不可用”。

Required before coding：在 `RateSnapshot` 增加明确可用性字段，或修改 AC5 使其与第一版数据合同一致，并补充 suppress-alert 测试。

### P1 - 单竞品涨跌比较需要显式按 `hotel_id + rate_key` 隔离

Spec 要求“same competitor and stay date”的涨跌提醒。Plan 的 `RateSnapshot.rate_key()` 不包含 `hotel_id`，alert plan 也没有明确要求 competitor movement 按 `hotel_id` 分组。现有测试清单没有覆盖“不同酒店但 rate key 相同，不得互相比较”的场景。

Impact：如果实现只按 rate key 找 previous/latest，可能跨竞品串数据，破坏 competitor-bound 边界。

Required before coding：在 `tests/test_alerts.py` 计划中加入不同 `hotel_id`、相同 rate key 的隔离测试；实现说明中明确 individual movement 的 grouping key。

### P2 - 最新/上一条快照、重复快照和 stale data 规则不够明确

Spec 多处依赖 previous comparable capture，但 plan 没有定义：

- 如何按 `captured_at` 选 latest 和 previous；
- 同一酒店/日期/rate key 有多条同时间快照时如何处理；
- 旧数据或 capture gap 是否应标记 stale；
- 重复导入同一批 fixture 是否去重。

Impact：价格变化计算可能不可重复，且重复 capture 或 stale data 会造成误报。

Recommended before coding：增加 ordering、duplicate、same timestamp、no previous capture 的测试与实现约束。

### P2 - 合规静态检查需要强于 CLI 输出词汇检查

Plan 要求 CLI 输出不包含 credential/cookie/browser/CAPTCHA/scraper wording，并要求 no network calls/no browser automation imports。仅检查输出文本不足以证明实现没有引入 `requests`、`urllib.request`、`http.client`、`socket`、`selenium`、`playwright` 等网络或浏览器依赖。

Impact：合规边界可能被实现绕过而测试仍通过。

Recommended before coding：增加静态源码扫描测试，至少检查 `src/hotel_pricing_capture/` 不出现网络、浏览器、自动化、credential/cookie/token 相关 import 或调用。

### P2 - PRD MVP 与 F-001 slice 有意识收敛，需要产品确认

Source PRD 的 MVP/优先级包含酒店建档、周边发现、单平台采集、未来 30 天存储、提醒中心和基础看板。F-001 spec 把第一步收敛为 fixture/manual backend/domain core，排除了 live collection、地图发现、UI 看板、持久化和多平台。

Impact：该收敛有利于合规和 TDD，但不能被表述为完整 PRD MVP。验收口径必须是 F-001 spec，不是完整 PRD。

Recommended：在 Generator 开始前由 Planner/Product Owner 明确认可这个 slice 只是“MVP core”，后续 feature 覆盖真实数据源发现、UI/提醒中心、持久化和合规数据接入。

### P3 - TDD 计划较完整，但还没有 red/green 证据

Plan 已为 models、fixture loader、alerts、reporting/CLI 列出 fail-first tests 和 pass verification commands。但当前没有实现阶段证据。

Impact：Generator 必须在 handoff 中记录每个任务的 failing test output 和 passing output，否则 Evaluator 不能验收 AC8。

## 覆盖情况

- 竞品涨跌 10%：spec/plan 覆盖。
- 市场均价 8% 且至少 3 个核心竞品：spec/plan 覆盖。
- owner 低价/高价 20%：spec/plan 覆盖。
- 不兼容 rate key 不报警：部分覆盖；需要加强 hotel_id 隔离、availability、stale/duplicate。
- 来源/fixture 标记：覆盖。
- currency、tax/fee、occupancy、room type、meal plan、cancellation policy：覆盖为比较 key。
- 自动调价禁止与人工复核：覆盖。
- live OTA scraping 禁止：覆盖，但需要更强静态验证。
- 构建/测试：尚无产品测试可运行。
- PR readiness：仍有 Git 上下文警告，当前目录不是可确认的 feature branch/PR 工作树。

## Verdict

F-001 当前不能通过功能验收，因为还没有 Generator 实现、产品测试或 TDD red/green 证据。

作为 pre-implementation review，spec/plan 的总体方向合理，合规边界清楚，且适合先做 fixture/manual core。但在 Generator 开始前，应至少修复 P1 两项：为 unavailable source 建模，并明确 competitor movement 的 `hotel_id + rate_key` 隔离测试。否则实现即使按 plan 完成，也可能无法满足当前验收标准和数据边界要求。
