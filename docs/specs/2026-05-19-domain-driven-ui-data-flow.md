# F-009 Domain-Driven UI Data Flow Spec

## Role And Source Context

- Planner role: non-implementation. This spec prepares the next Generator-ready slice after the accepted F-008 domain core.
- UI baseline: `F-007-formal-app-foundation`, merged through PR #1.
- Domain baseline: `F-008-domain-core-rate-boundaries`, merged through PR #2.
- Current branch: `feature/f-009-domain-driven-ui-planning`.
- Superpowers order used for this Planner pass: brainstorming, writing-plans, executing-plans, test-driven-development, verification-before-completion.

## Problem Statement

F-007 created a formal React/TypeScript UI backed by a hand-shaped `DemoDataset`. F-008 added a tested pricing domain core with comparable rate keys, availability suppression, deterministic snapshot ordering, and human-review alert candidates.

The next product slice should connect those two accepted foundations. F-009 replaces the hand-authored UI dataset as the source of truth with a domain-driven fixture pipeline:

- fixture hotel profiles and rate snapshots enter the F-008 domain core;
- `generateAlertCandidates` produces pricing-sensitive alert candidates;
- an adapter converts domain snapshots and alert candidates into the existing F-007 `DemoDataset` view model;
- F-007 screens keep their presentational structure while receiving data derived from domain contracts.

This slice proves the app can grow from demo UI into a domain-backed product without adding live collection, persistence, API routes, or automatic pricing.

## Recommended Feature Slice

Feature id: `F-009-domain-driven-ui-data-flow`

Build a local-only data-flow layer inside the existing Vite app:

1. Add fixture/manual domain seed data for the F-007 demo context.
2. Add a pure adapter that builds the F-007 `DemoDataset` from F-008 `HotelProfile`, `RateSnapshot`, and `AlertCandidate` data.
3. Wire `App.tsx` to the generated domain-driven dataset.
4. Preserve F-007 visual, responsive, copy, contrast, and screenshot gates.

## Domain Classification

- Affected domains: reporting, pricing comparison, alerting, setup/data scope, and UI data transformation.
- Data binding: owner property, hotel, competitor group, channel/source, stay date, checkout date, room type, occupancy, meal plan, cancellation policy, tax/fee basis, currency, capture time, and availability status.
- Data type: fixture/manual seed data only. No real production data, no live OTA collection, no customer credentials, no browser automation, no cookies, and no network calls.
- Pricing basis: every displayed price must remain traceable to a comparable rate key and must distinguish unavailable data from zero-price data.
- Pricing automation: all pricing-sensitive output remains human-review-only. The UI must not show automatic pricing, automatic rate changes, or recommended new prices.
- Compliance: F-009 may transform accepted fixture data into UI view models, but it must not introduce connectors, scraping, storage, authentication, or external source access.

## Architecture Direction

Keep F-007 screens and primitives as the presentational baseline. Add a bounded data layer:

- `app/src/data/domainSeed.ts`: fixture/manual hotel profiles, rate snapshots, and event annotations.
- `app/src/data/domainDrivenDataset.ts`: pure adapter that calls F-008 domain functions and returns `DemoDataset`.
- `app/src/data/demoDataset.ts`: may either re-export the generated dataset or remain as a compatibility wrapper, but it must no longer be the hand-authored source of truth.
- `app/src/App.tsx`: consume the generated domain-driven `DemoDataset` through the existing prop contract.

The adapter should not change the accepted F-008 domain semantics unless a failing test proves the UI integration needs a domain bug fix. UI formatting, labels, severity mapping, chart series construction, and sample-quality language belong in the adapter.

## Data Flow

1. Domain seed data defines:
   - one owner hotel;
   - at least three active core competitor hotels;
   - one optional reference competitor;
   - comparable rate keys for the current room/platform/date context;
   - available and unavailable snapshot examples;
   - event annotations for weekend, Dragon Boat demo holiday, expo demo day, and concert demo day.
2. Adapter marks stale snapshots through `generateAlertCandidates({ hotels, snapshots, now })`.
3. Adapter maps alert candidates to `Signal[]`:
   - competitor movement alerts become competitor movement signals;
   - market movement alerts become market average signals;
   - owner low/high risk alerts become owner-position review signals;
   - every signal keeps `humanReviewRequired: true`;
   - every signal includes evidence markers derived from domain evidence.
4. Adapter maps snapshots to chart view models:
   - owner latest available snapshots become the owner trend line;
   - active core competitor snapshots become core-average trend points;
   - event annotations become event-lift trend and timeline markers;
   - unavailable or no-rate dates become `null` chart points and `status: "unavailable"` heatmap days.
5. Adapter maps latest comparable owner and core-average rates by platform into `PlatformGapRow[]`.
6. Screens render through existing components, preserving F-007 accessibility and responsive behavior.

## Required Adapter Behavior

### Contract Preservation

- Returned object must satisfy `DemoDataset`.
- `sourceKind` remains `fixture-demo`.
- `liveCollectionEnabled` remains `false`.
- `demoDisclosure` must clearly state that all data is static sample data.
- Existing screens must not need new product semantics to render.

### Alert Mapping

- `AlertCandidate.requiresHumanReview` must map to `Signal.humanReviewRequired`.
- Domain alert evidence must map into `EvidenceMarker[]` with source kind, capture time, sample size, and confidence.
- UI signal copy may summarize review priority, but must not expose crawler, cookie, token, credential, CAPTCHA, or raw implementation details.
- UI signal copy must not display a recommended new price.

### Missing And Unavailable Data

- Unavailable, no-rate, source-error, and stale snapshots must not be converted into zero-priced points.
- Missing price points must render as `value: null`.
- Heatmap days without usable available samples must use `intensity: null`, `ownerRate: null`, `coreAverage: null`, and `status: "unavailable"`.
- Platform coverage should reflect sample availability, not raw fixture count alone.

### Owner-Position Evidence Follow-Up

B-027 remains non-blocking. F-009 should not require a domain contract change to enrich owner-position evidence.

Allowed F-009 handling:

- map existing owner alert top-level fields plus competitor evidence into a clear UI review signal; and
- add an adapter-level test documenting that owner-position signals remain human-review-only.

Not required for F-009 acceptance:

- changing F-008 `AlertCandidate.evidence` to include the owner snapshot; or
- closing B-027.

## In Scope

- Fixture/manual seed data for the formal app.
- Pure UI data adapter from F-008 domain contracts to F-007 `DemoDataset`.
- Tests that fail before the adapter exists and pass after implementation.
- Minimal app wiring from static hand-authored data to generated domain-driven data.
- Existing F-007 app verification and screenshot regression.
- Status/report updates from Generator after implementation.

## Out Of Scope

- API routes.
- Database persistence.
- Authentication.
- Real OTA collection.
- Channel manager, PMS, or external partner integrations.
- Browser automation, scraping, cookies, CAPTCHA handling, credentials, or tokens.
- Automatic pricing, automatic rate updates, or recommended new price fields.
- Final acceptance or signoff by Generator.
- B-027 domain evidence enrichment unless it is explicitly split into its own accepted slice.

## Acceptance Criteria

1. `DemoDataset` used by `App.tsx` is generated from F-008 domain profiles, snapshots, and alert candidates, not hand-authored as the primary source.
2. Tests prove the adapter calls or depends on `generateAlertCandidates` output for pricing-sensitive signals.
3. Tests prove all generated pricing-sensitive signals require human review.
4. Tests prove unavailable/no-rate/source-error/stale snapshots become missing UI states, not zero prices.
5. Tests prove trend, heatmap, and platform gap data preserve comparable rate boundaries: room type, platform/source, stay date, occupancy, meal plan, cancellation policy, tax/fee basis, and currency.
6. Tests prove platform gap rows are derived from domain snapshots and include coverage.
7. Existing F-007 visible-copy, contrast, component, screenshot, and full `npm run verify` gates continue to pass.
8. Existing F-008 domain tests continue to pass.
9. Static safety scans find no live collection, credential, cookie, CAPTCHA, browser automation, storage, or automatic pricing behavior in the new data-flow layer.
10. B-027 is documented as non-blocking and is not required for F-009 acceptance.

## Generator Handoff

Use `docs/superpowers/plans/2026-05-19-domain-driven-ui-data-flow.md`.

Generator must use `superpowers:test-driven-development`: write fail-first tests for the domain seed and adapter, verify red, implement the minimum data-flow layer, verify green, and then run full app/domain verification.

## Evaluator Handoff

Evaluator must independently verify that the UI is now domain-driven, that F-007 visual and copy gates still pass, that F-008 alert boundaries are preserved, that unavailable data does not become zero-priced UI data, that B-027 remains non-blocking, and that the PR diff stays bounded to F-009 planning/data-flow work.
