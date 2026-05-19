# F-008 Fix Generator Notes

Date: 2026-05-19
Role: Generator-Codex
Feature: `F-008-domain-core-rate-boundaries`
Fix source: `docs/test-reports/2026-05-19-f-008-domain-core-rate-boundaries-evaluator.md`

## Scope

Fixed the P1 competitor movement regression found during B-024: an intermittent unavailable/no-rate/source-error capture between two available captures should not block movement comparison when the latest overall snapshot is available.

No F-007 UI, app screens, demo dataset, package config, E2E config, persistence, API route, live collection, or automatic pricing behavior was changed.

## TDD Evidence

- RED: `cd app && /opt/homebrew/bin/npm test -- tests/domain/alertRules.test.ts` failed 3 intermittent availability cases. Actual result was `[]`; expected `competitor_increase` with `oldPriceCents: 40000`, `newPriceCents: 46000`, and `changeRate: 0.15`.
- GREEN: after updating competitor movement selection, `alertRules.test.ts` passed 10 tests.

## Fix Detail

- Competitor movement still groups by `hotelId + comparableRateKey`.
- The latest overall capture for the group must be alertable/available; unavailable latest captures remain suppressed.
- When latest overall is available, previous comparison now uses the prior alertable available capture, skipping intermittent unavailable, no-rate, and source-error observations.
- Duplicate capture-time winners remain deterministic by `capturedAt`, then lexicographic `snapshotId`.

## Verification Commands

- `cd app && /opt/homebrew/bin/npm test -- tests/domain/alertRules.test.ts`
- `cd app && /opt/homebrew/bin/npm test -- tests/domain`
- `cd app && /opt/homebrew/bin/npm run verify`
- `python3 scripts/triad_doctor.py`
- `python3 scripts/test_triad_doctor.py`
- `python3 -m json.tool progress.json`
- `python3 -m json.tool features.json`
- `python3 -m json.tool backlog.json`
- `node tests/client_demo_prototype.test.js`

## Evaluator Focus

Re-run the B-024 supplemental scenario: `available -> unavailable/no_rate/source_error -> available` for the same hotel and comparable key. Also confirm unavailable latest snapshots still suppress movement, alert candidates remain human-review-only, and no recommended price or live collection behavior was added.
