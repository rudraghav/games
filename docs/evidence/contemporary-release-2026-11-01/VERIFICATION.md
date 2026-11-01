# Contemporary library and mobile release

Production: https://games-seven-black.vercel.app

Final application `f21fc0e485f52212f08dd165eac7f37a5efafc99` is served by READY
production `dpl_7aT9pMzY3wHgRzfrxmf6mkVL85tZ` in Mumbai. The canonical alias,
release source and GitHub source match. See [safe metadata](verification.json).

The catalogue now has 26 experiences, including The Gang, 6 nimmt!, Sea Salt &
Paper and boop. Their exact base editions, exclusions and original artwork are
documented in the [library](../../GAME_LIBRARY.md) and owning module READMEs.
All 78 original Tarot illustrations remain mapped; no card has a pip fallback.

## Verified behavior and source

| Scope | Verification | Application inputs |
| --- | --- | --- |
| Frontend | 50 unit cases, workspace types/lint, Next production build; Storybook build | Final code; Storybook inputs unchanged by correction |
| Engines and multiplayer | 438 backend and 68 isolated database-backed checks; generated contracts, import boundaries and local/cloud schema/privacy gates | Backend/API inputs identical across both releases |
| Regular browser flows | 79 distinct passing phone/desktop cases across the broad run and corrected synchronization rerun; 13 intentional opt-in/viewport skips | Unchanged game/table/art inputs; guest entry additionally tested below |
| Local full matches | 14 cases, 3,018 legal moves, natural outcomes/history/results/rematch/switch; closed rooms, no transport errors | [Honest pre-commit workspace records](../new-games-2026-11-01/README.md) |
| Hosted full matches | 16 cases, 3,140 legal moves, 16 rendered profile-history checks and two real saved Tarot readings | `0525db5`; exact backend, game tables, UI/art, API and AI inputs retained in final app |
| Hosted discovery | Eight search/filter/keyboard/mobile/poster/icon checks | `0525db5`; discovery/art inputs unchanged |
| Hosted Tarot deck | Both viewport flows verify all deck filters, selected spread persistence and four tall portrait head centers | `0525db5`; deck/art inputs unchanged |
| Hosted final room entry | Fresh independent guests recognize their own seat and ready without reload; natural results, refresh and rematch pass on both widths | `f21fc0e`; both rooms closed with 404 readback |
| Final HTTP boundaries | 26-game catalogue and all ten delivery atlases return 200; private me401, development session404 and design gallery404 | `f21fc0e` |

The first phone room check found a genuine stale-profile race. It is recorded
in [sanitized evidence](../room-audit-2026-11-01/identity-race.md), rather than
hidden by a longer timeout or a forced reload. The correction cancels the old
player query and reads identity after entry commits. Read failures recover in
the room without repeating creation. Eight local browser cases deliberately
exercise late responses, failed reads, fresh joins and Tarot refresh. Final
hosted joins then passed at both screen sizes.

The correction changes two existing runtime files and adds one shared query
helper. Backend, API-client, game-table, shared UI, artwork and AI inputs are
byte-identical to the fully accepted first release. Full-match browser drivers
choose from authorized views through the real API and assert rendered results,
profile history, rematch and switching. Representative moves are also clicked;
this is not a claim that every rule branch was manually clicked.

## Persistence, load and release closure

The original owner room/profile and permanent Google linkage retain their
private before-state fingerprints. Google and anonymous sign-in remain enabled.
No new schema migration or account setting was required. Reviewed cloud schema,
RLS and grants passed before release. Final request/runtime error scans contain
zero records, with no omitted pages or intervals.

Fifty simultaneous local rooms passed: action median 856ms, p95 991ms, maximum
1045ms; snapshot median 367ms, p95 580ms, maximum 650ms. These are local HTTP
measurements; the prior hosted Broadcast baseline remains separate evidence.

Only selected inspected images and safe records are retained. Test rooms are
closed; source, artwork masters, credentials, databases/history, dependencies,
normal browser sessions and requested local services are preserved. Subsequent
documentation closure does not change any of the 227 final application inputs
and does not trigger another deployment.
