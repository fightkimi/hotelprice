# F-009 Reverification Report

Date: 2026-05-19

Feature: `F-009-domain-driven-ui-data-flow`

Backlog item: `B-033`

Role: Evaluator-Codex

## Verdict

Accepted.

B-031 P1 is closed. F-009 now normalizes snapshots through F-008 `markStaleSnapshots(seed.snapshots, seed.now)` before building all UI view models, so stale available-looking samples no longer render as usable trend, heatmap, or platform-gap prices.

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
- `progress.json`
- `features.json`
- `backlog.json`
- `evaluator.md`
- `CLAUDE.md`
- `harness-rules.md`
- `docs/specs/2026-05-19-domain-driven-ui-data-flow.md`
- `docs/superpowers/plans/2026-05-19-domain-driven-ui-data-flow.md`
- `docs/test-reports/2026-05-19-f-009-domain-driven-ui-data-flow-evaluator.md`
- `docs/test-reports/2026-05-19-f-009-fix-generator-notes.md`

## B-031 Regression Recheck

Code review confirmed `buildDomainDrivenDemoDataset()` now creates a normalized seed and passes it into every adapter path:

- `generateAlertCandidates({ snapshots: normalizedSeed.snapshots })`
- `buildTrend(normalizedSeed)`
- `buildHeatmap(normalizedSeed)`
- `buildPlatformGaps(normalizedSeed)`
- `mapAlertToSignal(normalizedSeed, alert)`

Independent Evaluator test:

```bash
/Users/kimi/Documents/Codex/【项目】/【酒店定价捕捉】/app/node_modules/.bin/vitest run --root /private/tmp f009-evaluator-stale-reverify.test.ts
```

Result: `1 file / 1 test` passed.

The test made `owner-0524-ctrip-latest` and `owner-0531-ctrip-latest` older than 36 hours. Verified behavior:

- owner trend point for `2026-05-24` is `null`;
- heatmap day for `2026-05-24` is `status: "unavailable"` with null price fields and `sampleSize: 0`;
- stale `携程演示源` owner row is excluded from platform gaps.

Permanent regression test:

```bash
/opt/homebrew/bin/npm test -- tests/data/domainDrivenDataset.test.ts
```

Result: `1 file / 8 tests` passed.

## Verification Evidence

Targeted F-009/F-008 regression:

```bash
/opt/homebrew/bin/npm test -- tests/data/domainDrivenDataset.test.ts tests/contract/demoDataset.test.ts tests/domain
```

Result: `7 files / 39 tests` passed.

Full app verification:

```bash
/opt/homebrew/bin/npm run verify
```

Result: build passed, Vitest `12 files / 59 tests` passed, Playwright `13 tests` passed.

Project-level checks:

```bash
python3 scripts/triad_doctor.py
python3 scripts/test_triad_doctor.py
python3 -m json.tool progress.json
python3 -m json.tool features.json
python3 -m json.tool backlog.json
node tests/client_demo_prototype.test.js
```

Result: all passed.

Screenshot artifact dimensions:

- desktop captures remain `1440 x 900` or `1280 x 800` as specified;
- mobile/tablet captures remain `390 x 844` or `768 x 1024` as specified;
- all 12 PNG files in `docs/test-reports/f-007-app-foundation/` report expected dimensions.

Static safety scan:

```bash
rg -n "(cookie|token|credential|captcha|scrap|scrape|crawler|puppeteer|playwright|fetch\(|localStorage|sessionStorage|IndexedDB|automatic pricing|auto[- ]?price|自动调价|自动改价|爬虫|抓取|验证码|凭证|密钥)" app/src/data/domainSeed.ts app/src/data/domainDrivenDataset.ts app/src/data/demoDataset.ts app/src/domain/pricing
```

Result: no matches.

## PR Readiness

Before this report was written:

- Branch: `feature/f-009-domain-driven-ui-planning`
- Ahead of `origin/main`: `2` commits
- Commits:
  - `068e93c feat: connect domain core to app dataset`
  - `1179e30 fix: normalize stale snapshots for ui dataset`
- `git status --short`: clean
- `git ls-files` found no tracked `node_modules`, `dist`, `test-results`, Playwright report, `.tsbuildinfo`, `.DS_Store`, or generated Vite/Playwright config artifacts.
- `git status --short --ignored` showed only ignored local/generated artifacts.

## Acceptance Criteria Status

- AC1 domain-driven `DemoDataset`: pass.
- AC2 pricing-sensitive signals depend on `generateAlertCandidates`: pass.
- AC3 all generated pricing-sensitive signals require human review: pass.
- AC4 unavailable/no-rate/source-error/stale become missing UI states: pass after B-032.
- AC5 comparable trend/heatmap/platform boundaries preserved: pass.
- AC6 platform gaps derived from domain snapshots with coverage: pass, including stale owner exclusion.
- AC7 F-007 visible-copy, contrast, component, screenshot, and full app gates: pass.
- AC8 F-008 domain tests: pass.
- AC9 static no-live-collection/no-credential/no-automation scan: pass.
- AC10 B-027 non-blocking: pass; keep B-027 open as a separate follow-up.

## Handoff

F-009 is accepted for PR preparation. B-027 owner-position evidence enrichment remains open and non-blocking.
