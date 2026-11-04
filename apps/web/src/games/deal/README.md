# Deal table information

`DealTable` lays the table out in content-sized rows, top to bottom: one card per
opponent, the shared centre, your private hand, the command dock, then your own
bank and sets. Nothing scrolls inside a fixed window; the page scrolls. Selecting
a card changes the command; complex choices use the shared modeless decision
panel. A separate **Card info** control inspects a card without selecting,
paying, banking or submitting it. Each public property set also has an **Info**
control, including inside an opponent’s public-table inspector.

## Table layout (3 November 2026)

- **Opponents.** Each opponent card shows the name (two lines at most), hand
  count, sets complete, bank total with denominations (`1M ×3 · 2M ×5`), a No
  Mercy debt badge (`Owes Mira`) and one chip per property pile with its printed
  colour name, `n/m`, a ✓ and rent when complete, and building marks. Colour is
  never the only cue. While a move needs a player, **Choose <name>** replaces the
  name line in place, so rows never change size and Inspect stays uncovered.
- **Shared centre.** The draw count, the top discard as a readable chip (name,
  value, colour stripe; it opens Card info), a viewer-aware status line and, during
  a normal turn, the owner's remaining plays next to End turn. Waiting seats read
  who they wait for and on what (`Waiting for Bao to respond to your Sly deal`,
  `Dana owes Kofi 5M`); the discarding player reads how many cards to drop, and a
  turn ending with more than seven cards warns that it forces a discard. The
  engine message is not repeated here: the room banner carries the attributed
  last move. Two status lines and the plays slot are reserved, so a response or a
  discard never moves the hand.
- **Hand and dock.** The hand sits directly under the centre, so it is on the
  first screen at 320×640 and 1280×720. Its rail arrows sit in the heading row and
  never cover a card. An empty hand says when cards come back. The dock keeps a
  fixed footprint; seats that cannot act get a read-only **View pending action**
  instead of a disabled response button, and a finished match hides it.
- **Your table.** Bank as denominations (individual notes only while paying), and
  sets as a grid of readable rows: colour stripe (split, with the inactive half
  hatched, for wilds), name, active colour and value at 11px or more. The
  opponent inspector uses the same rows in a two-column grid on phones.
- An unsent card choice survives a refresh for the same table version
  (`useTableDraft`); any new server version discards it.

Status and dock copy come from `table-status.ts`, which reads only the public
projection and public move history; `deal-table-status.test.tsx` covers every
seat's wording.

`DealCardInformation` uses only the viewer’s hand, public banks/collections and
the discard. It lists payment value, the printed effect, all allowed property
colours, properties needed for completion and each labelled base-rent step.
For a placed card it also shows the actual public collection count, current
rent, named properties and attached buildings. The turn multiplier and legal
rent options come from the typed server projection; this view does not decide
whether a move is permitted. A zero-value all-colour wild has no payment value,
cannot be banked and cannot collect rent alone. Properties cannot be banked.
The winning condition remains three completed sets in different colours.

The shared `@games/ui` `dealCardInstructions` is also used by the card faces, so
card and inspector explanations have one owner. Inspection has a native card
selector, scrolls within the dialog on phones, supports Escape and restores the
exact Info opener, including when nested within a public opponent inspector.
Hidden hands, drawn cards and stock order are never added to its selector.

Twelve engine-derived scenarios in `scripts/export_deal_scenarios.py` include
counter chains, swaps, payments, buildings, a committed 18M doubled-rent bill
and a naturally reached nine-card hand. `deal-information.spec.ts` checks touch,
keyboard, nested focus restoration, public-only zones and unchanged table/hand
geometry at 390px and 1440px. The broader catalogue decision audit and its
remaining limits are in `docs/evidence/game-info-2026-11-02/README.md`.

The 2 November audit follow-up adds explicit payment consequences and pending
exchange targets. `paymentSelection` unions server-projected bundles, counts
carried buildings once, and shows every card leaving the table, its total and
overpayment. A clear-payment control resets only that selection. Bundles are
part of the selection signature so a new authoritative quote invalidates stale
choices. The payment action stays disabled if the projection has no usable
quote. Public transfer previews identify both sides and open the existing card
inspector without changing the move. Classic's free counter rule and No Mercy's
different house convention are identified in quick rules.

The exporter now contains sixteen scenarios, including the three original
natural audit trajectories and a recipient's pending Forced Deal view. Focused
unit checks compare rendered helper quotes with actual engine transfers. Browser
evidence covers linked-building payments, pending swaps, inspector focus,
phone overflow, disconnected-control gating and fresh mounts; this is local
projection evidence, separate from live room/reconnect acceptance.

## Crowded collections and response previews

Own and inspected public collections wrap into a grid of rows; card rows stack
inside each set, so a large collection cannot create a hidden horizontal strip.
Thirteen piles and ten bank cards read on the page at every width, and the last
set's Info is reachable by touch and keyboard.

Pending public transfers are listed as compact rows (exact card, active colour,
value and source set) with an information control; see **Decisions** below for
the response wording. These buttons submit the same server-enumerated actions.

The exporter adds eight explicitly controlled density probes: both editions with
13 distinct piles and ten bank cards, their public opponent views, and the
classic wild-card Sly Deal from both seats: the attacker's composer
(`crowded-sly-attacker`), the defender's response (`crowded-sly-response`), the
attacker waiting (`crowded-sly-waiting`) and the attacker answering the
defender's Just Say No (`crowded-sly-blocked`). Real deck inventory and privacy guards still apply; these are
not naturally reached matches. All 21 targeted fixtures coexist with the natural
midgame suite. `crowded-deal.spec.ts` exercises row bounds, final-set inspection,
keyboard/focus, actual transfer previews, both responses and paused/pending gates
at 320, 390, 768 and 1440px. `stable-deal.spec.ts` checks that every fixture's
rows are distinct and hide no content, that the whole hand is on the table's first
screen, and that selecting, previewing, inspecting and clearing never move a
region (only placement may add destination tiles at the end of your own table).
Current coverage lives in `docs/evidence/crowded-actions-2026-11-02`.

## Decisions (3 November 2026)

Every attacker composer, response, payment and No Mercy decision is written from
the viewer's seat by `decisions.ts`, using only public cards (banks and sets) and
the viewer's own hand. `DealComposer.tsx` and `DealResolution.tsx` render it.

- **Exact cards.** A wild is never just "Wild property": it is named by its
  colours, with its active colour, value and the set it sits in, e.g.
  "Wild Green/Dark blue · Green active · 4M · from Green set 2 (1/3)". The
  any-colour wild says "no cash value" rather than a glyph.
- **Choice rows, not dropdowns.** Targets, destinations, rent sets and stage
  picks (Market Crash, Heist, Repossession, Tax Collector) are full-width radio
  rows inside the decision panel. Forced Deal is two steps: the card you take,
  then the card you give. With three or more players a player is chosen first;
  a player with a single possible move is selected at once (no redundant pick).
- **Consequences before commit.** Rent rows show the amount, sorted highest
  first, with any multiplier ("18M rent from each other player (9M ×2)"). Deal
  Breaker lists the set's cards, total and "+1 complete set for you". Super Sly
  Deal lists every card each colour takes, with owner and active colour, and
  outlines them on the table. Destinations show pile contents, n/m before and
  after, "completes the set", "New … pile" and "Free move, uses no play".
- **Commit labels say what happens.** "Give Tough luck to Mira" for a debt
  settlement (never "Play …"), "Take Park Place", "Keep …", "Charge 18M rent",
  "Play Sly deal · take Wild Green/Dark blue".
- **Responses.** One sentence says who wants to do what to which card and from
  which set: "Dev wants to Sly Deal your Wild Green/Dark blue (Green active,
  4M) from your Green set 2 (1/3)". Facts list what each set becomes. **Accept**
  is the primary button with its result under it ("Dev takes it."); **Just Say
  No** is secondary, says what it does and how many you hold. A blocked actor
  sees "Accept the block" (their action is cancelled) or Just Say No back.
  Seats that are not answering get the same sentence and who they wait for.
- **Always reachable.** Commit and answer buttons sit in a `data-decision-actions`
  footer that stays visible while longer content scrolls; transferred cards are
  compact rows, so a Deal Breaker with buildings never pushes the answer out of
  view. Holding Space peeks at the table without losing the decision.
- **Payments.** Each selected property shows its set impact ("Light blue set 1:
  3/3 → 2/3 · breaks a complete set and its House rent"). When your assets cannot
  cover a bill the panel says so and offers **Select everything**. A partial
  payment survives a refresh (`useTableDraft`, scoped to room, match and
  version).
- **Double the Rent and No Mercy debts.** While Double the Rent is armed the dock
  reads "Rent ×2 armed" and explains why End turn is gone. A creditor handed a
  debt card sees "Received: <card>".

The engine message is now the instruction for the seat that can act (for
example "Accept, or answer with Just Say No." or "Pay 5M from your bank or
properties."); the banner's attributed Last move line says what just happened.
Real saved-room verification and captures live in the deal-decisions fix notes.
