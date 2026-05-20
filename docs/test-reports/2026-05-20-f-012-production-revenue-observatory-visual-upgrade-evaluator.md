# F-012 Evaluator Verification Report

Date: 2026-05-20

Feature: `F-012-production-revenue-observatory-visual-upgrade`

Backlog item: `B-044`

Role: Evaluator-Codex

## Verdict

Accepted for visual-system coverage, responsive behavior, chart semantic preservation, and data-boundary safety.

F-012 applies the Revenue Observatory visual system globally across Overview, Calendar, Market Comparison, Alert Review, and Setup/Data Scope. The implementation keeps accepted F-008/F-009/F-010/F-011 business semantics intact: no domain alert math changes, no dataset semantic changes, no live collection, no persistence, no credentials, and no automatic pricing behavior.

PR preparation is not immediately clean against `origin/main`: the branch is ahead by 19 commits because it includes F-010 and F-011 dependency commits plus F-012. B-045 must rebase or wait until F-010/F-011 are reflected in the base branch so the F-012 PR contains only visual-system changes.

## Required Workflow

Superpowers sequence followed in order:

1. `superpowers:brainstorming`
2. `superpowers:writing-plans`
3. `superpowers:executing-plans`
4. `superpowers:test-driven-development`
5. `superpowers:verification-before-completion`

Required project context reviewed:

- `.auto-memory/MEMORY.md`
- `.auto-memory/project-status.md`
- `.auto-memory/superpowers-workflow.md`
- `.auto-memory/role-context/evaluator.md`
- `progress.json`
- `features.json`
- `backlog.json`
- `evaluator.md`
- `CLAUDE.md`
- `harness-rules.md`
- `docs/specs/2026-05-20-production-revenue-observatory-visual-upgrade.md`
- `docs/superpowers/plans/2026-05-20-production-revenue-observatory-visual-upgrade.md`
- `docs/test-reports/2026-05-20-f-012-generator-notes.md`

## Domain Classification

- Affected domains: reporting UI, chart visualization, alert review presentation, setup/data-scope presentation.
- Data binding: fixture/manual demo data only.
- Preserved boundaries: hotel/property, competitor group, platform/source, stay date, room type, occupancy, meal plan, cancellation policy, tax/fee basis, currency, capture time, freshness, evidence, and human-review requirement.
- Out-of-scope behavior confirmed absent: live OTA collection, browser automation, file upload, backend route, persistence, migration, credentials, cookies, CAPTCHA handling, storage, recommended prices, and automatic pricing actions.

## Independent Evaluator Checks

Temporary Playwright evaluator spec:

```bash
./node_modules/.bin/playwright test tests/e2e/f012-evaluator-observatory.tmp.spec.ts --config playwright.config.ts
```

Result after fixing two evaluator-probe strict-locator issues: `7 passed`.

The temporary spec verified:

- all five screens expose `.app-shell[data-visual-system="revenue-observatory"]` and `.observatory-screen`;
- all five screens have no horizontal overflow at `390x844`;
- visible text avoids unsafe collection and pricing-action terms;
- `2048x1352` desktop uses the `2000px` observatory shell target;
- trend segments and missing-data copy remain visible;
- calendar unavailable samples remain explicit;
- market zero-gap marker and coverage copy remain visible;
- alert human-review and capture-time markers remain visible;
- setup production connection remains closed and human-review copy remains visible.

The temporary spec was removed after the run and was not retained as a product-code change.

Static checks:

```bash
rg -n "rgba\(|#[0-9a-fA-F]{3,8}" app/src/styles/layout.css
```

Result: no matches. F-012 raw color functions remain in `tokens.css`, while `layout.css` uses variables.

```bash
rg -n "(cookie|token|credential|captcha|scrap|scrape|crawler|puppeteer|playwright|fetch\(|XMLHttpRequest|axios|localStorage|sessionStorage|IndexedDB|automatic pricing|auto[- ]?price|recommendedPriceCents|recommendedPrice|自动调价|自动改价|爬虫|抓取|验证码|凭证|密钥|自动定价)" app/src/components app/src/screens app/src/styles app/src/types app/src/data app/src/domain
```

Result: no matches.

Screenshot dimensions:

- all five `*-observatory--2048x1352.png` artifacts are exactly `2048 x 1352`;
- mobile `390 x 844` artifacts retain exact dimensions;
- setup tablet artifact remains `768 x 1024`.

## Project Verification Evidence

Targeted visual regression:

```bash
/opt/homebrew/bin/npm test -- tests/contract/tokens.test.ts tests/components/revenueObservatoryScreens.test.tsx tests/components/charts.test.tsx tests/components/setupDataScopeScreen.test.tsx
```

Result: `4 files / 12 tests` passed.

Domain/data regression:

```bash
/opt/homebrew/bin/npm test -- tests/contract/demoDataset.test.ts tests/data/domainDrivenDataset.test.ts tests/domain
```

Result: `7 files / 45 tests` passed.

Full app verification:

```bash
/opt/homebrew/bin/npm run verify
```

Result: build passed, Vitest `14 files / 71 tests` passed, Playwright `18 tests` passed.

Project-level checks:

```bash
python3 scripts/triad_doctor.py
python3 scripts/test_triad_doctor.py
python3 -m json.tool progress.json
python3 -m json.tool features.json
python3 -m json.tool backlog.json
node tests/client_demo_prototype.test.js
```

Result: all passed. Prototype regression reported `14` checks passed.

## PR Hygiene

Functional branch review:

- Branch: `feature/f-012-production-revenue-observatory-visual-upgrade-planning`
- Working tree before the Evaluator report/status update: clean.
- `git diff feature/f-011-data-scope-capture-entry-planning..HEAD --name-only` is bounded to F-012 visual-system files, tests, screenshots, docs, and status files.
- `git diff origin/main...HEAD --name-only` includes F-010 and F-011 because local `origin/main` still does not contain those accepted dependencies.
- Branch is ahead of `origin/main` by `19` commits.
- `git ls-files` found no tracked `node_modules`, `dist`, `test-results`, Playwright report, `.tsbuildinfo`, `.DS_Store`, or generated Vite/Playwright config artifacts.
- `git status --short --ignored` shows only ignored local/generated artifacts.

## Acceptance Criteria Status

- AC1 global Revenue Observatory app shell and accessible nav/context controls: pass.
- AC2 token contract includes measurable observatory tokens and layout has no raw color functions: pass.
- AC3 Overview, Calendar, Market, Alerts, and Setup expose observatory primitives: pass.
- AC4 chart schemas and missing/unavailable semantics are preserved: pass.
- AC5 required screenshots exist and match exact dimensions: pass.
- AC6 `2048x1352` desktop uses a wide observatory canvas: pass.
- AC7 `390x844` mobile has no horizontal overflow in independent and native Playwright gates: pass.
- AC8 visible copy keeps demo/human-review framing and avoids unsafe collection/pricing language: pass.
- AC9 F-008/F-009/F-010/F-011 domain/data/setup regressions continue to pass: pass.
- AC10 no new dependencies, backend routes, persistence, real collection, or pricing automation: pass.

## Handoff

F-012 is accepted for B-045 PR preparation, with one explicit prerequisite:

1. Rebase or wait until F-010 and F-011 are reflected in the PR base so the F-012 PR is bounded to Revenue Observatory visual-system changes.
