# Bluff

The card game also called Cheat (`id="bluff"`, `family="bluff"`, 2 to 6
players, competitive). An original implementation of a traditional,
public-domain game with a standard 52-card deck: our own wording, no
third-party art.

## Manifest

| Field | Value |
| --- | --- |
| name, subtitle | `Bluff`, `Shed your cards face down and call the bluffs` |
| minutes, icon, color | `15–30`, `spade`, `sky` |
| score | `score_label="Cards left"`, `score_order="low"` |
| rules_version | `friendly-1` |
| settings | none |

`manifest.rules` holds seven plain sentences for the rules sheet.

## Rules

- All 52 cards are dealt out, one at a time from seat 1. With 3, 5 or 6 players
  the first seats hold one card more. Seat 1 starts.
- **Starting a round.** The starter plays 1 to 4 cards face down and declares a
  rank. The declaration need not be true. The starter cannot pass.
- **Following.** Each next player in turn plays 1 to 4 cards face down as that
  same rank, passes, or calls bluff on the last play.
- **A call.** Only the last play is turned over. If every card is the declared
  rank, the caller takes the whole pile. Otherwise the player who made that
  play takes it. Whoever took the pile does not start; the other of the two
  starts a new round and may declare any rank.
- **Everyone passes.** When every other player passes in a row after a play, the
  pile is set aside face down for the rest of the match and the last player who
  played starts a new round. With two players one pass is enough.
- **Going out.** A player whose play empties their hand wins once that play
  stands: the next player plays or passes (the match ends at once and that
  player's own cards stay in hand), or calls and the play turns out honest (the
  match ends when the reveal is continued). If the call finds a bluff, the
  player takes the pile and the match goes on.

## Phases

| Phase | Meaning | Who acts |
| --- | --- | --- |
| `playing` | A round is open, or about to be started (`detail.rank` is `null`). | `current_player` |
| `reveal` | A call was made. The called play lies face up in `community`. | `current_player` is the next round's starter: `continue`. |
| `finished` | Somebody shed every card. | Nobody. |

## Actions

| Type | Fields | Input | Label | Notes |
| --- | --- | --- | --- | --- |
| `play` | `choice` = the rank, `cards` = 1 to 4 of your card ids | `input="cards"`, `minimum=1`, `maximum=min(4, hand size)`, `eligible_cards` = your whole hand | `Play as Queens` | Starting a round: 13 options, one per rank, in the order A, 2 … 10, J, Q, K. Following: one option, with `choice` already set to the round's rank. Send the option's action with your chosen card ids in `cards`. |
| `skip` | none | none | `Pass` | Not offered to the starter of a round. |
| `call_bluff` | none | none | `Call bluff` | Calls the last play. Not offered to the starter of a round. |
| `continue` | none | none | `Continue` | Only in `reveal`, only for the next round's starter. The pile goes to whoever takes it. |

A rank is written as it is on a card, the same string as `CardView.value`:
`A`, `2` … `10`, `J`, `Q`, `K`. So `card.value === detail.rank` tells the
client which of its own cards would be an honest play.

The pass is `skip`, not `pass`: the bot levels treat `pass` as "the only move a
player without a real one is offered", and here passing is a real choice.

A `play` is refused with "Choose one to four of your own cards." when the cards
are not 1 to 4 different cards from the player's hand. Any refused action
leaves the saved state unchanged.

## What a player sees

`players[]` has `id`, `count` (cards in hand) and `score` (the same number;
fewer is better). `hand` is the viewer's own cards, sorted Ace to King.
`community` is empty except in `reveal`, where it holds the cards of the one
play that was called.

`detail` holds exactly these keys, in every phase:

| Key | Shape | Notes |
| --- | --- | --- |
| `rank` | rank string or `null` | The declared rank of this round. `null` when a new round is about to start. |
| `pile_count` | `int` | Face-down cards in this round's pile. |
| `discarded_count` | `int` | Cards set aside after everyone passed. |
| `plays` | list of `{player, count}` | This round's plays, oldest first. |
| `last_play` | `{player, count}` or `null` | The play a call would turn over. |
| `passed` | player ids | Who has passed since the last play. |
| `going_out` | player id or `null` | The player whose last play emptied their hand and has yet to stand. |
| `reveal` | `null`, or `{caller, player, rank, count, truthful, taker, pile_count, starter}` | Set in `reveal`, and left in place if the match ends on that reveal. `player` made the called play, `taker` picks up `pile_count` cards, `starter` opens the next round. |

`message` speaks to the player who acts: `Start a round: play one to four cards
face down and say what rank they are.`, `The rank is Queens. Play one to four
cards as Queens, pass, or call bluff.`, `The play was honest: the caller takes
the pile. Continue when everyone has seen it.`, `It was a bluff: the player who
bluffed takes the pile. Continue when everyone has seen it.`, and at the end
`Every card is gone from one hand. That player wins.`

## Secrecy

- A view holds the viewer's own hand and no other card, except the one called
  play during `reveal`. The rest of the pile is never shown: the player who
  picks it up sees those cards only as part of their own hand after `continue`.
- Set-aside piles are never shown again.
- Public history says `Played 2 as Queens` (a count and the claimed rank, never
  a face), `Passed`, `Called bluff and was right` or `Called bluff and was
  wrong` with the faces of the called play only, and `Moved on from the reveal`.
  A play that only let a last play stand is recorded as `Let the last play
  stand`.

## Bots and pacing

The bot plays honestly when it holds the rank, bluffs a single card now and
then (more with three cards or fewer, never its last card), and calls when the
claim cannot be true, when the play empties a hand, or on a weighted doubt. A
bot starter waits the standard 5 seconds on a reveal before `continue`.
Details are in `app/bots/README.md`.

## States worth a tutorial step

1. Starting a round: choose cards, then a rank (13 `play` options).
2. Following: the round's rank, `Play as …`, `Pass`, `Call bluff`.
3. A reveal where the play was honest and the caller takes the pile.
4. A reveal where it was a bluff and the bluffer takes the pile.
5. Everyone passed: the pile is set aside and the last player starts again.
6. A player on their last play (`going_out`), and the win once it stands.

## Tests

`tests/test_bluff.py`: the full deal at 2, 3, 5 and 6 seats, the starter's 13
options, 1 to 4 own cards, the same-rank rule, the pass-around at 3 and 2
seats, both outcomes of a call, who starts next, the three ways a last play is
resolved, strict `detail` keys, a search of every view for hidden card ids and
a canary that re-deals everything unseen, rejected actions, history labels,
the bot's choices and 52-card conservation through whole bot matches.
`tests/test_parlour_rooms.py` plays a two-person match and a one-person match
against bots over HTTP.
