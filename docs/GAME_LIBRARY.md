# Games library

The catalogue has 30 multiplayer games plus Pop Tarot, Roulette and Slots for solo play, and Secret Santa, a solo organiser table. The owner authorized
main/production and the expanded acceptance run on 1 November 2026.
Additions reuse private rooms, profiles, action retries, chat,
presence, results and rematches, with independent rules engines and renderers.

## Current expansion batch

| Module        | Seats | Rules/experience                                                                       | Acceptance                                                                          |
| ------------- | ----- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Four in a Row | 2     | Alternating drops, gravity, four in any direction, full-board draw                     | Completed matches, illegal full-column/out-of-turn moves, rematch                   |
| Reversi       | 2     | Eight-direction brackets, forced pass, terminal disc scoring                           | Flips, pass/end detection, no illegal non-capturing placement                       |
| Word Agents   | 4–10  | Codenames-style teams, one-word clues, private spymaster key, assassin                 | Role privacy, clue/guess limits, opponent/neutral/assassin outcomes                 |
| Gem Market    | 2–4   | Splendor-style gem collection, discounts, reserved cards, patrons and prestige         | Token/deck conservation, affordability, hand limit, patrons/final round/ties        |
| Checkers      | 2     | American/English rules, compulsory jumps, short kings, promotion, repeated/quiet draws | Independent exact positions, complete matches, keyboard piece/destination selection |
| Mancala       | 2     | Four-seed Kalah, sowing, extra turns, captures, end sweep                              | Seed conservation, both sides, captures/draws, complete matches and rematch         |

Word Agents uses a Games-owned common-noun list and original presentation.
Spymasters are the first two seats; later seats alternate between their teams.
Semantic clue fairness is a group agreement; the server enforces syntax and
visible-word restrictions. Publisher reference:
https://www.czechgames.com/for-press-games/codenames.

Gem Market is an original game inspired by Splendor's resource/discount/market
loop. Its original deterministic card catalogue and explicitly documented rule
choices are not represented as Splendor's printed deck. An edition-faithful
Splendor module needs a verified inventory of all 90 development cards and ten
nobles, in addition to the published rules. Publisher resources:
https://www.spacecowboys-games.com/game/splendor/.

## Objects and decisions across the current catalogue

| What the player handles | Games | Decision to support |
| --- | --- | --- |
| Private cards and public rows, piles or sets | Uno and No Mercy, Rummy, Shithead, Skyjo, Trio, Flip 7, 6 nimmt!, Sea Salt & Paper | Inspect a card, compare legal destinations and keep hidden values unknown. In simultaneous play any row forecast depends on the other reveals. |
| Cards used as money, property and actions | Both Deal editions | Distinguish banking a card from playing its effect. No Mercy also uses debt chips that track unpaid bills. |
| Cards and spendable casino chips | Blackjack, Texas Hold’em, Teen Patti | Show the additional cost and remaining stack before a wager. The same table can contain forced contributions, optional stakes and split payouts. |
| Wheel and betting chips | Roulette | Pick a single pocket or outside group, change the stake locally, then spin. Reopen each settled pocket and payout from the profile. |
| Three reels and betting chips | Slots | Price one payline, compare the paytable and review each stop and payout after a session. |
| Poker cards and numbered signal chips | The Gang | A chip expresses relative hand strength. Taking an occupied chip displaces a teammate. Taking the final free chip can reveal the next street. |
| Market cards and spendable tokens | Gem Market | The purchase quote includes discounts, matching chips, wild gold and the balance after purchase. |
| Wooden pieces, discs, tiles or seeds | Four in a Row, Checkers, Reversi, boop., Azul, Mancala | Show legal destinations and visible consequences such as flipping, sowing, pushing or overflow. |
| Words, prompts and private selections | Word Agents, Spill or Chill, Most Likely, Hot Seat | Identify who can see the answer and when the group will see the reveal. |
| Oracle cards | Pop Tarot | Draw once, then revisit the saved spread in either reading style. |
| A list of names and who must not draw whom | Secret Santa | Build the list, see why a draw is not yet possible, draw once, then hand each person only their own name. |

## Odds references for wheels, reels and dice

The current catalogue includes three casino card tables and two single-player chance games. Both chance games use free session chips. Roulette has 37 pockets and pays an even-money bet zero when zero lands. Slots uses three original 12-stop strips and one payline. Its 1,728 stop combinations give 492 winning lines and a theoretical gross return of 93.75%. Each completed session retains its own private spin history after a rematch or room closure. Dice-wager games remain a candidate. Uno No Mercy's colour roulette is a draw from a card deck. See the [Roulette rules](../backend/app/games/roulette/README.md) and [Slots paytable](../backend/app/games/slots/README.md).

| Format | Table interaction | Probability reference |
| --- | --- | --- |
| Single-zero roulette | Select a pocket or an outside bet, see the stake, change it, then lock it by spinning. Keep the committed bets visible beside the result. | Enumerate all 37 pockets. A straight hits 1/37 and returns 36 chips including a 1-chip stake. Red hits 18/37. Set the zero rule explicitly since some tables refund half on even-money bets. [Monte-Carlo wheel and payout rules](https://asset.montecarlosbm.com/2018-09/rules-of-games-european-roulette-EN.pdf) |
| Independent reels | Show the active line, stake and paytable before a spin. At rest, mark the paid line and give the total return separately from net chips. | In a separate worked example the regulator's three 20-stop reels give 8,000 equally likely stop triples. A symbol at two stops on each reel appears three across on 8 of them. A full return percentage also needs every payout, line and bonus rule. [Gambling Commission worked example](https://www.gamblingcommission.gov.uk/authorities/guide/page/la-bulletin-august-2020-feature-article) |
| Two dice and a point marker | Show the current point and which totals resolve the chosen bet; retain them when players review the last roll. | Two fair six-sided dice give 36 ordered rolls. Six sum to seven, one sums to two. Bet resolution also depends on the point and phase. [AnyDice probability distributions](https://www.anydice.com/docs/introduction/) |

## Further candidates

Prioritize contemporary social formats over further ancient abstracts. Scout
and newer tile/engine builders remain researched candidates,
not available catalogue entries. Each requires a verified complete inventory,
rules and end-to-end match acceptance before registration.

## Modern and party expansion — 1 November 2026

Current popularity evidence: [Flip 7's publisher](https://theop.games/blogs/theop/flip7-how-did-we-get-here)
describes its breakout after the 2024 launch, with a 2025 Spiel des Jahres
nomination on its product page. [Trio's publisher](https://www.cocktailgames.com/as-dor-trio/)
records the 2024 As d'Or win. [BGA's 2025 review](https://en.boardgamearena.com/news?id=1025)
places Azul second by distinct players and records roughly 4,000 Azul tournaments.
Azul is an established modern game, not a new 2026 release. These signals are
selection evidence, not a universal sales ranking.

| Module         | Seats | Included format                                                              | Owning rules                                              |
| -------------- | ----- | ---------------------------------------------------------------------------- | --------------------------------------------------------- |
| Flip 7         | 3–10  | 94-card edition 3.1, interruptible action cards, cumulative 200-point finish | [Flip 7](../backend/app/games/flip_seven/README.md)       |
| Trio           | 3–6   | Individual Simple, sorted hand ends, memory reveals, sevens/three-trio win   | [Trio](../backend/app/games/trio/README.md)               |
| Azul           | 2–4   | 100 tiles, colored wall, factories/center, floor and end bonuses             | [Azul](../backend/app/games/azul/README.md)               |
| Spill or Chill | 3–10  | Original conversation prompts and participation, Pass always available       | [Party house rules](../backend/app/games/party/README.md) |
| Most Likely    | 3–10  | Original secret voting, simultaneous reveal and spotlight points             | [Party house rules](../backend/app/games/party/README.md) |
| Hot Seat       | 3–10  | Original A/B preferences, private predictions and reveal scoring             | [Party house rules](../backend/app/games/party/README.md) |

The party family contains 48 original prompts per game. Publisher drinking-card
formats informed the choice of social interactions; their proprietary prompts
are not bundled. Optional sip suggestions accept any drink and never require
consumption, disclosure or a reason to pass. No additional classics were added
in this batch.

## Cooperative, ocean and cat expansion — 1 November 2026

Selection uses current play and award evidence, not a claim that every game is
new. [BGA's 2025 review](https://en.boardgamearena.com/news?id=1025) places 6 nimmt!
first by distinct players. The Gang's publisher manual documents its basic
cooperative format; boop. appears in [Mensa's 2023 winners](https://www.us.mensa.org/newsroom/press-releases/2023-mensa-select-winners-announced/).
Sea Salt & Paper's rules and edition inventory are sourced in its module.

| Module | Seats | Included format | Owning rules |
| --- | --- | --- | --- |
| The Gang | 3–6 | Basic cooperative poker; four streets, three vaults or three alarms | [The Gang](../backend/app/games/the_gang/README.md) |
| 6 nimmt! | 2–10 | Classic 104-card simultaneous selection; 66-penalty-point finish | [6 nimmt!](../backend/app/games/six_nimmt/README.md) |
| Sea Salt & Paper | 2–4 | Base 58 cards; duos, Stop, Last Chance, mermaids and cumulative scoring | [Sea Salt & Paper](../backend/app/games/sea_salt_paper/README.md) |
| boop. | 2 | Standard 6×6 bed; kittens, cats, boops and graduation decisions | [boop.](../backend/app/games/boop/README.md) |

The Gang's optional challenge/professional modules and Sea Salt & Paper expansions
are not included. Original Games illustrations replace publisher card/token art.
The canonical card-color matrix for Sea Salt & Paper is independently summed in
tests; its README records the licensed digital inventory source and a secondary
summary discrepancy. New release verification remains recorded in progress.txt.

## Shithead — 1 November 2026

Shithead adds a 2–5-player standard-card shedding game, also known as Palace.
Its [owning rules](../backend/app/games/shithead/README.md) follow
[Pagat](https://www.pagat.com/beating/shithead.html): three chosen face-up cards,
three blind table cards, hand refill, 2 reset, 10/four-equal burn and last-player
loss. Optional seven-low and transparent-three rules both default off. Every
escaped player wins; results are unscored. A private-view-only deterministic bot
plays complete matches without an AI service. Local rule/browser/solo evidence
is recorded in [Shithead verification](evidence/shithead-2026-11-01/README.md).

## Secret Santa — 22 November 2026

Secret Santa is a solo organiser table for a gift exchange, modelled on how
DrawNames runs one. The organiser types 3 to 30 names, an optional title, date,
place and budget, and says who must not draw whom: one pair at a time or a whole
group such as a household. The server draws; nobody draws themselves, an
excluded person or a group mate. Each person then opens a private link that
shows only their own name, or the organiser passes the phone round and shows one
name at a time. The organiser never sees the full list, and drawing again
replaces every link. The people in the draw need no account and are not room
members. Its [owning rules](../backend/app/games/secret_santa/README.md) record
the action list, the exact can-draw test, how fairness is tested and the link
token scheme. Backend rule and HTTP tests are local; the web table and browser
evidence are recorded separately in progress.txt.

## Housie, Liar's Dice, Bluff and Truth or Dare — 25 November 2026

Four traditional, public-domain games as original implementations: our own
names and wording, no third-party art or trade dress, and for Truth or Dare a
prompt deck written for Games.

| Module | Seats | Included format | Owning rules |
| --- | --- | --- | --- |
| Housie | 2–10 | Tambola: one 3×9 ticket each, 90 numbers called in turn, Early five, three lines and Full house; optional self-marking | [Housie](../backend/app/games/housie/README.md) |
| Liar's Dice | 2–6 | Five hidden dice each, rising bids, a call that reveals all; ones wild by default | [Liar's Dice](../backend/app/games/liars_dice/README.md) |
| Bluff | 2–6 | Cheat with 52 cards: face-down plays of one declared rank, pass, or call the last play | [Bluff](../backend/app/games/bluff/README.md) |
| Truth or Dare | 2–10 | Shared truths and dares, one swap each, burning-building rounds; a separate adults-only edition, off by default | [Truth or Dare](../backend/app/games/truth_or_dare/README.md) |

Housie's call order, the dice of other players and Bluff's face-down piles stay
in the saved match state. Each game has a bot policy that reads only its own
view. Backend rule and HTTP tests are local; the web tables and browser
evidence are recorded separately in progress.txt.
