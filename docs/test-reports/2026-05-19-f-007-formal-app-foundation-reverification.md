# F-007 Formal App Foundation Reverification Report

Date: 2026-05-19
Role: Evaluator-Codex
Feature: `F-007-formal-app-foundation`
Reverification item: `B-021`
Status recommendation: `done`

## Scope Classification

- Affected domains: formal app foundation, reporting, pricing comparison, alert review, setup/data scope, chart primitives, screenshot gates, and PR hygiene.
- Data binding: property-bound, competitor-group-bound, platform/channel-bound, stay-date-bound, room-type-bound, occupancy-bound, currency-bound, tax/fee-bound, cancellation-policy-bound, and capture-time-bound fixture data.
- Data type: fixture/demo only. No real production data, live OTA collection, credentials, cookies, CAPTCHA handling, auth, persistence, billing, or deployment code found in F-007 app source.
- Price basis: fixture rates keep `CNY`, occupancy, meal plan, tax/fee basis, cancellation policy, room type, platform/source, stay date, capture time, source, and sample-size context.
- Pricing automation: UI remains review-oriented. Pricing-sensitive surfaces show `需人工复核`; no automatic pricing or automatic rate-change behavior found.

## Required Reading And Workflow

Read and applied:

- `AGENTS.md`
- `CLAUDE.md`
- `harness-rules.md`
- `evaluator.md`
- `.auto-memory/MEMORY.md`
- `.auto-memory/project-status.md`
- `.auto-memory/superpowers-workflow.md`
- `progress.json`
- `features.json`
- `backlog.json`
- `docs/specs/2026-05-19-production-ui-contract.md`
- `docs/specs/2026-05-19-formal-app-foundation.md`
- `docs/superpowers/plans/2026-05-19-f-007-formal-app-foundation-fixes.md`
- `docs/test-reports/2026-05-19-f-007-formal-app-foundation-evaluator.md`
- `docs/test-reports/2026-05-19-f-007-fix-generator-notes.md`

Superpowers direct handles were not exposed, so local `SKILL.md` fallback was used in the required order:

1. `superpowers:brainstorming`
2. `superpowers:writing-plans`
3. `superpowers:executing-plans`
4. `superpowers:test-driven-development`
5. `superpowers:verification-before-completion`

Evaluator did not modify product code.

## Previous Blocking Findings

The first F-007 Evaluator report rejected final acceptance for:

1. P1 PR readiness: implementation was untracked and generated artifacts were not ignored.
2. P1 screenshot matrix: Playwright used full-page screenshots, producing files larger than declared viewports.
3. P1 `ContextRibbon`: missing `competitorGroup`, `demandContext`, and focusable context controls.
4. P2 raw `rgba(...)` values outside token layer.
5. P2 TDD red/green evidence not independently recorded.

## Reverification Evidence

### Git And PR Readiness

Command: `git branch --show-current`

Result: `feature/f-007-formal-app-foundation`.

Command: `git log --oneline --decorate -6`

Result includes:

- `02af0ea chore: record f-007 fix handoff`
- `fe1384d feat: add formal app foundation`
- `616838c (origin/main, origin/HEAD) chore: initialize repository`

Command: `git status --short`

Result before this Evaluator report was written: clean.

Command: `git status --short --ignored`

Result: only generated/local artifacts were ignored, including `.DS_Store`, `app/dist/`, `app/node_modules/`, `app/test-results/`, generated JS/DTS config outputs, and TypeScript build info.

Command: `git ls-files | rg "(^|/)node_modules/|(^|/)dist/|test-results|playwright-report|\\.tsbuildinfo$|\\.DS_Store$|app/.*\\.config\\.(js|d\\.ts)$"`

Result: exit 1 with no matches. Dependency/build/cache artifacts are not tracked.

Command: `git diff --stat origin/main...HEAD`

Result: 109 files changed, 13887 insertions. The PR diff includes app source, tests, specs, reports, status files, screenshots, and `.gitignore`, without tracked dependency/build/cache artifacts.

Verdict: previous P1 PR-readiness blocker is resolved.

### ContextRibbon Contract

Files reviewed:

- `app/src/components/layout/ContextRibbon.tsx`
- `app/tests/components/contextRibbon.test.tsx`

Evidence:

- `ContextRibbon.tsx:13-20` renders `酒店`, `房型`, `平台`, `入住日期`, `竞品组`, `需求背景`, and `采集时间`.
- `ContextRibbon.tsx:25-40` renders each item as a focusable `button` with an `aria-label`, plus `数据口径 演示数据`.
- `contextRibbon.test.tsx` verifies all labels, `竞品组`, `需求背景`, and first-tab focus.
- `layout.css` includes `.context-ribbon__control:focus-visible` using `--color-focus`.

Verdict: previous P1 `ContextRibbon` blocker is resolved.

### Screenshot Matrix

Files reviewed:

- `app/tests/e2e/app-foundation.spec.ts`
- `docs/test-reports/f-007-app-foundation/*.png`

Evidence:

- `app-foundation.spec.ts:6-18` defines the required screenshot matrix.
- `app-foundation.spec.ts:23-29` reads PNG width/height from the saved file.
- `app-foundation.spec.ts:45-47` captures viewport screenshots and asserts dimensions equal the matrix.

Command: `find docs/test-reports/f-007-app-foundation -maxdepth 1 -type f -name '*.png' -exec file {} \;`

Result: all 12 screenshots match exact expected dimensions:

- `overview-normal--1440x900.png`: 1440 x 900
- `overview-loading--1440x900.png`: 1440 x 900
- `overview-empty--1440x900.png`: 1440 x 900
- `overview-normal--390x844.png`: 390 x 844
- `calendar-detail-open--1440x900.png`: 1440 x 900
- `calendar-detail-open--390x844.png`: 390 x 844
- `market-comparison-platform-bars--1440x900.png`: 1440 x 900
- `market-comparison-platform-bars--390x844.png`: 390 x 844
- `alert-review-drawer-open--1440x900.png`: 1440 x 900
- `alert-review-drawer-open--390x844.png`: 390 x 844
- `setup-data-scope--1280x800.png`: 1280 x 800
- `setup-data-scope--768x1024.png`: 768 x 1024

Verdict: previous P1 screenshot blocker is resolved.

### Token-Layer Compliance

Files reviewed:

- `app/src/styles/tokens.css`
- `app/src/styles/layout.css`
- `app/tests/contract/tokens.test.ts`

Evidence:

- Exact F-006 color tokens are still present in `tokens.css`.
- Overlay, shadow, soft-border, and heatmap alpha values now live in `tokens.css`.
- `layout.css` uses token variables for those values.
- `tokens.test.ts:41-43` asserts `layout.css` does not contain raw `rgba?(` color functions.

Command: `rg -n "rgba?\(" app/src/styles/layout.css`

Result: exit 1, no matches.

Command: `rg -n "#[0-9A-Fa-f]{3,8}" app/src --glob '!**/tokens.css'`

Result: exit 1, no matches.

Verdict: previous P2 raw-color/token-layer issue is resolved.

### TDD Evidence

File reviewed:

- `docs/test-reports/2026-05-19-f-007-fix-generator-notes.md`

Evidence recorded by Generator:

- ContextRibbon contract RED and GREEN.
- Screenshot viewport RED and GREEN.
- Token/raw-color contract RED and GREEN.
- Final verification commands and git/PR hygiene checks.

Evaluator did not replay the historical RED states because doing so would require reverting Generator fixes. The red/green notes are now recorded and auditable as a handoff artifact.

Verdict: previous P2 evidence gap is resolved enough for this slice.

## Fresh Verification Commands

Command: `/opt/homebrew/bin/npm run verify` from `app/`

Result: exit 0.

- Build: Vite built successfully.
- Vitest: 6 test files passed, 23 tests passed.
- Playwright: 13 tests passed, including all 12 screenshot cases and the evidence/human-review marker check.

Command: `python3 scripts/triad_doctor.py`

Result: exit 0. Current branch is `feature/f-007-formal-app-foundation`; Triad doctor reports healthy enough to proceed.

Command: `python3 scripts/test_triad_doctor.py`

Result: exit 0. Smoke test passed.

Command: `python3 -m json.tool progress.json`

Result: exit 0. JSON valid; status is `reverifying`, current sprint is `F-007-formal-app-foundation`.

Command: `python3 -m json.tool features.json`

Result: exit 0. JSON valid; F-007 is `reverifying` with B-020 handoff.

Command: `python3 -m json.tool backlog.json`

Result: exit 0. JSON valid; B-020 is `done`, B-021 is `new`.

Command: `node tests/client_demo_prototype.test.js`

Result: exit 0. Existing prototype regression suite still reports 14 OK checks.

## Acceptance Test Execution Addendum

This B-021 acceptance-test pass was re-run after the Generator handoff confirmation.

Command: `/opt/homebrew/bin/npm run verify` from `app/`

Result: exit 0.

- Production build: passed; Vite emitted `dist/index.html`, CSS, and JS bundle.
- Vitest: 6 test files passed, 23 tests passed.
- Playwright: 13 tests passed, including the 12 screenshot matrix cases and the evidence/human-review marker case.

Command group from repository root:

- `python3 scripts/triad_doctor.py`: exit 0; branch is `feature/f-007-formal-app-foundation`.
- `python3 scripts/test_triad_doctor.py`: exit 0.
- `python3 -m json.tool progress.json`: exit 0.
- `python3 -m json.tool features.json`: exit 0.
- `python3 -m json.tool backlog.json`: exit 0.
- `node tests/client_demo_prototype.test.js`: exit 0; 14 OK checks.

Additional acceptance checks:

- `find docs/test-reports/f-007-app-foundation -maxdepth 1 -type f -name '*.png' | wc -l`: 12.
- `find docs/test-reports/f-007-app-foundation -maxdepth 1 -type f -name '*.png' -exec file {} \;`: all 12 PNG files match the required matrix dimensions.
- `rg -n "rgba?\(" app/src/styles/layout.css`: exit 1, no raw `rgba(...)` remains in `layout.css`.
- `rg -n "#[0-9A-Fa-f]{3,8}" app/src --glob '!**/tokens.css'`: exit 1, no raw hex color remains in app source outside `tokens.css`.
- `rg -n "prototypes/client-demo|client-demo/styles.css" app/src app/tests app/package.json app/index.html`: exit 1, formal app does not import prototype CSS.
- `git ls-files | rg "(^|/)node_modules/|(^|/)dist/|test-results|playwright-report|\\.tsbuildinfo$|\\.DS_Store$|app/.*\\.config\\.(js|d\\.ts)$"`: exit 1, generated artifacts are not tracked.
- `rg -n "fetch\\(|XMLHttpRequest|axios|localStorage|sessionStorage|document\\.cookie|api[_-]?key|secret|password|captcha|scrap|crawler|爬虫|抓取|自动调价|自动改价" app/src app/package.json`: exit 1, no live collection, credential, browser storage, scraping, CAPTCHA, or automatic-pricing entry point was found in product source.

## Remaining Risks

- This report is a new Evaluator artifact and is not part of commits `fe1384d` or `02af0ea` unless it is staged and committed after review.
- F-001 domain-core carryovers remain future work: unavailable-source modeling and `hotel_id + rate_key` isolation for competitor movement. They are outside F-007 app-foundation scope.
- F-002/F-003 still show `verifying` in `features.json`; F-007 can be accepted as the formal app foundation without resolving those older prototype status items.

## Verdict

F-007 is accepted after B-020 fixes.

The previous P1 blockers are resolved:

- PR-readiness and `.gitignore` hygiene are now acceptable.
- Screenshot artifacts now match exact viewport dimensions and have automated PNG dimension assertions.
- `ContextRibbon` now includes competitor group, demand context, and focusable read-only controls.

The P2 follow-ups are also resolved for this slice:

- raw visual colors were moved into the token layer;
- fix-specific red/green evidence is recorded.

Recommendation: mark B-021 `done`, move `F-007-formal-app-foundation` to `done`, and keep the current feature branch for PR review rather than pushing to `main` / `master`.
