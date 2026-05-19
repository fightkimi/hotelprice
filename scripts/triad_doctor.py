#!/usr/bin/env python3
"""Check Hotel Pricing Capture Triad workflow health.

This script checks process metadata only. It does not inspect or modify product code.
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
SUPERPOWERS_CACHE_ROOT = (
    Path.home() / ".codex" / "plugins" / "cache" / "openai-curated" / "superpowers"
)

REQUIRED_SUPERPOWERS_SKILLS = [
    "brainstorming",
    "writing-plans",
    "executing-plans",
    "subagent-driven-development",
    "test-driven-development",
    "verification-before-completion",
]

SUPERPOWERS_RULE_FILES = [
    ".auto-memory/MEMORY.md",
    ".auto-memory/superpowers-workflow.md",
    "AGENTS.md",
    "CLAUDE.md",
    "planner.md",
    "generator.md",
    "evaluator.md",
    "docs/dev/triad-midstage-workflow.md",
]

PR_OVERRIDE_FILES = [
    "AGENTS.md",
    "CLAUDE.md",
    "harness-rules.md",
    "docs/dev/triad-midstage-workflow.md",
]

ROLE_FILES = {
    "planner.md": ["Planner", "does not implement", "must not edit"],
    "generator.md": ["Generator", "test-driven-development", "Do not mark final acceptance"],
    "evaluator.md": ["Evaluator", "verification-before-completion", "does not modify product code"],
}

FAILURES: list[str] = []


def ok(message: str) -> None:
    print(f"OK   {message}")


def warn(message: str) -> None:
    print(f"WARN {message}")


def fail(message: str) -> None:
    print(f"FAIL {message}")
    FAILURES.append(message)


def load_json(path: Path) -> dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        fail(f"missing required file: {path.relative_to(ROOT)}")
    except json.JSONDecodeError as exc:
        fail(f"invalid JSON in {path.relative_to(ROOT)}: {exc}")
    return {}


def git_output(*args: str) -> str:
    result = subprocess.run(
        ["git", *args],
        cwd=ROOT,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if result.returncode != 0:
        return ""
    return result.stdout.strip()


def find_superpowers_skill(skill: str) -> Path | None:
    matches = sorted(SUPERPOWERS_CACHE_ROOT.glob(f"*/skills/{skill}/SKILL.md"))
    if matches:
        return matches[-1]
    return None


def check_json_status() -> None:
    progress = load_json(ROOT / "progress.json")
    features_doc = load_json(ROOT / "features.json")
    load_json(ROOT / "backlog.json")

    features = features_doc.get("features", [])
    if not isinstance(features, list):
        fail("features.json field 'features' must be a list")
        return

    feature_ids = [feature.get("id") for feature in features]
    done_count = len([feature for feature in features if feature.get("status") == "done"])

    if progress.get("features") != feature_ids:
        fail("progress.features does not match features.json order/content")
    else:
        ok("progress.features matches features.json")

    if progress.get("total_features") != len(features):
        fail("progress.total_features does not match features.json length")
    else:
        ok("progress.total_features matches features.json")

    if progress.get("completed_features") != done_count:
        fail("progress.completed_features does not match done feature count")
    else:
        ok("progress.completed_features matches done feature count")


def check_superpowers_workflow() -> None:
    missing_skills = [
        skill for skill in REQUIRED_SUPERPOWERS_SKILLS if not find_superpowers_skill(skill)
    ]
    if missing_skills:
        fail("missing Superpowers skills: " + ", ".join(missing_skills))
    else:
        ok("required Superpowers skills are available in plugin cache")

    for rel in SUPERPOWERS_RULE_FILES:
        path = ROOT / rel
        if not path.exists():
            fail(f"missing Superpowers rule file: {rel}")
            continue
        text = path.read_text(encoding="utf-8")
        if rel == ".auto-memory/MEMORY.md":
            missing_terms = ["superpowers-workflow.md"] if "superpowers-workflow.md" not in text else []
        else:
            missing_terms = [skill for skill in REQUIRED_SUPERPOWERS_SKILLS if skill not in text]
        if missing_terms:
            fail(f"Superpowers workflow weak in {rel}: missing {', '.join(missing_terms)}")
        else:
            ok(f"Superpowers workflow is recorded in {rel}")

    workflow = ROOT / ".auto-memory/superpowers-workflow.md"
    if not workflow.exists():
        return
    text = workflow.read_text(encoding="utf-8")
    positions = [text.find(skill) for skill in REQUIRED_SUPERPOWERS_SKILLS]
    if any(position == -1 for position in positions):
        fail(".auto-memory/superpowers-workflow.md does not list every required skill")
    elif positions != sorted(positions):
        fail(".auto-memory/superpowers-workflow.md lists Superpowers skills out of order")
    else:
        ok("Superpowers required skills are listed in order")


def check_pr_override() -> None:
    missing_override: list[str] = []
    for rel in PR_OVERRIDE_FILES:
        path = ROOT / rel
        if not path.exists():
            fail(f"missing PR override file: {rel}")
            continue
        text = path.read_text(encoding="utf-8")
        if "PR" not in text or "main" not in text:
            missing_override.append(rel)
    if missing_override:
        fail("PR-only override missing or weak in: " + ", ".join(missing_override))
    else:
        ok("PR-only override is present in core rule files")


def check_role_boundaries() -> None:
    for rel, phrases in ROLE_FILES.items():
        path = ROOT / rel
        if not path.exists():
            fail(f"missing role file: {rel}")
            continue
        text = path.read_text(encoding="utf-8")
        missing = [phrase for phrase in phrases if phrase not in text]
        if missing:
            fail(f"{rel} boundary is weak: missing {', '.join(missing)}")
        else:
            ok(f"{rel} boundary is present")


def check_git_context() -> None:
    branch = git_output("branch", "--show-current")
    if branch in {"main", "master"}:
        warn(f"current branch is {branch}; create a feature branch before committing")
    elif branch:
        ok(f"current branch is {branch}")
    else:
        warn("not a git repository yet or branch unavailable")


def main() -> int:
    check_json_status()
    check_superpowers_workflow()
    check_pr_override()
    check_role_boundaries()
    check_git_context()

    if FAILURES:
        print(f"\nTriad doctor: {len(FAILURES)} failure(s)")
        return 1
    print("\nTriad doctor: healthy enough to proceed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
