# Rummy, casino, Skyjo and Gang audit fixes — 2 November 2026

Local implementation and verification complete. Parent task owns integrated
checks, generated contracts/fixtures, root docs/progress, commit and push.

## Delivered behavior

- Rummy uses a bounded, shared pure partition search for both adjudication and
  private explanations. Each legal discard has a server-produced valid/invalid
  witness, sequence/pure counts, scoring gate, unmatched cards and capped loss.
  The browser explains the selected discard before commitment, confirms a false
  declaration's 80-point penalty, describes visual groups as visit-local and
  nonbinding, and explains signed settlement transfers. Legacy results without
  a recorded finish reason use neutral “Points settled” copy.
- Teen Patti exposes public Blind/Seen status and named sideshow requester,
  responder, paid cost and eligible target. The UI explains wager range/parity
  and accept/decline consequences without exposing pocket cards.
- Blackjack identifies the active split hand only for the acting viewer and
  explains separate per-hand and insurance stakes, returns and net amounts.
  Settlement/explanation share one pure hand calculation. Dealer hole-card
  information remains concealed until settlement.
- Hold'em uses the same public contribution layers for live eligibility and
  settlement. Results record exact awards, odd chips and unmatched refunds.
  Best-five/category/kicker explanations use the existing evaluator and only
  publicly shown hands. Folded/unshown hands remain concealed.
- Skyjo displays the ordered, shrinking final-turn queue and final-grid,
  removed-column, multiplier, round-point and cumulative-point ledger.
- Gang changes the privacy caption after reveal, explains public best-five
  hands, and compares the declared/evaluated orders with failed adjacent
  comparisons. Exact ties remain valid in either order.

All frontend detail parsing stays at the API-client boundary. Existing UI
primitives/classes are reused; no shared CSS or route changes were required.
Matching game module READMEs document the behavior and evidence limits.

## Verification actually run

1. `backend/.venv/bin/pytest backend/tests/test_casino_explanations.py backend/tests/test_table_rules.py backend/tests/test_card_family_rules.py backend/tests/test_coop_number_games.py -q`
   — **179 passed**. Covers privacy invariance, selected-discard/adjudication
   parity, meld/scoring gates, viewer-specific split context, natural/split-21
   payouts, insurance, side-pot/refund/odd-chip amounts, poker wheel/kickers,
   public sideshow context, final-turn queue at 2/8 seats and Gang reveal/order.
2. `backend/.venv/bin/python scripts/isolated_backend.py tests/test_rummy_declaration_rooms.py -q -s`
   — **2 passed**, schema migration/check passed in a disposable database.
   Ordinary shuffled setup seed 31; every subsequent action goes through HTTP,
   and the policy sees only that actor's authorized HTTP projection and memory.
   **2 seats: 38 legal moves; 6 seats: 32 legal moves.** Both finish by valid
   declaration with no drops. Every participant's history, exact persisted
   result, receipt count, zero-sum scores and fresh application-lifespan
   readback are asserted. No card swaps, near-terminal fixture injection, or
   hidden engine state enters the decision policy.
3. `pnpm exec playwright test tests/browser/casino-explanations.spec.ts --output test-results/casino-explanations`
   — **12 passed** across desktop and phone. Checks actual rendered Rummy
   witness/valid-declaration/result flow, invalid-declaration cancel, public
   Teen Patti context, Skyjo queue/ledger, Gang reveal/best-five, horizontal
   fit, and a naturally dealt Blackjack round whose settlement survives a
   browser reload. Rummy/Gang/Skyjo/Teen Patti browser scenarios are explicitly
   synthetic legal-trajectory projections; Blackjack uses real local room
   persistence. A manual 390px Rummy result render was visually inspected;
   retained screenshot: `rummy-score-phone.png`.
4. `pnpm exec playwright test tests/browser/game-information.spec.ts --grep 'blackjack totals|blind play' --output test-results/casino-information-regression`
   — **4 passed**: existing visible blackjack totals/split rails and changed
   Teen Patti/Skyjo copy at desktop and phone.
5. `pnpm exec vitest run apps/web/src/tests/card-workspaces.test.tsx apps/web/src/tests/game-information.test.tsx apps/web/src/tests/coop-number-games.test.tsx apps/web/src/tests/casino-motion.test.tsx`
   — **20 passed**.
6. API-client and web `type-check` passed. Scoped `mypy` passed all 8 affected
   Python source targets; scoped Ruff and ESLint passed. Prettier passed all
   affected UI/adapters/browser tests. `git diff --check` passed.

Initial browser failures were harness errors (an exact label locator included
option text, and textContent was compared to innerText), corrected before the
12-case passing run. No product check was disabled. Full tests TypeScript
briefly reported unrelated modern-board fixture optional fields; the parent
and owning agent were notified for integrated verification.

## Limits and cleanup

Unequal-stack Hold'em cases are explicitly **capability fixtures**, not claims
of naturally reached unequal-stack rooms in the reset-to-200-chip format.
Natural Rummy declaration persistence is proven via HTTP, while its graphical
precommit/result flow is proven in the legal-trajectory browser harness.
This subtask makes no deployed/live-hosted release claim.

The isolated runner created and dropped its own temporary database. All four
local Blackjack rooms created across the initial text assertion failure and
corrected run were left, with 404 readback; no room remains active. Their
application-managed synthetic history/profile records are retained. Task-owned
browser processes/contexts were closed. Scoped disposable browser output
folders were removed after recording results (or had already been cleared by
another test run); the concise evidence note and one selected screenshot are
retained. Existing services, user browser sessions, unrelated source and
working data were preserved. No new server, worktree, dependencies or secret
files were created by this subtask.

Integration review: the broad browser run caught the new Gang explanation pushing
revealed hands away from the private hand. The explanation now follows the public
hands, preserving the compact next-action/reveal relationship. The older Blackjack
layout fixture now supplies playing phase and the authoritative active-hand index.
