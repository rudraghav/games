"""The Games adapter keeps product groups while using portable bounded reporting."""
import importlib.util
import json
from pathlib import Path
import shutil
import sys
from unittest.mock import patch
from workflow_fixture import WorkflowFixture, SCRIPTS

sys.path.insert(0, str(SCRIPTS))

spec = importlib.util.spec_from_file_location("game_evidence", SCRIPTS / "verification_report.py")
adapter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(adapter)
from workflow_reporting import CheckResult


class GameAdapterTests(WorkflowFixture):
    def test_no_global_helper_dependency_and_blocked_result_is_attached(self):
        self.claim()
        with patch("pathlib.Path.home", return_value=self.base / "no-global-config"), patch.dict("os.environ", {"CODEX_THREAD_ID": "owner-a"}):
            report = adapter.VerificationReport(self.root, "task-a", ["tooling"],
                                                {"tooling": ("fixture", [["python3"], ["python3"]])})
            report.start()
            report.record(CheckResult("blocked", 127, "Missing prerequisite"))
            self.assertEqual(report.finish(127), 127)
        self.assertEqual(report.report["checks"][1]["status"], "not_run")
        self.assertEqual(self.read_task()["verification"][-1]["status"], "blocked")

    def test_timeout_remains_distinct_from_failure(self):
        report = adapter.VerificationReport(self.root, None, ["tooling"], {"tooling": ("fixture", [["python3"]])})
        report.start()
        report.record(CheckResult("timed_out", 124, "Deadline"))
        self.assertEqual(report.finish(124), 124)
        self.assertEqual(json.loads(report.path.read_text())["status"], "timed_out")

    def test_default_plan_is_tooling_and_all_product_groups_remain_available(self):
        shutil.copyfile(SCRIPTS / "verify.py", self.root / "scripts/games_verify.py")
        shutil.copyfile(SCRIPTS / "workflow_verify.py", self.root / "scripts/workflow_verify.py")
        default = self.cli("games_verify.py", "--plan", "--json")
        self.assertEqual(default.returncode, 0, default.stderr)
        self.assertEqual(json.loads(default.stdout)["groups"], ["tooling"])
        full = self.cli("games_verify.py", "--all", "--plan", "--json")
        self.assertIn("multiplayer", json.loads(full.stdout)["groups"])
        self.assertIn("migrations", json.loads(full.stdout)["groups"])
        self.assertFalse((self.root / ".git/codex-workflow").exists())

    def test_browser_selection_preserves_focused_plan_and_path_validation(self):
        shutil.copyfile(SCRIPTS / "verify.py", self.root / "scripts/games_verify.py")
        shutil.copyfile(SCRIPTS / "workflow_verify.py", self.root / "scripts/workflow_verify.py")
        browser = self.root / "tests/browser"
        browser.mkdir(parents=True)
        (browser / "selected.spec.ts").write_text("// Plan fixture; never executed.\n")
        selected = self.cli("games_verify.py", "--browser-file", "tests/browser/selected.spec.ts",
                            "--plan", "--json")
        self.assertEqual(selected.returncode, 0, selected.stderr)
        plan = json.loads(selected.stdout)
        self.assertEqual(plan["groups"], ["browser"])
        self.assertEqual(plan["checks"][-1]["argv"],
                         ["pnpm", "exec", "playwright", "test", "tests/browser/selected.spec.ts", "--workers=2"])
        rejected = self.cli("games_verify.py", "--browser-file", "../selected.spec.ts", "--plan")
        self.assertEqual(rejected.returncode, 2)
        self.assertFalse((self.root / ".git/codex-workflow").exists())
