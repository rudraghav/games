# Dashboard discovery and private entry

Local implementation and browser evidence, 1 November 2026. The baseline public
home contained 26 experiences; the inspected final home includes the concurrently
implemented Shithead, for 27. This subtask did not push or deploy.

The home now keeps search and Players on one row and categories beside Reset on
another. At 390px the first game begins at 384px, compared with roughly 440px in
the baseline capture. Both main phone actions retain full rows. Active member
rooms occupy a single scrolling row before the catalogue; finished rooms follow
it. A 320px header uses a labeled Create icon to preserve every action.

Just me and Solo + bots preserve the choice when opening setup; supported games
show You + bots and open Bots mode. Joining accepts a raw room code or complete
invite URL. The parser extracts the token locally and never follows that URL.
Create setup states invite-only privacy once. No room publicity, identity or
database changes were made: the existing recent-room query joins the actor's
active memberships, and room reads enforce active membership. Browser tests prove
that an authenticated outsider cannot read the test room or see its shortcut.

Cover composition reuses canonical card faces and original district, tile and
piece art. Uno uses actual actions, Deal uses real colors/effects, casino covers
add felt/chips, and Shithead shows both table rows. Checkers/Reversi/Four in a Row
keep their real board shapes. Skyjo, Tarot and word tiles now fit narrow posters.
The three contact sheets include every cover; all were visually inspected.

- Before/after: [phone before](before-phone-390.png), [phone after](after-phone-390.png),
  [320px after](after-narrow-320.png), [desktop before](before-desktop-1440.png),
  [desktop after](after-desktop-1440.png), [member shortcuts](member-phone.png).
- Cover sheets: [320px](covers-320.png), [390px](covers-390.png), [1440px](covers-1440.png).
- [Measured geometry](geometry.json): 27 tiles at every width, no page overflow,
  no clipped playing/Tarot/word card frames, and all 17 distinct cover image
  sources load. Final captures hide only Next's development indicator.

Verification: five focused unit tests; six new phone/desktop private-entry, solo
and board-cover cases; all 16 existing browsing/board cases across the initial run and a
targeted rerun after fixing Skyjo. The final four geometry/rank cases and two
focus-return cases pass after the cover fixes. Web TypeScript, browser TypeScript,
scoped ESLint and diff whitespace checks pass. Test-created rooms were left by
all participants and verified inaccessible afterward. Stories cover catalogue,
solo metadata and long-name/member shortcuts. Parent release gates own production
builds, Storybook builds and deployment verification.

The two additional real-room cases check every cell of Checkers, Reversi and Four
in a Row in both lobby and member thumbnails at 320/1440px. They caught a phone
transform-origin inheritance that is now centered for these small board covers;
both cases pass and every QA room was closed. The source module README documents
the new discovery/shortcut ownership and links to this evidence.

Cleanup closed only the dashboard-20261101 test browser and removed 16.3 MiB of
its duplicate captures/traces/logs after retaining these summaries. Requested
web3217 and API8217 still return HTTP200; other browser sessions, artwork,
credentials, dependencies and databases were preserved.

Research used [Apple's search-field guidance](https://developer.apple.com/design/human-interface-guidelines/search-fields)
for controls near their filtered content and [Board Game Arena's official FAQ](https://en.boardgamearena.com/faq)
for invitation-based friend tables. All rendered artwork remains the existing
licensed or Games-original assets; no additional dependency or UI kit was added.
