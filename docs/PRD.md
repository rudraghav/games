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
human; blackjack has an automated dealer. Rooms have chat and reactions.

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

## Release gate

All nine games must complete matches, score correctly, rematch, and switch games
within the same group. Hidden information, persistence, concurrency, authorization,
responsive layouts and reconnects must pass real workflow verification. Track
unverified requirements as gaps, never as completed capabilities.
