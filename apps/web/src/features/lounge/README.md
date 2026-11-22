# Lounge and catalogue

Lounge composes the existing header, compact home actions, member-room shortcuts
and shared room dialog. Games and Your games use shared accessible segmented tabs. Games is the default catalogue; Your games groups active/waiting and finished sessions separately. Inactive panels stay mounted to preserve game filters. Browsing never creates a guest identity; passive profile reads cannot create one even when stale preferences exist. GameLibrary owns search, group size and category
selection; findGames intersects them with an exact/alias match and bounded typo
fallback. Aliases include poker, draughts, Codenames, Splendor, Kalah and Palace
while preserving the actual edition names. Play solo selects Just me/Solo + bots;
supported game links carry `?mode=bots` without creating anything. Join accepts
codes and full invite links.

Pop Tarot is the first full-width catalogue row, using the shared GameTile's
featured variant. The poster arranges the three illustrated cards beside the crystal and its full brass stand on velvet. The visible Start reading
action links to `/games/tarot`, whose Start reading starts without setup. The entire
card remains one keyboard/touch link target. Search, category and player filters also
apply to this featured entry; it is never duplicated in the remaining game rows,
and the announced count still includes every matching game. Phones stack compact
art and copy; desktop shows them side by side without an additional hero block.

GameTile and ChoiceGroup are shared UI primitives; GameArt composes the same card
and board vocabulary as the tables. Metadata comes from the generated backend
catalogue, including fixed two-player and solo labels. Filter controls keep 44px
targets, visible focus, selected states, an announced count and a recovery action
for zero results. Filters never create a guest or room. Existing room membership
and profiles are loaded only after the player has saved play.

Check search aliases, category/player intersections, zero-result recovery,
keyboard focus, reduced motion and phone overflow in the browser suite. Selected
visual references and evidence are in docs/DESIGN_REFERENCES.md.
The current dashboard captures and verified private-entry/solo behavior are in
docs/evidence/dashboard-2026-11-01. Catalogue covers reuse real card metadata and
original shared illustration assets; no second component or token system exists.

Game entry lives in `features/game-entry`; `shared/game-paths` owns canonical
game, session and archive links. The global Create room shortcut retains advanced
setup, while game-page Play with friends fixes the chosen game and mode.
Room setup stays on one focused screen. Optional avatar colours and room name /
game rules appear on demand; Friends/Bots and seat count remain immediate. The
home brand reveals the Games panel; there is no duplicate top-level Games item
on home. Inner pages retain their navigation. Focused browser checks exercise tab keys,
filter retention, no-account browsing, member-only shortcuts, errors/retry and
phone first-fold spacing. Current captures: `docs/evidence/dashboard-tabs-2026-11-02`.

## Invitations

`Invitations.tsx` shows `me.invitations` above the tabs: "<name> invited you to
<room>", the game and "N of M players", with "Join <room>" and "Decline
invitation to <room>". Join calls `api.acceptInvitation`, stores the returned
room, refreshes the player and opens `roomPath(room)`. Decline stores the
returned player. A refusal (room full or closed) is shown in place and the
player is re-read. The lounge's player query refetches on window focus and every
20 seconds while the tab is visible, only for someone who has played, so an
invitation appears without a reload and browsing still never creates a guest.

The join entry takes a six-digit code (grouped as typed, numeric keyboard), a
pasted `/r/…` or `/join/…` link, an older 8-character code or an invite token;
parsing lives in `shared/room-invite.ts`.

Secret Santa (family `organiser`) is listed under Party and Solo + bots, matches
any group size because one organiser runs it for the whole group, and its tile
reads "Any group" through GameTile's `groupLabel` instead of a seat count.
