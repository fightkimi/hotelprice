#!/usr/bin/env python3
"""Smoke test for the Triad workflow doctor."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    result = subprocess.run(
        [sys.executable, "scripts/triad_doctor.py"],
        cwd=ROOT,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if result.returncode != 0:
        print(result.stdout)
        print(result.stderr, file=sys.stderr)
        return result.returncode
    if "Triad doctor: healthy enough to proceed" not in result.stdout:
        print(result.stdout)
        print("missing healthy doctor summary", file=sys.stderr)
        return 1
    print("OK   triad_doctor smoke test passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
