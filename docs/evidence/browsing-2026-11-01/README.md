# Browsing and mobile setup verification — 1 November 2026

Local app at `127.0.0.1:3217`, based on `df318d7` plus this task's uncommitted
26-game implementation. These captures establish current local behavior, not a
production deployment. All images were opened and inspected after capture. The
room setup screenshots contain blank public forms, not saved invite links or
private room state.

## Verified flow

1. Browse the catalogue: one search row, category pills, group controls and one
   result count. Desktop wraps pills; phones contain their scrolling rail inside
   the page. Reset reveals the selected All games pill again.
2. Search familiar names: apostrophes, punctuation, case and accent normalization
   work with engine names and documented aliases. Sea Salt & Paper appears under
   Cards/Modern; The Gang appears under metadata-driven Co-op.
3. Combine filters: Cards + four people + Sea Salt & Paper returns one game; five
   people returns the empty state. Clear search/Escape retain other filters.
   Reset filters restores the full catalogue and keyboard focus to search.
4. Start or join: phone hero CTAs occupy separate full rows. Room setup groups
   avatars into four columns, stacks Seats/Room name, and gives submit/cancel
   separate full rows. Room code's icon aligns with its label. Forms remain
   scrollable on a 320px phone, without horizontal page overflow.
5. Inspect new artwork: The Gang, Sea Salt & Paper, boop. and 6 nimmt! were checked
   at 1440, 390 and 320px. Complete number 104, card corners, chip and all original
   illustration frames fit their posters. An initial clipping regression and an
   oversized desktop cat frame were corrected, then both viewports rerun.

## Checks

- Five discovery unit tests passed, including aliases, category/player
  intersections, registry order, cooperative metadata and paper family mapping.
- Web TypeScript and targeted ESLint passed.
- Twelve distinct browser cases passed across desktop/phone: four browsing/setup
  cases per viewport, plus existing catalogue/rank/icon checks. Setup's final
  label-alignment adjustment received two fresh passing cases.
- Phone layout assertions include 320 and 390px; poster geometry covers all four
  new games at both phone widths plus desktop. Keyboard filter activation,
  focused clear/reset, pressed states, reduced motion and result announcements
  were exercised.
- Broader production rollout, full-match acceptance and complete release gates
  belong to the parent release record. This pass makes no blanket accessibility
  compliance claim.

## Retained captures

- [Desktop catalogue](library-desktop.png)
- [Phone catalogue](library-phone.png)
- [Desktop create form](create-desktop.png)
- [Phone create actions after scrolling](create-phone-actions.png)
- [Phone join form](join-phone.png)
- [The Gang at 320px](The-Gang-320.png)
- [Sea Salt & Paper at 320px](Sea-Salt-Paper-320.png)
- [boop. at 320px](boop--320.png)
- [6 nimmt! at 320px](6-nimmt--320.png)
