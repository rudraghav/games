# Rules audit — 1 November 2026

The audited contract is the documented Games table format. A match is one hand
for Uno/poker/points rummy, one complete table round for blackjack/Teen Patti,
three sets for Deal, the cumulative 100-point threshold for Skyjo, and the natural
terminal state for the board/word/gem games. Rematches keep the room/group.

Publisher instructions ground branded rules. Traditional games state their
table options explicitly. Word Agents, Gem Market and the owner-approved Deal
No Mercy house deck are not advertised as exact reproductions of another deck.

| Game | Seats | Independent rule and expected-outcome coverage | Owning rules |
| --- | --- | --- | --- |
| Uno | 2–10 | 108-card inventory, opening/final actions, +4 challenge, optional stacking/7–0, UNO window, scoring/conservation | [Uno family](../backend/app/games/uno/README.md) |
| Uno No Mercy | 2–6 | 168-card inventory, ascending stacks, roulette recipient colour, immediate final-card win, swaps/rotation, elimination/scoring | [Uno family](../backend/app/games/uno/README.md) |
| Monopoly Deal | 2–5 | 106 playable cards, property sets, rent funding/doubling, bank/payment/counter rules, wild values, reshuffle/win | [Deal family](../backend/app/games/deal/README.md) |
| Deal No Mercy — Games house deck | 2–5 | Explicit 115-card house inventory, verified printed effects/values, debt/creditor decisions, Shack, every action category, transfers/win | [Deal family](../backend/app/games/deal/README.md) |
| Texas Hold'em | 2–9 | Nine hand categories, heads-up action, minimum/cumulative raises, all-ins, side pots, split/odd chips, uncalled refunds | [Hold'em](../backend/app/games/holdem/README.md) |
| Indian points rummy | 2–6 | Pure/two-sequence gate, jokers/aces/sets, declaration/discard, 20/40 drops, false show, capped zero-sum losses | [Rummy](../backend/app/games/rummy/README.md) |
| Teen Patti | 2–6 | Stated rank/seen/blind rules, wager parity, sideshow consent/ties, show eligibility, pot cap/chip totals | [Teen Patti](../backend/app/games/teen_patti/README.md) |
| Blackjack | 1–7 | 3:2 naturals, pushes, peek/insurance funding, split aces/21, double, soft-17 variants, 312-card conservation | [Blackjack](../backend/app/games/blackjack/README.md) |
| Skyjo | 2–8 | 150-card inventory, swaps/reveals, final-reveal column removal, final turns, finisher penalty, cumulative scoring | [Skyjo](../backend/app/games/skyjo/README.md) |
| Pop Tarot | 1 | 78 distinct cards, three picks, private projection, exact generated identity/positions, validation/retry/budget/persistence | [Tarot](../backend/app/games/tarot/README.md) |
| Four in a Row | 2 | Gravity, full columns, four directions, draws and immutable state | [Public boards](../backend/app/games/board/README.md) |
| Reversi | 2 | Eight capture directions, mandatory captures, forced pass, terminal scoring/ties | [Public boards](../backend/app/games/board/README.md) |
| Word Agents | 4–10 | Original word list, private roles/key, clue/guess limits, opponent/neutral/assassin outcomes | [Word Agents](../backend/app/games/word_agents/README.md) |
| Gem Market | 2–4 | Original catalogue, token/deck conservation, discounts/reservations, patrons, final round and ties | [Gem Market](../backend/app/games/gem_market/README.md) |
| Checkers | 2 | Compulsory/continued jumps, promotion stop, short kings, blocked wins, threefold/quiet draws | [New boards](../backend/app/games/board/NEW_BOARDS.md) |
| Mancala | 2 | Four-seed Kalah, both-side sowing, store skip/extra turns, opposite capture convention, final sweep/ties | [New boards](../backend/app/games/board/NEW_BOARDS.md) |
| Flip 7 | 3–10 | 94-card inventory, modifiers, Second Chance/Freeze/Flip Three ordering, seven-card finish, 200-point ties/conservation | [Flip 7](../backend/app/games/flip_seven/README.md) |
| Trio | 3–6 | 36-card inventory, current hand ends, stable slots, failed reveal return, sevens/three-trio victory, private hands | [Trio](../backend/app/games/trio/README.md) |
| Azul | 2–4 | 100-tile conservation, drafting, valid pattern rows, overflow/marker, wall adjacency, floor/bonuses/ties | [Azul](../backend/app/games/azul/README.md) |
| Three party originals | 3–10 each | Original 48-prompt decks, balanced rotations, private concurrent decisions, ties/pass/reveal and immutable state | [Party](../backend/app/games/party/README.md) |
| The Gang | 3–6 | 52-card inventory, four streets, public chip taking/returning, final-allocation advance, tied hand order and cooperative victory/defeat | [The Gang](../backend/app/games/the_gang/README.md) |
| 6 nimmt! | 2–10 | 104-card inventory, private simultaneous locks, ascending reveal, sixth-card/low-row decisions, bullhead penalties and 66-point end | [6 nimmt!](../backend/app/games/six_nimmt/README.md) |
| Sea Salt & Paper | 2–4 | Exact 58-card/color inventory, private stock/discard choices, duo effects, protected Last Chance hands, scoring and mermaid finish | [Sea Salt & Paper](../backend/app/games/sea_salt_paper/README.md) |
| boop. | 2 | 32-piece conservation, kitten/cat displacement, blocked lines, active-player graduation and win timing | [boop.](../backend/app/games/boop/README.md) |
| Shithead | 2–5 | 52-card conservation, three-card setup, ascending/same-rank plays, reset twos, ten/four-kind burns, refills, face-up pickup and blind failure, final loser; optional seven-low/transparent-three off by default | [Shithead](../backend/app/games/shithead/README.md) |
| Secret Santa | 1 organiser, 3–30 names | Naming and limits, pair and group upkeep, exact can-draw answer (too few, one person stuck, Hall's condition), every draw a rule-abiding permutation over 120 random lists, nine-outcome fairness band, view independent of the draw, link tokens bound to match, draw and person | [Secret Santa](../backend/app/games/secret_santa/README.md) |
| Housie | 2–10 | Ticket shape over 250 seeds (15 numbers, 5 a row, column decades, sorted columns), 90 unique calls with a rotating caller, auto-mark on and off, each prize won once, same-call shares, closure on the next call, late claims, Full house finish and automatic share, final claims after the 90th number, views independent of other tickets and of the call order | [Housie](../backend/app/games/housie/README.md) |
| Liar's Dice | 2–6 | Seeded rolls, raise order and limits, wild ones on and off, a bid on ones, exactly-met bids, the right player losing a die and starting, elimination, last player wins, views independent of other players' dice until a call | [Liar's Dice](../backend/app/games/liars_dice/README.md) |
| Bluff | 2–6 | 52-card deal and conservation, 1–4 own cards, same declared rank, pass-around discard at 2 and 3 seats, both outcomes of a call and who starts next, a last play winning only once it stands, only the called play ever shown | [Bluff](../backend/app/games/bluff/README.md) |
| Truth or Dare | 2–10 | Written deck sizes, uniqueness and content lint, 4/3/2 turns each, scoring, one swap per player, six fate assignments, each setting, no repeats in a match, friendly matches searched for every adult prompt and fate, named players only with three others seated | [Truth or Dare](../backend/app/games/truth_or_dare/README.md) |

`test_card_family_rules.py`, `test_table_rules.py`, `test_new_boards.py` and existing
edge tests assert independent exact states/results, not merely acceptance of an
engine's own legal actions. Complete seeded playthroughs separately test progress,
conservation and terminal behavior at both supported player limits.

Browser full matches use independent player sessions and only their authorized
views. Bulk decisions travel through the real authenticated API; rendered results,
rematch and game-switch controls are asserted/clicked. They do not claim every
move was clicked manually. Rummy's shuffled browser scenario ends by legal drops;
conserved controlled local deals separately prove valid declarations at 2/6 seats.
Fixed two-player/solo games run once per viewport instead of duplicating the
identical minimum and maximum. Tarot generation is explicitly opt-in.

Exact latest test counts, production source and hosted results belong in
`progress.txt` and the release evidence. This audit is scoped regression evidence,
not a proof of every possible strategy or an untested edition's printed inventory.

## Roulette and Slots

The single-zero wheel offers 37 straight bets and six outside groups. Tests settle all 43 choices against every pocket, including all six losing on zero. Slots tests enumerate each of the 1,728 equiprobable reel-stop triples at two stakes. Both engines retain each settled gross return, net change and closing balance and project only completed spins. Idempotent action receipts prevent a retry from spinning twice. [Roulette](../backend/app/games/roulette/README.md) · [Slots](../backend/app/games/slots/README.md)

## Card odds and settlement checks, 21 November 2026

The independent PokerKit check in `backend/tests/verify_pokerkit.py` compares the exact ordering of all 2,598,960 five-card deals and 1,024 seeded seven-card deals. A five-seat replay checks that a tied 22-chip Hold’em pot awards 11 to each player. Contributions from folded players can enter one pot at several amounts. The payout splits each actual pot once. Existing completed ledgers retain their recorded awards. [PokerKit](https://github.com/uoftcprg/pokerkit) · [Poker TDA rules](https://www.pokertda.com/view-poker-tda-rules/)

The deterministic table tests enumerate all 22,100 Teen Patti hands with the Games sequence ordering. The six-deck Blackjack test counts 2,304 naturals among 48,516 possible opening pairs. The player's hit preview has a separate test enumerating the legal hidden-card and hit-card pairs from the visible table. Its percentage describes one hit from the active hand. Winning against the dealer is a different event.

For future strategy experiments, OpenSpiel supplies imperfect-information environments and game-theory algorithms. Its Blackjack model offers Hit and Stand and has a different action space from Games’ insurance, split and double table. The current bots use bounded estimates from each seat’s own view. For a proposed dice game, Icepool can evaluate exact integer-weighted distributions offline. Neither tool is required to run these tables. [OpenSpiel game list](https://openspiel.readthedocs.io/en/stable/games.html) · [Icepool](https://github.com/HighDiceRoller/icepool)

## 2 November 2026 implementation follow-through

The independent evidence and decisions are preserved in
`evidence/independent-audit-2026-11-02/` and the implementation receipts in
`evidence/audit-fixes-2026-11-02/`. Classic Deal's FAQ953 Just Say No rule is applied
without consuming an ordinary play, including after a third play. Building
carry remains explicitly a Games convention and its full transfer is quoted.
No Mercy keeps its documented house conventions. Sea Salt keeps publisher-literal
stock exhaustion under a named version, with exact consequences visible before
ending decisions. Every new result explanation is produced by its engine and
validated at the client boundary; the browser never determines winners.
