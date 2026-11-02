# Workflow ownership, handoffs and local verification

Run `python3 -B scripts/task.py list` before substantial work. Claim one outcome
with this chat's `CODEX_THREAD_ID` (or actual `--owner`), literal affected paths,
observable acceptance and root `progress.txt`. Existing active/blocked/pending
handoffs reserve overlapping paths across linked worktrees. No automatic expiry
or takeover is installed. Independent clones and machines do not share state.

```sh
python3 -B scripts/task.py claim workflow-review --goal 'Review workflow contracts' \
  --acceptance 'Affected local checks pass; unrelated work is preserved' \
  --scope scripts --journal progress.txt
python3 -B scripts/verify.py --task workflow-review tooling
python3 -B scripts/task.py handoff workflow-review --to RECEIVING_CHAT_ID \
  --summary 'Implementation ready' --next 'Read the journal, source and reports'
python3 -B scripts/task.py show workflow-review
python3 -B scripts/task.py accept workflow-review --summary 'Reviewed the handoff'
python3 -B scripts/task.py finish workflow-review --summary 'Stated local outcome verified'
```

The receiving owner accepts before editing. Inspect changed/incompletely hashed
source before explicitly using `--accept-source-change`. `update`, `block`,
`resume` and `cancel-handoff` preserve transitions and concrete next actions.
These commands do not send messages, start agents, grant permissions or move a
Codex conversation. Preserve the existing project journal as the decision and
outcome history; task JSON contains only coordination metadata and references.

Actual checks retain private reports under the Git common directory's
`codex-workflow/reports/`. `--json` emits one result; raw command output goes to
stderr. Reports preserve passed/failed/blocked/timed-out/interrupted/not-run
outcomes, durations, manifest references, source HEAD and working-change hashes.
Source changes during a passing run make it inconclusive. Untracked hashing is
bounded to 64 MiB; incomplete fingerprints are explicit. Ignored files, env
values, installed dependencies and external services are not fingerprinted.
There is no automatic reuse of old evidence or silent skipping of required checks.

`--list` and `--plan GROUP` are read-only and never passing evidence. The default
is tooling only. Run the affected product groups, browser and live checks when
product behavior changes; record gaps honestly. Worktrees isolate files, not
shared databases, credentials or services. Never record secrets, signed URLs,
raw private payloads or full command output in journals or task records.

The supported release path is local verification followed by the normal branch
rules. Local proof does not clear a GitHub-hosted runner account/billing block.
Do not change billing, fabricate a hosted CI success, waive required checks or
disable production/migration/security gates. Publication, deployment and live
verification remain separate claims.

## Games-specific runner

The existing frontend/backend/contracts/migrations/multiplayer/browser/load
groups remain defined in `scripts/verify.py`. `tooling` runs the existing import
boundary check and portable ownership/report tests. The default now selects
tooling; use explicit groups or `--all` for the full product suite. Each command
has a bounded timeout (default 1800 seconds, configurable from 1 to 3600 with
`--timeout`). Reporting uses repository-local helpers and needs no global install.
`--plan --json` prints the selected commands without running them. The internal
`workflow_verify.py` is the portable tooling harness, not a second product map.
