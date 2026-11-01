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
| Three party originals | 3–10 each | Original48-prompt decks, balanced rotations, private concurrent decisions, ties/pass/reveal and immutable state | [Party](../backend/app/games/party/README.md) |

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
