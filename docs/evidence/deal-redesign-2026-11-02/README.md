# Deal-first redesign — 2 November 2026

The owner supplied Playdeal screenshots/changelog as interaction references.
Games keeps its warm surfaces while replacing generic colour/castle cards with
all 28 named US properties, printed values/rent schedules and distinct actions.
No Mercy retains the approved Games house format.

The board groups opponent summaries, stock/latest move, own assets, then a
separated hand/contextual composer. Moves specify existing/new property piles;
standard/wild properties can move during their owner's turn. Banking requires
confirmation. Bills show selected value, overpayment and announced participants;
counter-counteractions retain board context. Buildings remain visible selectable
assets inside their set. Changing targets/cancelling banking clears stale moves.
Zero-value wild-only collections quote zero rent, matching their legal actions.

Stable physical IDs, saved matches and legacy empty-choice actions remain
compatible. Metadata exposes printed references/public totals/announced effects.
No unrevealed hand or stock order enters a client projection.

Retained synthetic viewer projections:

- `collections-desktop.png`: named properties, buildings and authoritative 9M rent.
- `collections-inspected-desktop.png`: final empty-stock treatment and expanded set checklist.
- `swap-desktop.png`: Forced Deal with actual take/give properties.
- `payment-phone.png`: asset selection, bill and live payment total.

Local gates pass: 104 frontend tests, 763 backend tests, 133 multiplayer integration
tests, migration/privacy grants, contract/fixture drift, lint/types, boundaries
and production build. Both Deal editions completed 8 real HTTP matches at both
seat limits on phone/desktop, plus 4 real browser bot-driver matches. Results,
history, rematch and group-preserving switching were checked. Twelve mounted
Deal flows cover exact pile/target/payment/counter decisions through 10 engine
before/after scenarios. `/design/deal` is local-only, unavailable in production.

50-room local load passed: action p95=622ms; snapshot p95=288ms; bot drive
p95=629ms; bot snapshot p95=408ms. These are local measurements. The adjacent
gameplay/card-workspaces evidence records all 27 initial-table reviews and 281
card faces/orientations. Initial screenshots do not establish every mid-game
state, all screen-reader behavior or production quality by themselves.

Push/deployment and fresh hosted acceptance are recorded in `progress.txt`.

Production application source `b2b242b7ae067aa8490a0eb295fb3ef8da0c1689` is live
at https://games-seven-black.vercel.app. Both-layout hosted catalogue checks
passed all27create/start/move/retry/conflict/refresh paths. Four complete hosted
Deal matches (both editions,2seats,bothlayouts), saved history, results, rematch
and group switching passed. Private Broadcast delivery to another player and
nonmember denial passed. All122HTTP/artwork/auth-boundary checks passed. Tarot
AI generation was unchanged and was not rerun by this UI release.
