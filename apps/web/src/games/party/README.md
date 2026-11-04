# Party tables

Hot Seat, Most Likely To and Spill or Chill share the existing select, lock,
wait, reveal and next-prompt flow. The server owns submitted decisions and
outcomes; this table renders only the viewer's authorized projection.

An uncommitted choice is the viewer's own draft (`useTableDraft`, sessionStorage
for this tab only), scoped to the room, match, mode, round and player. Another
player's same-round submission preserves the draft, and so does a refresh. Lock
in does not clear it: the choice stays selected ("Saving: …") until the saved
round shows it as locked in, and stays selected if the save fails or is
rejected as stale, so the player can simply press Lock in again. If the same
identity commits in another tab, the authoritative locked state is shown. A
later round cannot reuse the old draft, even when another tab advances the
prompt or the spotlight rotates back to that player. Only the viewer's own
unsent option id is stored; nothing about anyone else.

Copy rules. Buttons carry their consequence: Spill or Chill shows "Spill · I
answered aloud (+1)", "Chill · keep it to myself (+1)" and "Pass (no point)".
Hot Seat names the player being predicted and keeps both options on the prompt
card in every phase; the reveal marks the hot-seat answer row "answer", not as
a missed prediction. In Most Likely the spotlight seat is labelled "Round host"
because it only advances the reveal. Collection phases list who the room is
still waiting for by name; the engine message stays the instruction for players
who are still choosing. Reveals lead with the result ("Most likely: Ada · 2
votes (+1)", "Ada chose A · …"), Most Likely rows are sorted by votes received
and say "voted for …". Seats and choices use one display name per seat (bots
drop the "Bot" prefix and get a badge).

Layout. The decision area is content-sized (`DecisionDock size="fit"`): Lock in,
Pass and Next prompt are wrapped in `data-decision-actions` so they stay pinned
at the bottom of the screen while the list scrolls with the page, and the dock
is keyed by round and phase so a reveal always opens at its top. Most Likely
candidates use one column on phones and break names only at spaces/hyphens
unless a single word cannot fit.

`tests/browser/party-recovery.spec.ts` exercises this sequence in actual saved
rooms across all three modes on desktop and phone. It uses independent guests
and a sibling tab sharing the host identity, checks exact version increments,
and closes only its own rooms while preserving match history. Private traces
and screenshots are disabled.
