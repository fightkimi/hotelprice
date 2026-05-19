# F-007 Fix Generator Notes

Date: 2026-05-19
Role: Generator-Codex
Feature: `F-007-formal-app-foundation`
Fix source: `docs/test-reports/2026-05-19-f-007-formal-app-foundation-evaluator.md`

## TDD Evidence

- ContextRibbon contract RED: `/opt/homebrew/bin/npm test -- tests/components/contextRibbon.test.tsx` failed because `竞品组` was not rendered and ribbon items were static `div`/`span` elements.
- ContextRibbon contract GREEN: `/opt/homebrew/bin/npm test -- tests/components/contextRibbon.test.tsx` passed with 1 test after adding competitor group, demand context, read-only selector buttons, and focus styling.
- Screenshot viewport RED: `/opt/homebrew/bin/npm run screenshots` failed after adding PNG dimension assertions; full-page captures produced heights such as `390 x 2025`, `390 x 1845`, and `768 x 1098`.
- Screenshot viewport GREEN: `/opt/homebrew/bin/npm run screenshots` passed with 13 Playwright tests after removing `fullPage: true`; `file docs/test-reports/f-007-app-foundation/*.png` showed all 12 screenshots at exact matrix dimensions.
- Token/raw-color contract RED: `/opt/homebrew/bin/npm test -- tests/contract/tokens.test.ts` failed because `app/src/styles/layout.css` contained raw `rgba(...)` values.
- Token/raw-color contract GREEN: `/opt/homebrew/bin/npm test -- tests/contract/tokens.test.ts` passed with 3 tests after moving alpha, shadow, overlay, and border colors into `app/src/styles/tokens.css`.

## Final Verification

- `/opt/homebrew/bin/npm run verify` from `app/`: passed before handoff with build success, Vitest 6 files / 23 tests, and Playwright 13 tests.
- `python3 scripts/triad_doctor.py`: passed; current branch is `feature/f-007-formal-app-foundation`.
- `python3 scripts/test_triad_doctor.py`: passed.
- `python3 -m json.tool progress.json`: passed; project status is `reverifying`.
- `python3 -m json.tool features.json`: passed; F-007 status is `reverifying`.
- `python3 -m json.tool backlog.json`: passed; B-020 is `done`, B-021 is `new`.
- `node tests/client_demo_prototype.test.js`: passed with 14 OK checks.
- `git status --short`: before staging, only intended project source/docs/status directories appeared as untracked; generated artifacts were ignored by `.gitignore`.
- `git status --short --ignored`: showed `.DS_Store`, `app/dist/`, `app/node_modules/`, `app/test-results/`, and TypeScript build info as ignored.
- `git diff --stat origin/main...HEAD`: pending until commit.
