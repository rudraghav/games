"""Private, atomic coordination state shared by a repository's Git worktrees."""
from __future__ import annotations

from contextlib import contextmanager
from datetime import datetime, timezone
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
import unicodedata

TERMINAL = {"completed"}


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def git(root: Path, *args: str) -> bytes:
    return subprocess.check_output(
        ["git", "-C", str(root), *args], stderr=subprocess.DEVNULL,
        stdin=subprocess.DEVNULL, timeout=30,
    )


def repository(path: Path) -> Path:
    root = Path(git(path, "rev-parse", "--show-toplevel").decode().strip()).resolve()
    name = unicodedata.normalize("NFKD", root.name).encode("ascii", "ignore").decode().lower()
    if name == "anou" or root == (Path.home() / "anou").resolve():
        raise ValueError("Anoū is excluded from this workflow rollout")
    return root


def state_dir(root: Path) -> Path:
    common = Path(git(root, "rev-parse", "--git-common-dir").decode().strip())
    path = (root / common).resolve() / "codex-workflow"
    if path.is_symlink():
        raise ValueError("Workflow state must not be a symbolic link")
    return path


def identifier(value: str) -> str:
    if not re.fullmatch(r"[a-z0-9][a-z0-9._-]{0,79}", value):
        raise ValueError("Use a short lowercase task/report ID without path separators")
    return value


def private_dir(path: Path) -> None:
    if path.is_symlink():
        raise ValueError("Workflow state must not be a symbolic link")
    path.mkdir(parents=True, exist_ok=True, mode=0o700)
    path.chmod(0o700)


def atomic_json(path: Path, value: dict) -> None:
    private_dir(path.parent)
    if path.is_symlink():
        raise ValueError("Workflow records must not be symbolic links")
    descriptor, temporary = tempfile.mkstemp(prefix=".writing-", dir=path.parent)
    try:
        with os.fdopen(descriptor, "w") as stream:
            json.dump(value, stream, indent=2, ensure_ascii=False)
            stream.write("\n")
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


@contextmanager
def locked(root: Path):
    directory = state_dir(root)
    private_dir(directory)
    descriptor = os.open(directory / "lock", os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600)
    try:
        try:
            fcntl.flock(descriptor, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise ValueError("Workflow state is busy; retry after the current update") from None
        yield
    finally:
        os.close(descriptor)


def tasks(root: Path) -> list[dict]:
    directory = state_dir(root) / "tasks"
    if directory.is_symlink():
        raise ValueError("Workflow state must not be a symbolic link")
    records = []
    for path in sorted(directory.glob("*.json")):
        if path.is_symlink():
            raise ValueError("Workflow records must not be symbolic links")
        record = json.loads(path.read_text())
        if (record.get("version") != 1 or record.get("id") != path.stem
                or record.get("status") not in {"active", "blocked", "handoff", "completed"}
                or not isinstance(record.get("owner"), str) or not record["owner"]
                or not isinstance(record.get("scope"), list) or not record["scope"]
                or any(not isinstance(scope, str) or not scope for scope in record["scope"])
                or not isinstance(record.get("source"), dict)
                or not isinstance(record.get("history"), list)):
            raise ValueError("Invalid task state; inspect privately before continuing")
        records.append(record)
    return records


def task(root: Path, task_id: str) -> dict:
    identifier(task_id)
    for record in tasks(root):
        if record["id"] == task_id:
            return record
    raise ValueError("Task not found; list active ownership before claiming new work")


def scopes(root: Path, paths: list[str]) -> list[str]:
    result = []
    for value in paths:
        if not value or any(char in value for char in "*?[]\\"):
            raise ValueError("Scopes are literal repository paths, not glob patterns")
        path = Path(value)
        if ".." in path.parts:
            raise ValueError("Scopes cannot traverse parent directories")
        try:
            relative = (root / path).resolve().relative_to(root)
        except ValueError:
            raise ValueError("Scopes must remain inside this repository") from None
        result.append(relative.as_posix())
    return sorted(set(result))


def overlapping(left: list[str], right: list[str]) -> bool:
    return any(a == "." or b == "." or a == b or a.startswith(b + "/")
               or b.startswith(a + "/") for a in left for b in right)


def snapshot(root: Path) -> dict:
    """Fingerprint changed source without retaining its contents or private values."""
    digest = hashlib.sha256()
    for args in [("status", "--porcelain=v1", "-z"),
                 ("diff", "HEAD", "--binary", "--no-ext-diff", "--no-textconv"),
                 ("diff", "--cached", "--binary", "--no-ext-diff", "--no-textconv")]:
        digest.update(hashlib.sha256(git(root, *args)).digest())
    complete, remaining = True, 64 * 1024 * 1024
    for raw in git(root, "ls-files", "--others", "--exclude-standard", "-z").split(b"\0"):
        if not raw:
            continue
        digest.update(raw + b"\0")
        path = root / os.fsdecode(raw)
        try:
            if path.is_symlink():
                digest.update(os.fsencode(os.readlink(path)))
            elif path.is_file() and path.stat().st_size <= remaining:
                with path.open("rb") as stream:
                    while chunk := stream.read(1024 * 1024):
                        remaining -= len(chunk)
                        if remaining < 0:
                            complete = False
                            break
                        digest.update(chunk)
            else:
                complete = False
        except OSError:
            complete = False
    return {"head": git(root, "rev-parse", "HEAD").decode().strip(),
            "branch": git(root, "branch", "--show-current").decode().strip(),
            "worktree": str(root), "fingerprint": digest.hexdigest(),
            "fingerprint_complete": complete,
            "limitations": "Ignored files, environment values, dependencies and external services are not fingerprinted"}


def same_source(left: dict, right: dict) -> bool:
    return (left["fingerprint_complete"] and right["fingerprint_complete"]
            and left["head"] == right["head"] and left["fingerprint"] == right["fingerprint"])
