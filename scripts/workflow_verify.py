#!/usr/bin/env python3
"""Run named local checks from verification.json; never deploy or migrate."""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import shutil
import signal
import subprocess
import sys
import time

# Also support file-based imports used by the existing runner contract tests.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from workflow_reporting import CheckResult, begin, checkpoint, finish
from workflow_store import repository
from workflow_tasks import owner, writable_task

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "scripts/verification.json"


def load_config(path: Path = CONFIG) -> dict:
    data = json.loads(path.read_text())
    if data.get("version") != 1 or not isinstance(data.get("groups"), dict):
        raise ValueError("Unsupported verification configuration")
    for name, checks in data["groups"].items():
        if not isinstance(name, str) or not isinstance(checks, list) or not checks:
            raise ValueError("Each verification group needs named checks")
        for check in checks:
            if (not isinstance(check, dict) or not isinstance(check.get("cwd"), str)
                    or not isinstance(check.get("argv"), list) or not check["argv"]
                    or any(not isinstance(arg, str) or not arg for arg in check["argv"])
                    or not isinstance(check.get("env", {}), dict)
                    or any(not isinstance(k, str) or not isinstance(v, str)
                           for k, v in check.get("env", {}).items())
                    or type(check.get("timeout", 900)) is not int
                    or not 1 <= check.get("timeout", 900) <= 3600):
                raise ValueError("Invalid check command, environment or timeout")
    return data


def check_context(data: dict, root: Path = ROOT) -> None:
    """Reserve 8 KiB for global guidance within Codex's default 32 KiB cap."""
    for chain in data["instruction_chains"]:
        paths = [root / name for name in chain]
        if any(not path.is_file() for path in paths):
            raise ValueError("An instruction chain references a missing file")
        if sum(path.stat().st_size + 2 for path in paths) > 24 * 1024:
            raise ValueError("Repository instructions exceed the 24 KiB budget; extract details")
    for relative in data["required_paths"]:
        if not (root / relative).exists():
            raise ValueError(f"Missing verification input: {relative}")
    for checks in data["groups"].values():
        for check in checks:
            directory = (root / check["cwd"]).resolve()
            if not directory.is_relative_to(root.resolve()) or not directory.is_dir():
                raise ValueError("Check working directories must exist inside this repository")
            argv = check["argv"]
            script = (argv[2] if len(argv) > 2 and argv[:2] == ["npm", "run"] else
                      argv[1] if len(argv) > 1 and argv[0] == "pnpm" else None)
            if script is not None:
                package = json.loads((directory / "package.json").read_text())
                if script not in package.get("scripts", {}):
                    raise ValueError(f"Missing package script in {check['cwd']}: {script}")


def selected_checks(data: dict, groups: list[str]) -> list[tuple[str, dict]]:
    unknown = set(groups) - data["groups"].keys()
    if unknown:
        raise ValueError("Unknown verification group: " + ", ".join(sorted(unknown)))
    return [(group, check) for group in dict.fromkeys(groups)
            for check in data["groups"][group]]


def stop_process(process: subprocess.Popen) -> None:
    """Stop this check's process group, including temporary fixture servers."""
    try:
        os.killpg(process.pid, signal.SIGTERM)
    except ProcessLookupError:
        return
    try:
        process.wait(timeout=10)
    except subprocess.TimeoutExpired:
        pass
    # A shell can exit before its fixture children do; finish the owned group.
    try:
        os.killpg(process.pid, signal.SIGKILL)
    except ProcessLookupError:
        pass
    process.wait()


def run_check(check: dict, root: Path = ROOT, *, json_mode: bool = False) -> CheckResult:
    directory = root / check["cwd"]
    argv = check["argv"]
    executable = (directory / argv[0]).resolve() if "/" in argv[0] else shutil.which(argv[0])
    if not executable or not Path(executable).is_file():
        print("BLOCKED: required local executable is missing; no installation attempted", file=sys.stderr)
        return CheckResult("blocked", 127, "Required local executable is missing")
    overrides = {name: value.replace("{root}", str(root)) for name, value in check.get("env", {}).items()}
    environment = {**os.environ, "PYTHONDONTWRITEBYTECODE": "1", **overrides}
    try:
        with subprocess.Popen(argv, cwd=directory, env=environment, start_new_session=True,
                              stdout=sys.stderr if json_mode else None) as process:
            try:
                code = process.wait(timeout=check.get("timeout", 900))
                return CheckResult("passed" if code == 0 else "failed", code)
            except subprocess.TimeoutExpired:
                stop_process(process)
                return CheckResult("timed_out", 124, "Local check exceeded its time budget")
            except KeyboardInterrupt:
                stop_process(process)
                return CheckResult("interrupted", 130, "Local check was interrupted")
    except OSError:
        return CheckResult("blocked", 126, "Local executable could not be started")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("groups", nargs="*", help="Named groups; default: tooling only")
    parser.add_argument("--list", action="store_true", help="List groups without running commands")
    parser.add_argument("--plan", action="store_true", help="Show selected commands without running them")
    parser.add_argument("--json", action="store_true", help="Emit one structured result; command output goes to stderr")
    parser.add_argument("--task", help="Attach actual results to an active task owned by this chat")
    parser.add_argument("--owner", help="Stable chat ID; defaults to CODEX_THREAD_ID")
    args = parser.parse_args(argv)
    report, result, status, actor = None, 1, "blocked", None
    groups = args.groups or ["tooling"]
    try:
        data = load_config()
        check_context(data)
        if args.list:
            print(json.dumps({"mode": "list", "project": data["project"], "groups": list(data["groups"])})
                  if args.json else data["project"] + ": " + ", ".join(data["groups"]))
            return 0
        checks = selected_checks(data, groups)
        if args.plan:
            if args.json:
                print(json.dumps({"mode": "plan", "status": "not_run", "groups": groups,
                                  "checks": [{"group": group, "cwd": check["cwd"], "argv": check["argv"]}
                                             for group, check in checks]}))
            else:
                for group, check in checks:
                    print(f"[{group}] {check['cwd']}: {' '.join(check['argv'])}")
            return 0
        repository(ROOT)  # Reject excluded projects before creating any local state.
        report = begin(ROOT, groups, checks, args.task)
        if args.task:
            actor = owner(args.owner)
            writable_task(ROOT, args.task, actor)
        checkpoint(ROOT, report)
        result, status = 0, "passed"
        for index, (group, check) in enumerate(checks):
            destination = sys.stderr if args.json else sys.stdout
            print(f"[{group}] {check['cwd']}: {' '.join(check['argv'])}", file=destination, flush=True)
            report["checks"][index]["status"] = "running"
            report["checks"][index]["reason"] = "Command started; completion is not yet recorded"
            checkpoint(ROOT, report)
            started = time.monotonic()
            outcome = run_check(check, json_mode=args.json)
            report["checks"][index].update(status=outcome.status, exit_code=outcome.code,
                                           seconds=round(time.monotonic() - started, 3), reason=outcome.reason)
            checkpoint(ROOT, report)
            if outcome.code:
                result, status = outcome.code if outcome.code > 0 else 1, outcome.status
                break
    except KeyboardInterrupt:
        result, status = 130, "interrupted"
        if report is None:
            print(json.dumps({"status": status}) if args.json else "INTERRUPTED: no checks completed")
            return result
    except (ValueError, OSError, KeyError, TypeError, subprocess.SubprocessError) as error:
        # Configuration errors may contain private file contents; only our own
        # plain validation errors are suitable for retained reports.
        reason = str(error) if type(error) is ValueError else "Invalid configuration or unavailable local prerequisite"
        if not args.list and not args.plan:
            try:
                repository(ROOT)
                report = report or begin(ROOT, groups, [], args.task)
                report["reason"] = reason
            except (ValueError, OSError, subprocess.SubprocessError):
                report = None
        if report is None:
            print(json.dumps({"status": "blocked", "reason": reason}) if args.json else "BLOCKED: " + reason,
                  file=sys.stdout if args.json else sys.stderr)
            return 1
    if report is None:
        return 1
    try:
        path, reporting_error = finish(ROOT, report, status, actor if status != "blocked" else None)
        result = result or reporting_error
        if args.json:
            print(json.dumps({**report, "report_path": str(path)}, indent=2))
        else:
            print(f"{report['status'].upper()}: selected local checks; report {path}")
            if report["source_stable"] is None:
                print("Source fingerprint is incomplete; this evidence must not be reused without fresh verification")
        return result
    except (OSError, ValueError, KeyError, subprocess.SubprocessError):
        print(json.dumps({"status": "blocked", "reason": "Could not retain verification evidence"})
              if args.json else "BLOCKED: could not retain verification evidence",
              file=sys.stdout if args.json else sys.stderr)
        return 1


def interrupt_for_shutdown(_signum, _frame):
    """Allow ordinary process termination to stop owned children and retain evidence."""
    raise KeyboardInterrupt


if __name__ == "__main__":
    signal.signal(signal.SIGTERM, interrupt_for_shutdown)
    raise SystemExit(main())
