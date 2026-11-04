# Gem Market table

The table uses server-authored legal actions and purchase quotes. Players can
inspect resources and discounts, select a development or patron, and commit the
current buy/reserve action. Tier controls keep the market readable on phones;
public opponent resources and collections remain in expandable player sections.

Purchased developments and patrons wrap inside their public collection instead
of continuing into a clipped horizontal strip. Read-only collected cards retain
their existing dimensions and never become move controls. The shared stylesheet
owns this wrapping; private reservations and market tiers retain their layouts.

`crowded-modern.spec.ts` checks every expanded public card's bounds and overlap
at 320, 390, 768 and 1440 pixels, including naturally reached collection peaks.
This is legal-projection evidence, separate from saved multiplayer acceptance.

## Decisions at a glance

Every market and reserved card carries the viewer's server quote as a badge
("Affordable" or "Need N more"), and each tier tab counts its cards and the
affordable ones. The market opens on the first tier that still has cards, or the
tier of the selected card; switching tiers never clears a selection, and the tab
holding it is marked.

Tapping a card opens a bottom tray (a `DecisionDock` sticky to the viewport) that
names the card and puts Buy / "Reserve · +1 gold" (or the reason neither is
possible) in a sticky actions row above the printed cost, discount, payment and
"left after" breakdown. Escape or Clear returns focus to the card. Required gem
returns ("Return 2 gems to hold ten", one compact chip per colour you hold) and
patron choices use the same tray. The unsent selection and gem picks are a
`useTableDraft` scoped to room, match and version, so a refresh keeps them and the
next decision starts clean.

The gem picker follows the legal take actions: a fourth colour is disabled, two of
one colour is offered only where the supply allows it, and the live hint says
what is missing or why ("Two ruby need at least 4 in the supply; 3 left") and
warns when the take will force a return. Picks and a card selection clear each
other.

Each gem colour has its own cut (round pearl, diamond sapphire, trillion ruby,
step-cut emerald, hexagonal onyx) so colour is never the only cue. Patrons show
"+3" and a Patron mark instead of a discount token, with the viewer's progress per
requirement (2/3) and a "Ready to visit" badge. In the final round a status note
and the player strip tell every seat whether this is their last turn, they have
one more, or their turns are done; waiting seats see who is returning gems or
choosing a patron, never the actor's instruction. At match end a ranked "Final
collections" list gives prestige, developments and patrons per seat.
