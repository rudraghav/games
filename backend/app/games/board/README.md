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

Terminal projections explain Four in a Row's winning line or full-board draw and
checkers' no-pieces/no-legal-move win, threefold repetition or 40-moves-each quiet
draw. The engine provides the reason and decisive Four cells; the client does not
recompute either. Missing result metadata in older saved states remains readable.

Messages are perspective-safe. `message` is shown by the room only to the seat
that can act, so in-play messages are that seat's instruction ("You play Black.
Choose a marked square to flip discs.") and never restate the previous move (the
attributed "Last move" line does that). Terminal messages are seen by everyone,
so they name a colour, never "you" ("Ivory has no legal move left, so Coral
wins."). Seat 0 is Coral (Four, checkers) or Black (Reversi); seat 1 is Gold,
Ivory or White.

Public consequence detail, all derived from the public board (no hidden state):
Four `landing` (landing cell per legal column); Reversi `flips` (discs each legal
placement would flip), `last_flips` and `passed` (the seat skipped by the latest
placement); checkers `last_from`, `last_captured` and `forced` (the piece that
must keep jumping); Mancala `previews` (landing pit, captured seeds and extra
turn per legal pit), `last_source`, `last_capture` and the end `sweep`. Older
saved states without these keys stay readable. Manifests declare score units
(Discs, Captures, Seeds); Four in a Row's 1/0 score is hidden (`score_order: none`).

At 360px and wider, every board fits the screen with 44px move targets (phones
borrow most of the page gutter); laptops cap the board by viewport height. Below
that, the shared horizontal rail (arrows below the board, never over squares) and
a read-only whole-board overview remain the fallback; closing the overview
restores focus without submitting a move.

Audit: `test_expansion.py` independently checks gravity, all winning directions,
full-column rejection, Reversi eight-direction captures, forced passes and
terminal counts. `test_table_rules.py` additionally completes both games at their
two-player limit while checking immutable inputs and disabled terminal actions.
