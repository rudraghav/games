#!/usr/bin/env python3
"""Claim scoped work, transfer ownership explicitly, and inspect resumable task state."""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import subprocess
import sys
from workflow_store import TERMINAL, repository, task, tasks
from workflow_tasks import transition


def arguments(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", type=Path, default=Path.cwd())
    sub = parser.add_subparsers(dest="command", required=True)
    listing = sub.add_parser("list", help="Read active ownership without creating state")
    listing.add_argument("--all", action="store_true", help="Use the global explicit project inventory")
    listing.add_argument("--include-completed", action="store_true")
    listing.add_argument("--json", action="store_true")
    show = sub.add_parser("show")
    show.add_argument("id")
    for name in ["claim", "update", "handoff", "accept", "cancel-handoff", "block", "resume", "finish"]:
        command = sub.add_parser(name)
        command.add_argument("id")
        command.add_argument("--owner", help="Stable chat ID; defaults to CODEX_THREAD_ID")
        if name == "claim":
            command.add_argument("--goal", required=True)
            command.add_argument("--acceptance", required=True)
            command.add_argument("--scope", action="append", required=True)
            command.add_argument("--journal", required=True)
        else:
            command.add_argument("--summary", required=True, help="Short conclusion; no credentials or raw private payloads")
            command.add_argument("--next", required=name in {"update", "handoff", "block", "resume"})
            command.add_argument("--evidence", action="append", help="Non-secret file or check reference")
        if name == "handoff":
            command.add_argument("--to", required=True)
        if name == "accept":
            command.add_argument("--accept-source-change", action="store_true")
    return parser.parse_args(argv)


def inventory(args) -> list[dict]:
    paths = [args.repo]
    if args.all:
        config = Path(__file__).with_name("workflow-projects.json")
        if not config.is_file():
            raise ValueError("Use the global task.py for the configured project inventory")
        data = json.loads(config.read_text())
        paths = [Path(path).expanduser() for path in data["projects"]]
    results = []
    for path in paths:
        root = repository(path)
        for record in tasks(root):
            if args.include_completed or record["status"] not in TERMINAL:
                results.append({"project": root.name, "id": record["id"], "owner": record["owner"],
                                "status": record["status"], "worktree": record["source"]["worktree"],
                                "scope": record["scope"], "next": record["next"]})
    return results


def main(argv=None) -> int:
    args = arguments(argv)
    try:
        if args.command == "list":
            records = inventory(args)
            if args.json:
                print(json.dumps(records, indent=2))
            else:
                for record in records:
                    print(f"{record['project']}: {record['id']} [{record['status']}] owner={record['owner']} worktree={record['worktree']}")
                if not records:
                    print("No registered active tasks; this does not inventory unregistered chats")
        else:
            root = repository(args.repo)
            record = task(root, args.id) if args.command == "show" else transition(root, args)
            if args.command == "show":
                print(json.dumps(record, indent=2))
            else:
                print(f"{record['id']}: {record['status']} owner={record['owner']} revision={record['revision']}")
        return 0
    except (ValueError, OSError, KeyError, TypeError, subprocess.SubprocessError):
        # Avoid including arbitrary file contents or Git output in diagnostics.
        error = sys.exc_info()[1]
        message = str(error) if type(error) is ValueError else "Invalid or unavailable workflow state; inspect it privately"
        print("BLOCKED: " + message, file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
