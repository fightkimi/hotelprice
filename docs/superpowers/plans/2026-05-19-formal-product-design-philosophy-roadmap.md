# Formal Product Design Philosophy And Roadmap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the formal product design philosophy, interaction model, visual system direction, and development roadmap before production app implementation begins.

**Architecture:** This is a Planner-owned documentation feature. It creates design and roadmap artifacts that constrain later Generator work, and it updates workflow status files without touching product implementation code.

**Tech Stack:** Markdown, JSON, existing prototype screenshots, Triad workflow checks.

---

## Scope Check

This plan does not implement UI code. It defines the design philosophy and development sequence that should guide future implementation.

## Planned File Changes

- Create `docs/specs/2026-05-19-formal-product-design-philosophy-roadmap.md`.
- Create `docs/superpowers/plans/2026-05-19-formal-product-design-philosophy-roadmap.md`.
- Update `features.json`.
- Update `progress.json`.
- Update `backlog.json`.
- Update `.auto-memory/project-status.md`.

### Task 1: Record Current Product And Prototype State

**Files:**
- Create: `docs/specs/2026-05-19-formal-product-design-philosophy-roadmap.md`

- [x] **Step 1: Document current feature state**

Record:

- `F-001` rate monitoring core is planning;
- `F-002` customer demo prototype is verifying;
- `F-003` investor demo prototype enhancement is verifying;
- formal production app code has not been started as a distinct app foundation.

- [x] **Step 2: Document current prototype design debt**

Record that the current prototype has useful product signals but still feels like a dense admin surface, with weak product personality and insufficient formal design-system discipline.

### Task 2: Define Product Design Philosophy

**Files:**
- Modify: `docs/specs/2026-05-19-formal-product-design-philosophy-roadmap.md`

- [x] **Step 1: Define the product metaphor**

Use: "market command center for small hotel operators."

- [x] **Step 2: Define experience principles**

Include:

- decision before data;
- calm intelligence over alert noise;
- evidence over magic;
- chart first, table second;
- context as a first-class control;
- human-in-the-loop pricing;
- dense but elegant;
- investor-grade credibility.

### Task 3: Define Formal UX And Visual System Direction

**Files:**
- Modify: `docs/specs/2026-05-19-formal-product-design-philosophy-roadmap.md`

- [x] **Step 1: Define production IA**

Include:

- overview command center;
- price calendar and event trends;
- competitor monitor;
- platform and room-type comparison;
- alert center;
- setup and data-source configuration;
- reports and digest later.

- [x] **Step 2: Define visual system rules**

Include:

- restrained light interface;
- semantic color for up/down/event/warning/caveat;
- compact 8px radii;
- no decorative blobs or hero pages;
- chart language based on line charts, heatmaps, sparklines, and bar comparisons.

- [x] **Step 3: Define interaction model**

Include:

- linked date/room/platform/context interactions;
- drawer or side-panel evidence;
- persistent context controls;
- no automatic pricing action.

### Task 4: Define Formal Development Roadmap

**Files:**
- Modify: `docs/specs/2026-05-19-formal-product-design-philosophy-roadmap.md`
- Modify: `backlog.json`

- [x] **Step 1: Define roadmap phases**

Use these phases:

- Phase 0: finish prototype evaluation;
- Phase 1: establish design philosophy and UX system;
- Phase 2: formal app foundation;
- Phase 3: domain core and demo data integration;
- Phase 4: first vertical product slice;
- Phase 5: compliant data source exploration.

- [x] **Step 2: Add backlog items**

Add backlog items for:

- Evaluator reviews F-004 design philosophy baseline;
- Planner prepares F-005 product app foundation;
- Generator implements F-005 only after design baseline acceptance.

### Task 5: Update Status Files

**Files:**
- Modify: `features.json`
- Modify: `progress.json`
- Modify: `.auto-memory/project-status.md`

- [x] **Step 1: Add F-004 to features**

Add `F-004-formal-design-philosophy-roadmap` with status `planning`, executor `planner`, and artifacts pointing to the spec and plan.

- [x] **Step 2: Update progress**

Set current sprint to `F-004-formal-design-philosophy-roadmap` and total feature count to include F-004.

- [x] **Step 3: Update project status**

Set current batch to `formal-design-philosophy-roadmap` and next step to Evaluator review of F-004.

### Task 6: Verification

**Files:**
- No product code changes.

- [x] **Step 1: Run Triad checks**

Run:

```bash
python3 scripts/triad_doctor.py
python3 scripts/test_triad_doctor.py
python3 -m json.tool progress.json
python3 -m json.tool features.json
python3 -m json.tool backlog.json
```

Expected: commands exit 0, with only the known git repository warning if the workspace remains uninitialized as git.

- [x] **Step 2: Scan for placeholders**

Run a placeholder scan against the F-004 spec and plan for unfinished markers, deferred-work phrases, and copy-pasted plan fragments.

Expected: no matches.
