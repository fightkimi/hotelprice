# F-008 Domain Core Rate Boundaries Evaluator Report

Date: 2026-05-19
Role: Evaluator-Codex
Feature: `F-008-domain-core-rate-boundaries`
Backlog item: `B-024`
Status recommendation: `fixing`

## Scope Classification

- Affected domains: hotel/property profile, competitor set, channel/source boundary, rate normalization, pricing comparison, alerting, and report evidence.
- Data binding: owner property, hotel id, competitor group, channel/source, stay date, checkout date, currency, occupancy, room type, meal plan, cancellation policy, tax/fee basis, capture time, and availability status.
- Data type: fixture/manual/approved-api contract only. No real production data, live OTA collection, credentials, browser automation, persistence, auth, or network connector was found in F-008 source.
- Pricing basis: comparable-rate-key serialization includes channel, source id, stay/checkout dates, currency, occupancy, room type, meal plan, cancellation policy, and tax/fee basis.
- Pricing automation: implementation emits alert candidates only, with `requiresHumanReview: true`; no recommended price or automatic rate-change action was found.

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
- `docs/test-reports/2026-05-19-f-008-generator-notes.md`

Superpowers direct handles were not exposed, so local `SKILL.md` fallback was used in the required order:

1. `superpowers:brainstorming`
2. `superpowers:writing-plans`
3. `superpowers:executing-plans`
4. `superpowers:test-driven-development`
5. `superpowers:verification-before-completion`

Evaluator did not modify product code. A temporary supplementary verification test was written under `/private/tmp/f008-evaluator-boundary.test.ts` and is not part of the repository.

## Fresh Verification Evidence

Command: `/opt/homebrew/bin/npm test -- tests/domain` from `app/`

Result: exit 0.

- Vitest domain suite: 5 files passed, 23 tests passed.

Command: `/opt/homebrew/bin/npm run verify` from `app/`

Result: exit 0.

- Build: `tsc -b && vite build` passed.
- Vitest full suite: 11 files passed, 46 tests passed.
- Playwright screenshot gate: 13 tests passed.

Command group from repository root:

- `python3 scripts/triad_doctor.py`: exit 0; current branch is `feature/f-008-domain-core-planning`.
- `python3 scripts/test_triad_doctor.py`: exit 0.
- `python3 -m json.tool progress.json`: exit 0.
- `python3 -m json.tool features.json`: exit 0.
- `python3 -m json.tool backlog.json`: exit 0.
- `node tests/client_demo_prototype.test.js`: exit 0; 14 OK checks.

Static and PR-readiness checks:

- `git status --short`: clean before this report was written.
- `git branch --show-current`: `feature/f-008-domain-core-planning`.
- `git log --oneline --decorate -8`: HEAD is `142b6dc chore: hand off f-008 for verification`, based on `dd43b3b (origin/main, origin/HEAD, main) Merge pull request #1`.
- `git diff --name-only origin/main...HEAD`: limited to F-008 docs/status files and `app/src/domain/pricing/*` plus `app/tests/domain/*`; no F-007 UI, package config, E2E config, or demo dataset changes were found.
- `git ls-files | rg "(^|/)node_modules/|(^|/)dist/|test-results|playwright-report|\\.tsbuildinfo$|\\.DS_Store$|app/.*\\.config\\.(js|d\\.ts)$"`: exit 1, no generated artifacts tracked.
- `rg -n "fetch\\s*\\(|XMLHttpRequest|axios|document\\.cookie|localStorage|sessionStorage|playwright|selenium|puppeteer|captcha|crawler|scrap|api[_-]?key|secret|password|credential|recommendedPriceCents|auto(?:matic)?\\s*price|auto(?:matic)?\\s*rate" app/src/domain/pricing`: exit 1, no live collection, credential, browser storage, or automatic-pricing code found in domain source.

## Requirement Coverage

| Area | Result | Evidence |
| --- | --- | --- |
| Comparable rate key includes all required dimensions | Pass | `rateKey.ts` serializes channel, source, stay/checkout, currency, occupancy, room type, meal plan, cancellation policy, and tax/fee basis |
| Competitor movement isolated by `hotelId + comparableRateKey` | Pass | `movementGroupKey()` and `snapshotOrdering.test.ts` cover cross-hotel isolation |
| Availability statuses modeled | Pass | `AvailabilityStatus` includes `available`, `unavailable`, `no_rate`, `source_error`, `stale` |
| Unavailable/stale snapshots do not emit alerts directly | Pass with blocker below | existing tests cover direct suppression; supplemental test found unavailable intermediate capture blocks a valid alert |
| Deterministic latest/previous ordering | Pass | `snapshotOrdering.ts` sorts by `capturedAt`, then `snapshotId`; duplicate same-capture winner is lexicographically last |
| Market movement requires three active core competitors | Pass | `alertRules.test.ts` covers qualified and under-sampled market movement |
| Owner position requires exact comparable key and core samples | Pass | `alertRules.test.ts` covers exact key, reference exclusion, and low/high risk emission |
| Alert candidates are human-review-only | Pass | `requiresHumanReview: true` in `makeAlert()` and tests |
| No recommended price or automatic pricing action | Pass | static scan and tests cover `recommendedPriceCents` absence |
| No live collection or credential handling | Pass | domain compliance scan and Evaluator static scan passed |
| Existing app/prototype regression | Pass | `npm run verify` and `client_demo_prototype.test.js` passed |
| PR readiness | Pass with report artifact caveat | branch and diff are reviewable; this report is a new Evaluator artifact |

## Findings

### P1 - Intermittent unavailable captures suppress valid competitor movement between available snapshots

Evidence:

- F-008 spec says competitor movement should compare "latest and previous available snapshots" for the same `hotelId + comparableRateKey`.
- F-008 spec suppresses when there is "no previous available capture", stale latest, unavailable latest, incompatible key, or inactive hotel.
- Current implementation selects latest/previous across all snapshots first in `selectLatestPrevious()`, then `generateCompetitorMovementAlerts()` rejects the group if either selected snapshot is not alertable.
- This means an intermediate unavailable/no-rate/source-error capture can become `previous` and suppress an otherwise valid comparison between the latest available snapshot and the prior available snapshot.

Supplementary Evaluator test:

Command: `/opt/homebrew/bin/npm exec -- vitest --root /private/tmp run f008-evaluator-boundary.test.ts`

Result: exit 1.

Scenario:

- `comp-a`, same `ComparableRateKey`.
- 08:00 available `40000`.
- 10:00 unavailable `null`.
- 12:00 available `46000`.
- Expected per spec: compare latest available 12:00 against previous available 08:00 and emit `competitor_increase` with `changeRate: 0.15`.
- Actual: `generateAlertCandidates()` returned `[]`.

Failure excerpt:

```text
AssertionError: expected [] to deeply equal [ ObjectContaining{...} ]
Expected: competitor_increase oldPriceCents 40000 newPriceCents 46000 changeRate 0.15
Received: []
```

Relevant code:

- `app/src/domain/pricing/snapshotOrdering.ts:17` selects latest/previous without filtering to alertable/available snapshots.
- `app/src/domain/pricing/alertRules.ts:55` calls that selection for competitor movement.
- `app/src/domain/pricing/alertRules.ts:61` suppresses when `previous` is not alertable instead of selecting the previous alertable capture.

Impact:

This can miss real competitor price movement after a temporary source outage or no-rate capture. That is directly in the F-001 carryover risk area: unavailable source data is modeled, but it currently blocks a valid later movement alert rather than only suppressing the unavailable snapshot itself.

Required before acceptance:

- For competitor movement, select latest and previous **alertable available** snapshots per `hotelId + comparableRateKey`.
- Continue to suppress when latest available is stale/unavailable, when fewer than two distinct available capture times exist, or when hotel/key boundaries differ.
- Add a regression test covering available -> unavailable/no-rate/source-error -> available for the same hotel/key.

### P2 - Owner-position evidence does not include the owner snapshot evidence record

Evidence:

- `generateOwnerPositionAlerts()` builds evidence only from `competitorSamples`.
- Top-level alert fields identify the owner snapshot, but `evidence` does not include the owner snapshot's `sourceKind`, `capturedAt`, and `rateKeyId`.

Impact:

The alert is still traceable enough for current tests, but report-ready evidence is weaker for owner low/high risk because the compared owner-side observation is not part of the evidence list.

Recommended follow-up:

- Include `evidenceForSnapshot(ownerSnapshot, competitorSamples.length)` alongside core competitor evidence for owner-position alerts, or explicitly document that owner fields are represented only by top-level alert fields.

## Positive Evidence

- Existing F-008 domain tests are meaningful and cover key serialization, availability/stale suppression, duplicate ordering, market sample gates, owner-position exact-key matching, human review, and compliance scanning.
- Full app verification still passes after the domain module was added.
- F-007 UI files, screens, demo dataset, package/build config, and E2E screenshot gate were not touched by the F-008 PR diff.
- No live collection, network, browser storage, credential, CAPTCHA, or automatic pricing code was found in `app/src/domain/pricing`.
- PR diff is bounded and reviewable on `feature/f-008-domain-core-planning`.

## Verdict

F-008 is not accepted yet.

Recommendation: move `F-008-domain-core-rate-boundaries` to `fixing`, create a Generator fix task after `B-024`, and require a regression test for intermittent unavailable/no-rate/source-error captures between two available captures.
