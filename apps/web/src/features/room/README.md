# Room shell

`Room.tsx` frames every game table: header, connection state, turn banner,
results, rematch lobby and the table itself. Game tables render inside it and
never duplicate these pieces.

Named multiplayer `/games/[gameId]/rooms/[id]` and solo
`/games/[gameId]/play/[id]` routes share this renderer for Tarot, Roulette and Slots. The old `/rooms/[id]`
route remains compatible. RoomScreen replaces legacy or stale game paths only
after successful authorized room and player reads; a slug grants no access.

Tarot presents Pop Tarot and Reading options, with Saved readings and Back to
Tarot. Multiplayer invite, host and chat controls are omitted. Going back
does not abandon the spread; home's Your games can resume it. A legacy solo
lobby still offers Start reading for recovery, without a multiplayer setup form.

## Order on screen

- Playing: banner, then the table.
- Finished (every game except Tarot, whose reading is the result): banner,
  `RoomResults`, the rematch `Lobby`, a "Final table" heading, then the table.

## Turn banner

`turnState` (`games/shared/turn-state.ts`) writes the label from the viewer's
seat. The engine message is shown only to a seat that can act; waiting seats see
who they are waiting for. The "Last move" line is built by `move-description.ts`
from the latest public `room.activity` entry, attributed to its player
("Dev played: Red 7 → you"). Labels that describe the whole table
("Everyone’s numbers were revealed") read as their own sentence, without an
actor. Labels come from `backend/app/rooms/public_history.py`.

## Connection

`useRoom` reports `connection`: `offline` (the browser has no network),
`reconnecting` (room reads keep failing), `live` (realtime) or
`connected` (polling). The header chip shows every state on desktop; on phones it
appears only for `offline` and `reconnecting`. While offline the table stays
readable but is dimmed and `inert`, so it neither looks nor acts live, a sticky
banner explains it, and the banner's message says moves pause. A move started just
before the network dropped stays queued (TanStack pauses it) and is sent once on
reconnect; the banner says so instead of an endless "Saving…". Bots are not
driven while offline. The table also receives a local pause while offline, so
move panels portalled outside the inert frame disable their commit controls.
`useRoom.move` independently rejects new offline submissions. Draft choices stay
in place and become usable again on reconnect; the cached server room is unchanged.

## Failed moves

A failed move shows a dismissible note pinned to the top of the viewport, never
over the decision dock. A stale move first refreshes the table; the note belongs
to the version shown after that refresh and clears once the table moves on again,
but stays at least six seconds so it can be read while bots keep playing. Starting
another move or dismissing it clears it at once.

## Leaving a room

Only a successful Leave removes that room from the cached membership list before
returning to the lounge. Any older player read is cancelled so it cannot restore
the departed shortcut; profile, history and other memberships stay intact while
the player query refreshes. Failed leaves keep the room open and show the normal
mutation error. The dashboard browser test checks the return without a reload.

## Bots

A connected human's page drives the one due bot move at `room.botDueAt`. The
server sets that time: 0.8s for ordinary moves, a longer pause before a bot
closes a review or reveal, and a fair window before a bot may catch an
unannounced UNO (see `backend/app/bots/README.md`). The page never decides
pacing itself.

## Verification

`apps/web/src/tests/table-shell.test.tsx` covers seat labels, the player strip
and the move line helpers; `room-presentation.test.tsx` covers banner and
results wording. Browser coverage: `tests/browser/room-layout.spec.ts`,
`hand-navigation.spec.ts`, `table-density.spec.ts`, `stable-game-tables.spec.ts`.

## Guided play

The opt-in TurnCoach uses the authorized table and committed public activity.
Direct teaching buttons submit the exact projected move via the table's normal
save. Decisions involving cards, targets, bets, optional effects or hidden
information use the game controls where appropriate. The main teaching card and
compact, dismissible scroll tip describe the move and applied rule. The modal
rulebook shares its formatted rules, diagrams and examples with the public entry.
Ordinary play opens with the tutorial off. The header's Rules & tutorial button
opens the book with a Step-by-step tutorial switch for the host of a solo or
bot-only match. The switch applies immediately, stays in the book, and preserves
the current match and turn. Its choice survives reload. Short phone headers
display Rules. Rooms shared with other humans offer the same illustrated book.

## Lobby: bots, invite panel and short links

`Lobby.tsx` composes `BotSeat`, `InvitePanel` and `InviteByUsername`.

- `BotSeat`: for the host, a level select ("<name> difficulty"), "Rename <name>"
  (inline edit; Enter saves, Escape cancels, a name already at the table is
  refused in place) and "Remove <name> bot". Changes go through `api.updateBot`
  and the room's shared mutation, so a refusal shows in the room's error note.
  Other players see the level as the seat badge. "Add bot" still seats a Hard bot.
- `InvitePanel` (group "Invite friends"): `.room-code` holds the grouped code,
  `.invite-link` the short link, then Share (only when `navigator.share` exists),
  "Copy link" and "Copy code" with a status line. The copied link is
  `<origin>/r/<code>`; the long invite token is no longer copied.
- `InviteByUsername`: searchbox "Find a friend by username" (2+ characters,
  250ms debounce, `api.searchPlayers`), results with "Invite <name> (@username)",
  and the "Invited" list from `room.pendingInvites` with "Cancel invitation to
  <name>". Invite and cancel update the room cache from the returned room and
  report inline. `pending_invites` does not say who sent an invitation, so the
  Cancel button shows for the host and for invitations sent from this browser
  tab (kept in `sessionStorage`); the server remains the authority.
- A member without a username sees "Let friends find you: choose a username",
  which opens the shared `UsernameField`.
- `ShortRoomLink` serves `/r/[code]`. `findOwnRoom` reads the player passively
  (no guest is created); a visitor with no session or in no room is not looked
  up at all. Otherwise it calls `passiveApi.lookup` once per page open (a ref
  guards React's development remount; there is no retry or refetch), then
  `router.replace(roomPath(...))` for a member or `Join` with the code filled
  in. `/join/[token]` is unchanged. Solo tables have no invite panel, so nothing
  here assumes their code is six digits.
- A Cancel the server refuses (a guest who did not send that invitation) shows
  the server's sentence and leaves the invitation listed.

Unit coverage: `apps/web/src/tests/room-setup-invites.test.tsx`. Browser
coverage: `tests/browser/room-setup-invites.spec.ts` (two real multi-guest
flows per device, plus mocked lobby states for sharing and search errors).

An `organiser` game (Secret Santa) is a solo room whose table states its own
progress: like Tarot it has no turn banner, results panel or rematch lobby, and
its saved moves read as plain sentences ("You added a name").

## Progress line, frames and card backs (23 November 2026)

- **Results**: `ResultsProgress.tsx` sits directly under `RoomResults`, above
  the rematch controls, for multiplayer and solo tables alike. It asks for
  progress once when the result appears (`staleTime: 0`, keyed per match) and
  shows the level ring, "N XP to level M", the streak when there is one and a
  "See rewards" link to `/rewards`. It states where the player stands now and
  compares nothing. Its box is the same height while loading, loaded or
  unavailable, and it never disables or delays Ready, Start rematch or Play
  again.
- **Avatar frames**: each member carries `frame` (an id or null). `Lobby`,
  `Chat` and every table that draws a seat or an avatar (`PlayerStrip`,
  `OpponentPanel`, Deal, Skyjo, the casino tables, the party tables, Uno's
  swap choice) pass it to `Seat` or `Avatar`. A frame is decoration: the
  avatar's accessible name is still the player's name, and an id this build
  does not know draws nothing. Bots have no frame.
- **Card backs**: `Room.tsx` sets `data-card-back` on `.room-page` from the
  viewer's own `profile.cardBack`, and only when it is one of the four known
  ids. The CSS in `rewards.css` restyles `.playing-card--back` under it, so
  only this viewer's screen changes and nobody else's cards look different.
  Dialogs render outside the room root and keep the standard back. Tarot's
  deck is a different component and is not affected.
- **Invite panel**: the share half of `InvitePanel` is a `Ticket`. The stub
  holds "Room code" and `.room-code`, large and grouped; the body holds the
  heading, `.invite-link`, Share / Copy link / Copy code and the status line.
  On phones the stub is on top. The group name, classes and button names are
  unchanged; finding a friend by username sits beside it in its own card.
