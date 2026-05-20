# F-013 Project PRD And Development Plan Maintenance

日期: 2026-05-20
角色: Planner
状态: Planner ready for Evaluator review

## Problem Statement

项目已经完成 F-007 到 F-012 的正式 app、领域核心、数据流、证据、数据范围和高级视觉系统, 但项目级文档仍分散在多个 feature spec、plan、test report 和 memory 文件中。用户明确要求维护一份完整项目 PRD 和开发 plan, 并定期更新, 以确保项目级文档始终反映最新事实。

## Current Project Facts

- `main` 已包含 F-012, PR #8 已合并。
- 当前正式产品基线是 Revenue Observatory 视觉系统下的 React app。
- F-007 到 F-012 构成正式 app 基线。
- F-001 到 F-006 是需求、prototype 和 UI contract 历史基线。
- `.auto-memory/project-status.md` 在本切片开始前仍保留 F-012 分支和依赖清理描述, 需要更新。
- Planner 不修改产品代码、测试代码、构建配置或运行时脚本。

## Scope

本切片新增和维护项目级文档真源:

- `docs/specs/PROJECT_PRD.md`
- `docs/specs/PROJECT_DEVELOPMENT_PLAN.md`
- `docs/specs/2026-05-20-project-prd-and-development-plan-maintenance.md`
- `docs/superpowers/plans/2026-05-20-project-prd-and-development-plan-maintenance.md`

本切片同步:

- `.auto-memory/project-status.md`
- `progress.json`
- `features.json`
- `backlog.json`

## Non-Goals

- 不修改正式 React app 产品代码。
- 不修改测试代码。
- 不修改 package、build、CI、部署或迁移配置。
- 不新增真实数据采集、后端、数据库、文件上传或自动调价能力。
- 不把本 Planner 文档切片作为产品功能最终验收。

## Product Documentation Requirements

### Project PRD

`docs/specs/PROJECT_PRD.md` 必须覆盖:

- 产品定位和目标用户。
- 用户问题和产品目标。
- 非目标和合规边界。
- 核心领域概念。
- 当前正式产品基线。
- 今日概览、价格日历、竞品监控、异常提醒、数据范围和视觉体验需求。
- 数据与合规边界。
- 成功指标和质量门禁。
- 文档维护协议。
- 当前开放问题。

### Project Development Plan

`docs/specs/PROJECT_DEVELOPMENT_PLAN.md` 必须覆盖:

- 当前完成状态。
- 分阶段开发路线。
- F-014 建议方向。
- 每个 Planner、Generator、Evaluator 的标准交付。
- 文档维护节奏。
- 当前风险与处置。
- 当前下一步。

## Acceptance Criteria

- 项目级 PRD 存在, 并能作为完整需求真源使用。
- 项目级开发计划存在, 并能指导下一个 feature queue。
- 文档明确写入维护节奏和更新触发条件。
- `features.json` 记录 F-013。
- `progress.json` 指向 F-013。
- `backlog.json` 记录 Planner 完成项和后续文档维护项。
- `.auto-memory/project-status.md` 反映 PR #8 已合并和当前 Planner 文档维护状态。
- JSON 文件可解析。
- Triad doctor 和 prototype regression 仍通过。
- `git diff --check` 通过。
- 不出现未决占位符、空泛实现承诺、复制式任务描述或无实义错误处理要求。

## Generator Handoff

本切片不需要 Generator 修改产品代码。后续 F-014 Generator 必须先读取:

- `docs/specs/PROJECT_PRD.md`
- `docs/specs/PROJECT_DEVELOPMENT_PLAN.md`
- F-014 feature spec
- F-014 Superpowers plan

F-014 仍必须使用 `superpowers:test-driven-development`, 先写失败测试再实现。

## Evaluator Checklist

Evaluator 应检查:

- PRD 和开发计划是否覆盖当前主线事实。
- F-013 是否没有修改产品代码、测试代码或构建配置。
- status、features、progress、backlog 是否一致。
- 文档维护协议是否足以阻止后续文档漂移。
- 验证命令是否有新鲜输出。
- F-014 建议方向是否符合已验收的 F-008 到 F-012 边界。
