# F-001 Hotel Rate Watch MVP Spec

## Role And Source Context

- Planner role: non-implementation. This spec only defines scope, handoff tasks, and acceptance criteria.
- Source PRD: `/Users/kimi/Desktop/hotel_competitor_price_monitor_prd_v0.1.md`
- Project state read on 2026-05-18: workflow bootstrap is complete, no product application code exists in this workspace, and the current directory is not a git repository.
- Superpowers order used for this Planner pass: brainstorming, writing-plans, executing-plans, test-driven-development, verification-before-completion.

## Problem Statement

Small and mid-sized hotel operators manually check nearby OTA prices and can miss meaningful market movement around weekends, holidays, events, or low-demand periods. The first product slice should prove whether a lightweight competitor rate monitor can produce actionable reminders without building a full revenue management system.

## Recommended Feature Slice

Feature id: `F-001-hotel-rate-watch-mvp`

Build a deterministic, compliance-safe MVP core for manually configured hotel and competitor rate monitoring. The first implementation should use user-provided or fixture rate snapshots, not live OTA scraping. It should normalize lowest public bookable rates, calculate rate movement for matching stay dates and rate keys, and generate alert candidates that a human operator can review.

## Domain Classification

- Affected domains: hotel/property profile, competitor set, channel/source connector, rate capture job, normalization, pricing comparison, alerting, reporting.
- Data binding: property-bound for the owner hotel, competitor-bound for selected competitors, channel-bound for each source/platform, and stay-date-bound for every rate snapshot.
- Data type for first slice: demo or user-provided fixture data only. Real production data and automated OTA collection are out of scope until a compliant source is approved.
- Required rate boundaries: channel, stay date, capture time, currency, occupancy, room type label, meal plan, cancellation policy, tax/fee inclusion, and source label.
- Pricing action boundary: the product may suggest "pay attention" but must not automatically change prices.

## In Scope

- Manual owner hotel profile and competitor definitions in structured input.
- Manual or fixture source rate snapshots for one channel.
- Future stay dates for a 7 to 30 day window.
- Lowest public bookable price as the first rate level.
- Owner hotel rate capture as a peer snapshot so low-price and high-price risk can be calculated.
- Core competitor and market reference levels.
- Alert candidate generation for:
  - individual competitor price up or down by at least 10 percent versus the previous comparable capture;
  - core competitor market average up or down by at least 8 percent versus the previous comparable capture;
  - owner hotel at least 20 percent below or above core competitor average when owner and competitor rates share the same rate key.
- Report output that labels source, capture time, demo/fixture status, currency, tax/fee basis, and alert reason.

## Out Of Scope

- Real OTA scraping, login automation, CAPTCHA bypass, private API reverse engineering, or high-frequency collection.
- Multi-platform comparison.
- Room type normalization beyond preserving a raw room type label and the selected lowest-rate key.
- Automatic price changes.
- AI pricing recommendations.
- Map-based nearby hotel discovery.
- Multi-tenant authentication and role permissions.
- Web UI polish or calendar visualization.

## Product Assumptions

- The first channel is represented as a named source such as `ctrip_fixture` or `meituan_fixture`.
- The default stay pattern is one night, two adults, one room.
- Rates are compared only when owner/competitor, channel, stay date, occupancy, room type strategy, meal plan, cancellation policy, currency, and tax/fee basis are compatible.
- If there is no previous comparable snapshot, the system records the rate but does not emit a movement alert.
- If fewer than three active core competitors have rates for a date, market-average alerts for that date are suppressed and the report marks the sample size.
- The first implementation stores data in memory or local fixture files. Persistence beyond test fixtures is a later slice.

## Required Data Contracts

### Hotel

- `id`
- `name`
- `role`: `owner` or `competitor`
- `competitor_level`: `core`, `reference`, or `owner`
- `channel_url`
- `active`

### Rate Snapshot

- `hotel_id`
- `channel`
- `stay_date`
- `checkout_date`
- `captured_at`
- `currency`
- `price`
- `tax_fee_basis`: `included`, `excluded`, or `unknown`
- `occupancy_adults`
- `room_type_label`
- `meal_plan`
- `cancellation_policy`
- `source_kind`: `fixture`, `manual`, or `approved_api`

### Alert Candidate

- `alert_type`
- `severity`
- `hotel_id`
- `stay_date`
- `old_price`
- `new_price`
- `change_rate`
- `message`
- `source_kind`
- `requires_human_review`

## Acceptance Criteria

1. Given two comparable captures for the same competitor and stay date, a price increase of 10 percent or more creates a competitor increase alert.
2. Given two comparable captures for the same competitor and stay date, a price decrease of 10 percent or more creates a competitor decrease alert.
3. Given comparable core competitor rates for a stay date, a market-average change of 8 percent or more creates a market movement alert when at least three core competitors have rates.
4. Given owner and core competitor rates for the same rate key and stay date, owner price at least 20 percent below or above the core average creates a low-price or high-price risk alert.
5. Alerts are not emitted when rate keys are incompatible, previous captures are missing, sample size is below threshold, or source data is marked unavailable.
6. Every report includes source label, source kind, capture time, currency, tax/fee basis, and a clear "human review required" marker.
7. The implementation contains no live OTA scraper, browser automation, credential handling, CAPTCHA bypass, or network collection code.
8. Generator uses test-first development for every behavior change and records red and green verification output.
9. Evaluator independently verifies JSON validity, process health, test output, alert math, and compliance boundaries.

## Generator Handoff Summary

Generator should implement `F-001-hotel-rate-watch-mvp` from `docs/superpowers/plans/2026-05-18-hotel-rate-watch-mvp.md`. The implementation should stay small, use Python standard library unless the team approves dependencies, and create product code only under a clearly named package such as `src/hotel_pricing_capture/`.

## Evaluator Handoff Summary

Evaluator should verify the implementation against this spec, especially comparison boundaries, alert thresholds, fixture/demo labeling, lack of scraping behavior, and TDD evidence.
