# Lounge and catalogue

The home page is two things, in this order: **Start** (one headline, three
actions) and **Browse** (one library in which every game appears once). The
current structure is described under "Home page" below; it replaced the rails,
the featured banner, the nine category chips and the Players dropdown later on
23 November 2026.

`Lounge.tsx` composes the header, the start actions, the tabs and the shared
room dialog. `GameLibrary.tsx` owns the search box, the occasion row and the
grid. `occasions.ts` decides which games an occasion shows; `catalogue-search.ts`
holds the search itself (exact name and alias matches first, then a bounded typo
fallback), the kinds of game as search vocabulary, and the For teams allowlist.
Aliases include poker, draughts, Codenames, Splendor, Kalah and Palace while
preserving the actual edition names. Join accepts codes and full invite links.

Browsing never creates a guest identity: nothing on the home page asks the
server for anything until a player this browser already knows returns. Existing
room membership, invitations and progress are read with the passive client.
Inactive tab panels stay mounted, so the search text and the chosen occasion
survive a visit to Your games.

GameTile and ChoiceGroup are shared UI primitives; GameArt composes the same
card and board vocabulary as the tables. Metadata comes from the generated
backend catalogue. Controls keep 44px targets, visible focus, selected states,
an announced count and a recovery action for zero results.

Game entry lives in `features/game-entry`; `shared/game-paths` owns canonical
game, session and archive links. The home page's Create room keeps the full
setup dialog, while a game page's Play with friends fixes the chosen game.

## Invitations

`Invitations.tsx` shows `me.invitations` above the headline, one slim ticket each: "<name> invited you to
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

Secret Santa (family `organiser`) is found under All and For teams and by
search. One organiser runs it for a whole group, so its tile reads "Any group"
through GameTile's `groupLabel` instead of a seat count.

## Home page (23 November 2026, minimal revision)

The owner found the first version of this page cluttered: every game appeared two
or three times (five rails, a featured banner, then all thirty large tiles), the
page was 5,876px tall on a desktop and about 7,300px on a phone, and a welcome
strip, a title, tabs, a search box, a Players dropdown and nine category chips
all came before or between the games. The page is now about 1,800px and 3,150px
tall, and the first tiles are on the first screen at both sizes.

Top to bottom:

1. **Header**: the wordmark, the account link and, for a player with a finished
   game, a small progress chip (`shared/ProgressChip.tsx`): the level ring,
   "Level 3" and a flame with the day count while a streak exists. It is one
   link to `/rewards`, named "Level 3, 4-day streak. Open your progress and
   rewards". A visitor who has never played sees no chip and no welcome line.
   The header no longer has its own Create room.
2. **An invitation**, only when there is one: a single slim `Ticket` line above
   the headline, because it is time-sensitive. Region `Invitations`, buttons
   `Join <room>` and `Decline invitation to <room>`, as before. The answers sit
   beside the words from 360px; below that they go under them.
3. **Start**: the headline "How do you want to play?" and exactly three
   actions, each a different verb with one caption:
   - `Play solo` (the only filled button), "On your own or against bots". It
     chooses the Quick with bots occasion below and moves focus to it.
   - `Create room`, "Play with friends". Opens the create dialog. This is the
     only Create room on the page.
   - `Join a room`, "Have a code?". From 900px a code field ("Room code or
     invite link") sits beside it; a player this browser knows joins at once,
     anyone else gets the dialog with the code filled in. Empty, and always on
     phones, the button opens the join dialog.
   On a wide screen the three are equal cards in one row. On a phone the
   primary action is a full-width button and the other two share the row under
   it.
4. **Continue**, only while the player has a game in progress right now: one
   slim line, "Continue Friday table · Uno" (region `Continue`, one link). With
   several, it is the first the server lists and "and 2 more" opens Your games.
   Waiting and finished rooms are not on the home view at all.
5. **Browse**: the heading "Browse games" with two quiet text tabs at the end of
   its row, `Games` and `Your games` (same roles, names and keyboard behaviour
   as before; the heading reads "Your games" while that tab is open). Inside
   Games:
   - a search field (`Search games`);
   - one row of six occasions (group `Occasion`): `All`, `Quick with bots`,
     `With friends`, `Two players`, `Solo`, `For teams`. On a phone the row
     scrolls inside itself;
   - the grid, in which each game appears exactly once.

Nothing else is on the page: no rails, no See all, no featured banner, no
Players dropdown, no promotional or explanatory copy. The footer is unchanged.

### Occasions (`occasions.ts`)

| Occasion | Games | Order |
| --- | --- | --- |
| All | the whole catalogue | discovery order |
| Quick with bots | bots supported, longest listed length 20 minutes or less | discovery order |
| With friends | the party shelf's games that seat four or more | discovery order |
| Two players | playable by exactly two | games made for two first |
| Solo | minimum one player, not the organiser's tool | discovery order |
| For teams | the `teamGames` allowlist, narrowed by its two filters | the allowlist's order |

In Quick with bots a tile reads "You + bots" and opens the game with
`?mode=bots`. Search works inside the chosen occasion. The kinds of game that
used to be chips (Modern favourites, Cards, Casino, Board games, Party, Co-op,
Solo + bots) are now search words: typing "cards", "board games", "casino",
"party" or "cooperative" finds that shelf, beside names and aliases such as
"poker". The empty state has one button, `Show all games`, which clears the
search and returns to All.

### Tiles

A tile is the shared `GameTile`: the cover, the name and one quiet line, "2–10
players · 10–20 min" (or "Solo", "Any group", "You + bots"). There is no blurb,
arrow, badge or card around it. Each is one link named `Open <game>`. The grid
is two columns on a phone, three from 620px, four from 960px and five from
1200px. The cover art is drawn for a taller poster and is scaled whole into
this one (`zoom`), so nothing in it is cut off. The house-deck note for the
Games-owned decks is on the game's own page.

Pop Tarot is no longer a featured banner; it is one tile in its discovery slot.
The first four discovery slots are The Gang, Shithead, Sea Salt & Paper, boop.

## For teams

For teams is an occasion backed by a hand-picked allowlist (`teamGames` in
`catalogue-search.ts`), not by game families:

Most Likely, Hot Seat, Word Agents, Uno, Flip 7, 6 nimmt!, Trio, Skyjo, Secret
Santa, Sea Salt & Paper, Azul, Gem Market.

While it is chosen, and only then, the library shows one line, "Picked for colleagues: no betting games, and
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
clear), and combine with search:

- **Group size** 2–4, 5–8, 9+: the game seats some group in that range. Secret
  Santa fits any size.
- **Time** Under 15 min: the game can finish in under 15 minutes (its shortest
  listed length is below 15). 15–30 min: listed from 15 minutes up to 30 at
  most. Games listed longer than 30 minutes show only with no time filter.

Unit coverage: `apps/web/src/tests/home-progress-rewards.test.tsx` (each
occasion's games, the allowlist and what is kept out of it, both team filters,
search by kind of game, the compact tile, the Continue line, the header chip,
and that the default library lists every game once) and
`dashboard-discovery.test.tsx`. Browser coverage:
`tests/browser/home-progress-rewards.spec.ts`, with `dashboard-refinement`,
`dashboard-live`, `library` and `library-browsing`.
