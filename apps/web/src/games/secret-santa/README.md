# Secret Santa

The organiser's page for the `secret-santa` game (family `organiser`, solo: one
seat at `/games/secret-santa/play/<room id>`, no lobby seats, no invite panel).
One person sets up an event and a list of names, says who must not draw whom,
draws, and gives each person a private link `/santa/<token>`. The people in the
draw are names the organiser types. They are not room members and need no
account. The private link page lives in `features/santa-link`.

## What the organiser never sees

Who drew whom is never in the organiser's view. `santaDetails`
(`packages/api-client/src/secret-santa-details.ts`) is strict on every object:
a view with any extra field (an `assignment`, a `recipient` on a person) is
refused and the table shows a short refusal instead of rendering. The one name
this page can show is `showing.recipient_name`, during a pass-the-phone reveal,
and only after the person holding the phone confirms who they are. The page
says so in one line: "Only each person can see who they drew."

## Files

- `SecretSantaTable.tsx`: the page. Composes the cards below, owns the status
  line, the confirmations and the pass-the-phone state.
- `SantaEventCard.tsx`: title, date, location, budget. Each field saves on blur
  or Enter through its own action and can be cleared (date, location, budget).
  A summary at the top always shows what is saved. Stays editable after the draw.
- `SantaPeople.tsx`: add a name (Enter adds and keeps focus; a pasted or typed
  list separated by commas, semicolons or new lines is added one name at a
  time), the counter, rename, remove, and the "Can’t draw" checklist. Chips show
  each person's exclusions and groups.
- `SantaGroups.tsx`: add, rename, remove a group and tick its members.
- `SantaChecklist.tsx`, `SantaConfirm.tsx`: the shared `Modal` with a tick list,
  or with one question.
- `SantaLinks.tsx`: after the draw, one row per person with Opened / Not opened
  yet, Share (only where the browser has a share sheet), Copy link and Show on
  this phone. Links are fetched once per draw (`api.santaLinks`, the draw number
  is in the query key). A link is written into the page only when the browser
  cannot copy it.
- `SantaPassPhone.tsx`: the full-width card: "Hand the phone to Sam", then the
  name, then Hide.
- `santa-actions.ts`: pure helpers. `buildAction` turns an intent into exactly
  an offered action with its input filled in (`choice` for text, `target`,
  `cards` as the complete list, `amount` for the date) or null when it is not
  offered. `splitNames`, `describeChange` (the status sentence for a saved
  change) and the link and share text.
- `santa-date.ts`: day number (days since 1 January 2020) to and from a native
  date input, and "Saturday 19 December 2026". UTC arithmetic only.
- `santa-outbox.ts`: the move queue (see below).

## Sending moves

The room sends one move at a time and silently drops a second one sent while
the first is saving. Every control therefore calls `send(intent)`; the outbox
sends intents in order, each built against the actions offered at that moment.
A refused move waits for the refreshed table. If the table had moved on in
the meantime, the same move is sent once more. (A person opening their link does
not change the move counter, so it does not cause a refusal; the re-send covers
any other stale table, such as a second tab.) If nothing changed, the move
itself was refused: the queue is emptied and the status line says so. Controls
are disabled only while the room is paused or offline, so typing keeps its focus.

Unsent text (a title being typed, a name not yet added) is kept per tab with
`useTableDraft`, scoped to the room and match.

## Phases

- `setup`: event card, people, groups, and **Draw names**, the one filled
  button (`Add` and `Add group` are secondary). When the server does
  not offer `draw` the button is disabled and `blocked` is shown under it. One
  confirmation precedes the draw.
- `drawn`: event card, the links list, a read-only list of the rules, **Redraw**
  and **Finish**. `redraw` goes back to `setup` with the list kept; the links
  already shared stop working at once and the next draw makes new ones.
- `finished`: read-only details and the links list. The links keep working. A
  new event starts from the game page; there is no rematch in the same room.

## Pass the phone

"Show on this phone" opens the handover card without asking the server. "I’m
Sam, show who I drew" sends `reveal`; the name is rendered only for the giver
who confirmed in this tab, so a reload mid-reveal starts again at the handover.
Hide removes the name from the page immediately and then sends `hide`. Focus
moves to the card when it opens and back to the button that opened it.

## Accessible names for the main controls

| Control | Name |
| --- | --- |
| Event fields | `Title`, `Date`, `Location`, `Budget`; `Clear date`, `Clear location`, `Clear budget` |
| Add a person | textbox `Add a name`, button `Add` |
| Per person | `Choose who <name> can’t draw`, `Rename <name>`, `Remove <name>` |
| Groups | textbox `Add a group`, button `Add group`, `Choose who is in <group>`, `Rename the group <group>`, `Remove the group <group>` |
| Checklists | dialog `Who can’t <name> draw?` / `Who is in <group>?`, checkboxes by name, `Save`, `Cancel` |
| Draw | `Draw names`, then dialog `Draw names for N people?` with `Draw names` / `Not yet` |
| Links | region `Share each person’s link`; `Share link for <name>`, `Copy link for <name>`, `Show on this phone for <name>` |
| Pass the phone | `I’m <name>, show who I drew`, `Cancel`, `Hide` |
| After the draw | `Redraw` (dialog `Redraw the names?`: `Go back and redraw`), `Finish` (dialog `Finish this Secret Santa?`: `Finish`) |

## Checks

- Unit: `apps/web/src/tests/secret-santa.test.tsx` (parser, dates, every built
  action, name splitting, the outbox, the page in each phase, the link page).
- Browser: `tests/browser/secret-santa.spec.ts` (mocked states and the real
  flow with a second guest).
- Hand-made states: `apps/web/src/stories/fixtures/secret-santa.ts` and the
  `Games/Secret Santa` story. Engine-recorded states are in
  `stories/generated` and `/design/midgame`.

Each row of "Share each person’s link" is a `Ticket` in its gift-tag shape:
the person and Opened / Not opened yet on the tag, the sharing actions on the
stub (below the tag on phones, beside it from 620px), sage once opened. The
list item keeps its `santa-link` class and every button name.
