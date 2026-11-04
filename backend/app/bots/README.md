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

## Policies

| Family | Decision method |
| --- | --- |
| Four in a Row | Bounded alpha-beta search, immediate wins/blocks and line/center evaluation |
| Reversi | Bounded public-board search, corners, dangerous adjacent squares and end-game disc counts |
| Checkers | Bounded search with legal capture continuation, crowning, material and advancement |
| Kalah/Mancala | Exact public sow/capture/extra-turn simulation and bounded lookahead |
| boop. | Public push simulation, immediate adult wins, opponent one-move threats, graduation and bounded repeat avoidance |
| Uno editions | Color retention, action pressure, swap hand counts, penalty stacking and legal UNO/catch reactions |
| Deal editions | Property-set completion, action value and opponent pressure; minimum-cost bank-first payments preserving sets |
| Hold'em | Small independent samples from the unknown card pool, pot odds and bounded raises |
| Teen Patti | Legal peek, independent three-card strength samples, affordable wagers/show/sideshow decisions |
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
5s, 6 nimmt! `next_selection` 4s, party `next_prompt` 6s, and `next_round` /
`next_heist` round summaries 8s. A person who holds that review advances it
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

Current local policy acceptance: `test_bot_policies.py` passes 144 cases, including
100 natural matches across every multiplayer game at both player limits and two
independent seeds per limit. Other cases prove deterministic immutable decisions,
hidden-hand/key parity, memory bounds, real rummy declarations, board wins/blocks,
hard/soft/pair blackjack choices, bank-first payments, Gang free-chip estimates,
Trio observation and transparent party behavior. Each natural scenario asserts a
generous two-second upper bound per policy call to catch unbounded searches.
Ruff and mypy pass for all eight policy source files. This is local algorithm
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
