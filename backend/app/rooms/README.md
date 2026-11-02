# Room workflows and public activity

Room services authorize human identities, lock the current room/match and apply
the pure engine. State, version, result, action receipt and public notification
commit atomically. Repository methods own SQL; the projection owns visibility.

`public_actions.py` retains the small, unchanged casino cue used by committed
chip/card animations. `public_history.py` builds the separate public timeline
for every registered game. It does not save or return a submitted action.

`RoomView.activity` contains up to 80 newest current-match events, ordered by
committed version. Each `PublicMoveView` carries version, actor ID, action type,
human-readable label, public target IDs, optional amount, public cards, optional
destination and optional affected-card count. Cards are limited to 12 per event;
`count` preserves the larger total, or the number of hidden cards drawn when
publicly observable. Destinations are display labels such as a property set,
board coordinate or pattern line, not raw private choices.

Events are stored under `public_move` in the existing private receipt JSON in
the same transaction as a valid move. No migration or second event store is
needed. Invalid/stale actions and retries cannot append a second event. The
match-prefix receipt index scopes reads to one match; the query sorts committed
versions and limits results to 80. Stored older events remain intact for retry
and historical integrity. Old receipts without activity are omitted, not
reconstructed. A fresh service/session reads the same saved public events.

History is available only to current match participants after normal active
room-membership authorization. A waiting late arrival receives no game history.
Rematch/switching selects the new match, so prior activity is not mixed in.

The builder reads only authorized participant projections. A face must be
identical in an explicit public zone for every participant before it can be
recorded. Private hands and arbitrary `detail` objects are excluded. The few
explicit public detail paths cover Trio reveals, 6 nimmt! rows/reveals, Sea Salt
& Paper discard tops and Shithead's already-public last play, including burns
and failed blind flips. A previously public discard may remain in history when
taken into a private hand; no newly hidden draw is revealed.

Party votes/predictions and locked number selections reveal no selected choice.
Once all 6 nimmt! players lock, the authoritative public reveal can be recorded.
Tarot events expose only the selection count, never cards, question, reading or
shuffle order. Unknown future actions fail closed to a generic description.
Targets and destination fields have per-family action allowlists. Private or
uncommitted free text, engine messages, deck order, bot memory and random state
are never copied. A Word Agents clue is recorded only from the authoritative
published clue after every participant projection agrees on the same text.

Verification lives in `test_public_history.py` (all 27 games and secrecy
canaries), `test_public_actions.py` (unchanged casino amounts) and
`test_public_actions_rooms.py` (real HTTP moves, durable readback, membership,
waiting guests, retries, conflicts, rejected moves, bounds, rematch and bots).
