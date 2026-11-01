# Public-board classics

Checkers and Kalah/Mancala extend this family; see [their rules and acceptance](NEW_BOARDS.md).

Four in a Row: two players alternate dropping one disc into a non-full column
of a seven-column, six-row board. Gravity chooses the landing cell. The first
horizontal, vertical or diagonal line of four wins; a full board without a line
is a draw. No scoring deck, hidden information, timers or opening variants.

Reversi: two players, an 8×8 board and the standard four central opening discs.
Black moves first. A placement must bracket at least one opposing disc with an
existing friendly disc in one or more of eight directions, and flips every
bracketed disc. A player without a legal placement must pass automatically. The
game ends when neither player can place, including a full board. Most discs wins;
equal totals draw. Empty cells are not awarded to either player.

Both engines use the same public projection and board renderer, but independent
move generation/application. Server actions name a column or cell; the browser
does not calculate captures or wins. Results, player identity, reconnect, rooms
and rematches use the existing shared service. Acceptance includes out-of-turn
rejection, full columns/non-capturing squares, directional wins/flips, passes,
draws, immutable input state and bounded complete matches.

Audit: `test_expansion.py` independently checks gravity, all winning directions,
full-column rejection, Reversi eight-direction captures, forced passes and
terminal counts. `test_table_rules.py` additionally completes both games at their
two-player limit while checking immutable inputs and disabled terminal actions.
