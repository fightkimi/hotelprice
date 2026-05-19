# Hotel Pricing Capture Triad Workflow

Use this workflow to develop the project through small, reviewable feature slices.

## Work Rhythm

```text
context scan -> requirement spec -> implementation plan -> implementation -> independent evaluation -> PR
```

Run this before and after each batch:

```bash
python3 scripts/triad_doctor.py
```

## Superpowers Stage Gate

Every requirement must read `.auto-memory/superpowers-workflow.md` and use the skills in order:

1. `superpowers:brainstorming`
2. `superpowers:writing-plans`
3. `superpowers:executing-plans` or `superpowers:subagent-driven-development`
4. `superpowers:test-driven-development`
5. `superpowers:verification-before-completion`

Planner uses the first two stages to produce specs and handoffs. Generator executes plans and codes with TDD. Evaluator verifies with fresh evidence before any signoff.

## Branches And PRs

Use feature branches and PRs for all changes. Do not commit or push directly to `main` or `master`.

## Planner Prompt

```text
请按 AGENTS.md、CLAUDE.md、harness-rules.md 和 planner.md，以 Planner 身份工作。
先读取 .auto-memory/MEMORY.md、.auto-memory/project-status.md、.auto-memory/superpowers-workflow.md、progress.json、features.json。
必须按顺序使用 Superpowers Skills。
请分析当前酒店定价捕捉需求，输出规格、任务拆分、Generator 任务和 Evaluator 验收清单。
不要修改产品代码、测试代码、迁移或构建配置。
```

## Generator Prompt

```text
请按 AGENTS.md、CLAUDE.md、harness-rules.md 和 generator.md，以 Generator 身份工作。
先读取 .auto-memory/MEMORY.md、.auto-memory/project-status.md、.auto-memory/superpowers-workflow.md、progress.json、features.json 和当前 plan/spec。
必须按顺序使用 Superpowers Skills；实现前必须有 writing-plans，编码时必须遵守 test-driven-development。
只实现当前 feature slice，不做最终验收结论。
完成后运行相关测试/构建检查，并交给 Evaluator。
```

## Evaluator Prompt

```text
请按 AGENTS.md、CLAUDE.md、harness-rules.md 和 evaluator.md，以 Evaluator 身份工作。
先读取 .auto-memory/MEMORY.md、.auto-memory/project-status.md、.auto-memory/superpowers-workflow.md、progress.json、features.json 和当前 plan/spec。
必须按顺序使用 Superpowers Skills；完成前必须使用 verification-before-completion 并给出最新验证证据。
默认不要修改产品代码。
输出验收报告到 docs/test-reports/。
```
