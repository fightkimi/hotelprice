# F-008 Generator Notes

Date: 2026-05-19
Role: Generator-Codex
Feature: `F-008-domain-core-rate-boundaries`
Backlog item: `B-023`

## Scope

Implemented the pure TypeScript domain core for rate comparability, availability suppression, deterministic snapshot ordering, alert candidate math, and compliance scanning.

No F-007 UI screens, components, demo dataset, E2E test config, package config, API routes, persistence, auth, live OTA collection, or automatic pricing behavior were added.

## Domain Boundary Classification

- Affected domains: hotel/property profile, competitor set, channel/source boundary, rate normalization, pricing comparison, alerting, and reporting evidence.
- Data binding: owner property, hotel id, competitor group, channel/source, stay date, checkout date, currency, occupancy, room type, meal plan, cancellation policy, tax/fee basis, and capture time are explicit in the domain types.
- Data type: fixture/manual/approved-api contract only. This slice implements no live connectors.
- Pricing automation: output is alert candidates with `requiresHumanReview: true`; no recommended new price field or rate-change action is emitted.

## TDD Evidence

- `app/tests/domain/rateKey.test.ts`: RED because `../../src/domain/pricing` did not exist; GREEN after `types.ts`, `rateKey.ts`, and `index.ts`.
- `app/tests/domain/availability.test.ts`: RED because `isAlertableSnapshot` and `markStaleSnapshots` were not functions; GREEN after `availability.ts`.
- `app/tests/domain/snapshotOrdering.test.ts`: RED because `selectLatestPrevious` was not a function; GREEN after `snapshotOrdering.ts`.
- `app/tests/domain/alertRules.test.ts`: RED because `generateAlertCandidates` was not a function; GREEN after `types.ts`, `reportEvidence.ts`, and `alertRules.ts`.
- `app/tests/domain/complianceScan.test.ts`: GREEN after domain source existed and static safety scan found no live collection, credential, browser, storage, or automatic pricing code.

## Verification Commands

- `cd app && /opt/homebrew/bin/npm test -- tests/domain`: exit 0; 5 files and 23 tests passed.
- `cd app && /opt/homebrew/bin/npm run verify`: first sandbox run passed build and Vitest but Playwright dev-server startup hit `listen EPERM`; escalated rerun exited 0.
- Escalated `npm run verify`: build passed, Vitest 11 files and 46 tests passed, Playwright 13 tests passed.
- `python3 scripts/triad_doctor.py`: exit 0.
- `python3 scripts/test_triad_doctor.py`: exit 0.
- `python3 -m json.tool progress.json`: exit 0 before final status update.
- `python3 -m json.tool features.json`: exit 0 before final status update.
- `python3 -m json.tool backlog.json`: exit 0 before final status update.
- `node tests/client_demo_prototype.test.js`: exit 0; 14 OK checks.

## Evaluator Focus

Verify unavailable/no-rate/source-error/stale suppression, `hotelId + comparableRateKey` isolation, duplicate capture ordering, three-core-competitor sample gates, owner-position exact-key matching, human-review-only alert shape, no recommended price, static compliance scan, app/prototype regressions, and PR readiness.
