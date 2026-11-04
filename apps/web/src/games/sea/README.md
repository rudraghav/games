# Sea Salt & Paper table

The table consumes the authorized projection and server-enumerated actions. It
never decides an outcome; labels that describe consequences (duo effects, the
Stop and Last Chance stakes) come from the projection or mirror the published
rules for display only.

## Glanceable order

1. **Round results** come first at a round end (and stay as a one-line, expandable
   “Round N result” during the next round, so a bot starting the next round never
   hides what happened). The summary names the outcome (Stop, Last Chance worked or
   failed and who beat it, stock exhaustion, four mermaids) and every player’s
   award with its parts.
2. **Last Chance banner** names the caller and the card points to beat (protected
   hands are public, so their points are projected).
3. **Private notices** (`detail.private_events`) are shown only to the seat they
   belong to: the thief sees “You took Green Octopus from …”, the victim sees
   “… took your Green Octopus” (a name only, never the card ID now in another
   hand), and fish draws and crab takes name the card. New cards carry a “New”
   badge until that seat draws again.
4. **Your private decision** (keep one of two, choose a pile to search, the
   searched pile, steal target) sits before the public table. Docks use
   `DecisionDock size="fit"`: nothing scrolls inside a fixed box and no bar ever
   covers the cards being chosen. Keep buttons say which card each pile would
   cover; pile choices show each top card; steal targets show hand size and score
   and list protected players as unavailable.
5. **The sea** (stock count, both discard tops with counts) is visible in every
   phase for every seat. Tapping a discard opens the inspector, which never takes
   it; only an explicit “Take …” button (or the inspector’s Take) commits.
6. **Your hand** shows every card at once: full cards on wider screens, a
   three-column grid of compact cards on phones. Duo selection and its effect
   summary stay until the move commits; a valid duo becomes the primary action.
7. **Collections** of played duos; revealed (protected) hands open automatically
   with their card points.

Unsent selections use `useTableDraft`, scoped to room, match and version, so they
survive a refresh but never carry into a later decision.

## Card faces

`PaperPlayingCard` paints the scoring colour three ways: a full-width colour band
with a per-colour glyph and the colour name (12px, at least 4.5:1 on its band),
the folded-paper illustration re-toned in that colour (an SVG duotone filter in
`PaperCardArt`), and the card edge. Multipliers carry a “+N / kind” badge. The
illustrations come from `paper-symbols-v2.webp`, a padded atlas derived from the
preserved v1 master by `scripts/prepare_paper_symbols.mjs`, so no neighbouring
artwork bleeds in and no subject is cut.

## Verification

`sea-cats-games.test.tsx` covers disabled keep actions before a selection, steal
notices for thief and victim, round summaries and Last Chance stakes;
`illustrated-pieces.test.tsx` covers every colour’s band, glyph and tone.
`crowded-modern.spec.ts`, `modern-board-fixes.spec.ts`, `stable-game-tables.spec.ts`
and `sea-cats.spec.ts` exercise legal harness states and live rooms. These checks do
not by themselves prove every combined game state.
