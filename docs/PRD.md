# Games product contract

Choose a game before choosing how to play. Tarot opens directly into a private
reading; bot play starts immediately. Friends use game → setup → invite lobby →
ready → play → results → rematch/change game. The catalogue now contains 27 games.

## Learn through play

All 27 game pages keep normal play as the default. **Rules & tutorial** opens a
public illustrated rulebook with the goal, three worked examples, the rules by
topic and an optional **Play tutorial** action. Reading it creates no session.
Players can turn coaching on or off in the same rulebook during a solo or
bot-only game and continue their current match. The 26 multiplayer tutorials put one learner at the real table with
ordinary bot seats. Tarot teaches the positions of a private three-card spread.
Instructions follow the legal choices in the learner’s view. Feedback explains
the committed action and the bot’s visible reply. Closing the tutor continues
the same game. Western and Vedic astrology show named sign illustrations on
the chart and in the placements and houses tables.

## Confirmed decisions

Every game has a public `/games/[gameId]` page with rules and clear play actions.
Browsing creates no identity or session. Start reading and Play with bots need
no name form or room setup; existing player profiles remain unchanged. Private
sessions still persist server-side, with idempotent launch retries and authorized
game-specific URLs. Tarot uses `/games/tarot/play/[id]` for the active spread and
`/games/tarot/readings/[matchId]` for its immutable archive. Old room/reading links
remain usable. Home's Your games tab retains unfinished sessions and history.

Uno/classic and Show 'em No Mercy; Monopoly Deal/classic and Deal No Mercy;
no-limit Texas Hold'em; Indian 13-card points rummy; classic Teen Patti; blackjack;
classic Skyjo. Every game has its own rules document and automated tests.

Pop Tarot adds a solo 78-card modern pop-art deck and a three-card spread.
Readings are AI-written around the selected cards and an optional personal
question, with playful pop-culture analogies. The reading opens by connecting named cards in their spread positions. Character suggestions account for the question and each card before additional options are allocated; a repeated suit or rank can inform the interpretation. The card system and AI contract
remain reusable. No fabricated reading is shown when AI is unavailable.
After the draw, the player can choose **Classic** or **Fun**. Classic keeps the reflective reading and gives familiar figures a place among the suggestions. Fun uses a recognizable story, sporting moment or public example to illustrate a choice and a possible consequence. The explanation should make sense even to someone unfamiliar with its source. The choice applies with or without astrology.

Readings try Gemini, then Cloudflare, then Groq within one bounded request.
Configured providers are eligible for all four reading options; less consistent
models remain last fallbacks instead of having individual options disabled.
Every returned reading must pass the same complete-output, card, reference and
chart validation. A failed check identifies its reading part. A retry may relax
only that part's question-format rule; factual, required-content and length checks
remain active. The loader explains the retry, and new readings start with all
checks active. A concise failure state preserves the spread and offers Retry only when useful; request
limits survive refresh, and checking for a lost response never submits again.
The reading form names the services that may receive the question and chart.
While writing, a compact loader shows the actual saved stage: preparing, matching
references, writing, retrying a provider, checking or saving. Percentage and time
remaining are explicitly estimates; neither claims completion before the reading
is saved. Refresh resumes the original attempt and elapsed time. Slow attempts
say they are taking longer, without a false zero-second countdown.
Fun displays the source scene directly beside the choice it illustrates. Classic reference connections may include a compact Background disclosure containing
the exact catalogue context, stored separately from the generated reflection.
The model cannot rewrite that evidence, and saved readings keep their original
background even if the catalogue is later corrected.

Pop Tarot is the home catalogue's featured game, occupying the first full-width
row with its own card artwork and a clear Start reading action. It remains one
of the27 discoverable experiences and respects the active search and filters.

Astrology is optional and off by default. Enabling it offers Western, Vedic or
both (Both selected initially), using birth date, local time and a selected city.
The server calculates planetary positions, angles, whole-sign houses and aspects
before AI interpretation. Western is tropical; Vedic explicitly uses the
Spica-anchored True Chitrapaksha convention. The saved private reading includes
the chart and separate normal/quirky interpretations for the selected systems.
Birth inputs are neither persisted with the reading nor sent to AI providers; only
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
Reference imagery shows the named subject: character art, in-character stills or
illustrations for fictional characters, and portraits for real people. Original
illustrations are labelled. Attributed artist works carry an Artwork reference
label and exact work credit; meme references use the actual scene/reaction. An actor's
portrait is valid when the reference is that actor; it cannot substitute for a
fictional role. Images use consistent frames and accurate source credits.

The 17 November expansion broadens the reference library beyond the original 48
to include actors, scientists, historical rulers, political/civic leaders,
sportspersons, writers, musicians and fictional heroes across cultures, including
familiar deities and curated Hollywood/Bollywood/Telugu and internet memes. The
expanded scope requires over5,000 distinct, image-backed eligible identities,
with sourced public story/work context. Question, card and position meanings
guide reference selection; aliases and related forms do not fill a spread. Requests
use a bounded, varied shortlist so the larger catalogue does not inflate AI cost
or imply every reference belongs in one reading. Comparisons to real people
describe public work or achievements, not private beliefs or endorsements.
Specific saved readings reopen from private match history after a new spread or
room closure; an archive never silently regenerates the analysis.

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
