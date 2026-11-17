# Word Agents, Party and Tarot — 17 November 2026

Current checkout audit of `3be4108`, including the implementation from `0840f8b`.
Local web `3217`, API `8217`; no production room writes and no reading-provider
calls. This is selected scenario coverage, not a claim to enumerate every state.

## Changes

- **Word Agents:** the four-seat guess board at 320px rendered `Magnet` as
  `Magne` / `t`. Exactly six letters had no soft-hyphen opportunity. The existing
  word-breaking helper now inserts its first opportunity after three letters.
  The existing browser regression inspects actual rendered letter positions;
  it fails before and passes after at 320, 390, 768 and 1440px. Longer words
  retain the same strategy. No Word CSS changed.
- **All three Party covers:** at 320px the existing card fan exceeded its
  two-column poster; Hot Seat's B choice was clipped. Container framing tightens
  and scales the fan, retaining both complete cards. The extended catalogue
  geometry check fails before and passes after at 320, 390 and desktop widths.
- **Tarot:** Six of Wands now has six distinct staffs (the rider and five
  procession staffs); Four of Pentacles retains all four complete coins.
  New PNG masters and 512px WebP derivatives preserve the original atlases.
  Two ImageGen iterations per card; the first outputs were rejected for seven
  staffs and cropped boot coins. Independent inspection accepted the second
  outputs. The 40-card inventory assertion no longer has a count exception.
- **Artwork verification:** the existing explicit Tarot art check still expected
  obsolete `meet` framing. It now asserts current `slice` framing and adds both
  corrected cards, their inspected source bounds and normal room cleanup.

## Coverage

| Game           | Current local evidence                                                                                                                                                                                                        | Limit                                                                                                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Word Agents    | Four natural legal projections: 4/10 seats, clue/guess; 320/390/768/1440; typography, control size, keyboard continuation, saving/disconnected gates. Same-state 320px before/after captures.                                 | No new saved Word match in this subtask.                                                                                                                                   |
| Spill or Chill | Four projections: 3/10 seats, answer/reveal. Actual saved choices on desktop/phone, refresh, another player's same-round update, sibling-tab commit and fresh round. Ten-seat 320px screens inspected.                        | Selected scenarios, not every prompt.                                                                                                                                      |
| Most Likely    | Four projections: 3/10 seats, vote/reveal. Same saved-room recovery checks; ten-seat vote/reveal manually inspected at 320px.                                                                                                 | Selected scenarios, not every tied vote configuration.                                                                                                                     |
| Hot Seat       | Six projections: 3/10 seats, predict/spotlight choose/reveal. Same saved-room recovery checks; all three ten-seat phases inspected at 320px.                                                                                  | Selected scenarios, not every possible prediction distribution.                                                                                                            |
| Tarot          | Four natural spread projections. Actual local solo reveals, roving focus, saved-spread refresh and unsent-question refresh. Saved-room WebP gallery cards inspected at 320/390/1440. Four minor-suit contact sheets reviewed. | Finished reading/credits/rematch use constructed responses; no provider call. Corrected-card spread crops use constructed card placement, not a claimed saved random draw. |

Corrected-card framing also uses the current rendered card markup in the real
choosing/reading spread styles. These deterministic **constructed** probes
measure art-box aspects from 0.752 to 0.848 at 320/390/1440px; all six staff tips
and four coin boundaries stay inside. Gallery and constructed spread images were
visually inspected after image decoding. Gallery screenshots are actual saved
room UI; no synthetic reading was required for them.

## Checks

- `pnpm exec playwright test tests/browser/crowded-board-party.spec.ts --workers=1`: **4 passed**.
- `pnpm exec playwright test tests/browser/party-recovery.spec.ts tests/browser/tarot-table.spec.ts --workers=1`: **8 passed**.
- `pnpm exec playwright test tests/browser/library-browsing.spec.ts -g 'new catalogue illustrations' --workers=1`: **2 passed**.
- `GAMES_TEST_URL=http://127.0.0.1:3217 pnpm exec playwright test tests/browser/tarot-art-hosted.spec.ts --project=desktop --workers=1`: **1 passed**, one local room created and closed; subsequent GET404 verified. This suite remains opt-in through `GAMES_TEST_URL`; the run here used local3217, not production.
- `pnpm exec vitest run apps/web/src/tests/party.test.tsx apps/web/src/tests/table-layout.test.tsx apps/web/src/tests/tarot-reading.test.tsx`: **22 passed**.
- `pnpm exec vitest run apps/web/src/tests/tarot-artwork.test.tsx`: **3 passed**.
- Browser TypeScript and affected Word/Party formatting passed. Final integrated frontend verification belongs to the parent release task.

Evidence and detailed scope are in `party-tarot-art.json`; selected local captures
are under `output/playwright/current-app-audit-20261117/party-tarot-art`.

## Cleanup

Two Party rooms and seven solo Tarot rooms were closed by their suite cleanup.
Party and explicit artwork suites assert later GET404; `tarot-table` asserts
abandon/leave200. Thirteen local guest identities remain for normal retention.
The task's named CLI browser was closed. Removed 44 verified disposable paths
(6,162,627 bytes): superseded failures/trace, duplicate captures and exact named
CLI scratch files. Selected before/after and gallery/spread evidence remains.
Existing web3217, API8217 and Storybook6105 returned HTTP200 afterward; the
original Postgres service and other browser sessions were preserved.
