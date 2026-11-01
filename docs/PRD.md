# Games product contract

Private game nights with friends: home → choose game → room → invite → ready →
play → results → rematch/change game. Launch requires nine complete games and
the owner-requested Pop Tarot experience.

## Confirmed decisions

Uno/classic and Show 'em No Mercy; Monopoly Deal/classic and Deal No Mercy;
no-limit Texas Hold'em; Indian 13-card points rummy; classic Teen Patti; blackjack;
classic Skyjo. Every game has its own rules document and automated tests.

Pop Tarot adds a solo 78-card modern pop-art deck and a three-card spread.
Readings are AI-written around the selected cards and an optional personal
question, with playful pop-culture analogies. The card system and AI contract
remain reusable. No fabricated reading is shown when AI is unavailable.

Guests choose a name/avatar and play immediately. Optional Google or email accounts retain
identity and results. Room chips have no monetary value. Multiplayer opponents are
human by default; optional rule-based bot seats now let one person play any
multiplayer game. Blackjack also keeps its automated dealer. Bot decisions use
only that seat's permitted view, with no LLM calls or hidden-hand access. Bots
are labeled, ready automatically and never own a room. Party bot preferences are
simulated; Word Agents bots use a documented offline category vocabulary.
Rooms have chat and reactions.

The host selects rules before a match. All seated players must be ready. Late
arrivals wait until the next match. No turn clock. A lost presence lease pauses
play until reconnection; the host can abandon the match. A replacement host can
claim hosting after 90 seconds. Host departure transfers to a connected member.

## Library expansion

The owner requested a broader social-game library and an online testing preview.
The next batch adds Four in a Row, Reversi, Codenames-style team word deduction
with an original English word list, and Gem Market, an original Splendor-style
resource engine with its own documented development cards. These enter through
the same room, privacy, action/version, rematch and renderer contracts. A game
must be playable before it appears as an available catalogue choice. See
`GAME_LIBRARY.md` for rules sources, edition boundaries and further candidates.

The next owner-requested expansion adds American Checkers and four-seed Kalah
(Mancala), giving sixteen experiences. Search, player count and category filters
help groups choose without changing room membership. On 1 November 2026 the
owner approved a clearly labeled Games house deck for Deal No Mercy because its
complete printed money-card multiplicities were unavailable. Exact house counts
and verified printed effects are recorded in that engine's README and rule sheet.

The subsequent owner-requested expansion adds Flip 7 (edition 3.1), Trio
(individual Simple mode), Azul (standard colored wall) and three original party
modes: Spill or Chill, Most Likely and Hot Seat. This brings the catalogue to 22.
Party rooms support 3–10 players, original nonrepeating prompts, private locked
votes/predictions where applicable, balanced spotlight turns and optional sip
suggestions. Passing and any drink work without affecting participation access.

Every Tarot card now has an original illustration: 22 major and 56 minor arcana.
A canonical deck browser reveals artwork without exposing the shuffled game deck.
Fresh readings include a grounded and separate quirky interpretation plus one
or two named character connections per card. Distinct minor-card meanings guide
the model. Older saved output remains readable without invented new sections.

## Release gate

The contemporary expansion adds The Gang (basic cooperative poker), 6 nimmt!
(classic 104-card game), Sea Salt & Paper (base 58-card game) and boop. (standard
kitten/cat game). The catalogue contains 26 experiences after registration.
Publisher rules and exact edition boundaries live in each module README.
Cooperative outcomes distinguish team victory and defeat; penalty scores explain
that lower is better, and unscored games retain player outcomes without an
invented numeric ranking. Search and intersecting category/group-size filters
remain available on phones with dedicated rows for primary actions.

Every registered game must complete matches, score correctly, rematch, and switch games
within the same group. Hidden information, persistence, concurrency, authorization,
responsive layouts and reconnects must pass real workflow verification. Track
unverified requirements as gaps, never as completed capabilities.
