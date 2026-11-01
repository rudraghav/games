# Party originals — local acceptance, 1 November 2026

Three complete Games house-rule experiences: Spill or Chill, Most Likely and
Hot Seat. Each has 48 original prompts (144 total), 3–10 seats and two complete
spotlight rotations. Optional sip suggestions default off, accept any drink,
never affect points and always allow passing. No commercial prompt deck copied.
Exact scoring, ties, privacy and edition boundaries are in
[the owning rules document](../../../backend/app/games/party/README.md).

## Verified locally

- 26 pure-engine tests: balanced whole matches at minimum/maximum seats,
  deterministic/nonrepeating prompts, scoring, ties, all-pass games, role and
  target validation, immutable transitions and hidden-decision projections.
- Three frontend contract/render tests; party component lint passed.
- Two isolated Postgres HTTP tests: simultaneous different-player submissions,
  version conflicts, exact-action retry without duplicate commits, cross-actor
  receipt rejection, private no-store projections, outsider rejection, restart
  recovery and correct final revealed scores. Receipts store version metadata
  only. Fresh migrations/drift checks passed; the disposable database was removed.
- Six independent-session browser workflows across phone/desktop: real controls
  select and lock choices, other players cannot read them before reveal,
  out-of-order submissions work, tally/prediction points render correctly,
  next prompt and refresh retain state, and the page fits its viewport.
- Twelve full-match browser scenarios (all three modes × 3/10 seats × phone/
  desktop): 1,080 legal moves, natural results, saved scores/history, rendered
  results, rematch and same-group change game. Bulk decisions use each actor's
  authorized projection; result/rematch/change controls are clicked in browsers.
  Both suites closed their test room and memberships; zero transport retries.

The initial click suite raced the next player's stale UI snapshot and received
the intended version conflict. The test now waits for the visible submission
count before clicking; mutations are never automatically retried. Actual image
inspection also found and fixed a broad text-span rule stretching reveal avatars.
Final six-case click suite passed after that correction.

`party-local.json` carries sanitized full-match results and cleanup status.
These are local workspace checks; production proof belongs to the release record.

## Visual evidence

The six `party-<game>-<viewport>.png` images show real three-player rooms after
the first reveal. Phone captures use the device's pixel ratio; they are ordinary
portrait layouts, not enlarged desktop tables. The ten-player image separately
shows long names, horizontally scrollable seats and compact two-column voting.
The two catalogue images show original prompt-card compositions in the shared
poster component. Every retained image was opened and visually inspected.

- [Catalogue on desktop](party-catalogue-desktop.png) / [phone](party-catalogue-phone.png)
- [Spill or Chill desktop](party-spill-or-chill-desktop.png) / [phone](party-spill-or-chill-phone.png)
- [Most Likely desktop](party-most-likely-desktop.png) / [phone](party-most-likely-phone.png)
- [Hot Seat desktop](party-hot-seat-desktop.png) / [phone](party-hot-seat-phone.png)
- [Ten-player voting on a phone](party-most-likely-ten-players-phone.png)

The small Next.js development control visible in some captures is absent from
production. No invite links, account tokens or private provider values are saved.
