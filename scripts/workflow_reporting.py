"""Summarize local checks with source provenance; never retain raw output or env."""
from __future__ import annotations

import hashlib
from pathlib import Path
from typing import NamedTuple
import uuid
from workflow_store import atomic_json, now, same_source, snapshot, state_dir
from workflow_tasks import attach_report, owner


class CheckResult(NamedTuple):
    status: str
    code: int
    reason: str = ""


def begin(root: Path, groups: list[str], checks: list[tuple[str, dict]], task_id=None) -> dict:
    manifest = root / "scripts/verification.json"
    positions, entries = {}, []
    for sequence, (group, check) in enumerate(checks):
        index = positions.get(group, 0)
        positions[group] = index + 1
        entries.append({"group": group, "index": index, "sequence": sequence, "cwd": check["cwd"],
                        "status": "not_run", "exit_code": None, "seconds": 0.0,
                        "reason": "Not reached; selected checks stop at the first blocker or failure"})
    return {"version": 1, "id": "verify-" + uuid.uuid4().hex,
            "started_at": now(), "finished_at": None, "status": "running",
            "groups": list(dict.fromkeys(groups)), "task": task_id,
            "coverage": "Selected local commands only; unchecked behavior and release state are not certified",
            "manifest_sha256": hashlib.sha256(manifest.read_bytes()).hexdigest() if manifest.is_file() else None,
            "source_before": snapshot(root), "source_after": None, "source_stable": None,
            "checks": entries}


def finish(root: Path, report: dict, status: str, actor: str | None = None) -> tuple[Path, int]:
    report["finished_at"] = now()
    report["status"] = status
    report["source_after"] = snapshot(root)
    before, after = report["source_before"], report["source_after"]
    if before["fingerprint_complete"] and after["fingerprint_complete"]:
        report["source_stable"] = same_source(before, after)
    if status == "passed" and report["source_stable"] is False:
        report["status"] = "inconclusive"
        report["reason"] = "Source changed during verification; rerun affected checks for the final source"
    path = state_dir(root) / "reports" / (report["id"] + ".json")
    atomic_json(path, report)
    attachment_error = 0
    if report["task"] and actor:
        try:
            attach_report(root, report["task"], owner(actor), report)
        except (ValueError, OSError):
            report["status"] = "blocked"
            report["reason"] = "Checks retained, but task ownership changed or the report could not be attached"
            atomic_json(path, report)
            attachment_error = 1
    return path, attachment_error or int(report["status"] == "inconclusive")


def checkpoint(root: Path, report: dict) -> None:
    """A crash leaves unfinished evidence, never a fabricated passing run."""
    atomic_json(state_dir(root) / "reports" / (report["id"] + ".json"), report)
