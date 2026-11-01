# Room design audit — 1 November 2026

Current task evidence, captured before and after the shared room changes. The
before review includes 88 local synthetic screenshots (44 minimum/maximum table
scenarios on both widths) and 24 production captures across eight game families,
using four isolated guests in one room that was closed afterward. Production
before source: `78526f0ff5ca8546a97bdbf70343169912cdcb53`.

The after evidence is the local working tree based on `df318d7`, with the new
library and room changes. It is not proof of a production deployment. Desktop
width is 1440px; phone width is 390px. Invite panels are masked deliberately.
Before and after lobby images use different games and seat counts; they show
shared patterns, rather than a pixel-matched comparison.

1. **Lobby — improved.** Long names now wrap. The mobile room title has a
   dedicated readable row. Invite, ready and start controls occupy complete rows.
   The former global poster-position override and inherited inset caused excess
   stacking or title overlap; explicit mobile anchoring now keeps illustrations
   beside the title. All four new game posters pass a non-overlap check.
2. **Turn and decisions — improved.** Shared notices distinguish the normal
   actor, another player's legal reaction, simultaneous/locked choices, paused
   play and completion. The player strip reveals the actor horizontally without
   scrolling the page. Flip 7 decisions precede crowded player piles; Gem Market
   selection controls stay reachable; Rummy controls use their intended size.
3. **Secondary controls — improved.** A vertical kebab opens grouped full-width
   host controls in the existing Radix dialog. Ending a match requires a separate
   confirmation. A real browser check found that controlled dialogs lost keyboard
   focus on Escape; the shared dialog now restores its actual opener and defers
   when another dialog has replaced it.
4. **Results and rematch — verified locally.** Independent players finished two
   natural competitive matches, refreshed saved results and started rematches.
   Cooperative defeat is separate from a draw; penalty scores sort low first
   with a single rule note; no-score games preserve identity rows. These last
   three result variants have focused unit tests and Storybook states.
5. **Pending/disconnected states — verified locally.** Both widths disable move
   buttons while saving or paused. Phone move controls retain full rows and
   minimum 44px targets. These are synthetic state checks, not claims of a
   naturally interrupted match.

Five focused browser cases pass: two real room workflows, two pending/paused
state cases, and one phone lobby case covering the four new games. Five focused
presentation unit cases, web/UI types, browser-test types and web lint pass.
Every created room is closed through the authorized API with a 404 readback;
isolated browser contexts close afterward. No account settings were changed.
Broader engine/full-match and production acceptance is recorded by the owning
release, not inferred from this visual review. This is not a full accessibility
certification.

Selected inspected images:

- [Production lobby before](lobby-before-phone.png)
- [Local lobby after](lobby-after-phone.png)
- [Grouped room options](options-after-phone.png)
- [Natural result and rematch](results-after-phone.png)
- [Paused maximum-hand scenario](paused-after-phone.png)
- [Sea Salt & Paper lobby](paper-lobby-after-phone.png)
- [boop. lobby](boop-lobby-after-phone.png)

See [checks.json](checks.json) for concise source and acceptance metadata.

The subsequent hosted phone check exposed a guest-entry identity race. Its exact
cause, sanitized timing evidence and corrective local coverage are recorded in
[identity-race.md](identity-race.md); the earlier local success does not supersede
that production finding.
