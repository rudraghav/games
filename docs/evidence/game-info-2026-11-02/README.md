# Game information and interaction review — 2 November 2026

This is a current local audit, not a claim that every possible match state has
been visually tested. All 27 renderers were read, and a representative legally
reached mid-game screen for every game was captured and reviewed at 390px and
1440px. The shared fixture exporter now provides **247 legal projections** at
minimum and maximum player counts. It checks physical inventory and private
zones before exporting. Twelve new snapshots distinguish blind/seen Teen Patti,
Skyjo’s final-turn interval and Azul’s occupied floor from ordinary play. The earlier 235-state
review remains historical evidence.

## Changes resulting from the review

| Finding | Current behavior |
| --- | --- |
| Compact Deal cards did not expose their rent footers, and collection references required discovery. | Separate 44px Card info/Info controls open a keyboard/touch inspector, without selecting or playing a card. It explains completion, missing count, every allowed colour’s labelled rent ladder, printed effect, payment value and current buildings/rent. |
| Rent hints could be read without understanding the turn modifier. | The inspector shows the authoritative multiplier and available legal charges. The house/hotel plus Double the Rent fixture shows 18M before the corresponding committed bill. |
| Some Deal metadata called a property’s value a bank value. | Inspector says Payment value and explicitly states that properties cannot be banked. All-colour wilds explain their zero payment value and rent-alone restriction. |
| Uno special cards had names without a selected-card explanation. | The existing fixed action panel explains each special face, conditional classic 7/0 and stacking settings, No Mercy ascending stacks/elimination, two-player Reverse +4, and the actual +4 challenge consequences. |
| Blackjack required players to add cards mentally. | Each own split hand shows its visible total, soft/bust state and existing bet. The dealer label says Visible dealer total while its hole card is hidden. No hidden value is predicted. |
| Teen Patti’s blind placeholder suggested betting would reveal cards. | It explains that cards remain hidden until Look, alongside Blind/Seen and the current stake. |
| Hold’em settlement data was not displayed in the actual results panel. | `CasinoSettlement` renders server-projected main/side pots, split winners and unmatched-wager refunds in `RoomResults`; the finished table is retained. Live current-bet/call amounts are also explicit. |
| Skyjo did not name the player who closed the round. | The existing action panel announces the closer and one final turn for everyone else; visible help explains the 100-point end and positive-closer doubling condition. |
| Gem Market omitted opponents’ public held tokens. | Existing public collection disclosures now show every public token colour/count, separately from permanent discounts. Private reserved identities remain hidden. The take-pair supply threshold is visible. |
| Flip 7 pending choices named the effect without its consequence. | Freeze, Flip Three and Second Chance explain their effect before target selection. Normal play states the duplicate risk and seven-number bonus. |
| boop described only one of its winning conditions. | Its existing heading also states the alternate eight-adult-cats-on-bed victory. |
| Azul floor penalties disappeared behind occupied tiles, and draft overflow was implicit. | Root-owned improvements retain each slot penalty, floor total, the first-player-marker cost, and visible/accessibly named fit and overflow for each legal pattern line. |

## Per-game checklist

Every row below received source review and current desktop/phone screen review.
The **interaction** column records the actual control pattern, including direct
commit where there is no separate confirmation. The **pending/results** column
does not claim a newly completed saved match: shared saving/disconnection and
result paths were inspected, with deeper proof identified separately below.
The remaining column names limits rather than silently treating them as tested.

| Game | Decision information and public/player view | Choices, commit and cancellation | Waiting, pending and results | Remaining scope or deliberate boundary |
| --- | --- | --- | --- | --- |
| Uno | Current colour, direction/penalty, stock/discard, own hand/count, opponent counts; selected special-card explanation and enabled house rules. | Select then Play; Clear; Wild colour or 7 target choices; Draw is direct; drawn-card Play/Pass; +4 Accept/Challenge. | Shared turn/saving/reconnect; challenge state visible; winner and rematch through RoomResults. | New sweep includes challenge and drawn-card phases; it does not visually replay every challenge outcome, final 7/0 or every colour permutation. |
| Uno No Mercy | Same stable piles/hand; ascending draw amounts, required 7/0, roulette and 25-card elimination explained on selection; eliminated seats remain distinguishable. | Select then Play; colour/target choices; Draw/stack follow legal options; Clear preserves board. | Pending draw chains, colour choice and elimination are server-owned; shared results/rematch. | No claim that every elimination during roulette/stack/reversal was newly rendered. The 24-card stress hand and canonical face tests are separate proof. |
| Monopoly Deal | Named deeds, set count/size, current rent, bank value, remaining plays; Info exposes all rent tiers, completion, buildings, effects and payment values. Public opponents show bank/sets without hands. | Select then exact existing/new pile; explicit bank mode/confirm/cancel; Take/Give cards and target; legal rent preview; movable wild; Counter/Let stand; exact asset payment with remainder/overpayment. | Modeless decisions preserve board/hand; View table/Space peek; blocked/counter-counter state; saving/reconnect disable commit; completion then results/rematch. | Twelve targeted fixtures cover complex branches. No claim of exhaustive arbitrary four-player counter/payment interleavings. No timer or same-colour duplicate-set house rule was copied. |
| Monopoly Deal No Mercy | Same Info and public assets; edition-specific Shack/Hotel/Keep/Give/debt effects; approved house-money-deck disclosure retained. | Legal edition choices reuse the family composer without inventing classic equivalents; keep/give, debt/payment and building targets remain explicit. | Targeted Give/Keep/debt/counter states plus shared pending/results paths. | House deck is intentionally labelled; publisher-exact money multiplicities were not asserted. Every edition card face is covered, not every ordering of those cards. |
| Texas Hold’em | Own hole cards, public board, pot, seat wagers/stacks, dealer button, street, current bet/call amount; server raise min/max/step. | Check/Call/Fold direct; typed raise amount then Raise; all-in legal option. No hidden-opponent strength prediction. | Fixed casino dock; public action/chip cues; reconnect disables controls. Actual results now list server main/side/split pots and refunds. | Settlement component tested with main/split/side/refund projections. Live side-pot eligibility is not projected before settlement; it is not fabricated. New mid-game samples do not cover every all-in ladder. |
| Indian Rummy | Wild rank, stock/discard, private sorted/grouped hand, two-sequence/one-pure requirement and false-declaration penalty. Opponent hands stay hidden. | Sort/group are local; select discard then confirm; Draw direct; Declare passes groups to the server; Clear/ungroup available. | Drawing/discard/declaration phases; shared pending/results; server validates declaration and scoring. | No live per-group validity/deadwood annotation is supplied. New UI review is not exhaustive for joker/Ace/declaration combinations; previous full-match browser automation can drop, so it is not declaration-victory proof. |
| Teen Patti | Blind/Seen, current stake, pot, stack/wagers, own cards only after Look; sideshow actor/response choices. | Look, blind/seen bet with amount bounds, Fold, Sideshow/Accept/Decline and Showdown follow legal options. | Blind and seen snapshots now separate; pending sideshow choices; shared casino save/reconnect/result path. | New information proof includes a true blind state, not simulated hidden UI over a seen hand. Every sideshow ranking combination remains engine-test scope. |
| Blackjack | Dealer upcards and hidden back, visible dealer total; own per-hand total/soft/bust/bet/active split hand, payout note. Other players’ permitted public cards remain separate. | Bet amount; Hit/Stand/Double/Split pair; insurance/decline where legal; split-hand rail navigation. | Dealer automatic resolution; fixed pending dock; finished table retains dealer and all own split hands; result chips/winners. | Aces and split totals checked. No outcome is inferred from hidden dealer cards. Not every insurance/natural/resplit combination was newly clicked. |
| Skyjo | Own 3×4 coordinates, hidden/revealed/removed states; stock/discard/drawn card; public opponent grids and totals; round/closer/final-turn explanation. | Choose pile; replace legal slot or discard/reveal as permitted; coordinate-labelled direct choices. | New reachable final-turn samples; round review and Next round; cumulative totals and 100-point ending explained. | The projection names the closer but does not provide the remaining-final-player queue, so no speculative countdown is shown. Every matching-column/doubling tie branch is not new visual proof. |
| Pop Tarot | Three spread positions, chosen count, card artwork and meaning, optional question; Normal/Quirky/pop-character reading; cached state and astrology work owned by the parallel Tarot task. | Pick three with tap/keyboard rail; reading request separate from selection; optional astrology consent/form distinct. | Choosing, saved reading, unavailable/retry and account/ownership boundaries are separate state paths. | This audit’s catalogue capture is choosing, with provider calls disabled. Fresh reading/astrology/provider proofs must use their owning evidence; 78 images does not prove every generated reading. |
| Four in a Row | Column targets, owned coloured discs, last drop and turn owner; winning rule in Rules. | Legal column direct commit; full columns disabled. | Shared save/reconnect; win/draw results. | Current mid-game layout checked; no winning-four highlight overlay is supplied, and every diagonal end was not newly rendered. |
| Reversi | Owned discs, counts, highlighted legal squares and last placement; capture/pass rule in Rules. | Direct legal placement; server automatically passes a player without a move. There is intentionally no missing manual Pass button. | Server message explains automatic pass; shared pending and settled board/results. | New samples do not cover every pass/end tie; rule/engine tests remain the behavioral proof. |
| Word Agents | Team roles, remaining agents, clue/count/guesses remaining, revealed words; spymaster key is explicitly private. | One-word clue + count then Give clue; operative selects word then confirms; Clear by retap; End guesses. | Waiting for clue/team, shared pending/disconnect; assassin/agent results server-owned. | The representative capture is an authorized spymaster view; it is not evidence that operatives see the key. Role/privacy tests are separate. Rare clue-language validation and assassin finishes not all new. |
| Gem Market | Token supply, own tokens/discounts, development costs/bonus/prestige/tier, patrons and reserved count; public opponent tokens now available in existing disclosures. | Select development then Buy/Reserve; choose one-per-colour or legal pair then Take; Clear; deck reserve disclosure; Return tokens/choose Patron phases. | Shared save/reconnect; token-return/patron phase; prestige results. | No private opponent reserved identities are shown. Some token-cap/reservation-limit explanations remain in Rules; no speculative hidden-reservation cost preview. |
| Checkers | Own/opponent pieces, crowned kings, captures, legal source/destination, last move; compulsory-jump rule. | Select source then legal destination; retap source cancels; direct legal jump path. | Shared save/reconnect and win/draw results. | Current kings/capture samples reviewed; no separate ahead-of-time multi-jump animation/branch preview. Repetition and forty-move draw are engine-test scope. |
| Mancala | Each pit’s seed count, stores, own side/owner and legal pits; last move. | Direct highlighted-pit sow; no unnecessary confirm sheet. | Server extra-turn/pass messages; shared save/reconnect and final swept-store scores. | Capture/extra-turn outcomes are explained in Rules and after action, not predicted beside each pit. New visual review is not every endgame sow. |
| Flip 7 | Public number/effect cards, at-risk/banked round points, status and target name; 200 target; duplicate risk/seven-number bonus; pending effect consequence now visible. | Hit/Stay direct; pending target selected from legal buttons; round review Next round. | Deferred effect/target phases and busted/banked statuses; shared pending/results. | Freeze rendered; all three pending descriptions are source-reviewed. Not every deferred Flip Three/Second Chance ordering was newly clicked. x2-before-modifiers remains in Rules. |
| Trio | Own sorted hand, current low/high end choices, fixed table positions, revealed sequence and collected trios; three trios or sevens win already visible. | Direct table reveal or Lowest/Highest request; explicit Continue shows mismatch before it hides. | Mismatch/collection review; shared pending and instant victory/results. | Current reveal-review layout checked, not every captured-position/moving-hand-end sequence. Team/SPICY modes are intentionally absent. |
| Azul | Factories/centre, active draft, own pattern capacities/wall, public opponent boards, floor penalties/total, first-player-marker cost, legal fit/overflow and round score. | Select factory colour then legal line/floor; placement preview gives exact fit and overflow; no artificial third step. | Stable supply/board; round review/Next round, score breakdown and results. | Root-owned focused overflow/occupied-floor/marker check passed both widths. Not every bonus-colour/wall adjacency score was newly rendered. |
| Spill or Chill | Round, spotlight, prompt and response choices; Share/Keep private/Pass; optional drinking and skip wording. | Select choice then Lock; local change before commit; no required alcohol consumption. | Submitted count/wait then reveal/Next; participation results. | Prompt catalogue not individually reviewed for every group’s taste. Private answer content is not created or recorded by a Share action. |
| Most Likely | Prompt, eligible named people, own locked state and count; revealed votes only after reveal. | Select vote then Lock; Pass where offered; local change before commit. | Waiting for others, reveal totals, next round and spotlight scores. | New representative is reveal; pre-reveal privacy is covered by existing room/API tests, not inferred from a screenshot. Every tie not newly rendered. |
| Hot Seat | Spotlight person, prompt, A/B answer or predictor choices, own locked state, round and points. | Select then Lock/Pass; local change before commit; server hides the spotlight answer before reveal. | Waiting/submitted count, revealed answer/predictions, next round and result totals. | New capture is answer phase; all question variants and score ties were not newly clicked. |
| The Gang | Heist/street/community, private own hand category, ranked chips and owners, vaults/alarms, estimates; showdown public categories. | Take available ranking chip then confirm/return; last-chip warning; Next heist review. | Simultaneous ranks, street reveal and public showdown; heist result/three vault-or-alarm ending. | Hand strength describes only the viewer’s authorized cards. Completed heists now use a compact 112px review dock before public hands/history; live chip/showdown geometry remains fixed. |
| 6 nimmt! | Hand numbers/bullheads, row counts/penalties/capacity, submitted count, revealed ascending order and cumulative penalties. | Private card select then confirm; below-all row choice; no opponent prediction. | Simultaneous lock, reveal/row-taking, Next selection/round; final lowest score. | 66-point ending is in Rules; no guess of opponents’ private card choices. All tied end totals not newly rendered. |
| Sea Salt & Paper | Each own card effect/colour, card points/colour bonus, stock/two piles, private keep/discard, public duos and protected/revealed hands; score target. | Draw then Keep/discard exact pile; select pair then confirm/Clear; Crab/steal targets; Stop/Last Chance when legal. | Extra turn and round-call states; public round awards and Next round; final scores. | Compact public played cards have less visible effect text than own cards; complete scoring tables and Last Chance risk remain in Rules. Completed rounds now use a compact 112px status/Next round dock; not every duo/caller tie was newly rendered. |
| boop. | Piece pools and type, bed coordinates/owners, last placement/push, graduation count and choices; both three-cats and eight-cats victory conditions now visible. | Pick kitten/cat then legal square; direct placement; focus/hover graduation highlight plus explicit coordinate-labelled option; return-piece alternative. | Waiting for opponent graduation, shared pending; winner/result. | Graduation highlight supports keyboard focus; not every simultaneous winning line/eight-piece alternative was newly clicked. No hidden information exists. |
| Shithead | Stock/pile/comparison/burn count, reset/burn/optional low-seven/transparent-three rules, own hand/face-up/hidden stage, safe/remaining players; public face-up opponents. | Arrange three face-up then confirm; one/multiple same-rank select then Play/Clear; face-up slot or blind slot direct; Pick up when legal. | Failed blind flip publicly shown then picked up; burn/finish stage messages; final loser/result. | New mid-game hand/face-up scenes checked; rare four-equal/transparent-three/blind-failure combinations rely on targeted existing engine/browser tests rather than every current screenshot. |

## Retained proof

- [Coverage and exact sampled states](information-coverage.json).
- [Phone contact sheets](catalogue/phone-1.webp), [2](catalogue/phone-2.webp), [3](catalogue/phone-3.webp); [desktop](catalogue/desktop-1.webp), [2](catalogue/desktop-2.webp), [3](catalogue/desktop-3.webp). All 27 games are represented at both widths.
- [Phone Deal set information](ui/phone-deal-complete-set.webp) and [18M rent preview](ui/phone-deal-rent-18M.webp); [desktop set](ui/desktop-deal-complete-set.webp) and [rent](ui/desktop-deal-rent-18M.webp).
- Azul [phone overflow](ui/phone-azul-overflow.webp) and [occupied floor](ui/phone-azul-occupied-floor.webp); [desktop overflow](ui/desktop-azul-overflow.webp) and [occupied floor](ui/desktop-azul-occupied-floor.webp).
- Compact phone completed-round reviews: [The Gang](ui/phone-the-gang-round-complete.webp), [Sea Salt & Paper](ui/phone-sea-salt-paper-round-complete.webp).

## What was borrowed from the reference

The supplied Playdeal screenshots and changelog were treated as design evidence,
not instructions or a new rules source. The transferable behavior is stable
board/hand placement, compact public opponent summaries, named cards, clear
actor/target/payment information, reversible selection, exact rent preview,
modeless board peek, focus restoration and public card activity. Tap/click and
keyboard access replace hover-only information. Ours retains untimed turns and
canonical edition rules plus explicitly approved house settings; reference
timers, auto-turn and stacking-building house rules were not silently copied.

## Verification and evidence boundaries

Local checks passed: 20 focused unit tests, web type checks, scoped lint, the
60-case combined information/Deal/stability run, the subsequent 40-case
Gang/Paper/density/stability run, and a final six-case sweep of all 247 fixtures.
These browser runs overlap and are not summed as unique coverage. Both widths
were exercised. Root’s formal release/build/Storybook gates remain separate.


- `game-information.spec.ts`: visible blackjack totals/splits, true blind Teen
  Patti, a legally reached Skyjo final turn, special-card/alternate-win copy,
  and public Gem tokens without private reserved cards, at both widths.
- `deal-information.spec.ts`: completion/rent ladders/buildings, all-colour
  wild, nine-card hand, exact 18M legal rent, nested public inspection, Escape
  focus return, no action submission and unchanged document geometry.
- Existing `deal-workspace`, `stable-deal`, `stable-game-tables` and
  `midgame-workspaces` suites cover selection, cancellation, payment/counter
  eligibility, target changes, crowded hands, saving/disconnection, legal
  continuations and layout. Automated bounds checks are not a visual judgement
  or a complete rules proof.
- Four focused unit files check every canonical Deal/Uno action description,
  authorized inspection zones with privacy canaries, exact legal rent values,
  visible-card ace arithmetic and actual results settlement rendering.
- Current 54 originals, six contact sheets and the capture manifest were made
  locally without database writes or provider calls; concise retained evidence
  is linked below after final checks. Tarot/astrology live provider evaluations
  belong to their own files in this directory.

Historical saved-room proof remains
[`stable-play-2026-11-02/local-matches.json`](../stable-play-2026-11-02/local-matches.json):
94 complete saved matches, 9,008 moves, 231 refreshed mid-game checks and 50
stable selections. It predates these information changes. It does not replace
new source/type/browser checks or prove a new production rollout.

This information pass is **local** until the root release records its commit,
deployment and live verification. No schema, engine rules, hidden projection,
production account or provider configuration was changed by this subtask.
