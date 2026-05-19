# Hotel Rate Watch MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first compliance-safe MVP core for manually configured hotel competitor lowest-rate monitoring and alert candidate generation.

**Architecture:** Create a small Python standard-library domain package with explicit rate contracts, a fixture/manual source loader, comparison services, and a CLI/report boundary. Keep live OTA collection out of this slice; source data is local fixture or manual input and every alert is marked for human review.

**Tech Stack:** Python 3 standard library, `unittest`, JSON fixtures, project-local Triad workflow checks.

---

## Scope Check

This plan covers one working backend/domain slice: manual profile input, fixture rate ingestion, comparable-rate matching, alert candidate generation, and a text/JSON report. It does not include a web app, database migrations, live OTA connectors, map discovery, multi-platform matching, or automatic pricing changes.

## Planned File Structure

- Create `src/hotel_pricing_capture/__init__.py`: package marker and public version.
- Create `src/hotel_pricing_capture/models.py`: dataclasses and validation for hotels, rate snapshots, rate keys, and alerts.
- Create `src/hotel_pricing_capture/fixture_source.py`: local JSON fixture loader with source-kind validation.
- Create `src/hotel_pricing_capture/alerts.py`: pure comparison and alert-rule functions.
- Create `src/hotel_pricing_capture/reporting.py`: report assembly with source/capture/rate-basis labels.
- Create `src/hotel_pricing_capture/cli.py`: command-line entry point for fixture input and report output.
- Create `tests/test_models.py`: tests for data contracts and comparable key behavior.
- Create `tests/test_fixture_source.py`: tests for fixture loading and invalid source rejection.
- Create `tests/test_alerts.py`: tests for competitor movement, market average, owner risk, and suppressed alerts.
- Create `tests/test_reporting_cli.py`: tests for report labels and no-network fixture flow.

### Task 1: Establish Domain Models

**Files:**
- Create: `src/hotel_pricing_capture/__init__.py`
- Create: `src/hotel_pricing_capture/models.py`
- Test: `tests/test_models.py`

- [ ] **Step 1: Write the failing model tests**

Create `tests/test_models.py` with tests equivalent to:

```python
import unittest
from datetime import date, datetime, timezone

from hotel_pricing_capture.models import Hotel, RateSnapshot


class ModelTests(unittest.TestCase):
    def test_rate_snapshots_with_same_rate_key_are_comparable(self):
        first = RateSnapshot(
            hotel_id="comp-a",
            channel="ctrip_fixture",
            stay_date=date(2026, 5, 23),
            checkout_date=date(2026, 5, 24),
            captured_at=datetime(2026, 5, 18, 8, 0, tzinfo=timezone.utc),
            currency="CNY",
            price=300.0,
            tax_fee_basis="included",
            occupancy_adults=2,
            room_type_label="lowest_public_rate",
            meal_plan="unknown",
            cancellation_policy="unknown",
            source_kind="fixture",
        )
        second = RateSnapshot(
            hotel_id="comp-a",
            channel="ctrip_fixture",
            stay_date=date(2026, 5, 23),
            checkout_date=date(2026, 5, 24),
            captured_at=datetime(2026, 5, 18, 18, 0, tzinfo=timezone.utc),
            currency="CNY",
            price=330.0,
            tax_fee_basis="included",
            occupancy_adults=2,
            room_type_label="lowest_public_rate",
            meal_plan="unknown",
            cancellation_policy="unknown",
            source_kind="fixture",
        )

        self.assertEqual(first.rate_key(), second.rate_key())

    def test_invalid_source_kind_is_rejected(self):
        with self.assertRaises(ValueError):
            Hotel(
                id="owner",
                name="Owner Hotel",
                role="owner",
                competitor_level="owner",
                channel_url="https://example.invalid/owner",
                active=True,
            ).validate_source_kind("scraped")


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run tests and verify they fail for missing package**

Run: `PYTHONPATH=src python3 -m unittest tests.test_models -v`

Expected: FAIL or ERROR because `hotel_pricing_capture.models` does not exist.

- [ ] **Step 3: Implement minimal dataclasses and validation**

Create `models.py` with:

- `Hotel` dataclass fields from the spec.
- `RateSnapshot` dataclass fields from the spec.
- `RateSnapshot.rate_key()` returning a tuple of channel, stay date, checkout date, currency, tax/fee basis, occupancy adults, room type label, meal plan, and cancellation policy.
- source kind allowlist: `fixture`, `manual`, `approved_api`.
- role allowlist: `owner`, `competitor`.
- competitor level allowlist: `owner`, `core`, `reference`.

- [ ] **Step 4: Run model tests and verify they pass**

Run: `PYTHONPATH=src python3 -m unittest tests.test_models -v`

Expected: PASS with 2 tests.

### Task 2: Load Fixture Source Data

**Files:**
- Modify: `src/hotel_pricing_capture/fixture_source.py`
- Test: `tests/test_fixture_source.py`

- [ ] **Step 1: Write failing fixture loader tests**

Create tests covering:

- loading one owner hotel, three core competitors, and two capture batches from local JSON;
- rejecting a record with `source_kind` equal to `scraped`;
- parsing ISO date and datetime strings into Python date/datetime values.

Use `tempfile.TemporaryDirectory()` to create fixture JSON during the test. The fixture should include `source_kind: "fixture"` for all valid rate snapshots.

- [ ] **Step 2: Run tests and verify they fail for missing loader**

Run: `PYTHONPATH=src python3 -m unittest tests.test_fixture_source -v`

Expected: FAIL or ERROR because `fixture_source.load_fixture` does not exist.

- [ ] **Step 3: Implement `load_fixture(path)`**

Implement a loader that returns `(hotels, snapshots)` where:

- `hotels` is a list of `Hotel`;
- `snapshots` is a list of `RateSnapshot`;
- invalid source kinds raise `ValueError`;
- invalid date or datetime strings raise `ValueError` with the field name in the message.

- [ ] **Step 4: Run fixture loader tests and verify they pass**

Run: `PYTHONPATH=src python3 -m unittest tests.test_fixture_source -v`

Expected: PASS.

### Task 3: Generate Alert Candidates

**Files:**
- Create: `src/hotel_pricing_capture/alerts.py`
- Test: `tests/test_alerts.py`

- [ ] **Step 1: Write failing alert rule tests**

Create tests for these behaviors:

- competitor increase alert when price changes from 300 to 330 for the same rate key;
- competitor decrease alert when price changes from 300 to 260 for the same rate key;
- no competitor alert when price changes from 300 to 320 because the change is below 10 percent;
- market average alert when three core competitors move from average 300 to average 330;
- no market average alert when only two core competitors have comparable rates;
- owner low-price risk when owner is 20 percent or more below core average;
- owner high-price risk when owner is 20 percent or more above core average;
- no alert when currency or tax/fee basis differs.

- [ ] **Step 2: Run alert tests and verify they fail for missing alert engine**

Run: `PYTHONPATH=src python3 -m unittest tests.test_alerts -v`

Expected: FAIL or ERROR because `hotel_pricing_capture.alerts` does not exist.

- [ ] **Step 3: Implement pure alert functions**

Implement:

- `compare_latest_to_previous(snapshots, hotels)` returning alert candidates for individual hotel movement.
- `compare_market_average(snapshots, hotels, minimum_core_sample=3)` returning core market alerts.
- `compare_owner_to_market(snapshots, hotels, minimum_core_sample=3)` returning owner low/high risk alerts.

All alert candidates must include `requires_human_review=True` and must not recommend a specific new price.

- [ ] **Step 4: Run alert tests and verify they pass**

Run: `PYTHONPATH=src python3 -m unittest tests.test_alerts -v`

Expected: PASS.

### Task 4: Assemble Reports And CLI

**Files:**
- Create: `src/hotel_pricing_capture/reporting.py`
- Create: `src/hotel_pricing_capture/cli.py`
- Test: `tests/test_reporting_cli.py`

- [ ] **Step 1: Write failing report and CLI tests**

Create tests that:

- call report assembly with fixture hotels, snapshots, and generated alerts;
- assert the report includes `source_kind`, `channel`, `captured_at`, `currency`, `tax_fee_basis`, and `requires_human_review`;
- run the CLI with a fixture JSON path and assert it exits with code 0;
- assert CLI output contains no credential, cookie, browser, CAPTCHA, or scraper wording.

- [ ] **Step 2: Run report tests and verify they fail for missing modules**

Run: `PYTHONPATH=src python3 -m unittest tests.test_reporting_cli -v`

Expected: FAIL or ERROR because reporting and CLI modules do not exist.

- [ ] **Step 3: Implement reporting and CLI**

Implement:

- `build_report(hotels, snapshots, alerts)` returning a JSON-serializable dictionary;
- `main(argv=None)` in `cli.py` that accepts `--fixture <path>` and prints report JSON to stdout;
- no network calls and no browser automation imports.

- [ ] **Step 4: Run report tests and verify they pass**

Run: `PYTHONPATH=src python3 -m unittest tests.test_reporting_cli -v`

Expected: PASS.

### Task 5: Full Verification And Handoff

**Files:**
- Modify only if needed: `features.json`, `progress.json`, `backlog.json`, or docs assigned by Planner.

- [ ] **Step 1: Run all product tests**

Run: `PYTHONPATH=src python3 -m unittest discover -s tests -v`

Expected: PASS with all model, fixture source, alert, reporting, and CLI tests.

- [ ] **Step 2: Run Triad and JSON checks**

Run:

```bash
python3 scripts/triad_doctor.py
python3 scripts/test_triad_doctor.py
python3 -m json.tool progress.json
python3 -m json.tool features.json
python3 -m json.tool backlog.json
```

Expected: all commands exit 0 and JSON prints successfully.

- [ ] **Step 3: Confirm compliance boundaries**

Inspect the implementation and verify:

- no live OTA scraping;
- no browser automation;
- no credential, cookie, token, or private API handling;
- no automatic pricing update;
- every alert is marked for human review.

- [ ] **Step 4: Prepare Evaluator handoff**

Summarize:

- tests that were written and their red/green evidence;
- commands run and exit codes;
- any gaps or deferred work;
- files changed.
