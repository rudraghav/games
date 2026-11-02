"""Optional private task evidence; never stores commands, output or env values."""
from __future__ import annotations

import hashlib
import json
import sys
import time
import uuid
from pathlib import Path


class VerificationReport:
    def __init__(self, root: Path, task: str, groups: list[str], manifest: dict):
        helpers = Path.home() / ".codex/tools"
        if not (helpers / "workflow_tasks.py").is_file():
            raise ValueError("Task reporting requires the configured Codex ownership helper")
        sys.path.insert(0, str(helpers))
        from workflow_store import atomic_json, now, same_source, snapshot, state_dir
        from workflow_tasks import attach_report, owner, writable_task

        self.root, self.actor = root, owner()
        writable_task(root, task, self.actor)
        self.atomic, self.now, self.snapshot = atomic_json, now, snapshot
        self.same_source, self.attach = same_source, attach_report
        checks = []
        for group in groups:
            for position, command in enumerate(manifest[group][1]):
                checks.append({"group": group, "position": position,
                               "command_sha256": hashlib.sha256(json.dumps(command).encode()).hexdigest(),
                               "status": "not_run", "seconds": None, "exit_code": None})
        self.report = {"version": 1, "id": "verify-" + uuid.uuid4().hex,
                       "task": task, "groups": groups, "started_at": now(),
                       "manifest_sha256": hashlib.sha256(json.dumps(manifest, sort_keys=True).encode()).hexdigest(),
                       "source_before": snapshot(root), "source_after": None,
                       "source_stable": None, "status": "running", "checks": checks,
                       "coverage": "Only the selected local commands; no automatic reuse or hosted proof",
                       "not_fingerprinted": ["ignored environment files", "dependencies", "external services"]}
        self.path = state_dir(root) / "reports" / (self.report["id"] + ".json")
        self.index = 0
        self.atomic(self.path, self.report)

    def start(self):
        self.started = time.monotonic()
        self.report["checks"][self.index]["status"] = "running"
        self.atomic(self.path, self.report)

    def record(self, code: int):
        self.report["checks"][self.index].update(
            status="passed" if code == 0 else "failed", exit_code=code,
            seconds=round(time.monotonic() - self.started, 3))
        self.index += 1
        self.atomic(self.path, self.report)

    def finish(self, code: int) -> int:
        after = self.snapshot(self.root)
        self.report.update(source_after=after, source_stable=self.same_source(self.report["source_before"], after),
                           status="passed" if code == 0 else "failed", finished_at=self.now())
        if not code and not self.report["source_stable"]:
            self.report["status"] = "inconclusive"
            self.report["reason"] = "Source changed or its fingerprint is incomplete; rerun affected checks"
            code = 1
        self.atomic(self.path, self.report)
        self.attach(self.root, self.report["task"], self.actor, self.report)
        return code
