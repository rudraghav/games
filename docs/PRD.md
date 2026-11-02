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

Astrology is optional and off by default. Enabling it offers Western, Vedic or
both (Both selected initially), using birth date, local time and a selected city.
The server calculates planetary positions, angles, whole-sign houses and aspects
before AI interpretation. Western is tropical; Vedic explicitly uses the
Spica-anchored True Chitrapaksha convention. The saved private reading includes
the chart and separate normal/quirky interpretations for the selected systems.
Birth inputs are neither persisted with the reading nor sent to Gemini; only
computed placements are sent. Repeated/nonexistent local times require
resolution rather than an invented chart. The experience remains reflective.

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
The active character imagery shows the fictional characters themselves: official
character art, in-character stills or character illustrations, with consistent
frames and accurate source credits. Performer headshots and voice-actor/cosplay
substitutes do not satisfy this requirement.

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

Shithead extends the catalogue to 27 experiences, including Pop Tarot. Its
2–5-player table uses standard 52-card rules documented in the module, with
optional seven-low and transparent-three toggles off by default. All escaped
players win and the last remaining player loses; no score is invented. Human
and bot seats use the same authoritative legal actions and room lifecycle.

## Audit implementation, 2 November 2026

The independent audit is followed by exact server-authored choice consequences,
monotonic refresh recovery, saved Tarot question hydration, game-specific score
explanations and accessible inspection/board navigation. Classic Deal uses the
Hasbro FAQ953 zero-play Just Say No contract (`b0965-faq-2`); current attached-building
transfer remains an explicit Games convention. Deal No Mercy retains its approved
house deck and own-turn counter convention. Sea Salt & Paper pins existing stock
exhaustion behavior as `base58-exhaust-1`, explaining its difference from the
licensed online implementation. No timers, real-money features, public matchmaking,
new identities or hidden-state exposure are added. Source details and per-ticket
acceptance are retained in `evidence/audit-fixes-2026-11-02/README.md`.
