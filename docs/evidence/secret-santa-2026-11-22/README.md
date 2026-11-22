# Secret Santa — 22 November 2026

## What it is

A solo organiser game (`secret-santa`, family `organiser`). The organiser types the
names (3 to 30), sets an event title, date, location and budget, says who must not draw
whom, and draws. Nobody else joins the room or needs an account.

- Exclusions per person: a checklist of who that person must not be paired with. It
  applies both ways.
- Exclusions by group: people in the same group never draw each other.
- The server draws: nobody gets themselves, no excluded pair, no shared group. If no
  such draw exists, the Draw button stays off and the table says why in one sentence.
- Each person gets a private link `/santa/<token>` showing only their own draw and the
  event details. There is also a pass-the-phone reveal on the organiser's device.
- The organiser's table never lists who drew whom. It shows who has opened their name.
- A redraw returns to setup and stops the old links; Finish closes the event and the
  links keep working.

How DrawNames does it, from its public pages: names, a group name, budget and date;
"who can't draw whom"; draw on the site or a link per person; no accounts; nobody draws
their own name. A group exclusion and a location field were not shown there and are
built to the owner's description. Wish lists and anonymous questions are not included.

## Secrecy

- The assignment exists only in the saved match. The organiser's view, the room JSON
  and public activity never contain a recipient, except the one name on screen during a
  pass-the-phone reveal.
- Link tokens are derived, not stored (HMAC over match, draw number and person). A bad
  or outdated link is one fixed 404; 10 bad links in 10 minutes answers 429.
- The token is part of the URL path. The app's own logs redact it; the hosting
  platform's request log would still record the path, as it does for invite links.
- The organiser holds every link, so they can open one. Doing so marks that person as
  opened on their own table.

## Fairness of the draw

Four people have 9 possible draws: over 1,800 seeded draws all 9 appeared, each 150 to
250 times (200 expected). 120 random lists of 3 to 30 people with random groups and
pairs each gave a valid draw. A list with exactly two possible draws produced both.

## Checks

- `scripts/verify.py frontend backend contracts tooling multiplayer migrations`: pass
  (433 unit tests, 8,053 backend, 328 multiplayer, 1 migration), with room setup and
  Secret Santa both in the tree.
- `scripts/verify.py browser`: 505 passed, 76 skipped, 3 failed. Both kinds of failure
  were in tests, not the app, and pass after the fix: the table-density check did not
  know the new table's root element (2 failures, desktop and phone); a Tarot keyboard
  test reached its second draw inside the deck's 400ms tap guard on a fast run (1
  failure; it now waits the window out and passed 10 of 10 repeats).
- Real flows, desktop and phone projects (`tests/browser/secret-santa.spec.ts`, 26
  passed): six names including a pasted list and a duplicate, details, an exclusion, a
  group, draw, links, a second guest opening links and getting a valid recipient, the
  organiser seeing Opened and no pairing, pass-the-phone, redraw killing the old link,
  finish.
- An independent run in a real local room at phone size: five names, one excluded
  pair, one group; two links opened on a second phone context each showed a valid
  recipient; the second context got 404 on the organiser's room.

## How these were run

Docker Desktop was down throughout (the disk had filled). Database-backed checks ran
against a temporary PostgreSQL 17 cluster in the session's scratch folder.

## Not verified

- A real share sheet and native phone date pickers (Chromium only; the share sheet was
  stubbed).
- `tests/browser/hosted.spec.ts` and the unfiltered full-match run were edited for the
  new game but not run.
- The Storybook story was type-checked, not rendered.

## Release

- Production migration to `c4d19e7b52a6` applied first, then commit
  `7936ef5fe7883e66500f8ddb311bc50251419b9c`, deployment
  `dpl_6rnpqeXepHw48byTn9ryZZJaeqQV` (production, READY).
- Live with two phone-sized guests: Secret Santa draw with an excluded pair and a
  group, two private links opened with valid recipients, organiser saw Opened and no
  pairing; a Uno room with a renamed Easy bot, a six-digit code and `/r/<code>` joined
  by the second guest; username claimed, found by search, invited, invitation shown on
  the home page and accepted.
- Runtime errors and 5xx requests since release start: none. Test rooms closed.
