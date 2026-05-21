# F-017 Source Strategy And Compliance Gate

日期: 2026-05-21
角色: Planner
状态: Generator-ready governance planning

## Problem Statement

F-007 到 F-016 已经把正式 React app 从视觉、领域边界、日期详情、提醒复核和竞品下钻推进到可演示的业务工作台。但当前产品仍只使用 fixture/manual seed 数据。下一阶段如果直接进入真实平台采集、导入或连接器实现，就会触碰授权、平台条款、rate limit、凭证、cookie/session、验证码、数据保存和自动定价等高风险问题。

F-017 的目标不是实现真实采集，而是建立 Phase 3 的来源策略与合规闸门: 先定义哪些来源类型可以进入产品路线、哪些必须禁止、每类来源需要什么授权证据、能覆盖哪些价格边界、能支持哪些后续 feature。只有 F-017 被接受后，后续 Generator 才能进入 manual import preview、source registry preview、data quality report 或 capture job model 等实现切片。

## Current Project Facts

- PR #13 已将 F-016 post-merge status 合并到 `main`, merge commit 为 `5c4eef3`。
- 正式产品基线包含 F-007 到 F-016, 但没有真实数据连接、后端、数据库或持久化。
- F-008 已定义 comparable rate key、availability/stale、snapshot ordering、alert rules 和 compliance scan。
- F-011 已在 Setup/Data Scope 中展示 data scope 与 capture entry preview, 且 `productionConnectionEnabled` 必须保持 false。
- F-014、F-015、F-016 已分别覆盖日期详情、提醒复核和竞品下钻的证据/边界可见性。
- `PROJECT_PRD.md` 明确要求: 新数据来源 feature 必须先经过 Planner 合规规格。
- 当前禁止范围包括未授权 live collection、browser automation、credential、cookie/session、CAPTCHA handling、storage、recommended price 和 automatic pricing。

## Domain Classification

- Affected domain: channel/source connector strategy, data scope, source compliance, future manual import, future capture job model.
- Data boundary: property-bound, competitor-bound, channel-bound, stay-date-bound, capture-time-bound, currency-bound, room-type-bound, occupancy-bound, tax/fee-bound and cancellation-policy-bound.
- Data type in this slice: documentation and governance only. No production data, no seed data change, no mocked runtime fixture change.
- Capture method: not implemented in F-017. Future capture or import work must be derived from the accepted source strategy.
- Pricing automation: out of scope. Human approval remains mandatory for any pricing decision.

## Route Options

### Option A: Manual Import First

Start with CSV/Excel upload or paste preview. This creates a visible product feature quickly, but without a source strategy it can accidentally normalize unauthorized exports or hide critical licensing assumptions.

### Option B: Source Strategy And Compliance Gate First

Define the allowed source classes, evidence requirements, prohibited methods, source decision matrix, and follow-up feature order before implementing any data ingestion. This is slower than a UI slice, but it protects the project from building on an invalid source assumption.

### Option C: Capture Job Model First

Model source policy, run status, rate limits and audit fields before UI import. This is useful later, but too abstract before the project decides which source classes are allowed.

## Chosen Route

Choose Option B: **Source Strategy And Compliance Gate First**.

Rationale:

- It directly addresses the highest Phase 3 risk: unauthorized or ambiguous data sourcing.
- It preserves the trust built by F-008 through F-016, where every price signal is bounded and human-review-only.
- It allows F-018 to be a safer manual import preview with clear constraints.
- It prevents Generator from accidentally implementing live collection, credential handling or browser automation under a vague "data source" task.

## Scope

F-017 Planner may modify:

- `docs/specs/2026-05-21-source-strategy-and-compliance-gate.md`
- `docs/superpowers/plans/2026-05-21-source-strategy-and-compliance-gate.md`
- `docs/specs/PROJECT_PRD.md`
- `docs/specs/PROJECT_DEVELOPMENT_PLAN.md`
- `.auto-memory/project-status.md`
- `progress.json`
- `features.json`
- `backlog.json`

F-017 must not modify:

- `app/src/**`
- `app/tests/**`
- `app/package.json`
- `app/package-lock.json`
- build config, migrations, scripts, or screenshot artifacts

## Source Classes

### Allowed For Near-Term Product Planning

1. User manual import
   - Examples: user-uploaded CSV/Excel export, user paste from an authorized internal report.
   - Required evidence: user owns or is authorized to provide the file; UI labels it as user-provided data.
   - Allowed next feature: manual import preview and local validation.
   - Not allowed yet: production persistence or automated scheduled ingest.

2. Official API
   - Examples: source-provided partner API or documented official endpoint.
   - Required evidence: API documentation, authentication model, permitted use, rate limits, data retention limits.
   - Allowed next feature: source policy registry and typed connector interface specification.
   - Not allowed yet: storing credentials or running live jobs without auth/security specs.

3. Partner or licensed data feed
   - Examples: contracted market data provider, channel partner export feed.
   - Required evidence: contract or license summary, permitted fields, refresh cadence, redistribution limits.
   - Allowed next feature: source registry and data quality scoring.
   - Not allowed yet: assuming OTA parity or complete market coverage.

4. Channel manager or PMS export
   - Examples: hotel-owned channel manager export, PMS report, revenue-management export.
   - Required evidence: property authorization, field dictionary, hotel/room/channel/date coverage.
   - Allowed next feature: manual import preview and field mapping.
   - Not allowed yet: automated bidirectional sync or price updates.

5. Public event context
   - Examples: public holiday calendar, venue event calendar with acceptable use terms.
   - Required evidence: source URL, terms status, refresh method, event category, region coverage.
   - Allowed next feature: event context enrichment spec.
   - Not allowed yet: using event context to auto-change pricing.

### Prohibited Until Explicit Future Approval

- Unauthorized OTA scraping or live collection.
- Browser automation against OTA pages.
- Credential, cookie, session or CAPTCHA handling.
- Circumventing bot protections, rate limits or access controls.
- Storing customer credentials or platform secrets.
- Automatic price recommendation presented as final decision.
- Automatic price publishing or channel-manager writeback.
- Any data source whose terms disallow the intended use.

## Source Decision Matrix

Every future source proposal must be evaluated with this matrix before Generator implementation:

| Field | Requirement |
| --- | --- |
| Source class | One of manual import, official API, partner feed, channel manager/PMS export, public event context |
| Authorization evidence | Who grants access and what written or product evidence proves it |
| Terms status | Allowed, restricted, unknown, or prohibited |
| Data boundary coverage | property, competitor, channel, stay date, capture time, currency, room type, occupancy, tax/fee, cancellation policy |
| Refresh model | one-time manual, repeated manual, scheduled authorized feed, or event calendar refresh |
| Rate limit policy | not applicable, documented limit, contracted limit, or unknown |
| Secret handling | no secret, user-provided file only, OAuth/API key required, or disallowed |
| Storage status | preview-only, temporary local, persisted after future model, or disallowed |
| Audit evidence | import timestamp, file name hash, source id, source policy version, operator |
| Product permission | allowed next slice, needs legal/product decision, or blocked |

## F-017 Decisions

- The first Phase 3 implementation slice after F-017 should be `F-018-manual-import-preview-and-field-mapping`.
- Manual import preview should remain local/demo-safe: parse a user-provided CSV/Excel-like fixture or pasted rows, show field mapping and validation, and avoid persistence.
- Official API, partner feed and channel manager/PMS sources should not be implemented until a source registry and secret-handling/auth spec exists.
- Capture job modeling should wait until at least one allowed source class has a clear policy and source id shape.
- Data quality reporting can follow manual import preview because it can score sample coverage, missing data, stale samples and rate-key completeness without live collection.

## Generator Handoff

F-017 itself has no product-code Generator task. Future Generator work must start from an accepted F-017 and a separate F-018 spec/plan.

When F-018 starts, Generator must:

- Use `superpowers:test-driven-development`.
- Keep all import behavior preview-only unless a later persistence spec is approved.
- Add tests before parser, mapping, validation or UI changes.
- Preserve rate boundaries from F-008/F-014/F-016.
- Keep unsafe source methods and automatic pricing out of code and visible copy.

## Evaluator Checklist

Evaluator should verify:

- F-017 is documentation/state-only and does not modify product code, tests, runtime scripts or build config.
- The source classes and prohibited methods are explicit enough to block unsafe Generator work.
- Manual import, official API, partner feed, channel manager/PMS export and public event context have distinct evidence requirements.
- The source decision matrix covers property, competitor, channel, stay date, capture time, currency, room type, occupancy, tax/fee and cancellation-policy boundaries.
- The next slice recommendation is clear: F-018 manual import preview before live collection or capture job execution.
- PROJECT_PRD, PROJECT_DEVELOPMENT_PLAN, project-status, progress, features and backlog reflect PR #13 merged and F-017 planning state.
- JSON, Triad, prototype regression and `git diff --check` pass.

## Acceptance Criteria

- F-017 spec and plan exist and are linked from `features.json`.
- `backlog.json` marks B-062 done and creates the next Evaluator task.
- `progress.json` current sprint is `F-017-source-strategy-and-compliance-gate`.
- Project PRD and development plan state that Phase 3 begins with source strategy before data ingestion implementation.
- No app source, product tests, package files, migrations, runtime scripts or screenshot artifacts are modified.
- Verification commands pass:
  - `python3 scripts/triad_doctor.py`
  - `python3 scripts/test_triad_doctor.py`
  - `python3 -m json.tool progress.json`
  - `python3 -m json.tool features.json`
  - `python3 -m json.tool backlog.json`
  - `node tests/client_demo_prototype.test.js`
  - `git diff --check`
