# Hotel Triad Workflow Bootstrap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap Planner / Generator / Evaluator workflow, project memory, Superpowers stage gates, and process verification for the Hotel Pricing Capture project.

**Architecture:** Keep workflow rules as project-local markdown and JSON files so every new agent session can load them. Use `scripts/triad_doctor.py` as a lightweight process health check.

**Tech Stack:** Markdown, JSON, Python standard library.

---

### Task 1: Install Workflow Skeleton

**Files:**
- Create: `AGENTS.md`
- Create: `CLAUDE.md`
- Create: `harness-rules.md`
- Create: `planner.md`
- Create: `generator.md`
- Create: `evaluator.md`

- [x] **Step 1: Define project and role boundaries**

Write the core rule files with PR-only delivery, hotel pricing domain guardrails, and role-specific boundaries.

- [x] **Step 2: Include mandatory Superpowers sequence**

Record the required order in `AGENTS.md`, `CLAUDE.md`, and each role file.

### Task 2: Install Project Memory

**Files:**
- Create: `.auto-memory/MEMORY.md`
- Create: `.auto-memory/superpowers-workflow.md`
- Create: `.auto-memory/project-status.md`
- Create: `.auto-memory/environment.md`
- Create: `.auto-memory/user-role.md`
- Create: `.auto-memory/role-context/planner.md`
- Create: `.auto-memory/role-context/generator.md`
- Create: `.auto-memory/role-context/evaluator.md`

- [x] **Step 1: Create memory index**

Make Superpowers workflow a T0 required read.

- [x] **Step 2: Create project-local user and role context**

Document the user's preferred collaboration model and hotel pricing-specific clarification points.

### Task 3: Install Status Files And Doctor

**Files:**
- Create: `progress.json`
- Create: `features.json`
- Create: `backlog.json`
- Create: `scripts/triad_doctor.py`
- Create: `scripts/test_triad_doctor.py`

- [x] **Step 1: Seed workflow status**

Initialize a completed `workflow-bootstrap` feature.

- [x] **Step 2: Add process health check**

Verify JSON consistency, PR-only rule, Superpowers skill cache, required rule files, and role boundaries.

### Task 4: Verify Bootstrap

**Commands:**

```bash
python3 scripts/triad_doctor.py
python3 scripts/test_triad_doctor.py
python3 -m json.tool progress.json
python3 -m json.tool features.json
python3 -m json.tool backlog.json
```

- [ ] **Step 1: Run commands in the target project**

Expected: doctor reports healthy enough to proceed and JSON files parse successfully.
