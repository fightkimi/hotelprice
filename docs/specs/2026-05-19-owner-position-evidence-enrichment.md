# F-010 Owner-Position Evidence Enrichment Spec

## Role And Source Context

- Planner role: non-implementation.
- Branch: `feature/f-010-owner-position-evidence-planning`.
- Source follow-up: `B-027`, carried from F-008/F-009 as a non-blocking owner-position evidence gap.
- Domain baseline: `F-008-domain-core-rate-boundaries`, merged through PR #2.
- UI data-flow baseline: `F-009-domain-driven-ui-data-flow`, merged through PR #3.
- Superpowers order used for this Planner pass: brainstorming, writing-plans, executing-plans, test-driven-development, verification-before-completion.

## Problem Statement

F-008 owner-position alerts compare the owner hotel's latest available rate against the active core competitor average. The alert top-level fields identify the owner side, but the `evidence` array currently contains only competitor sample observations. F-009 maps that evidence into customer-facing review markers, so owner-position review signals can look less complete than competitor movement or market movement signals.

F-010 closes this evidence gap without changing pricing thresholds, UI layout, live collection boundaries, or automatic pricing behavior.

## Feature Slice

Feature id: `F-010-owner-position-evidence-enrichment`

Add explicit evidence roles to domain alert evidence and include the owner snapshot in owner-position alert evidence. Then update the domain-driven UI adapter so owner-position evidence markers clearly distinguish the owner observation from competitor samples.

## Domain Classification

- Affected domains: alerting, report evidence, owner-versus-market comparison, UI evidence mapping.
- Data binding: owner property, hotel id, competitor group, channel/source, stay date, checkout date, currency, occupancy, room type, meal plan, cancellation policy, tax/fee basis, capture time, source kind, and availability status.
- Data type: fixture/manual seed data only. No production data, live OTA collection, credentials, cookies, browser automation, storage, or network calls.
- Pricing automation: alert candidates remain human-review-only. No recommended price or automatic rate update may be added.

## Required Contract Changes

### `AlertEvidence`

Add:

- `role`: `latest_observation`, `previous_observation`, `market_sample`, `owner_observation`, or `competitor_sample`
- `priceCents`: `number | null`

Rules:

- competitor movement alerts use `latest_observation` and `previous_observation`;
- market movement alerts use `market_sample`;
- owner low/high risk alerts include exactly one `owner_observation` plus active core competitor `competitor_sample` evidence;
- `owner_observation` must use the owner snapshot's `hotelId`, `capturedAt`, `sourceKind`, `rateKeyId`, and `priceCents`;
- competitor sample evidence must preserve each competitor hotel id and price;
- evidence roles must not weaken `requiresHumanReview: true`.

## Required UI Adapter Behavior

- `mapEvidence()` in `domainDrivenDataset.ts` should use evidence roles to produce clearer customer-safe labels.
- Owner-position signals must include at least one evidence marker labeled as the owner observation and at least three competitor sample markers.
- Evidence marker copy must remain customer-safe and must not mention crawler, token, cookie, CAPTCHA, credential, scraper, or internal implementation details.

## In Scope

- Domain evidence types and helper function update.
- Alert rule evidence role assignment.
- Domain tests for owner-position, competitor movement, and market movement evidence roles.
- F-009 adapter tests for owner-position evidence marker mapping.
- Static safety scans and full app verification.

## Out Of Scope

- Pricing threshold changes.
- New alert types.
- UI layout or visual redesign.
- API routes, persistence, auth, channel manager, PMS, or live source integration.
- Automatic pricing, automatic rate updates, or recommended new price fields.

## Acceptance Criteria

1. `AlertEvidence` includes `role` and `priceCents`.
2. Owner low/high risk alerts include one `owner_observation` and at least three `competitor_sample` evidence records.
3. Owner evidence uses the owner snapshot source kind, capture time, hotel id, comparable rate key id, and price.
4. Competitor movement evidence roles identify latest and previous observations.
5. Market movement evidence roles identify market samples.
6. F-009 owner-position UI evidence markers distinguish owner observation from competitor samples without unsafe internal wording.
7. Every pricing-sensitive signal still requires human review.
8. No alert or UI copy includes recommended price, automatic pricing, live collection, credentials, cookies, CAPTCHA, or browser automation wording.
9. Existing F-008 domain tests, F-009 adapter tests, full app verification, Triad checks, JSON checks, and old prototype regression pass.

## Generator Handoff

Use `docs/superpowers/plans/2026-05-19-owner-position-evidence-enrichment.md`.

Generator must use strict `superpowers:test-driven-development`: write failing tests for evidence roles and owner-position UI evidence mapping, verify red, implement the minimum changes, verify green, and record red/green evidence.

## Evaluator Handoff

Evaluator must independently verify the owner-position evidence array, UI evidence marker copy, human-review-only behavior, no recommended price, static safety scan, app regression, PR hygiene, and that B-027 is closed by F-010.
