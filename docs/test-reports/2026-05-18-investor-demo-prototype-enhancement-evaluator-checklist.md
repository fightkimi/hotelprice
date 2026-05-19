# F-003 Investor Demo Prototype Enhancement Evaluator Checklist

## Scope

- Feature: `F-003-investor-demo-prototype-enhancement`
- Prototype path: `prototypes/client-demo/index.html`
- Data type: local demo/sample data only
- Role handoff: Generator implementation ready for independent Evaluator review

## Investor Narrative

- [ ] Dashboard remains first screen and reads as a product interface, not a marketing page.
- [ ] First screen shows room coverage, platform coverage, event trend, and platform gap signals.
- [ ] Trend chart shows owner rate, core competitor average, and event annotations.
- [ ] Heatmap calendar communicates event/price movement strength beyond text labels.
- [ ] Platform gap bar chart is visible and legible.
- [ ] Event timeline clearly marks holiday, exhibition, and concert demo dates.

## Interactions

- [ ] Room type selector updates overview, calendar, competitor rows, alerts, and insight panels.
- [ ] Platform selector updates visible source context and platform comparison.
- [ ] Demand context selector can focus holiday, exhibition, and concert dates.
- [ ] Calendar click updates event detail, room breakdown, and platform bars.
- [ ] Alert filters include 房型价差, 平台价差, and 节假日趋势.

## Visual QA

- [ ] Desktop overview shows controls, capability strip, and trend chart without overlap.
- [ ] Desktop calendar heatmap and detail panel are readable.
- [ ] Desktop platform comparison bars fit their container.
- [ ] Mobile overview controls and chart labels do not overlap.
- [ ] Mobile alert center filters wrap cleanly.
- [ ] Visual system feels polished enough for investor screening: balanced palette, consistent 8px radii, chart-forward layout, no crude default-table feel.

## Compliance

- [ ] All room, platform, price, and event trend values are clearly demo/sample data.
- [ ] Copy uses `建议关注` and `需人工复核`.
- [ ] No live data collection behavior is present.
- [ ] No credentials, private supplier details, or account-flow assumptions are present.
- [ ] No direct price-change claim appears.

## Suggested Commands

```bash
node tests/client_demo_prototype.test.js
python3 scripts/triad_doctor.py
python3 scripts/test_triad_doctor.py
python3 -m json.tool progress.json
python3 -m json.tool features.json
python3 -m json.tool backlog.json
```
