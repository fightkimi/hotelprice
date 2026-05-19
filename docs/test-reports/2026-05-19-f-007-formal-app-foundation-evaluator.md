# F-007 Formal App Foundation Evaluator Report

Date: 2026-05-19
Role: Evaluator-Codex
Feature: `F-007-formal-app-foundation`
Status recommendation: `fixing`

## Scope Classification

- Affected domains: formal app foundation, reporting, pricing comparison, alert review, setup/data scope, chart primitives, screenshot gates.
- Data binding: property-bound, competitor-group-bound, platform/channel-bound, stay-date-bound, room-type-bound, occupancy-bound, currency-bound, tax/fee-bound, cancellation-policy-bound, and capture-time-bound fixture data.
- Data type: fixture/demo only. No real customer data was found in F-007 source.
- Price basis: fixture points include `CNY`, occupancy, meal plan, tax/fee basis, cancellation policy, room type, platform/source, stay date, and capture time.
- Compliance boundary: no live OTA connector, credential handling, cookie/session workflow, CAPTCHA bypass, persistence, auth, deployment, or automatic pricing behavior found.
- Pricing automation: current UI uses review-oriented copy and shows `需人工复核` on pricing-sensitive insight surfaces.

## Required Reading And Workflow

Read and applied:

- `AGENTS.md`
- `CLAUDE.md`
- `harness-rules.md`
- `evaluator.md`
- `.auto-memory/MEMORY.md`
- `.auto-memory/project-status.md`
- `.auto-memory/superpowers-workflow.md`
- `.auto-memory/role-context/evaluator.md`
- `.auto-memory/role-context/generator.md`
- `progress.json`
- `features.json`
- `backlog.json`
- `docs/specs/2026-05-19-production-ui-contract.md`
- `docs/specs/2026-05-19-formal-app-foundation.md`
- `docs/superpowers/plans/2026-05-19-formal-app-foundation.md`

Superpowers direct handles were not exposed in this session, so I used local `SKILL.md` files in the required order:

1. `superpowers:brainstorming`
2. `superpowers:writing-plans`
3. `superpowers:executing-plans`
4. `superpowers:test-driven-development`
5. `superpowers:verification-before-completion`

Evaluator did not modify product code. This report is the only intended F-007 Evaluator artifact.

## Fresh Verification Evidence

### Project Workflow Checks

Command: `python3 scripts/triad_doctor.py`

Result: exit 0. Key evidence:

- current branch is `feature/f-007-formal-app-foundation`
- Triad doctor reports healthy enough to proceed

Command: `python3 scripts/test_triad_doctor.py`

Result: exit 0. `triad_doctor` smoke test passed.

Command: `python3 -m json.tool progress.json`

Result: exit 0. JSON parsed successfully; project status is `verifying`, current sprint is `F-007-formal-app-foundation`.

Command: `python3 -m json.tool features.json`

Result: exit 0. JSON parsed successfully; F-007 is `verifying` with Generator handoff.

Command: `python3 -m json.tool backlog.json`

Result: exit 0. JSON parsed successfully; B-018 is ready for Evaluator review.

Command: `node tests/client_demo_prototype.test.js`

Result: exit 0. Existing prototype suite still reports 14 OK checks.

### App Verification

Command: `npm run verify` from `app/`

First sandboxed run:

- build passed;
- Vitest passed;
- Playwright could not start local Vite server due sandbox `listen EPERM 127.0.0.1`.

Re-run with local server permission:

- build passed: Vite built `dist/index.html`, CSS, and JS bundle;
- Vitest passed: 6 test files, 22 tests;
- Playwright passed: 13/13 tests, including all 12 screenshot cases plus evidence/human-review marker case.

### Screenshot Artifact Check

All required screenshot file names exist under `docs/test-reports/f-007-app-foundation/`.

Observed dimensions from `file`:

- `overview-normal--1440x900.png`: 1440 x 956
- `overview-loading--1440x900.png`: 1440 x 900
- `overview-empty--1440x900.png`: 1440 x 900
- `overview-normal--390x844.png`: 390 x 2025
- `calendar-detail-open--1440x900.png`: 1440 x 900
- `calendar-detail-open--390x844.png`: 390 x 1845
- `market-comparison-platform-bars--1440x900.png`: 1440 x 900
- `market-comparison-platform-bars--390x844.png`: 390 x 1745
- `alert-review-drawer-open--1440x900.png`: 1440 x 900
- `alert-review-drawer-open--390x844.png`: 390 x 2232
- `setup-data-scope--1280x800.png`: 1280 x 800
- `setup-data-scope--768x1024.png`: 768 x 1098

### Static And Source Checks

Command: `git branch --show-current`

Result: `feature/f-007-formal-app-foundation`.

Command: `git ls-files`

Result: only `README.md` is tracked.

Command: `git status --short`

Result: every project file and app artifact is untracked, including `app/`, docs, status files, screenshots, `node_modules`, `dist`, and tsbuildinfo files.

Command: `rg -n "#[0-9A-Fa-f]{3,8}|rgba?\(" app/src app/tests`

Result: expected token hex values appear in `tokens.css` and token/contrast tests. Additional raw RGBA values appear in `app/src/styles/layout.css`.

Command: `rg -n "自动调价|自动改价|爬虫|抓取|cookie|验证码|token|scrap|captcha|credential|secret|password|api[_-]?key" app/src app/tests app/dist`

Result: rendered-copy gate terms are present in test/developer source as expected. Built output includes bundled library text with generic React/runtime strings and does not indicate customer-visible forbidden copy. Playwright visible DOM scan passed.

Command: `rg -n "prototypes/client-demo|client-demo/styles.css" app/src app/tests app/package.json app/index.html`

Result: no matches. F-007 app does not import/copy the prototype stylesheet by path.

## Requirement Coverage

| Area | Result | Evidence |
| --- | --- | --- |
| Git repository exists on feature branch | Partial | branch exists, but only `README.md` is tracked and implementation is untracked |
| React + TypeScript + Vite app exists | Pass | `app/package.json`, build, Vitest, and Playwright all run |
| Exact F-006 token values | Pass with caveat | `tokens.css` matches exact values; raw RGBA values remain outside token layer |
| Contrast matrix | Pass | `app/tests/contract/contrast.test.ts` covers required pairs and Vitest passes |
| Visible-copy gate scope | Pass | Playwright scans rendered body text; `token` is allowed in tests/source but not rendered UI |
| AppShell and nav | Pass | nav buttons are focusable and selected with `aria-current` |
| ContextRibbon contract | Fail | competitor group and demand context are not included in ribbon; no selector/focusable context controls |
| SignalPanel and EvidenceDrawer | Pass | evidence, sample size, capture time, room type, platform, tax/fee basis, and `需人工复核` render |
| Chart primitives | Pass | trend segments render, missing point appears as gap, heatmap unavailable day is explicit, zero gap shows `CNY 0` |
| Five formal screens | Pass | overview, calendar, market, alerts, setup render from fixture data |
| Screenshot names | Pass | all 12 required names exist |
| Screenshot viewport dimensions | Fail | several files are full-page captures and do not match the declared viewport dimensions |
| No live collection / no automatic pricing | Pass | fixture disclosure and human-review copy present; no live connector/auth/persistence code found |

## Findings

### P1 - PR readiness is not satisfied because the implementation is untracked

Evidence:

- `git ls-files` returns only `README.md`.
- `git status --short` shows `?? app/`, `?? docs/`, `?? features.json`, `?? progress.json`, `?? backlog.json`, `?? node_modules`, `?? dist`, and many generated artifacts.
- `git log --oneline --decorate -5` shows only `616838c chore: initialize repository`.

Impact:

F-007 can run locally, but a PR from the current branch would not contain the implementation unless the right files are explicitly staged and committed. It also risks accidentally adding `node_modules`, `dist`, tsbuildinfo, test-results, `.DS_Store`, and other generated files because no tracked `.gitignore` is visible.

Required before acceptance:

- Add a project `.gitignore` that excludes dependency/build/cache artifacts.
- Stage and commit the intended source, tests, specs/status docs, and screenshot evidence.
- Keep generated dependencies/build outputs out of the PR unless explicitly required.
- Re-run `git status --short` and ensure the PR diff is reviewable.

### P1 - Screenshot artifacts do not match the required viewport dimensions

Evidence:

- F-007 AC9 requires screenshots with exact file names and viewports.
- `app/tests/e2e/app-foundation.spec.ts:5-17` defines the expected viewport matrix.
- `app/tests/e2e/app-foundation.spec.ts:36` captures with `fullPage: true`.
- Resulting files include:
  - `overview-normal--390x844.png`: 390 x 2025
  - `calendar-detail-open--390x844.png`: 390 x 1845
  - `market-comparison-platform-bars--390x844.png`: 390 x 1745
  - `alert-review-drawer-open--390x844.png`: 390 x 2232
  - `setup-data-scope--768x1024.png`: 768 x 1098

Impact:

The file names imply fixed viewport captures, but the files are full-page captures. This weakens visual comparison and does not satisfy the stated screenshot matrix as a strict viewport gate.

Required before acceptance:

- Capture viewport-sized screenshots for the required matrix, or explicitly revise the F-006/F-007 contract to allow full-page evidence.
- Add an automated assertion that screenshot pixel dimensions equal the matrix dimensions.

### P1 - `ContextRibbon` omits required contract fields and does not expose context selectors

Evidence:

- F-006 requires `ContextRibbon` props/fields for `property`, `roomType`, `platform`, `dateRange`, `competitorGroup`, `demandContext`, `sourceKind`, and `captureTime`.
- F-006 also says context selectors need visible labels and focus state.
- `app/src/components/layout/ContextRibbon.tsx:13-19` renders only hotel, room type, platform, stay date, and capture time.
- `app/src/components/layout/ContextRibbon.tsx:21-35` renders static `<div>/<span>` items, not focusable context controls/selectors.

Impact:

The top-level analytical boundary omits competitor group and demand/event context, two key pricing-comparison dimensions. Keyboard/focus behavior for context controls is not actually exercised because controls are not implemented in the ribbon.

Required before acceptance:

- Include competitor group and demand context in the context ribbon.
- Either implement disabled/read-only focusable selector controls with visible labels, or formally revise the contract to say F-007 ribbon is read-only and move selector behavior to a later feature.
- Add component and Playwright checks for the missing labels and focus state.

### P2 - Raw color RGBA values remain outside the token layer

Evidence:

- F-006 hard gate says token values must not be hard-coded outside the token layer.
- `app/src/styles/layout.css:4`, `143`, `174`, `279`, `324`, `446`, `450`, and `456` contain raw `rgba(...)` values.

Impact:

The exact color tokens are present and tested, but the implementation still introduces raw visual colors outside `tokens.css`. Some are alpha overlays/shadows rather than direct token hex values, but they still bypass the contract and make the design system harder to audit.

Recommended fix:

- Add alpha/shadow/overlay tokens in `tokens.css`, then replace raw RGBA usages with variables.
- Add a contract test that permits raw hex only in `tokens.css` and token tests, and permits RGBA only through named token variables.

### P2 - TDD red/green evidence is not independently auditable from Git history

Evidence:

- Generator handoff claims fail-first token, contrast, fixture, primitive, chart, visible-copy, and screenshot tests.
- Current green tests exist and pass.
- Because the implementation is untracked and no F-007 commits exist, Evaluator cannot verify red/green sequence through commit history or recorded terminal output.

Impact:

This does not prove the code is wrong, but it weakens process compliance for a project that explicitly requires TDD evidence.

Recommended fix:

- Preserve a short Generator handoff note or commit sequence showing fail-first and green verification evidence.
- At minimum, include the final green commands and note that historical red output was not retained.

## Positive Evidence

- App foundation is materially implemented with React, TypeScript, Vite, CSS variables, Vitest, Testing Library, Playwright, SVG charts, and lucide icons.
- `npm run verify` passed after local server permission: build, 22 unit/contract/component tests, and 13 Playwright tests.
- Fixture data is clearly marked demo-only and includes currency, tax/fee basis, occupancy, meal plan, cancellation policy, room type, platform/source, stay date, and capture time.
- Evidence drawer contains source, capture time, sample size, confidence, room type, platform, tax/fee basis, occupancy, meal plan, cancellation policy, and `需人工复核`.
- Chart behavior covers valid trend lines, null-value gap, heatmap unavailable state, platform coverage, and zero-gap marker.
- Visible DOM copy scan excludes the forbidden customer-facing terms.
- No live collection, credential, cookie/session, CAPTCHA, auth, database, billing, deployment, or automatic-pricing behavior was found in F-007 app source.

## Verdict

F-007 is **not accepted for final `done` / PR readiness yet**.

The implementation is promising and the automated app verification is green, but F-007 still fails key acceptance gates:

1. the implementation is untracked and not reviewable as a PR diff;
2. screenshot artifacts do not match the declared viewport dimensions;
3. `ContextRibbon` does not satisfy the F-006 primitive contract for competitor group, demand context, and focusable context controls.

Recommended next status: move F-007 to `fixing`, then rerun Evaluator after the three P1 findings are addressed.
