# Independent card and casino review — 2 November 2026

Scope: Deal, Deal No Mercy, Uno, Uno No Mercy, Hold’em, Teen Patti, Blackjack, Rummy, Skyjo and Shithead. This is a contribution to the overall 27-experience audit, not a separate release certification. Application code, rules, settings, databases and production were not changed.

## Verdict

The rules engines and shared table components provide a substantial base worth retaining. The strongest immediate defect is in Deal payment: a player can confirm **2M selected and lose 9M of assets**, because linked buildings transfer without being included in the preview. This was reproduced through ordinary legal play in both editions, not merely by constructing an impossible state. A second priority is deciding and documenting the classic edition’s counter rule: the implementation prevents a counter after the player’s third play, contrary to the current official Hasbro FAQ used as a reference.

Most remaining problems concern information at a consequential decision. Rummy’s groups do not tell players whether they have the required sequences or what their declaration will do; No Mercy roulette asks the wrong kind of colour question; Deal counters omit the exact affected property; Teen Patti omits public seen states and sideshow parties; Skyjo omits who still has a final turn. Casino settlement explains too little of the result. These are specific projection and presentation gaps, not grounds for replacing the engines or making every game use one table layout.

The Hold’em side-pot lead needs qualification. Live projections lack pot eligibility, but a normal match starts every seat with 200 chips and consists of one hand. The unequal-stack short-all-in scenarios in existing tests are engine-capability fixtures, not proof that ordinary rooms currently reach the same condition. No incorrect Hold’em payout was established in this review.

## Evidence levels and limits

- **Current source:** engines, module READMEs, deck definitions, UI components, typed detail adapters, bot policies and focused test source were inspected at the current checkout. Parent audit records repository and serving revisions in `current-state.json`.
- **Fresh pure-engine reproduction:** the JSON files below use unchanged engines. Deal legal trajectories start at ordinary seeded setup, maintain card inventory, and apply legal actions. The saved projections contain authorized views only. They are not saved rooms, HTTP actions or production evidence.
- **Fresh rendered evidence:** parent captured current `/design/midgame` projections at 320, 390, 768 and 1440 pixels. This reviewer inspected all ten 390-pixel screenshots plus Deal, Rummy, Skyjo and Blackjack at 1440. These are design harness renders, not actual saved-match UI. Harness selectors/header and the Next development indicator are not counted as product defects.
- **Historical evidence:** `game-info-2026-11-02/information-coverage.json`, `docs/RULE_AUDIT.md`, module verification notes and existing tests supplied leads. A scenario count, an available action named `declare`, or an old PASS is not current proof of a successful declaration or every branch.
- **Independent rules research:** current publisher instructions, current Hasbro FAQ, producer/operator rules and documented traditional variants were read. Reference conflicts and edition choices are called out below.
- **Not established here:** current hosted end-to-end matches, all rare branches in a browser, all animation/reconnect behavior, every keyboard/touch interaction, or formal accessibility conformance. Parent owns shared room/multiplayer, production and broad verification evidence.

Fresh artifacts:

| Artifact | What it proves |
|---|---|
| [card-casino-legal-payment-deal.json](/Users/rudraghav/games/docs/evidence/independent-audit-2026-11-02/card-casino-legal-payment-deal.json) | Three-seat seed 2, step 114: ordinary legal trajectory reaches payment selecting 2M; 9M transfers, including an unselected House and Hotel. Includes full replay and pre/post public projections. |
| [card-casino-legal-payment-deal-no-mercy.json](/Users/rudraghav/games/docs/evidence/independent-audit-2026-11-02/card-casino-legal-payment-deal-no-mercy.json) | Three-seat seed 1, step 99: ordinary legal trajectory selects 3M; 6M transfers including an unselected Shack. |
| [card-casino-legal-third-counter.json](/Users/rudraghav/games/docs/evidence/independent-audit-2026-11-02/card-casino-legal-third-counter.json) | Classic seed 12: actor banks twice, plays Debt Collector third, target counters; actor still holds Just Say No but can only accept. Ordinary setup/legal replay. |
| [card-casino-natural-rummy.json](/Users/rudraghav/games/docs/evidence/independent-audit-2026-11-02/card-casino-natural-rummy.json) | Fresh seeded natural bot matches at 2 and 6 seats end by valid declaration after 38 and 44 actions respectively, with zero drops, conserved cards and zero-sum scoring. Pure engine only. |
| [card-casino-probes.json](/Users/rudraghav/games/docs/evidence/independent-audit-2026-11-02/card-casino-probes.json) | Controlled, conserved payment fixtures; missing Deal reaction target metadata; Teen sideshow parties absent from current detail; synthetic unequal-stack Hold’em live projection. These are explicitly controlled probes. |

The natural Rummy proof is stronger than the historical browser matches that ended by dropping, and different from a fixed winning-hand declaration test. It still does not prove the declaration outcome traverses API persistence, results, refresh, profile/history and rematch correctly today.

At handoff, the parent audit reports **40 fresh full-match browser cases for these ten games** (minimum/maximum seats × phone/desktop), including saved result, profile, rematch and switching with the group. The parent owns those logs and final verification receipt; they were not executed by this reviewer. Those fresh Rummy browser matches still ended through dropping. Consequently the rare-branch and natural-declaration limitations below remain, while the parent report supplies current ordinary full-match lifecycle evidence.

## Prioritized findings

### CC-01 — P1: Deal payment confirmation omits assets that actually transfer

**Game/state → issue:** both Deal editions, payment of a bill with a property carrying a building. The UI adds only selected card values. The engine transfers the selected property and all buildings linked to it. The player’s apparent exact payment can therefore be a much larger loss. Legal examples are 2M → 9M in classic and 3M → 6M in the approved No Mercy house format.

**Evidence:** [DealTable.tsx:37](/Users/rudraghav/games/apps/web/src/games/deal/DealTable.tsx:37) calculates selected value; [DealTable.tsx:293](/Users/rudraghav/games/apps/web/src/games/deal/DealTable.tsx:293) labels selected amount, overpayment and the Pay button from that total. [effects.py:76](/Users/rudraghav/games/backend/app/games/deal/effects.py:76) validates only selected values, then [table.py:66](/Users/rudraghav/games/backend/app/games/deal/table.py:66) automatically carries attached buildings. [engine.py:256](/Users/rudraghav/games/backend/app/games/deal/engine.py:256) does not project attachment links or a transfer quote. Both fresh legal replay files prove reachability. The earlier controlled probe is corroboration, not the only evidence.

**Impact/root cause:** irreversible, unannounced loss of assets in a game where exact collateral choice matters. The action’s selected IDs, actual transferred IDs, payment arithmetic and bot valuation do not share one authoritative consequence calculation. The bot’s payment search similarly scores face values without linked loss in [cards.py:72](/Users/rudraghav/games/backend/app/bots/cards.py:72).

**Proposed change/owner:** a pure, edition-aware transfer/payment quote in the Deal rules layer; project its public consequences through the generated contract/detail adapter; render selected assets, carried buildings, total value actually leaving, overpayment and affected collections in the existing `DealComposer`. Reuse the same consequence calculation in bot costs. Independently resolve classic building transfer rules before changing mechanics; do not silently apply No Mercy Shack behavior to classic. The confirmed defect is that preview and committed transfer disagree regardless of that rules choice. Hasbro’s [payment FAQ](https://hasbro-new.custhelp.com/app/answers/detail/a_id/944/) makes collateral choice the payer’s decision.

**Acceptance:** replay both legal records and show every transferred card before confirmation; quoted IDs and committed IDs must match exactly. Cover a selected property alone, selected building alone, property plus the same building explicitly selected (no double counting), bank-only payment, no-change overpayment, insolvency/all assets, and reconnect/stale version. A creditor win caused by transferred assets must be explained after resolution. No hidden hand or deck data enters the quote.

### CC-02 — P1 rules-contract decision: classic own-turn counters conflict with the stated reference

**Game/state → issue:** classic actor’s third ordinary play is countered. Although holding Just Say No, that actor cannot counter back. [options.py:202](/Users/rudraghav/games/backend/app/games/deal/options.py:202) suppresses the option at zero plays; [effects.py:68](/Users/rudraghav/games/backend/app/games/deal/effects.py:68) charges a play for an own-turn No. Existing test expectations encode this behavior, so a passing test does not settle whether the chosen edition is correct.

**Evidence/classification:** `card-casino-legal-third-counter.json` is a fresh legal reproduction. Current official [Hasbro FAQ 953](https://hasbro-new.custhelp.com/app/answers/detail/a_id/953/) states that Just Say No does not count toward the three-card maximum; [FAQ 952](https://hasbro-new.custhelp.com/app/answers/detail/a_id/952/) permits counter-counteraction. The module names classic B0965 as its baseline. Newer unofficial summaries describe edition differences; no newer primary edition instruction was independently verified here. Therefore this is a **confirmed conflict between implementation and the cited classic reference**, not a claim that every regional/newer printing has the same rule.

**Impact/root cause:** legal choices depend on an undocumented edition interpretation; holding a counter gives a misleading expectation. A shared family rule is hardcoded without an explicit edition-specific counter budget contract.

**Proposed change/owner:** decide the exact classic printing, identify it in rules version and concise in-app rules, then align engine and independent expected-state tests. Preserve the approved No Mercy money inventory; do not treat that approval as automatically choosing every counter rule. Deal engine/options/effects and game-manifest rules own this decision.

**Acceptance:** for the chosen edition, test a counter after the third play, two further counters, each opponent in an all-player rent, ordinary play budget before/after resolution, and any pending discard-to-seven. Render why a held counter is unavailable if the chosen published variant limits it. Retain the legal replay as regression input.

### CC-03 — P1 decision information: Rummy grouping has no connection to declaration guidance

**Game/state → issue:** the player can arrange four labelled groups but receives no pure/impure sequence verdict, unmatched-card count, estimated loss, or explanation of a declaration candidate. Every permitted discard also offers Declare. The eventual server check ignores those UI groups and searches for any valid partition. A novice can believe their visual groups are the submitted declaration, or press Declare and receive an 80-point penalty without useful diagnosis.

**Evidence:** fresh [390-pixel Rummy screen](/Users/rudraghav/games/docs/evidence/independent-audit-2026-11-02/screenshots/rummy-390.jpg) and [1440-pixel screen](/Users/rudraghav/games/docs/evidence/independent-audit-2026-11-02/screenshots/rummy-1440.jpg). [RummyTable.tsx:10](/Users/rudraghav/games/apps/web/src/games/rummy/RummyTable.tsx:10) stores group assignments only in component state; [engine.py:72](/Users/rudraghav/games/backend/app/games/rummy/engine.py:72) offers declaration for every candidate; [engine.py:107](/Users/rudraghav/games/backend/app/games/rummy/engine.py:107) adjudicates independently and [engine.py:147](/Users/rudraghav/games/backend/app/games/rummy/engine.py:147) projects only the wild rank. The pure helpers already know validity and best deadwood, but return no explanatory witness: [melds.py:55](/Users/rudraghav/games/backend/app/games/rummy/melds.py:55).

**Impact/root cause:** costly mistakes and weak learning feedback; grouping is presentation state while adjudication is automatic. Refresh also loses local grouping. This is not evidence of an incorrect declaration validator: fresh min/max natural declaration victories passed.

**Proposed change/owner:** extend the pure meld analysis to return a private witness: a pure sequence, second sequence, other valid melds, unmatched IDs, and the scoring gate. Analyze the hand remaining after the selected discard. Explain whether visual groups are organizational or binding; the current implementation uses automatic best partition. Keep one source of truth in the backend and map typed output into `RummyTable`; do not reimplement Rummy rules in the browser. Persist organization by match/viewer or explicitly label its local scope. Expose the invalid-declaration cost in the decision itself. A “Declare” confirmation can retain the intentional possibility of false declaration while making its consequence explicit.

**Acceptance:** 13/14-card cases; two pure sequences, pure plus impure, printed/wild jokers, a wild used naturally in a pure sequence, repeated-suit set rejection, A23 and QKA allowed but KA2 rejected, one-pure-but-no-second-sequence scoring gate, open-discard return restriction, 20/40/80 drops and capped deadwood. Result should show the accepted partition and each loser’s scoring basis. Complete one natural saved-match declaration at 2 and 6 seats through refresh, result/history and rematch.

### CC-04 — P2: a Deal counter does not show exactly what is being countered

**Game/state → issue:** a pending Sly/Forced/Breaker reaction shows actor, target, action kind and sometimes amount, but not the selected property, offered property, or exact collection. A current forced-deal counter screenshot says “Action blocked / Noor → Sam”; it requires remembering earlier selection or opening activity to understand the exchange.

**Evidence:** [fresh Deal screen](/Users/rudraghav/games/docs/evidence/independent-audit-2026-11-02/screenshots/deal-390.jpg); [engine.py:213](/Users/rudraghav/games/backend/app/games/deal/engine.py:213) omits `take`, `give` and pile from `pending_action`; [DealTable.tsx:274](/Users/rudraghav/games/apps/web/src/games/deal/DealTable.tsx:274) renders the summary. The controlled Sly probe confirms absent target metadata. Public activity does retain selected public assets; this is a current-decision gap, not complete loss of event information.

**Impact/root cause:** counter resources are spent without the important consequence in the reaction surface. A generic pending summary omits game-specific public target data.

**Proposed change/owner:** extend the authorized pending DTO with public asset IDs/pile and exchange direction, then reuse existing collection/card rendering and highlight exact targets during counter/counter-counter. Keep modeless “View table” behavior. Hidden-hand Tough Luck must show its public category/target only until cards are legitimately revealed; never copy private pending engine fields wholesale.

**Acceptance:** Sly, Forced, Breaker, all-player rent, No Mercy repossession/distribution, targeted hidden-hand effects and a three-counter chain. Refresh and viewing another collection must retain the exact pending consequence and available response; closing the composer must not commit anything.

### CC-05 — P2: Uno No Mercy roulette asks a misleading colour question; direction is absent

**Game/state → issue:** the roulette recipient sees “Choose the colour for the next play.” The immediate consequence is drawing until that colour appears (wilds do not stop it), with possible 25-card elimination. The generic colour-choice text fits an opening Wild but understates roulette. Both editions project direction without showing it in the table/seat strip.

**Evidence:** [fresh roulette screen](/Users/rudraghav/games/docs/evidence/independent-audit-2026-11-02/screenshots/uno-no-mercy-390.jpg); [CardTable.tsx:15](/Users/rudraghav/games/apps/web/src/games/shared/CardTable.tsx:15) uses any `choose` action as a generic colour choice. [engine.py:339](/Users/rudraghav/games/backend/app/games/uno/engine.py:339) includes direction but not typed pending cause. `PlayerStrip` stays in fixed seat order. Existing card-effect descriptions are otherwise useful, including the two-player reverse exception and challenge cost.

**Impact/root cause:** a significant risk is omitted from the moment of choosing; reversed turn order and zero hand rotation are hard to anticipate. The UI infers decision type from a generic action verb.

**Proposed change/owner:** project a typed pending kind and use contextual instructions: recipient chooses the draw-until colour; show the elimination threshold. Add a concise direction/next-recipient cue using current order and active seats. Reuse `CardTable`, `PlayerStrip` and card information helpers.

**Acceptance:** opening Wild and roulette produce different copy; 24-card recipient crossing 25, wilds while drawing, stock recycling, eliminated-seat skip, 3+ player reverse, two-player Reverse +4 self-penalty, 7 exact target and 0 direction. Do not fabricate intermediate animation states when the server commits the whole draw atomically; animate committed outcomes with reduced-motion support.

### CC-06 — P2: Skyjo hides the remaining final-turn queue and round-score explanation

**Game/state → issue:** after one player closes, “Everyone else gets one final turn” stays unchanged as opponents finish. The current actor is visible, but who has already had that final turn is not. Completed round views show cumulative points without the just-completed grid total and closer penalty.

**Evidence:** [fresh eight-seat final-turn screen](/Users/rudraghav/games/docs/evidence/independent-audit-2026-11-02/screenshots/skyjo-390.jpg). [engine.py:128](/Users/rudraghav/games/backend/app/games/skyjo/engine.py:128) maintains `remaining` and calculates `round_scores`; [engine.py:228](/Users/rudraghav/games/backend/app/games/skyjo/engine.py:228) projects neither. [SkyjoTable.tsx:91](/Users/rudraghav/games/apps/web/src/games/skyjo/SkyjoTable.tsx:91) uses the generic sentence. Existing final-turn, column removal and positive-only doubling tests support the engine’s logic; no fresh scoring defect was found.

**Impact/root cause:** players cannot confidently decide whether they will act again or explain a doubled score. Relevant public state is dropped at the projection boundary.

**Proposed change/owner:** publish remaining final actors in actual turn order and an authoritative round ledger: revealed value, removed columns, closer multiplier, round delta and cumulative total. Place a compact “Final turns: Sam → Noor → Alex” line beside the current decision, marking completed seats in the existing strip. Retain the stable own grid and opponent mini-grids.

**Acceptance:** at 2 and 8 seats, arbitrary closing seat, each opponent acts exactly once, queue survives refresh and shrinks correctly, closing player does not appear again. Explain equal positive closer, strictly-low closer, zero/negative closer, final-reveal column removal and cumulative threshold ties.

### CC-07 — P2: Teen Patti public stakes and sideshow parties are underspecified

**Game/state → issue:** the private panel shows the viewer’s Blind/Seen state and base stake, but other seats omit their public seen state. “Request sideshow · 2” contains no named opponent; acceptance presents Accept/Decline without the requester in current match detail. It is possible to reconstruct some context from separate activity after the request.

**Evidence:** [fresh blind screen](/Users/rudraghav/games/docs/evidence/independent-audit-2026-11-02/screenshots/teen-patti-390.jpg); [engine.py:78](/Users/rudraghav/games/backend/app/games/teen_patti/engine.py:78) calculates stake ranges and implicit previous-neighbor sideshow; [engine.py:180](/Users/rudraghav/games/backend/app/games/teen_patti/engine.py:180) omits seen/pending parties from the projected players/detail. `card-casino-probes.json` records target-empty sideshow action and requester-absent response detail. [CasinoTable.tsx:293](/Users/rudraghav/games/apps/web/src/games/casino/CasinoTable.tsx:293) renders only own Blind/Seen/Stake.

**Impact/root cause:** player cannot judge public opponent commitment or the exact comparison before spending chips/accepting. The action resolver knows these facts; the projection does not carry them.

**Proposed change/owner:** project public seen status, wager range and named sideshow requester/recipient; show “Compare with [name], pay [n]; requester loses a tie” at the decision. Keep cards hidden from everyone not entitled to see them. Engine/typed casino detail/CasinoTable own this work.

**Acceptance:** 3–6 active seats, folded seats between neighbors, mixed blind/seen players, request rejected/accepted, equal hands, disabled sideshows, two-player Show eligibility, and pot-cap-triggered showdown. Verify names survive refresh and chips remain conserved.

### CC-08 — P2: Blackjack needs hand-specific outcomes and accurate active-hand context

**Game/state → issue:** the detail includes own hand cards/bets and a global `hand_index`, but not per-hand result, insurance stake/result or payout explanation. The UI labels a viewer’s same-index hand “active” even while another seat is acting. Result presentation is primarily aggregate profit; `CasinoSettlement` handles only Hold’em. Insurance cost appears in a button but its 2:1 separate-bet consequence is not explained at that moment.

**Evidence:** [engine.py:235](/Users/rudraghav/games/backend/app/games/blackjack/engine.py:235); [CasinoTable.tsx:77](/Users/rudraghav/games/apps/web/src/games/casino/CasinoTable.tsx:77), [CasinoTable.tsx:318](/Users/rudraghav/games/apps/web/src/games/casino/CasinoTable.tsx:318); [CasinoSettlement.tsx:6](/Users/rudraghav/games/apps/web/src/games/casino/CasinoSettlement.tsx:6). Active-hand ambiguity is source-confirmed, not a claim that server actions can be made out of turn. Current split-ready screens prove the visible per-hand composition, not rare resplit/insurance end-to-end behavior.

**Impact/root cause:** players cannot account for chips across split/doubled/insured hands, and waiting viewers get a confusing highlight. Aggregate state is used where each hand has a separate lifecycle.

**Proposed change/owner:** backend records/project per-hand status, stake, natural flag, outcome and payout; insurance has its own stake/payout row. Active status applies only to current seat and hand; completed hands show their outcome. Preserve 3:2 natural, ordinary split 21, dealer concealment, explicit soft-17 setting and the existing hand rail. Reuse a settlement-list primitive with game-specific typed data, not a generic winner calculator.

**Acceptance:** normal win/loss/push, dealer peek/natural, insured and uninsured natural, unaffordable insurance, split/double/resplit to four, split aces no resplit, ordinary split 21, both soft-17 settings, and two viewing clients while turn passes. Every hand and insurance row reconciles to aggregate net profit; no dealer hole card appears early.

### CC-09 — P2 capability/readiness: Hold’em live contribution/eligibility and winning reason are absent

**Game/state → issue:** a live view contains total pot and current-street bets, but not cumulative contributions or eligible layers. Settled pots/refunds are visible, but split shares/odd-chip recipients and winning-hand comparison are not explained individually.

**Evidence and qualification:** [engine.py:212](/Users/rudraghav/games/backend/app/games/holdem/engine.py:212) projects live aggregate pot and `pots`, which is populated at settlement. The controlled unequal-stack flop probe shows pot 120 with empty detail pots; it intentionally mutates stacks and is **not a normal-room reachability proof**. Ordinary setup gives all players 200 and rematch resets stacks. [CasinoSettlement.tsx:14](/Users/rudraghav/games/apps/web/src/games/casino/CasinoSettlement.tsx:14) lists winner names and total pot, plus refunds separately. No incorrect settlement was found.

**Impact/root cause:** decisions become opaque when unequal-stack capabilities are used, and even reachable ties/results lack a clear explanation. Engine settlement data is better than its rendered explanation; live settlement preview is absent.

**Proposed change/owner:** keep this behind current correctness/decision fixes. Project public cumulative contributions and, where meaningful, provisional eligible layers. Return settled award amounts, odd chips, winning five-card rank/kicker explanation and unmatched refunds. Never reveal folded hands to justify a win. Use the same pure pot helper for live summary and settlement so the client does not calculate eligibility.

**Acceptance:** equal-stack ordinary match; unequal-stack controlled fixture distinctly labelled; folded contributors; one funded player versus only all-ins; cumulative short raises; uncalled excess; tied board; odd chip clockwise from button. Total awards plus refunds exactly match contributions, and result copy makes the tie-break legible.

### CC-10 — P2: Shithead hides the visible pile tail needed to anticipate four-card burns

**Game/state → issue:** engine projects the most recent twelve public pile cards, but UI shows only the top face and total pile count. A player needs the consecutive top-rank count to know whether their equal-rank play burns the pile; the generic “Four equal · burn” reminder does not expose that state.

**Evidence:** [engine.py:296](/Users/rudraghav/games/backend/app/games/shithead/engine.py:296) projects public tail; [ShitheadTable.tsx:286](/Users/rudraghav/games/apps/web/src/games/shithead/ShitheadTable.tsx:286) renders only top/count/comparison. The current screenshot has an empty pile, so it supports the composition but not a populated three-equal burn case. This finding is source-confirmed; that populated browser state remains to capture.

**Impact/root cause:** useful public information already sent by the server is not presented. The engine’s transparent-three comparison and four-consecutive-physical-card distinction are otherwise explicit.

**Proposed change/owner:** show “3 queens in a row · one more burns” beside the top, with an inspectable public tail. Keep comparison rank separate when transparent threes apply. Retain clear hand → face-up → blind stages and all-escaped-player winner semantics.

**Acceptance:** one/two/three matching top cards; mixed rank breaks the run; transparent threes do not bridge a four-kind; four threes burn; ten burns independently; two resets comparison; blind failure takes the pile; last-card burn escapes without creating a turn for the escaped player. No hidden slot identity is projected.

## Current edition inventories and rules choices

The following inventory is from current source/READMEs. Independent reference comparison is linked separately; it is not a claim of universal traditional rules or boxed No Mercy certification.

| Edition/version | Seats, components and intentional choices |
|---|---|
| Deal `1` | 2–5. 106 playable cards: 20 money; 28 named properties; 11 property wilds; 13 rents; 34 other actions. Five-card start, draw 2/5 if empty, at most three plays, discard to seven, three distinct complete colours win. Banked actions stay money, hand cannot pay, no change. Complete sets protected from Sly/Forced but not Breaker; counter budget conflict is CC-02. [Module README](/Users/rudraghav/games/backend/app/games/deal/README.md). |
| Deal No Mercy `house-deck-1` | 2–5. **Approved Games house deck**, 115 playable cards, 15 debt chips (3 per player). Money18, ordinary properties28, wilds11, rents16, other actions42. Money is 5×1M, 4×2M, 3×3M, 2×4M, 2×5M, 1×10M, 1×15M. Preserve this labelled inventory; no request to reconstruct boxed G3071. Complete sets and hands can be attacked. Unpaid bill gives one available chip; debt repayment hands a card to creditor for immediate play/bank and consumes debtor play. |
| Uno `1` | 2–10. 108 cards: each colour one0/two1–9 (76 numbers), two each Skip/Reverse/+2 per colour (24), four Wild and four Wild+4. Seven-card start. Optional +2 stacking and 7/0 default off. One hand per app match; no automatic 500-point series. [Module README](/Users/rudraghav/games/backend/app/games/uno/README.md). |
| Uno No Mercy `1` | 2–6. 168: two0–9 per colour80; three each Skip/Reverse/DiscardAll per colour36; two each +2/+4 per colour16; one SkipEveryone per colour4; eight each WildReverse+4/+6/+10/Roulette32. Mandatory ascending stacking, 7 swap, 0 rotation, draw-until-playable, 25-card elimination. One hand, not optional 1,000-point series. |
| Hold’em `1` | 2–9, standard52, two hole/five board with burns; 200 free chips each, blinds1/2, one hand per match, reset stacks on rematch. No rake. Heads-up button small blind/first preflop; raise-to totals; full-raise reopening/cumulative short-all-in support; odd chips clockwise from button. [README](/Users/rudraghav/games/backend/app/games/holdem/README.md). |
| Teen Patti `1` | 2–6, standard52, three cards, 200 free chips, boot1. Trail > straight flush > straight > flush > pair > high. **AKQ then A23** is an explicit variant; no suit tie-break. Blind1–2×, seen2–4× base; base cap64/pot cap1024. Seen-neighbor sideshows default on; requester loses ties; not an all-players-seen requirement. [README](/Users/rudraghav/games/backend/app/games/teen_patti/README.md). |
| Blackjack `1` | 1–7, six52-card decks (312), 200 chips, even initial wager2–200. Natural3:2; insurance2:1; dealer peek; default stand-soft17, host may enable hit-soft17. Double on initial two including split, max4 hands, split aces one card/no resplit; split21 ordinary, no surrender. One table round per match. [README](/Users/rudraghav/games/backend/app/games/blackjack/README.md). |
| Rummy `1` | 2–6, double52 plus two printed jokers106; 13-card hand plus draw. Cut-rank wild; printed cut makes aces wild. At least two sequences including one pure; sets distinct suits; Ace low/high without wrap; jokers may act naturally. Drop20 before first turn played,40 later; invalid declare80, loss cap80. Automatic partition adjudication, no group submission. [README](/Users/rudraghav/games/backend/app/games/rummy/README.md). |
| Skyjo `1` | 2–8,150 cards: -2×5,0×15, each other value -1…12×10. Twelve cards in3×4, reveal2; highest initial sum starts, tie first seat. Equal revealed column removed; closer gets no further turn, others get one; positive closer doubled unless strictly lowest; first total≥100 ends, lowest wins; closer starts next round. [README](/Users/rudraghav/games/backend/app/games/skyjo/README.md). |
| Shithead `palace-1` | 2–5,standard52, hidden3 and six private from which choose face-up3. Optional Seven Low and Transparent Threes both off. 2 reset,10 always burn, four consecutive equal burn, refill3. Hand→face-up→blind; pickup allowed; escaped seats skipped; all escaped win, final player loses, no fabricated points. [README](/Users/rudraghav/games/backend/app/games/shithead/README.md). |

Deal named collections and rent tiers are present and useful. Current schedules are Brown2:1/2; Light Blue3:1/2/3; Pink3:1/2/4; Orange3:1/3/5; Red3:2/3/6; Yellow3:2/4/6; Green3:2/4/7; Dark Blue2:3/8; Railroads4:1/2/3/4; Utilities2:1/2. Houses add3 and Hotels4 on complete eligible sets; No Mercy Shacks add5. Wild orientation and exact collection key matter independently of colour, especially with duplicate-colour piles. The named property deck includes the ordinary US street/railroad/utility identities rather than interchangeable colour labels; keep this metadata and the existing set/rent inspector.

Classic’s remaining deck categories are Pass Go×10; Just Say No, Debt Collector, Birthday, Sly Deal, Forced Deal and House×3 each; Deal Breaker, Hotel and Double the Rent×2 each. Rents comprise ten two-colour and three any-colour. Property wilds comprise nine two-colour and two all-colour. The classic money distribution is 6×1,5×2,3×3,3×4,2×5,1×10.

No Mercy’s rents are five two-colour Rent, five two-colour Double Rent, three any-colour Rent and three any-colour Double Rent. Other actions/copies/bank value: Breaker3/3M; ForcedDebt3/2M; GoAgain3/1M; Heist3/4M; JustSayNo5/4M; MarketCrash3/4M; Fill-to-seven4/1M; Repossession2/5M; Shack3/3M; SuperSly3/3M; TaxCollector2/5M; ToughLuck3/5M; UnfairTrade2/4M; Yoink3/2M. Yoink’s payment effect is10M, distinct from its2M bank value. The approved money-deck decision is retained exactly.

## Decision and privacy inventory

| Edition | Important phases/actions inspected in current source | Information and closure contract |
|---|---|---|
| Deal | Draw/start; bank vs play; property orientation and exact destination; free rearrangement; rent tier/Double the Rent; House/Hotel; Pass Go, Birthday, Debt Collector; Sly, Forced, Breaker; target/asset choice; counter/counter-counter; payer-selected collateral/insolvency; discard-to-seven; end turn; immediate win on transfer. | Public banks/collections/played cards/counts/bills; own hand only; deck and other hands concealed. Chosen action can be cancelled before commit. Existing board remains inspectable while composer is open. CC-01/02/04 remain. Immediate three-colour winner, room results/rematch delegated to shared room flow. |
| Deal No Mercy | All common stages plus debt issue/cap/repayment/gift; rent double; Forced Debt, Go Again, Heist, Crash, Fill, Repossession keep/distribute, Shack, SuperSly, TaxCollector, ToughLuck selection, UnfairTrade bank swap, Yoink. Attacks may target complete sets. | Debt ownership/amount and public assets public; hidden-hand choice remains private until effect authorizes transfer. Creditor immediate action does not first add gift to ordinary hand. Distribution choices belong to specified player. CC-01/04 also apply. |
| Uno | Match colour/value/action; voluntary draw; play drawn card or pass; Wild colour; +4 accept/challenge; Skip/Reverse/+2; optional +2 chain and7/0 swap/rotation; UNO/catch window; opening actions; final draw penalties; recycling and score. | Own hand only, other counts, discard/colour/direction/penalty public; +4 challenge is server adjudicated without hand exposure. Final+4 preserves challenge; final+2 draws before scoring. No hidden deck order. Direction not rendered. |
| Uno No Mercy | Draw until playable; ascending draw stacking; all classic applicable actions; +4 coloured, DiscardAll, SkipEveryone, Reverse+4/+6/+10, roulette recipient choice, mandatory7/0;25 elimination; all-out winner; last-card special ordering. | Eliminated seats skipped, their hands recycled only when needed; own hand only. Final empty hand wins before7/0 transfer; roulette can eliminate during drawing. CC-05 is misleading instruction, not a fresh mechanics defect. |
| Hold’em | Blinds/preflop/flop/turn/river; check/call/fold/raise-to/all-in; bounds; cumulative short raise reopening; lone-funded-player cap; all-in runout; ranking, wheel, split pots/refunds/odd chip; showdown. | Own hole cards; community/chips/current bets public. Opponents only revealed when showdown authorizes, folded cards concealed. Server owns settlement. Live eligibility and winning reason incomplete; unequal-stack fixture scope explicitly qualified. |
| Teen Patti | Blind decision/irreversible peek; min/max bet; pack; request/reject/accept sideshow; two-player Show; rank/tie; pot-cap multiway closure. | Blind own cards hidden until peek; opponents concealed except allowed comparison/showdown. Folded stay hidden. Public seen status should be projected. Requester loses equal comparison; tied pot-cap winners need result explanation. |
| Blackjack | Betting; ace-up insurance/decline; dealer peek; hit/stand/double/split/resplit; natural/soft total/bust; split ace restriction; dealer completion; payout. | All player cards/bets public, only dealer hole concealed. Own split hand presentation already exists; “active” must be scoped to turn actor. Results need hand/insurance ledger. |
| Rummy | Stock vs open pickup; no open joker pickup; arrange/sort; discard/declare; pure/impure sequence, set/jokers/Ace; invalid declare/drop; deadwood/score; last active survivor. | Own hand/wild rank/discard public-to-viewer; opponents counts while playing, hands revealed at finished phase. Groups local and nonbinding. A successful natural declaration was freshly proven in pure min/max matches; saved/browser proof remains open. |
| Skyjo | Two opening reveals; draw discard and replace; private stock draw then replace or discard-and-reveal; hidden/revealed/removed cells; column removal; close/final queue; all reveal; penalty/cumulative rounds/next round. | Hidden grid cards concealed even from owner; removed slots distinct from concealed; drawn stock private to actor. Existing UI distinguishes these states. Remaining actors and score explanation absent despite server state. |
| Shithead | Arrange3/6; lowest opening; same-rank multi-play; refill;2/10/four-rank burn; optional7/3 interactions; voluntary pickup; face-up selection; blind flip/failure; escaped player skip; finish order/last player loss. | Own hand and everyone’s face-up cards/pile public to viewer; occupied hidden slots only, no hidden identities even to owner; stock/burn counts. Public tail exists in projection but is unrendered. No fresh rules mismatch found. |

## Coverage record and explicit remaining branches

Historical legal scenario counts are copied for inventory only; they are **not summed with current screenshots as separate proof**, and sampled continuations are not exhaustive action coverage.

| Edition | Historical legal projections / seat limits | Fresh work in this review | Still unchecked in a current saved/browser match |
|---|---|---|---|
| Deal |34;2/5 | Engine/UI/rules/test-source inspection; natural3-seat payment replay; natural third-play counter; controlled pending-target probe; inspected390/1440 renders. | Payment quote through actual request/persistence; rare multi-party counter chain after last play; building rules by exact edition; every destination/wild orientation/crowded collection at all widths; finish/refresh/rematch. |
| Deal No Mercy |36;2/5 | Independent edition inventory/effects review; natural3-seat Shack/payment replay; inspected390 render. | Every debt creditor immediate-action branch and distribution through real clients; cap/exhaustion, win during gift, counter chain; displayed exact collateral; production boxed-inventory claim intentionally not made. |
| Uno |7;2/10 | All card categories and opening/last-card branches reviewed; inspected390 challenge render. | Draw/pass, challenge correct/incorrect, UNO catch timing, optional stack and7/0 all combinations, final+4 refresh and full saved outcome at current revision. |
| Uno No Mercy |5;2/6 |168-card inventory/effects reviewed; inspected390 roulette render. | Live roulette reaching25, stock exhaustion/recycle, elimination with pending chain, final special/zero/swap/last surviving player across clients; rendered direction after multiple reverses. |
| Hold’em |8;2/9;4 streets | Source/bounds/settlement/tests review; controlled unequal-stack live probe; inspected390 river render. | Current natural raise/fold/showdown/tie UI and persisted award explanation; unequal-stack “natural” proof unavailable in equal-stack one-hand room format; no claim of live payout defect. |
| Teen Patti |6;2/6 | Source/rules/test review; controlled seen-side request/response projection; inspected390 blind render. | Real two-client sideshow acceptance/tie/rejection, mixed public seen-state presentation, crossing pot cap during request, reconnect during response. |
| Blackjack |6;1/7 | Source/rules/test review; inspected390/1440 split-ready render. | Rare insured naturals, four-hand resplit/double/ace restrictions and nonacting-viewer highlight through actual clients; hand-level final accounting; long hands at320. |
| Rummy |6;2/6 | Fresh natural valid declaration matches at2/6, zero drops; source/meld/UI review; inspected390/1440. | Saved/API/browser natural declaration, accepted partition render, invalid-declare diagnosis, group recovery, history/profile/rematch; mobile grouping with all groups populated. |
| Skyjo |16;2/8;opening/play/reveal/between | Source/rules/score/test review; inspected390/1440 final-turn render. | Current two-client queue recovery, hidden-grid final reveal animation, removed columns and closer penalty ledger after exact final action, cumulative tie result. |
| Shithead |4;2/5;setup/play | Source/variant/privacy/test review; inspected390 early-play render. | Current populated tail with three matching cards, large hand and optional3/7 jointly, blind failure/recovery/last-card burn in actual clients; previous natural production matches remain historical evidence. |

Long names and maximum-seat compositions are visible in current captures. Disconnected and “Saving a move” controls exist in the harness; their presence is not evidence that disconnected/pending behavior was exercised. Parent’s current coverage record owns those interaction claims.

## Concrete layout proposals

1. **Deal:** retain bank/collections/hand zones and modeless composer. Put exact affected cards directly below actor→target; payment gets one compact transfer list with linked buildings nested visually under the selected property, exact loss and overpayment. The confirm button uses the authoritative quoted transfer. Card selection may open information but must not move the table or hide the target pile. Desktop can use the existing side composer; phone can use its current dismissible sheet with “View table.”
2. **Rummy:** keep grouping and hand rail, but make each populated group a readable meld row with private analysis; place selected-discard verdict beside Discard/Declare. A short summary above groups says “Pure sequence ready / second sequence missing / 27 unmatched points,” using actual server analysis. Do not add a second independent wizard. Preserve one stable decision region; return selected card focus when changing groups.
3. **Skyjo:** own grid remains the main interaction surface. Place an ordered final-turn line above it, and a compact score ledger directly below after round closure. On desktop the pile/status region can be alongside the grid instead of occupying a very wide shallow strip; opponents keep their useful mini-grids and inspector. On phone prioritize grid and current decision over repeated prose.
4. **Casino:** retain the desktop table metaphor and phone separation of board, own cards, decision and other seats. Each decision should name the amount added now, resulting total bet and relevant target; no raw “playing/river” as the only instruction. Use a stable but content-aware action region: current phone casino screenshots show bottom controls clipped by its scroll viewport, requiring parent interaction verification. Per-hand Blackjack outcomes and pot awards use expandable concise rows. Avoid shrinking card ranks to fit every seat on a tiny oval.
5. **Uno/Shithead:** add state-specific cues beside the existing central piles—direction/next recipient and roulette risk for Uno; consecutive-rank count and comparison for Shithead. Keep the current distinct high-contrast card families. Do not add table chrome that pushes the hand/action farther away.

## Shared implementation order and acceptance

| Order | Work / owning boundary | Observable completion |
|---|---|---|
|1 | Deal consequence quote and edition rule decision; pure rules → projection → generated API/detail adapter → existing composer/bot. | Legal replay payment equals the preview exactly; classic counter behavior has a named primary rule and independent expected-state tests. No money-deck change. |
|2 | Typed current-decision facts: exact public Deal assets, Uno pending kind/direction, Teen parties/seen state, Skyjo remaining order. | A fresh viewer can name actor, target, cost, consequence and next actor from the decision surface; reconnect reproduces it from authoritative state. Private data stays private. |
|3 | Rummy witness/deadwood analysis and organization recovery. | Candidate declaration can be explained before commit; saved natural min/max declaration flows succeed and scores reconcile. |
|4 | Authoritative result details: Blackjack hand/insurance ledger, Hold’em awards/winning reason, Skyjo round ledger. | All displayed deltas reconcile to server scores; ties, odd chips and refunds are separately understandable; no client winner recomputation. |
|5 | Add Shithead public pile-tail cue; adjust only demonstrated layout/cropping failures in shared decision/rail components. | Populated edge states usable at320/390/768/1440 with keyboard/touch and200% zoom, focus retained after commit/cancel, reduced motion respected. |
|6 | Focused browser/regression matrix for rare rules and shared lifecycle. | Exact action traces for counters/insurance/resplit/roulette/queue; one-human natural saved match for each affected game, refresh/reconnect/stale action and rematch/switch group checked. |

Keep Router → Service → Repository, pure engines, registered game modules, authorized bot projections and generated wire contracts. Extend existing `Hand`, `Seat`, `DecisionDock`, `HorizontalRail`, `OpponentPanel`, `ActionPanel`, `DealComposer` and typed API-client detail adapters; no new UI framework, animation package, rules package or parallel table system is justified by these findings. A small shared result-row component may handle typography/spacing, but each game must supply its own authoritative explanation.

Bot behavior is legal-information bounded in reviewed policies. Deal’s valuation should consume the same consequence quote as humans. Rummy’s bot demonstrates natural declarations; that is not evidence of expert play. Hold’em’s bounded simulation and raise cap are simple heuristics, Teen’s preference to look eliminates meaningful blind strategy, and Blackjack’s blanket insurance decline is a strategy choice, not a rules defect. Competence improvements should follow correctness and use authorized observations only.

## Independent rules references and unresolved questions

| Reference visited | What was checked / interpretation |
|---|---|
| [Mattel classic108 instructions](https://service.mattel.com/instruction_sheets/uno%20basic%20is.pdf) | Deck, drawing, opening actions, wild challenge and scoring. App’s one-hand match and optional house toggles are explicit differences from a point-series game. |
| [Mattel HVW18 No Mercy instructions](https://service.mattel.com/instruction_sheets/HVW18-Eng.pdf) |168 cards, draw-until, ascending stacking,7/0,roulette,25 elimination and special effects. The recipient’s draw consequence motivates CC-05. |
| [Hasbro B0965 card guide](https://assets-us-01.kc-usercontent.com/500e0a65-283d-00ef-33b2-7f1f20488fe2/6eaeff1c-a49c-4415-9ea2-489f5ffe31bc/B09650000_MonoDeal_instr_back.pdf) | Classic card categories/effects, properties/buildings and set objective; not independent G3071 certification. |
| [Hasbro FAQ953](https://hasbro-new.custhelp.com/app/answers/detail/a_id/953/), [FAQ952](https://hasbro-new.custhelp.com/app/answers/detail/a_id/952/), [payment FAQ944](https://hasbro-new.custhelp.com/app/answers/detail/a_id/944/) | Own-turn counter-budget conflict and exact payment choice. A present-day FAQ may not describe every later regional printing; choose edition explicitly. |
| [Hasbro wild FAQ942](https://hasbro-new.custhelp.com/app/answers/detail/a_id/942/kw/wild) | The page’s wording about standard properties versus two-colour/rainbow combinations is internally ambiguous. Current engine permits positive-value two-colour wilds to supply a set base. **Unresolved rules clarification, not a confirmed defect.** Do not change it solely from one ambiguous paragraph. |
| [No Mercy photographs/reference](https://www.geekyhobbies.com/monopoly-deal-no-mercy-rules/) | Secondary photographic corroboration of printed action effects and Shack behavior. Exact boxed money multiplicities remain unverified. Owner-approved labelled house inventory is the product contract. |
| [Bicycle Hold’em](https://bicyclecards.com/how-to-play/texas-holdem-poker/), [PokerStars poker rules](https://www.pokerstars.com/help/articles/poker-rules-master/229151/) | Street structure/ranking plus minimum raises, side-pot eligibility, heads-up and short-all-in interpretation. No fresh payout defect established. |
| [Bicycle Blackjack](https://bicyclecards.com/how-to-play/blackjack/) | Natural, insurance, splits/doubles and soft-total concepts. Six decks, soft17 option, four-hand cap, split-ace restrictions and no surrender are explicit app table choices. |
| [RummyCircle sequence/set chart](https://www.rummycircle.com/how-to-play-rummy/cards-in-Rummy.pdf), [rules](https://www.rummycircle.com/how-to-play-rummy/rummy-rules.html), [scoring](https://www.rummycircle.com/how-to-play-rummy/rummy-points-system.html) | Two sequences including a pure sequence, jokers/Ace examples, loss gate and20/40/80 penalties. Scoring page direct retrieval was blocked; indexed primary-source text corroborated the gate. Provider-specific variants should remain labelled; chart wording about large joker-assisted sets is not enough alone to call current partition logic wrong. |
| [Pagat Teen Patti](https://www.pagat.com/vying/teen_patti.html) | Traditional reference, not a universal publisher. App’s AKQ>A23 and seen-neighbor sideshow are deliberate documented variants, not defects. |
| [Magilano Skyjo instructions](https://cdn.shopify.com/s/files/1/0019/1696/0881/files/SKYJO.pdf?v=1739260165) | Components, hidden grid, column removal including final reveal, final-turn closure, positive closer penalty and cumulative end. |
| [Pagat Shithead](https://www.pagat.com/beating/shithead.html) | Current documented traditional game and six-card setup variant. Its main rules allow tens on anything; an older contradictory variation sentence is not a reason to alter this explicitly documented app rule.7-low and transparent3 remain optional/off. |

## Check receipt and cleanup

This reviewer ran fresh bounded Python probes and seeded legal trajectories against the pure engines, using existing registry/authorized bot policies and inventory helpers; no application test files were added. The two Rummy runs ended by actual valid declaration with no dropped opponents. Deal replay records preserve ordinary setup and every action needed to reproduce payment/counter findings. Controlled unequal-stack and pending-data probes are explicitly labelled separately.

Existing focused test **source** was inspected for card-family rules, casino/Rummy/Skyjo expected states, Shithead variants, privacy, and conservation. Parent runs the repository verification entry point and broad affected backend checks; their exit results must be cited from the parent receipt, not inferred from this review. No extra broad suite was duplicated here.

Only this review’s evidence/report files were written. No package installation, source patch, database room, production request, provider call, background server or configuration change was created by this reviewer. Reproducible evidence is retained; no task-owned running process or disposable large render cache remains.
