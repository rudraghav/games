# Home, progress, rewards, tickets and the teams section — 23 November 2026

## What changed

- Home: a welcome strip (level, XP to the next level, streak, badges), joining by code
  one tap away (an inline code field on wide screens), invitations as tickets, a
  Continue row for the player's active rooms, then five curated collections (Quick
  with bots, For teams, Game night, Two players, On your own) above the unchanged
  full library.
- Progress, computed by the server from finished games: XP (10 per game, +10 for a
  win, +5 with another person, +15 for a first finish of each game), levels starting
  at 0, 50, 150, 300, 500, 750, 1050 and 1400 XP, a streak counted in the player's
  own day, and 14 badges. A win needs someone to beat: games played alone are
  finished games, never wins.
- Rewards earned by playing and redeemed in the app: five avatar frames (seen by
  everyone at the table) and four card backs (the player's own screen), shown as
  coupons that are Locked, Ready to redeem, Redeemed or In use. Nothing is sold and
  nothing expires.
- The ticket look is also used for the lobby's room code, invitations and Secret
  Santa links.
- "For teams": a curated collection with group-size and time filters. It leaves out
  casino tables, The Gang, Spill or Chill, Shithead and the No Mercy decks. Most
  Likely and Hot Seat are in it; both decks were read and their optional sip-prompt
  rule is off by default, so the section says "no betting games, and drink prompts
  stay off unless you turn them on."
- Migration `3002383be1bd`: `profiles.cosmetics` (redeemed rewards and what is worn).

## Products looked at

Kahoot! (home and family pages), Jackbox (how to play, at work), Strava (home) and
Apple Wallet (overview). Taken from them: join by code as a first-class action, a
library organised by occasion, a few named collections, player range on every card,
progress measured against one's own past, rewards grouped by type with a clear state.
Duolingo, Khan Academy, Starbucks, Google Pay, chess.com, Lichess, Discord and Xbox
pages could not be read and nothing is cited from them.

## What the server guarantees

- A client cannot grant itself XP, a badge or a reward: redeeming while locked and
  wearing before redeeming both answer 409; a stored claim that is no longer earned is
  not honoured.
- Progress is private. The only thing another player receives is the worn frame.

## Checks

- `scripts/verify.py frontend backend contracts tooling multiplayer migrations`: pass
  (481 unit tests, 8,096 backend, 337 multiplayer, 1 migration).
- `scripts/verify.py browser`: 527 passed, 77 skipped, none failed.
- Real flows on desktop and phone projects (`tests/browser/home-progress-rewards.spec.ts`):
  a game against a bot then the progress line under the result; /rewards showing the
  XP, the first badge and nine locked rewards; the server refusing a forced redeem and
  a forced wear; reaching level 2, then Gold frame Redeem, Use and In use; a second
  guest seeing the frame on the host's seat and seeing it go when taken off.
- Mocked only: mid-level and streak states, the invitation ticket and Continue row,
  a refused redeem on a coupon, and wearing a card back (level 3 is out of reach of a
  short run; card backs on a table were checked from screenshots with a patched
  profile).

## How these were run

Docker Desktop was still down. Database-backed checks ran against the temporary
PostgreSQL 17 cluster in the session's scratch folder, migrated to `3002383be1bd`.

## Not verified

- Browsers other than Chromium (the ticket notches use CSS masks) and forced-colours
  mode.
- The Storybook story was type-checked, not rendered.
