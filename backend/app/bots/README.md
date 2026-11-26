# Rule-based bot players

Bots are ordinary algorithmic opponents, with no model, provider call, network
access or paid inference. The authoritative game engine remains the sole move
validator and scorer. Policies choose from each bot's own `GameView` and its
bounded durable observation memory; they never receive engine state, deck order,
another player's hidden hand, a key unavailable to its role, the engine seed or
another bot's memory.

`choose_action(view, player_id, memory)` returns a `BotDecision(action, memory)`.
`observe_view` records permitted public observations between decisions without
advancing the policy RNG. The service calls it after every committed move for
Trio and Flip7, whose policies remember public reveals. Memory is bounded to 16KiB,
and policy randomness uses a separate private bot seed plus decision cursor, never the
engine's shuffle seed. No projection is saved wholesale.

## Levels

`choose_action(view, player_id, memory, level="hard")`. `hard` is each game's
policy below, unchanged: the same decisions and memory as a call without a level.
`medium` and `easy` first let the policy decide, then with a fixed chance
(`SLIP_CHANCE`: medium 0.18, easy 0.5) play a uniformly random ordinary legal
move instead. The slip is drawn from the same seeded decision cursor after the
policy has used it, so a given memory and view always slip the same way, and the
step and memory accounting are those of the hard decision.

A slip never replaces the policy's move when it is one of `STEADY_ACTIONS`:
advancing a review or round (`continue`, `next_round`, `next_prompt`,
`next_selection`, `next_heist`, `next`, `reveal_hand`, `reveal_mermaids`), calling or
catching UNO (`uno`, `catch_uno`), a forced `pass`, the Spill or Chill `respond`
(a bot never claims it answered aloud), and moves the policy composes from
several cards or text (`declare`, `clue`, `arrange`, `pay`, and any option whose
input is cards or text).

A slip never lands on those, nor on `fold` (leaving a hand or deal), `all_in`,
Deal's free `rearrange`, The Gang's `return_chip`, or a party "pass" choice. In
The Gang it only takes a free chip, never a crewmate's. Amount inputs use the
option's minimum, as `Context.action` already does. When a Trio slip turns a
different card, the bot's memory records the card it actually turned.

`test_bot_levels.py` checks that hard equals the level-free call for every game,
that levels repeat for a seed, that slips are legal ordinary moves and that the
steady actions are never replaced. `test_bot_policies.py` finishes every bot
game with all-hard, all-medium and all-easy tables within the same 4,000-step
bound.

## Policies

| Family | Decision method |
| --- | --- |
| Four in a Row | Bounded alpha-beta search, immediate wins/blocks and line/center evaluation |
| Reversi | Bounded public-board search, corners, dangerous adjacent squares and end-game disc counts |
| Checkers | Bounded search with legal capture continuation, crowning, material and advancement |
| Kalah/Mancala | Exact public sow/capture/extra-turn simulation and bounded lookahead |
| boop. | Public push simulation, immediate adult wins, opponent one-move threats, graduation and bounded repeat avoidance |
| Uno editions | Color retention, action pressure, swap hand counts, legal UNO/catch reactions, and penalty stacking under the room's "Stack draw cards" rule: the smallest draw card that answers (the largest against a nearly empty hand), never a two-player Reverse +4 onto itself |
| Deal editions | Property-set completion, action value and opponent pressure; minimum-cost bank-first payments preserving sets |
| Hold'em | Samples unseen cards, prices the affordable call against contestable contributions, and bounds raises |
| Teen Patti | Samples multiway hand strength for ordinary wagers and counts all 18,424 possible single-opponent hands for shows and sideshows. Equal hands favour the responder. A paid show must justify its cost. |
| Blackjack | Multi-deck basic hard/soft/pair strategy; no insurance, ordinary small room-only wagers |
| Rummy | One meld enumeration per hand, disjoint coverage search, pure/two-sequence priorities and genuine declarations |
| Skyjo | Visible-card replacement, unknown-card expectation, matching-column removal and reveal decisions |
| Gem Market | Affordable prestige/discount purchases, closest public target costs and useful token collection/returns |
| Flip7 | Observed public shoe counts, duplicate risk, round points and action-target selection |
| Trio | Own sorted hand plus remembered public table/hand-end reveals; no sharing hands between bots |
| Azul | Valid colored-wall rows, completion/adjacency, overflow and center-marker cost |
| 6 nimmt! | Public row fit, known row penalties and an estimate of intervening unseen choices |
| The Gang | Own pocket/community estimate against unknown hands, mapped to the nearest free ranking chip |
| Sea Salt & Paper | Own collection marginal value, duo effects, protected hand counts and Stop/Last Chance choices |
| Word Agents | Original finite semantic categories; spymaster chooses a clue using its authorized key, operative understands the public clue only |
| Party originals | Clearly simulated preferences/votes. A bot never claims it drank or answered aloud; Spill or Chill chooses Chill |
| Housie | Marks its own called numbers, claims every prize the moment it is offered (smaller prizes first, Full house last), and calls when it is the caller |
| Liar's Dice | Binomial chance that a bid holds given its own dice and the count of unseen dice; calls when the standing bid plus its best raise are together less likely than not |
| Bluff | Honest play of every card of the declared rank; an occasional one-card bluff; calls a claim that cannot be true, a play that empties a hand, or on a weighted doubt |
| Truth or Dare | Weighted pick of truth, dare or burning building; mostly `done`; random fates. A table move, not a claim that a bot answered |

The Gang scheduler must stop scheduling a chip-holding bot while a human is
still choosing: the published basic game permits steals/returns, but an
already-ranked bot should not endlessly shuffle chips. Only bots listed in the
public `pending_players` are scheduled during that phase.

Own legal UNO announcements receive scheduling precedence before another bot's
ordinary turn or catch reaction. Otherwise bots could continually catch the
previous bot before it ever gets an opportunity to announce its last card.
Announcements and catches remain ordinary versioned engine actions; a human
can still commit a legal catch before the scheduled bot announcement.

## Pacing

`app/rooms/bots.py` sets each match's `bot_due_at` after every committed move;
the room page drives the due bot at that time. An ordinary bot move waits
`BOT_DELAY_SECONDS` (0.8s). When the bot due next can only advance past a review
or reveal, it waits long enough for people to read it first: Trio `continue`
5s, 6 nimmt! `next_selection` 4s, party `next_prompt` 6s, Truth or Dare `next`
6s, and `next_round` / `next_heist` round summaries 8s. Bluff's reveal uses the
same `continue` pause and Liar's Dice's reveal the same `next_round` pause. A
Housie bot whose only move is `call_number` waits 3s, so each number stays up
long enough for people to find it, mark it and claim. A person who holds that review advances it
whenever they choose. When the due bot could catch a person who has just
reached one card without calling UNO, it waits `BOT_CATCH_GRACE_SECONDS` (3s)
so the person has a fair chance to call it; a bot's own announcement keeps the
ordinary pace. Pacing never changes which bot acts, its policy or the legal
actions: after the pause the same catch or advance is still taken.
`test_bot_pacing.py` covers every review action and the UNO window on engine
states; `test_bots_rooms.py` checks the published due time, early no-op drives
and the eventual move through HTTP.

Tarot is already solo and has no opponent bot. Word Agents bots understand the
finite original category lexicon and a weak spelling fallback for unfamiliar
human clues; they do not have unrestricted language understanding. Casino
sampling is intentionally small and approximate, not a solver or a guarantee of
winning. Rummy can withdraw after 70 unsuccessful own turns to bound a stagnant
deal; it never submits a knowingly false declaration. Party bot responses are
synthetic entertainment, not human preferences or personal disclosures.

Existing pure poker and rummy validation helpers are reused. Public-board rule
helpers are used only on reconstructed public boards. Large RL/ML frameworks
are unnecessary for these actual game formats and would add heavy runtimes and
model artifacts without replacing authoritative game rules.

## Acceptance

Focused tests verify useful wins/blocks, basic blackjack strategy, valid rummy
declarations, no hidden-hand dependence, deterministic decisions, immutable input
views/memory, bounded memory/search and natural complete matches at every
supported seat limit. HTTP tests separately verify persistence, scheduling,
ownership and concurrency. Exact passing counts/timings belong in progress.txt;
this module documentation does not itself claim a completed production release.

Current local policy acceptance: `test_bot_policies.py` passes 414 cases, including
360 natural matches: every multiplayer game at both player limits, two independent
seeds per limit, at each of the three levels. Other cases prove deterministic immutable decisions,
hidden-hand/key parity, memory bounds, real rummy declarations, board wins/blocks,
hard/soft/pair blackjack choices, bank-first payments, Gang free-chip estimates,
Trio observation and transparent party behavior. Each natural scenario asserts a
generous two-second upper bound per policy call to catch unbounded searches.
Ruff and mypy pass for all nine policy source files. This is local algorithm
proof; the platform's HTTP/browser and production gates are separate.

Shithead adds own-six-card setup ranking, legal equal-rank sets and blind occupied
slot choices. Only own cards and public ranks/counts inform the policy; hidden
slots are never inspected. A bounded64-entry hash history recognizes repeated
own/public rank situations. Varied legal plays and occasional voluntary pickup
break greedy high-pair cycles without inventing a draw, turn deadline or forced
loser. All movement and loser-last scoring remain authoritative engine rules.

Deal property actions now name their exact collection destination in `choice`.
The policy scores the visible count of that selected pile, so a free new-pile
option cannot distract it from completing an existing set. Older projections
without a destination keep the original color-based fallback. Rearrangements
still do not enter the policy's ordinary play priorities, preventing free-move
loops; no hidden collection, hand or stock data is added to its inputs.

## Housie, Liar's Dice, Bluff and Truth or Dare

`app/bots/parlour.py`. Each policy reads only that bot's own `GameView` and
keeps no memory beyond the shared decision cursor.

**Housie.** With "Mark called numbers for me" off, the bot first marks every
called number on its own ticket, lowest first, because a claim counts only
marked numbers. It then claims every prize it is offered, in the order Early
five, Top line, Middle line, Bottom line, Full house: Full house ends the
match, so claiming it first would forfeit a line completed by the same number.
With nothing to mark or claim, the caller calls. The policy only ever returns
`call_number` when it is the bot's sole option, so no level withholds a call. A
slip (medium, easy) can call before claiming or marking, or claim Full house
before a line: the claim usually still stands on a later call, as for a person
who was slow.

Scheduling (`app/rooms/bots.py`): a Housie bot that can mark or claim acts
before a bot caller's `call_number`, so its claim lands on the call that earned
it. These are that bot's own legal moves; a person can always claim in the same
window and share.

**Liar's Dice.** From its own dice and the number of unseen dice the bot
computes the chance that a bid holds: each unseen die counts with chance 1/6,
or 1/3 when ones are wild and the bid is not on ones. Opening, it bids the face
it holds most of at the highest quantity it still believes with chance 0.62 or
more. Facing a bid, it compares the standing bid with the cheapest raise on
each face and takes the raise most likely to be true, unless the two chances
add up to less than one, in which case calling is the better bet. With no
raise left it calls. A slip lands on another face's cheapest raise or on a
call.

**Bluff.** Starting a round, the bot declares the rank it holds most of and
plays those cards. Following, it plays every card it holds of the declared
rank. With none, it bluffs one card (the rank it holds least of) with chance
0.2, or 0.55 with three cards or fewer, and otherwise passes; it never bluffs
its last card. Before playing it may call: always when its own cards of that
rank plus the claimed count exceed four, always when the play emptied the
other hand, and otherwise with a small chance that grows with the claimed
count, with its own holding of that rank and when the round's claims cannot all
be true. A play is composed from cards, so a slip never replaces it; a slip
can turn a pass into a call or a call into a pass.

**Truth or Dare.** Truth, dare and burning building are picked with weights
0.45, 0.35 and 0.2. On a truth or dare the hard bot marks it done about 86% of
the time, passes about 8% and uses its one swap about 6%. Fates are assigned
uniformly at random. A slip can land on a pass (the action is `skip`, which is
not one of the steady actions), so easy and medium bots pass more often; the
review step `next` is steady and is never replaced. A bot's `done` keeps the
table's scoring going and is not a claim that a bot said or did anything.

The Bluff and Truth or Dare pass is named `skip` because `pass` is a steady
action: "the only move a player without a real one is offered". In these two
games passing is a real choice.
