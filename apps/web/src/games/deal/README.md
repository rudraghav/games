# Deal table information

`DealTable` keeps the public board, 96px command bar and private hand in stable
rows. Selecting a card changes the command; complex choices use the shared
modeless decision panel. A separate **Card info** control inspects a card without
selecting, paying, banking or submitting it. Each public property set also has
an **Info** control, including inside an opponent’s public-table inspector.

`DealCardInformation` uses only the viewer’s hand, public banks/collections and
the discard. It lists payment value, the printed effect, all allowed property
colours, properties needed for completion and each labelled base-rent step.
For a placed card it also shows the actual public collection count, current
rent, named properties and attached buildings. The turn multiplier and legal
rent options come from the typed server projection; this view does not decide
whether a move is permitted. A zero-value all-colour wild has no payment value,
cannot be banked and cannot collect rent alone. Properties cannot be banked.
The winning condition remains three completed sets in different colours.

The shared `@games/ui` `dealCardInstructions` is also used by the card faces, so
card and inspector explanations have one owner. Inspection has a native card
selector, scrolls within the dialog on phones, supports Escape and restores the
exact Info opener, including when nested within a public opponent inspector.
Hidden hands, drawn cards and stock order are never added to its selector.

Twelve engine-derived scenarios in `scripts/export_deal_scenarios.py` include
counter chains, swaps, payments, buildings, a committed 18M doubled-rent bill
and a naturally reached nine-card hand. `deal-information.spec.ts` checks touch,
keyboard, nested focus restoration, public-only zones and unchanged table/hand
geometry at 390px and 1440px. The broader catalogue decision audit and its
remaining limits are in `docs/evidence/game-info-2026-11-02/README.md`.
