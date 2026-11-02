# Modern and board audit fixes — implementation receipt

Outcome: truthful Gem Market payment/forced-phase guidance; explicit Sea Salt & Paper stock-ending convention and inspectable choices; authoritative Four/checkers/boop results; touch-safe graduation; narrow-board overview and discoverable panning.

Scope is delegated under root task `audit-fixes-20261102`. Preserve original inventories, private/untimed rooms, hidden-card boundaries, existing shared UI primitives and old saved states. No dependency or schema migration is planned. Root owns generated exports/contracts, shared decision-dock styles, source-of-truth root docs, final browser/release checks, commit and push.

Acceptance: quoted Gem spending equals committed wallet changes; forced return/patron instructions and depleted counts are current; Sea Salt exact end choices follow a named documented convention; inspection never commits; board outcomes contain server reasons/cells; graduation can be selected/cleared before confirmation; narrow boards expose whole-board overview and operable panning while retaining 44px action targets and keyboard focus.

## Implemented

- **MBP-01 / ticket 3:** Sea Salt keeps its existing publisher-literal stock convention under `base58-exhaust-1`. The module README distinguishes it from the licensed BGA convention without declaring either a publisher erratum. The manifest labels the choice; server-projected ending consequences distinguish immediate Stop scoring, empty-stock cancellation, conditional Last Chance final turns, and final-turn scoring. Stock remains visible and a one-card stock draw is labelled accurately. No scoring mechanics or inventory changed.
- **MBP-02/07/09 / ticket 7:** Gem Market's pure purchase quote is also its payment calculation. Public market/own-reserve quotes include cost, applied discounts, exact automatic matching/gold spending, wallet afterward or shortfall. The UI uses the existing decision context, prioritizes compulsory returns/patron choice, explains the three-reserve limit and counts each depleted tier truthfully. Other players' reserved cards are excluded.
- **MBP-03 / ticket 8:** Four projects line/full-board reasons and winning cells. Checkers projects no-pieces/no-legal-move/quiet-limit/threefold reasons. Boop projects three-cats/eight-cats and the decisive coordinates. Result copy/highlights consume server metadata; adapter defaults preserve older saved states.
- **MBP-05 / ticket 9:** Paper public discard inspection uses the existing modal with full card rules and focus restoration, separate from taking. Private stock/crab selection reveals its rule before a distinct Keep/Take action. Clearing or inspection cannot submit.
- **MBP-06 / ticket 10:** Four, Reversi, checkers and Mancala share a small BoardViewport wrapper around existing HorizontalRail and Modal primitives. Native move targets retain size; visible arrows/swipe cue and read-only whole-board overview expose every column. The overview never contains commit actions.
- **MBP-08 / ticket 11:** Boop graduation/eight-piece return now selects and previews before Confirm. Clear cancels selection. Hover/focus preview remains; tap and keyboard activation no longer commit graduation immediately.

No dependency, migration, timer, new public identity, deck artwork or unrelated engine change was introduced. Shared ActionPanel gained only the agreed optional `selectionDetails` slot. Root owns generated fixture/catalog updates and shared dock styling.

## Files

Engines/module docs: `backend/app/games/{gem_market,sea_salt_paper,board,boop}` (Gem/Paper/boop engines; Four/checkers/projection; four READMEs). Typed projections: board/Gem sections of `packages/api-client/src/game-details.ts` and `sea-cats-details.ts`. UI: GemsTable, PaperTable, BoopTable, BoardTable, MancalaTable and new BoardViewport; surgical ActionPanel slot. Styles: `packages/ui/src/styles/expansion.css`, `sea-and-cats.css`. Checks: four existing backend test modules, new `apps/web/src/tests/modern-board-fixes.test.tsx` and `tests/browser/modern-board-fixes.spec.ts`. `sea-stock-replay.json` retains only public summaries/action ordinals from legal local probes.

## Verification — local, 2 November 2026

- **73 backend tests passed:** `test_gem_market_edges.py`, `test_new_boards.py`, `test_sea_cats.py`, `test_expansion.py`. Added exact quote-versus-committed-wallet, discounts/gold/free/shortfall/privacy/reserve-cap checks; result reasons/cells; 2/4-seat zero-stock ending choices, last-stock/fish exhaustion and four-mermaid override. Existing full match, inventory, immutability and rules tests remain in this run.
- **12 natural Sea Salt boundary branches replayed:** original setup/legal-action sequences at two/four seats. Exact scores, round awards, final queue and next actor match the recorded convention. Every step independently checks 58-card conservation and unchanged inputs. Fresh output is `sea-stock-replay.json`; historical audit evidence was preserved.
- **Scoped Ruff passed. Scoped mypy passed for 10 source files.** Latest web `type-check` passed after concurrent agents' work settled. Scoped ESLint passed for the six changed table/wrapper components and new component tests. `git diff --check` passed.
- **11 Vitest tests passed** across `modern-board-fixes`, `sea-cats-games`, `card-workspaces`, rerun after generated fixtures refreshed.
- **10 browser tests passed** across desktop and phone projects against the local running app: graduation select/clear/keyboard-confirm; public Paper inspect/Escape/focus restore/no submission; private crab select/rule/take; all four classic boards at 320px with visible pan cue, fitting overview, opener focus restoration, last enabled keyboard target fully visible and at least 44px, no horizontal page overflow; selected Gem shortfall/cost/discount explanation with no submission or local overflow; all four boards under 200% and 400% **CSS content zoom**, with overview and last-action focus retained.

These are local implementation checks, not deployed or production proof. Native browser zoom, physical assistive technology, a rendered successful-gold Gem purchase and refreshed Sea Salt zero-stock mobile screenshots are not independently claimed by this delegated receipt. The authoritative successful-gold purchase is tested at engine/projection level; the browser quote case covers an actual generated unaffordable market card. Root's wider browser/release evidence is separate.

## Independent read-only integration review

Reviewed root's monotonic room ingress, Tarot question hydration, waiting-member projection boundary and proxy diagnostics. No new actionable defect found in the inspected changes: GET structural sharing now applies the same revision contract as mutation/heartbeat/bot responses; Tarot's undefined draft falls back to saved question while an explicit empty edit remains empty, and Room keys the table by match ID; waiting members receive neither game, activity, last-action cue nor bot-driving indication; proxy diagnostics redact room/member path segments and only emit allowlisted failure classifications after route validation. Equal-revision presence refresh is intentional. This was focused source review, not an independent live security audit.

## Handoff and cleanup

Application changes and this receipt are stable for root integration. Final generated exports, named verification groups, commit/push and deployment status belong to root. No disposable service, database, credentials, new package install or temporary worktree was created by this delegation. Existing shared local services remain running. Browser traces were disabled for this legal-fixture check; shared test-result output is managed by root to avoid deleting another agent's active evidence.

Integration coverage: the older mixed-game continuation browser now explicitly
selects and confirms boop graduation and verifies no action is sent before confirm.
Its earlier immediate-submit expectation was superseded by the touch-safe flow.
