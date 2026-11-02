# Deal-first redesign — 2 November 2026

The owner supplied Playdeal screenshots/changelog as interaction references.
Games keeps its warm surfaces while replacing generic colour/castle cards with
all28named US properties, printed values/rent schedules and distinct actions.
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

- `collections-desktop.png`: named properties, buildings and authoritative9M rent.
- `swap-desktop.png`: Forced Deal with actual take/give properties.
- `payment-phone.png`: asset selection, bill and live payment total.

Local gates pass:104frontend tests,763backend tests,133multiplayer integration
tests, migration/privacy grants, contract/fixture drift, lint/types, boundaries
and production build. Both Deal editions completed8real HTTP matches at both
seat limits on phone/desktop, plus4real browser bot-driver matches. Results,
history, rematch and group-preserving switching were checked. Twelve mounted
Deal flows cover exact pile/target/payment/counter decisions through10engine
before/after scenarios. `/design/deal` is local-only, unavailable in production.

50-room local load passed: action p95=622ms; snapshot p95=288ms; bot drive
p95=629ms; bot snapshot p95=408ms. These are local measurements. The adjacent
gameplay/card-workspaces evidence records all27initial-table reviews and281
card faces/orientations. Initial screenshots do not establish every mid-game
state, all screen-reader behavior or production quality by themselves.

Push/deployment and fresh hosted acceptance are recorded in `progress.txt`.
