# Application flow

- `/`: public, server-rendered lounge with 25 multiplayer games and Pop Tarot; search/category/group-size discovery, create/join and recent rooms.
- `/rooms/[id]`: authenticated membership-only lobby, live table, results and room chat.
- `/join/[token]`: guest identity and explicit join; navigate to the stable room URL after joining.
- `/profile`: Google signup/sign-in, guest-preserving account/email linking, saved name/avatar and match results.
- `/auth/callback`: private PKCE exchange and safe account success/cancel/conflict status.
- `/privacy`: public data-use summary for Google signup, room history and Gemini readings.
- `/design`: component/table gallery for development and review.

Lounge discovery intersects text search, category and group size. Co-op groups
use the game manifest rather than name matching. Clear search/Escape preserve the
other choices; Reset filters clears all choices and returns focus to search.
Phones keep both main home actions in full rows, category pills in a contained
rail, and group controls above the live result count. Selecting a tile opens
that game's existing shared room-creation flow.

Create room is a shared dialog. Room setup includes game-specific settings from
the engine catalogue. Copy link/code is available in the lobby. Start validates
minimum/maximum players, fresh presence and readiness server-side. The table
renders only the viewer projection supplied by the engine. Results offer rematch
and change game; changing games returns everyone to lobby readiness.

Pending moves disable duplicate controls. Validation errors explain the action
without exposing internal state. Realtime loss shows reconnecting and enables
bounded polling; snapshots are fetched on reconnect and refocus. Chat stays in a
side panel on desktop and a sheet on phones. Forms and card controls work without dragging.

Party decisions use select → lock → wait for friends → reveal → next prompt.
Concurrent submissions can conflict; a fresh snapshot preserves the locked
choices already committed and lets the remaining player submit deliberately.
Optional sip prompts are set before starting; every mode always permits Pass.
Tarot offers Explore the deck with major/suit filters, independent of the saved
three-card spread. Fresh reading sections show The grounded read, The plot twist
and Character energy; previously saved readings retain their original content.

On phones, the room title sits above the table on its own readable row, and
inviting, readying, starting and shared move controls each use a complete row.
Room options groups secondary host controls behind a vertical kebab; leaving
and ending a match remain deliberate actions. Escape closes dialogs and returns
keyboard focus to the opener. Live turn summaries distinguish the normal actor
from another player who has a legal reaction or simultaneous decision. Results
show team wins/losses for cooperative games and the correct score ordering/units.

After create/join commits, room entry cancels any earlier player-profile query
and fetches the authoritative identity before navigating. A late pre-entry
`profile: null` response cannot overwrite the joined identity. If this fresh read
fails, navigation still reaches the committed room, where retry only refetches
the room and player details; it never repeats create/join. Seat/game controls
remain hidden until the player's identity is confirmed.
