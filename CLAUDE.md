# CLAUDE.md

## Project Mode

This project uses the Triad Workflow with three role modes: Planner, Generator, and Evaluator. Codex/Claude sessions must explicitly state which role they are acting as.

## Superpowers Requirement

Every requirement must follow `.auto-memory/superpowers-workflow.md`:

1. `superpowers:brainstorming`
2. `superpowers:writing-plans`
3. `superpowers:executing-plans` or `superpowers:subagent-driven-development`
4. `superpowers:test-driven-development`
5. `superpowers:verification-before-completion`

Do not skip stages. If direct skill handles are unavailable, read the local Superpowers `SKILL.md` files and follow them.

## Delivery Rule

Use feature branches and PRs. Do not push directly to `main` or `master`.

## Domain Guardrails

This is a hotel pricing capture project. Treat rate data as sensitive commercial data. Keep hotel/property, competitor, channel/source, stay date, capture time, room type, occupancy, currency, tax/fee, and cancellation policy boundaries explicit.

Do not claim price parity, rate movement, or pricing recommendation correctness without fresh verification evidence. Clearly label demo, seed, fixture, and mock data.
