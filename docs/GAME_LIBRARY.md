# Games library

The catalogue has 21 multiplayer games and Pop Tarot. The owner authorized
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

## Further candidates

Prioritize contemporary social formats over further ancient abstracts. The Gang,
Scout, Sea Salt & Paper and newer tile/engine builders remain researched candidates,
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
