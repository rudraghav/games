# Player decisions across the 25 games outside Deal

We followed the play controls with the current player's available moves, including what happens before a choice is locked. All 25 games were also rendered from game-engine projections on a 390px phone. The two Deal games were covered by the [preceding review](../deal-direct-actions-2026-11-19/README.md).

| Game | What the player does |
| --- | --- |
| Uno | When only one complete play is available, press its named button beside Draw. Tapping a card in the hand still lets the player read its effect first. |
| Uno No Mercy | The same shortcut handles a single complete play. Colour, hand-swap target and penalty decisions retain their own named choices. |
| Hold’em | Check, Call or Fold directly. For a raise, choose or enter a legal amount and submit the displayed total. |
| Teen Patti | Tap the exact chip amount when there are up to three legal prices. Larger ranges use the editable wager. Seeing cards, accepting a sideshow and packing are distinct decisions. |
| Blackjack | Hit or Stand from the active hand. Double and Split show the extra stake before the tap. |
| Rummy | A named winning discard can declare immediately. Selecting a hand card still lets the player inspect the melds. Invalid declarations and dropping keep their warning. |
| Skyjo | Tap the draw source, then the chosen grid square. Discarding a drawn card leads to its own reveal decision. |
| Pop Tarot | Each tap on a face-down card fills one spread position. The question and astrology are optional. One explicit action starts the reading after the third pick. |
| Four in a Row | Tap the column to drop a disc. The board overview is available for inspection. |
| Reversi | Preview the discs a legal square flips on touch and confirm that square. |
| Checkers | Choose a movable piece, then a marked destination. On a narrow phone the first tap selects the piece before the board scrolls. The board keeps the current piece visible for a continued jump. |
| Mancala | Preview where seeds land on touch, then sow the chosen pit. |
| Word Agents | The spymaster submits a clue. Operatives choose a word, can discuss or change it, then confirm the shared guess. |
| Gem Market | Select gems and take the set, or select a development and buy or reserve it. Returns and patron picks identify their targets. |
| Flip 7 | Hit or bank the displayed total with Stay. Targeted cards name the affected player before the action. |
| Trio | Reveal a table position or request a named player's lowest or highest card. Cleared positions remain identifiable. |
| Azul | Choose a supply colour, then tap the pattern line or floor. The destination shows fit, overflow and penalties. |
| Spill or Chill | Choose Spill, Chill or Pass and lock it. The result and Next prompt are together, with a single account of the answer. |
| Most Likely | Choose a player privately and lock the vote. The host can advance beside the result before scrolling through votes. |
| Hot Seat | Lock an answer or prediction privately. After reveal, the round host can advance beside the result and everyone can inspect the predictions. |
| The Gang | Take a free chip directly while the street stays open. Review taking another player's chip or claiming the last one before confirming. |
| 6 nimmt! | Choose and lock a private number when several remain. The last legal number has its own Lock button. |
| Sea Salt & Paper | When a duo move has one legal pair, its button names both cards and the effect. Multiple possible pairs keep individual card selection. |
| Boop | Place a piece on a marked square. When only one graduation line exists, its squares are highlighted and one named action graduates it. Alternatives retain preview. |
| Shithead | Choose three starting cards in one compact setup row. During play, select a rank and play the selection or the whole legal group. Face-down cards retain a deliberate blind play. |

The review checks direct actions against the move offered by the server. Desktop and phone tests cover manual alternatives, disabled controls, stale choices and exact submissions. The production receipt records which interactions were also played in a saved game.

## Verification

The final desktop and phone run passed 97 browser cases. It included all 259 recorded game states, with 189 belonging to the 25 games above. The phone-only Checkers touch regression also passed. All 273 frontend tests passed.

Four mobile flows were played in production with independent guests. In Checkers, tapping G3 selected the piece and tapping H4 saved one move. In Shithead, both players changed their three starting cards, restored them after refresh and confirmed them without moving the table or exposing their hands. In Teen Patti, the short wagers and a custom five-chip wager each saved once. In Hot Seat, all three guests locked their choices and only the host could advance. Round two survived refresh. All three test rooms were closed.

The [production receipt](production.json) records the release and checks. The other games were covered through local decisions and engine-derived states.
