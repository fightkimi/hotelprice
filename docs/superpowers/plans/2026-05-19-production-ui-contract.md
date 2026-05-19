# Production UI Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the accepted F-005 experience baseline into a concrete production UI contract that can safely precede a Generator-ready formal app foundation plan.

**Architecture:** This is a Planner-owned contract feature. It updates planning/status artifacts only, defines exact token values, primitive contracts, chart schemas, screenshot artifact naming, and hard pass/fail gates. It does not implement product UI.

**Tech Stack:** Markdown, JSON, Triad workflow checks, existing Node prototype test suite.

---

## Scope Check

This plan does not implement a frontend app. It prepares the final contract needed before Planner writes the Generator-ready `F-007-formal-app-foundation` coding plan.

## Planned File Changes

- Create `docs/specs/2026-05-19-production-ui-contract.md`.
- Create `docs/superpowers/plans/2026-05-19-production-ui-contract.md`.
- Update `features.json`.
- Update `progress.json`.
- Update `backlog.json`.
- Update `.auto-memory/project-status.md`.
- Optionally mark completed F-005 planning checkboxes if traceability requires it.

### Task 1: Close F-005 As Baseline

**Files:**
- Modify: `features.json`
- Modify: `backlog.json`

- [x] **Step 1: Mark F-005 done**

Set `F-005-premium-product-experience-system` to `done` with executor `evaluator`.

- [x] **Step 2: Attach evaluator report**

Add `docs/test-reports/2026-05-19-f-005-premium-product-experience-system-evaluator.md` to F-005 artifacts.

- [x] **Step 3: Update backlog review item**

Set the F-005 evaluator backlog item to `done` and note that F-006 is required before Generator can code.

### Task 2: Define Concrete Token Contract

**Files:**
- Create: `docs/specs/2026-05-19-production-ui-contract.md`

- [x] **Step 1: Add color tokens**

Define token name, value, use, and contrast rule for background, surface, text, dividers, accents, focus, disabled, and chart/status colors.

- [x] **Step 2: Add typography tokens**

Define size, line height, weight, usage, tabular numeral rules, and letter spacing.

- [x] **Step 3: Add layout tokens**

Define grid, spacing, radius, border, chart dimensions, and context-ribbon behavior.

### Task 3: Define Primitive Contracts

**Files:**
- Modify: `docs/specs/2026-05-19-production-ui-contract.md`

- [x] **Step 1: Define layout primitives**

For `AppShell`, `ContextRibbon`, `SignalPanel`, and `EvidenceDrawer`, include props, states, responsive behavior, and accessibility expectations.

- [x] **Step 2: Define chart primitives**

For `TrendChart`, `CalendarHeatmap`, `PlatformGapBars`, and `EventTimeline`, include input schemas, missing-data behavior, mobile behavior, and nonblank rules.

- [x] **Step 3: Define evidence rules**

Require source, capture time, room type, platform, tax/fee basis, sample size, and human-review marker on pricing-sensitive analytical surfaces.

### Task 4: Define Screenshot Matrix And Hard Gates

**Files:**
- Modify: `docs/specs/2026-05-19-production-ui-contract.md`

- [x] **Step 1: Define screenshot artifact paths**

List exact required screenshot file names under `docs/test-reports/f-007-app-foundation/`.

- [x] **Step 2: Define required state combinations**

Include normal, loading, empty, drawer open, date detail open, platform bars, and setup/data scope states.

- [x] **Step 3: Define hard pass/fail gates**

Include token enforcement, labeled controls, nonblank charts, missing-data behavior, screenshot completeness, overflow threshold, forbidden copy, evidence marker requirements, and no direct prototype CSS copy.

### Task 5: Define F-007 Coding Slice Shape

**Files:**
- Modify: `docs/specs/2026-05-19-production-ui-contract.md`
- Modify: `backlog.json`

- [x] **Step 1: Define F-007 minimum scope**

Include token layer, app shell, context ribbon, signal panel, evidence drawer, chart primitives, fixture/demo mode, five screens, screenshot and contract verification scripts.

- [x] **Step 2: Add F-007 backlog items**

Add backlog items for:

- Planner creates F-007 Generator-ready implementation plan;
- Generator implements F-007 after repo readiness and F-006 acceptance;
- Evaluator verifies F-007 screenshots/contracts.

### Task 6: Update Status Files

**Files:**
- Modify: `features.json`
- Modify: `progress.json`
- Modify: `.auto-memory/project-status.md`

- [x] **Step 1: Add F-006**

Add `F-006-production-ui-contract` with status `planning`, executor `planner`, and spec/plan artifacts.

- [x] **Step 2: Update progress**

Set current sprint to F-006 and update total/completed feature counts.

- [x] **Step 3: Update project status**

Set batch id to `production-ui-contract` and next step to F-006 Evaluator review.

### Task 7: Verification

**Files:**
- No product code changes.

- [x] **Step 1: Run Triad and JSON checks**

Run:

```bash
python3 scripts/triad_doctor.py
python3 scripts/test_triad_doctor.py
python3 -m json.tool progress.json
python3 -m json.tool features.json
python3 -m json.tool backlog.json
```

Expected: commands exit 0, with only the known git warning if repository readiness is unresolved.

- [x] **Step 2: Run current prototype tests**

Run:

```bash
node tests/client_demo_prototype.test.js
```

Expected: 14 checks pass.

- [x] **Step 3: Scan F-006 docs for unfinished markers**

Search for unfinished placeholder language, copied plan fragments, and vague deferred-work markers.

Expected: no matches.
