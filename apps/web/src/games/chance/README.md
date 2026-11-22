# Roulette and Slots

Both solo tables project the virtual chip balance, spins remaining and completed spins for the owning player. Stake chips, the roulette layout and typed values edit a local draft scoped to this player, room, match and version. Only Spin submits the matching server action. Pending and paused tables disable the controls. A finished match shows its saved receipts.

Roulette renders the 37 pockets in European single-zero order. A settled wheel turns to its saved pocket, which rests under the brass marker at the top with the ball in it and its number on an ivory plate. Six outside bets and a native number picker expose all legal bets on touch and keyboard; each picker option names its colour. Slots shows an empty three-reel window before play, then the three symbols in the actual saved payline. Its paytable, exact outcome counts and long-run return come from the engine projection. `ChanceHistory` renders the settlement records directly, including the number/colour or three symbols, amount staked and returned, net and new balance. Active tables collapse the history by default. Finished-session archive pages can open it with `expanded`. The client never samples an outcome.

## Visual rules

Styles live in `packages/ui/src/styles/chance-tables.css`. Colours are paired there with the fill they sit on: text at 4.5:1 or more, control edges and pocket dividers at 3:1 or more. Change a colour only with its pair, and compute the ratio.

- Colour is never the only cue. Red is a diamond and black a disc on the layout, every pocket shows its number, the latest spin names the colour and says Won, Lost or Even beside the signed net, and a winning reel is ringed while the plaque names the line that paid.
- The chosen bet is lit felt with a brass ring and carries the stake as a chip on its bet spot. Brass marks on the wheel show the pockets that bet pays on (`betCovers`, display only: the server settles every spin). On Slots the stake rests on the cabinet's bet spot.
- Stake chips are buttons: the chip colour follows the denomination (`chipTier`), the number is the stake. Hover lifts, press sets the chip down, the chosen stake stands in a dark ring, and unavailable chips lie flat and grey.
- A valid wager shows the bet slip (gross return, net win, chips left unbet). The same facts stay in a sentence for screen readers; an invalid stake shows that sentence as the error.
- `data-tip` explains each bet's payout and coverage, the stake chips, the balance and the wheel marks. Tips never open on touch, so nothing depends on them.

## Motion and timing

The result is on the page as soon as the server response is applied; motion never holds back the text, the balance or the next Spin.

- Pending: the wheel idles and a ball circles the track, or the reels blur, and the stage says Spinning. Nothing moves toward a pocket or a symbol before the response.
- Roulette landing: 920ms, the same as before. The wheel turns clockwise to the saved pocket while the ball runs one and a half turns the other way, drops off the track, hops once and rests (`--ball-lead` is the wheel's own turn plus that run, so the two always meet at the top).
- Slots landing: the reels stop left to right at 0, 70 and 140ms, 180ms each, so all three are at rest inside the earlier 320ms. A win then sends one light along the payline and rings the winning reels.
- Chips slide onto a bet spot when it is chosen; after a win the brass chips stack beside the net and the balance ticks.
- Landing motion plays only for a spin that settles while the table is open (`landed`), never for a saved spin on page load. Everything animates transform or opacity only and sits inside `prefers-reduced-motion: no-preference`; reduced-motion players see each result at once.
