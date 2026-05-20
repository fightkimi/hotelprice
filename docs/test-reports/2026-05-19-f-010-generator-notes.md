# F-010 Generator Notes

Feature: `F-010-owner-position-evidence-enrichment`

Role: Generator

Branch: `feature/f-010-owner-position-evidence-planning`

## Scope

Implemented the approved F-010 slice only:

- added explicit alert evidence roles;
- added `priceCents` to alert evidence;
- included one `owner_observation` plus competitor `competitor_sample` evidence for owner-position alerts;
- labeled F-009 evidence markers with customer-safe role labels;
- preserved existing thresholds, fixture/manual data boundaries, and human-review-only behavior.

No API routes, persistence, live source integration, browser automation, credentials, cookies, CAPTCHA handling, recommended prices, or automatic pricing behavior were added.

## TDD Evidence

### Domain Evidence Roles

Red:

```bash
cd app
/opt/homebrew/bin/npm test -- tests/domain/alertRules.test.ts
```

Result: failed as expected because owner-position evidence did not include `owner_observation`, and alert evidence did not expose `role` / `priceCents`.

Green:

```bash
cd app
/opt/homebrew/bin/npm test -- tests/domain/alertRules.test.ts
```

Result: passed, `1 file / 12 tests`.

Commit: `3897879 feat: enrich owner position alert evidence`

### UI Evidence Marker Labels

Red:

```bash
cd app
/opt/homebrew/bin/npm test -- tests/data/domainDrivenDataset.test.ts
```

Result: failed as expected because owner-position evidence markers did not distinguish owner observation from competitor samples.

Green:

```bash
cd app
/opt/homebrew/bin/npm test -- tests/data/domainDrivenDataset.test.ts
```

Result: passed, `1 file / 9 tests`.

Commit: `ebf2b6f feat: label owner position evidence markers`

## Verification

Targeted regression:

```bash
cd app
/opt/homebrew/bin/npm test -- tests/domain/alertRules.test.ts tests/data/domainDrivenDataset.test.ts tests/contract/demoDataset.test.ts tests/domain/complianceScan.test.ts
```

Result: passed, `4 files / 27 tests`.

Full app verification:

```bash
cd app
/opt/homebrew/bin/npm run verify
```

Result: passed. Build passed, Vitest passed with `12 files / 62 tests`, and Playwright passed with `13 tests`.

Project checks:

```bash
python3 scripts/triad_doctor.py
python3 scripts/test_triad_doctor.py
python3 -m json.tool progress.json
python3 -m json.tool features.json
python3 -m json.tool backlog.json
node tests/client_demo_prototype.test.js
```

Result: all passed. Prototype regression passed with `14 checks`.

Static safety scan:

```bash
rg -n "(cookie|token|credential|captcha|scrap|scrape|crawler|puppeteer|playwright|fetch\\(|localStorage|sessionStorage|IndexedDB|automatic pricing|auto[- ]?price|recommendedPriceCents|自动调价|自动改价|爬虫|抓取|验证码|凭证|密钥)" app/src/data/domainDrivenDataset.ts app/src/domain/pricing
```

Result: no matches.

## Handoff

F-010 is ready for Evaluator verification through `B-036`. This is not a final acceptance conclusion.
