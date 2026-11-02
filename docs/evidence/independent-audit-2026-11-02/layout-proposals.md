# Concrete layout and shared-component proposals

These are implementation specifications derived from the current audit, not changes to the app. Preserve existing tokens, cards, buttons, selection semantics, registries and server authority. Use actual legal evidence fixtures for design acceptance; no invented success data. Breakpoints below describe behavior at the requested widths, not mandatory new CSS breakpoints.

## 1. Deal: exact consequence beside the selected assets

Retain the modeless `DealComposer`, stable hand rail, bank/set tabs and View table affordance. At1440, place public collections in the main area and the bounded composer beside them. At768, keep table and a concise composer where space allows, without shrinking properties into unreadable thumbnails. At390/320, use one full-width composer with inspectable table behind/below it and an explicit return to the same pending choice. Do not vertically reserve the desktop's entire collection area on a short phone when a reaction needs only one target.

```text
Sam requests 5M rent · Green set · doubled
Selected: Park Lane 2M
Also transfers: House 3M + Hotel 4M
Total leaving your table 9M · Overpayment 4M
[exact cards/collection, with carried items visibly linked]
Clear selection        View table        Pay 9M
```

The amounts above illustrate the confirmed attachment mismatch, not a change to the game's mechanics. The server quote must define actual transferred IDs, values and attachment rule for the chosen edition. Only display an overpayment based on the exact current bill and quote. Banking a card stays visually distinct from paying it. For Sly/Forced/Breaker, replace generic “action blocked” with the exact public asset exchange and highlight those cards in the table. Counter/counter-counter keeps that same context.

**Contract/owner:** Deal pure quote → authorized `detail` → generated API → typed adapter → existing `DealTable`/`DealComposer`. **Acceptance:** all quoted IDs equal committed IDs in both legal replay files; selected+carried duplicate IDs counted once; cancel/inspect/refresh preserve context without committing; blind effects reveal public category only. Compare at320/390/768/1440 with max seats, crowded sets and long names. Selection must not move the bank, hand or primary action.

## 2. Rummy: arrange with a real declaration explanation

At1440 show the fourteen-card hand and four group lanes together, with a narrow declaration panel. At768 use two lanes per row. At390/320 keep a scrollable hand with visible continuation, then compact labelled groups that expand on selection; the proposed discard and declaration summary stay adjacent. Avoid horizontally scrolling the hand, group controls and confirmation as one wide unit.

```text
Selected discard: [card]
Automatic best declaration after this discard
✓ Pure sequence   ✓ Second sequence   2 unmatched cards
[tap/keyboard inspect the actual witness groups]
This declaration is invalid · penalty 80
Clear             Discard [card]        Declare…
```

Use actual server analysis, including a different valid partition from the player's visual organization where necessary. Explain that visual groups organize the hand and the server checks the best partition; do not pretend the groups are submitted. Once genuinely valid, show the accepted partition and allow confirmation without redundant warnings. If deliberate false declaration remains allowed, use one consequence confirmation. Show deadwood/scoring gate before a drop and in the result. Keep all opponents' cards concealed until rules authorize reveal.

**Contract/owner:** pure `melds` explanatory witness scoped to the viewer and candidate discard, not duplicated frontend rules. **Acceptance:** joker/Ace/sequence edge cases from CC-03; selection clear/edit; refresh preserves or clearly resets organization; natural2/6-seat declaration traverses saved result, history and rematch.

## 3. Casino: explain public stakes and each settlement

Retain the oval/panoramic table at desktop, visible community/dealer cards, fixed seats, private own-hand panel and existing bet controls. At phone, prioritize community/dealer → current actor and cost → own hand/action. Keep all opponents reachable in one compact seat strip rather than shrinking seven to ten complete panels. A tapped seat exposes full name, stack, street contribution and public status; it never exposes a concealed hand.

For Hold'em, show call cost and legal min/max raise beside the control. Add an inspectable pot list with amount and eligible seats when the engine supports multiple pots; normal equal-stack one-hand rooms need no permanently expanded side-pot panel. Settlement shows best five/category/tie basis, refunds/odd-chip allocation where applicable. Do not infer future side-pot eligibility from frontend arithmetic.

For Teen Patti, show every seat's public Blind/Seen status and name the sideshow requester/responder in both directions. For Blackjack, show **active split hand** beside actions, dealer's visible total separately from concealed hole card, and a per-hand result with stake, natural/dealer-blackjack, insurance and net return. A single generic player total is insufficient after splitting.

**Contract/owner:** casino authorized detail/result ledger, existing `CasinoTable` and controls. **Acceptance:** last remaining player, calls/raises/refunds/ties; synthetic unequal-stack capabilities explicitly separate from reachable current-room fixtures; insurance/resplit/double outcomes separately exercised; no initial/reconnect cue replay.

## 4. Skyjo, Gang and boards: make the ending visible

Skyjo retains its stable3×4 own grid and opponent mini-grids. Put the ordered remaining final actors beside the final-turn instruction; remove completed actors as turns commit. At round end replace the empty action area with revealed grid total, removed columns, closer adjustment, round delta and cumulative total. Reuse the existing seat strip for active/finished state rather than new badges everywhere.

Gang changes its private-hand copy when cards become public. Its result pairs declared chip order with evaluated hand order and identifies the first inversion with best-five/tiebreak explanation. Team alarm/safe remains the primary outcome; don't introduce an individual winner leaderboard.

Four highlights the actual winning four; checkers names elimination, blockade or precise draw rule; boop identifies three-cat or eight-cat victory. Reversi/Mancala keep final counts and explain pass/sweep where relevant. Reasons come from the engine, not a browser recomputation.

**Acceptance:** public result remains understandable with reduced motion and after refresh; diagonal/vertical/horizontal Four, checkers draw reasons and both boop wins; no highlight on a merely pushed opponent line before its winning condition is legally evaluated.

## 5. Narrow boards and bounded decision areas

At320, the current44px interaction policy plus board gutters makes a complete7/8-column board wider than its container. Native internal scrolling preserves access; simply shrinking every button or declaring the last column blocked would be the wrong conclusion.

Prototype a **whole-board overview plus selected-region interaction** for dense8×8 boards, or reduce nonessential gutters enough to fit when usable controls remain possible. If horizontal panning remains, show a persistent edge continuation cue and a clear fit/overview affordance using existing primitives. Four can use full-width column controls tied to the board, with explicit accessible names; Mancala should keep both stores visible or clearly linked to the pan overview. Use target-size testing and actual touch to choose, rather than introducing a global zoom library.

At768, four colour alternatives must use a2×2 group or compact single row that fits the decision panel. The current one-column tablet arrangement hides lower options inside a160px scroller. For longer menus, expose continuation and focus-following scroll. Maintain a stable reserved decision footprint per family; allow controlled expansion when the alternative is hidden consequential choices. Do not make every turn's action count cause table jumping.

**Acceptance:** novice can find all four colours and first/last board actions at each width without being told where to scroll; keyboard focus stays visible; touch does not accidentally commit while inspecting. At200% zoom, the same choice remains reachable. Current Four keyboard reach is a baseline to preserve.

## 6. Market, Paper and boop: inspect before spending/choosing

Gem Market shows one selected development's printed cost → permanent discount → matching tokens/gold spent → resulting wallet. Display the current forced return count or eligible patron choice in that same decision area; don't keep buy/reserve copy in those phases. Keep original art/inventory; no Splendor reskin. Derive tier-card counts from current public rows.

Sea Salt & Paper needs a dedicated inspect affordance on compact discard/choice cards that works with tap, keyboard and pointer independently of commitment. Preserve card family, colour, pair effect and scoring text. At stock exhaustion, the Stop/Last Chance/Finish options explain the selected rules convention before commitment. Crab inspection must still reveal only the authorized discard pile to the actor.

boop graduation uses one tap/focus to preview the exact triplet and a distinct confirm action for that consequential choice; ordinary placement remains direct. Empty selection/cancel restores the same board. Coordinate labels stay as accessible alternatives, with cats/kittens visibly distinct.

## Shared component plan

| Existing layer/pattern | Surgical extension | Keep out |
|---|---|---|
| `useRoom` / query boundary | One monotonic snapshot acceptor, match-aware reset and equal-version presence handling | New state library, blind polling escalation |
| Engine authorized `detail` + generated client | Game-specific quotes, pending kinds, witnesses, queues and outcome reasons | Raw hidden state; handwritten wire interfaces |
| `DecisionDock` / `ActionPanel` | Context/selection/primary action slots; visible alternative layout; stable family footprint | Generic confirmation for every move; long repeated rules text |
| `PlayerStrip` / casino seats | Full-name inspection, public status, explicit next/final actor where meaningful | Per-seat redundant badges or private data |
| Existing card/collection inspector | Tap/focus/pointer parity; exact asset context and optional rules explanation | Hover-only essential rules, duplicate inspector system |
| Per-game result views | Public typed reason + ledger/winning cells using existing typography/tokens | Browser-determined winners or one leaderboard for cooperative games |
| Semantic tokens/typed variants | Reuse focus, spacing, selected/disabled and primary/secondary states | New CSS theme, animation framework or asset pack |

Treat these as focused increments with before/after legal fixtures, independent expected outcomes and local browser acceptance. Keep private rooms, optional accounts, untimed turns, game-specific rules identities and protected hidden information throughout.
