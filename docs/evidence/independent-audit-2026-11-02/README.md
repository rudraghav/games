# Independent Games audit — 2 November 2026

## Review contract

Outcome: evidence-based review of all 27 registered experiences and an implementation-ready improvement plan.

Application code, runtime settings, credentials and production data remain unchanged. New evidence and audit documents are local only. State-changing investigation uses task-owned local QA rooms or the existing isolated temporary-database test runner.

Acceptance: separate current source, current rendered legal projections, fresh automated checks, saved local matches, historical evidence and hosted observations; inventory every edition; give confirmed findings with impact, root cause, owner and observable acceptance; record unchecked rare branches; provide concrete layout and shared-component proposals.

Baseline: clean `main` at `4233d6c`; application sources match recorded release `9627e53`. The working tree changes from this review are audit evidence and the progress journal only. Nothing was committed, pushed or deployed.

## Overall verdict

The app is a credible private game-night foundation with a broad, functioning catalogue, strong server ownership of rules, substantial hidden-information protections, useful casual bots and a coherent shared visual language. Keep the architecture and the game-specific tables. The next work should make consequences and results trustworthy at the point of decision, before investing in another visual redesign or expanding the catalogue.

The clearest consequential defect is **Deal payment preview**: ordinary legal play can reach a confirmation that counts 2M while 9M actually leaves the player's table, because linked buildings travel with the property. The approved No Mercy edition has the same mismatch (3M → 6M). The clearest shared reliability defect is **room cache regression**: a delayed GET can overwrite a newer action response. Rummy's attractive grouping controls are organizational only and provide no declaration-validity or deadwood analysis, even though false declaration can cost 80 points. These are distinct problems with specific owners; none requires replacing the engines or UI system.

No concealed-hand/deck leak or incorrect Hold'em payout was established. This is a bounded assessment, not a security certification. The classic Deal counter rule conflicts with the primary reference currently cited by the app and needs an explicit edition decision. Sea Salt & Paper's stock-ending convention also needs resolution against the intended edition before mechanics change. Existing passing tests encode those choices and cannot settle them independently.

## Deliverables and navigation

- [All 27 experiences: inventory and unchecked branches](coverage.md).
- [Card and casino review](card-casino-review.md): ten separate editions, exact rules/components, ten findings and legal replay evidence.
- [Modern, board, resource, word and party review](modern-board-party-review.md): sixteen separate experiences, effects/privacy/scoring and nine findings.
- [Tarot, astrology and shared architecture review](tarot-architecture-review.md): all 78 illustrations, all 48 active character images, numerical comparison, privacy, recovery and six findings.
- [Narrow phone and tablet review](tarot-review/narrow-tablet-visual-review.md): all 54 width/game combinations, with two shared usability findings and explicit capture limitations.
- [Concrete layout and component proposals](layout-proposals.md).
- [Visual walkthrough and screenshot limits](visual-walkthrough.md).
- [Ordered implementation backlog](implementation-backlog.md).
- [Checks, failures, production limits and cleanup](verification.md). Final check counts are owned by that receipt; scenario counts below do not imply exhaustive coverage.

## Actual current state and evidence hierarchy

The local registry and public `/api/backend/v1/games` both contain **27 experiences**, with matching manifests. Runtime source has no diff between current checkout `4233d6c9da9269de1bf19165c8ba38afa869c15b` and the recorded release source `9627e530be1c79abaf1c4b10b27b0037c8677ed8`. The intervening changes are documentation/workflow material. See [current-state.json](current-state.json).

Fresh public requests returned 200 for home/privacy/catalogue, 401 for unauthenticated identity, and 404 for the three development-design routes. Catalogue responses were `private, no-store`. Current Vercel management inspection returned **403 through both connector and the installed CLI**. Consequently, the active control-plane alias, deployment SHA and production environment configuration could not be independently recertified. Matching public content plus historical release evidence is weaker than fresh deployment inspection.

| Evidence | What this audit actually did | What it does not prove |
|---|---|---|
| Current source | Inspected required source-of-truth docs, module READMEs, engines/decks/options, views, policies, shared UI, room/API/storage boundaries and existing tests | Merely having a branch/test does not prove it works in a real saved match |
| Independent rules | Consulted publisher/official rules and documented traditional variants, with conflicts called out in the individual reviews | A similar game or newer printing does not automatically govern this app's declared edition |
| Fresh legal projections | Re-rendered the existing 247 legally reached fixture corpus through current browser specs; manually reviewed one representative state for each game at 320/390/768/1440 | Not 247 new live rooms; rare branches absent from the corpus remain absent |
| Fresh pure-engine probes | Ordinary legal Deal payment/counter trajectories, natural min/max Rummy declarations, Sea Salt stock closure branches and Four win; focused query/projection probes | No API persistence/browser/history proof for these exact rare trajectories |
| Fresh local saved matches | Authorized projected moves in isolated QA rooms, result/history/rematch/game-switch and sampled midgame UI; min/max seat coverage tracked in verification receipt | Most moves are API-driven. This is not a human novice completing every decision through touch controls |
| Current browser/public | Home, empty Rooms and unsubmitted setup at 320; all-game design harness at four widths; existing room/chat/recovery browser checks; published Zynga screenshots | No production room was created or changed; no current live sign-in/email delivery or provider generation was tested |
| Historical evidence | Prior 94 saved-match cases/9,008 moves, earlier production reports and real-provider Tarot samples were inspected as leads | Those are not fresh matches, fresh provider outputs or a fresh cloud permissions audit |

`ui-capture-manifest.json` contains 108 normal-height geometry/DOM records. `accepted-captures.json` points to corrected full-table crops used for visual comparison. These use a **3300px-tall viewport** to force complete painting, so their vertical whitespace is not first-fold evidence; viewport-height CSS especially changes Deal. Original normal-height measurements and `screenshots/setup320.jpg`, `home320-viewport.jpg` and `rooms320.jpg` are the appropriate references for actual folds. One Tarot320 crop captured an incompletely loaded Wheel; `tarot320-recheck.jpg` correctly displays it. Exclude that artifact from product defects. No document-level horizontal overflow or native button smaller than the sampled 43.5px threshold was found in the 108 measurements; that narrow geometry check does not establish complete accessibility.

## Most important findings

Severity describes player impact, not implementation size. P1 is consequential correctness/decision risk; P2 is meaningful reliability, learning or information loss; P3 is consistency/polish. A rules-contract decision and an untested capability are explicitly different from a confirmed gameplay defect.

| Order | Finding and classification | Evidence / player consequence | Proposed ownership |
|---|---|---|---|
| 1 | **CC-01 · P1 · confirmed** Deal payment preview disagrees with transfer | Legal classic 2M→9M and No Mercy 3M→6M replays; irreversible undisclosed loss | Pure Deal transfer quote → authorized DTO → existing composer; same cost for bots |
| 2 | **TA-01 · P2 · confirmed shared defect** Older room GET can replace a newer snapshot | Installed-query-library probe ends at revision11 after revision12 was accepted; transient backwards hand/turn/result | One monotonic snapshot-ingress function in `useRoom` |
| 3 | **CC-02 · P1 · reference conflict** Classic third-play counter unavailable | Natural legal replay; current Hasbro FAQ says No does not consume a play | Explicit classic printing/rules contract, then engine/options tests |
| 4 | **CC-03 · P1 · confirmed information gap** Rummy groups give no declaration/deadwood verdict | UI groups are not submitted; engine auto-partitions; false declaration costs80 | Pure meld witness and private projection; selected-discard guidance/results |
| 5 | **TA-02 · P2 · source-confirmed recovery defect** Tarot retry loses saved question | Saved GET returns question; component initializes blank and does not hydrate it | Match-scoped draft hydration with dirty/clear semantics |
| 6 | **MBP-01 · P1 decision risk / convention unresolved** Sea Salt stock-ending outcomes unclear | Fresh legal stock0 states produce different score outcomes for Stop/Finish/Last Chance; published references differ | Choose intended convention; project consequence at closure decision |
| 7 | **CC-04/05/06/07 · P2 · confirmed omissions** Exact Deal targets, roulette cause/direction, Skyjo final queue, Teen sideshow/seen status | Missing decision data is often already in engine state but dropped from authorized detail | Game-specific public pending detail; reuse existing table/seat components |
| 8 | **MBP-02/07 · P2 · confirmed omissions/copy defect** Gem Market exact spend and forced-phase guidance | No matching-vs-gold purchase preview; return phase still invites buy/reserve | Private purchase quote and phase-specific selection state |
| 9 | **CC-08/09, MBP-04/06 · P2 · missing outcome explanation** Casino hands/pots, Gang inversion, winning boards | Results show totals/winner without enough reason; unequal-stack Hold'em lead is capability-only | Typed public result explanations, per-game ledger/highlights |
| 10 | **NV-01/02 · P2 · usability** Narrow boards and hidden lower action choices | Internal panning/scrolling exists; Four's seventh column is keyboard-reachable; survey/discovery remains weak | Shared board viewport and bounded action layout |
| 11 | **MBP-03/05/08, CC-10 · P2 · usability/privacy wording** Gang reveal copy, Paper touch inspection, boop preview, Shithead pile tail | Concrete phase/inspection gaps; no hidden-state breach demonstrated | Extend current game components, not a second action framework |
| 12 | **TA-03/04/05 · P2 · art/accuracy/provenance** Selected Tarot rank symbolism, historical-time limits, character usage basis | All78 art exists; selected numbered scenes disagree; pre1970 scope and44 copyright-reference assets need honest treatment | Selective assets, concise calculation label, reviewed usage ledger |
| 13 | **TA-06, MBP-09 · P3** Waiting-member cue wording, depleted Gem row count | Narrow public cue intentionally exposed in backend docs but app-flow wording broader; hardcoded card count | Decide/document exact public boundary; derive displayed count |

Every referenced finding in the linked reviews contains state → issue → evidence → impact → root cause → owner → acceptance. The backlog groups related fixes without losing edition-specific tests. The local heartbeat503 is tracked separately as an unresolved operational observation; it is not enough evidence to label Flip7's engine defective.

## Player journey health

1. **Discover — good.** Games/Rooms separation, category and search controls, recognisable artwork and concise catalogue descriptions support private game night. Retain this structure. The public320 first fold is compact; the whole catalogue is intentionally scrollable. No new homepage redesign is justified by this review.
2. **Create/join — good, bounded verification.** The320 setup presents game, Friends/Bots, seats/name, relevant rules and a single create action clearly. Fresh existing browser tests exercise guest creation, independent invite entry and group flow locally. No fresh production invite, OTP/email delivery or account merge was attempted.
3. **Lobby/ready/wait — generally good.** Distinct ready/host roles and fixed participant snapshots are appropriate. Late arrivals should retain explicit waiting status. Resolve the narrow casino-cue wording contract; preserve the actual hidden-game exclusion.
4. **Play — needs consequential information.** Stable hands and modeless Deal table inspection are worth retaining. Improve exact targets/costs and explain pending special effects, forced phases and touch inspection. Avoid making simple board moves require generic confirmation.
5. **Disconnect/recover — needs one shared fix.** Server version checks/receipts, durable bots and current recovery paths are sound foundations. Close the client ingress race and Tarot saved-question gap. The fresh heartbeat503 needs an isolated transport investigation, not blind retries of a possibly committed move.
6. **Finish/rematch/switch — functioning, explanation incomplete.** Saved result/history/rematch and same-group switching have fresh local coverage. Add per-hand scoring, winning cells/reasons and round ledgers. Retain game-specific score direction and cooperative results rather than one generic leaderboard.

## References: patterns to borrow and boundaries

| Reference and evidence | Useful pattern for Games | Boundary |
|---|---|---|
| [Playdeal](https://playdeal.io/) current public text; prior review/design-reference notes | Spatial property collections; named assets, contextual responses and an inspectable table while composing a payment/counter | Direct browser hit had a certificate error; it was not bypassed. Previously supplied original screenshots/changelog were not present as retrievable source files in this review. Their repository summaries remain historical leads, not freshly viewed originals. Do not claim their current layout or adopt their rules. |
| [Zynga's published iOS screenshots](https://apps.apple.com/us/app/zynga-poker-texas-holdem/id354902315), freshly inspected in browser | Table-centred public bet/seat context, distinct own cards, concentrated bottom action area; useful for Hold'em/Teen Patti/Blackjack | Marketing screenshots, not a played session. Keep private rooms, untimed play and no real-money economy. Rewards/tournament promotions do not belong in the task-focused table. |
| [Board Game Arena's official UX guide](https://en.doc.boardgamearena.com/images/5/57/Guidelines_UX_new_compressed.pdf), current22-page guide | Keep turn/action context concise, organize public vs private zones, support tap-based inspection, prioritize complete playable board view, reserve confirmation for consequential moves | Its platform rules and timed-confirmation suggestion are not requirements for Games. Existing semantic tokens and untimed controls remain authoritative. This was guideline review, not logged-in play. |
| [Wingspan developer update,7 September2026](https://www.monstercouch.com/wingspan-patch-september-7/) | Public card-tray preview exposes top discards and remaining deck/discard counts. Apply that inspectability to Shithead visible pile, Sea Salt stock decisions and Deal public collections | Do not expose unrevealed cards or hidden order; don't copy a large overlay if existing modeless inspection suffices. Current developer documentation, not a fresh installed-game test. |

These are information-design references, not a request to imitate another game's visual identity. Detailed publisher rule sources are cited next to each edition in the subreviews.

## Assets, accessibility and motion

Keep the high-contrast conventional card ranks, distinct game-family compositions, original Gem Market/Word Agents identities, paper-card artwork, Azul tile patterns, boop cats and the complete Tarot visual vocabulary. Existing standard-card provenance and original-art master/prompt records were inspected; the active Tarot character registry honestly distinguishes copyright references from licensed/public-domain material. Credits alone are not permission evidence. No new stock asset pack or UI package is recommended.

Fresh mounted card-inventory checks cover normal/compact canonical faces and yellow-card foreground contrast; fresh casino motion checks cover payment/reveal cancellation under reduced motion and ensure restoring motion does not replay the canceled event. Exact counts are in verification. This is narrower than proving every animation under reconnect/latency. The desired contract is committed versioned events only, initial-load silence, no replay of stale/missed intermediate cues, static outcome visibility with reduced motion, and no movement of targets during a choice.

Manual/automated review does **not** establish full WCAG conformance. Full screen-reader play,200–400% zoom/reflow, all colour-vision cases, real touch on every forced/pending action, motion under actual network partition, and every long-name/translation combination remain unverified. Native44px target checks miss inner scrolling and card text comprehension; the narrow-board and tablet-action findings demonstrate why geometry alone is insufficient.

## Architecture and implementation strategy

Retain Router → Service → Repository, pure engines, registry extension, generated OpenAPI wire types, API-boundary validation, `@games/ui`, and authorized bot projections. Server row locks, expected versions and action receipts are the right place to prevent duplicated or competing commits. Realtime should continue carrying invalidation/revision data, with private snapshots fetched separately.

The recurring root cause is **information lost between adjudication and presentation**. Engines know attachments, declaration partitions, queues and outcome reasons; views often expose only a generic verb/message/score. Add small, game-specific typed detail for those missing facts, project only authorized information, regenerate types and adapt at the client boundary. Reuse `DecisionDock`, existing card inspectors, Deal composer, seat strips and action primitives. Do not send raw engine state, reimplement rules in React, or create a universal schema that erases game-specific semantics.

Bot legality and natural completion have broad seeded/integration evidence. Competence is casual and bounded: Word Agents uses a fixed lexicon, party responses are simulated and Rummy may eventually drop. Natural Rummy declarations are now separately proven in pure engines at2/6 seats, but the corresponding saved/browser declaration flow remains a required acceptance task. Better bot payment costs should use the same Deal consequence quote. No LLM bot or new bot framework is warranted.

See the ordered backlog for implementation boundaries and observable acceptance. Before a future release, repeat the affected local checks, required live/provider or production-permission gates, and verify the actual rollout. This audit makes no release or production-readiness certification.
