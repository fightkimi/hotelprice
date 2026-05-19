# F-007 Formal App Foundation Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the F-007 Evaluator P1 blockers so the formal app foundation becomes PR-ready and can pass reverification.

**Architecture:** Keep the existing React + TypeScript + Vite app. Add repository hygiene, tighten the Playwright screenshot gate to viewport-sized artifacts, complete the F-006 `ContextRibbon` primitive contract, and move raw visual overlay/shadow values into design tokens. Do not add live data, persistence, auth, automatic pricing, or new product scope.

**Tech Stack:** Git, `.gitignore`, React, TypeScript, CSS variables, Vitest, Testing Library, Playwright.

---

## Scope Check

This is a fixing slice for `F-007-formal-app-foundation`. It does not redesign the app and does not introduce new product features. It addresses the Evaluator report at `docs/test-reports/2026-05-19-f-007-formal-app-foundation-evaluator.md`.

## Required Fix Outcomes

1. PR readiness: intended source, tests, docs, status files, and screenshot evidence are trackable; dependency/build/cache artifacts are ignored.
2. Screenshot matrix: every required screenshot file has pixel dimensions exactly matching its declared viewport.
3. `ContextRibbon`: competitor group and demand context render, and context items are real focusable read-only selector controls with visible labels/focus state.
4. Token layer: raw `rgba(...)` values are removed from `app/src/styles/layout.css` and replaced with named CSS variables in `app/src/styles/tokens.css`.
5. TDD evidence: Generator records fail-first and green verification notes for the fix slice.

## Planned File Changes

Create:

- `.gitignore`
- `docs/test-reports/2026-05-19-f-007-fix-generator-notes.md`

Modify:

- `app/src/styles/tokens.css`
- `app/src/styles/layout.css`
- `app/src/components/layout/ContextRibbon.tsx`
- `app/tests/components/contextRibbon.test.tsx`
- `app/tests/e2e/app-foundation.spec.ts`
- `features.json`
- `progress.json`
- `backlog.json`
- `.auto-memory/project-status.md`

Do not commit or track:

- `app/node_modules/`
- `app/dist/`
- `app/test-results/`
- `app/playwright-report/`
- `app/*.tsbuildinfo`
- `.DS_Store`
- cache/temp files

## Task 1: Add PR Hygiene And Ignore Rules

**Files:**
- Create: `.gitignore`
- Create: `docs/test-reports/2026-05-19-f-007-fix-generator-notes.md`

- [ ] **Step 1: Create `.gitignore`**

Create a project-root `.gitignore`:

```gitignore
.DS_Store
**/.DS_Store
node_modules/
app/node_modules/
dist/
app/dist/
coverage/
app/coverage/
test-results/
app/test-results/
playwright-report/
app/playwright-report/
*.tsbuildinfo
*.log
.vite/
```

- [ ] **Step 2: Verify generated artifacts are ignored**

Run:

```bash
git status --short --ignored
```

Expected:

- `app/node_modules/`, `app/dist/`, `app/*.tsbuildinfo`, and `.DS_Store` appear as ignored when using `--ignored`.
- They do not appear as normal `??` untracked files.

- [ ] **Step 3: Create fix evidence note**

Create `docs/test-reports/2026-05-19-f-007-fix-generator-notes.md` with:

```markdown
# F-007 Fix Generator Notes

Date: 2026-05-19
Role: Generator-Codex
Feature: `F-007-formal-app-foundation`
Fix source: `docs/test-reports/2026-05-19-f-007-formal-app-foundation-evaluator.md`

## TDD Evidence To Record

- ContextRibbon contract RED command and failure summary.
- ContextRibbon contract GREEN command and pass summary.
- Screenshot viewport RED command and failure summary.
- Screenshot viewport GREEN command and pass summary.
- Token/raw-color contract RED command and failure summary.
- Token/raw-color contract GREEN command and pass summary.

## Final Verification To Record

- `npm run verify` from `app/`
- `python3 scripts/triad_doctor.py`
- `python3 scripts/test_triad_doctor.py`
- `python3 -m json.tool progress.json`
- `python3 -m json.tool features.json`
- `python3 -m json.tool backlog.json`
- `node tests/client_demo_prototype.test.js`
- `git status --short`
- `git diff --stat origin/main...HEAD`
```

- [ ] **Step 4: Commit hygiene after final fix verification**

Do not commit yet. Commit only after Tasks 2-5 pass:

```bash
git add .gitignore docs/test-reports/2026-05-19-f-007-fix-generator-notes.md
```

## Task 2: Fix ContextRibbon Contract

**Files:**
- Modify: `app/src/components/layout/ContextRibbon.tsx`
- Modify: `app/tests/components/contextRibbon.test.tsx`
- Modify: `app/src/styles/layout.css`

- [ ] **Step 1: Extend failing ContextRibbon test**

Update `app/tests/components/contextRibbon.test.tsx` so the primary test requires all F-006 fields:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ContextRibbon } from '../../src/components/layout/ContextRibbon';
import { demoDataset } from '../../src/data/demoDataset';

describe('ContextRibbon', () => {
  it('renders all F-006 context fields as visible read-only selector controls', async () => {
    const user = userEvent.setup();
    render(<ContextRibbon context={demoDataset.context} sourceKind={demoDataset.sourceKind} />);

    const expectedLabels = ['酒店', '房型', '平台', '入住日期', '竞品组', '需求背景', '采集时间', '数据口径'];
    for (const label of expectedLabels) {
      expect(screen.getByText(label)).toBeVisible();
    }

    expect(screen.getByRole('button', { name: /酒店 西湖商务精选酒店/ })).toBeVisible();
    expect(screen.getByRole('button', { name: /竞品组 核心竞品组 A/ })).toBeVisible();
    expect(screen.getByRole('button', { name: /需求背景 周末、端午演示假期、会展演示日/ })).toBeVisible();
    expect(screen.getByText(/演示数据/)).toBeVisible();

    await user.tab();
    expect(screen.getByRole('button', { name: /酒店 西湖商务精选酒店/ })).toHaveFocus();
  });
});
```

If `@testing-library/user-event` is not installed, add it to `app/package.json` devDependencies and run `npm install` from `app/`.

- [ ] **Step 2: Run test and verify RED**

Run:

```bash
cd app
npm test -- tests/components/contextRibbon.test.tsx
```

Expected: FAIL because `竞品组` / `需求背景` controls and focusable selector buttons are missing.

- [ ] **Step 3: Implement focusable read-only controls**

Update `ContextRibbon.tsx` to render these items:

```ts
const items = [
  ['酒店', context.property],
  ['房型', context.roomType],
  ['平台', context.platform],
  ['入住日期', context.dateRange],
  ['竞品组', context.competitorGroup],
  ['需求背景', context.demandContext],
  ['采集时间', context.captureTime]
] as const;
```

Render each as:

```tsx
<button
  className="context-ribbon__item context-ribbon__control"
  key={label}
  type="button"
  aria-label={`${label} ${value}`}
>
  <span className="context-ribbon__label">{label}</span>
  <span className="context-ribbon__value">{value}</span>
</button>
```

Keep data口径 visible as a non-changing control or button. If it is a button, give it an `aria-label` containing `数据口径 演示数据`.

- [ ] **Step 4: Add visible focus style**

Update `layout.css` so `.context-ribbon__control:focus-visible` uses:

```css
outline: 2px solid var(--color-focus);
outline-offset: 2px;
```

- [ ] **Step 5: Verify ContextRibbon GREEN**

Run:

```bash
cd app
npm test -- tests/components/contextRibbon.test.tsx
```

Expected: PASS.

## Task 3: Fix Screenshot Viewport Gate

**Files:**
- Modify: `app/tests/e2e/app-foundation.spec.ts`
- Regenerate: `docs/test-reports/f-007-app-foundation/*.png`

- [ ] **Step 1: Add screenshot dimension assertion**

Update `app/tests/e2e/app-foundation.spec.ts`:

- remove `fullPage: true`;
- capture viewport only;
- read the saved PNG dimensions;
- assert width and height equal the viewport matrix.

Use this helper in the test file:

```ts
import { readFileSync } from 'node:fs';

function pngDimensions(path: string): { width: number; height: number } {
  const data = readFileSync(path);
  return {
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20)
  };
}
```

Replace screenshot capture with:

```ts
const screenshotPath = `${screenshotDir}/${filename}`;
await page.screenshot({ path: screenshotPath });
expect(pngDimensions(screenshotPath)).toEqual(viewport);
```

- [ ] **Step 2: Run screenshot test and verify RED if old behavior remains**

Run:

```bash
cd app
npm run screenshots
```

Expected before implementation is fully fixed: FAIL if any screenshot still uses full-page dimensions.

- [ ] **Step 3: Regenerate viewport-sized screenshots**

Run:

```bash
cd app
npm run screenshots
```

Expected: PASS and all 12 files under `docs/test-reports/f-007-app-foundation/` have exact matrix dimensions.

- [ ] **Step 4: Independently verify dimensions**

Run:

```bash
file docs/test-reports/f-007-app-foundation/*.png
```

Expected:

- `overview-normal--1440x900.png`: `1440 x 900`
- `overview-loading--1440x900.png`: `1440 x 900`
- `overview-empty--1440x900.png`: `1440 x 900`
- `overview-normal--390x844.png`: `390 x 844`
- `calendar-detail-open--1440x900.png`: `1440 x 900`
- `calendar-detail-open--390x844.png`: `390 x 844`
- `market-comparison-platform-bars--1440x900.png`: `1440 x 900`
- `market-comparison-platform-bars--390x844.png`: `390 x 844`
- `alert-review-drawer-open--1440x900.png`: `1440 x 900`
- `alert-review-drawer-open--390x844.png`: `390 x 844`
- `setup-data-scope--1280x800.png`: `1280 x 800`
- `setup-data-scope--768x1024.png`: `768 x 1024`

## Task 4: Move Raw RGBA Values Into Tokens

**Files:**
- Modify: `app/src/styles/tokens.css`
- Modify: `app/src/styles/layout.css`
- Add or modify: `app/tests/contract/tokens.test.ts`

- [ ] **Step 1: Add failing raw-color contract test**

Extend `app/tests/contract/tokens.test.ts` with a test that reads `src/styles/layout.css` and fails when raw color functions appear:

```ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const layoutCss = readFileSync(resolve(process.cwd(), 'src/styles/layout.css'), 'utf8');

it('does not define raw color functions outside the token layer', () => {
  expect(layoutCss).not.toMatch(/rgba?\(/);
});
```

- [ ] **Step 2: Run token test and verify RED**

Run:

```bash
cd app
npm test -- tests/contract/tokens.test.ts
```

Expected: FAIL because `layout.css` still contains raw `rgba(...)`.

- [ ] **Step 3: Add alpha/shadow/overlay tokens**

Add named variables to `tokens.css`, for example:

```css
--shadow-soft: 0 12px 30px rgba(23, 33, 29, 0.05);
--shadow-drawer: 0 18px 44px rgba(23, 33, 29, 0.12);
--overlay-page-top: linear-gradient(180deg, rgba(255, 255, 255, 0.58), rgba(255, 255, 255, 0) 260px);
--chart-event-band: rgba(45, 127, 166, 0.18);
--border-risk-soft: rgba(181, 72, 72, 0.28);
--border-teal-soft: rgba(8, 126, 120, 0.2);
--heatmap-teal-alpha: rgba(8, 126, 120, calc(var(--heat) * 0.28));
--border-amber-strong: rgba(184, 117, 26, 0.5);
```

Raw `rgba(...)` is allowed in `tokens.css`; the contract forbids it outside the token layer.

- [ ] **Step 4: Replace raw values in layout**

Replace each `rgba(...)` in `layout.css` with the corresponding `var(...)` token.

- [ ] **Step 5: Verify raw-color contract GREEN**

Run:

```bash
cd app
npm test -- tests/contract/tokens.test.ts
```

Expected: PASS.

## Task 5: Final Verification, Staging, And Handoff

**Files:**
- Modify: `features.json`
- Modify: `progress.json`
- Modify: `backlog.json`
- Modify: `.auto-memory/project-status.md`

- [ ] **Step 1: Run full app verification**

Run from `app/`:

```bash
npm run verify
```

Expected: build passes, Vitest passes, Playwright passes, and screenshot dimensions are exact.

- [ ] **Step 2: Run project verification**

Run from project root:

```bash
python3 scripts/triad_doctor.py
python3 scripts/test_triad_doctor.py
python3 -m json.tool progress.json
python3 -m json.tool features.json
python3 -m json.tool backlog.json
node tests/client_demo_prototype.test.js
```

Expected: all commands exit 0.

- [ ] **Step 3: Check PR-ready status**

Run:

```bash
git status --short
git status --short --ignored
git diff --stat origin/main...HEAD
```

Expected:

- generated dependencies/build/cache files are ignored;
- intended source/docs/tests/screenshots/status files are visible for staging;
- no `node_modules`, `dist`, `.DS_Store`, or `*.tsbuildinfo` are staged.

- [ ] **Step 4: Stage intended files**

Run:

```bash
git add .gitignore AGENTS.md CLAUDE.md harness-rules.md planner.md generator.md evaluator.md progress.json features.json backlog.json .auto-memory docs app/package.json app/package-lock.json app/index.html app/vite.config.ts app/tsconfig.json app/tsconfig.node.json app/playwright.config.ts app/src app/tests prototypes scripts tests
```

Then run:

```bash
git status --short
```

Expected: staged files are source/docs/tests/screenshots/status artifacts only. No dependency/build/cache artifacts are staged.

- [ ] **Step 5: Commit F-007 implementation and fixes**

Run:

```bash
git commit -m "feat: add formal app foundation"
```

Expected: commit succeeds on `feature/f-007-formal-app-foundation`.

- [ ] **Step 6: Update Triad status for reverification**

After commit and verification:

- set `F-007-formal-app-foundation` to `reverifying`;
- keep executor as `generator`;
- mark the Generator fix backlog item as `done`;
- mark the Evaluator reverification backlog item as `new`;
- record the commit SHA and final green commands in `docs/test-reports/2026-05-19-f-007-fix-generator-notes.md`.

## Evaluator Reverification Checklist

- `git ls-files` includes the F-007 implementation, tests, screenshot artifacts, and status docs.
- `git status --short` has no accidental dependency/build/cache artifacts.
- `.gitignore` excludes `node_modules`, `dist`, `.DS_Store`, `*.tsbuildinfo`, Playwright reports, and test caches.
- All screenshot PNG dimensions exactly match their filename viewports.
- `ContextRibbon` shows property, room type, platform, date range, competitor group, demand context, source kind, and capture time.
- Context ribbon items are focusable and have visible focus styling.
- `layout.css` contains no raw `rgba(...)` values.
- `npm run verify` passes.
- Project workflow checks and old prototype tests still pass.
