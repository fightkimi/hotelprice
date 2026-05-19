# Premium Product Experience System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the conditional F-004 design baseline into a concrete premium product experience system and formal app foundation plan.

**Architecture:** This is a Planner-owned transition plan. It creates a production-grade design-system specification, carries forward Evaluator risks, updates status files, and defines the next Generator-ready coding slice without changing product implementation code.

**Tech Stack:** Markdown, JSON, Triad workflow checks, existing prototype screenshots and reports.

---

## Scope Check

This plan prepares the project for formal development. It does not implement the formal app, install dependencies, or modify prototype/product source files.

## Planned File Changes

- Create `docs/specs/2026-05-19-premium-product-experience-system.md`.
- Create `docs/superpowers/plans/2026-05-19-premium-product-experience-system.md`.
- Update `features.json`.
- Update `progress.json`.
- Update `backlog.json`.
- Update `.auto-memory/project-status.md`.

### Task 1: Carry Forward F-004 Evaluator Findings

**Files:**
- Create: `docs/specs/2026-05-19-premium-product-experience-system.md`

- [x] **Step 1: Record accepted-but-conditional status**

Record that F-004 is accepted as a baseline but not as a final production UI contract.

- [x] **Step 2: Carry P1 visual-gate finding into F-005**

Require F-005 to define viewport matrix, screenshot matrix, visual pass/fail gates, chart nonblank checks, text fitting checks, and responsive behavior checks.

- [x] **Step 3: Carry P1/P2 dependencies forward**

Record:

- F-003 final evaluation must close or be superseded before production UI coding;
- F-001 precheck P1 data-boundary issues must be resolved before domain-core implementation;
- git repository readiness blocks PR-only formal development.

### Task 2: Define Premium Design Philosophy

**Files:**
- Modify: `docs/specs/2026-05-19-premium-product-experience-system.md`

- [x] **Step 1: Name the product design movement**

Use `Quiet Yield`.

- [x] **Step 2: Define visual principles**

Document:

- calm operating console;
- chart-first evidence;
- semantic color;
- disciplined density;
- data provenance as quiet evidence;
- no generic admin template feel.

- [x] **Step 3: Define tone**

Use: calm, exact, operational, premium but not luxurious, analytical but not hostile.

### Task 3: Define Concrete Design Tokens And Primitives

**Files:**
- Modify: `docs/specs/2026-05-19-premium-product-experience-system.md`

- [x] **Step 1: Define color, type, and layout tokens**

Document semantic token names, type scale, spacing scale, radius rules, and chart minimum dimensions.

- [x] **Step 2: Define layout primitives**

Document:

- `AppShell`;
- `ContextRibbon`;
- `SignalPanel`;
- `EvidenceDrawer`;
- `SplitWorkspace`;
- `DataDensityToggle`.

- [x] **Step 3: Define chart primitives**

Document:

- `TrendChart`;
- `CalendarHeatmap`;
- `PlatformGapBars`;
- `Sparkline`;
- `EventTimeline`;
- `ConfidenceBand`.

- [x] **Step 4: Define evidence primitives**

Document:

- `SourceBadge`;
- `CaptureTime`;
- `RateKeyPill`;
- `SampleMarker`;
- `HumanReviewMarker`.

### Task 4: Define Visual And Interaction Gates

**Files:**
- Modify: `docs/specs/2026-05-19-premium-product-experience-system.md`

- [x] **Step 1: Define viewport matrix**

Use:

- 1440x900;
- 1280x800;
- 768x1024;
- 390x844.

- [x] **Step 2: Define screenshot matrix**

Require screenshots for overview, price calendar, market comparison, alert review, and setup/data scope.

- [x] **Step 3: Define pass/fail criteria**

Include no overlap, nonblank charts, readable labels, desktop above-fold insight, mobile control wrapping, no nested card stacks, no decorative blobs, provenance visible, and customer-safe pricing copy.

### Task 5: Define Formal Development Path

**Files:**
- Modify: `docs/specs/2026-05-19-premium-product-experience-system.md`
- Modify: `backlog.json`

- [x] **Step 1: Define gating sequence**

Use:

- close or supersede F-003 evaluation;
- fix git/repository readiness;
- plan and implement F-005 app foundation;
- implement F-006 domain core;
- implement F-007 first vertical slice;
- plan F-008 data source strategy.

- [x] **Step 2: Update backlog**

Add or update backlog items for:

- F-005 Evaluator review;
- F-006 Planner domain-core revision with F-001 precheck carryover;
- repository readiness for PR-only workflow;
- F-005 Generator implementation only after acceptance.

### Task 6: Update Feature And Progress State

**Files:**
- Modify: `features.json`
- Modify: `progress.json`
- Modify: `.auto-memory/project-status.md`

- [x] **Step 1: Mark F-004 as conditionally accepted baseline**

Set F-004 status to `done` and include the Evaluator report artifact.

- [x] **Step 2: Add F-005**

Add `F-005-premium-product-experience-system` with status `planning`, executor `planner`, and spec/plan artifacts.

- [x] **Step 3: Update progress**

Set current sprint to F-005 and increment feature counts.

- [x] **Step 4: Update project status**

Set current batch to `premium-product-experience-system` and next step to Evaluator review of F-005.

### Task 7: Verification

**Files:**
- No product code changes.

- [x] **Step 1: Run JSON and Triad checks**

Run:

```bash
python3 scripts/triad_doctor.py
python3 scripts/test_triad_doctor.py
python3 -m json.tool progress.json
python3 -m json.tool features.json
python3 -m json.tool backlog.json
```

Expected: commands exit 0, with only the known git warning if the project is still not a git repository.

- [x] **Step 2: Run current prototype test suite**

Run:

```bash
node tests/client_demo_prototype.test.js
```

Expected: current prototype tests pass. This does not verify F-005 implementation because F-005 is a planning artifact.

- [x] **Step 3: Scan for unfinished markers**

Scan the F-005 spec and plan for unfinished placeholders, deferred implementation phrases, and copy-pasted fragments.

Expected: no matches.
