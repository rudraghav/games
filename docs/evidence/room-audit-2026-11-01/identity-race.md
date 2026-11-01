# Room entry identity race — corrective verification

The hosted phone room check at application
`0525db5028826e99d3be8505e15517cc40a74d74` found a real entry race. The friend had
joined successfully, but the lobby showed **Take an open seat** and neither seat
showed **you**. The test waited for **I’m ready** and timed out. A fresh server
read confirmed the expected two memberships and readiness `[true, false]`.

Sanitized network evidence from that test's own trace:

| Friend request | Result | Duration |
| --- | --- | --- |
| Initial player read, started first | 200, `profile: null` | 188.766 ms |
| Join, started 1 ms later | 200, committed membership | 175.955 ms |
| Fresh post-join player read | Absent | — |

The pre-join null read arrived about 13 ms after join completed. The dialog only
invalidated its player query; invalidation reused the initial in-flight request.
The room then mounted with cached null identity. This was not an off-screen
button or a failed join. The host had a separate fresh identity read and could
ready successfully. The failed QA room was subsequently closed through normal
authorized HTTP with both leave responses 200 and a final 404 readback. No trace
credentials, room identifiers or invite values are retained in this report.

The correction cancels that earlier query and explicitly fetches player details
after the room mutation commits. A late result from the cancelled query is
ignored. Room presentation also keeps unresolved identity out of seat and game
controls. If the fresh identity read fails, the already-committed room remains
the destination; its retry refetches data without repeating the mutation.

Local corrective verification:

- Two deterministic unit cases cover a late initial null result and a freshly
  cached null result. One presentation case hides controls for unresolved identity.
- Desktop and phone browsers hold a real pre-join null response until after a
  fresh joined identity has arrived. Both recognize **you** and ready without a
  reload, including after releasing that old response.
- Desktop and phone browsers fail the post-create identity reads, reach the
  room's retry state, then recover through reads. Both assert exactly one create.
- Fresh independent-player room workflows finish, refresh results and rematch
  on both widths. Tarot spread selection/refresh also passes on both widths.
- This spec's known-room cleanup now runs in `afterEach` with its own 45-second
  budget, before the test-owned contexts close. Each room receives a final 404
  readback. Mutation requests are never automatically retried.

Eight focused local browser cases and eight related unit cases pass. The owning
release records the corrective source, builds and production verification;
these local checks do not claim the original deployed source was fixed.
