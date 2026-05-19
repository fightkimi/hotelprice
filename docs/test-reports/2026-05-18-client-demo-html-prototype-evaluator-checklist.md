# F-002 Client Demo HTML Prototype Evaluator Checklist

## Scope

- Feature: `F-002-client-demo-html-prototype`
- Prototype path: `prototypes/client-demo/index.html`
- Data type: local demo/sample data only
- Role handoff: Generator implementation ready for independent Evaluator review

## Product Behavior

- [ ] Opening `prototypes/client-demo/index.html` directly shows the dashboard first.
- [ ] Navigation switches between 今日概览、价格日历、竞品监控、异常提醒、设置预览.
- [ ] Clicking a calendar date updates the detail panel without page reload.
- [ ] Competitor filters show all 10, core 6, and reference 4 competitors.
- [ ] Alert filters update the queue for all, 涨价, 降价, 市场均价, 低价风险.
- [ ] Clicking an alert updates the detail panel and shows `需人工复核`.

## Visual And Responsive Review

- [ ] Desktop dashboard is dense and operational, with no marketing-first screen.
- [ ] Desktop calendar detail is readable and date cells do not overlap.
- [ ] Mobile dashboard has no clipped navigation, KPI, or source labels.
- [ ] Mobile alert center has readable filters, queue rows, and detail panel.
- [ ] Colors are not a one-note purple, dark blue, beige, or orange palette.

## Compliance And Copy

- [ ] All displayed prices are clearly demo/sample data.
- [ ] Source, capture time, currency, tax/fee basis, occupancy, and room type are visible.
- [ ] Copy uses `建议关注` and `需人工复核` instead of hard pricing commands.
- [ ] No live OTA collection, credential handling, account flow, or backend integration is implied.
- [ ] No automatic price change claim appears in customer-facing copy.

## Suggested Commands

```bash
node tests/client_demo_prototype.test.js
python3 scripts/triad_doctor.py
python3 scripts/test_triad_doctor.py
python3 -m json.tool progress.json
python3 -m json.tool features.json
python3 -m json.tool backlog.json
```
