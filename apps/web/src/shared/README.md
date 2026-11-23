# Shared application UI

`RoomDialog` owns create/join/configure presentation over the existing session
API and committed-room recovery path. Creation keeps game, Friends/Bots, seats
and player name visible; avatar colours and room-name/rule options are optional
disclosures. The bot mode fills seats through the authoritative API; no client
engine or AI decision logic is introduced here.

Friends mode adds a Bots stepper; any chosen bot gets a row in `BotPlayersFields`
(name and Easy / Medium / Hard, plus "Set all" for two or more). `bot-seats.ts`
holds the level wording, the default names and the duplicate check;
`room-setup.ts` builds the create request (`bot_seats`, with `null` names for
bots that keep their default) and decides whether the room starts at once.
`RoomCodeField` is the join field: numeric keyboard, digits grouped as typed,
links and older codes accepted (`room-invite.ts`). `UsernameField` and
`username.ts` serve the profile page and the lobby's invite panel.

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

`progress.ts` holds the small pure helpers the header chip, the rewards page
and the results line share: `levelProgress` (XP inside the level, the span,
what remains, a 0 to 1 fraction), `levelLabel`, `streakLine` (the streak in
words, or nothing; never a "lost" wording), `badgeCount`, `hasPlayedAGame` and
`wornCosmetics`. `keys.progress` is the one query key for a player's progress.
`SiteHeader`'s inner-page navigation links to Rewards beside Games, and every
page's header carries `ProgressChip`: the level ring, "Level N" and a flame
with the day count while a streak exists, as one link to `/rewards`. It reads
progress with the passive client, only for a player this browser knows, and
draws nothing for someone with no finished game.
