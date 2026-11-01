# Contemporary production captures — 1 November 2026

Inspected screenshots from the public production application at
`https://games-seven-black.vercel.app`, serving application source
`0525db5028826e99d3be8505e15517cc40a74d74` when these checks ran. This is the first
26-game release, before the separate corrective guest-entry change. These images
establish the captured UI, not completion of that pending correction.

All seven retained images were opened and inspected. Public catalogue captures
show the current search/pills/count layout and four new posters on desktop and
phone. Lobby/rematch images mask the invite panel, including access-bearing room
links and codes. Room options contain only controls and show no credentials or
invites. Player names belong to the isolated test sessions.

- [Production catalogue — desktop](production-library-desktop.png)
- [Production catalogue — phone](production-library-phone.png)
- [Lobby — desktop, invite masked](production-lobby-desktop-masked.png)
- [Lobby — phone, invite masked](production-lobby-phone-masked.png)
- [Room options — desktop](production-room-options-desktop.png)
- [Room options — phone](production-room-options-phone.png)
- [Results/rematch — desktop, invite masked](production-results-rematch-desktop-masked.png)

The original production phone room flow stopped on the guest-entry issue after
these lobby/options captures. Its failure trace was retained during diagnosis;
the first phone pictures are not represented as a passing end-to-end room run.
The corrected run below resolves that failure. Final release status and
source/deployment parity belong to the root progress and verification record.

## Corrected production verification

Application source `f21fc0e485f52212f08dd165eac7f37a5efafc99` is served by READY
production deployment `dpl_7aT9pMzY3wHgRzfrxmf6mkVL85tZ`. The release harness passed
fresh actual room workflows on desktop (16.5 seconds) and phone (10.4 seconds):
the newly joined friend sees their own `you` identity and can ready without a
reload, then both players complete a natural match, refresh saved results and
enter rematch readiness. Each test closes its room in the final cleanup hook.

All six corrected screenshots below were opened and inspected before retention.
Invite panels remain masked in lobby/results images; room-options images contain
only controls. The seven first-release images above remain unchanged for source
provenance. `corrected-captures.json` records the final source, deployment,
workflow outcomes, byte counts and SHA-256 hashes separately from the first run.

- [Corrected lobby — desktop, invite masked](corrected-lobby-desktop-masked.png)
- [Corrected lobby — phone, invite masked](corrected-lobby-phone-masked.png)
- [Corrected room options — desktop](corrected-room-options-desktop.png)
- [Corrected room options — phone](corrected-room-options-phone.png)
- [Corrected results/rematch — desktop, invite masked](corrected-results-rematch-desktop-masked.png)
- [Corrected results/rematch — phone, invite masked](corrected-results-rematch-phone-masked.png)

After final corrective acceptance, the resolved first-run failure trace and the
duplicate corrected test output were removed through the scoped cleanup policy.
These selected screenshots and the sanitized identity-race diagnosis remain.
