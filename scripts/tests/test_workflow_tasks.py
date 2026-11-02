"""Ownership is shared, conflict-refusing, explicit on transfer, and history-preserving."""
import json
import subprocess
import sys
import os
from workflow_fixture import WorkflowFixture


class TaskOwnershipTests(WorkflowFixture):
    def test_listing_is_read_only(self):
        result = self.cli("task.py", "list", "--json")
        self.assertEqual(json.loads(result.stdout), [])
        self.assertFalse((self.root / ".git/codex-workflow").exists())

    def test_parent_scope_conflicts_but_sibling_scope_is_independent(self):
        self.assertEqual(self.claim(scope="src/file.txt").returncode, 0)
        conflict = self.claim("task-b", scope="src", actor="owner-b")
        self.assertNotEqual(conflict.returncode, 0)
        self.assertIn("overlaps task task-a", conflict.stderr)
        self.assertEqual(self.claim("task-c", scope="docs", actor="owner-b").returncode, 0)

    def test_wrong_owner_cannot_change_or_finish_work(self):
        self.claim()
        for command in ["update", "finish", "handoff"]:
            args = [command, "task-a", "--summary", "Attempt", "--next", "Continue"]
            if command == "handoff":
                args += ["--to", "owner-c"]
            self.assertNotEqual(self.cli("task.py", *args, actor="owner-b").returncode, 0)
        self.assertEqual(self.read_task()["revision"], 1)

    def test_pending_handoff_reserves_scope_until_named_owner_accepts(self):
        self.claim()
        self.assertEqual(self.cli("task.py", "handoff", "task-a", "--to", "owner-b",
                                  "--summary", "Implementation ready", "--next", "Review checks").returncode, 0)
        self.assertNotEqual(self.claim("task-b", actor="owner-b").returncode, 0)
        self.assertNotEqual(self.cli("task.py", "accept", "task-a", "--summary", "Accept", actor="owner-c").returncode, 0)
        self.assertEqual(self.cli("task.py", "accept", "task-a", "--summary", "Reviewed source", actor="owner-b").returncode, 0)
        task = self.read_task()
        self.assertEqual((task["owner"], task["status"], task["next"]), ("owner-b", "active", "Review checks"))
        self.assertEqual(task["history"][1]["handoff"]["to"], "owner-b")
        self.assertNotIn("accepted_at", task["history"][1]["handoff"])

    def test_changed_source_needs_deliberate_acceptance(self):
        self.claim()
        self.cli("task.py", "handoff", "task-a", "--to", "owner-b", "--summary", "Ready", "--next", "Verify")
        (self.root / "src/file.txt").write_text("modified\n")
        args = ["accept", "task-a", "--summary", "Inspected changed source"]
        self.assertNotEqual(self.cli("task.py", *args, actor="owner-b").returncode, 0)
        self.assertEqual(self.cli("task.py", *args, "--accept-source-change", actor="owner-b").returncode, 0)

    def test_linked_worktree_shares_reservations_and_accepts_transfer(self):
        self.claim()
        linked = self.base / "linked"
        self.git("worktree", "add", "-q", "--detach", str(linked), "HEAD")
        conflict = self.cli("task.py", "claim", "task-b", "--scope", "src", "--goal", "Other",
                            "--acceptance", "Pass", "--journal", "progress.txt", actor="owner-b", root=linked)
        self.assertNotEqual(conflict.returncode, 0)
        self.cli("task.py", "handoff", "task-a", "--to", "owner-b", "--summary", "Ready", "--next", "Verify")
        accepted = self.cli("task.py", "accept", "task-a", "--summary", "Reviewed linked worktree", actor="owner-b", root=linked)
        self.assertEqual(accepted.returncode, 0, accepted.stderr)
        self.assertEqual(self.read_task(root=linked)["source"]["worktree"], str(linked.resolve()))
        wrong_tree = self.cli("task.py", "update", "task-a", "--summary", "Wrong tree", "--next", "Stop", actor="owner-b")
        self.assertNotEqual(wrong_tree.returncode, 0)

    def test_completed_records_are_retained_and_scope_is_released(self):
        self.claim()
        finished = self.cli("task.py", "finish", "task-a", "--summary", "Local outcome verified")
        self.assertEqual(finished.returncode, 0)
        self.assertEqual(self.read_task()["status"], "completed")
        self.assertNotEqual(self.claim().returncode, 0)
        self.assertEqual(self.claim("task-b").returncode, 0)
        self.assertEqual(json.loads(self.cli("task.py", "list", "--json").stdout)[0]["id"], "task-b")

    def test_owner_can_cancel_handoff_and_resume_blocked_work(self):
        self.claim()
        self.cli("task.py", "block", "task-a", "--summary", "Missing fixture", "--next", "Restore fixture")
        self.cli("task.py", "handoff", "task-a", "--to", "owner-b", "--summary", "Needs help", "--next", "Inspect")
        self.cli("task.py", "cancel-handoff", "task-a", "--summary", "Continuing locally")
        self.assertEqual(self.read_task()["status"], "blocked")
        self.cli("task.py", "resume", "task-a", "--summary", "Fixture restored", "--next", "Check")
        self.assertEqual(self.read_task()["status"], "active")

    def test_task_ids_and_scopes_cannot_escape_repository(self):
        for task_id, scope in [("../outside", "src"), ("task-a", "../outside"), ("task-b", "src/*")]:
            self.assertNotEqual(self.claim(task_id, scope).returncode, 0)
        self.assertFalse((self.base / "outside.json").exists())

    def test_simultaneous_claims_have_only_one_owner(self):
        command = [sys.executable, "-B", str(self.root / "scripts/task.py"), "claim"]
        common = ["--scope", "src", "--goal", "Fix", "--acceptance", "Pass", "--journal", "progress.txt"]
        processes = [subprocess.Popen(command + [name] + common, cwd=self.root,
                                      env={**os.environ, "CODEX_THREAD_ID": name},
                                      stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
                     for name in ["owner-a", "owner-b"]]
        for process in processes:
            process.communicate(timeout=15)
        self.assertEqual(sorted(p.returncode for p in processes), [0, 1])
        self.assertEqual(len(json.loads(self.cli("task.py", "list", "--json").stdout)), 1)

    def test_excluded_project_is_never_registered(self):
        excluded = self.base / "anou"
        self.root.rename(excluded)
        result = self.cli("task.py", "list", "--json", root=excluded)
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse((excluded / ".git/codex-workflow").exists())

    def test_global_inventory_uses_only_explicit_projects_without_writes(self):
        self.claim()
        config = self.root / "scripts/workflow-projects.json"
        config.write_text(json.dumps({"projects": [str(self.root)]}))
        result = self.cli("task.py", "list", "--all", "--json")
        self.assertEqual(json.loads(result.stdout)[0]["id"], "task-a")

    def test_corrupt_scope_state_fails_closed(self):
        self.claim()
        path = self.root / ".git/codex-workflow/tasks/task-a.json"
        record = json.loads(path.read_text())
        record["scope"] = "src"
        path.write_text(json.dumps(record))
        self.assertNotEqual(self.claim("task-b", scope="docs").returncode, 0)

    def test_symbolic_state_directory_is_refused(self):
        outside = self.base / "outside"
        outside.mkdir()
        (self.root / ".git/codex-workflow").symlink_to(outside, target_is_directory=True)
        self.assertNotEqual(self.claim().returncode, 0)
        self.assertEqual(list(outside.iterdir()), [])


if __name__ == "__main__":
    import unittest
    unittest.main()
