# Shithead / Palace

Rules reference: [Pagat Shithead](https://www.pagat.com/beating/shithead.html),
read 1 November 2026 (page updated 1 October 2026). This is an explicitly defined
Games table because the traditional game has many regional variants.

## Deck, setup and limits

2–5 players, one standard 52-card deck without jokers. Deal three hidden table
cards to each seat, then six private cards. Each player chooses three of those
six as their public face-up table cards; the remaining three are their hand.
This is Pagat's equivalent six-card setup variant and avoids initially revealing
cards that are later exchanged into a private hand. Hidden table cards cannot be
inspected, including by their owner. Setup choices are taken clockwise.

The first player is the first clockwise seat with the lowest opening rank among
public face-up cards, otherwise among private hands, checking 3 through ace then
2. The first turn may play any legal hand card. Suits do not affect play.

## Play

On each turn play one or more equal-rank cards at least as high as the current
comparison rank, or voluntarily pick up the nonempty pile. Refill the private
hand to three from stock after a hand play. A pickup ends that turn; the next
remaining player starts an empty pile. Playing the last hand card does not allow
playing a face-up card in that same turn.

A 2 may be played on anything and resets the comparison. A 10 may be played on
anything, burns the entire pile and gives the same player another turn. Pagat's
current main description says this, although its variations retain an older
contradictory parenthesis; this table explicitly always permits tens.
Four **consecutive physical top cards** of the same rank also burn the pile and
give another turn. Multiple cards are never drawn from the hidden stock as a
blind alternative. Jokers, reversals, skips and same-suit sequences are omitted.

When the stock and own hand are empty, play from public face-up cards. To pick
up instead, add one chosen face-up card to the pile first. When the hand and all
face-up cards are gone, choose one occupied hidden slot and flip it blindly.
A legal flip is played; an illegal flip joins the picked-up pile in the hand,
ends the turn, and must be cleared before attempting another hidden slot.
A legal last-card burn still lets the player escape; the next active seat leads.

## Optional house rules (both off by default)

- **Seven low:** a 7 must first be legally played on the current comparison, then
  the next nonspecial card must be 7 or lower. Another 7 is allowed. 2 and 10
  still work normally.
- **Transparent threes:** a 3 can be played on any pile and the next comparison
  looks through all top threes. A 3 on an empty pile permits any rank. Threes do
  not make a four-of-a-kind across intervening cards; four consecutive threes burn.

With both enabled, threes on a seven retain its low constraint; threes on a two
retain its reset. A burn removes every comparison/low constraint.

## End and scoring

Players who empty every zone escape and stop taking turns. Continue until only
one player has cards: that player is last and loses, while **all escaped players
are winners**. The result is unscored (score_order=none), with public finish order
and explicit last-player identity. No invented point total or monetary penalty.
A rematch uses the room's normal start workflow and a freshly shuffled deck.

## State, privacy and bots

The engine stores stock, every private hand/hidden slot, public face-up cards,
current pile, burn archive and finish order. All 52 unique cards remain in one
zone. Projections contain only the viewer's hand, public face-up cards/pile,
counts and occupied hidden slots; hidden table identities never reach clients
or bot policies. The bot ranks its own six setup cards, plays legal equal-rank
sets, preserves useful reset/burn cards where possible, and chooses hidden slots
without looking at their contents. The authoritative engine validates all moves.

Focused tests cover illegal/duplicate/mixed rank choices, setup and hidden-card
privacy, refill and pickup, face-up/blind recovery, 2/10/7/3/four-kind interaction,
last-card burn/escape, loser semantics, conservation, immutability and natural
bot matches at both seat limits with deterministic seeds.

Current local verification:38 focused tests include28 reproducible natural
matches at both limits with both house toggles on/off, plus special-card,
conservation, input immutability and blind/setup privacy fixtures. Eleven registry,
generic playthrough and shared bot cases also pass. Four phone/desktop browser
cases cover both seat limits and real two-human setup/play/refresh with legal
card controls, stale-version rejection and task-room closure. One small sort
control was enlarged to44px after the first geometry check; the final run passes.
The parent release owns full-group gates and deployment evidence; these counts
establish local behavior, not a production release.

Both actual-client solo matches also pass results, history, profile, rematch and
switching game with the same group (phone final version65, desktop75); task rooms
are closed. Final maximum-seat synthetic images were inspected at both widths.
Separate hand faces, 44px targets, compact empty rows and bounded seat strips
are covered by the geometry checks. Concise evidence is retained in
[`docs/evidence/shithead-2026-11-01`](../../../../docs/evidence/shithead-2026-11-01/README.md).

Independent human-browser full-match acceptance now also passes2and5seats on
both phone and desktop: four natural matches, saved/profile/rendered outcomes,
rematch, group retention and final room closure. These runs use authorized views
only and explicitly identify current dirty local source, not a deployed revision.

Subsequent live production acceptance passes the samefour min/max/viewport cases
against application `c1169d2`: all natural results, profile/history/rematches and
final group closures. The evidence retains production summaries separately from
the earlier dirty-source local runs; no runtime change was made by acceptance.

## Public pile inspection — 2 November 2026

The table now offers **View pile**, a shared decision panel containing the
engine's already-public last twelve pile cards in oldest-to-newest order. This
lets a player see consecutive equal top cards and transparent-three context
without disclosing stock or hidden table cards. Comparison/low constraints still
come from the authoritative engine. Inspection is available to waiting players,
cannot submit a move, and Escape returns focus to the opener. An empty pile
keeps the same disabled control so the table does not shift when it becomes
inspectable. No state, rule, schema or saved-data change was required.

The phone spacing follow-up removes an empty action dock only when the viewer
has no setup/play/pickup controls. The flag derives from server action availability,
never card selection, so selecting/clearing cards retains the full fixed dock
when decisions are available. Waiting and blind-slot-only views no longer reserve
208px for nonexistent controls. At 390×844 the measured waiting workspace falls
from 474.8px to 256.8px; the visible hand keeps its 160px footprint. Two- and
five-seat setup/playing selection checks show zero movement of pile, hand,
own table or opponent positions, with 44px touch controls and no page overflow.

## Table clarity — 3 November 2026

`prompt(state)` writes every engine message for the player who acts next: "Match
or beat 9 (or play a 2 or 10) from your hand, or take the pile", the face-up
variant, a blind-flip instruction, "Lead any card…" on an empty pile, and "You
burned the pile. Lead any card…" for the burner's extra turn. Messages no longer
restate the previous move anonymously ("8 ♥ cannot beat the pile…", "Pile
taken: 31 cards", "Burned 4; play again."); the room's attributed Last move line
and the table's pile note carry that, and the banner shows the engine message
only to the seat that can act. No rule, projection or state shape changed.
History labels read "Played: 5 ♣" and "Flipped a hidden card".
