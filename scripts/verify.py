"""Named, local verification entry point. Unavailable checks fail explicitly."""

import argparse
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PYTHON = str(ROOT / "backend/.venv/bin/python")
GROUPS = {
    "frontend": ("Types, lint, UI/contract tests and production build", [
        ["pnpm", "type-check"], ["pnpm", "lint"], ["pnpm", "test"], ["pnpm", "build"]]),
    "backend": ("Python lint/types and deterministic engine tests", [
        [PYTHON, "-m", "ruff", "check", "backend/app", "backend/tests"],
        [PYTHON, "-m", "mypy", "--config-file", "backend/pyproject.toml", "backend/app"],
        [PYTHON, "-m", "pytest", "backend/tests/test_engines.py", "backend/tests/test_uno_edges.py", "backend/tests/test_playthroughs.py", "backend/tests/test_tarot.py", "backend/tests/test_gemini.py", "backend/tests/test_auth.py", "backend/tests/test_cloud_config.py", "backend/tests/test_expansion.py", "backend/tests/test_gem_market_edges.py", "backend/tests/test_card_family_rules.py", "backend/tests/test_table_rules.py", "backend/tests/test_new_boards.py", "-q"]]),
    "contracts": ("Generated OpenAPI/catalogue/wire-type drift", [[PYTHON, "scripts/check_contracts.py"]]),
    "migrations": ("Fresh local schema upgrade, drift and privacy grants", [
        [PYTHON, "scripts/isolated_backend.py", "tests/test_migrations.py", "-q"]]),
    "multiplayer": ("Membership, retries, conflicts, host transfer and persistence", [
        [PYTHON, "scripts/isolated_backend.py", "tests/test_rooms.py", "-q"]]),
    "browser": ("Independent browser sessions and responsive flows", [["pnpm", "exec", "tsc", "-p", "tests/tsconfig.json"], ["pnpm", "test:browser"]]),
    "tooling": ("Module boundaries and repository conventions", [[sys.executable, "scripts/check_boundaries.py"]]),
    "load": ("50 simultaneous private rooms on the local API", [
        [PYTHON, "scripts/isolated_backend.py", "tests/test_load.py", "-q", "-s"]]),
}
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("groups", nargs="*", choices=tuple(GROUPS))
parser.add_argument("--list", action="store_true")
args = parser.parse_args()
if args.list:
    for name, (description, _) in GROUPS.items():
        print(f"{name:14} {description}")
    raise SystemExit(0)
selected = args.groups or list(GROUPS)
for name in selected:
    print(f"Checking {name}: {GROUPS[name][0]}", flush=True)
    for command in GROUPS[name][1]:
        result = subprocess.run(command, cwd=ROOT)
        if result.returncode:
            raise SystemExit(result.returncode)
    print(f"PASS {name}", flush=True)
