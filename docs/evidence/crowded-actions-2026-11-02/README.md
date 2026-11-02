# Crowded assets and action-state verification

The user supplied references showing a pending Deal steal and multiple property
rows. Fresh inspection of Games confirmed several gaps beyond earlier tests:
Deal/Gem/Paper collections were clipped sideways, casino card contents escaped
seat bounds, narrow Word Agents labels overlapped, and Boop squares shrank below
the shared touch target. Grouping Rummy cards also made hand arrows oscillate
because the overflow styling changed the width used to decide overflow.

The change wraps public collections, bounds casino previews with a public-card
inspector, adds explicit private-choice navigation, keeps board words/squares
readable, reserves Boop's decision area, and gives cleared Trio slots semantic
names. Deal transfers now show actual public cards and an explicit Allow transfer
response. Existing engines still own legality, private state and outcomes.

## Per-game coverage

All 259 naturally reached projections are checked at 320, 390, 768 and 1440px:
1,036 fixture/width renders. Five additional controlled Deal probes test 13 piles,
ten bank cards, public inspection and a pending wild-card steal. The controlled
probes conserve the actual deck and pass projection privacy guards; they are not
claimed as natural matches. Detailed action checks and gaps live in each row's
linked receipt.

| Game | Natural projections | Detailed checks and limits |
| --- | ---: | --- |
| Azul | 10 | [azul](modern.json) |
| Blackjack | 8 | [blackjack](card-casino.json) |
| boop. | 10 | [boop](boards-party-tarot.json) |
| Checkers | 8 | [checkers](boards-party-tarot.json) |
| Monopoly Deal | 34 | [deal](deal.json) |
| Monopoly Deal No Mercy | 36 | [deal-no-mercy](deal.json) |
| Flip 7 | 8 | [flip-7](modern.json) |
| Four in a Row | 6 | [four-in-a-row](boards-party-tarot.json) |
| Gem Market | 7 | [gem-market](modern.json) |
| Texas Hold’em | 8 | [holdem](card-casino.json) |
| Hot Seat | 6 | [hot-seat](boards-party-tarot.json) |
| Mancala | 6 | [mancala](boards-party-tarot.json) |
| Most Likely | 4 | [most-likely](boards-party-tarot.json) |
| Reversi | 6 | [reversi](boards-party-tarot.json) |
| Rummy | 6 | [rummy](card-casino.json) |
| Sea Salt & Paper | 18 | [sea-salt-paper](modern.json) |
| Shithead | 6 | [shithead](card-casino.json) |
| 6 nimmt! | 8 | [six-nimmt](modern.json) |
| Skyjo | 16 | [skyjo](card-casino.json) |
| Spill or Chill | 4 | [spill-or-chill](boards-party-tarot.json) |
| Pop Tarot | 4 | [tarot](boards-party-tarot.json) |
| Teen Patti | 6 | [teen-patti](card-casino.json) |
| The Gang | 12 | [the-gang](modern.json) |
| Trio | 6 | [trio](modern.json) |
| Uno | 7 | [uno](card-casino.json) |
| Uno No Mercy | 5 | [uno-no-mercy](card-casino.json) |
| Word Agents | 4 | [word-agents](boards-party-tarot.json) |

## Interpretation

A render does not prove every action branch, persisted match or concurrency path.
This matrix records exactly what was exercised, including min/max seats, real
long hands, expanded public collections, keyboard reachability and relevant
pending/paused controls. Existing full-match/server evidence remains separate.
Native screen-reader user studies, every possible combined game state and every
physical maximum inventory distribution are not claimed. The previous Trio
cleared-slot gap is now exercised using natural legal trajectories.

A separate saved-room suite has passed locally on desktop and phone across both
Deal editions, Blackjack, Sea Salt & Paper, Word Agents and Boop. It checks exact
UI actions/versions, public agreement, refresh and narrow boards using four real
guest sessions. It closes its own room and preserves match history. These ordinary
saved flows complement the explicit density probes; they do not guarantee a
naturally dealt extreme hand. The [named local gate](verification.json) passed types, lint, 134 unit tests, the
production build, generated contracts and all 88 browser cases. Production
verification is recorded separately after deployment.
