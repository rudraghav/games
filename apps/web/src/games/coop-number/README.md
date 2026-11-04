# The Gang and 6 nimmt! tables

Both tables render the authorized projection and the server's legal actions.
Hidden pocket cards and locked numbers never reach another seat before the
server reveals them.

## Simultaneous decisions

Chips (The Gang) and number locks (6 nimmt!) are chosen by several seats at once.
The viewer's unsent choice is a `useTableDraft` scoped to room, match and the
street or selection, so it survives a refresh and other seats' moves. When another
seat commits first, the server rejects the stale move; `useRetriedMove` keeps the
committed intent and, once the table refreshes without that move applied and the
same action is still offered, sends it once more. The server validates it again;
the selection clears only after the move is recorded.

## The Gang

- The decision dock grows with its content. On phones the chip rack becomes a list
  (chip, then the holder's full name), so six seats fit at 320px with the Take and
  Return buttons in normal flow.
- Your own chip is drawn as held (ring, bold “You”), not as unavailable.
- `detail.taken_chips` (public: everyone sees the rack) tells a player whose chip
  was taken, by whom, until they choose again.
- A finished heist leads with the verdict and each out-of-order pair, then lists
  every hand in red-chip order with its category and a check or cross against the
  chip below, then the Next heist control.
- “Crew chip history” colours each column by its chip colour.

## 6 nimmt!

- During a selection the whole hand is shown at once; on phones it is a five-column
  grid in a tray that stays on screen while the rows scroll above it.
- A forced row choice states the low card and labels each row with its cards and
  penalties, marking the cheapest.
- `detail.resolution` and `detail.unresolved` (public) list where every revealed
  number went, which sixth cards or low cards took which rows and for how many
  penalties; cards placed this selection are ringed in the rows.
- Round ends show sorted standings with this round's penalties and the 66
  threshold; during play a collapsed standings line names the leader and your place.
