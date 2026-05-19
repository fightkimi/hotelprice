# F-008 Domain Core Rate Boundaries Reverification Report

Date: 2026-05-19
Role: Evaluator-Codex
Feature: `F-008-domain-core-rate-boundaries`
Backlog item: `B-026`
Status recommendation: `done`

## Scope Classification

- Affected domains: hotel/property profile, competitor set, channel/source boundary, rate normalization, pricing comparison, alerting, and report evidence.
- Data binding: owner property, hotel id, competitor group, channel/source, stay date, checkout date, currency, occupancy, room type, meal plan, cancellation policy, tax/fee basis, capture time, and availability status remain explicit.
- Data type: fixture/manual/approved-api contract only. No real production data, live OTA collection, credentials, browser automation, persistence, auth, or network connector was found in F-008 source.
- Pricing automation: output remains alert candidates only. Alerts require human review and do not include a recommended new price or automatic rate-change action.

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
- `docs/specs/2026-05-19-domain-core-rate-boundaries.md`
- `docs/superpowers/plans/2026-05-19-domain-core-rate-boundaries.md`
- `docs/test-reports/2026-05-19-f-008-domain-core-rate-boundaries-evaluator.md`
- `docs/test-reports/2026-05-19-f-008-fix-generator-notes.md`

Superpowers direct handles were not exposed, so local `SKILL.md` fallback was used in the required order:

1. `superpowers:brainstorming`
2. `superpowers:writing-plans`
3. `superpowers:executing-plans`
4. `superpowers:test-driven-development`
5. `superpowers:verification-before-completion`

Evaluator did not modify product code. A temporary supplementary verification test was written under `/private/tmp/f008-reverification-boundary.test.ts` and is not part of the repository.

## B-024 P1 Reverification

Previous P1:

- `available -> unavailable/no_rate/source_error -> available` for the same `hotelId + comparableRateKey` returned no competitor movement alert.

Implementation reviewed:

- `app/src/domain/pricing/alertRules.ts:63-77` now selects a competitor movement pair by first requiring the latest overall capture to be alertable/available, then scanning backward for the prior alertable available capture.
- `app/src/domain/pricing/alertRules.ts:79-126` still groups competitor movement by `hotelId + comparableRateKey`.
- `app/tests/domain/alertRules.test.ts:100-120` covers all three intermittent states: `unavailable`, `no_rate`, and `source_error`.
- `app/tests/domain/alertRules.test.ts:86-98` confirms latest unavailable capture suppresses movement.

Supplementary Evaluator test:

Command: `/opt/homebrew/bin/npm exec -- vitest --root /private/tmp run f008-reverification-boundary.test.ts`

Result: exit 0.

- 1 file passed.
- 6 tests passed.
- Covered all three intermittent states and all three latest-overall unavailable states.

Verdict: B-024 P1 is closed.

## Fresh Verification Evidence

Command: `/opt/homebrew/bin/npm test -- tests/domain/alertRules.test.ts` from `app/`

Result: exit 0.

- 1 file passed.
- 10 tests passed.

Command: `/opt/homebrew/bin/npm test -- tests/domain` from `app/`

Result: exit 0.

- 5 files passed.
- 26 tests passed.

Command: `/opt/homebrew/bin/npm run verify` from `app/`

Result: exit 0.

- Build: `tsc -b && vite build` passed.
- Vitest full suite: 11 files passed, 49 tests passed.
- Playwright screenshot gate: 13 tests passed.

Command group from repository root:

- `python3 scripts/triad_doctor.py`: exit 0; current branch is `feature/f-008-domain-core-planning`.
- `python3 scripts/test_triad_doctor.py`: exit 0.
- `python3 -m json.tool progress.json`: exit 0.
- `python3 -m json.tool features.json`: exit 0.
- `python3 -m json.tool backlog.json`: exit 0.
- `node tests/client_demo_prototype.test.js`: exit 0; 14 OK checks.

Static safety and PR-readiness checks:

- `git rev-list --count origin/main..HEAD`: `8`.
- `git log --oneline origin/main..HEAD`: all 8 commits are F-008 implementation, tests, handoff, or fix commits.
- `git diff --name-only origin/main...HEAD`: limited to F-008 domain files, domain tests, F-008 specs/plans/reports, and status/memory files.
- `git diff --name-only origin/main...HEAD | rg "^(app/src/App.tsx|app/src/screens/|app/src/components/|app/src/data/demoDataset.ts|app/tests/e2e/app-foundation.spec.ts|app/package|app/playwright|app/vite|app/tsconfig)"`: exit 1, so F-007 UI, demo dataset, package config, and E2E config were not changed.
- `git status --short`: clean before this report was written.
- `git status --short --ignored`: only local/generated artifacts are ignored, including `app/dist/`, `app/node_modules/`, `app/test-results/`, TypeScript build info, generated JS/DTS config outputs, and `.DS_Store`.
- `git ls-files | rg "(^|/)node_modules/|(^|/)dist/|test-results|playwright-report|\\.tsbuildinfo$|\\.DS_Store$|app/.*\\.config\\.(js|d\\.ts)$"`: exit 1, no generated artifacts are tracked.
- `rg -n "fetch\\s*\\(|XMLHttpRequest|axios|document\\.cookie|localStorage|sessionStorage|playwright|selenium|puppeteer|captcha|crawler|scrap|api[_-]?key|secret|password|credential|recommendedPriceCents|auto(?:matic)?\\s*price|auto(?:matic)?\\s*rate" app/src/domain/pricing`: exit 1, no live collection, credential, browser storage, or automatic-pricing code found in domain source.

## Requirement Coverage

| Area | Result | Evidence |
| --- | --- | --- |
| P1 intermittent unavailable fix | Pass | Existing regression and temporary Evaluator test cover `unavailable`, `no_rate`, `source_error` |
| Latest overall unavailable suppression | Pass | Existing regression plus temporary Evaluator test cover suppression |
| Competitor movement isolation | Pass | Grouping remains `hotelId + comparableRateKey`; domain tests pass |
| Deterministic snapshot ordering | Pass | Existing duplicate/capture ordering tests pass |
| Market sample gate | Pass | Three active core competitor gate remains covered |
| Owner-position exact-key gate | Pass | Existing owner low/high risk tests pass |
| Human-review-only alerts | Pass | `requiresHumanReview: true` and no recommended price field verified |
| Static no-live-collection scan | Pass | Domain compliance scan and Evaluator `rg` scan pass |
| App and prototype regressions | Pass | `npm run verify` and prototype test pass |
| PR hygiene | Pass | Ahead 8 commits, bounded diff, generated artifacts ignored |

## P2 Disposition

B-024 noted that owner-position evidence does not include a separate owner snapshot evidence record. For F-008, this is non-blocking:

- owner alert top-level fields include the owner-side `hotelId`, `rateKey`, `oldPriceCents`, `newPriceCents`, and `changeRate`;
- competitor sample evidence includes source kind, capture time, hotel id, rate key id, and sample size;
- all pricing-sensitive alerts still require human review;
- no automatic pricing or recommended price is emitted.

Recommendation: track a later backlog item for owner-position evidence enrichment, such as adding the owner snapshot to the evidence array or documenting the owner top-level fields as the owner evidence source.

## Verdict

F-008 is accepted after B-025 fixes.

Recommendation:

- mark `B-026` as `done`;
- move `F-008-domain-core-rate-boundaries` from `reverifying` to `done`;
- keep P2 owner-position evidence enrichment as a separate non-blocking backlog item;
- prepare the F-008 PR from `feature/f-008-domain-core-planning`.
