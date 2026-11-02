# Application flow

- `/`: public, server-rendered lounge with 26 multiplayer games and Pop Tarot; search/category/group-size discovery, create/join and member-only room shortcuts.
- `/rooms/[id]`: authenticated membership-only lobby, live table, results and room chat.
- `/join/[token]`: guest identity and explicit join; navigate to the stable room URL after joining.
- `/profile`: Google signup/sign-in, guest-preserving account/email linking, saved name/avatar and match results.
- `/auth/callback`: private PKCE exchange and safe account success/cancel/conflict status.
- `/privacy`: public data-use summary for Google signup, room history and Gemini readings.
- `/design`: component/table gallery for development and review.

Lounge discovery intersects text search, category and group size. Co-op groups
use the game manifest rather than name matching. Clear search/Escape preserve the
other choices; Reset filters clears all choices and returns focus to search.
Phones keep both main home actions in full rows. Search and Players share the
first control row; category pills scroll in a contained second row beside Reset.
The live result count is announced without adding a heading above the games.
Selecting a tile opens that game's existing shared room-creation flow. Just me
and Solo + bots open supported multiplayer games with Bots already selected and
label their tile metadata You + bots; Friends remains available in setup.

The home page starts with a compact game picker rather than a large promotional
hero. Play with bots opens room creation in Bots mode; selecting a game tile
allows Friends or Bots. Bots mode fills the other selected seats, readies the
human and starts automatically. If auto-start or the fresh identity read fails,
the already-created room remains the destination; the form never repeats creation.
One-person discovery includes supported bot games. Search uses exact aliases
first and a bounded Fuse.js typo fallback, intersected with category/player filters.
Returning members see their in-progress and waiting rooms above the catalogue;
finished rooms follow it. These shortcuts come only from the signed-in actor's
active memberships. Rooms are invite-only and have no public discovery feed.

The host can add/fill/remove labeled bot seats in the lobby. A human joining a
full lobby replaces a bot. Bots never receive login sessions or hosting rights;
only human presence leases pause/resume play. A connected member drives due bot
moves through the versioned server endpoint, one paced committed action at a
time. Bots resume from persisted schedule/memory after refresh or server restart.
Chat is collapsed initially and opens as a desktop sidebar or phone dialog.

Create room is a shared dialog. Room setup includes game-specific settings from
the engine catalogue and states invite-only privacy once. Join accepts either a
room code or a complete shared invite link; it extracts the capability locally
and submits to the normal membership-checked join endpoint. Copy link/code is
available in the lobby. Start validates
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
Character connections include actual character art or in-character stills in a
consistent frame, with an expandable source/rights credit list. Performer
headshots and cosplay are excluded from the active registry. Unknown historical
references remain text; the UI never substitutes an unrelated portrait.

On phones, the room title and compact toolbar share a row above the table, and
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

Shithead starts by choosing three face-up table cards from six private cards.
The private hand clears before the public face-up cards; the three hidden slots
are then flipped one at a time without inspecting them. Same-rank selection
offers Play and, when legal, Take the pile. A face-up pickup includes one chosen
table card. Players who clear all zones are safe while the others continue;
the final player loses. Shared results retain the group for rematch/change game.
