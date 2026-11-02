# Dashboard tabs — 2026-11-02

Local dashboard refinement after the stable-play production release. Production
rollout and serving revision are recorded separately in the root journal.

Games is selected by default. Room shortcuts appear only inside Rooms, grouped
as in progress/waiting and finished. They still come from the current player's
memberships; there is no public room feed. Empty public browsing creates neither
a guest identity nor a room. An already-authorized profile cache remains usable
when the remembered-player flag is absent. The existing explicit create/join
actions retain session/room creation responsibilities.

The shared controlled `SegmentedTabs` owns tab/panel IDs, selected state,
Left/Right wrap, Home/End and one roving tab stop. Its panels stay mounted, so
search, category and player filters survive switching tabs. The global desktop
Games link also returns to the Games panel. Both tab targets remain at least
44px and fit a 320px canvas.

`LoungeRooms` is shared by the real dashboard and its five new Storybook
compositions: combined tabs, member rooms, empty, loading and retryable error.
Cards and artwork reuse RoomShortcut. No backend, schema, dependency or image
asset changed.

## Verified locally

- `dashboard-refinement.spec.ts`: **12/12** passed in 20.7s, desktop and phone.
- Browser checks cover the compact first fold at 320/390/1440px, unchanged card/board art bounds, member-only private links, joining by invite, outsider 404, keyboard/ARIA semantics, all three preserved filter values, and loading/error/retry/group order.
- Never-played browsing checks observed no session-creation or player-profile requests and no remembered identity after switching tabs.
- Each real local QA room was left and checked inaccessible; no production accounts or rooms were created for this change.
- `dashboard-discovery.test.tsx`: **5/5** unit checks passed.
- Scoped ESLint, web/browser TypeScript and formatting passed.
- Static Storybook built successfully; all five new stories loaded and interacted at desktop and 320px (**10/10**, no page overflow or runtime exceptions).

The public first game begins at y=380px on 1440×1000 and y=415.6px on
390×844/320×844. Member rooms cannot add a row above that game catalogue. The
actual member screenshots use the browser defaults: 1440×1000 and 390×664.

## Inspected captures

| State | Desktop | Phone |
| --- | --- | --- |
| Before: public home | [1440px](before-1440.webp) | [390px](before-390.webp) |
| After: Games | [1440px](after-games-1440.webp) | [390px](after-games-390.webp), [320px](after-games-320.webp) |
| After: actual local member | [1440px](member-rooms-desktop.webp) | [390px](member-rooms-phone.webp) |

The [public empty Rooms view](after-empty-rooms-390.webp) is the actual development
page. The cropped [loading](story-loading-rooms-320.webp) and
[error](story-rooms-unavailable-320.webp) views use the same components in
Storybook; those are controlled gallery states, not failed production requests.

The exact Search games accessible name remains stable after Clear search appears.
Phone navigation uses the visible Games tab; desktop also exercises the header
Games link. A focused real member check removes only the remembered-player flag,
loads the profile, returns through Next navigation, and verifies the same owned
room and identity with no additional session/profile request while browsing.
