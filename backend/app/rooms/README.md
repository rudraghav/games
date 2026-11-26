# Room workflows and public activity

Room services authorize human identities, lock the current room/match and apply
the pure engine. State, version, result, action receipt and public notification
commit atomically. Repository methods own SQL; the projection owns visibility.

Tarot generation reserves the selected Classic/Fun style as private match metadata with the request. The current and saved reading endpoints return it as `reading_style`. Fresh spreads use Fun. Older submitted readings without a recorded choice retain Classic. Reopening the archive reads the original result without another provider call.

## Room codes, links and the wrong-code limit

A new room, a quick-play room and a rotated invite (`POST .../invite`) get a
six-digit code from `secrets`: first digit 1-9, never one repeated digit or a
straight run such as 123456 or 654321. `Repository.claim_code` takes a
non-blocking transaction advisory lock on the drawn code and checks that no
room holds it; a taken or contended code is redrawn, so two rooms created at
once cannot share a code and no claim waits on another.

`POST /v1/rooms/join` accepts a six-digit code (also typed as `482 913` or
`482-913`), an older eight-character code, or the long invite token. Rooms
created before this change keep their eight-character code and it keeps working.

When the last person leaves, the room becomes `closed`, its code is replaced by
a random eight-character value and its pending invitations are deleted. The
number is free for a new room at once and opens nothing.

Each actor may miss at most 10 code or token lookups in a 10-minute window
(`rate_buckets`, scope `wrong-invite`). The eleventh miss and every join or
lookup after it in that window answer 429 "Too many wrong codes. Wait ten
minutes, then try again." A wrong code and a closed room give the same 404 and
spend the same allowance. The existing 30-per-minute join limit is unchanged.
A valid code for a solo table still answers its own 409 and is not a miss.

`GET /v1/rooms/lookup/{invite}` returns `{id, game_id}` only when the caller is
an active human member of the room that code or token belongs to. An unknown
code, a closed room and a room the caller is not in all answer the same 404.
An unknown code and a closed room count as misses; an open room the caller is
not in does not, so opening a friend's link before joining costs nothing (it
tells the caller no more than joining with that code would). A lookup never adds
the caller to a room.

A solo table (Tarot, the wheel and reel games, Secret Santa) cannot be joined,
so it is given an eight-character code from the start and takes no six-digit number.

## Bots: count, names and level

`CreateRoom.bot_seats`, when given, replaces the plain `bots` count: one bot per
entry with its `level` (`easy`, `medium`, `hard`) and optional `name`.
`POST .../bots` applies one `level` to every bot it adds; `name` is allowed only
with `count` 1. `PATCH /v1/rooms/{id}/bots/{bot_id}` lets the host rename a bot
or change its level between matches (409 while playing, 404 for anything that
is not an active bot of that room, 422 for an empty change).

A host-chosen name is stored as given and must differ, ignoring case, from every
current member's name (422). Default names stay `Bot Ada`, `Bot Bo` and so on,
skipping names already in use. The level is stored on `room_members.bot_level`;
rows from before levels existed are NULL and are shown and played as hard.
`MemberView.bot_level` is the level for a bot and null for a person. Quick play
seats hard bots. `drive_bots` passes the acting bot's level to its policy.

### Bot pacing and order

After every committed move `app/rooms/bots.py` sets `bot_due_at`. An ordinary
bot move waits 0.8s. A bot that can only close a review waits longer
(`BOT_REVIEW_DELAY_SECONDS`): `continue` 5s (Trio, Bluff's reveal),
`next_selection` 4s, `next_prompt` 6s, `next` 6s (Truth or Dare's
burning-building result), `next_round` 8s (round summaries, Liar's Dice's
reveal) and `next_heist` 8s. A Housie bot whose only move is `call_number`
waits 3s before each call.

Which bot goes first: a bot's own UNO announcement, then a Housie bot that can
mark or claim (before a bot caller draws again), then the bot whose turn it
is, then any other bot with a legal move. These choose among each bot's own
legal actions and never change a rule.

## Usernames and player search

`PUT /v1/profile/username` sets the caller's username: 3 to 20 of a-z, 0-9 and
underscore, stored lowercase, unique. The caller needs a profile first (409).
Reserved names and anything starting with `bot` are refused (422); a taken name
answers 409 "That username is taken.", including when two requests race for it.
Setting the current username again succeeds unchanged. `DELETE` clears it and
withdraws invitations still waiting for that player. Limit: 20 a minute.

Only `GET /v1/me` and the profile endpoints return a username, and only the
caller's own. It is never part of `MemberView` or any room member list. Another
player sees it in two places: search results and a room's pending invitations.

`GET /v1/players/search?q=` is a case-insensitive prefix match (a leading `@`
is ignored, LIKE wildcards are escaped). It returns at most 8 players, an exact
match first and then alphabetically, never the caller, never a bot and only
profiles that have a username. Each hit is username, display name and avatar.
Fewer than two usable characters return an empty list. Limit: 30 a minute.

## Invitations by username

`POST /v1/rooms/{id}/invites {username}`: the caller must be an active human
member. A closed room and a solo table answer 409 (the solo wording is the one
join uses); an unknown username 404 "No player has that username."; the caller
themselves or an active member 409; more than 20 pending invitations 409.
Inviting someone already invited changes nothing. Limit: 20 an hour. A new
invitation bumps the room revision.

`RoomView.pending_invites` lists each invitee's username, name and avatar for
members of the room. `DELETE /v1/rooms/{id}/invites/{username}` cancels one;
only the host or the member who sent it may (403 otherwise, 404 for non-members).

`MeView.invitations` lists the caller's pending invitations to rooms that are
not closed, newest first: room id and name, game, the inviter's display name
and avatar, seated players and capacity. It never carries a code or token, and
an invitation alone gives no access to the room.

`POST /v1/invitations/{room_id}/accept` joins through the same path as a code
(`RoomService._enter`: seats, lobby-bot replacement, watcher during a match,
full room, solo refusal) with the caller's saved profile, then deletes the
invitation; 404 without one. `DELETE /v1/invitations/{room_id}` declines and
returns the fresh `MeView`; declining twice is a no-op. An invitation is also
deleted when its room closes, when the invitee joins by any route, when the
host removes that player, and when the invitee clears their username.

Tests: `test_room_codes.py`, `test_bot_setup_rooms.py`, `test_usernames_rooms.py`
and `test_room_invitations.py` run in the `multiplayer` verification group.

## Player progress and earned rewards

Progress is worked out by the server from saved results every time it is asked
for. No XP, level, streak or badge is stored, and no request carries a number
the server would believe. `progress.py` holds every rule and is pure: it takes
plain match facts and "now", so it has no database or clock access.

**Counted matches.** A player's finished matches whose result is not abandoned
and in which they were a participant (a watcher earns nothing).
`Repository.played` returns game, created time, result and participants for
every saved result the player can reach, with the same reach as the history in
`GET /v1/me` (including solo Tarot and wheel/reel sessions that outlive
membership) but with no limit and without the game state. A participant whose
id starts with `bot:` is a bot.

**XP.** 10 for each counted match, +10 for a win, +5 when at least one other
person (not a bot) took part, +15 for each different game finished at least
once. A win is being in `winners` of a match with at least two participants: it
needs someone to beat, a person or a bot. Games played alone (Tarot readings,
Secret Santa draws, the wheel and the reels) count as finished matches and are
never wins, whatever the engine names as the winner.

**Level.** Level L begins at `25 * L * (L - 1)` XP: 0, 50, 150, 300, 500, 750,
1050, 1400 (level 8) and so on. `level_xp` is where the current level began and
`next_level_xp` where the next begins.

**Streak.** Days in a row with at least one counted match, in the player's own
day: `tz_offset` (minutes east of UTC, -720 to 840) is added to each match's
created time and to now. `current` is the run ending today or yesterday, so a
streak is not shown as lost just after midnight; otherwise 0. `best` is the
longest run ever. `played_today` says whether today already counts. The offset
comes from the caller, so two offsets can split the same games into different
days; it can move a day boundary but cannot create a day nobody played.

**Totals.** `games`, `wins`, `different_games`, `with_friends` (matches with at
least one other person).

| Badge id | Name | Description | Goal | Counts |
| --- | --- | --- | --- | --- |
| `first-game` | First game | Finish your first game | 1 | finished games |
| `regular` | Regular | Finish 10 games | 10 | finished games |
| `veteran` | Veteran | Finish 50 games | 50 | finished games |
| `first-win` | First win | Win a game | 1 | wins |
| `five-wins` | Five wins | Win 5 games | 5 | wins |
| `twenty-five-wins` | Champion | Win 25 games | 25 | wins |
| `explorer` | Explorer | Finish 5 different games | 5 | different games |
| `collector` | Collector | Finish 15 different games | 15 | different games |
| `good-company` | Good company | Finish 5 games with other people | 5 | games with another person |
| `full-table` | Full table | Finish a game with 3 or more other people | 1 | games with 4 or more people, bots not counted |
| `streak-3` | Three in a row | Play 3 days in a row | 3 | best streak |
| `streak-7` | Full week | Play 7 days in a row | 7 | best streak |
| `reader` | Reader | Finish a Tarot reading | 1 | finished Tarot readings |
| `organiser` | Organiser | Finish a Secret Santa draw | 1 | finished Secret Santa tables |

A badge's `value` is its progress capped at `goal`; `earned` is `value >= goal`.

| Reward id | Kind | Name | Requirement |
| --- | --- | --- | --- |
| `frame-gold` | frame | Gold frame | Reach level 2 |
| `frame-laurel` | frame | Laurel frame | Earn the Five wins badge |
| `frame-flame` | frame | Flame frame | Earn the Three in a row badge |
| `frame-confetti` | frame | Confetti frame | Earn the Good company badge |
| `frame-crown` | frame | Crown frame | Reach level 8 |
| `back-midnight` | card_back | Midnight card back | Reach level 3 |
| `back-sunrise` | card_back | Sunrise card back | Earn the Explorer badge |
| `back-emerald` | card_back | Emerald card back | Earn the Regular badge |
| `back-royal` | card_back | Royal card back | Reach level 6 |

A reward's `value`/`goal` mirror its requirement: the level (capped at the
level needed) or the badge's own progress. `state` is `locked` until the
requirement is met, `available` once met and not yet redeemed, `redeemed` after
that. `equipped` is true for the redeemed frame or card back in use. `BADGES`
and `REWARDS` in `progress.py` are the only place these names, descriptions and
requirements exist; the web shows what the API sends.

Rewards are cosmetic and stay inside the app: there is no money, no code and no
outside offer.

**Routes.** All three answer the caller's own `ProgressView` and take the same
optional `tz_offset`.

- `GET /v1/progress`: a player with no profile or no games gets the empty
  level-1 view, never a 404, and no profile is created. Limit: 60 a minute.
- `POST /v1/rewards/{reward_id}/redeem`: unknown id 404; still locked 409
  "Gold frame is not earned yet. Reach level 2 first."; available becomes
  redeemed; already redeemed changes nothing. Limit: 30 a minute.
- `PUT /v1/profile/cosmetics {frame, card_back}`: each is null or a reward of
  that kind the caller has redeemed. An unknown id or the wrong kind is 422; a
  reward not yet redeemed is 409. Both fields are always applied, so a field
  left out or null takes that item off. Limit: 30 a minute.

**What is stored.** Only `profiles.cosmetics`:
`{"claimed": [reward ids], "frame": id or null, "card_back": id or null}`. It is
read defensively (`read_cosmetics`): unknown ids and ids of the wrong kind are
ignored. A stored claim counts only while its requirement is still met, so a
claimed reward that is no longer earned is shown as `locked`, is not `equipped`
and cannot be worn. Redeeming and wearing hold the profile row
(`FOR NO KEY UPDATE`, so joins are not blocked) and two redeems at once both
stick.

**What is public.** Only the worn frame id: `ProfileView.frame`, so
`MemberView.frame` in every `RoomView` and `OwnProfileView.frame`. A bot's frame
is null, and a stored id that is not a known frame is projected as null. The
projection checks that the id is a known frame, not that it is still earned;
earning is checked when it is redeemed and when it is worn.
`OwnProfileView.card_back` is returned to its owner only (`GET /v1/me`, the
profile and username endpoints). XP, level, streak, totals, badges and rewards
appear in no other response and nothing about another player's progress is ever
returned.

When the worn frame changes, every open room the player is an active member of
has its revision bumped so tables showing their seat refresh. The rooms are
locked in id order before the profile, the order a join uses. Changing only the
card back, or wearing the same frame again, bumps nothing.

Tests: `test_progress.py` (pure rules, `backend` group) and
`test_progress_rooms.py` (HTTP, `multiplayer` group).

## Direct solo and bot starts

`POST /v1/games/{game_id}/play` takes a UUID `request_id`. An intentional start
preserves an existing profile or inserts Guest, fills the minimum supported bot
group (at least one bot), readies the human and starts through the same engine
path in one transaction. Tarot uses one seat. Failure rolls back the profile,
room, members and match together. Creation/start limits still apply.

Room and first-match IDs are derived from authenticated actor plus request ID.
A transaction-scoped advisory lock serializes duplicate launches even before a
room exists, without reversing ordinary room-before-profile lock ordering.
Retry returns the original authorized match; it never revives a departed,
closed or rematched session or changes its game. The separate quick-play
throttle bounds replays. `test_quick_play.py` covers every catalogue entry,
profile preservation, hidden cards, limits, rollback and concurrent launch/join.

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

Verification lives in `test_public_history.py` (the full catalogue and secrecy
canaries), `test_public_actions.py` (unchanged casino amounts) and
`test_public_actions_rooms.py` (real HTTP moves, durable readback, membership,
waiting guests, retries, conflicts, rejected moves, bounds, rematch and bots).

## Match-participant boundary and recovery

Waiting members receive lobby/membership metadata, but no game, public activity,
last-action casino cue or bot-driving indicator/due time from the active match.
Only participants receive those match projections; outsiders still receive 404.
The frontend applies one revision acceptance rule to normal GET, action,
heartbeat and bot responses. Lower room revisions are rejected even across a
rematch; equal revisions may refresh presence. No schema or transaction changes.

## Private saved Tarot archive

Generation uses a180-second saved lease around the bounded provider request.
Private `_progress` metadata in that lease persists each actual generation stage,
provider/attempt, original timestamps and bounded estimate. Authorized reading GETs
return its validated optional projection; public room events and archives never
expose it. Every milestone write rechecks the current match, attempt ID, status
and unexpired lease under a short room lock. Provider I/O happens outside locks.
Completion atomically replaces the draft with the validated reading. Legacy active
leases retain a compatible estimated writing state; expired leases can be retried.
`test_tarot_progress_rooms.py` covers polling during a held POST, duplicate POST,
outsider privacy, stale writers and legacy leases without external AI calls.

Every retry reserves the daily budget separately. If all eligible alternatives
fail, a final provider429 marks the attempt failed and returns a clear request-limit
message without raw provider details;
the exact spread remains available and a later retry can save/read back normally.

`GET /v1/readings/{match_id}` reads the exact historical match and saved reading.
Only that Tarot match's sole recorded participant may read it; current room
membership is not required. Unknown, non-Tarot and other players' matches all
return 404. The response includes only the chosen cards, private saved question,
backwards-compatible reading and a current-room return flag. Closed rooms and
rematches cannot be resumed from an old archive entry. Responses are private and
non-cacheable; archive reads never generate output or change the saved record.

The optional `style=fun|classic` query on this GET applies only to completed readings. The original request and an explicit request for the saved style return the original. A different style returns a participant-only presentation with the same cards and chart, plus `original_reading_style`. Reading a different style reserves no attempt, calls no generation provider and writes no data.

Complete legacy readings keep their original text and optional missing layers.
Missing, failed and expired attempts are explicitly incomplete; a live lease is
generating. Invalid stored output is explicitly unavailable and emits only a safe
warning, leaving the original payload intact. Profile history also discovers a
completed solo Tarot match when its old membership row is absent.
`test_tarot_archive.py` verifies these boundaries in an isolated database.

## Secret Santa private links

The people in a Secret Santa draw are names the organiser typed, not room
members. Each person reads their own draw through a private link. Rules and the
token scheme are in `app/games/secret_santa/README.md`.

`GET /v1/rooms/{room_id}/secret-santa/links` returns `SantaLinks`: one
`{id, name, token}` per person. Only the organiser gets them: an active human
member of the room who is the sole participant of its current match. Anyone
else gets the usual room 404. A room whose current match is not Secret Santa,
or has no match, answers 409 "Start a Secret Santa table and draw the names
first."; a table still being set up answers 409 "Draw the names first. The
links appear after the draw." Tokens are derived on each request, never stored.

`GET /v1/secret-santa/{token}` returns `SantaReveal`: title, day, location,
budget, the person's own name and the name they drew. The token is the
permission: any signed-in session may use it, a guest session included, without
a profile or a room. It works while that match is in the `drawn` or `finished`
phase, also after the organiser has left and the room has closed, and after the
table was abandoned. It stops working when the organiser goes back and draws
again.

A malformed, forged, outdated or unknown token gets one answer, 404 "This link
doesn't open a name. Ask the organiser for a new one." Each actor may miss 10
times in 10 minutes (`rate_buckets`, scope `wrong-santa-link`, counted apart
from wrong room codes); the eleventh miss and every read after it in that
window answer 429. Reads are also limited to 30 a minute per actor. Responses
are private and non-cacheable.

The first time a link is opened the service marks that person as having looked
(`SecretSantaEngine.mark_opened`) under the room's row lock and, unless the
room is closed or has moved on to another match, adds one to the room revision,
so the organiser's table refreshes. The match version is the organiser's move
counter and is left alone, so a move they were choosing at that moment still
goes through. No receipt, activity entry or message is written for a visit, and
opening the same link again changes nothing.

The organiser's `RoomView` and its activity never contain a recipient, except
`detail.showing` while the organiser shows one person their name. Tokens, names
and draws are never written to a log; the access log keeps the route and
replaces the token (`app.main.HidePrivateLinks`). The hosting platform's own
request log still records request paths. `test_secret_santa_rooms.py` covers
these routes in the `multiplayer` verification group.

## Saved wheel and reel sessions

`GET /v1/chance-sessions/{match_id}` returns the completed Roulette or Slots
projection for its original sole participant, including settled spins, final
balance and score. The service authorizes the participant and completion before
calling the engine. Missing, active, abandoned, unrelated and other players'
matches return the same 404. Responses use private, no-store caching.

Archived results remain available after a new round, room closure and loss of the
old membership row. Reopening one creates no moves or receipts. The isolated
`test_chance_archive.py` suite checks these paths against both games.

The private profile summary uses each game’s completed-match score for the requesting participant. Deal recalculates their distinct completed colours from the final public properties, because older results could retain the previous owner’s score after a winning transfer. Other games keep their saved score. This read preserves the archive and stored winners; abandoned matches stay out of player history.
