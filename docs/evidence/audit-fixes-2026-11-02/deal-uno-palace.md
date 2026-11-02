# Deal, Uno and Shithead audit fixes

Local implementation and verification, 2 November 2026. Parent release task owns
commit/push, complete repository gates, deployment and live room evidence.

## Outcome and acceptance

- Deal payments must preview and transfer exactly the same public assets, count
  attached buildings once, reject invalid/insufficient selections, and let bots
  value the actual loss using only their authorized projection.
- Classic Just Say No must follow current Hasbro FAQ 953, including after the
  third ordinary play. No Mercy's approved house format remains separately named.
- Pending public exchanges must identify both sides; Uno must distinguish Roulette
  from ordinary colour choice and show direction/next active seat; Shithead must
  expose its already-public pile tail without hidden identities.

## Implemented

`backend/app/games/deal/table.py` now owns `transfer_cards`, the linked-asset
closure also used by actual transfer. New `payments.py` projects one bundle per
payable asset and unions selected bundles without exponential subset enumeration.
Payment validation/commit, insolvency/debt issuance and bot loss valuation use
those same consequences. Explicitly selecting a building and its anchor is
deduplicated; properties transfer first so selection order cannot change the
building's destination. The browser consumes server-authored bundles, displays
all actual cards/values (including carried buildings), and invalidates stale
selections when the authoritative bundle or match version changes.

Classic is now `b0965-faq-2`: ordinary play cost excludes Just Say No, including
the zero-plays-left counter window. Verified source:
[Hasbro FAQ 953](https://hasbro-new.custhelp.com/app/answers/detail/a_id/953/).
No Mercy retains `house-deck-1`, its approved money inventory and its existing
own-turn counter cost, now explicitly described as a Games house convention.
The existing linked-building carry rule is also explicitly labelled a Games
convention, not presented as a publisher-verified payment rule.

Deal's public pending projection includes committed card transfers, exact set,
public Tough Luck category and rent collection/multiplier. Kind/zone checks
exclude arbitrary private event fields. Pending-card inspection uses the existing
dialog and restores focus. Uno adds validated public pending cause, direction,
next active seat and elimination limit; Roulette explains drawing until the
chosen colour, wild-card continuation and the 25-card consequence. It exposes
no challenge legality. Shithead opens the projected last twelve public pile cards
in oldest-to-newest order using shared controls, without modifying engine state.

## Files owned by this subtask

- Backend: `backend/app/games/deal/{table,payments,effects,options,engine}.py`,
  `backend/app/games/uno/engine.py`, and only the Deal payment import/function in
  `backend/app/bots/cards.py`.
- Clients: `packages/api-client/src/deal-details.ts`, new `shedding-details.ts`;
  parent integrated the `sheddingDetails` export in `index.ts`.
- UI: `apps/web/src/games/deal/{DealTable,presentation}.tsx/.ts`,
  `apps/web/src/games/shared/CardTable.tsx`, `apps/web/src/games/shithead/ShitheadTable.tsx`.
- Tests: `backend/tests/test_card_family_rules.py`, compact legal public traces
  `backend/tests/fixtures/deal_audit_replays.json`, one updated payment-view fixture
  in `backend/tests/test_bot_policies.py`, `apps/web/src/tests/deal-workspace.test.tsx`,
  new `apps/web/src/tests/shedding-decisions.test.tsx`.
- Review corpus: `scripts/export_deal_scenarios.py` and its generated
  `apps/web/src/stories/generated/deal-scenarios.ts` now contain sixteen scenarios.
  Added pending recipient exchange and three unchanged-seed natural regressions.
- Module notes: Deal/Uno/Shithead backend READMEs and Deal frontend README.

## Checks and observed results

- `pytest backend/tests/test_card_family_rules.py backend/tests/test_uno_edges.py
  backend/tests/test_shithead.py -q`: **153 passed**.
- `pytest backend/tests/test_bot_policies.py -q -k 'deal or uno or shithead'`:
  **28 passed**, 122 unrelated cases deselected. Includes complete seeded matches
  at both player limits and bounded policy runtime/memory. One hand-authored old
  test view required the new public payment-bundle field; no fallback to the
  former incorrect face-value calculation was introduced.
- Five affected frontend unit suites: **26 passed** (Deal workspace/information,
  Shithead, shedding decisions, shared game information).
- Web TypeScript check, focused ESLint, backend mypy on nine affected files,
  focused Ruff, Deal exporter `--check`, and scoped `git diff --check`: **passed**.
- Natural audit traces replay only legal actions from unchanged seeds with card
  conservation after every move: classic 114 actions reaches actual **9M** (2M
  selected faces plus House/Hotel); No Mercy 99 actions reaches actual **6M**
  (3M property plus Shack); classic seed12 reaches a valid third-play counter in
  four actions. Controlled cases cover overlap/deduplication, selection order,
  bank/building-only payment, insolvency, bot collateral cost and hidden canaries.

Real Chromium browser through the local development review routes:

1. At 1440×1000, original classic payment showed every transferred card and 9M,
   then submitted exactly the two selected IDs; its engine-derived continuation
   matched the preview. Disconnected gating disabled payment; reconnecting that
   harness retained the identical quote.
2. At 390×844, No Mercy showed Atlantic Avenue3M plus attached Shack3M, total6M,
   5M overpayment on the 1M bill. Clear reset to a disabled zero-value payment.
   No horizontal page overflow.
3. Pending Forced Deal showed Kentucky Avenue3M in one direction and Mediterranean
   Avenue1M in the other. Inspect/Escape restored focus to the exact card button;
   accepting showed the expected exchanged property. A fresh page mount and
   scenario selection retained the same public context.
4. Six-seat No Mercy Roulette showed draw-until/wild-ignore/25-card wording and
   direction/next seat on phone without horizontal overflow.
5. Shithead's public-pile inspector opened a legally played public card and Escape
   restored focus. The engine's existing transparent-three/four-kind cases pass;
   this particular browser sample contained one pile card, not a rare four-card
   or transparent-three tail.

Retained screenshots are in [`cards/`](cards/): classic payment desktop,
No Mercy payment phone, pending exchange phone, Roulette phone and Shithead pile
phone. They were visually inspected during verification. These are authorized
synthetic projections, not real-user data.

## Limits and cleanup

Browser disconnected/reconnected toggles establish control gating and stable
projection rendering, **not** network/WebSocket reconnection or production
persistence. Live room reconnect and full release proof remain the parent task's
responsibility. No database, account, schema, deployment, hidden game-state or
external service mutation occurred in this subtask.

Named browser `deal-audit-fixes` was closed. Five selected screenshots are retained
once (666,618 bytes) in the evidence directory; identical output copies and the
two exact task-owned CLI snapshots/one successful console log were removed after
hash/ownership checks. Existing development services, dependencies, databases,
other browser sessions, other agents' outputs and all original audit evidence
were preserved. No new worktree or temporary server was created.

## Shithead phone spacing follow-up

The actual 390×844 waiting-player view reserved an empty 208px DecisionDock
(zero buttons), plus its 10px margin. The private card region was a separate
160px footprint and did contain three public-to-self cards. Removing only the
empty dock reduces the measured workspace from **474.796875px to 256.796875px**,
saving 218px. No CSS, card size, hand layout or shared component changed.

`hasDecision` derives from the authoritative setup/play/pickup action types and
does not depend on the current card selection. A populated dock keeps its
existing fixed height. Waiting, escaped and blind-slot-only positions have no
empty dock; blind controls remain on the public own table. A new unit case
checks availability versus waiting/blind/out views. Shithead unit suite:
**4 passed**. Fresh web type-check and focused ESLint: **passed**.

The focused Chromium probe used **390×844, fullPage=false** for before/after
captures, aligned to the same workspace top. Final capture awaited actual card
art loading; all three hand cards remain visible. Images were visually checked:
[before](cards/shithead-spacing-before-phone.png) and
[after](cards/shithead-spacing-after-phone.png).

| Browser selection case | Maximum movement after select/clear | Enabled touch targets | Page overflow |
|---|---:|---|---|
| 2 seats, setup | 0px | At least 44×44px | None |
| 2 seats, playing | 0px | At least 44×44px | None |
| 5 seats, setup | 0px | At least 44×44px | None |
| 5 seats, playing | 0px | At least 44×44px | None |

Movement compares document-space x/y/width/height of the shared pile, private
hand, own face-up/hidden table and opponents. This is phase-dependent compaction,
not a reduction of space required while choices can appear. The named follow-up
browser is closed and only the two final comparison captures are retained; exact
duplicate output copies and the successful task-owned CLI snapshot/log are removed.
