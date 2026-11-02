# Shared application UI

`RoomDialog` owns create/join/configure presentation over the existing session
API and committed-room recovery path. Creation keeps game, Friends/Bots, seats
and player name visible; avatar colours and room-name/rule options are optional
disclosures. The bot mode fills seats through the authoritative API; no client
engine or AI decision logic is introduced here.

The native avatar disclosure closes on selection and restores focus. Its Escape
key is handled through `Modal.onEscapeKeyDown`, preserving the parent dialog.
Selections and optional values survive mode changes; game changes clamp capacity
and reset only game-specific rules. Remembered name/avatar and saved profile
remain the defaults.

`SiteHeader` hides its Games navigation item on the lounge, which already has
Games/Rooms tabs. The Games home brand reveals the mounted Games panel while
preserving search and filters. Inner pages retain the Games navigation link. Shared
UI primitives and semantic tokens remain in `@games/ui`, not in feature modules.

Focused coverage lives in library-browsing, dashboard-refinement and dashboard-live
browser specs. The live-dashboard test reuses exactly two actors over three
viewports, exercises all 27 setup forms, an invite flow and an actual bot reply,
and closes only its own rooms. Storybook previews block submission and use an
isolated fresh query cache so inspecting controls never creates a room.
