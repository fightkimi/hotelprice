# F-005 Premium Product Experience System Evaluator Report

日期：2026-05-19
角色：Evaluator-Codex
Feature：`F-005-premium-product-experience-system`
当前状态：`planning`

## Superpowers 顺序

本会话没有暴露直接可调用的 `superpowers:*` skill handle，因此按项目 fallback 读取本地 Superpowers 插件缓存 `SKILL.md`，并按要求顺序执行：

1. `superpowers:brainstorming`
2. `superpowers:writing-plans`
3. `superpowers:executing-plans`
4. `superpowers:test-driven-development`
5. `superpowers:verification-before-completion`

## 范围分类

- 影响域：正式产品体验系统、设计治理、后续 UI app foundation 计划、报告/可视化验收门槛。
- 数据边界：本 feature 是全局设计/规划基线，不处理 property-bound、competitor-bound、channel-bound 或 stay-date-bound 运行时数据。
- 数据类型：Markdown/JSON 状态、既有 prototype 截图/测试引用；不涉及真实生产价格数据。
- 价格维度：未实现价格计算；要求后续可见 source、capture time、room type、platform、tax/fee basis、sample size、human review 等证据标记。
- 采集合规：未新增数据采集；明确禁止依赖 live OTA scraping。
- 定价自动化：未实现自动改价；copy gate 要求使用“建议关注”和“需人工复核”。

## 已读材料

- F-005 spec：`docs/specs/2026-05-19-premium-product-experience-system.md`
- F-005 plan：`docs/superpowers/plans/2026-05-19-premium-product-experience-system.md`
- F-004 report：`docs/test-reports/2026-05-19-f-004-formal-design-philosophy-roadmap-evaluator.md`
- 状态文件：`progress.json`、`features.json`、`backlog.json`、`.auto-memory/project-status.md`
- 项目规则：`AGENTS.md`、`CLAUDE.md`、`harness-rules.md`、`evaluator.md`

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

Result：exit 0。输出：`OK triad_doctor smoke test passed`

Command：`python3 -m json.tool progress.json`

Result：exit 0。JSON parsed successfully; current sprint is `F-005-premium-product-experience-system`.

Command：`python3 -m json.tool features.json`

Result：exit 0。JSON parsed successfully; F-004 is `done`, F-005 is `planning`, and F-005 artifacts point to spec/plan.

Command：`python3 -m json.tool backlog.json`

Result：exit 0。JSON parsed successfully; B-012/B-013/B-014 capture F-005 review, repository readiness, and F-001 risk carryover.

Command：`node tests/client_demo_prototype.test.js`

Result：exit 0。14 checks passed for the existing static prototype. This does not verify F-005 implementation because F-005 is a planning artifact.

Command：`git status --short`

Result：exit 128。Output：`fatal: not a git repository (or any of the parent directories): .git`

Strict unfinished-marker scan:

- `rg -n -i "TBD|TODO|FIXME|lorem ipsum|fill in|implement later|coming soon" ...`
- Result：exit 1, no matches.

Security/compliance scan:

- No apparent credentials, cookies, API tokens, CAPTCHA bypass, debug traces, or scraping instructions in the F-005 spec/plan.
- Matches for `token` are design-token wording, not secrets.

## Direct Specificity Check

### Design Tokens

Partially sufficient.

F-005 defines semantic color token names, typography scale, spacing scale, radius rules, grid, chart height, and stable controls. This is enough for a Planner-level experience baseline.

Not yet sufficient for direct UI implementation because color tokens do not include concrete values such as hex/HSL/CSS variables, foreground/background pairings, contrast requirements, hover/focus/disabled states, elevation/surface levels, or chart-series mappings. A Generator would still need to invent critical visual choices.

### Layout Primitives

Partially sufficient.

F-005 names the right primitives: `AppShell`, `ContextRibbon`, `SignalPanel`, `EvidenceDrawer`, `SplitWorkspace`, and `DataDensityToggle`.

Not yet sufficient for direct coding because each primitive has only a one-line role. Missing items include props/data contracts, responsive behavior, allowed children, empty/loading/error states, keyboard/focus behavior, and how persistent context state flows across screens.

### Chart Primitives

Partially sufficient.

F-005 names the right chart language: `TrendChart`, `CalendarHeatmap`, `PlatformGapBars`, `Sparkline`, `EventTimeline`, and `ConfidenceBand`.

Not yet sufficient for direct coding because chart primitives lack input schemas, axis rules, tooltip/evidence behavior, legend rules, missing-data rendering, sample-size handling, color token mapping, nonblank thresholds, and mobile label strategies.

### Screenshot Matrix

Mostly sufficient as a baseline.

F-005 specifies four viewports and five required screens: overview/morning brief, price calendar with date detail, market comparison with platform bars, alert review with evidence drawer, and setup/data scope.

Remaining gap：the matrix does not name artifact paths, required UI states per screen, drawer open/closed variants, empty/loading/error states, or whether each screen must be captured across every viewport. For serious UI gating, this should become a Cartesian matrix or explicitly state which combinations are mandatory.

### Pass/Fail Gates

Directionally strong but not fully operational.

F-005 covers no overlap, nonblank charts, readable labels, above-fold insight, mobile wrapping, no nested card stacks, no decorative blobs, no automatic-pricing copy, and visible provenance.

Remaining gap：several gates are subjective or lack measurable thresholds. "Readable", "visually framed", "above the fold", "tables do not dominate", and "no nested card stacks" need either examples, DOM/pixel checks, or manual reviewer criteria. The most important automated checks are currently under "To Add Later", so they are not yet a hard implementation gate.

## Findings

### P1 - Design tokens are not concrete enough for direct implementation

The spec lists semantic color names but no actual values, CSS variable names, contrast pairs, state colors, chart-series assignments, or surface/elevation tokens.

Impact：Two Generators could implement visually different products while both claiming to follow `ink`, `fog`, `teal`, and `paper`. This preserves philosophy but not a reproducible visual system.

Required before app foundation coding：define a real token table with CSS variable names and values, including text/surface/accent/chart/status/focus/disabled tokens and minimum contrast expectations.

### P1 - Primitive definitions need implementation contracts

Layout, chart, and evidence primitives are named, but they lack API/data contracts and state behavior.

Impact：Generator cannot write strong tests first because the expected inputs and outputs are underspecified. This weakens the TDD path for the formal app shell.

Required before app foundation coding：for each primitive, define required props, optional props, responsive behavior, empty/loading/error states, accessibility/focus expectations, and which evidence fields must render.

### P1 - F-005 plan is not a Generator-ready coding plan despite the handoff wording

The spec says Generator should implement the app foundation from `docs/superpowers/plans/2026-05-19-premium-product-experience-system.md`, but that plan explicitly says it does not implement the formal app, install dependencies, or modify source files. It is a Planner transition plan, not a bite-sized TDD coding plan.

Impact：Starting Generator from this plan would blur Planner/Generator boundaries and produce unclear implementation work.

Required before coding：create a separate Generator-ready app foundation plan that names framework/files/tests, includes fail-first test examples, and turns the F-005 baseline into implementable tasks.

### P2 - Screenshot gates are explicit but not complete enough for production QA

The viewport and screen lists are present, but they do not specify artifact names, required state variants, or whether each screen must be captured on all four viewports.

Impact：Evaluator could receive incomplete screenshot evidence and still have ambiguity about whether the matrix was satisfied.

Recommended：define screenshot artifact paths and required combinations, for example `overview--1440x900.png`, `alert-review-drawer-open--390x844.png`, and required empty/error/loading captures.

### P2 - Automated gates are deferred

The plan includes screenshot existence, chart nonblank, forbidden terms, network-code checks, token lint, and accessibility checks under "Automated/Scripted Checks To Add Later."

Impact：F-005 resolves F-004's directional weakness conceptually, but the most enforceable part is still future work.

Recommended：the next coding plan should make these checks first-class tasks, not optional later enhancements.

### P2 - Repository readiness still blocks PR-based development

`git status --short` fails because this workspace is not a Git repository. F-005 correctly calls this out, and backlog B-013 exists.

Impact：Formal app development should not claim PR readiness until this is fixed.

### P3 - Plan checkboxes remain unchecked after artifacts exist

The F-005 plan has unchecked steps for artifacts that already exist and status updates that are already reflected in JSON files.

Impact：Traceability remains a little muddy. This does not block design-baseline acceptance, but it makes review history harder to follow.

## Verdict

F-005 is a clear improvement over F-004 and is acceptable as a premium product experience baseline.

It is not yet sufficient as a direct Generator coding contract for formal app foundation. The specific pieces the user asked about are only partially ready:

- design tokens：not concrete enough;
- layout primitives：named but missing contracts;
- chart primitives：named but missing schemas/states;
- screenshot matrix：mostly sufficient baseline, needs required combinations and artifact naming;
- pass/fail gates：directionally strong, but several are subjective and automated checks are deferred.

Before formal UI coding starts, Planner should produce a Generator-ready app foundation plan that turns F-005 into exact files, token tables, primitive contracts, fail-first tests, screenshot artifacts, and hard pass/fail checks.
