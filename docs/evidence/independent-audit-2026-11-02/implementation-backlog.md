# Ordered implementation backlog

This is a plan, not authorization to implement or deploy. The audit leaves application code and production settings unchanged. Each ticket maps to the full state/evidence/impact analysis in [card/casino](card-casino-review.md), [modern/board/party](modern-board-party-review.md), [Tarot/architecture](tarot-architecture-review.md) or [responsive](tarot-review/narrow-tablet-visual-review.md) findings. [Layout proposals](layout-proposals.md) specify composition at 320/390/768/1440. Order reflects player consequence and dependencies, not an estimated calendar.

Use the existing kickoff/ownership process for implementation. Every behavior change includes module README, relevant source-of-truth doc and `progress.txt`; preserve existing entries. Generate wire types from OpenAPI and map at the API-client boundary. UI work extends `@games/ui` and existing feature patterns. Engines remain pure; services retain authorization/transactions; repositories retain SQL. No new dependency is justified by these tickets.

## First: consequential decisions and shared recovery

### 1. Exact Deal payment consequences — P1 · CC-01

**Outcome:** what the payer confirms is exactly what leaves the table, in both editions. **Root cause/contract:** selected card values and actual attached-asset transfer are calculated independently. Introduce a pure edition-aware consequence function returning selected IDs, carried IDs, total value, bill/overpayment and affected public collections; use it for projection, commit validation and bot payment cost. Preserve current mechanics until their edition contract is separately settled.

**Owner:** `backend/app/games/deal/{table,effects,engine}.py`, `backend/app/bots/cards.py`, generated API/detail adapter, existing `DealTable`/composer. **Dependencies:** none for truthful disclosure; changing which buildings transfer requires the separate rules decision in ticket3.

**Acceptance:** replay saved legal classic2M→9M and No Mercy3M→6M records; every actual transferred ID appears before confirmation and the displayed total equals it. Bank-only, building-only, explicit property+same building, no-change overpayment, insolvent-all-assets, creditor win and stale/reconnect cases pass. No duplicate counting or concealed-hand exposure. Bot cost values everything it would lose. **Checks:** backend, contracts, multiplayer; focused Deal information/stability browser specs plus one saved legal attachment-payment flow per edition at phone/desktop.

### 2. Monotonic room snapshot ingestion — P2 shared defect · TA-01

**Outcome:** an older response cannot move the table, hand, actor or result backwards. **Root cause/contract:** normal query success is unguarded while several other writers compare revisions. One acceptance function governs GET, mutation, heartbeat and bot responses, with room/match identity and equal-revision presence semantics.

**Owner:** `apps/web/src/features/room/useRoom.ts` and shared room-query tests. **Dependencies:** none; no backend or database rewrite.

**Acceptance:** delayed GET11 resolves after action12 and cache/render remain12; repeat with bot and rematch; a different room starts correctly; equal-version presence change appears; a rejected stale action refetches authorized current state; old animation cue never replays. Preserve current intentional local selection clearing rules. **Checks:** frontend unit/type checks and focused room/recovery browser tests; multiplayer only if server contract changes.

### 3. Explicit Deal/Sea Salt rules decisions — P1 contract decisions · CC-02 / MBP-01

**Outcome:** engine rules, declared edition and in-app explanation agree. **Decision A:** identify classic Deal printing/reference and whether own-turn Just Say No consumes a play, including a counter after the third ordinary action; independently pin building transfer rules. **Decision B:** choose Sea Salt stock-exhaustion behavior before/after Stop/Last Chance, acknowledging publisher text/licensed implementation differences. No universal-rule allegation should substitute for that decision.

**Owner:** game rules manifests/module READMEs and pure engine/options/effects. **Dependencies:** identified primary edition or explicitly labelled house convention before mechanics edits. Preserve the approved No Mercy money deck; its approval is not a decision about every other rule.

**Acceptance:** agreed contract names source/convention; classic legal third-play replay and counter-counter/all-player rent/discard cleanup agree; Sea Salt12 legal boundary probes plus stock-one/Fish/Boat/four-Mermaid cases match independent expected outcomes. Current choice consequences are visible even where mechanics remain. **Checks:** backend, contracts when version/detail changes, focused browser and saved rare-branch acceptance. Do not merely rewrite expected tests to current behavior.

### 4. Rummy declaration witness and scoring guidance — P1 information risk · CC-03

**Outcome:** a player understands validity, unmatched cards and penalty before declaring or dropping. **Root cause/contract:** visual groups are local organization; the server searches a partition without an explanatory witness. Extend pure meld analysis for the post-discard hand and project a private result: pure sequence, second sequence, melds, unmatched IDs and scoring gate. Keep organization explicitly nonbinding or deliberately change its contract with separate evidence.

**Owner:** Rummy `melds.py`/engine, private typed detail, `RummyTable` and result view. **Dependencies:** none; do not build a second browser rules engine.

**Acceptance:** 13/14-card, printed/wild/natural-joker, distinct-suit set, A23/QKA/invalid KA2, pure/no-second gate and20/40/80 cases show correct witness/penalty. Editing/clearing groups remains usable at all widths. Complete natural saved declaration at2 and6 seats through result, refresh, history and rematch; drop-ended matches do not satisfy this. **Checks:** backend, contracts, multiplayer, targeted browser plus those saved declarations.

### 5. Restore Tarot question on failed-reading retry — P2 recovery · TA-02

**Outcome:** refresh/retry preserves the user's intended question as well as the saved spread/chart. **Root cause/contract:** returned saved question is never hydrated. Adopt once for current match unless the user has edited or explicitly cleared; no cross-match reuse.

**Owner:** `TarotTable.tsx` and existing Tarot recovery browser tests. **Dependencies:** none; retain ephemeral raw birth fields.

**Acceptance:** synthetic nonempty question + failed provider → refresh → visible exact question → retry with and without chart; deliberate edit/clear wins; rematch blank; no local-storage/public-history/log leakage. Mock provider to avoid unnecessary paid calls. **Checks:** frontend types/unit, focused `tarot-astrology.spec.ts`; isolated reading persistence if contract changes.

## Next: complete decision information and result explanations

### 6. Exact pending targets, causes and public actors — P2 · CC-04/05/07

**Outcome:** a reaction names what will happen and to whom. **Contract:** allowlisted public pending kinds/asset IDs/exchange direction for Deal; distinct roulette vs opening-Wild context and direction/next actor for Uno; public Blind/Seen state and named sideshow parties for Teen Patti. Do not serialize raw pending engine objects.

**Owner:** respective projections/options and existing `DealTable`, shared `CardTable`, `PlayerStrip`/casino table. **Dependencies:** generated typed detail; reuse ticket1 quote where payment appears.

**Acceptance:** three-counter chain/Forced swap/Breaker exact set, hidden-hand-effect category only; roulette24→25 elimination, wilds not stopping roulette, two-seat reverse and 7/0; accepted/declined/tied sideshow with correct participants after refresh. Clear/cancel/inspect never commits. **Checks:** backend, contracts, multiplayer and targeted information browser specs at four widths.

### 7. Exact Gem Market spend and forced phases — P2 · MBP-02/07/09

**Outcome:** chosen development shows effective spend, gold use and resulting wallet; forced return/patron instructions match the phase. **Contract:** server purchase quote based on permanent discounts and actual token policy; derive remaining row counts from public data.

**Owner:** Gem Market pure purchase helpers/projection, API adapter and `GemsTable`. **Dependencies:** none; original inventories/art identity retained.

**Acceptance:** free/discounted/mixed-gold/unaffordable/reserved purchase, return excess exactly, eligible patron choice and depleted tier all render correctly. Match quote to committed wallet; no invalid buy action during forced return. **Checks:** backend/contracts, targeted Gem browser information and one saved purchase/forced-return sequence.

### 8. Authoritative round/result explanations — P2 · CC-06/08/09 / MBP-04/06

**Outcome:** players can explain why a round/match ended and how their score changed. **Contract:** game-specific public result detail, not one generic winner schema. Skyjo ordered remaining final actors + round ledger; Blackjack active hand and per-hand/insurance returns; Hold'em best five/tie/pot/refund/odd-chip allocation; Gang declared vs evaluated rank and inversion; Four/checkers/boop winning cells/reason.

**Owner:** respective engines/projections/results, existing casino/board/Skyjo/Gang UI. **Dependencies:** generated contract; no browser winner recomputation. Hold'em unequal-stack capability fixtures stay labelled synthetic until a product mode naturally reaches them.

**Acceptance:** Skyjo queue2/8 seats and equal-positive/zero/negative closer; insured natural and four-hand split/double/ace limits; tied pots/refunds/odd chips; Gang kicker/board tie; all Four directions/draw, checkers blockade/repetition/quiet draw and both boop wins. Reasons survive refresh and reduced motion. **Checks:** backend/contracts/multiplayer plus targeted result browser cases. Normal completion alone does not close these branches.

### 9. Correct privacy copy and inspectable public cards — P2 · MBP-03/05 / CC-10

**Outcome:** instructions match what is currently public, and relevant public information is available before commitment. Gang changes “only you” wording after reveal. Sea Salt compact cards provide tap/focus/pointer effect inspection without taking the card. Shithead shows the public same-rank pile tail needed to anticipate a burn, including transparent-three semantics.

**Owner:** `GangTable`, `PaperTable`/`PaperPlayingCard`, `ShitheadTable` and shared existing inspection primitives. **Dependencies:** none unless new detail is required; do not reveal hidden pile interiors or blind cards.

**Acceptance:** all14 Paper families readable before committing, inspector dismissal unchanged; Gang before/after reveal correct; Shithead three-card rank tail/transparent three/ten burn/pickup clear. Keyboard and touch tested at320/390, not only hover. **Checks:** frontend types/tests, game information browsers and source privacy checks where projections change.

## Then: responsive interaction and presentation

### 10. Board overview and visible essential alternatives — P2 · NV-01/02

**Outcome:** first-time phone users can survey the whole board and find every legal alternative. **Root cause:**44px minimum targets exceed narrow board container; fixed160px decision area plus tablet single-column choices conceals alternatives. Compare compact complete-board vs explicit pan/overview within current UI; preserve usable target sizes and keyboard focus.

**Owner:** shared board styles/components, `DecisionDock`/stable action layouts. **Dependencies:** real touch/zoom prototype acceptance before choosing final dimensions; don't install a zoom/UI library by default.

**Acceptance:** first/last columns and Mancala stores/pits discoverable at320, four Uno colours immediately apparent at320/390/768/1440, long menus signal continuation, focused action scrolls into view,200% zoom operable, no card/board shift while selecting. Preserve verified Four keyboard reach. **Checks:** existing stable-table/midgame browser specs plus manual keyboard/touch/zoom evidence. A root-overflow assertion alone is insufficient.

### 11. boop graduation touch preview and purposeful table space — P2/P3 · MBP-08 / NV-03

**Outcome:** consequential graduation can be inspected on touch, while ordinary placements remain direct. Select exact triplet → preview → confirm; clear/cancel retains board. Then optimize empty decision/hand space only with normal-height viewport evidence, especially Deal/Shithead and Rummy group lanes.

**Owner:** `BoopTable` and existing per-family workspace styles. **Dependencies:** tickets4/10 inform group/viewport patterns; tall3300px screenshots must not dictate vertical dimensions.

**Acceptance:** overlapping triplets, mixed pieces and eight-piece single return preview the exact selection at all widths; keyboard parity; long names inspectable without adding repeated labels; stable interaction footprint and meaningful first fold. **Checks:** targeted frontend/browser; pure boop tests only if action contract changes.

### 12. Selective Tarot art and crop corrections — P2 quality · TA-03

**Outcome:** numbered imagery and visible motifs agree with the card identity. Correct reviewed Two/Six/Eight Cups and Eight/Nine Pentacles cells/focal boxes; retain palette, masters, untouched cards and distinct identities.

**Owner:** original art derivatives/registry and `tarot-artwork.ts`; review per-ID inventory. **Dependencies:** art acceptance with actual browser frame, not a blanket deck regeneration.

**Acceptance:** intended objects/motif count visible in source and320/390/1440 frame; names/crowns/faces intact; no adjacent atlas bleed; all78 IDs present/distinct; original sources preserved. **Checks:** asset/contract inventory, relevant frontend/browser screenshots plus human symbolic review. Hash/rectangle checks cannot count pictured objects.

## Evidence, product boundaries and operational follow-up

### 13. Historical-time precision and chart reference matrix — P2 evidence/labeling · TA-04

**Outcome:** distinguish ephemeris precision from historical civil-time confidence. Keep pinned IANA gaps/folds and explicit True Chitrapaksha/whole-sign conventions; disclose pre1970 locality uncertainty concisely in preview.

**Owner:** astrology models/timezone calculation documentation, `AstrologyForm`, numerical fixtures. **Dependencies:** independent source for any historical exception before special-case logic.

**Acceptance:** pre1970 synthetic note; modern input stays concise; explicit offset/convention inspectable; fold/gap unchanged; selected multi-epoch/body/angle/retrograde/cusp cases compared independently with documented tolerances. Retain fresh15-position JPL evidence without claiming all dates/bodies. **Checks:** backend astrology tests and focused chart browser; no raw birth-field persistence.

### 14. Character usage basis and bounded reading-quality evaluation — P2 provenance/quality · TA-05

**Outcome:** active images have a documented approved usage basis and readings are useful beyond schema correctness. Preserve honest44 copyright-reference/3 public-domain/1 licensed distinctions; obtain suitable usage basis or cleared depiction when required. No legal conclusion is implied by current attribution alone.

**Owner:** character manifest/credits and product content evaluation. **Dependencies:** actual rights evidence before relabelling any asset; provider configuration/budget verification before fresh live eval.

**Acceptance:** each active image depicts the actual fictional character with accurate source/credit/usage basis; no performer/cosplay substitute. A small nonpersonal ordinary/Western/Vedic/Both evaluation matrix scores useful grounded advice, distinct quirky interpretation,1–2 accurate character parallels, varied choices and exact placement grounding. Save outputs privately with safe summaries; no topic-specific prompt patch accumulation. **Checks:** asset registry/hash/contract, mocked schema tests, bounded real semantic evaluation and saved readback when authorized.

### 15. Waiting-member visibility contract — P3 boundary clarity · TA-06

**Outcome:** docs and projection agree on whether a waiting member receives the narrow public casino cue. Choose participant-only match data or explicitly allowlisted member-visible cue; keep outsider denial and hidden-state exclusion.

**Owner:** `rooms/views.py`, `public_actions.py`, `APP_FLOW.md`/`BACKEND_STRUCTURE.md`. **Dependencies:** product boundary decision, not a speculative security rewrite.

**Acceptance:** participant/late member/outsider fixture fields exactly match chosen promise; no hand/deck/private reading or raw action content; no expansion of roles implied. **Checks:** isolated multiplayer/projection tests, contracts if shape changes, focused late-join browser.

### 16. Diagnose local heartbeat503 before load claims — P2 evidence gap

**Outcome:** distinguish proxy timeout, upstream connection pressure and worker/transaction latency with safe evidence. Retain original failed run and successful sequential continuation. Current source uses SQLAlchemy NullPool; do not assert an application pool queue exhausted.

**Owner:** verification/proxy/backend operations; `tests/browser/helpers.ts`, same-origin proxy and aggregate request diagnostics only if a concrete instrumentation gap needs code. **Dependencies:** reproducible bounded workload and exact endpoint/status/duration/error-class collection, without credentials/private state.

**Acceptance:** parallel workload with documented request count produces either a reproducible classified503 or a candid non-reproduction result; HTTP failures counted separately from thrown transport retries; all task rooms close. Never retry possibly committed mutations or raise timeouts simply to turn tests green. **Checks:** targeted transport tests and bounded local concurrent run; hosted load/rollout claims require separate explicit live evidence.

### 17. Close the remaining experience-specific proof gaps — acceptance work, not a feature rewrite

**Outcome:** rare outcomes and human usability are supported by the right kind of evidence. Start with natural saved Rummy declaration, legal Deal attachment payment/counter chain, Blackjack insurance/resplit, Sea Salt chosen exhaustion rule, simultaneous6nimmt/Gang endings, boop alternate wins and actual delayed-response room recovery. Use `coverage.md` as the checklist, not raw test count.

**Owner:** each game owner + shared verification owner. **Dependencies:** related tickets' contracts fixed; no exhaustive cross-product run before a specific gap justifies it.

**Acceptance:** each scenario records legal reachability, actor-authorized view, persisted outcome, refresh/history/rematch, relevant device interaction and clean QA-room closure. Add screen-reader/200–400% zoom and a novice decision-comprehension pass for the changed flow. Mark remaining branches explicitly; do not claim all27 perfect because ordinary matches finish. **Checks:** smallest affected named groups and focused browser/live checks. For release, verify actual deployment revision and cloud permissions; this audit's403 limitation is not a substitute.

## Suggested delivery sequence and stop conditions

1. Ship independently testable corrective increments: exact payment disclosure, monotonic room ingestion, saved Tarot draft recovery. Resolve edition decisions in parallel with evidence; do not couple every rule change into one release.
2. Add Rummy witness and game-specific pending/quote contracts, then result ledgers. Contract generation and privacy tests precede UI consumption; acceptance uses exact legal fixtures and saved outcomes.
3. Apply responsive interaction improvements and selective art corrections after consequential information is present, so layouts are evaluated with real content.
4. Close the specific semantic, accessibility, provenance, concurrency and production evidence gaps. A blocked external decision can remain documented without stopping independent local work.

For every increment, preserve private rooms, untimed turns, optional accounts, approved house rules, original Gem Market/Word Agents inventories, authorized bounded bots and durable match history. No generic rewrite, additional package, real-money feature, public matchmaking or LLM bot is part of this plan.
