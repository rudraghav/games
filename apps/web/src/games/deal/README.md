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

The 2 November audit follow-up adds explicit payment consequences and pending
exchange targets. `paymentSelection` unions server-projected bundles, counts
carried buildings once, and shows every card leaving the table, its total and
overpayment. A clear-payment control resets only that selection. Bundles are
part of the selection signature so a new authoritative quote invalidates stale
choices. The payment action stays disabled if the projection has no usable
quote. Public transfer previews identify both sides and open the existing card
inspector without changing the move. Classic's free counter rule and No Mercy's
different house convention are identified in quick rules.

The exporter now contains sixteen scenarios, including the three original
natural audit trajectories and a recipient's pending Forced Deal view. Focused
unit checks compare rendered helper quotes with actual engine transfers. Browser
evidence covers linked-building payments, pending swaps, inspector focus,
phone overflow, disconnected-control gating and fresh mounts; this is local
projection evidence, separate from live room/reconnect acceptance.

## Crowded collections and response previews

Own and inspected public collections wrap into rows inside their existing scroll
areas. Card rows also wrap, so a large collection cannot create a second hidden
horizontal strip. The board, action bar and private hand retain their stable
layout; overflow belongs to the player's collection, not the page.

Pending public transfers show the exact projected card faces and orientation,
with the existing information control and source/destination. An unblocked
transfer is confirmed with **Allow transfer**; accepting a blocked transfer says
**Keep action blocked**. These labels submit the same server-enumerated actions.

The exporter adds five explicitly controlled density probes: both editions with
13 distinct piles and ten bank cards, their public opponent views, and a pending
wild-card steal. Real deck inventory and privacy guards still apply; these are
not naturally reached matches. All 21 targeted fixtures coexist with the natural
midgame suite. `crowded-deal.spec.ts` exercises row bounds, final-set inspection,
keyboard/focus, actual transfer previews, both responses and paused/pending gates
at 320, 390, 768 and 1440px. Current coverage lives in
`docs/evidence/crowded-actions-2026-11-02`.
