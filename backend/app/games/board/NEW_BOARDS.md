# Checkers and Mancala

Both modules use the existing two-player private room, pure engine actions,
saved state, public projection, results and rematch service. No schema or server
endpoint is added. Board decisions remain authoritative on the server.

## Checkers

American/English checkers, grounded in [WCDF rules, section 1](https://wcdf.net/rules/rules_of_checkers_english.pdf).
Two players start with twelve men each on an 8×8 board; coral/first seat moves
first. Men move and jump diagonally forward. Short kings move/jump either way.
Captures are compulsory; any capturing path is allowed without a maximum-capture
requirement. A capturing piece must continue jumping. Promotion ends that turn,
including a capture onto the far row. The engine tracks each jump as an action
while keeping the same actor until the sequence ends.

No pieces or no legal moves loses. This relaxed, untimed table automatically
declares a draw on the third repeated position (including side to move), or
after eighty plies without a capture or uncrowned-man move. The automatic
declaration replaces a physical referee claim. Tournament touch-move penalties,
clocks, opening ballots and automatic colour alternation are not imposed.
Scores count captured opposing pieces; they do not decide a drawn game.

The browser selects a source piece and then a marked destination; every action
also has a complete accessible move label. Kings have a crown symbol. The board
scrolls inside its container on narrow phones, keeping squares at least 44px.

## Mancala

An explicitly documented **Kalah (four-seed)** table, rather than a claim to cover
the many mancala variants. [Hasbro/Cranium's Mancala instructions](https://www.hasbro.com/common/instruct/BE3C134F-D56F-E112-4024DF451E0337E2.pdf)
support the core sowing/store/extra-turn loop. Two players have six pits each
containing four seeds, and an empty store each: forty-eight seeds total.

Choose a nonempty own pit; sow counterclockwise one seed at a time, including
one's own store and skipping the other store even on multiple laps. Landing in
one's store gives another turn. The selected table convention captures the last
seed and the opposite pit only when that opposite pit contains seeds. Landing
opposite an empty pit leaves the seed in place. When either side is empty,
sweep every remaining seed on each side into its owner's store before scoring;
this takes precedence over an extra turn. Most stored seeds wins, equal stores
draw. The end sweep/capture convention is explicit because physical sets differ.
No dice, relay sowing, pie swap or bonus-round variants.

Stores, pits and numeric seed counts share the typed `MancalaPit` component;
enabled pits show the actual legal decisions and labels report their seed count.

## Verification

`backend/tests/test_new_boards.py` asserts exact compulsory jumps, continued
jumps, promotion termination, backward kings, immobility wins, quiet draws,
extra turns, multi-lap store skipping, empty/nonempty opposite captures and final
sweeps. Reproducible complete matches check terminal actions and seed totals.
Browser full-match and UI evidence is recorded separately in the root journal.

An independent second review added third-repetition/side-to-move checks,
quiet-count resets after man moves and captures, the right to choose a shorter
capture path, mirrored second-seat Kalah captures/extra turns, and tied final
sweeps. These scenarios passed without requiring an engine correction.
