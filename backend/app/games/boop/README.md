# boop. — standard kittens and cats

Rules recorded before implementation, 1 November 2026. Primary sources:
[Smirk & Dagger's product](https://smirkanddagger.com/products/boop-a-cute-but-deceptively-challenging-abstract-strategy-game),
the publisher's [2022 rulebook](https://static1.squarespace.com/static/591861c529687fd2ca03c3f3/t/673f6627376e197c76dae8cf/1732208189585/Boop%2Brules.pdf)
and [publisher-supported Dized FAQ](https://rules.dized.com/game/3_U-I3tNQyW4X0aaWER7YA/faq).
Original Games cat artwork replaces commercial illustrations. Ghost/holiday and
kitten-only beginner variants are excluded. This is a two-player public board.

## Inventory and setup

A 6×6 bed; each player owns eight kittens and eight adult cats (32 physical
pieces total). All eight kittens begin available, all adult cats in reserve.
First seat starts instead of the physical recent-cat-petting suggestion.
Graduated kittens remain retired, tracked separately; eight active pieces per
player are maintained across the board and available pool.

## Turn, booping and graduation

Place one available kitten or adult cat on an empty square. It pushes each
adjacent piece exactly one square directly away, including diagonals. Kittens
cannot push adults; adults push either. A destination already occupied blocks
the push, including the line-of-two protection. Off-board pieces return to their
owner's available pool. Evaluate destinations against the pre-push board: pushes
are simultaneous, cause no chain reactions, and cannot push another adjacent
piece into a vacated space in the same step.

After all pushes, only the active player checks victory/graduation. Three own
adults in a horizontal/vertical/diagonal line, or eight own adults on the board,
wins. The Dized FAQ explicitly resolves apparent simultaneous wins in favor of
the active player's end-of-turn check; an opponent's formation waits for their
own turn and may be disrupted.

Otherwise select one own line of three to remove: kittens retire and are replaced
by reserve adults in the available pool; existing adults return to the pool.
Long/overlapping or separate lines offer each distinct contiguous group of three,
and exactly one is resolved. With eight own pieces on the bed, the alternative
is to return one piece, upgrading it if a kitten. The digital flow requires this
choice when the pool is empty, keeping the next placement defined; it never
silently chooses a strategically different piece. No opponent graduates during
your turn. One explicit choice screen owns graduation before play passes.

## Acceptance

Independent exact-position tests cover blocked pushes, off-board return, no
chain, kitten/adult strength, mixed graduation, overlapping choices, eight-piece
return and both victory conditions. Seeded full matches use public board views;
source states are immutable and all 32 physical-piece counts remain conserved.

In-play messages are the acting seat's instruction (the room shows them only to
that seat); terminal messages name a colour ("Coral has all eight adult cats on
the bed."), never "you", because every seat reads them. The room notice names the
actual actor. `last_graduation` (owner, removed cells, kittens retired, kind)
records the latest graduation or return so the next seat can see what left the
bed; it clears on the next placement. Bed squares have coordinate labels and native keyboard activation.
Kitten/adult art, available counts and selected-piece state remain explicit;
the same selection and placement flow works through touch, mouse or keyboard.

Graduation and the eight-piece return now use select, preview and confirm: a tap
or keyboard activation highlights the chosen coordinates and explains the cats
returned to the pool without submitting. Clear restores an unselected choice;
Confirm is the only commit control for this phase. The engine projects either
`three-cats` and the winning line or `eight-cats` and all eight winning coordinates,
which the result view highlights and explains. Older saves without this metadata
keep their existing result message.
