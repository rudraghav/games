# Uno family

Rules reference: Mattel classic 108-card
edition (https://service.mattel.com/instruction_sheets/uno%20basic%20is.pdf) and https://service.mattel.com/instruction_sheets/HVW18-Eng.pdf (168-card
Show 'em No Mercy). Classic supports 2–10 players; No Mercy 2–6.

Classic has seven starting cards, one card drawn when unable/unwilling to play,
wild colour choice, skips/reverses, +2 and wild +4. The room options "Stack draw
cards" and 7/0 default off; with stacking off a wild +4 may be challenged. A hand
ends on an empty hand, with remaining card values credited to its winner.
Rematches retain room results. See "Stacking, play-after-draw and missed turns"
below for the current draw, stack and missed-UNO rules of both editions.

Opening classic action cards apply their printed effects; an opening wild asks
the first player for a colour, and an opening +4 is returned to the shuffled stock.
Final +2 draws count before scoring, and final +4 retains its challenge window.
No Mercy ignores opening actions under the first number, wins immediately on
an empty hand, and applies elimination as soon as a roulette draw reaches 25.

No Mercy uses ascending draw stacking (the "Stack draw cards" option, on by
default), mandatory 7 swaps/0 rotation, draw-until-playable, 25-card elimination,
discard-all, skip-everyone, reverse +4, +6, +10 and next-player colour roulette. Eliminated hands are recycled only when needed.
Two-player reverse +4 sends the penalty to its actor. UNO/catch windows close
when the next player begins an ordinary move. All hand changes are server-owned.

Verification: deterministic special-card scenarios, deck conservation, legal-action
playthroughs, viewer redaction, plus multi-session browser workflows.

## 1 November 2026 rule audit

Acceptance: compare the two editions independently against the linked Mattel
instructions, verify every physical card remains in exactly one server zone
through complete seeded matches at both seat limits, and cover card effects with
expected-state assertions independent of the legal-action generator. A match here
is one hand; classic's optional 500-point and No Mercy's optional 1,000-point
multi-hand victory methods are not silently substituted for this room format.

Deck contract: classic uses one zero and two each of 1–9 in each colour, two
each coloured Skip/Reverse/+2, four Wild and four Wild +4 (108 unique IDs).
The 168-card No Mercy deck uses two each of 0–9 per colour, three each
Skip/Reverse/Discard All, two each +2/+4, one Skip Everyone, and eight each
Wild Reverse +4/+6/+10/Colour Roulette. Card values are face value, 20 for
coloured actions and 50 for wilds; No Mercy adds 250 per eliminated player.

The audit corrected Colour Roulette so the recipient's chosen colour governs
the next play, and a final No Mercy 7/0 wins before handing an empty hand to
someone else. Roulette no longer asks its actor for a redundant colour first.
Classic 7/0 is an explicitly enabled house rule; its swap/pass completes before
the resulting empty-hand check. Regression examples cover challenge penalties,
discard-all ordering, skip-everyone, opening actions and final draw scoring.
Three seeded complete matches per edition at both player limits preserve every
unique physical card after every action, including elimination and recycling.

## Public decision context — 2 November 2026

The projection adds `pending_kind` (`roulette`, `opening_color`, `challenge`, or
null), `next_player` in the current direction skipping eliminated seats, and
the No Mercy `elimination_limit` of 25 (null in classic). This supplements the
existing color, penalty and direction. The UI distinguishes choosing the colour
to draw until during Roulette from a normal colour declaration, explains that
wild cards do not end that draw, and shows the elimination consequence. Direction
and the next seat remain visible during ordinary play. `next_player` means the
next active seat in the current direction, not a prediction of a future action's
skip/reverse effect. Challenge legality and hidden hands are never projected.
The validated API adapter drops unknown fields and rejects unknown pending kinds.

## Table clarity — 3 November 2026

Acceptance: on a small phone late in a crowded match a player can tell whose turn
it is, what just happened, what they can do and whom it affects; an eliminated
No Mercy player is told they are out instead of being asked to wait.

- Messages are the next actor's instruction from public facts only ("Match Red
  or 7, or draw a card.", "Stack +4 or higher, or draw 8 — drawing puts you out.",
  "Take 4 cards, or challenge the Wild +4."). They never restate the last move;
  the room's Last move line attributes it from public history. A finished match
  says how it was won ("Last player standing after 2 eliminations.").
- Card and action labels name the card: "Wild" (not "Wild Wild"), "Colour
  roulette", "Play Yellow 4", "Play Wild · Red", "Choose Red", "Take 4 cards".
  No Mercy draw buttons that eliminate say so: "Draw 22 — you’re out",
  "Draw a card — you’re out" at 24 cards.
- `detail.last_event` is the latest action's public outcome: type, actor, card
  kind, colour, 7-swap/catch/challenge target, challenge outcome (only after it
  resolves), extra Discard All count, skipped seats, `drew` counts per player and
  players eliminated by it. UNO calls do not replace it. Drawn faces are never in
  it; `detail.you_drew` lists only the viewer's own new cards that are still in
  their hand. `detail.out` lists eliminated players in order with their card
  count at elimination. The challenge `illegal` flag stays private until resolved.
- History labels read "Dev played: Red 7 → you", "drew from the pile · 3 cards",
  "caught a missed UNO", "challenged the Wild +4", "took 4 cards".

The table (apps/web CardTable) shows the waiting penalty, challenge or roulette to
everyone ("Mira must draw 8 or stack"), the outcome the Last move line cannot
(challenge results, swaps, rotations, catches, eliminations, the card you drew),
sorts the viewer's hand with playable cards first then by colour, overlaps long
hands to their corners, offers stack/drawn-card shortcuts, colour swatches with
hand counts, a panel for more than three swap targets, and keeps the dock pinned
to the bottom of phones while the viewer has moves, sized to its content (at most
216px or 42% of the screen) so the hand stays visible above it. Rules and outcomes
are unchanged.

## Stacking, play-after-draw and missed turns — 21 November 2026

Outcome: the host chooses whether draw cards stack in either edition; a drawn
card that fits can be played at once; drawing a penalty and being caught without
UNO each cost a turn. Acceptance: every row of the table below, the missed turn
and both older-data paths are covered by `backend/tests/test_uno_stacking.py`
(engine, bots, random full matches in eight configurations) and
`backend/tests/test_uno_rooms.py` (HTTP and Postgres).

One setting on both games: `stack_draws`, label "Stack draw cards", default off
for Uno and on for Uno No Mercy. A room or match saved with the retired
`stack_draw_two: true` is read as stacking on; an explicit `stack_draws` wins.
`rules_version` is `2` for both editions.

| Game         | Stacking | What may be played on a pending draw                                                                                                                |
| ------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Uno          | on       | +2 on +2; Wild +4 on +2 or +4. Never +2 on +4. Any colour; the wild's player names the colour. The total passes on. A Wild +4 cannot be challenged. |
| Uno          | off      | Nothing: the penalty is drawn. A Wild +4 opens the accept/challenge window exactly as before.                                                       |
| Uno No Mercy | on       | Any draw card of equal or higher value than the last one: +2, +4 (coloured or Reverse +4), +6, +10. Any colour.                                     |
| Uno No Mercy | off      | Nothing: the penalty is drawn (a two-player Reverse +4 still returns its 4 to its player).                                                          |

- Taking a pending penalty always ends that turn: a stacked total, a plain +2,
  an accepted +4 and a failed challenge. A successful challenge keeps the turn.
- After a voluntary draw the drawn card may be played in the same turn if it
  fits. Classic draws one card and offers that card or Pass; No Mercy draws until
  a card fits and that card is then played (no Pass). No other card may be played.
- Caught without UNO: the player takes 2 cards and is marked in public state
  (`missing`) to miss one turn. If it is their turn and nothing is pending on
  them, that turn ends at once. Otherwise the mark is served the next time an
  ordinary turn would start for them, and play passes over them. A draw penalty,
  +4 challenge or roulette aimed at a marked seat is answered first and does not
  use up the mark; a Skip card played on a marked seat costs its own turn too.
  Marks follow the seat (not the hand) through 7 swaps and 0 passes, are never
  doubled by a second catch before being served, and are cleared by elimination
  and at the end of the hand.
- Projection: `detail.stacking`, `detail.stack_floor` (the lowest draw value that
  may answer the pending penalty; 0 when nothing may), `detail.missing_turn`
  (seat ids) and `last_event.missed` (seats the latest action's turn passed over).
  `next_player` names who takes the next ordinary turn, so it passes over a marked
  seat. All four are public; no hand information is added.
- Messages instruct the seat that acts: "Stack a +4 or higher, or draw 6. Drawing
  passes your turn.", "Stack a +10, or draw 22 — drawing puts you out.",
  "Draw 2; your turn then passes.".
- Bots stack the smallest card that answers a penalty (the largest when the next
  player holds two cards or fewer), never play a two-player Reverse +4 onto
  themselves when they could draw instead, and accept a +4 they may not stack.
  A marked bot has no decision and is not scheduled.

The table (apps/web CardTable, uno-view) reads these fields: "+6 is on you: draw
6 or stack." only when the room stacks, a "Misses next turn" chip on the seat and
a felt line for everyone, "X was caught without UNO and misses this turn." when
the mark is served, and "You drew Red 9 and it fits: play it now, or pass and
keep it." with the drawn card outlined, first in the hand and first in the dock.
