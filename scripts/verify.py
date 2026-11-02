"""Named, local verification entry point. Unavailable checks fail explicitly."""

import argparse
import json
import signal
import sys
from pathlib import Path
from workflow_verify import interrupt_for_shutdown, run_check

ROOT = Path(__file__).resolve().parents[1]
PYTHON = str(ROOT / "backend/.venv/bin/python")
GROUPS = {
    "frontend": ("Types, lint, UI/contract tests and production build", [
        ["pnpm", "type-check"], ["pnpm", "lint"], ["pnpm", "test"], ["pnpm", "build"]]),
    "backend": ("Python lint/types and deterministic engine tests", [
        [PYTHON, "-m", "ruff", "check", "backend/app", "backend/tests"],
        [PYTHON, "-m", "mypy", "--config-file", "backend/pyproject.toml", "backend/app"],
        [PYTHON, "-m", "pytest", "backend/tests/test_engines.py", "backend/tests/test_uno_edges.py", "backend/tests/test_playthroughs.py", "backend/tests/test_tarot.py", "backend/tests/test_gemini.py", "backend/tests/test_astrology.py", "backend/tests/test_astrology_geocoder.py", "backend/tests/test_astrology_reading.py", "backend/tests/test_auth.py", "backend/tests/test_cloud_config.py", "backend/tests/test_expansion.py", "backend/tests/test_gem_market_edges.py", "backend/tests/test_card_family_rules.py", "backend/tests/test_table_rules.py", "backend/tests/test_new_boards.py", "backend/tests/test_modern_games.py", "backend/tests/test_party_games.py", "backend/tests/test_coop_number_games.py", "backend/tests/test_sea_cats.py", "backend/tests/test_shithead.py", "backend/tests/test_public_actions.py", "backend/tests/test_public_history.py", "backend/tests/test_tarot_characters.py", "backend/tests/test_bot_policies.py", "-q"]]),
    "contracts": ("Generated OpenAPI/catalogue/wire-type drift", [[PYTHON, "scripts/check_contracts.py"]]),
    "migrations": ("Fresh local schema upgrade, drift and privacy grants", [
        [PYTHON, "scripts/isolated_backend.py", "tests/test_migrations.py", "-q"]]),
    "multiplayer": ("Membership, retries, conflicts, host transfer and persistence", [
        [PYTHON, "scripts/isolated_backend.py", "tests/test_rooms.py", "tests/test_party_rooms.py", "tests/test_coop_number_rooms.py", "tests/test_bots_rooms.py", "tests/test_public_actions_rooms.py", "tests/test_astrology_rooms.py", "-q"]]),
    "browser": ("Independent browser sessions and responsive flows", [["pnpm", "exec", "tsc", "-p", "tests/tsconfig.json"], ["pnpm", "test:browser"]]),
    "tooling": ("Module boundaries, ownership and verification contracts", [
        [sys.executable, "scripts/check_boundaries.py"],
        [sys.executable, "-B", "scripts/workflow_verify.py", "tooling"]]),
    "load": ("50 simultaneous private rooms on the local API", [
        [PYTHON, "scripts/isolated_backend.py", "tests/test_load.py", "-q", "-s"]]),
}
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("groups", nargs="*")
parser.add_argument("--list", action="store_true")
parser.add_argument("--plan", action="store_true", help="Print commands without running checks or creating reports")
parser.add_argument("--all", action="store_true", help="Run every existing product group explicitly")
parser.add_argument("--timeout", type=int, default=1800, help="Per-command seconds, from 1 to 3600")
parser.add_argument("--task", help="Attach actual selected checks to this chat's active task")
parser.add_argument("--json", action="store_true", help="Emit one structured report; check output goes to stderr")
parser.add_argument("--browser-file", action="append", default=[],
                    help="Select a browser spec under tests/browser; repeat for affected flows")
args = parser.parse_args()
if set(args.groups) - set(GROUPS) or not 1 <= args.timeout <= 3600 or (args.all and args.groups):
    parser.error("Choose known groups or --all, and a timeout from 1 to 3600 seconds")
if args.browser_file:
    if args.groups and "browser" not in args.groups:
        parser.error("--browser-file requires the browser group")
    for name in args.browser_file:
        path = Path(name)
        if (path.is_absolute() or ".." in path.parts or path.parent != Path("tests/browser")
                or not path.name.endswith(".spec.ts") or not (ROOT / path).is_file()
                or (ROOT / path).resolve().parent != (ROOT / "tests/browser").resolve()):
            parser.error("Browser files must be existing tests/browser/*.spec.ts paths")
    GROUPS["browser"] = (f"Browser types and {len(args.browser_file)} selected responsive specs", [
        ["pnpm", "exec", "tsc", "-p", "tests/tsconfig.json"],
        ["pnpm", "exec", "playwright", "test", *args.browser_file, "--workers=2"],
    ])
if args.list:
    for name, (description, _) in GROUPS.items():
        print(f"{name:14} {description}")
    raise SystemExit(0)
selected = list(GROUPS) if args.all else list(dict.fromkeys(args.groups or (["browser"] if args.browser_file else ["tooling"])))
if args.plan:
    plan = {"mode": "plan", "status": "not_run", "groups": selected,
            "checks": [{"group": group, "argv": command} for group in selected for command in GROUPS[group][1]]}
    print(json.dumps(plan, indent=2) if args.json else "\n".join(
        f"[{check['group']}] {' '.join(check['argv'])}" for check in plan["checks"]))
    raise SystemExit(0)
from verification_report import VerificationReport
report = VerificationReport(ROOT, args.task, selected, GROUPS, args.timeout)
signal.signal(signal.SIGTERM, interrupt_for_shutdown)
code = 0
for name in selected:
    print(f"Checking {name}: {GROUPS[name][0]}", file=sys.stderr if args.json else sys.stdout, flush=True)
    for command in GROUPS[name][1]:
        report.start()
        outcome = run_check({"cwd": ".", "argv": command, "timeout": args.timeout}, ROOT, json_mode=args.json)
        command_code = outcome.code if outcome.code >= 0 else 1
        report.record(outcome)
        if command_code:
            code = command_code
            break
    if code:
        break
    print(f"PASS {name}", file=sys.stderr if args.json else sys.stdout, flush=True)
code = report.finish(code)
print(json.dumps({**report.report, "report_path": str(report.path)}) if args.json else f"{report.report['status'].upper()}: task checks retained in {report.path}")
raise SystemExit(code)
