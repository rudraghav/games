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
`SiteHeader` lays its actions out as: progress chip, the page's own controls
(its `children`), then the account link. The home page passes two controls:
`Join a room`, a quiet button that opens the join dialog, and `More`, the
shared `Menu` from `@games/ui` with Create room, Your games and Progress and
rewards. Other pages pass none, so a game page's own Join a room stays the only
one there. `Menu` is a menu button: `aria-haspopup="menu"`, `aria-expanded`,
`menuitem`s, arrow keys with wrap-around, Home and End, a letter to jump,
Escape to close and return focus, and a press or focus outside to close. An
item closes the menu before it acts, so a dialog it opens hands focus back to
the menu button when it closes. On phones the account link shows its icon only
(its name is unchanged).

`SiteHeader`'s inner-page navigation links to Rewards beside Games, and every
page's header carries `ProgressChip`: the level ring, "Level N" and a flame
with the day count while a streak exists, as one link to `/rewards`. It reads
progress with the passive client, only for a player this browser knows, and
draws nothing for someone with no finished game.

`adults-only.ts` holds the 18+ edition rules shared by `RoomDialog` and the room
page. `adultsGate(mode, gameSettings, settings, confirmed)` says whether Create
room or Room settings uses the edition and whether the submit stays disabled
until the host ticks "Everyone in this room is 18 or older" (shown under the
"Naughty edition (18+)" toggle). `rememberAdultsOnly(roomId)` stores a tab-only
confirmation in `sessionStorage`; `useAdultsOnlyConsent(roomId)` reads it as
React state and is never confirmed during server rendering.
