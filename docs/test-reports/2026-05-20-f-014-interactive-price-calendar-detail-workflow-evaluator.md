# F-014 Evaluator Verification Report

Date: 2026-05-20

Feature: `F-014-interactive-price-calendar-detail-workflow`

Backlog item: `B-051`

Role: Evaluator-Codex

## Verdict

Accepted for product behavior, data-boundary coverage, unavailable-date safety, responsive interaction, and human-review-only pricing workflow.

F-014 adds the calendar date-detail contract and interactive Calendar workflow without changing accepted F-008 alert math or adding live collection, backend persistence, credentials, storage, recommended pricing, or automatic pricing actions. The implementation derives detail rows from fixture/manual demo data, keeps property/channel/date/currency/rate-basis boundaries visible, and correctly treats unavailable dates as missing comparable samples instead of pseudo prices.

PR preparation needs one hygiene step: this branch is cleanly bounded relative to the accepted F-013 branch, but a PR directly against `main` would also include F-013 documentation commits. B-052 should base the PR on F-013 or wait until F-013 is reflected in the target base so the final PR is bounded.

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
- `docs/specs/2026-05-20-interactive-price-calendar-detail-workflow.md`
- `docs/superpowers/plans/2026-05-20-interactive-price-calendar-detail-workflow.md`
- `docs/test-reports/2026-05-20-f-014-generator-notes.md`

## Domain Classification

- Affected domains: reporting UI, price calendar, pricing comparison presentation, evidence display.
- Data binding: fixture/manual demo data only.
- Boundary type: property-bound and date-bound details, competitor/platform rows, channel/source evidence, CNY currency, room type, occupancy, meal plan, tax/fee basis, cancellation policy, capture time, stale/missing sample handling, and human review requirement.
- Preserved non-goals: no live OTA collection, no browser automation, no backend route, no persistence, no credentials/cookies/sessions/CAPTCHA, no file upload, no recommended price, and no automatic pricing.

## Independent Evaluator Checks

Temporary Evaluator Vitest probe:

```bash
PATH=/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin /opt/homebrew/bin/npm --prefix app test -- tests/f014-evaluator.tmp.test.tsx
```

Result: `1 file / 3 tests` passed. The temporary probe was removed after the run.

The temporary probe verified:

- every `heatmap.days` date has a matching `calendarDetails.byDate` detail;
- every detail keeps `CNY`, rate basis, platform gaps, evidence markers, capture time/sample metadata, and `humanReviewRequired: true`;
- `2026-05-27` unavailable detail keeps owner/core/gap as `null`, sample size `0`, platform rows as `missing-sample`, and evidence confidence as unavailable;
- clicking from an available date to an unavailable date updates the detail panel and does not render `CNY null` or `CNY 0` as a pseudo price.

Static product safety scans:

```bash
rg -n "(fetch\(|XMLHttpRequest|axios|puppeteer|crawler|scrap|scrape|cookie|credential|api[_-]?key|localStorage|sessionStorage|indexedDB)" app/src
rg -n "(推荐价格|建议价格|自动定价|自动调价|自动改价|recommendedPrice|recommended price|auto[- ]?pricing|automatic pricing|pricing action)" app/src
```

Result: no matches.

Screenshot dimensions:

- `calendar-detail-open--1440x900.png`: `1440 x 900`
- `calendar-detail-open--390x844.png`: `390 x 844`
- `calendar-observatory--2048x1352.png`: `2048 x 1352`

## Project Verification Evidence

Targeted F-014 regression:

```bash
PATH=/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin /opt/homebrew/bin/npm --prefix app test -- tests/data/domainDrivenDataset.test.ts tests/components/charts.test.tsx tests/components/calendarScreen.test.tsx
```

Result: `3 files / 20 tests` passed.

Full app verification:

```bash
PATH=/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin /opt/homebrew/bin/npm --prefix app run verify
```

Result: production build passed, Vitest `15 files / 76 tests` passed, Playwright `19 tests` passed. Playwright required elevated local permission to bind `127.0.0.1`; the first sandboxed run reached build and Vitest successfully, then failed only at dev-server port binding.

Project-level checks:

```bash
python3 scripts/triad_doctor.py
python3 scripts/test_triad_doctor.py
python3 -m json.tool progress.json
python3 -m json.tool features.json
python3 -m json.tool backlog.json
/opt/homebrew/bin/node tests/client_demo_prototype.test.js
git diff --check
```

Result: all passed. Prototype regression reported `14` checks passed.

Project-doc freshness:

- `docs/specs/PROJECT_PRD.md` now records F-014 as accepted and pending B-052 PR preparation.
- `docs/specs/PROJECT_DEVELOPMENT_PLAN.md` now records F-014 as accepted, identifies B-052 as the immediate next step, and points the next planning slice to F-015 alert review workflow depth.

## PR Hygiene

Functional branch review:

- Branch: `feature/f-014-interactive-price-calendar-detail-workflow-planning`
- Working tree before report/status update: clean.
- `git diff feature/f-013-project-prd-roadmap-maintenance..HEAD --name-only` is bounded to F-014 app files, tests, screenshots, docs, and status files.
- `git diff feature/f-013-project-prd-roadmap-maintenance..HEAD app/src/domain/pricing --name-only` has no output; F-008 domain pricing math was not changed.
- `git diff main...HEAD --name-only` includes accepted F-013 documentation files because local `main` is still at PR #8 / F-012.
- Branch is ahead of `main` by `9` commits.
- `git ls-files app/node_modules app/dist app/test-results app/playwright-report app/tsconfig.tsbuildinfo .DS_Store` has no output; generated artifacts are not tracked.

## Acceptance Criteria Status

- `CalendarDayDetail` and `calendarDetails.byDate` exist in the app contract: pass.
- Every heatmap date has a date detail: pass.
- `2026-05-31` and other available dates expose platform gaps, evidence, capture time, sample count, rate basis, event impact, and human-review markers: pass.
- `2026-05-27` unavailable date renders missing-sample state without `CNY null` or `CNY 0`: pass.
- `CalendarHeatmap` exposes selected date state and click callback: pass.
- `CalendarScreen` uses local selected-date state and updates detail content on click: pass.
- Mobile date-click workflow has Playwright no-overflow coverage: pass.
- Source, platform, date, currency, tax/fee, room type, occupancy, meal plan, cancellation policy, and sample boundaries remain visible: pass.
- No live collection, persistence, credentials, storage, recommended price, automatic pricing, or F-008 alert-math change: pass.
- App, Triad, JSON, prototype, screenshot-dimension, and diff checks pass: pass.
- Project PRD and development plan freshness after F-014 acceptance: pass.

## Handoff

F-014 is accepted for B-052 PR preparation.

B-052 should ensure the PR is bounded by either targeting/basing on the accepted F-013 branch or waiting until F-013 is in the target base. Do not push directly to `main` or `master`.
