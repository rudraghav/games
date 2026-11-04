# Room shell

`Room.tsx` frames every game table: header, connection state, turn banner,
results, rematch lobby and the table itself. Game tables render inside it and
never duplicate these pieces.

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
driven while offline.

## Failed moves

A failed move shows a dismissible note pinned to the top of the viewport, never
over the decision dock. A stale move first refreshes the table; the note belongs
to the version shown after that refresh and clears once the table moves on again,
but stays at least six seconds so it can be read while bots keep playing. Starting
another move or dismissing it clears it at once.

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
