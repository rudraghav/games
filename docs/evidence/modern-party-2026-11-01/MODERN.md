# Modern games — local evidence

1 November 2026. This subtask implemented Flip 7, Trio and Azul in the local
working tree. Pushing, production deployment and hosted acceptance belong to
the parent release. `modern-local.json` contains the modern source fingerprint,
scope, case summaries and honest source-timing boundaries.

Rules came from [The Op's Flip 7 FAQ](https://theop.games/pages/flip-7-faqs)
and publisher-distributed edition 3.1 deck instructions, [Cocktail Games' Trio
rules and FAQ](https://www.cocktailgames.com/nos-jeux/trio-faq/), and
[Next Move's Azul rules](https://cdn.svc.asmodee.net/production-nextmove/uploads/sites/4/2024/06/EN-Azul-Rules-Next-Move-web.pdf).
Each backend module README records the exact inventory, mode and digital
conventions. Trio offers individual Simple mode; Azul uses the fixed colored wall.
All bundled card graphics and ceramic patterns are original Games compositions.

- 24 focused Python checks passed: inventories, mutation purity, privacy,
  legal/illegal actions, Flip Three interrupt ordering and cancelation,
  Second Chance, effect ownership, seven-card closure, tie continuation,
  Trio hand-end access/restoration and both victories, Azul drafts, floor,
  adjacency, stock refill, round bonuses and ties.
- Eight frontend checks passed. They render all six seat-limit projections,
  verify Azul's claimed/unclaimed marker caption, and complete 18 seeded actual
  engine matches through the browser policy using authorized actor views only.
  Trio remembers public reveals; private hands are used only by their current
  actor and are never cached for another seat.
- All 12 distinct minimum/maximum desktop/phone full-match cases finished,
  rendered saved results, rematched and changed games without losing the group.
  All four Flip 7 cases were rerun after correcting effect-card ownership.
  The selected case proofs cover 1,394 legal actions. Bulk play is API-driven;
  result/rematch/change-game controls are clicked in independent browsers.
- Four focused browser checks passed: every seat-limit layout on both viewports,
  no page overflow, enabled table controls at least 44 pixels, and six actual
  three-player workflows that click the table controls, refresh and read back
  the saved version. Both task rooms closed. Two final gallery checks also
  passed after the next-starter caption correction.

Azul's publisher rulebook permits underfilled offers without defining a wholly
empty one. Games has an explicit defensive exhaustion convention: finish with
normal bonuses and tie breaks, preserving unfinished lines. Its regression is
a constructed, conserved 80-wall/20-unfinished-tile position. Natural-play
reachability has not been established; ordinary seeded matches ended by a row.

The six PNGs show actual local game controls (Flip 7/Trio) and final four-player
Azul gallery layouts. They exclude room URLs, codes and invitations. Earlier
gallery captures were inspected to catch unsupported card colors before the
final yellow/red/blue/plum palette was applied. No production data, authentication
setting or cloud resource changed in this subtask.
