# Source Strategy And Compliance Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the Phase 3 data-source strategy and compliance gate before any real data ingestion, live collection, connector, storage or capture-job implementation begins.

**Architecture:** This is a Planner-only governance slice. It updates project specs, roadmap and state files to define allowed source classes, prohibited collection methods, required authorization evidence, source decision matrix and the next feature order. No product code, tests, runtime scripts, package files or screenshots are modified in F-017.

**Tech Stack:** Markdown project specs, Triad workflow status files, JSON project tracking files.

---

## Required Context

Before working this plan, read:

- `.auto-memory/MEMORY.md`
- `.auto-memory/project-status.md`
- `.auto-memory/superpowers-workflow.md`
- `planner.md`
- `CLAUDE.md`
- `docs/specs/PROJECT_PRD.md`
- `docs/specs/PROJECT_DEVELOPMENT_PLAN.md`
- `docs/specs/2026-05-21-source-strategy-and-compliance-gate.md`
- `progress.json`
- `features.json`
- `backlog.json`

Planner boundary:

- Do not modify `app/src/**`, `app/tests/**`, app package files, migrations, runtime scripts or screenshot artifacts.
- Do not implement live collection, browser automation, credential/session/CAPTCHA handling, persistence, recommended pricing or automatic pricing.
- Future Generator work must use `superpowers:test-driven-development`; F-017 itself has no product-code Generator task.

---

### Task 1: Record F-017 As The Phase 3 Planning Slice

**Files:**
- Modify: `.auto-memory/project-status.md`
- Modify: `progress.json`
- Modify: `features.json`
- Modify: `backlog.json`

- [ ] **Step 1: Update project status**

In `.auto-memory/project-status.md`, change the current batch to:

```markdown
- Batch id: `source-strategy-compliance`
- Feature: `F-017-source-strategy-and-compliance-gate`
- Goal: define the Phase 3 data-source strategy and compliance gate before ingestion implementation
- Status: Planner spec and plan ready for Evaluator review
- Current branch: `feature/f-017-source-strategy-planning`
```

Add these current facts:

```markdown
- PR #13 merged the F-016 post-merge status update into `main`.
- Latest known main merge commit after PR #13: `5c4eef3`.
- F-017 selects source strategy and compliance gate as the first Phase 3 slice.
```

Replace the next step with:

```markdown
B-062 is complete. Next, Evaluator should review F-017 source strategy and compliance gate as B-063. After F-017 is accepted, Planner should prepare F-018 manual import preview and field mapping.
```

- [ ] **Step 2: Update progress**

In `progress.json`, set:

```json
{
  "status": "verifying",
  "batch_id": "source-strategy-compliance",
  "current_sprint": "F-017-source-strategy-and-compliance-gate"
}
```

Append `F-017-source-strategy-and-compliance-gate` to the `features` array and increase `total_features` by 1. Keep `completed_features` unchanged because F-017 awaits Evaluator review.

- [ ] **Step 3: Add F-017 feature entry**

Append this feature object to `features.json`:

```json
{
  "id": "F-017-source-strategy-and-compliance-gate",
  "title": "Source strategy and compliance gate",
  "status": "verifying",
  "executor": "planner",
  "artifacts": [
    "docs/specs/2026-05-21-source-strategy-and-compliance-gate.md",
    "docs/superpowers/plans/2026-05-21-source-strategy-and-compliance-gate.md",
    "docs/specs/PROJECT_PRD.md",
    "docs/specs/PROJECT_DEVELOPMENT_PLAN.md",
    ".auto-memory/project-status.md"
  ],
  "handoff": {
    "generator": "No product-code Generator work is allowed in F-017. Future F-018 implementation must wait for F-017 Evaluator acceptance and use strict TDD.",
    "evaluator": "Verify F-017 as documentation/state-only, confirm source classes, prohibited methods, source decision matrix, next-slice order, project-doc freshness, and JSON/Triad/prototype/diff checks."
  }
}
```

- [ ] **Step 4: Update backlog**

Set `B-062` to `done` with this note:

```text
Completed. Selected F-017-source-strategy-and-compliance-gate as the first Phase 3 slice and created the Planner spec/plan. This keeps data-source work documentation/state-only until Evaluator acceptance.
```

Append:

```json
{
  "id": "B-063",
  "title": "Evaluator verifies F-017 source strategy and compliance gate",
  "status": "new",
  "feature_id": "F-017-source-strategy-and-compliance-gate",
  "notes": "Verify documentation/state-only scope, allowed source classes, prohibited methods, decision matrix, next feature order, project docs freshness, JSON/Triad/prototype checks, and absence of product-code changes."
},
{
  "id": "B-064",
  "title": "Planner prepares F-018 manual import preview after F-017 acceptance",
  "status": "new",
  "notes": "Only start after F-017 is accepted. Recommended scope: local/manual CSV or pasted-row preview, field mapping, rate-boundary validation, no persistence, no live collection, no credentials, no automatic pricing."
}
```

- [ ] **Step 5: Validate JSON**

Run:

```bash
python3 -m json.tool progress.json
python3 -m json.tool features.json
python3 -m json.tool backlog.json
```

Expected: all commands exit 0.

---

### Task 2: Refresh Project-Level PRD And Development Plan

**Files:**
- Modify: `docs/specs/PROJECT_PRD.md`
- Modify: `docs/specs/PROJECT_DEVELOPMENT_PLAN.md`

- [ ] **Step 1: Update PROJECT_PRD current state**

In `docs/specs/PROJECT_PRD.md`, set the current baseline lines to:

```markdown
当前正式产品基线: `main` includes F-016 through PR #13 status sync, merge commit `5c4eef3`
当前交付状态: F-017 Source Strategy And Compliance Gate 进入 Planner 验证; Phase 3 先做来源策略和合规闸门
```

Add F-017 to the current baseline section:

```markdown
- F-017: source strategy and compliance gate, 定义 Phase 3 可进入产品路线的来源类型、授权证据、禁止方法、source decision matrix 和 F-018 manual import preview 的前置条件。F-017 不实现真实采集、连接器、存储或自动调价。
```

- [ ] **Step 2: Update PROJECT_PRD data boundary**

In `docs/specs/PROJECT_PRD.md` section 9, add:

```markdown
- F-017 要求任何未来 source proposal 先完成 source decision matrix, 覆盖授权证据、terms status、property/competitor/channel/date/capture-time/currency/room/occupancy/tax-fee/cancellation-policy 边界、refresh model、rate limit、secret handling、storage status、audit evidence 和 product permission。
```

- [ ] **Step 3: Update PROJECT_DEVELOPMENT_PLAN current state**

In `docs/specs/PROJECT_DEVELOPMENT_PLAN.md`, set:

```markdown
当前主线: `main` includes F-016 through PR #13 status sync, merge commit `5c4eef3`
当前交付状态: F-017 source strategy and compliance gate 进入 Planner 验证; Phase 3 先建立来源策略和合规闸门
```

In Phase 3, add F-017 as the first item and move F-018 manual import preview after it:

```markdown
1. F-017 source strategy and compliance gate
   - 定义允许来源类型、授权证据、禁止方法、source decision matrix 和后续 feature 顺序。
   - 不改产品代码, 不接真实数据。
2. F-018 manual import preview and field mapping
   - 在 F-017 accepted 后规划。
   - 只做本地/手动导入预览、字段映射和 rate-boundary validation。
   - 不做持久化、live collection、credentials、browser automation 或自动调价。
```

- [ ] **Step 4: Validate project docs**

Run:

```bash
rg -n "F-017|source strategy|compliance gate|manual import preview|live collection|automatic pricing" docs/specs/PROJECT_PRD.md docs/specs/PROJECT_DEVELOPMENT_PLAN.md
```

Expected: output shows F-017 current state, source decision matrix, manual import preview next, and preserved prohibited boundaries.

---

### Task 3: Final Planner Verification And Handoff

**Files:**
- No additional file edits unless verification exposes a documentation or state mismatch.

- [ ] **Step 1: Verify no product code changed**

Run:

```bash
git diff --name-only -- app/src app/tests app/package.json app/package-lock.json scripts
```

Expected: no output.

- [ ] **Step 2: Run Planner verification commands**

Run:

```bash
python3 scripts/triad_doctor.py
python3 scripts/test_triad_doctor.py
python3 -m json.tool progress.json
python3 -m json.tool features.json
python3 -m json.tool backlog.json
node tests/client_demo_prototype.test.js
git diff --check
```

Expected:

- Triad doctor reports healthy enough to proceed.
- Triad doctor smoke test passes.
- JSON files parse.
- Prototype regression reports 14 OK checks.
- `git diff --check` exits 0.

- [ ] **Step 3: Commit Planner work**

Run:

```bash
git add .auto-memory/project-status.md backlog.json docs/specs/PROJECT_DEVELOPMENT_PLAN.md docs/specs/PROJECT_PRD.md docs/specs/2026-05-21-source-strategy-and-compliance-gate.md docs/superpowers/plans/2026-05-21-source-strategy-and-compliance-gate.md features.json progress.json
git commit -m "chore: plan f-017 source strategy"
```

- [ ] **Step 4: Handoff**

Report:

```markdown
F-017 Planner work is ready for B-063 Evaluator review.

Artifacts:
- docs/specs/2026-05-21-source-strategy-and-compliance-gate.md
- docs/superpowers/plans/2026-05-21-source-strategy-and-compliance-gate.md

Next:
- B-063 Evaluator verifies F-017.
- After acceptance, Planner prepares F-018 manual import preview and field mapping.
```
