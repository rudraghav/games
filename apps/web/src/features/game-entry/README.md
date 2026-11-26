# Game entry

The public `/games/[gameId]` server route validates the generated catalogue and
renders GameEntry. Opening it creates no guest, room or match. GameArt, Button,
SiteHeader and RoomDialog are shared. The rules disclosure sits in the secondary
action row and controls the illustrated document below. Friends setup fixes the selected game. `?mode=bots` only changes action
emphasis. Tarot places the crystal-and-brass still life beside the start action on desktop and above it on phones. Starting opens card selection directly.

For games with several table sizes, **Play with bots** opens a **Number of bots**
selector. The options use the catalogue's player limits, with one seat for
the person starting the game and at least one bot. The smallest supported
count is selected initially. **Start game** launches the selected number of
Hard bots. A fixed-size table names the count on its launch button and starts
immediately. Tutorials keep their own direct launch from the rulebook.

useQuickPlay starts only from an explicit click. It stores a launch UUID in
sessionStorage per game, blocks duplicate taps and reuses the UUID after a lost
response or refresh. The server atomically returns the existing or new match.
409/410 requires an explicit new-launch click. Storage restrictions preserve
same-page recovery; changing pages while pending never navigates on completion.
Successful starts cache the authorized room and refresh the player query before
the private renderer loads. The default Guest is server-owned; existing profiles
are preserved.

`shared/game-paths` owns canonical URLs. Active Tarot spreads, multiplayer rooms
and immutable readings retain separate paths. Legacy routes remain compatible
and canonicalize only after authorized data loading. Back to Tarot leaves an
unfinished spread saved for Your games.

Verify with the frontend, contracts and multiplayer groups, plus
`tests/browser/game-entry.spec.ts`. The browser suite checks public no-write
browsing across the registered catalogue, mobile geometry, direct starts, duplicate/lost
responses, profiles, invitations, private cards, refresh and old links without
calling an AI provider. Archive and Tarot table suites cover saved-reading
navigation and paused-session recovery separately.

Normal play launches with coaching off. The closed **Rules & tutorial** disclosure
opens the shared illustrated rulebook without creating a session. It contains
the game objective, three worked examples, the rules reference and **Play tutorial**.
Only that last action starts a guided session. An interrupted tutorial can be
retried directly from the rulebook. Ordinary play and the tutorial keep separate
request IDs and share one in-flight guard. The guide is scoped to the match
and its player. The explicit tutorial URL also works when storage is unavailable.

Roulette and Slots use Play solo to start a private five-spin table. The game-specific play URL supports refresh, and Past games links to the profile. A completed spin history has its own game-specific results URL keyed by the original match.

Secret Santa uses Organise a draw to open the organiser's private page, with a
short description in place of the player count.
