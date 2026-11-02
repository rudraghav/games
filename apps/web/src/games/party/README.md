# Party tables

Hot Seat, Most Likely To and Spill or Chill share the existing select, lock,
wait, reveal and next-prompt flow. The server owns submitted decisions and
outcomes; this table renders only the viewer's authorized projection.

An uncommitted choice is transient component state, scoped to the match, mode,
round and player. Another player's same-round submission preserves the draft.
If the same identity commits in another tab, the authoritative locked state is
shown. A later round cannot reuse the old draft, even when another tab advances
the prompt or the spotlight rotates back to that player. Confirmation and local
advancement clear the draft, and reloading does not restore an uncommitted choice.
No choice is written to browser storage.

`tests/browser/party-recovery.spec.ts` exercises this sequence in actual saved
rooms across all three modes on desktop and phone. It uses independent guests
and a sibling tab sharing the host identity, checks exact version increments,
and closes only its own rooms while preserving match history. Private traces
and screenshots are disabled.
