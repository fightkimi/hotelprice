# F-002 Client Demo HTML Prototype Spec

## Role And Source Context

- Planner role: non-implementation. This spec defines the customer-facing HTML prototype scope and handoff criteria.
- Source PRD: `/Users/kimi/Desktop/hotel_competitor_price_monitor_prd_v0.1.md`
- Related domain slice: `F-001-hotel-rate-watch-mvp`
- Superpowers order used for this Planner pass: brainstorming, writing-plans, executing-plans, test-driven-development, verification-before-completion.

## Problem Statement

The team needs a client-facing HTML prototype that helps hotel owners quickly understand the product value before the backend is built. The prototype should make the "competitor price radar" concrete: what the owner sees every day, what counts as a price movement, and how alerts help them decide whether to pay attention to pricing.

## Recommended Prototype Approach

Use a static, self-contained HTML prototype that opens locally and behaves like a small operational dashboard. The first screen should be the actual product experience, not a marketing landing page. Demo data should be embedded and clearly labeled as demo data.

### Alternatives Considered

1. Static single-page dashboard, recommended.
   - Pros: fastest to build, easy to share, no server needed, low demo risk.
   - Cons: limited realism for multi-step onboarding.
2. Multi-page clickthrough.
   - Pros: closer to a real app IA.
   - Cons: more wiring, harder to polish quickly.
3. Simulated full app with generated backend-like state.
   - Pros: strongest product illusion.
   - Cons: too much implementation before customer feedback.

Recommendation: build a single static app shell with tabbed views and interactive demo state. This gives enough depth for a client walkthrough without creating a fake production system.

## Target Audience

- Primary: small hotel owners, homestay operators, apartment hotel operators, and boutique hotel decision-makers.
- Secondary: store managers or OTA operators who report market changes to the owner.
- Demo viewer mindset: wants to know "what do I see every morning, what changed, and what should I pay attention to?"

## Prototype Goals

- Show the daily decision loop: market overview, important dates, competitor changes, and alerts.
- Demonstrate why manual OTA checking is painful and how the product reduces that work.
- Explain price口径 through subtle labels, not long instructional text.
- Make compliance/data caveats visible without making the UI feel defensive.
- Give sales or discovery calls a concrete visual anchor.

## In Scope

- Static HTML/CSS/JavaScript prototype.
- Local file open support, or a simple static dev server if Generator chooses one.
- Chinese UI copy.
- Embedded demo data for one owner hotel, ten competitors, one channel, future 30 days, and a few alert examples.
- App-like navigation with these views:
  - Overview dashboard
  - Price calendar
  - Competitor monitor
  - Alert center
  - Setup preview
- Lightweight interactions:
  - switch tabs;
  - filter alerts by type;
  - click a date to update a detail panel;
  - toggle competitor level between core and reference;
  - open an alert detail drawer or panel.
- Demo labels for source, capture time, currency, tax/fee basis, and "human review required".
- Responsive desktop and mobile layouts.

## Out Of Scope

- Real OTA scraping or API collection.
- Login, authentication, accounts, or persistence.
- Backend integration.
- Automatic pricing changes.
- AI-generated price decisions.
- Full onboarding wizard.
- Export, billing, permissions, or multi-store management.
- External CDN dependencies that prevent local/offline viewing.

## Design Direction

- Feel: quiet operational SaaS tool, not a marketing page.
- Layout: dense but readable dashboard; first viewport should show actionable product information.
- Visual hierarchy:
  - top summary strip for owner hotel, channel, capture time, and demo-data badge;
  - compact KPI blocks for market movement, alert count, weekend opportunity, and owner price risk;
  - main work area split between calendar/list and detail panel;
  - alert center as a high-signal operational queue.
- Avoid:
  - oversized hero section;
  - decorative gradient blobs;
  - nested cards;
  - one-note dark blue, purple, beige, or orange palette;
  - text-heavy feature explanations inside the app.

## Demo Data Requirements

- Owner hotel: one urban business hotel with a plausible public lowest rate.
- Competitors: ten nearby hotels, with six core competitors and four market references.
- Channel: one named demo channel such as `携程演示源`.
- Date range: future 30 days from the prototype's fixed demo date.
- Alert examples:
  - weekend market average up 16 percent;
  - one competitor down 24 percent;
  - owner hotel 18 percent below core competitor average;
  - a low-sample-size date marked as "样本不足".
- Every price display should include CNY and a clear demo/source cue somewhere nearby.

## Key Screens

### Overview Dashboard

The landing screen after opening the prototype. It should answer:

- What changed in the market?
- Which stay date matters most?
- Is my current price below or above the core competitor average?
- What should I review first?

Required elements:

- owner hotel title and monitoring scope;
- source/capture badge;
- four compact metrics;
- seven-day trend strip;
- top three alerts;
- "建议关注" wording, not hard price commands.

### Price Calendar

A 30-day date grid showing core competitor average, min/max range, weekend markers, and movement tags. Clicking a date updates a side panel with competitor rows and alert rationale.

### Competitor Monitor

A table/list showing competitor name, level, distance, current lowest rate, change percent, last capture time, and monitoring status. Include a core/reference segmented toggle.

### Alert Center

An operational queue with filters for all,涨价,降价,市场均价,低价风险. Each alert should show severity, affected stay date, price movement, and a detail panel. It must not say "自动调价".

### Setup Preview

A compact preview of how setup works:

- enter owner hotel;
- choose competitors;
- choose channel and date range;
- confirm demo monitoring.

This view is illustrative only and should not imply live data collection is already configured.

## Acceptance Criteria

1. Opening `prototypes/client-demo/index.html` shows the dashboard immediately without a build step.
2. The UI contains no marketing landing hero before the product dashboard.
3. Tabs or navigation switch between overview, price calendar, competitor monitor, alert center, and setup preview.
4. Alert filters update visible alerts.
5. Clicking a calendar date updates the date detail panel.
6. Competitor level toggle changes the competitor list between core and reference.
7. All demo data is embedded locally and clearly labeled as demo or sample data.
8. No live network collection, OTA scraping, credentials, cookies, browser automation logic, or automatic pricing logic is present.
9. Desktop and mobile screenshots show no overlapping text or broken controls.
10. The prototype uses customer-safe Chinese copy and "建议关注" style language for pricing advice.

## Generator Handoff Summary

Implement `F-002-client-demo-html-prototype` from `docs/superpowers/plans/2026-05-18-client-demo-html-prototype.md`. Keep the prototype self-contained, client-demo oriented, and visually polished enough for a sales or discovery call. Use TDD for JavaScript behavior and browser/screenshot checks for visual acceptance.

## Evaluator Handoff Summary

Evaluator should verify local open behavior, interaction behavior, responsive screenshots, compliance wording, absence of live collection code, and consistency with the PRD's MVP positioning.
