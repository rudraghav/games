"""Verification must fail closed without invoking a shell or changing targets."""
import contextlib
import importlib.util
import io
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import Mock, patch

SCRIPT = Path(__file__).resolve().parents[1] / "workflow_verify.py"
SPEC = importlib.util.spec_from_file_location("workflow_verify", SCRIPT)
verify = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(verify)


class WorkflowRunnerTests(unittest.TestCase):
    def test_unknown_group_is_rejected_before_execution(self):
        with self.assertRaises(ValueError):
            verify.selected_checks({"groups": {"tooling": [{}]}}, ["deploy"])

    def test_repeated_groups_run_once(self):
        data = {"groups": {"tooling": [{"argv": ["python3"]}]}}
        self.assertEqual(len(verify.selected_checks(data, ["tooling", "tooling"])), 1)

    def test_plan_does_not_execute(self):
        with patch.object(verify, "run_check") as run, contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(verify.main(["--plan", "tooling"]), 0)
        run.assert_not_called()

    def test_failed_check_stops_the_group(self):
        report = {"checks": [{}, {}], "status": "running", "source_stable": True}
        with patch.object(verify, "run_check", return_value=verify.CheckResult("failed", 7)) as run, patch.object(verify, "begin", return_value=report), patch.object(verify, "checkpoint"), patch.object(verify, "finish", return_value=(Path("/private/fixture-report.json"), 0)), contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            self.assertEqual(verify.main(["tooling"]), 7)
        run.assert_called_once()

    def test_budget_failure_and_missing_guidance_are_errors(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            data = {"instruction_chains": [["AGENTS.md"]], "required_paths": [], "groups": {}}
            with self.assertRaises(ValueError):
                verify.check_context(data, root)
            (root / "AGENTS.md").write_text("x" * (24 * 1024 + 1))
            with self.assertRaises(ValueError):
                verify.check_context(data, root)

    def test_working_directory_cannot_escape_repository(self):
        data = {"instruction_chains": [], "required_paths": [],
                "groups": {"bad": [{"cwd": ".."}]}}
        with self.assertRaises(ValueError):
            verify.check_context(data)

    def test_renamed_package_command_is_reported_before_execution(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "package.json").write_text('{"scripts": {"test": "existing-check"}}')
            data = {"instruction_chains": [], "required_paths": [],
                    "groups": {"frontend": [{"cwd": ".", "argv": ["npm", "run", "missing"]}]}}
            with self.assertRaisesRegex(ValueError, "Missing package script"):
                verify.check_context(data, root)

    def test_missing_executable_does_not_start_process(self):
        with patch.object(verify.shutil, "which", return_value=None), patch.object(verify.subprocess, "Popen") as start, contextlib.redirect_stderr(io.StringIO()):
            self.assertEqual(verify.run_check({"cwd": ".", "argv": ["missing-check"]}).status, "blocked")
        start.assert_not_called()

    def test_argv_is_passed_without_shell_and_with_timeout(self):
        process = Mock()
        process.wait.return_value = 0
        with patch.object(verify.subprocess, "Popen") as start:
            start.return_value.__enter__.return_value = process
            self.assertEqual(verify.run_check({"cwd": ".", "argv": ["python3", "-V"], "timeout": 4}).code, 0)
        self.assertNotIn("shell", start.call_args.kwargs)
        self.assertTrue(start.call_args.kwargs["start_new_session"])
        process.wait.assert_called_once_with(timeout=4)

    def test_timeout_stops_owned_process_group(self):
        process = Mock()
        process.wait.side_effect = subprocess.TimeoutExpired("check", 1)
        with patch.object(verify.subprocess, "Popen") as start, patch.object(verify, "stop_process") as stop, contextlib.redirect_stderr(io.StringIO()):
            start.return_value.__enter__.return_value = process
            self.assertEqual(verify.run_check({"cwd": ".", "argv": ["python3"], "timeout": 1}).status, "timed_out")
        stop.assert_called_once_with(process)

    def test_malformed_config_and_unbounded_timeout_fail(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "verification.json"
            for argv, timeout in [("python3 -V", 2), (["python3"], 0), (["python3"], 4000)]:
                path.write_text(json.dumps({"version": 1, "groups": {"tooling": [
                    {"cwd": ".", "argv": argv, "timeout": timeout}]}}))
                with self.assertRaises(ValueError):
                    verify.load_config(path)

    def test_checkout_placeholder_is_resolved_only_in_environment(self):
        process = Mock()
        process.wait.return_value = 0
        with patch.object(verify.subprocess, "Popen") as start:
            start.return_value.__enter__.return_value = process
            verify.run_check({"cwd": ".", "argv": ["python3", "-V"],
                              "env": {"WORKFLOW_FIXTURE_ROOT": "{root}/backend"}})
        self.assertEqual(start.call_args.kwargs["env"]["WORKFLOW_FIXTURE_ROOT"], str(verify.ROOT / "backend"))

    def test_timeout_cleanup_also_stops_children_after_shell_exits(self):
        process = Mock(pid=123456)
        with patch.object(verify.os, "killpg") as kill:
            verify.stop_process(process)
        self.assertEqual(kill.call_args_list[0].args, (123456, verify.signal.SIGTERM))
        self.assertEqual(kill.call_args_list[1].args, (123456, verify.signal.SIGKILL))


if __name__ == "__main__":
    unittest.main()
