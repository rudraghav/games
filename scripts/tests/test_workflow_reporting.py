"""Verification reports preserve exact outcomes without claiming release proof."""
import json
import os
from pathlib import Path
import signal
import subprocess
import sys
import time
from workflow_fixture import WorkflowFixture


class VerificationReportingTests(WorkflowFixture):
    def test_json_output_is_clean_private_and_bound_to_source(self):
        check = self.check("print('raw-output-marker')", env={"PRIVATE_FIXTURE": "not-in-report"})
        self.configure([check])
        result, report = self.report()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(report["status"], "passed")
        self.assertTrue(report["source_stable"])
        self.assertEqual(report["source_before"]["head"], self.git("rev-parse", "HEAD"))
        path = Path(report["report_path"])
        retained = path.read_text()
        self.assertNotIn("raw-output-marker", retained)
        self.assertNotIn("not-in-report", retained)
        self.assertNotIn("synthetic-private-value", retained)
        self.assertEqual(path.stat().st_mode & 0o777, 0o600)
        self.assertEqual(path.parent.stat().st_mode & 0o777, 0o700)
        self.assertIn("raw-output-marker", result.stderr)

    def test_failed_check_preserves_not_run_checks_and_exit_status(self):
        marker = self.base / "must-not-run"
        self.configure([self.check("raise SystemExit(7)"), self.check(f"open({str(marker)!r}, 'w').close()")])
        result, report = self.report()
        self.assertEqual(result.returncode, 7)
        self.assertEqual([c["status"] for c in report["checks"]], ["failed", "not_run"])
        self.assertFalse(marker.exists())

    def test_missing_prerequisite_is_blocked_not_a_test_failure(self):
        self.configure([{"cwd": ".", "argv": ["missing-workflow-executable"], "timeout": 1}, self.check("pass")])
        result, report = self.report()
        self.assertEqual(result.returncode, 127)
        self.assertEqual(report["status"], "blocked")
        self.assertEqual([c["status"] for c in report["checks"]], ["blocked", "not_run"])

    def test_timeout_is_retained_and_stops_remaining_checks(self):
        self.configure([self.check("import time; time.sleep(30)", timeout=1), self.check("pass")])
        result, report = self.report()
        self.assertEqual(result.returncode, 124)
        self.assertEqual(report["status"], "timed_out")
        self.assertEqual(report["checks"][1]["status"], "not_run")

    def test_interruption_produces_a_report_and_stops_the_owned_check(self):
        ready = self.base / "ready"
        self.configure([self.check(f"import time; open({str(ready)!r}, 'w').close(); time.sleep(30)")])
        process = subprocess.Popen([sys.executable, "-B", str(self.root / "scripts/verify.py"), "--json"],
                                   cwd=self.root, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        self.addCleanup(lambda: process.poll() is None and process.kill())
        deadline = time.monotonic() + 5
        while not ready.exists() and time.monotonic() < deadline:
            time.sleep(0.02)
        self.assertTrue(ready.exists())
        process.send_signal(signal.SIGINT)
        output, _ = process.communicate(timeout=15)
        self.assertEqual(process.returncode, 130)
        self.assertEqual(json.loads(output)["status"], "interrupted")

    def test_source_changed_by_check_is_inconclusive(self):
        self.configure([self.check("from pathlib import Path; Path('src/file.txt').write_text('changed')")])
        result, report = self.report()
        self.assertEqual(result.returncode, 1)
        self.assertEqual(report["checks"][0]["status"], "passed")
        self.assertEqual(report["status"], "inconclusive")
        self.assertFalse(report["source_stable"])

    def test_task_report_is_attached_without_completing_or_releasing(self):
        self.claim()
        result = self.cli("verify.py", "--json", "--task", "task-a", "tooling")
        self.assertEqual(result.returncode, 0, result.stderr)
        report, task = json.loads(result.stdout), self.read_task()
        self.assertEqual(task["status"], "active")
        self.assertEqual(task["verification"][0]["id"], report["id"])
        self.assertEqual(task["verification"][0]["status"], "passed")
        self.assertNotIn("deployed", task)

    def test_wrong_owner_runs_no_checks_and_does_not_change_task(self):
        self.claim()
        result = self.cli("verify.py", "--json", "--task", "task-a", actor="owner-b")
        report = json.loads(result.stdout)
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(report["status"], "blocked")
        self.assertEqual(report["checks"][0]["status"], "not_run")
        self.assertEqual(self.read_task()["revision"], 1)

    def test_handoff_during_check_cannot_attach_results_to_another_owner(self):
        self.claim()
        code = ("import subprocess,sys; subprocess.check_call([sys.executable,'-B','scripts/task.py',"
                "'handoff','task-a','--owner','owner-a','--to','owner-b','--summary','Ready','--next','Review'])")
        self.configure([self.check(code)])
        result = self.cli("verify.py", "--json", "--task", "task-a")
        report = json.loads(result.stdout)
        self.assertEqual(result.returncode, 1)
        self.assertEqual(report["status"], "blocked")
        self.assertEqual(report["checks"][0]["status"], "passed")
        self.assertEqual(self.read_task()["verification"], [])

    def test_list_and_plan_never_create_reports_or_claim_success(self):
        for option in ["--list", "--plan"]:
            result = self.cli("verify.py", "--json", option)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertNotEqual(json.loads(result.stdout).get("status"), "passed")
            self.assertFalse((self.root / ".git/codex-workflow").exists())

    def test_unknown_group_returns_structured_blocker(self):
        result = self.cli("verify.py", "--json", "unknown")
        self.assertEqual(result.returncode, 1)
        report = json.loads(result.stdout)
        self.assertEqual(report["status"], "blocked")
        self.assertTrue(Path(report["report_path"]).is_file())

    def test_untracked_contents_are_part_of_source_identity(self):
        path = self.root / "untracked.txt"
        path.write_text("before")
        _, first = self.report()
        previous = path.stat()
        path.write_text("after!")
        os.utime(path, ns=(previous.st_atime_ns, previous.st_mtime_ns))
        _, second = self.report()
        self.assertNotEqual(first["source_before"]["fingerprint"], second["source_before"]["fingerprint"])

    def test_process_termination_records_interruption_and_unfinished_checkpoint(self):
        ready = self.base / "ready-termination"
        self.configure([self.check(f"import time; open({str(ready)!r}, 'w').close(); time.sleep(30)")])
        process = subprocess.Popen([sys.executable, "-B", str(self.root / "scripts/verify.py"), "--json"],
                                   cwd=self.root, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        self.addCleanup(lambda: process.poll() is None and process.kill())
        deadline = time.monotonic() + 5
        while not ready.exists() and time.monotonic() < deadline:
            time.sleep(0.02)
        self.assertTrue(ready.exists())
        paths = list((self.root / ".git/codex-workflow/reports").glob("*.json"))
        checkpoint = json.loads(paths[0].read_text())
        self.assertEqual((checkpoint["status"], checkpoint["checks"][0]["status"]), ("running", "running"))
        process.terminate()
        output, _ = process.communicate(timeout=15)
        self.assertEqual(process.returncode, 130)
        self.assertEqual(json.loads(output)["status"], "interrupted")


if __name__ == "__main__":
    import unittest
    unittest.main()
