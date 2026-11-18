# Application flow

Public board positions remain inspectable through the accessibility tree:
Four in a Row exposes all 42 squares and occupants; Mancala exposes both owners'
pits/stores and seed counts. Whole-board overviews remain read-only and Escape
returns focus to the opener. Keyboard activation submits only the existing
full-size legal move controls.

Azul's accessible view describes drafted tiles, existing pattern lines, every
wall position and floor contents including the first-player marker. Drafting
and placement retain the same server-owned actions; exact public tile state
survives saved refresh and appears consistently to the other seats.

Trio's Lowest/Highest requests identify the target player in their accessible
names without including hidden ranks. Keyboard moves retain the server's legal
request and saved public reveals agree across all seats after refresh.

- `/`: public, server-rendered lounge with 26 multiplayer games and Pop Tarot; search/category/group-size discovery, create/join and member-only room shortcuts.
- `/rooms/[id]`: authenticated membership-only lobby, live table, results and room chat.
- `/join/[token]`: guest identity and explicit join; navigate to the stable room URL after joining.
- `/profile`: Google signup/sign-in, guest-preserving account/email linking, saved name/avatar and match results.
- `/readings/[matchId]`: the original participant's saved Tarot spread and analysis, independent of the room's current spread or membership; no generation on open.
- `/auth/callback`: private PKCE exchange and safe account success/cancel/conflict status.
- `/privacy`: public data-use summary for Google signup, room history and AI readings.
- `/design`: component/table gallery for development and review.

Lounge discovery intersects text search, category and group size. Co-op groups
use the game manifest rather than name matching. Clear search/Escape preserve the
other choices; Reset filters clears all choices and returns focus to search.
Phones keep both main home actions in full rows. Search and Players share the
first control row; category pills scroll in a contained second row beside Reset.
The live result count is announced without adding a heading above the games.
When it matches the active filters, Pop Tarot appears once in the first
full-width catalogue row. Its Start reading action opens the existing solo
setup flow; the other26 games continue in the regular grid below it.
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
Games and Rooms are separate segmented tabs. Games is the default catalogue; Rooms groups the player's in-progress/waiting and finished rooms. Switching tabs preserves game search and filters. Home omits the duplicate Games top-navigation item; the Games home brand returns to the Games panel with those choices preserved. Inner pages retain their Games link. Membership shortcuts never appear in the Games panel and have no public discovery feed. Browsing alone creates no guest identity.

The host can add/fill/remove labeled bot seats in the lobby. A human joining a
full lobby replaces a bot. Bots never receive login sessions or hosting rights;
only human presence leases pause/resume play. A connected member drives due bot
moves through the versioned server endpoint, one paced committed action at a
time. Bots resume from persisted schedule/memory after refresh or server restart.
Chat and Activity share a collapsed desktop sidebar or phone dialog. Activity retains the latest 80 committed public moves for match participants, including public cards, destinations and amounts. Retries never duplicate moves; hidden draws and private decisions reveal no faces. Waiting late arrivals do not receive match details.

Create room is one focused shared dialog: game, Friends/Bots, seats and name. The current avatar opens an optional colour picker; Room options reveals the room name and game rules. Defaults work without opening either control. Join and Configure use the same flow. Avatar choice, room name and rule choices survive changing Friends/Bots. Escape closes the palette before closing the parent dialog; selection restores focus to the avatar opener. Setup states invite-only privacy once. Join accepts either a
room code or a complete shared invite link; it extracts the capability locally
and submits to the normal membership-checked join endpoint. Copy link/code is
available in the lobby. Start validates
minimum/maximum players, fresh presence and readiness server-side. The table
renders only the viewer projection supplied by the engine. Results offer rematch
and change game; changing games returns everyone to lobby readiness.

Pending moves disable duplicate controls. Browser-offline tables also disable
commit controls in open move panels; new moves are not queued while offline.
Draft choices remain available after reconnect. Failed Uno moves retain the
selected card through same-version refresh so the player can retry or change it;
accepted moves clear that draft. Validation errors explain the action without
exposing internal state. Realtime loss shows reconnecting and enables
bounded polling; snapshots are fetched on reconnect and refocus. Chat stays in a
side panel on desktop and a sheet on phones. Forms and card controls work without dragging.

Deal's play area runs opponents → stock/latest move → own bank/property sets →
a permanent action bar and hand. Opponent summaries keep bank value and set progress visible; Inspect opens their public assets. Card selection never inserts a row or moves the board/hand. Select a card, choose an exact destination/target,
then confirm the move. A banked action cannot be played later, so banking has a
separate confirmation. Bills keep the table visible and let the payer choose
bank/property assets; the total and any overpayment stay visible before payment.
Just Say No and counter-counteractions show the affected players and amount.
Printed property names, set progress and server-calculated rent remain visible;
set details expose the complete printed group without disclosing hidden cards. Complex choices open a modeless move panel; View table / Resume move preserves choices while revealing the board. Escape closes it and restores focus. Public swap previews identify the actual take/give cards, and rent includes any committed multiplier.

Crowded public collections in Deal, Gem Market and Sea Salt & Paper wrap into rows
inside their existing player areas. Deal's pending transfer shows the actual
public cards and names the confirmation Allow transfer (or Keep action blocked).
Large public casino hands expose a bounded preview and an explicit inspector;
private hands and Paper's keep choices retain keyboard/touch rail navigation.
Word Agents and Boop preserve readable board cells with navigation below when
needed. Grouping a Rummy hand cannot make its navigation arrows oscillate.

Party decisions use select → lock → wait for friends → reveal → next prompt.
Concurrent submissions can conflict; a fresh snapshot preserves the locked
choices already committed and lets the remaining player submit deliberately.
Uncommitted choices survive another player's same-prompt update. They are scoped
to the current match, mode, round and player: a submission or next prompt from
another tab cannot make an old choice the next round's selected answer. Reload
restores committed state and requires a fresh choice for an uncommitted turn.
Optional sip prompts are set before starting; every mode always permits Pass.
Solo Tarot creation omits seat selection and invite instructions. Its room options
menu holds chat and activity, leaving rules and the options control in the phone toolbar.
Desktop keeps direct open/close controls for its persistent side panel.
Loading a saved spread reports progress or a retryable error; retry only fetches
the saved state. Generation stays disabled until that read succeeds and while
the room is paused/offline. Completed readings show their exact saved question.
Writing has one progress state, including bounded retries through approved alternate
providers. A lost response first triggers a saved-reading check, blocking another
submission until the check finishes. A failed check offers Check status. A saved
generation failure offers Retry reading only when retryable and its server cooldown
has elapsed. Cooldowns survive refresh and never submit automatically. Configuration
failures show unavailable; a blocked question requires an edit. Cards, question and
computed chart remain intact, and no substitute reading is invented.
Tarot offers Explore the deck with major/suit filters, independent of the saved
three-card spread. Fresh reading sections show The grounded read, The plot twist
and Your connections; previously saved readings retain their original content.
The Your connections sections include exact subject imagery in a consistent
frame, with expandable source/rights credits.
Reference background, when included, sits in a closed Background disclosure
under the connection; opening it reveals the exact saved catalogue text without
generating or fetching a new reading. Older readings have no extra disclosure.
Fictional characters use character
art or in-character stills; real people use their own portraits or an explicitly
labelled original illustration. An artist may use an explicitly labelled,
source-verified artwork. Memes use their actual scene or reaction image and
religious figures retain the named tradition/form. Scenes and artworks are larger
on desktop and sit above their explanation on narrow phones. Actor headshots
and cosplay never substitute for a named fictional role. Unknown historical
references remain text; the UI never substitutes an unrelated portrait. The
expanded image/reference library loads with Tarot rather than every game table.

Tarot entries in Profile's history open the specific saved reading by match ID.
They retain the question, selected cards and original analysis after a rematch or
room closure. Other identities receive no reading content. Incomplete or
unavailable analyses are explicit; only a still-current accessible spread offers
resuming in its room. Guests retain access while they retain their player session;
linking an account preserves that identity through the existing account flow.

On phones, the room title and compact toolbar share a row above the table, and
inviting, readying, starting and shared move controls each use a complete row.
Room options groups secondary host controls behind a vertical kebab; leaving
and ending a match remain deliberate actions. Escape closes dialogs and returns
keyboard focus to the opener. Live turn summaries distinguish the normal actor
from another player who has a legal reaction or simultaneous decision. Results
show team wins/losses for cooperative games and the correct score ordering/units.
At match end results and the rematch lobby come before the final table, and
starting a rematch scrolls back to the turn banner. A stale move returns a
game-neutral 409 ("The table changed while you were choosing…"); the client
refreshes and keeps the viewer's unsent draft.

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

Across the catalogue, permanent decision areas preserve the table and hand while choosing. Overflowing hands have separate Previous/Next controls, touch scrolling and keyboard reveal without vertical page jumps. Public opponent summaries stay outside their optional inspectors; required own decisions remain exposed. Rummy reserves its grouping lane, Azul keeps sources/boards fixed through placement, and split blackjack hands navigate inside their own rail. `/design/midgame` is development-only and reviews reproducible legal states; it returns 404 in hosted builds.

Tarot astrology is off by default. Opting in offers Both, Western or Vedic, then
birth date, local time and a city search with an explicit place selection. The
server resolves the historical timezone and asks which occurrence was intended
when clocks repeat a time; nonexistent local times cannot generate a chart.
Preview shows the calculated chart before submission. Birth fields stay in this
component session; the disclosed AI providers receive only computed placements with the Tarot
question/cards. The saved private reading includes the chart and interpretation.
A failed generation retains only the computed chart draft for explicit retry;
turning astrology off omits it from the next reading. Earlier saved Tarot readings
remain readable. See `backend/app/astrology/README.md` for the named conventions.

Audit refinement: failed Tarot reading refresh restores the saved question and
computed chart. An explicit edit/clear takes precedence until rematch. Pre-1970
birth dates show historical local-time uncertainty next to the input.

Consequential game choices now disclose server-calculated payment, declaration,
purchase and outcome details. Deal pending swaps name give/take assets; Rummy
organization is explicitly nonbinding and declaration guidance follows the chosen
discard; casino/Skyjo/Gang results explain score changes. Paper inspection and
boop graduation preview are separate from confirmation. Narrow boards expose
panning and a read-only whole-board overview; Uno colour choices occupy two columns.
