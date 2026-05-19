# F-006 Production UI Contract Evaluator Report

日期：2026-05-19
角色：Evaluator-Codex
Feature：`F-006-production-ui-contract`
当前状态：`planning`

## Superpowers 顺序

本会话没有暴露直接可调用的 `superpowers:*` skill handle，因此按项目 fallback 读取本地 Superpowers 插件缓存 `SKILL.md`，并按要求顺序执行：

1. `superpowers:brainstorming`
2. `superpowers:writing-plans`
3. `superpowers:executing-plans`
4. `superpowers:test-driven-development`
5. `superpowers:verification-before-completion`

## 范围分类

- 影响域：正式产品 UI 合同、设计 token、layout/chart primitive 合同、截图矩阵、硬 pass/fail gates、F-007 app foundation 入口条件。
- 数据边界：本 feature 是全局 UI 合同，不处理运行时 property-bound、competitor-bound、channel-bound 或 stay-date-bound 数据。
- 数据类型：Markdown/JSON 状态、既有 prototype 测试引用；不涉及真实生产价格数据。
- 价格维度：未实现价格计算；合同要求后续价格洞察必须包含 source、capture time、room type/platform context、sample size、human-review marker。
- 合规边界：未新增 live OTA 数据采集；明确禁止 live OTA data、automatic pricing、prototype CSS 直接复制。
- 定价自动化：未实现自动改价；硬门禁禁止自动调价/自动改价等 customer-facing copy。

## 已读材料

- F-006 spec：`docs/specs/2026-05-19-production-ui-contract.md`
- F-006 plan：`docs/superpowers/plans/2026-05-19-production-ui-contract.md`
- F-005 report：`docs/test-reports/2026-05-19-f-005-premium-product-experience-system-evaluator.md`
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

Result：exit 0。Output：`OK triad_doctor smoke test passed`

Command：`python3 -m json.tool progress.json`

Result：exit 0。JSON parsed successfully; current sprint is `F-006-production-ui-contract`.

Command：`python3 -m json.tool features.json`

Result：exit 0。JSON parsed successfully; F-005 is `done`, F-006 is `planning`, and F-006 artifacts point to spec/plan.

Command：`python3 -m json.tool backlog.json`

Result：exit 0。JSON parsed successfully; B-015/B-016/B-017 capture F-006 review and F-007 follow-up.

Command：`node tests/client_demo_prototype.test.js`

Result：exit 0。14 checks passed for the existing static prototype.

Command：`git status --short`

Result：exit 128。Output：`fatal: not a git repository (or any of the parent directories): .git`

Strict unfinished-marker scan:

- `rg -n -i "TBD|TODO|FIXME|lorem ipsum|fill in|implement later|coming soon" ...`
- Result：exit 1, no matches.

Security/compliance scan:

- No apparent credentials, API keys, CAPTCHA bypass, debug traces, or live scraping instructions in F-006 spec/plan.
- Matches for `token` are design-token references or forbidden-copy checks.
- `cookie` appears only in the forbidden customer-facing copy gate.

## Requirement Coverage

- AC1 F-005 accepted baseline with report artifact：covered in `features.json`.
- AC2 concrete token values and state tokens：covered with color values, state colors, typography, and layout tokens.
- AC3 primitive contracts with props/states/responsive/accessibility：covered for `AppShell`, `ContextRibbon`, `SignalPanel`, `EvidenceDrawer`.
- AC4 chart schemas and missing-data behavior：covered for `TrendChart`, `CalendarHeatmap`, `PlatformGapBars`, `EventTimeline`.
- AC5 exact screenshot artifact paths and states/viewports：covered with 12 required files under `docs/test-reports/f-007-app-foundation/`.
- AC6 hard pass/fail gates：covered with token enforcement, labeled controls, nonblank charts, missing-data behavior, screenshot completeness, overflow threshold, forbidden copy, evidence markers, and no direct prototype CSS copy.
- AC7 repository readiness block：covered in spec and still evidenced by failing `git status`.
- AC8 F-007 next coding slice：covered with minimum scope and explicit Generator/Planner handoff.

## Findings

### P1 - Repository readiness still blocks formal coding

F-006 correctly marks Git repository readiness as a blocker, and fresh `git status --short` still fails because the workspace is not a Git repository.

Impact：F-006 can be accepted as a contract, but F-007 Generator implementation should not start under the PR-only workflow until repository readiness is resolved.

### P2 - Forbidden customer-facing term `token` may create false positives

The hard gate forbids customer-facing text containing `token`, `cookie`, or `验证码`. This is good for user-visible product copy, but `token` is also a normal technical/design-system term and appears heavily in source docs and likely tests.

Impact：If implemented as a broad repo-wide grep, it will produce false positives. If scoped to rendered/customer-facing files only, it is workable.

Recommendation：F-007 verification script should scan built UI strings or customer-facing source paths only, with allowlists for test/docs/design-token files.

### P2 - Contrast rules are useful but not fully measurable

Token table includes contrast guidance such as `--color-ink` text passes 12px+ and focus ring 2px visible, but does not specify WCAG AA/AAA ratios or exact foreground/background pairs for every semantic color.

Impact：Manual review can enforce intent, but automated contrast verification may be ambiguous.

Recommendation：F-007 plan should add either explicit WCAG thresholds or a small contrast-pair matrix for primary text, muted text, focus, accent buttons, and status chips.

### P2 - Primitive contracts are adequate for planning, but F-007 still needs typed interfaces

F-006 defines props, states, behavior, and chart input JSON examples. That is enough for a UI contract. It does not define TypeScript interfaces or exact component file boundaries.

Impact：Not a blocker for F-006, because F-006 explicitly says Planner should create F-007 with framework choice, exact files, failing tests, implementation steps, screenshot commands, and verification scripts. It would be a blocker only if Generator started coding directly from F-006.

### P3 - Plan checkboxes remain unchecked after artifacts exist

The F-006 plan still has unchecked boxes for state updates and artifacts that are already present.

Impact：Traceability is imperfect, but this does not undermine the contract content.

## Verdict

Accepted as a production UI contract and source of truth for F-007 planning.

F-006 materially resolves the F-005 gaps: token values are concrete, primitive contracts include props/states/responsive/accessibility expectations, chart schemas include missing-data behavior, screenshot artifacts are named, and hard pass/fail gates are explicit enough for Generator and Evaluator use.

Do not start F-007 coding yet unless repository readiness is fixed. The next Planner step should produce `F-007-formal-app-foundation` as a true Generator-ready plan with framework choice, exact files, fail-first tests, typed component/data interfaces, screenshot commands, and verification scripts derived from this F-006 contract.
