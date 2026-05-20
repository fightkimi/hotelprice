# F-011 Generator Notes

Feature: `F-011-data-scope-capture-entry`

Role: Generator

Branch: `feature/f-011-data-scope-capture-entry-planning`

## Scope

Implemented the approved F-011 slice only:

- added typed `dataScope` and `captureEntry` contracts to `DemoDataset`;
- derived scope boundaries from `domainSeed` through a pure helper;
- rendered data scope and capture-entry preview in the existing Setup/Data Scope screen;
- migrated the H5 `Revenue Observatory` visual language into the formal Setup/Data Scope surface through token-layer styling, glass panels, precision grid, scope map, and signal rail treatment;
- kept production connection disabled;
- kept every capture entry review-gated;
- updated setup screenshot artifacts.

No live OTA collection, backend route, persistence, file upload, credential handling, cookies, CAPTCHA handling, browser automation, network connector, recommended price, or automatic pricing behavior was added.

The H5 visual-upgrade files under `prototypes/client-demo/`, `tests/client_demo_prototype.test.js`, `docs/design/`, and H5 screenshot artifacts were used only as visual reference and were not staged or committed by this Generator pass.

## TDD Evidence

### Dataset Contract And Adapter

Red:

```bash
cd app
/opt/homebrew/bin/npm test -- tests/contract/demoDataset.test.ts tests/data/domainDrivenDataset.test.ts
```

Result: failed as expected because `dataScope` and `captureEntry` were missing. The run reported `2 failed` files, with `3 failed | 14 passed` tests.

Green:

```bash
cd app
/opt/homebrew/bin/npm test -- tests/contract/demoDataset.test.ts tests/data/domainDrivenDataset.test.ts
```

Result: passed, `2 files / 17 tests`.

Commit: `f15bbe2 feat: add data scope and capture entry contract`

### Setup Screen

Red:

```bash
cd app
/opt/homebrew/bin/npm test -- tests/components/setupDataScopeScreen.test.tsx
```

Result: failed as expected because the current static setup screen did not render the `数据范围` and `采集入口` headings.

Green:

```bash
cd app
/opt/homebrew/bin/npm test -- tests/components/setupDataScopeScreen.test.tsx
```

Result: passed, `1 file / 1 test`.

Commits:

- `9d231b7 feat: render data scope capture entry`
- `a47c39e feat: polish data scope capture preview`

### Revenue Observatory Visual Contract

Red:

```bash
cd app
/opt/homebrew/bin/npm test -- tests/components/setupDataScopeScreen.test.tsx tests/contract/tokens.test.ts
```

Result: failed as expected because the formal Setup/Data Scope screen did not expose the `Revenue Observatory` visual system structure and token-layer variables.

Green:

```bash
cd app
/opt/homebrew/bin/npm test -- tests/components/setupDataScopeScreen.test.tsx tests/contract/tokens.test.ts
```

Result: passed, `2 files / 6 tests`.

Commit: `483bea6 feat: apply revenue observatory setup styling`

## Verification

Targeted regression:

```bash
cd app
/opt/homebrew/bin/npm test -- tests/components/setupDataScopeScreen.test.tsx tests/contract/tokens.test.ts tests/contract/demoDataset.test.ts tests/data/domainDrivenDataset.test.ts tests/domain/complianceScan.test.ts
```

Result: passed, `5 files / 24 tests`.

Full app verification:

```bash
cd app
/opt/homebrew/bin/npm run verify
```

Result: first non-escalated run passed build and Vitest but failed when Playwright could not bind `127.0.0.1` under the sandbox. The escalated rerun passed before the visual migration: build passed, Vitest passed with `13 files / 66 tests`, and Playwright passed with `13 tests`.

After the Revenue Observatory visual migration, the escalated rerun passed again: build passed, Vitest passed with `13 files / 68 tests`, and Playwright passed with `13 tests`.

Project checks:

```bash
python3 scripts/triad_doctor.py
python3 scripts/test_triad_doctor.py
python3 -m json.tool progress.json
python3 -m json.tool features.json
python3 -m json.tool backlog.json
node tests/client_demo_prototype.test.js
```

Result: all passed after the Revenue Observatory visual migration and handoff state refresh. Prototype regression passed with `15 checks` against the current H5 working tree.

Static safety scan:

```bash
rg -n "(cookie|token|credential|captcha|scrap|scrape|crawler|puppeteer|playwright|fetch\\(|XMLHttpRequest|axios|localStorage|sessionStorage|IndexedDB|automatic pricing|auto[- ]?price|recommendedPriceCents|recommendedPrice|自动调价|自动改价|爬虫|抓取|验证码|凭证|密钥)" app/src/data/dataScope.ts app/src/data/domainDrivenDataset.ts app/src/screens/SetupDataScopeScreen.tsx app/src/types/contracts.ts
```

Result: no matches.

Visual migration safety scan:

```bash
rg -n "(cookie|token|credential|captcha|scrap|scrape|crawler|puppeteer|playwright|fetch\\(|XMLHttpRequest|axios|localStorage|sessionStorage|IndexedDB|automatic pricing|auto[- ]?price|recommendedPriceCents|recommendedPrice|自动调价|自动改价|爬虫|抓取|验证码|凭证|密钥)" app/src/styles/tokens.css app/src/styles/layout.css app/src/screens/SetupDataScopeScreen.tsx app/src/types/contracts.ts
```

Result: no matches.

## Screenshot Artifacts

Updated by Playwright after the Revenue Observatory visual migration:

- `docs/test-reports/f-007-app-foundation/setup-data-scope--1280x800.png`
- `docs/test-reports/f-007-app-foundation/setup-data-scope--768x1024.png`

## Handoff

F-011 is ready for Evaluator verification through `B-040`. This is not a final acceptance conclusion.

PR dependency: this branch is based on the accepted F-010 branch while PR #4 is still open in local status. Before preparing the F-011 PR, rebase after F-010 is merged or wait until `main` includes F-010.
