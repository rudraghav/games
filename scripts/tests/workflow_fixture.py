"""Disposable local Git repositories for real CLI/ownership regression tests."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

SCRIPTS = Path(__file__).resolve().parents[1]
RUNNER = "workflow_verify.py" if (SCRIPTS / "workflow_verify.py").exists() else "verify.py"


class WorkflowFixture(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="workflow-test-")
        self.addCleanup(self.temporary.cleanup)
        self.base = Path(self.temporary.name)
        self.root = self.base / "project"
        self.root.mkdir()
        self.git("init", "-q", "-b", "main")
        (self.root / "scripts").mkdir()
        for name in ["task.py", "workflow_store.py", "workflow_tasks.py", "workflow_reporting.py"]:
            shutil.copyfile(SCRIPTS / name, self.root / "scripts" / name)
        shutil.copyfile(SCRIPTS / RUNNER, self.root / "scripts/verify.py")
        (self.root / "AGENTS.md").write_text("Fixture instructions\n")
        (self.root / "progress.txt").write_text("Existing journal; preserve it\n")
        (self.root / "src").mkdir()
        (self.root / "src/file.txt").write_text("original\n")
        self.configure([self.check("print('check output')")])
        self.git("add", ".")
        self.git("-c", "core.hooksPath=/dev/null", "-c", "user.name=Workflow Test",
                 "-c", "user.email=workflow@example.invalid", "commit", "-qm", "fixture")

    def git(self, *args, root=None):
        return subprocess.check_output(["git", "-C", str(root or self.root), *args], stderr=subprocess.DEVNULL).decode().strip()

    def check(self, code, **extra):
        return {"cwd": ".", "argv": [sys.executable, "-B", "-c", code], "timeout": 10, **extra}

    def configure(self, checks):
        value = {"version": 1, "project": "fixture", "instruction_chains": [["AGENTS.md"]],
                 "required_paths": ["progress.txt"], "groups": {"tooling": checks}}
        (self.root / "scripts/verification.json").write_text(json.dumps(value))

    def cli(self, script, *args, actor="owner-a", root=None):
        root = root or self.root
        return subprocess.run([sys.executable, "-B", str(root / "scripts" / script), *args],
                              cwd=root, env={**os.environ, "CODEX_THREAD_ID": actor,
                                             "WORKFLOW_PRIVATE_FIXTURE": "synthetic-private-value"},
                              capture_output=True, text=True, timeout=30)

    def claim(self, task_id="task-a", scope="src", actor="owner-a"):
        return self.cli("task.py", "claim", task_id, "--scope", scope,
                        "--goal", "Fix fixture", "--acceptance", "Relevant checks pass",
                        "--journal", "progress.txt", actor=actor)

    def read_task(self, task_id="task-a", root=None):
        result = self.cli("task.py", "show", task_id, root=root)
        self.assertEqual(result.returncode, 0, result.stderr)
        return json.loads(result.stdout)

    def report(self):
        result = self.cli("verify.py", "--json", "tooling")
        return result, json.loads(result.stdout)
