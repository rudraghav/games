# Application flow

- `/`: public, server-rendered lounge with 21 multiplayer games and Pop Tarot; search/category/group-size discovery, create/join and recent rooms.
- `/rooms/[id]`: authenticated membership-only lobby, live table, results and room chat.
- `/join/[token]`: guest identity and explicit join; navigate to the stable room URL after joining.
- `/profile`: Google signup/sign-in, guest-preserving account/email linking, saved name/avatar and match results.
- `/auth/callback`: private PKCE exchange and safe account success/cancel/conflict status.
- `/privacy`: public data-use summary for Google signup, room history and Gemini readings.
- `/design`: component/table gallery for development and review.

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
