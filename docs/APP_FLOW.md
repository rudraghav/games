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

- `/`: public, server-rendered lounge with 26 multiplayer games, Pop Tarot, Roulette, Slots and Secret Santa; search/category/group-size discovery, create/join and member-only room shortcuts.
- `/games/[gameId]`: public game introduction, rules and play choices; opening or refreshing it never starts a session.
- `/games/[gameId]/rooms/[id]`: authenticated membership-only multiplayer lobby, live table, results and room chat.
- `/games/tarot/play/[id]`: private active Tarot spread, opened directly by Start reading.
- `/games/secret-santa/play/[id]`: the organiser's private Secret Santa page, opened by Organise a draw.
- `/santa/[token]`: one person's private Secret Santa link. Any session may open it; it shows only that person's own draw and never links to the organiser's page.
- `/rooms/[id]`: compatible old link; redirects to the named game route only after authorized room loading.
- `/r/[code]`: the short room link friends share. A player already in that room goes straight to its table; everyone else sees the join screen with the code filled in. The lookup never creates a guest, answers only for a member, runs once per page open and is skipped for a visitor who is in no room.
- `/join/[token]`: older invite links; guest identity and explicit join; navigate to the stable room URL after joining.
- `/profile`: Google signup/sign-in, guest-preserving account/email linking, saved name/avatar and match results.
- `/games/tarot/readings/[matchId]`: the original participant's saved Tarot spread and analysis, independent of the room's current spread or membership; no generation on open. Old `/readings/[matchId]` links redirect after authorized loading.
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
full-width catalogue row. Its Start reading link opens `/games/tarot`; the
other 26 games continue in the regular grid below it. Tiles are ordinary links
to each game's public page. Just me and Solo + bots add `?mode=bots` for
supported multiplayer games, emphasizing Play with bots without starting play.

The home page starts with a compact game picker rather than a large promotional
hero. Play solo filters the catalogue to solo and bot-capable games. On a game
page, Start reading or Play with bots creates and starts the private session in
one transaction, without a name form or lobby. Existing profiles are preserved;
first-time players receive Guest. Bot play uses the minimum supported group,
with at least one bot. Play with friends opens setup with that game fixed and
then the invite lobby. The global Create room dialog retains advanced setup.

Quick play sends a UUID request ID stored per game in this browser tab. Pending
controls prevent duplicate taps. A lost response offers Try again and reuses the
same ID, including after a refresh, so the same original match is recovered.
An ended, abandoned or changed session offers an explicit Start a new reading/game
instead of silently restarting it. Browsing never submits this request.
One-person discovery includes supported bot games. Search uses exact aliases
first and a bounded Fuse.js typo fallback, intersected with category/player filters.
Games and Your games are separate segmented tabs. Games is the default catalogue; Your games groups the player's in-progress/waiting and finished sessions. Switching tabs preserves game search and filters. Home omits the duplicate Games top-navigation item; the Games home brand returns to the Games panel with those choices preserved. Inner pages retain their Games link. Membership shortcuts never appear in the Games panel and have no public discovery feed. Public profile reads use only an existing session, even when stale player preferences remain after sign-out. A stale game slug redirects only after the room's actual game and membership are authorized.

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

Deal's play area runs opponents → stock/latest move → private hand → command
bar → own bank/property sets. Opponent summaries keep bank value and set progress
visible; Inspect opens their public assets. Card selection never moves these
regions or submits a move. Selecting a playable card immediately opens named
buttons for its legal destinations/actions and banking. The compact modeless
toolkit shows up to three exact choices; All N moves/properties expands the full
list, and Fewer returns without discarding a partial swap. Changing the selected
card clears incompatible choices. Unplayable hand cards and public property
cards without a legal move open information on click. A complete destination,
player, rent or steal choice commits in one tap with its consequence visible.
Banking explains the permanent conversion beside its CTA. Forced Deal shows the
property to take (including its owner), then exact swap CTAs for the property to
give; a single complete swap can commit directly. Table destination buttons also
commit the exact placement. Complete No Mercy Take/Keep/Give choices also commit
from their named rows. Bills keep the table visible and let the payer choose
bank/property assets; the total and any overpayment stay visible before payment.
Just Say No and counter-counteractions show the affected players and amount.
Printed property names, set progress and server-calculated rent remain visible;
set details expose the complete printed group without disclosing hidden cards. Card choices use a modeless move panel; View table / Resume move preserves choices while revealing the board. Escape closes it and restores focus. Public swap previews identify the actual take/give cards, and rent includes any committed multiplier.

Crowded public collections in Deal, Gem Market and Sea Salt & Paper wrap into rows
inside their existing player areas. Deal's pending transfer shows the actual
public cards and names the confirmation Allow transfer (or Keep action blocked).
Large public casino hands expose a bounded preview and an explicit inspector;
private hands and Paper's keep choices retain keyboard/touch rail navigation.
Word Agents and Boop preserve readable board cells with navigation below when
needed. Grouping a Rummy hand cannot make its navigation arrows oscillate.

A single complete Uno play and verified Rummy winning discards have named buttons on the first decision view. Teen Patti shows the legal chip amounts directly for small ranges. Sea Salt & Paper names the exact cards of a unique duo, and Boop highlights a sole graduation line before the player commits it. In scrollable hands and boards, a tap activates the touched item before bringing it fully into view. Keyboard focus reveals it immediately. For all 25 games outside Deal, the [decision review](evidence/simpler-turns-2026-11-19/README.md) describes the steps, including choices that remain editable before locking.

The normal play buttons start an uncoached game. **Rules & tutorial** opens the
same illustrated rulebook players can consult at the table. Opening it starts
nothing. **Play tutorial** inside the rulebook starts a saved bot game or solo
Tarot spread with coaching enabled for that match and player. In an active solo
or bot-only game, the host can switch coaching on and off in the rulebook without
losing a turn or starting a second game. Players can follow
a named move or use the normal card, board and private-choice controls. The coach
explains the learner's confirmed move alongside the public bot reply. On long
tables the floating tip follows the next available choice. The card, board
preview or stake on the table supplies the context for the hint. Closing the
guide preserves the match. In Tarot the player chooses
all three cards and decides separately whether to request a reading.

Party decisions use select → lock → wait for friends → reveal → next prompt.
Concurrent submissions can conflict; a fresh snapshot preserves the locked
choices already committed and lets the remaining player submit deliberately.
Uncommitted choices survive another player's same-prompt update. They are scoped
to the current match, mode, round and player: a submission or next prompt from
another tab cannot make an old choice the next round's selected answer. Reload
restores committed state and requires a fresh choice for an uncommitted turn.
Optional sip prompts are set before starting; every mode always permits Pass.
Solo Tarot opens on a fan of overlapping face-down cards. The deck lies in three overlapped rows and scrolls sideways by swipe, by the bar under it or by the arrows. One tap or click on a back reveals it in the next position and saves the pick; a revealed card stays. Keyboard users move among the backs with the arrow keys and reveal with Enter or Space. A drawn card opens its full page on click, and shows a larger preview on hover. Its Pop Tarot header and Reading
options menu omit multiplayer invite, host, chat and membership controls. Back
to Tarot returns to the game page without abandoning the saved spread; Your games
can resume it. The global advanced creation dialog remains compatible with solo play.
Loading a saved spread reports progress or a retryable error; retry only fetches
the saved state. Generation stays disabled until that read succeeds and while
the room is paused/offline. Completed readings show their exact saved question.
On submission the reading action itself expands into the processing card; no
second disabled CTA remains visible. Requests and results never wait for motion.
Reduced motion changes state immediately; restored progress does not replay the
transition. Keyboard focus follows the surface and returns to the retry action
after failure unless the user moved it elsewhere. Only explicit submission
scrolls the card into view once its expansion completes. Later content growth
keeps that focused card visible until the user scrolls or interacts elsewhere;
refresh and unchanged-height polls preserve scroll.
Writing polls the saved attempt even while its original request is pending.
Provider preference is Gemini, then Cloudflare, then Groq for ordinary, Western,
Vedic and combined readings. Groq's Vedic/combined attempts disable reasoning
and use a simpler JSON response format; other services get the first opportunity.
An invalid response can trigger the next provider but never replace the exact
selected cards or computed chart. Safe check/field feedback reaches the next
provider. A failed question-format rule may relax only for that exact field on
the retry; required sections, text limits, character facts and chart checks remain.
The loader names the failed part and explains the format relaxation. That message
survives refresh during the retry, clears when checking/saving, and never includes
raw provider errors. Final failure names the failed part beside the existing Retry
action. Every network attempt has a bounded time slot.
The loader shows actual stages and names a provider when retrying; estimated percent
and time remaining survive refresh and never show100% before saved completion.
An exceeded estimate says Taking longer than expected. Reduced motion disables
spinner/meter motion. A late progress response cannot replace a completed reading.
A lost response first triggers a saved-reading check, blocking another
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

After the third draw, **Fun mode** appears above the optional question and is on by default. Turning the switch off selects Classic. An info icon and one short line beneath it explain both styles. In a Fun reading, **How it could play out** comes first on each card. The portrait, source and background sit with the example. Refresh, retry and the private archive retain the submitted style. Each new spread starts with Fun on.

On the completed table or in Profile → reading history, the switch opens in the style that was saved. The other view keeps the same three cards, question, astrology and next step. Players can return to the original with one switch, even after the room has closed. Looking at the alternate style makes a private read-only request. A temporary failure leaves the original accessible and allows a retry.

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

In Gem Market, a reservation preview shows when the gold grant will require a token return or use the last reservation space. Players can pass when it is their only legal move. In both Deal editions, players can select individual bank cards and properties in the payment panel and see which linked buildings travel with them. The total, shortfall or overpayment stays with the Pay button. Accepting a No Mercy bill explains whether the shortfall adds a debt chip, including at the three-chip limit. A failed save leaves the same player’s selected card or tokens available to retry after reload. A saved move starts a new decision. Deal profile history counts the player’s completed property colours from the final table, including older matches.

In Blackjack, the active hand has an optional “What if I hit?” explanation. Opening it calculates the chance of busting on the next card from the visible six-deck table, including what the dealer's initial check establishes. The wager preview distinguishes chips already committed from the next payment. Teen Patti shows the affordable seen-hand price before a player looks at their cards.

In The Gang, a pending chip review survives refresh if the holder and consequences still match. When another player changes them, the old confirmation disappears. In 6 nimmt!, selecting a number previews its destination and penalty on the current rows before locking. Skyjo can compare the drawn card with visible swap targets and leaves face-down values unknown.

Roulette and Slots start at `/games/[gameId]` with Play solo. Normal play opens the table at `/games/[gameId]/play/[id]`. A player can adjust the bet and stake, inspect the odds and submit one spin. On completion, Play again starts a new match at the same table. Profile history opens the owner’s immutable spin receipts at `/games/[gameId]/results/[matchId]`, including after the table closes.

## Room setup, room codes and invitations

Create room keeps Play with (Friends or Bots) and Seats. In Friends mode a Bots
stepper seats 0 to seats-1 bots beside friends; Bots mode fills every other seat.
A game page's Play with friends dialog has the same stepper and no Bots mode.
Each chosen bot has a row under **Bot players**: an editable name, prefilled with
the name the server would give it, and Easy / Medium / Hard (Hard by default,
which is how bots have always played; Easy often slips, Medium sometimes slips).
"Set all" appears with two or more bots. A repeated name is explained in the
dialog and nothing is sent. The room starts on its own only when every other
seat is a bot; a table with a seat left for a friend opens its lobby.

New rooms have a six-digit code, shown in two groups ("482 913"). Older rooms
keep their 8-character code. The lobby's invite panel shows the code, the short
link `<origin>/r/<code>`, and Share (only where the browser has a share sheet),
Copy link and Copy code, each with a visible and announced confirmation. The
copied link is the short one. The join field takes the six digits with or
without a space or dash, a pasted `/r/…` or `/join/…` link, an older code or a
long invite token, and shows the server's message for a wrong code or too many
attempts. The room's own address stays `/games/<game>/rooms/<id>`.

In the lobby the host changes a bot's level from its chip, renames it in place
(Enter saves, Escape cancels) or removes it. Other players read the level as text.

A player may choose a username (3 to 20 letters, numbers or underscores, stored
lowercase) on the profile page or from the invite panel. Any room member can
search usernames by their first letters and invite a player; the panel lists
who is invited, and the host or the sender can cancel. Invitations appear at the
top of the home page ("Sam invited you to Friday game night · Uno · 2 of 4
players") with Join and Decline. Home re-reads the player on focus and every 20
seconds while visible, so an invitation arrives without a reload. Join seats the
player and opens the table; Decline removes the invitation and joins nothing.

## Secret Santa

Secret Santa is a solo organiser entry in the catalogue (Party and Solo + bots,
found by "secret santa", "gift exchange", "draw names" or "kris kringle", and
shown for any group size). Its game page offers **Organise a draw**, which opens
a private page at `/games/secret-santa/play/<id>`. The people in the draw are
names the organiser types; none of them joins the room or needs an account.

Setup is one page: the event (title, date, location, budget; each saves on blur
or Enter and the date, location and budget can be cleared), the people (type a
name and press Enter, or paste a list separated by commas or new lines; rename
or remove), who can't draw whom (a checklist per person, shown as chips on both
people) and groups (people in a group never draw each other). **Draw names** is
disabled until a complete draw exists and the reason is shown under it. One
confirmation precedes the draw.

After the draw the event stays editable and the page lists every person with
Opened or Not opened yet and three actions: Share (where the browser has a
share sheet), Copy link, and Show on this phone. Show on this phone asks for
the phone to be handed over, shows that one person their name after they
confirm, and Hide removes it. The organiser's page never lists who drew whom.
**Redraw** goes back to the list (people and rules kept); the links already
shared stop working straight away and the next draw makes new ones. **Finish**
closes the event and the links keep working. A finished event has no rematch;
another draw starts from the game page.

A person opens `/santa/<token>`: "Hi Sam" and one button, **Show who I’m buying
for**, then the name with the event title, date, location and budget. A
mistyped or outdated link and too many wrong links each get one plain message.
Profile history lists a finished event as "Names drawn".

## Home, progress and rewards (23 November 2026)

**Home** (`/`) is two things, in this order. (A first version the same day had
five rails, a featured banner and nine category chips before the library; the
owner found it cluttered, so it was reduced to this.)

1. **Start**: the headline "How do you want to play?" and three actions.
   - `Play solo`, on your own or against bots: chooses Quick with bots in the
     library below and moves there.
   - `Create room`, to play with friends: opens the create dialog.
   - `Join a room`, with a code: on a wide screen, type the code beside the
     button and press Enter (a player the browser already knows joins at once;
     anyone else gets the join dialog with the code filled in). With the field
     empty, and on phones, the button opens the dialog.
2. **Browse**: "Browse games", a search box, one row of six occasions (All,
   Quick with bots, With friends, Two players, Solo, For teams) and a grid in
   which every game appears once, as a cover, a name and "2–10 players · 10–20
   min". With All chosen and nothing typed, the grid opens with **Pop Tarot,
   the featured game**: one wide card with a line about it and Start reading,
   which opens `/games/tarot`. Under any other occasion, or once something is
   typed in search, there is no featured card and Pop Tarot is an ordinary
   tile wherever it matches. Kinds of game (cards, board games, casino, party) are found by
   searching. For teams shows its note and two quick filters, group size and
   time, only while it is chosen.

Everything else is demoted:

- **An invitation** is the one thing above the headline, and only while there
  is one: a single slim ticket with Join and Decline.
- **A game in progress** gets one line under the three actions, "Continue
  Friday table · Uno". Waiting and finished rooms are only under the **Your
  games** tab, which sits as quiet text beside the Browse heading.
- **Progress** is a small chip in the header (level, and a flame with the day
  count while a streak exists) that opens `/rewards`. A visitor who has never
  played sees no chip and no welcome line.

**Progress and rewards** (`/rewards`), reached from the header chip, the profile
page, the header's Rewards link on inner pages and the line under a result:

1. Progress: level, XP, streak (current and best) and four totals.
2. Badges: earned or in progress.
3. Rewards: avatar frames and card backs as coupons. Locked shows the
   requirement and progress. Earned shows **Redeem**. Redeemed shows **Use**.
   In use shows **Take off** (a frame) or **Use standard back** (a card back).

Progress is worked out by the server from finished games: 10 XP a game, 10 more
for a win, 5 more with another person, 15 the first time for each different
game. Levels begin at 0, 50, 150, 300, 500, 750, 1050 and 1400 XP. Rewards are
only ever earned by playing and redeemed in the app. There is no money, no
outside offer and no ranking against other players.

**In a room**: a worn frame shows around that player's avatar for everyone
(lobby seats, table seats, chat). A worn card back changes face-down cards on
the wearer's own screen only. After a match, a "Your progress" line under the
result shows the level, XP to go and streak with a link to `/rewards`; the
rematch controls stay where they were and work as before.
