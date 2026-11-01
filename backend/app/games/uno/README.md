# Uno family

Status: implementation in progress. Rules reference: Mattel classic 108-card
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
