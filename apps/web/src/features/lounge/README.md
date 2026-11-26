# Lounge and catalogue

The home page opens on the games: one heading, one search box, one row of
occasions and one grid in which every game appears once, with Pop Tarot
featured at its head. Joining with a code is a header button; Create room and
the rest are in the header's More menu. The structure and how it got here are
under "Home page" below.

`Lounge.tsx` composes the header actions, the tabs and the shared room dialog. `GameLibrary.tsx` owns the search box, the occasion row and the
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
game, session and archive links. More > Create room keeps the full setup
dialog with the game picker, while a game page's Play with friends fixes the
chosen game.

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

## Home page

The page opens on the games. A player's first decision is which game; how to
play it (with bots, with friends, joining with a code) follows from that and is
offered on each game's own page.

How it got here: the first version (23 November 2026) had five rails, a
featured banner and thirty large tiles, 5,876px tall on a desktop and about
7,300px on a phone. The minimal revision cut it to a headline with three
actions (Play solo, Create room, Join a room) above one library. The owner
then asked why those actions came before the games at all, so the action block
was removed and its jobs moved into the header and the occasion chips. The page
is now about 1,770px and 3,150px tall, and the first screen is almost entirely
games.

Top to bottom:

1. **Header**, one row at every width down to 320px: the wordmark, then
   - the **progress chip** for a player with a finished game
     (`shared/ProgressChip.tsx`): the level ring, "Level 3" and a flame with the
     day count while a streak exists, one link to `/rewards` named "Level 3,
     4-day streak. Open your progress and rewards". Below 430px it is the ring
     alone, and below 360px it is hidden (Progress and rewards is in More). A
     visitor who has never played sees no chip;
   - **`Join a room`**, a quiet secondary button that opens the join dialog.
     Someone arriving with a code is one tap away from the field. On a phone
     its visible text is "Join"; its name is always "Join a room";
   - **`More`**, a menu button (the shared `Menu`) holding `Create room` (the
     full setup dialog with the game picker), `Your games` (switches to that
     tab) and `Progress and rewards` (a link to `/rewards`);
   - the **account** link ("Sign in", or the profile), which is its icon alone
     on a phone.
2. **An invitation**, only when there is one: a single slim `Ticket` line above
   the heading, because it is time-sensitive. Region `Invitations`, buttons
   `Join <room>` and `Decline invitation to <room>`. The answers sit beside the
   words from 360px; below that they go under them.
3. **The heading row**: the page's one h1, "Choose a game", with two quiet text
   tabs at the end of the row, `Games` and `Your games` (same roles, names and
   keyboard behaviour as before; the h1 reads "Your games" while that tab is
   open). At 320px the tabs wrap under the heading.
4. **Continue**, only while the player has a game in progress right now: one
   slim line under the heading row, "Continue Friday table · Uno" (region
   `Continue`, one link). With several, it is the first the server lists and
   "and 2 more" opens Your games. Waiting and finished rooms are not on the
   home view at all.
5. **The library**:
   - a search field (`Search games`);
   - one row of six occasions (group `Occasion`): `All`, `Quick with bots`,
     `With friends`, `Two players`, `Solo`, `For teams`. On a phone the row
     scrolls inside itself. `Solo` and `Quick with bots` do what the old Play
     solo button did;
   - the grid, in which each game appears exactly once. In the default view
     the featured game leads it (see "The featured game" below).

Nothing else is on the page: no headline-with-actions block, no rails, no See
all, no Players dropdown, no promotional or explanatory copy. Nothing in the
page body is a filled primary button; the only filled control is the featured
card's plum Start reading. The footer is unchanged.

### After choosing a game

Each game's page (`features/game-entry`) asks how to play, first thing under
the title. All 26 multiplayer games support bots, so each shows two large
buttons, `Play with friends` and `Play with bots` (friends first and filled by
default; bots first and filled when the link carried `?mode=bots`, as from the
Quick with bots chip), with a quieter `Join a room` below. The four solo
entries show their single start: `Play solo` (Roulette, Slots), `Start reading`
(Pop Tarot), `Organise a draw` (Secret Santa).

### Occasions (`occasions.ts`)

| Occasion | Games | Order |
| --- | --- | --- |
| All | the whole catalogue | discovery order |
| Quick with bots | bots supported, longest listed length 20 minutes or less | discovery order |
| With friends | the party shelf's games that seat four or more | discovery order |
| Two players | playable by exactly two | games made for two first |
| Solo | minimum one player, not the organiser's tool | discovery order |
| For teams | the `teamGames` allowlist | the allowlist's order |

In Quick with bots a tile reads "You + bots" and opens the game with
`?mode=bots`, so its page leads with Play with bots. Search works inside the chosen occasion. The kinds of game that
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

### The featured game

Pop Tarot is the product's featured game (`FEATURED_GAME` in
`GameLibrary.tsx`). The first minimal revision made it an ordinary tile in slot
12; the owner asked for it back as the one highlight, without the repetition.

- **Where**: only in the default view, which is the `All` occasion with an
  empty search box. It is the first item of the grid and spans its full width.
  The other 29 games follow in discovery order: The Gang, Shithead, Sea Salt &
  Paper, boop. and so on. Pop Tarot is not listed a second time, so the default
  view still shows each of the 30 games exactly once.
- **What**: the shared `GameTile` with `variant="featured"`: Tarot's cover on
  one side; a small "Featured" label (sentence case, no tracking), the name, one line ("Choose three cards
  for a personal reading"), the same quiet meta line as every tile ("Solo ·
  5–10 min") and one `Start reading` call to action in Tarot's plum. About
  190px tall on a wide screen; stacked and about 257px on a phone.
- **One link**: the whole card is one link to `/games/tarot`, named `Open Pop
  Tarot` like the tile, and counts as that game's `.game-tile`. `Start reading`
  is part of that link, not a second control; the game page's own Start reading
  begins the reading.
- **The only filled control**: nothing else in the page body is filled. The
  action is small (44px) and plum, Tarot's own tone. While an invitation is
  waiting above the heading, its Join is the one filled button and this action
  is drawn as a plum outline (`.lounge-dashboard:has(.invitations)` in
  `home.css`).
- **Everywhere else it is an ordinary tile**: with any other occasion chosen
  or any text in the search box there is no featured card. Pop Tarot appears
  as a plain tile wherever it matches (the Solo chip, a search for "tarot").

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

For teams adds one line under the occasions saying how the games were picked,
and nothing to choose: the occasions are the page's only row of filters. The
Group size and Time chips were removed on 25 November 2026 (a second set of
filters; see `docs/UI_CRAFT.md`). Search still narrows the team picks.

Unit coverage: `apps/web/src/tests/home-progress-rewards.test.tsx` (each
occasion's games, the allowlist and what is kept out of it, no second row of filters,
search by kind of game, the compact tile, the Continue line, the header chip,
and that the default library lists every game once) and
`dashboard-discovery.test.tsx`. Browser coverage:
`tests/browser/home-progress-rewards.spec.ts`, with `dashboard-refinement`,
`dashboard-live`, `library` and `library-browsing`.

## Parlour games

Housie, Liar's Dice, Bluff and Truth or Dare sit on the party shelf, so With
friends shows all four (each seats four or more); Bluff is also on the cards
shelf. Their listed lengths run past 20 minutes, so Quick with bots adds Liar's
Dice and Bluff by name (`quickBotPicks` in `occasions.ts`): their turns are
quick and they play well against bots. Two players includes all four. For
teams adds Housie at the end of its allowlist; Truth or Dare stays out of it on
purpose, because its prompts are personal and it has an 18+ edition. Aliases:
"tambola", "bingo", "perudo", "cheat", "I doubt it", "spin the bottle".
