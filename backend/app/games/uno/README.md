# Uno family

Rules reference: Mattel classic 108-card
edition (https://service.mattel.com/instruction_sheets/uno%20basic%20is.pdf) and https://service.mattel.com/instruction_sheets/HVW18-Eng.pdf (168-card
Show 'em No Mercy). Classic supports 2–10 players; No Mercy 2–6.

Classic has seven starting cards, one card drawn when unable/unwilling to play,
wild colour choice, skips/reverses, +2 and challengeable wild +4. Optional +2
stacking and 7/0 rules default off. A hand ends on an empty hand, with remaining
card values credited to its winner. Rematches retain room results.

Opening classic action cards apply their printed effects; an opening wild asks
the first player for a colour, and an opening +4 is returned to the shuffled stock.
Final +2 draws count before scoring, and final +4 retains its challenge window.
No Mercy ignores opening actions under the first number, wins immediately on
an empty hand, and applies elimination as soon as a roulette draw reaches 25.

No Mercy uses ascending draw stacking, mandatory 7 swaps/0 rotation, draw-until-
playable, 25-card elimination, discard-all, skip-everyone, reverse +4, +6, +10
and next-player colour roulette. Eliminated hands are recycled only when needed.
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
