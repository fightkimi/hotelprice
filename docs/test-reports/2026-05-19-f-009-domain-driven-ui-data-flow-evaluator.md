# F-009 Evaluator Verification Report

Date: 2026-05-19

Feature: `F-009-domain-driven-ui-data-flow`

Backlog item: `B-031`

Role: Evaluator-Codex

## Verdict

Not accepted. Move F-009 back to fixing.

The normal project gates pass, but an independent Evaluator boundary test found a P1 stale-data regression: an available-looking snapshot older than the F-008 36-hour freshness window is still rendered as a real UI price in the trend data instead of becoming `null` / unavailable.

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
- `docs/test-reports/2026-05-19-f-009-generator-notes.md`

## Domain Classification

- Affected domains: reporting, pricing comparison, alerting, setup/data scope, UI data transformation.
- Data scope: fixture/manual seed data only.
- Boundaries under review: owner hotel, core competitors, channels/sources, stay dates, room type, occupancy, meal plan, cancellation policy, tax/fee basis, currency, capture time, and availability status.
- Pricing automation: review-only. No automatic pricing or recommended new price behavior observed.

## Findings

### P1: Stale snapshots can appear as live UI prices

F-009 requires unavailable, no-rate, source-error, and stale snapshots to become missing UI states rather than zero-priced or usable price points. The adapter satisfies this for explicit unavailable/no-rate/source-error fixture rows, but not for freshness-derived stale rows.

Code evidence:

- `app/src/domain/pricing/availability.ts` marks snapshots older than 36 hours as `availabilityStatus: "stale"` and clears `priceCents`.
- `app/src/domain/pricing/alertRules.ts` applies `markStaleSnapshots(input.snapshots, input.now)` inside `generateAlertCandidates`.
- `app/src/data/domainDrivenDataset.ts` only sends raw snapshots through `generateAlertCandidates` for `signals`.
- The chart paths call `buildTrend(seed)`, `buildHeatmap(seed)`, and `buildPlatformGaps(seed)` with the original raw seed snapshots.
- `latestAlertable()` uses `isAlertableSnapshot(latest)` directly, so an old sample with `availabilityStatus: "available"` and positive `priceCents` remains usable in the UI adapter.

Independent failing test:

```bash
/Users/kimi/Documents/Codex/【项目】/【酒店定价捕捉】/app/node_modules/.bin/vitest run --root /private/tmp f009-evaluator-stale-boundary.test.ts
```

Result:

```text
FAIL f009-evaluator-stale-boundary.test.ts
expected 528 to be null
```

The temporary test changed `owner-0524-ctrip-latest` to `capturedAt: 2026-05-17T20:00:00.000Z` while `seed.now` remains `2026-05-19T09:30:00.000Z`. That sample is older than 36 hours. Expected UI output:

- owner trend point for `2026-05-24`: `value: null`
- heatmap day for `2026-05-24`: `status: "unavailable"`, `intensity: null`, `ownerRate: null`, `coreAverage: null`, `sampleSize: 0`

Actual output:

- owner trend point for `2026-05-24`: `value: 528`

Risk:

The formal UI can display a stale owner/platform/date/room-rate sample as a current usable price. That breaks the F-008 freshness boundary and the F-009 missing-data acceptance criterion.

Required fix:

- Normalize snapshots through F-008 freshness logic before building UI view models, for example by applying `markStaleSnapshots(seed.snapshots, seed.now)` once and using the normalized snapshots consistently for signals, trend, heatmap, platform gaps, and sample counts.
- Add a permanent F-009 test with a stale available-looking snapshot proving trend and heatmap output become missing UI states.
- Re-run the F-009 targeted tests, full app verification, Triad/JSON/prototype checks, and this stale boundary scenario.

## Accepted Evidence

The following checks passed:

```bash
/opt/homebrew/bin/npm test -- tests/data/domainDrivenDataset.test.ts tests/contract/demoDataset.test.ts tests/domain
```

Result: Vitest `7 files / 38 tests` passed.

```bash
/opt/homebrew/bin/npm run verify
```

Result after sandbox escalation for local Playwright server: build passed, Vitest `12 files / 58 tests` passed, Playwright `13 tests` passed.

```bash
python3 scripts/triad_doctor.py
python3 scripts/test_triad_doctor.py
python3 -m json.tool progress.json
python3 -m json.tool features.json
python3 -m json.tool backlog.json
node tests/client_demo_prototype.test.js
```

Result: all passed.

Static safety scan over the new data-flow/domain layer found no live collection, credential, cookie, CAPTCHA, browser automation, storage, or automatic-pricing patterns.

PR hygiene before this report was written:

- Branch: `feature/f-009-domain-driven-ui-planning`
- Ahead of `origin/main`: `1` commit
- Commit: `068e93c feat: connect domain core to app dataset`
- `git status --short`: clean
- Ignored generated files only: `.DS_Store`, `app/dist/`, `app/node_modules/`, Playwright/test/TS build artifacts.

## Acceptance Criteria Status

- AC1 domain-driven `DemoDataset`: pass.
- AC2 pricing-sensitive signals depend on `generateAlertCandidates`: code pass; test coverage is shape-based and should be strengthened if touching this area.
- AC3 all generated pricing-sensitive signals require human review: pass.
- AC4 unavailable/no-rate/source-error/stale become missing UI states: fail due stale regression.
- AC5 comparable trend/heatmap/platform boundaries preserved: pass for available and explicit unavailable fixtures.
- AC6 platform gaps derived from domain snapshots with coverage: pass, but stale normalization should also apply there.
- AC7 F-007 visible-copy, contrast, component, screenshot, and full app gates: pass.
- AC8 F-008 domain tests: pass.
- AC9 static no-live-collection/no-credential/no-automation scan: pass.
- AC10 B-027 non-blocking: pass; keep B-027 open as follow-up.

## Handoff

Return to Generator for a focused fix. B-027 owner-position evidence enrichment remains non-blocking and should not block this F-009 fix unless explicitly split into a separate accepted slice.
