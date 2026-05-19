# F-011 Data Scope And Capture Entry Spec

## Role And Source Context

- Planner role: non-implementation.
- Branch: `feature/f-011-data-scope-capture-entry-planning`.
- Baseline UI: F-007 formal app foundation.
- Baseline domain core: F-008 rate boundaries and alert math.
- Baseline UI data flow: F-009 domain-driven demo dataset.
- Baseline evidence contract: F-010 accepted through Evaluator and open in PR #4.
- Superpowers order used for this Planner pass: brainstorming, writing-plans, executing-plans, test-driven-development, verification-before-completion.

## Problem Statement

The formal app already shows a Setup/Data Scope screen, but the current screen is still a static explanation. It does not expose a typed product contract for:

- the owner property and competitor group included in analysis;
- allowed platforms and source kinds;
- stay-date window and comparable rate basis;
- freshness rules and sample coverage;
- a customer-safe entry point for starting a capture workflow.

Without this contract, later data ingestion work could blur property, competitor, channel, date, and rate-basis boundaries. F-011 makes those boundaries explicit before any live source or persistence work exists.

## Feature Slice

Feature id: `F-011-data-scope-capture-entry`

Add a typed data-scope summary and capture-entry preview to the existing formal app dataset and Setup screen.

This is a local, fixture/manual-only product slice. It gives customers and investors a credible view of how the product will define scope and start a compliant capture process, while keeping real production collection out of scope.

## Domain Classification

- Affected domains: hotel/property profile, competitor set, channel/source boundaries, rate capture job entry, normalization prerequisites, reporting setup, admin settings preview.
- Data binding: owner property, owner hotel, competitor group, active competitor hotels, platform/source, stay date, checkout date, currency, occupancy, room type, meal plan, cancellation policy, tax/fee basis, capture time, freshness window, source kind, and human-review requirement.
- Data type: fixture/manual seed data only. No production data, live OTA connection, credentials, cookies, browser session data, CAPTCHA flow, network connector, persistence, or backend API route.
- Capture method: local demo fixture and manual-entry preview only. Approved API is shown as a disabled or approval-required future source type, not as a working connector.
- Pricing automation: capture entry may start review preparation only. It must not recommend prices, update prices, or imply automatic pricing decisions.

## Required Product Contracts

### `DataScopeSummary`

The app dataset must expose a `dataScope` object that includes:

- owner property id and owner hotel id;
- owner hotel display name;
- competitor group id and display label;
- active core competitor count and active reference competitor count;
- platform rows with platform label, channel, source id, source kind, and enabled state;
- stay window start date, end date, total stay-date count, and focus date;
- rate basis: currency, occupancy adults, room type labels, meal plans, cancellation policies, tax/fee basis values;
- freshness rule: current capture time and stale-after hours;
- customer-safe guardrail notes.

### `CaptureEntryPreview`

The app dataset must expose a `captureEntry` object that includes:

- `productionConnectionEnabled: false`;
- active entry id `fixture-demo`;
- entries for `fixture-demo`, `manual-import`, and `approved-api`;
- source kind for each entry;
- status for each entry: active, available, requires approval, or blocked;
- human-review requirement for every entry;
- customer-safe copy that does not expose internal collection mechanics.

## Required UI Behavior

The Setup/Data Scope screen must become a real data-scope and capture-entry preview:

- show data scope by hotel, competitor group, platform, stay window, and rate basis;
- show capture entry options with clear statuses;
- show that production connection is currently closed;
- show that every capture path leads to human review;
- keep the existing formal app layout and responsive behavior;
- use existing panel, chip, setup-list, and token conventions unless a small scoped class is needed;
- avoid marketing hero copy and avoid internal implementation language.

## In Scope

- Dataset contract types for `dataScope` and `captureEntry`.
- A pure adapter/helper that derives scope and entry preview from `domainSeed`.
- Setup screen rendering for data scope and capture entry preview.
- Focused component, adapter, contract, safety, and screenshot verification updates.
- Generator notes documenting red/green evidence.

## Out Of Scope

- Real OTA collection.
- Browser automation.
- Account login, credential storage, cookies, session handling, CAPTCHA handling, or source-specific bypass flows.
- File upload, persistence, database schema, backend API, scheduled jobs, queues, or external network requests.
- Official API integration implementation.
- Channel manager or PMS integration.
- Pricing recommendations or automatic pricing actions.
- New pricing thresholds or alert math changes.

## Acceptance Criteria

1. `DemoDataset` exposes `dataScope` and `captureEntry` with the fields listed above.
2. `dataScope` is derived from the domain seed rather than duplicated as unrelated static copy.
3. Scope output preserves property, competitor group, source, stay date, room type, occupancy, currency, tax/fee, meal plan, cancellation policy, and capture-time boundaries.
4. `captureEntry.productionConnectionEnabled` is always `false` in this slice.
5. Capture entry options include fixture demo, manual import preview, and approved API preview.
6. Every capture entry option requires human review.
7. Setup/Data Scope screen visibly shows data range, rate basis, sample coverage, source status, and capture entry options.
8. UI copy remains customer-safe and does not mention internal collection mechanics, credentials, cookies, tokens, CAPTCHA, crawler, scraper, browser automation, storage, automatic pricing, or recommended price fields.
9. Existing overview, calendar, market, alert review, and setup screenshots remain responsive with no incoherent overlap.
10. Existing F-008/F-009/F-010 domain and data-flow tests continue to pass.

## Generator Handoff

Use `docs/superpowers/plans/2026-05-19-data-scope-capture-entry.md`.

Generator must use strict `superpowers:test-driven-development`: write the contract/adapter/component tests first, verify red, implement the minimum code and styling, verify green, then run full app verification and safety scans.

## Evaluator Handoff

Evaluator must independently verify that the Setup screen and dataset now expose bounded data scope and capture entry behavior without adding live collection, credential handling, persistence, automatic pricing, or unsafe visible copy. Evaluator should also verify PR hygiene after F-010 PR #4 has either merged or the F-011 branch has been rebased onto the accepted base.
