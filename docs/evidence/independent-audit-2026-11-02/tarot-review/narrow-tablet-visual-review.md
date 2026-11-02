# Narrow-phone and tablet visual review

Independent follow-up inspection, 2026-11-02. This is audit evidence only; no application source, settings, or production data were changed.

## Scope and evidence

Reviewed all 27 game states at both 320px and 768px (54 views) in the six corrected contact sheets `sheets/accepted-320-{1,2,3}.webp` and `sheets/accepted-768-{1,2,3}.webp`. The older `tables-*` sheets were excluded from judgments. The corrected capture process uses a tall viewport followed by an exact table crop, so the original normal-height geometry in `ui-capture-manifest.json` remains the reference for dimensions; a full-table crop is not first-fold evidence. Also inspected individual corrected Tarot, Four in a Row, and Uno No Mercy crops, source styles/components, and the root auditor's fresh Four keyboard and Tarot image rechecks.

Evidence grades here: **V** = directly visible in corrected captures; **S** = confirmed in current source; **B** = confirmed by the root auditor's fresh browser evidence, independently inspected. Static captures do not establish touch, keyboard, screen-reader, or complete-game success.

## Verdict

The corrected table crops are coherent representations of the current layouts. They show a consistent visual language, legible primary actions, effective card/board artwork, and appropriately concealed private cards. Two shared design issues remain: narrow classic boards require undisclosed horizontal panning to survey the complete board, and some bounded decision panels hide choices below their internal fold. These are discoverability and decision-context concerns, not proof of blocked legal actions.

One capture exception was resolved: `accepted-tables/tarot-320.webp` shows Wheel of Fortune as a plain coral rectangle, while `screenshots/tarot320-recheck.jpg` correctly renders its illustration at the same width. This is a capture/loading artifact; do not report a missing Tarot asset or use that particular cell as proof of successful artwork rendering. The fresh recheck supplies the appropriate visual evidence.

## Actionable concerns

### NV-01 — P2: narrow classic boards hide the right edge without a clear pan affordance

**Evidence: V + S + B for Four; V + S for Reversi, Checkers, and Mancala.** At 320px the visible table is 284px wide. Four in a Row initially shows six columns (the sixth partly cut), while the seventh is beyond the visible region. Reversi and Checkers similarly hide part of the eight-column board. Mancala initially hides right-hand pits/store. At 768px these boards are fully visible.

`packages/ui/src/styles/expansion.css:10-15` deliberately supplies an inner horizontal scroller and a minimum Four board width of 340px. Lines 743-750 keep Reversi/Checkers at a 352px minimum on small screens. `apps/web/src/games/board/BoardTable.tsx:34` uses that scroller. Mancala's board is also at least 352px (`expansion.css:809-813`); its entire enclosing section scrolls horizontally via `packages/ui/src/styles/library.css:390-392`, rather than the separate board wrapper used by the other three games (`apps/web/src/games/board/MancalaTable.tsx:27-39`).

The root auditor's `board-320-geometry.json` shows Four's seventh drop control at x314..358 initially, outside the x18..302 region. **This is not an unreachable-action claim:** `board-320-keyboard-reach.json` records focus on “Drop in column 7”, scrollLeft 57, and the button revealed at x257..301. No document-level overflow and 44px targets alone therefore miss the perceptual problem, but keyboard focus does reach the control.

**Root cause:** touch-target minimum dimensions exceed the mobile board container; native overflow preserves access but the layout does not clearly tell a first-time player that game state continues to the right. This particularly affects planning across a whole board, where offscreen pieces can change the best move.

**Proposed owner:** shared board UI/product design. **Acceptance:** at 320px, all four games either show the complete board while preserving usable controls, or expose an obvious, operable pan/overview treatment. Test first and last columns/pits by touch and keyboard, and show both stores/edge columns without relying on a desktop scrollbar. Preserve legal move labels, selection feedback, and 44px target policy where applicable. Keyboard access is already verified for Four only; do not generalize that result to every board.

### NV-02 — P2: some decision panels require discovering a second scroll area to see all choices

**Evidence: V + S; interaction not independently exercised.** Uno No Mercy at 768px shows red and yellow choices, part of green, and blue below the action panel's initial visible region. The 320px counterpart lays the same choices out as a visible two-by-two group. Casino action panels and Flip 7 also show partial lower controls in some captured states. Most Likely's longer results list continues below its bounded panel; that is an overview consideration rather than a missing-vote claim.

`packages/ui/src/styles/decision-dock.css:88-97` fixes the default decision panel to 160px and explicitly allows internal scrolling; lines 105-113 enlarge it below 700px. `packages/ui/src/styles/stable-tables.css:470-471` makes Uno choices two columns only below 700px. The combination explains why the tablet can expose fewer choices at once than the narrow phone. These controls exist in the DOM, so the captures do not establish inaccessible actions.

**Root cause:** fixed panel height and a breakpoint-dependent action arrangement can place essential alternatives outside the initial panel viewport. Scrollbars can be subtle or hidden by the operating system.

**Proposed owner:** shared decision panel UI. **Acceptance:** the complete four-colour choice is apparent at 320/390/768/1440px without an undisclosed internal scroll. For legitimately long menus, provide a clear continuation cue and verify keyboard focus scrolls every action into view. Preserve the intended stable table footprint during state changes; do not simply trade nested scrolling for large uncontrolled layout shifts.

### NV-03 — P3: reserved empty space and abbreviated context reduce useful mobile overview

**Evidence: V; product judgment, not a functional failure.** Deal/Deal No Mercy and Shithead reserve substantial empty action/hand space in these captured states. At 320px that lengthens the distance to sets, face-up cards, or opponents. Rummy presents only a few of fourteen cards at once in its hand rail, and the current grouping area offers little visible explanation of which group qualifies as the required sequence. Maximum-seat casino/party layouts truncate several names and require substantial vertical or rail navigation. These are tradeoffs of stable footprints and bounded inspection, not proof that information is unavailable.

**Proposed owner:** per-game UI with the shared table workspace owner. **Acceptance:** evaluate real mobile decisions, especially Rummy grouping and Deal set targeting, with a novice who must identify what to do and why. Keep stable controls while reducing uninformative vertical distance; expose full identity/context through existing inspection patterns. Do not add duplicate counters or badges merely to fill the space.

## Per-game visual receipt

| Game | 320px observation | 768px observation / qualification |
|---|---|---|
| Uno | Draw/discard, hand, challenge prompt and two response actions are coherent. | Compact layout is coherent; no new issue from this state. |
| Uno No Mercy | Roulette colour choices are visible in a two-by-two group. | Lower colour choices extend below the internal decision-panel fold (NV-02). |
| Deal | Own bank/sets and hand are legible; reserved middle space is prominent. | Broader set layout is readable; reserved space remains (NV-03). |
| Deal No Mercy | Same stable structure and mobile space tradeoff as Deal. | Public sets and active decision context remain coherent. |
| Hold'em | Community, own cards and public seats are distinguished; long maximum-seat layout. | More useful horizontal overview; some action-panel continuation requires scrolling. |
| Rummy | Fourteen-card rail shows a few cards at a time; group validity is not explained clearly in the visible layout. | More cards/groups fit, but the learning concern remains (NV-03). |
| Teen Patti | Blind state conceals the hand correctly; Pack and See Cards are clear. | More readable public-seat overview; bet controls continue within bounded panel. |
| Blackjack | Dealer hole card remains concealed; visible total is identified; long player list. | Dealer/own-hand hierarchy is clear; verify lower decision controls by interaction. |
| Skyjo | Own twelve-card grid is readable; final-round explanation is visible. | More opponent context fits; capture alone does not establish final-turn queue clarity. |
| Tarot | Picker and three-card spread are coherent. A blank Wheel cell in the crop is contradicted by the successful fresh recheck. | All shown faces render correctly; the independent all-78 art review remains separate. |
| Four in a Row | Right edge requires horizontal panning (NV-01). Seventh column was verified keyboard-reachable. | Complete board visible. |
| Reversi | Right edge of eight-column board is initially offscreen (NV-01). | Complete board visible. |
| Checkers | Right edge of eight-column board is initially offscreen (NV-01). | Complete board visible; piece and square treatment is coherent. |
| Mancala | Right pits/store initially offscreen; enclosing section allows panning (NV-01). | Both stores and all pits visible. |
| Word Agents | Five-by-five board and spymaster role context fit; word labels are compact. | Board/clue hierarchy is more readable; no private-role leak inferred from this authorized view. |
| Gem Market | Two-column card presentation with tier navigation; long but coherent. | Wider tiers expose more choices; costs and personal engine are visually differentiated. |
| Flip 7 | Interrupt target choices are understandable, though long names truncate; maximum-seat list is long. | More public seats fit; lower target choices may require panel scrolling (NV-02). |
| Trio | Sorted own cards, public table, and other-player summaries remain coherent. | Broader public/own-card overview; no new visual issue. |
| Azul | Factory rail shows a subset; chosen destination/overflow cues are visible. | More factories and pattern lines fit; floor penalties remain visually distinct. |
| Spill or Chill | Prompt and Share/Keep private/Pass choices are clear. | Coherent compact choices, with substantial reserved panel space. |
| Most Likely | Spotlight identity wraps; long results extend below the bounded panel. | More results visible at once; static crop does not prove omitted votes. |
| Hot Seat | A/B/Pass and lock/count state are clear. | Horizontal choice layout uses the width effectively. |
| The Gang | Finished-heist result and continuation appear before longer player/history detail. | Good review hierarchy; cooperative result is clearly distinguished. |
| 6 nimmt! | Four rows, penalties and continuation are clear; resolved-card rail shows a subset. | Wider resolved-card overview; rail continuation is not a missing-card claim. |
| Sea Salt & Paper | Round result and continuation are prominent; hand and opponents use rail/inspection patterns. | More of own hand and expanded opponent detail fit. |
| boop | Complete six-by-six board fits; graduation instruction and piece counts are visible. | Board remains clear and uses width well; no board-edge clipping seen. |
| Shithead | Own hand and concealed face-down cards are distinct; long reserved spaces push later context down. | More context fits, but reserved empty-space tradeoff remains (NV-03). |

## Limits and completion

This pass visually inspected the six corrected contact sheets and selected full-size crops; it did not independently replay all 54 states or measure contrast, touch success, browser zoom, or screen-reader announcements. Small labels in a reduced contact sheet are not sufficient evidence for a contrast/typography failure. Existing normal-height DOM geometry has no document overflow in the noted cases, but that metric does not establish complete board/choice visibility. The review deliberately distinguishes bounded scrolling from unavailable controls.

No more numerical or provider research was performed for this follow-up. The review note is the only additional file written for it. All source/style references were read-only. Evidence writing is complete and stopped for the parent auditor's final named checks.
