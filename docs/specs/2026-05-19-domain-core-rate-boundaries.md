# F-008 Domain Core Rate Boundaries Spec

## Role And Source Context

- Planner role: non-implementation. This spec defines the next Generator-ready product slice after the accepted F-007 app foundation.
- Source carryover: `docs/test-reports/2026-05-18-f-001-hotel-rate-watch-mvp-evaluator-precheck.md`.
- UI baseline: `F-007-formal-app-foundation`, merged through PR #1.
- Superpowers order used for this Planner pass: brainstorming, writing-plans, executing-plans, test-driven-development, verification-before-completion.

## Problem Statement

F-007 created a formal UI foundation with fixture data, but the product still needs a trustworthy domain core before pricing intelligence can move beyond hand-shaped demo data. The F-001 precheck identified two blocking data-boundary risks:

- unavailable source data was mentioned in acceptance criteria but not modeled;
- individual competitor movement could accidentally compare snapshots across different hotels when rate keys match.

F-008 makes those risks explicit and testable.

## Recommended Feature Slice

Feature id: `F-008-domain-core-rate-boundaries`

Build a TypeScript domain module under the existing app workspace that models hotel rate snapshots, availability, comparable rate keys, deterministic snapshot ordering, and alert candidate generation. This slice uses fixture/manual data only and exports pure functions that later screens or APIs can call.

## Domain Classification

- Affected domains: hotel/property profile, competitor set, channel/source boundary, rate normalization, pricing comparison, alerting, reporting evidence.
- Data binding: every snapshot is owner-property-bound, hotel-bound, competitor-group-bound, channel/source-bound, stay-date-bound, room-type-bound, occupancy-bound, currency-bound, tax/fee-bound, cancellation-policy-bound, and capture-time-bound.
- Data type: fixture/manual data only. No real production data, no live OTA collection, no credentials, no browser automation, no network calls.
- Pricing basis: price comparisons require currency, tax/fee basis, occupancy, meal plan, cancellation policy, room type key, stay date, checkout date, channel, source, and capture time.
- Pricing automation: output is alert candidates only. Every pricing-sensitive alert must set `requiresHumanReview: true` and must not include a specific recommended new price.

## Data Contracts

### `HotelProfile`

Required fields:

- `hotelId`
- `ownerPropertyId`
- `name`
- `role`: `owner` or `competitor`
- `competitorLevel`: `owner`, `core`, or `reference`
- `competitorGroupId`
- `active`

Rules:

- owner hotel must use `role: "owner"` and `competitorLevel: "owner"`;
- competitor hotels must use `role: "competitor"`;
- inactive hotels are excluded from alert calculations.

### `ComparableRateKey`

Required fields:

- `channel`
- `sourceId`
- `stayDate`
- `checkoutDate`
- `currency`
- `occupancyAdults`
- `roomTypeKey`
- `mealPlan`
- `cancellationPolicy`
- `taxFeeBasis`

Rules:

- movement alerts compare by `hotelId + comparableRateKey`;
- market average compares by `ownerPropertyId + competitorGroupId + comparableRateKey`;
- owner-versus-market compares owner snapshots and core competitor snapshots only when their comparable rate keys match exactly.

### `RateSnapshot`

Required fields:

- `snapshotId`
- `hotelId`
- `ownerPropertyId`
- `competitorGroupId`
- `capturedAt`
- `sourceKind`: `fixture`, `manual`, or `approved_api`
- `availabilityStatus`: `available`, `unavailable`, `no_rate`, `source_error`, or `stale`
- `unavailableReason`
- `priceCents`
- `rateKey`

Rules:

- `priceCents` must be a positive integer only when `availabilityStatus` is `available`;
- unavailable/no-rate/source-error/stale snapshots must use `priceCents: null`;
- unavailable snapshots are preserved for evidence and coverage, but they do not emit movement, market-average, or owner-position pricing alerts;
- `sourceKind: "approved_api"` is allowed by contract but not implemented as a live connector in this slice.

### `AlertCandidate`

Required fields:

- `alertId`
- `alertType`: `competitor_increase`, `competitor_decrease`, `market_increase`, `market_decrease`, `owner_low_risk`, `owner_high_risk`
- `severity`: `info`, `warning`, or `risk`
- `ownerPropertyId`
- `hotelId`
- `competitorGroupId`
- `rateKey`
- `oldPriceCents`
- `newPriceCents`
- `changeRate`
- `sampleSize`
- `evidence`
- `requiresHumanReview`

Rules:

- `requiresHumanReview` must always be true;
- do not include a recommended new price;
- evidence must include source kind, capture time, hotel id, rate key, and sample size.

## Snapshot Ordering And Duplicate Rules

- Latest and previous snapshots are selected per `hotelId + comparableRateKey`.
- Order by `capturedAt` ascending, then `snapshotId` lexicographically ascending.
- For identical `hotelId + comparableRateKey + capturedAt`, keep the lexicographically last `snapshotId` as the deterministic winner for that capture time.
- Movement alerts require at least two distinct capture times.
- A snapshot is stale when `now - capturedAt` is greater than 36 hours. Stale snapshots are kept in evidence but suppressed from pricing alerts.

## Alert Rules

### Competitor Movement

- Compare latest and previous available snapshots for the same `hotelId + comparableRateKey`.
- Emit increase when change rate is at least `+10%`.
- Emit decrease when change rate is at most `-10%`.
- Suppress when there is no previous available capture, incompatible rate key, stale latest snapshot, unavailable latest snapshot, or inactive hotel.

### Market Average Movement

- Use active core competitors only.
- Group by `ownerPropertyId + competitorGroupId + comparableRateKey`.
- Compare latest average with previous average.
- Require at least three active core competitors with available rates at each compared capture time.
- Emit increase/decrease when average movement magnitude is at least `8%`.

### Owner Position Risk

- Compare owner latest available price against latest active core competitor average for the same `ownerPropertyId + competitorGroupId + comparableRateKey`.
- Require at least three active core competitor samples.
- Emit owner low-risk alert when owner is at least `20%` below the core average.
- Emit owner high-risk alert when owner is at least `20%` above the core average.

## Compliance And Safety Rules

- No `fetch`, `XMLHttpRequest`, `axios`, `http`, `https`, `socket`, `playwright`, `selenium`, `puppeteer`, cookie/session, CAPTCHA, credential, password, or API-key handling in the domain module.
- Domain tests must include a static scan for prohibited imports and live-collection wording.
- Fixture data must be labeled fixture/manual.
- The module must not read from the network or browser storage.

## In Scope

- TypeScript domain contracts under `app/src/domain/pricing/`.
- Pure functions for availability filtering, comparable key serialization, snapshot ordering, alert generation, and report-ready evidence.
- Vitest tests under `app/tests/domain/`.
- Generator handoff with TDD red/green evidence.

## Out Of Scope

- UI changes.
- API routes.
- Database persistence.
- Real OTA collection.
- Channel manager or PMS integration.
- Authentication.
- Automatic pricing or rate updates.

## Acceptance Criteria

1. Unavailable, no-rate, source-error, and stale snapshots are modeled and never emit pricing alerts.
2. Competitor movement is isolated by `hotelId + comparableRateKey`; two hotels with identical rate keys never compare against each other.
3. Latest/previous selection is deterministic by capture time and snapshot id.
4. Duplicate same-capture snapshots resolve deterministically.
5. Market movement requires at least three active core competitors with available comparable rates at both capture times.
6. Owner low/high risk requires owner and core competitor rates with the exact same comparable rate key and at least three active core competitor samples.
7. Every alert includes source kind, capture time, hotel id, comparable rate key, sample size, and `requiresHumanReview: true`.
8. No alert includes an automatic pricing action or recommended new price.
9. Domain source passes a static no-live-collection scan.
10. Existing F-007 app verification and old prototype tests still pass after the domain module is added.

## Generator Handoff

Use `docs/superpowers/plans/2026-05-19-domain-core-rate-boundaries.md`.

Generator must use `superpowers:test-driven-development`: write fail-first Vitest tests, verify red, implement the minimum domain logic, verify green, and record red/green evidence.

## Evaluator Handoff

Evaluator must verify alert math, availability suppression, hotel/rate-key isolation, stale/duplicate handling, no live collection code, app verification, prototype regression checks, and PR readiness.
