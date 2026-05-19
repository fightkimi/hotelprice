# F-004 Formal Design Philosophy Roadmap Evaluator Report

日期：2026-05-19
角色：Evaluator-Codex
Feature：`F-004-formal-design-philosophy-roadmap`
当前状态：`planning`

## Superpowers 顺序

本会话没有暴露直接可调用的 `superpowers:*` skill handle，因此按项目 fallback 读取本地 Superpowers 插件缓存 `SKILL.md`，并按要求顺序执行：

1. `superpowers:brainstorming`
2. `superpowers:writing-plans`
3. `superpowers:executing-plans`
4. `superpowers:test-driven-development`
5. `superpowers:verification-before-completion`

## 范围分类

- 影响域：产品设计治理、正式应用路线图、后续 UI/报告/交互验收门槛。
- 数据边界：本 feature 本身是全局文档基线，不处理 property-bound、competitor-bound、channel-bound 或 date-bound 运行时数据。
- 数据类型：Markdown/JSON 状态、既有 prototype 截图和 demo/sample 数据引用；不涉及真实生产价格数据。
- 价格维度：未实现价格计算；路线图要求后续保留 room type、platform/source、date、currency、tax/fee basis、sample size、human review。
- 采集合规：未新增数据采集；明确禁止用 live OTA scraping 提升 demo 真实感。
- 定价自动化：未实现自动改价；明确 human-in-the-loop pricing。

## 已读材料

- F-004 spec：`docs/specs/2026-05-19-formal-product-design-philosophy-roadmap.md`
- F-004 plan：`docs/superpowers/plans/2026-05-19-formal-product-design-philosophy-roadmap.md`
- 状态与 handoff：`progress.json`、`features.json`、`backlog.json`、`.auto-memory/project-status.md`
- 项目规则：`AGENTS.md`、`CLAUDE.md`、`harness-rules.md`、`evaluator.md`
- 关联上下文：`docs/test-reports/2026-05-18-f-001-hotel-rate-watch-mvp-evaluator-precheck.md`
- 关联视觉证据：`docs/test-reports/2026-05-18-investor-demo-desktop-overview.png`

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

Command：`python3 -m json.tool progress.json`

Result：exit 0。JSON parsed successfully; current sprint is `F-004-formal-design-philosophy-roadmap`.

Command：`python3 -m json.tool features.json`

Result：exit 0。JSON parsed successfully; F-004 artifacts point to the spec and plan.

Command：`python3 -m json.tool backlog.json`

Result：exit 0。JSON parsed successfully; B-009/B-010/B-011 capture F-004 review and F-005 follow-up work.

Command：`node tests/client_demo_prototype.test.js`

Result：exit 0。14 checks passed, including local demo data boundaries, no unsafe pricing claims, room/platform/event demo coverage, chart helpers, and placeholder chart copy avoidance.

Command：`git status --short`

Result：exit 128。Output：`fatal: not a git repository (or any of the parent directories): .git`

Placeholder scans:

- Broad scan returned intentional terms: `Reports and weekly digest, later phase`, the scan instruction itself, and plan checkboxes.
- Strict unfinished-marker scan found no `TBD`, `TODO`, `FIXME`, `lorem ipsum`, `fill in`, `implement later`, or `coming soon` in the F-004 spec/plan. The only `[ ]` matches are expected plan checkboxes.

Security/compliance scan:

- F-004 spec/plan contain no apparent credentials, cookies, API tokens, CAPTCHA bypass, or live collection instructions.
- Forbidden terms in `tests/client_demo_prototype.test.js` are part of negative assertions, not product behavior.

## Requirement Coverage

- AC1 formal design philosophy exists：covered by product metaphor and eight experience principles.
- AC2 roadmap separates prototype validation, design-system foundation, domain core, vertical slice, and data-source strategy：covered by Phases 0-5.
- AC3 future front-end tasks include visual quality gates：partially covered; F-004 requires screenshot verification but does not yet define measurable gate details.
- AC4 design debt and no direct prototype reuse：covered by current project facts and non-goals.
- AC5 data boundaries：covered directionally for room type, platform/source, date, source, currency, tax/fee basis, sample size, and human review; capture time is present in principles but not in AC5 text.
- AC6 screenshot-based verification handoff：covered directionally in F-004 and B-010, but exact screenshot matrix belongs in F-005.

## Findings

### P1 - Visual acceptance gates are directionally present but not operational enough

F-004 says future front-end work must include visual quality gates and screenshot verification, but it does not define concrete thresholds for F-005/F-007, such as required desktop/mobile viewports, overlap checks, chart nonblank checks, color contrast, density limits, text fitting, empty/loading states, or which pages must be captured.

Impact：F-004 can guide product taste, but by itself it is not a production UI acceptance contract. A Generator could still produce a visually weak formal app while claiming compliance with broad principles.

Required before formal app coding：F-005 should turn these principles into explicit visual gates, design tokens, viewport matrix, screenshot artifacts, and pass/fail criteria.

### P1 - Phase 0 dependency is unresolved

F-004 proposes Phase 0 as finishing `F-003` prototype evaluation and collecting design debt findings, but `features.json` still shows F-003 as `verifying`, and the only F-003 report artifact found is an evaluator checklist, not a final acceptance report.

Impact：F-004's design debt baseline is plausible and supported by existing screenshots, but the formal roadmap should not treat F-003 design debt as fully closed until F-003 evaluation is finalized.

Required before F-005 implementation：finish or explicitly supersede F-003 evaluation findings.

### P2 - F-001 evaluator risks are not carried into the roadmap

F-004 Phase 3 says the domain core can reuse or supersede the existing F-001 plan. The prior F-001 precheck found two P1 issues: missing unavailable-source modeling and missing `hotel_id + rate_key` isolation for competitor movement. F-004 does not explicitly carry these forward.

Impact：The roadmap preserves high-level pricing boundaries, but it may allow known data-boundary defects to reappear when F-006 revisits the domain core.

Recommended：Add F-005/F-006 planning notes that F-001 precheck P1 findings must be resolved before domain-core implementation.

### P2 - Plan task checkboxes remain unchecked after artifacts exist

The F-004 plan lists created/updated artifacts and verification tasks, but every checkbox remains unchecked while `features.json`, `progress.json`, `backlog.json`, project status, spec, and plan already contain the expected changes.

Impact：Traceability is weaker. Future reviewers cannot tell whether Planner intentionally left tasks open for Evaluator or simply forgot to update execution state.

Recommended：Planner should either mark completed planning steps or document that this plan is a baseline checklist, not an execution log.

### P2 - PR readiness remains blocked by missing Git context

`git status --short` fails because the workspace is not a Git repository, and `triad_doctor.py` repeats the branch warning.

Impact：F-004 can be reviewed locally, but the project still cannot satisfy the PR-only workflow until repository/branch context exists.

### P3 - Placeholder scan expectation is imprecise

The F-004 plan asks for a placeholder/deferred-work scan with expected no matches, but broad scans naturally match the plan's own checkbox syntax, the scan instruction text, and intentional roadmap language such as "later phase."

Impact：This is not a product/design blocker, but the verification instruction should define an exact scan pattern or allowlist to avoid false positives.

## Verdict

Conditional acceptance as a planning/design-philosophy baseline.

F-004 is specific enough to stop the team from directly productizing the rough prototype and to guide the next Planner pass for `F-005-product-app-foundation`. It is not specific enough to serve as the final production UI acceptance contract by itself. Formal app coding should remain blocked until F-005 converts this philosophy into concrete design tokens, layout primitives, chart primitives, screenshot/viewpoint verification gates, and visual pass/fail criteria. F-003 final evaluation and the F-001 precheck P1 data-boundary issues should be carried into the next planning slice.
