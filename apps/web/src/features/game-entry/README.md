# Game entry

The public `/games/[gameId]` server route validates the generated catalogue and
renders GameEntry. Opening it creates no guest, room or match. GameArt, Button,
SiteHeader and RoomDialog are shared; the native rules disclosure needs no extra
state. Friends setup fixes the selected game. `?mode=bots` only changes action
emphasis. Tarot has no setup form, invite or lobby before card selection.

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
browsing across all 27 games, mobile geometry, direct starts, duplicate/lost
responses, profiles, invitations, private cards, refresh and old links without
calling an AI provider. Archive and Tarot table suites cover saved-reading
navigation and paused-session recovery separately.

Play tutorial launches the same real match with its own idempotent intent. Both start
buttons share one in-flight guard. The guide preference is scoped to the match
and its owner. The explicit tutorial URL also works when storage is unavailable.
How to play offers three illustrated examples followed by the original game rules.
