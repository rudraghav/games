"""Optional private task evidence; never stores commands, output or env values."""
from __future__ import annotations

import hashlib
import json
import time
from pathlib import Path

from workflow_reporting import begin, checkpoint, finish
from workflow_store import repository, state_dir
from workflow_tasks import owner, writable_task


class VerificationReport:
    def __init__(self, root: Path, task: str | None, groups: list[str], manifest: dict, timeout: int = 1800):
        self.root, self.actor = repository(root), owner() if task else None
        if task:
            writable_task(self.root, task, self.actor)
        checks = [(group, {"cwd": ".", "argv": command, "timeout": timeout})
                  for group in groups for command in manifest[group][1]]
        self.report = begin(self.root, groups, checks, task)
        self.report["manifest_sha256"] = hashlib.sha256(
            json.dumps({"groups": manifest, "timeout": timeout}, sort_keys=True).encode()).hexdigest()
        self.report["manifest_source"] = "scripts/verify.py:GROUPS"
        self.report["timeout_seconds"] = timeout
        self.path = state_dir(self.root) / "reports" / (self.report["id"] + ".json")
        self.index, self.status = 0, "passed"
        checkpoint(self.root, self.report)

    def start(self):
        self.started = time.monotonic()
        self.report["checks"][self.index]["status"] = "running"
        checkpoint(self.root, self.report)

    def record(self, outcome):
        self.report["checks"][self.index].update(
            status=outcome.status, exit_code=outcome.code, reason=outcome.reason,
            seconds=round(time.monotonic() - self.started, 3))
        if outcome.code:
            self.status = outcome.status
        self.index += 1
        checkpoint(self.root, self.report)

    def finish(self, code: int) -> int:
        self.path, evidence_error = finish(self.root, self.report, self.status, self.actor)
        return code or evidence_error
