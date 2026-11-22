# Room setup, six-digit codes, short links, usernames and invitations — 22 November 2026

## What changed

- Create room: a Bots stepper beside Friends / Bots and Seats, and a "Bot players" list
  with an editable name and Easy / Medium / Hard for each bot. A mixed room opens its
  lobby; a room where every other seat is a bot still starts at once.
- Lobby: the host can change a bot's level, rename it or remove it. The invite panel
  shows the code grouped for reading aloud, the short link, and Share, Copy link and
  Copy code.
- New multiplayer rooms get a six-digit code and the link `/r/<code>`. Older rooms keep
  their eight-character code. Solo tables take no six-digit number.
- Any player can claim a username on their profile, be found by it from a lobby, and
  be invited; the invitation appears on their home page with Join and Decline.
- Migration `c4d19e7b52a6`: `profiles.username`, `room_members.bot_level`,
  `room_invites` (RLS on, no grants beyond the owning role).

## Bot levels

Hard is each game's existing policy, unchanged: the previous bots package and the new one
chose identical actions and memory over 4 full matches of each of the 26 bot games.
Medium replaces the policy's choice with a random legal one 18% of the time, Easy 50%.
Housekeeping and courtesy actions are never replaced, and a slip never folds, goes all
in or passes. All 26 games finish with all-easy and all-medium tables inside the
existing 4,000-step bound. Over 24 two-player matches per game, Hard beat Easy in every
game tried (for example Four in a Row 23–1, Checkers 24–0, Uno 18–6).

## Guarding a short code

- At most 10 wrong codes per player in 10 minutes; after that every join and lookup in
  that window answers 429. A wrong code and a closed room give the same answer.
- A closed room's number is retired at once and reused.
- Opening a friend's link before joining is not counted as a wrong code.
- Usernames never appear in another player's view of a room; search returns only
  username, display name and avatar, for players who chose a username.

## Checks

- `scripts/verify.py frontend backend contracts tooling multiplayer migrations`: pass
  (409 unit tests, 7,878 backend, 314 multiplayer, 1 migration).
- `scripts/verify.py browser`: 481 passed, 75 skipped, none failed.
- Real two-guest browser flows on desktop and phone projects
  (`tests/browser/room-setup-invites.spec.ts`): mixed creation with a renamed Easy
  bot, lobby level and rename, copy code and link, wrong-code message, joining through
  `/r/<code>`, members landing on their table, claiming a username, search, invite,
  the invitation arriving on an open home page, cancel, decline and accept.

## How these were run

Docker Desktop stopped during this work because the disk was full, so the Docker
development database was unreachable. Every database-backed check above ran against a
temporary PostgreSQL 17 cluster in the session's scratch folder, migrated from empty to
head, with the local API pointed at it. The Docker development database has not yet
received the migration.

## Not verified

- Share on a real device (the browser used has no share sheet; a stub was used).
- The real 429 responses for wrong codes and search in a browser (covered by backend
  tests and mocked browser tests).
- The Supabase-role branch of the migration, which only runs where those roles exist.

## Release

- Production migration to `c4d19e7b52a6` applied first, then commit
  `7936ef5fe7883e66500f8ddb311bc50251419b9c`, deployment
  `dpl_6rnpqeXepHw48byTn9ryZZJaeqQV` (production, READY).
- Live with two phone-sized guests: Secret Santa draw with an excluded pair and a
  group, two private links opened with valid recipients, organiser saw Opened and no
  pairing; a Uno room with a renamed Easy bot, a six-digit code and `/r/<code>` joined
  by the second guest; username claimed, found by search, invited, invitation shown on
  the home page and accepted.
- Runtime errors and 5xx requests since release start: none. Test rooms closed.
