# Casino table presentation

Hold'em, Teen Patti and Blackjack use the same authorized card, seat, wager and
server-action composition. The renderer does not reconstruct hidden cards,
hand outcomes or legal bets. Card motion retains identity/layout anchors from
contiguous authorized snapshots; refresh and reconnect establish a baseline.

## Reading the table at a glance

- **Whose turn and what to do.** The shared turn banner shows the engine line
  only to the seat that can act, and each casino engine writes that line as an
  instruction for that seat ("Call 2 to stay in, raise to 4 or more, or fold.").
  At the end it explains the result for everyone without names ("Won at
  showdown with a flush.", "Show: colour beats pair.", "Dealer busts with 24").
- **What just happened.** The felt cue is attributed and never truncates the
  move: a long name shortens, "raised to 24 (+22)" does not. A raise reads as the
  total it raised to plus the chips added, matching the bet badge. Each seat's
  caption carries its latest public move this street (Hold'em) or round
  (Blackjack, Teen Patti), so folds and calls survive later moves. Teen Patti
  shows the chips each seat has put in and the current stake on the felt.
- **Sideshows.** Both parties are marked on their seats while a request is open;
  the responder is addressed as "you" and told that equal hands pack the
  requester. The outcome is public without revealing either hand: "Sideshow:
  your hand was stronger, so Bo packs".
- **Results on the table.** At the end, bets are replaced by each seat's net
  result; captions name the hand ("Won · Flush", "Lost show · 9 high", "Lost
  sideshow", "Blackjack", "Lost both hands"); the cards that made the winning hand
  are outlined; the pot says who won it. Folded hands are mucked (no backs).
  Blackjack hand frames carry their result ("Win +10", "Bust −20", "Push").
- **Blinds and button.** Pre-flop bet badges are tagged SB/BB; the dealer button
  is 24-26px with an 11-12px "D".

## Decision dock

`CasinoDock` replaces the generic action panel for casino tables. It grows with
its choices (`DecisionDock size="fit"`), so Raise, All in, Split and Sideshow are
never below an inner scroll. Its line states what each offered choice costs and
does (call amount, fold forfeit, see-cards doubling, sideshow/show tie rules,
double/split cost); saving and paused states are a separate line, so the
explanation stays readable. When calling already takes the whole stack, the
duplicate "All in" is hidden and the call reads "Call all in · N".

Wagers show their legal range beside the input, say why an amount cannot be sent
("Enter at least 4.", "Use an even amount."), name the amount on the commit
button ("Raise to 10", "Place bet 10") and offer quick amounts (Min, ½ pot, Pot;
Min/Max; 2/10/20/50). The accessible names stay the server labels; amounts and
costs are visual suffixes plus descriptions. A typed amount survives a refresh of
the same decision through `useTableDraft`, scoped to room, match and version.

## Layout

Seats sit in explicit bands. A seat centre is clamped inside the ring, so a top
seat never covers the turn banner. Blackjack keeps the top centre for the dealer
(cards, payout note and a 14px dealer-total badge) and seats players in an arc.
On short laptop screens (at least 1000px wide, at most 960px tall) your cards
and the dock sit beside the ring, so the decision is on screen at 1024x700,
1280x720 and 1440x900. Phones keep felt, your cards, dock, then the seat grid; the felt and
card panel take only the height they need. Names wrap to two lines between
words.

Own Hold'em and Teen Patti cards use the shared `HorizontalRail`. Blackjack hands
fan inside their frame: each card but the last may shrink its slot, so up to five
cards keep their rank corners visible without inner arrows. Several hands keep
180px frames in an outer rail with previous/next controls below it; the own-card
area grows instead of scrolling.

A public opponent seat previews at most three projected faces. Blackjack seats
group a split player's cards by hand (from the server's `public_hands` sizes)
with a total under each; the Inspect modal lists each hand with its bet and
total. Hidden-card counts never become a public-face inspection or invented card
identities. Inspection stays read-only while a move is pending or play is
paused; Escape returns focus to the opener.

The live Hold'em panel shows one pot until someone is all in, then the server's
pots split at each all-in total with everyone still able to win them. Settled
pots that the same players could win are shown together; a side pot is named
only when eligibility changes, with the all-in player who caused it.

## Tests

`tests/browser/crowded-card-casino.spec.ts` checks legal engine projections at
320, 390, 768 and 1440 pixels, including five-card Blackjack hands read in one
frame and a recorded legal split continuation. `casino-explanations.spec.ts`
checks the dock (every choice inside it, range, validation, amount on the
button, presets, priced split) and the sideshow parties.
`apps/web/src/tests/casino-guidance.test.tsx` covers instructions, collapsed
calls, raise cues, seat results, pot grouping and own-ledger order. These local
projection checks complement saved-room and motion tests; they do not claim every
possible deal or certify a complete live match.
