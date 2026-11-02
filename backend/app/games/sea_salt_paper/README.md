# Sea Salt & Paper — 58-card base edition

Rules/inventory recorded before implementation, 1 November 2026. Primary rules:
[Bombyx English rulebook](https://studiobombyx.com/assets/SSAP_rulebook_EN-3.pdf).
Exact type/color multiplicities are cross-checked against the original developer
of Bombyx's [licensed BGA edition](https://en.boardgamearena.com/gamepanel?game=seasaltpaper),
which credits `thoun`, and that developer's factual inventory at
[pinned CardManager.php](https://github.com/thoun/seasaltpaper/blob/b17c1b0c7f5ec55c8c5bce573501e8af6f68141f/modules/php/CardManager.php).
Only inventory facts are transcribed; no implementation or commercial art copied.
The BGA prose summary says three pink cards, which would total 59; the actual
base inventory has two. Extra Salt/Extra Pepper/double-target variants excluded.

## Physical inventory

| Kind | Colors with multiplicity |
| --- | --- |
| Crab, 9 | navy ×2, turquoise ×2, black ×1, yellow ×2, green ×1, gray ×1 |
| Boat, 8 | navy ×2, turquoise ×2, black ×2, yellow ×2 |
| Fish, 7 | navy ×2, turquoise ×1, black ×2, yellow ×1, green ×1 |
| Swimmer, 5 | navy ×1, turquoise ×1, black ×1, yellow ×1, peach ×1 |
| Shark, 5 | navy ×1, turquoise ×1, black ×1, green ×1, purple ×1 |
| Mermaid, 4 | white ×4 |
| Shell, 6 | navy ×1, turquoise ×1, black ×1, yellow ×1, green ×1, gray ×1 |
| Octopus, 5 | turquoise ×1, yellow ×1, green ×1, purple ×1, gray ×1 |
| Penguin, 3 | purple ×1, peach ×1, pink ×1 |
| Sailor, 2 | pink ×1, orange ×1 |
| Multipliers, 4 | lighthouse/purple, shoal/gray, penguin-colony/green, captain/peach |

58 distinct IDs. Color totals: navy 9, turquoise 9, black 8, yellow 8, green 6,
white 4, purple 4, gray 4, peach 3, pink 2, orange 1. Original Games paper-style symbols
and explicit color labels provide readable, color-independent identification.

## Flow and scoring

2–4 seats, with score targets of 40/35/30 respectively. Shuffle all 58 each round, reveal one card in each
of two discard piles. First seat starts the first round (digital seating
convention). Draw two from stock, keep one and discard the other (fill an empty
discard if there is one), or take the top of either discard. Private draw choices
never appear to another player. A single last stock card can be taken directly.

Then play any available duos, in any order: two crabs inspect one chosen discard
and privately take any one card from it; two boats immediately start another
turn; two fish draw one stock card; shark+swimmer steal a random card from an
unprotected opponent. Duos are optional and may protect cards even when their
effect has no available target. Played and unplayed cards both count for points.

Each crab/boat/fish pair scores 1; each shark and swimmer pair scores 1. Shells score
0/2/4/6/8/10; octopuses 0/3/6/9/12; penguins 1/3/5; sailors 0/5. Multipliers add
1 per boat/fish, 2 per penguin, and 3 per sailor. Mermaids each score a different most
numerous color count, including their own white cards. Reveal all 4 mermaids to
win immediately, regardless of cumulative score.

At 7 or more card points, STOP ends the round and all score card points. LAST CHANCE
reveals/protects the caller and gives every other player a final turn, with
finished hands becoming protected. Boat effects remain extra turns within that
player's final participation. If caller ties/beats every card score, caller gets
card points+largest-color bonus and others only their largest-color bonuses;
otherwise caller gets only color bonus and others card points. Stock exhaustion
at end of a turn voids scoring. If an explicit STOP is called before ending the
turn, it resolves immediately; an uncompleted final-turn stock exhaustion voids
the round. Round starter passes left of the caller, or exhaustion-turn actor.

### Explicit Games exhaustion convention

Rules version `base58-exhaust-1` retains the existing interpretation of the
publisher's “End of the Round” rule: stock exhaustion at the end of any turn
cancels scoring, including an unfinished Last Chance. Stop resolves immediately
before that turn-ending check. Four mermaids still wins immediately. The linked
Bombyx rulebook states the exhaustion rule without an exception for Last Chance;
the licensed BGA developer's pinned
[NextPlayer.php](https://github.com/thoun/seasaltpaper/blob/b17c1b0c7f5ec55c8c5bce573501e8af6f68141f/modules/php/States/NextPlayer.php#L32)
instead exempts an announced ending from ordinary exhaustion. These are distinct
conventions; this release preserves the already documented Games behavior rather
than treating the licensed implementation as a publisher erratum. Card inventory,
score targets and all other edition choices remain unchanged.

Stock count remains visible through every phase. The server projects the exact
consequence beside Stop, Last Chance and End turn. With no stock, Last Chance
warns that the first completed final turn cancels scoring; a discard draw or boat
continuation remains legal. Inspection of a public discard is a separate modal
that cannot take the card. Private stock/crab choices show their full rule when
selected and require a distinct Keep/Take action. Closing the public inspector
returns keyboard focus to its opener.

After a target is reached, highest total wins; tied totals compare most recent
round points, with an exact tie shared. Public round review precedes reshuffle.
Discard interiors are only visible during that actor's crab inspection; deck,
other hands, random theft selection and future shuffle seed remain server-only.

## Acceptance

Assert all 58 IDs and independent type/color totals; every scoring family,
duo effect, protection, caller success/failure/ties, exhaustion, four-mermaid
victory, score targets, exact conservation, illegal moves, immutability and
minimum/maximum complete matches. UI needs no dragging or hidden-data access.

Turn guidance follows the current draw/keep/play phase and never names a private
drawn card in the shared message. The two-card choice survives refresh; another
member receives neither its options nor its hidden card IDs. Mouse/touch selection
has explicit keep/discard actions, and phone turn actions occupy complete rows.
