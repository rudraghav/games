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
