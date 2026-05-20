# Project PRD And Development Plan Maintenance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create and wire project-level PRD and development plan documents so the hotel pricing capture project has a maintained source of truth.

**Architecture:** This is a Planner-only documentation slice. The project-level PRD and roadmap live under `docs/specs/`, while the feature-specific F-013 plan lives under `docs/superpowers/plans/`. State files point to F-013 and record follow-up maintenance gates.

**Tech Stack:** Markdown documentation, Triad Workflow JSON state files, local Python/Node verification commands.

---

### Task 1: Create Project-Level PRD

**Files:**
- Create: `docs/specs/PROJECT_PRD.md`

- [ ] **Step 1: Draft the PRD**

Write a Markdown PRD with these exact sections:

```markdown
# 酒店竞品价格雷达项目 PRD

版本: 2026-05-20
状态: 项目级需求真源, 随每个已验收 feature 更新
维护角色: Planner
当前正式产品基线: F-012 Production Revenue Observatory Visual Upgrade, 已合并至 `main` through PR #8

## 1. 产品定位
## 2. 目标用户
## 3. 用户问题
## 4. 产品目标
## 5. 非目标
## 6. 核心领域概念
## 7. 当前产品基线
## 8. 核心功能需求
## 9. 数据与合规边界
## 10. 成功指标
## 11. 质量门禁
## 12. 项目文档维护协议
## 13. 当前开放问题
```

- [ ] **Step 2: Verify the PRD has no placeholder text**

Run: `rg -n "T[B]D|T[O]DO|implement [l]ater|fill in [d]etails|Similar to [T]ask|appropriate error [h]andling" docs/specs/PROJECT_PRD.md`

Expected: no matches and exit code 1.

### Task 2: Create Project-Level Development Plan

**Files:**
- Create: `docs/specs/PROJECT_DEVELOPMENT_PLAN.md`

- [ ] **Step 1: Draft the development plan**

Write a Markdown roadmap with these exact sections:

```markdown
# 酒店竞品价格雷达项目开发计划

版本: 2026-05-20
状态: 项目级 roadmap 真源, 随每个已验收 feature 更新
当前主线: `main` includes F-012 through PR #8
下一建议切片: F-014 interactive price calendar and date detail workflow

## 1. 开发原则
## 2. 当前完成状态
## 3. 推荐开发路线
## 4. F-014 建议规格方向
## 5. 每个 Feature 的标准交付
## 6. 文档维护节奏
## 7. 当前风险与处置
## 8. 当前下一步
```

- [ ] **Step 2: Verify the development plan has no placeholder text**

Run: `rg -n "T[B]D|T[O]DO|implement [l]ater|fill in [d]etails|Similar to [T]ask|appropriate error [h]andling" docs/specs/PROJECT_DEVELOPMENT_PLAN.md`

Expected: no matches and exit code 1.

### Task 3: Record F-013 Planner Slice

**Files:**
- Create: `docs/specs/2026-05-20-project-prd-and-development-plan-maintenance.md`
- Create: `docs/superpowers/plans/2026-05-20-project-prd-and-development-plan-maintenance.md`

- [ ] **Step 1: Write the F-013 spec**

Create the spec with sections for problem statement, current project facts, scope, non-goals, documentation requirements, acceptance criteria, Generator handoff, and Evaluator checklist.

- [ ] **Step 2: Write this implementation plan**

Create this plan with task-level steps that only touch documentation and state files.

- [ ] **Step 3: Verify the F-013 docs have no placeholder text**

Run: `rg -n "T[B]D|T[O]DO|implement [l]ater|fill in [d]etails|Similar to [T]ask|appropriate error [h]andling" docs/specs/2026-05-20-project-prd-and-development-plan-maintenance.md docs/superpowers/plans/2026-05-20-project-prd-and-development-plan-maintenance.md`

Expected: no matches and exit code 1.

### Task 4: Update Triad State Files

**Files:**
- Modify: `progress.json`
- Modify: `features.json`
- Modify: `backlog.json`
- Modify: `.auto-memory/project-status.md`

- [ ] **Step 1: Update `progress.json`**

Set:

```json
{
  "status": "verifying",
  "batch_id": "project-prd-and-development-plan-maintenance",
  "current_sprint": "F-013-project-prd-and-development-plan-maintenance",
  "total_features": 14,
  "completed_features": 10
}
```

Append `F-013-project-prd-and-development-plan-maintenance` to `features`.

- [ ] **Step 2: Update `features.json`**

Append a feature entry:

```json
{
  "id": "F-013-project-prd-and-development-plan-maintenance",
  "title": "Project PRD and development plan maintenance",
  "status": "verifying",
  "executor": "planner",
  "artifacts": [
    "docs/specs/PROJECT_PRD.md",
    "docs/specs/PROJECT_DEVELOPMENT_PLAN.md",
    "docs/specs/2026-05-20-project-prd-and-development-plan-maintenance.md",
    "docs/superpowers/plans/2026-05-20-project-prd-and-development-plan-maintenance.md"
  ],
  "handoff": {
    "generator": "No product-code Generator work is required for F-013. Future Generators must read the project PRD and development plan before starting a feature slice.",
    "evaluator": "Verify that project-level docs match the current main branch facts, state files are consistent, and no product code, tests, or build config changed."
  }
}
```

- [ ] **Step 3: Update `backlog.json`**

Append:

```json
{
  "id": "B-046",
  "title": "Planner creates project PRD and development plan maintenance baseline",
  "status": "done",
  "feature_id": "F-013-project-prd-and-development-plan-maintenance",
  "notes": "Created project-level PRD, project-level development plan, F-013 spec, and F-013 Planner handoff plan. Scope is documentation/state only."
}
```

Append:

```json
{
  "id": "B-047",
  "title": "Evaluator verifies F-013 project documentation baseline",
  "status": "new",
  "feature_id": "F-013-project-prd-and-development-plan-maintenance",
  "notes": "Verify PRD/development plan freshness, status consistency, no product-code changes, and maintenance protocol coverage before marking F-013 accepted."
}
```

Append:

```json
{
    "id": "B-048",
    "title": "Run recurring project documentation refresh after each accepted feature",
    "status": "new",
    "notes": "Standing maintenance item: every week, and after each accepted feature or merged PR, update PROJECT_PRD, PROJECT_DEVELOPMENT_PLAN, project-status, progress, features, and backlog when facts or roadmap change."
}
```

- [ ] **Step 4: Update `.auto-memory/project-status.md`**

Record that PR #8 is merged, current role is Planner, current batch is F-013, weekly project-document maintenance is active, and next step is B-047 Evaluator verification followed by F-014 planning.

### Task 5: Verify And Commit

**Files:**
- Verify all files changed in this plan.

- [ ] **Step 1: Run Triad doctor**

Run: `python3 scripts/triad_doctor.py`

Expected: exit code 0.

- [ ] **Step 2: Run Triad doctor tests**

Run: `python3 scripts/test_triad_doctor.py`

Expected: exit code 0.

- [ ] **Step 3: Validate JSON files**

Run: `python3 -m json.tool progress.json`

Expected: JSON prints and exit code 0.

Run: `python3 -m json.tool features.json`

Expected: JSON prints and exit code 0.

Run: `python3 -m json.tool backlog.json`

Expected: JSON prints and exit code 0.

- [ ] **Step 4: Run prototype regression**

Run: `node tests/client_demo_prototype.test.js`

Expected: 14 checks pass.

- [ ] **Step 5: Run placeholder scan**

Run: `rg -n "T[B]D|T[O]DO|implement [l]ater|fill in [d]etails|Similar to [T]ask|appropriate error [h]andling" docs/specs/PROJECT_PRD.md docs/specs/PROJECT_DEVELOPMENT_PLAN.md docs/specs/2026-05-20-project-prd-and-development-plan-maintenance.md docs/superpowers/plans/2026-05-20-project-prd-and-development-plan-maintenance.md`

Expected: no matches and exit code 1.

- [ ] **Step 6: Run whitespace diff check**

Run: `git diff --check`

Expected: exit code 0.

- [ ] **Step 7: Commit Planner artifacts**

Run:

```bash
git add docs/specs/PROJECT_PRD.md docs/specs/PROJECT_DEVELOPMENT_PLAN.md docs/specs/2026-05-20-project-prd-and-development-plan-maintenance.md docs/superpowers/plans/2026-05-20-project-prd-and-development-plan-maintenance.md .auto-memory/project-status.md progress.json features.json backlog.json
git commit -m "chore: add project prd and development plan"
```

Expected: commit succeeds on `feature/f-013-project-prd-roadmap-maintenance`.
