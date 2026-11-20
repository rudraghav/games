# Roulette and Slots

Both solo tables project the virtual chip balance, spins remaining and completed spins for the owning player. Stake presets, the roulette picker and typed values edit a local draft scoped to this player, room, match and version. Only Spin submits the matching server action. Pending and paused tables disable the controls. A finished match shows its saved receipts.

Roulette renders the 37 pockets in European single-zero order. A settled wheel turns to its saved pocket. Six outside choices and a native number picker expose all legal bets on touch and keyboard. The selected stake shows the gross return on a win and the chips left unbet. Slots shows an empty three-reel window before play, then the three symbols in the actual saved payline. Its paytable, exact outcome counts and long-run return come from the engine projection. Reduced-motion users see the same result without a spinning or landing transition.

`ChanceHistory` renders the settlement records directly, including the number/colour or three symbols, amount staked and returned, net and new balance. Active tables collapse the history by default. Finished-session archive pages can open it with `expanded`. The client never samples an outcome.
