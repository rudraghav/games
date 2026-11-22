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

## Home page order (23 November 2026)

Phone first, top to bottom:

1. The header, unchanged (`Create room`, the account link).
2. **Welcome strip** (`WelcomeStrip.tsx`). A player with a finished game sees
   the level ring, "N XP to level M", a flame with "4-day streak" when a streak
   exists (plus "Play today to keep it going" only while today has no game
   yet) and "N of M badges". The whole strip is one link to `/rewards`. A
   visitor who has never played sees one line with no numbers. There is no
   wording for a streak that ended. The strip is the same height in every
   state, so nothing below moves when progress arrives; until the browser
   knows whether this is a returning player it is an empty placeholder.
   Progress is read with the passive client and only for a known player, so
   browsing still never creates a guest.
3. **Primary actions**: `Play solo` and `Join a room`. From 760px a code field
   ("Room code or invite link") sits beside Join a room. Empty, the button
   opens the join dialog as before (always, on phones, where the field is not
   shown). With a code, a player this browser already knows joins straight
   away; anyone else gets the dialog with the code filled in. A code the
   server refuses shows the server's words beside the field.
4. **Invitations**, each drawn as a `Ticket` with Join and Decline on the stub.
   The region, list and button names are unchanged.
5. **Continue** (`ContinueRail.tsx`): rooms that are playing or waiting, the
   match in progress first. Shown only when there is one. Its links are named
   "Continue <room>, <game>"; the Your games tab still lists everything and
   keeps the "Open <room>, <game>" links.
6. The Games / Your games tabs. Inside Games:
7. **Collections** (`CollectionRails.tsx`, rules in `collections.ts`): five
   named rails, each scrolling inside itself with the shared `HorizontalRail`
   (arrows in the heading row from 601px, touch scrolling and a cut-off card
   on phones, keyboard focus reveals a card). Each has a **See all** that
   opens the library in the matching view and moves focus to the chosen filter.

   | Rail | Games | See all sets |
   | --- | --- | --- |
   | Quick with bots | bots supported, longest listed length 20 minutes or less | Solo + bots |
   | For teams | the `teamGames` allowlist, in its order | For teams |
   | Game night | the Party shelf's games that seat four or more | Party |
   | Two players | playable by two, games made for exactly two first | Players: 2 people |
   | On your own | minimum one player, not the organiser's tool | Solo + bots, Just me |

   A rail holds at most 12 games. Rail cards are the shared `GameTile` in its
   `rail` variant: class `game-rail-tile`, named "<game>, <players>, <minutes>
   min". The library's own tiles stay the only `.game-tile` elements and the
   only "Open <game>" links on the page.
8. **The full library**, as before: search, Players, categories, every game.
   Players and minutes on every tile are now 12px (11px on phones) in ink.

There are no promotional banners, countdowns or offers anywhere on the page.

## For teams

`teams` is a library category backed by a hand-picked allowlist
(`teamGames` in `catalogue-search.ts`), not by game families:

Most Likely, Hot Seat, Word Agents, Uno, Flip 7, 6 nimmt!, Trio, Skyjo, Secret
Santa, Sea Salt & Paper, Azul, Gem Market.

The section carries one line, "Picked for colleagues: no betting games, and
drink prompts stay off unless you turn them on.", and what is behind it is this
rule: a game is listed only if what it shows by default is fine at work. The line
says "stay off" and not "no drinking games" because Most Likely and Hot Seat keep
their optional sip-prompt room rule, which is off by default.

- **Out: every casino table** (Texas Hold’em, Teen Patti, Blackjack, Roulette,
  Slots) and **The Gang**, which is cooperative but looks and reads like a
  poker table.
- **Out: Spill or Chill.** Its 48 prompts were read and are harmless, but the
  game is people answering personal questions aloud, so what comes up is not
  something the deck controls.
- **In: Most Likely and Hot Seat.** Both decks were read in
  `backend/app/games/party/prompts.py` (48 prompts each). Most Likely is
  friendly votes ("win an argument using a spreadsheet"); Hot Seat is A/B
  preferences ("A neighbourhood bakery" or "A strangely specific podcast").
  Nothing mentions alcohol, romance or anyone's shortcomings, and everything on
  screen comes from those decks. Their one room rule, "Optional sip prompts ·
  any drink", is off by default and adds a single optional line when a host
  turns it on. That rule still exists and is named in both rule sheets, so if
  the label must hold with no caveat at all, remove these two from `teamGames`.
- **Out: Shithead** (the name) and the **No Mercy** decks (elimination leaves
  colleagues watching).
- **In: Secret Santa**, the organiser's tool for a team gift exchange.

Two quick filters appear only inside For teams, as toggle chips (press again to
clear), and combine with search and the Players select:

- **Group size** 2–4, 5–8, 9+: the game seats some group in that range. Secret
  Santa fits any size.
- **Time** Under 15 min: the game can finish in under 15 minutes (its shortest
  listed length is below 15). 15–30 min: listed from 15 minutes up to 30 at
  most. Games listed longer than 30 minutes show only with no time filter.

Unit coverage: `apps/web/src/tests/home-progress-rewards.test.tsx` (each rail's
games, the allowlist and what is kept out of it, both filters, and that the
default library still lists every game once). Browser coverage:
`tests/browser/home-progress-rewards.spec.ts`.
