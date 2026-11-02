"""Task ownership transitions and accepted handoffs; never runs product actions."""
from __future__ import annotations

import os
from pathlib import Path
from workflow_store import (TERMINAL, atomic_json, identifier, locked, now,
                            overlapping, same_source, scopes, snapshot, state_dir, task, tasks)


def owner(value: str | None = None) -> str:
    value = value or os.environ.get("CODEX_THREAD_ID")
    if not value or len(value) > 200 or any(c.isspace() for c in value):
        raise ValueError("Set --owner to a stable chat ID, or use CODEX_THREAD_ID")
    return value


def require_owner(record: dict, actor: str) -> None:
    if record["owner"] != actor:
        raise ValueError("Another chat owns this task; use an explicit accepted handoff")
    if record["status"] in TERMINAL:
        raise ValueError("Completed task history is retained; claim a new task ID")


def writable_task(root: Path, task_id: str, actor: str) -> dict:
    record = task(root, task_id)
    require_owner(record, actor)
    if record["status"] != "active" or record["source"]["worktree"] != str(root):
        raise ValueError("Task must be active in this worktree; resume or accept its handoff first")
    return record


def event(record: dict, action: str, actor: str, summary: str) -> None:
    record["revision"] += 1
    record["updated_at"] = now()
    record["history"].append({"at": record["updated_at"], "action": action,
                              "actor": actor, "summary": summary,
                              "source": record["source"],
                              "handoff": dict(record.get("handoff", {}))})


def save(root: Path, record: dict) -> None:
    atomic_json(state_dir(root) / "tasks" / (identifier(record["id"]) + ".json"), record)


def transition(root: Path, args) -> dict:
    actor = owner(args.owner)
    for name in ["goal", "acceptance", "summary", "next"]:
        value = getattr(args, name, None)
        if value is not None and (not value.strip() or len(value) > 4000):
            raise ValueError("Task notes must be concise non-empty text; link to the existing journal")
    with locked(root):
        if args.command == "claim":
            task_id = identifier(args.id)
            scope = scopes(root, args.scope)
            journal = scopes(root, [args.journal])[0]
            if not (root / journal).is_file():
                raise ValueError("Point --journal at the existing project journal")
            for existing in tasks(root):
                if existing["id"] == task_id:
                    raise ValueError("Task ID already exists; inspect it instead of replacing history")
                if existing["status"] not in TERMINAL and overlapping(scope, existing["scope"]):
                    raise ValueError("Scope overlaps task " + existing["id"] + "; coordinate with its owner")
            record = {"version": 1, "id": task_id, "owner": actor, "status": "active",
                      "goal": args.goal, "acceptance": args.acceptance, "scope": scope,
                      "journal": journal, "summary": "Claimed; inspect the journal before editing",
                      "next": "Implement and verify the stated acceptance criteria",
                      "source": snapshot(root), "revision": 0, "created_at": now(),
                      "verification": [], "evidence": [], "history": []}
        else:
            record = task(root, args.id)
            if args.command == "accept":
                if record["status"] != "handoff" or record["handoff"]["to"] != actor:
                    raise ValueError("Only the named receiving owner can accept this handoff")
                current = snapshot(root)
                if not same_source(record["source"], current) and not args.accept_source_change:
                    raise ValueError("Source changed or is incompletely fingerprinted; inspect it, then explicitly accept the source change")
                record["owner"] = actor
                record["status"] = "active"
                record["source"] = current
                record["handoff"]["accepted_at"] = now()
            else:
                require_owner(record, actor)
                if record["status"] == "handoff" and args.command != "cancel-handoff":
                    raise ValueError("Handoff is pending; the receiver must accept, or the owner cancel it")
                if record["source"]["worktree"] != str(root):
                    raise ValueError("Use the owning worktree, or hand off explicitly to this worktree")
                if args.command == "handoff":
                    if args.to == actor:
                        raise ValueError("Handoff needs a different receiving owner")
                    record["handoff"] = {"from": actor, "to": owner(args.to), "at": now(),
                                         "previous_status": record["status"]}
                    record["status"] = "handoff"
                elif args.command == "cancel-handoff":
                    if record["status"] != "handoff":
                        raise ValueError("No pending handoff to cancel")
                    record["status"] = record["handoff"]["previous_status"]
                    record["handoff"]["cancelled_at"] = now()
                elif args.command == "block":
                    record["status"] = "blocked"
                elif args.command == "resume":
                    if record["status"] != "blocked":
                        raise ValueError("Only blocked tasks need resuming")
                    record["status"] = "active"
                elif args.command == "finish":
                    record["status"] = "completed"
                record["source"] = snapshot(root)
            record["summary"] = args.summary
            if getattr(args, "next", None):
                record["next"] = args.next
            elif args.command == "finish":
                record["next"] = "None for the stated task; release state is documented in the journal"
            record["evidence"].extend(getattr(args, "evidence", []) or [])
        event(record, args.command, actor, record["summary"])
        save(root, record)
        return record


def attach_report(root: Path, task_id: str, actor: str, report: dict) -> None:
    with locked(root):
        record = writable_task(root, task_id, actor)
        reference = {"id": report["id"], "status": report["status"],
                     "groups": report["groups"], "head": report["source_before"]["head"],
                     "source_stable": report["source_stable"]}
        record["verification"].append(reference)
        event(record, "verification", actor, "Recorded local checks: " + report["status"])
        save(root, record)
