# Liar's Dice

Hidden dice, rising bids and a call that shows every die (`id="liars-dice"`,
`family="dice"`, 2 to 6 players, competitive). An original implementation of a
traditional, public-domain game: our own wording, no third-party art.

## Manifest

| Field | Value |
| --- | --- |
| name, subtitle | `Liar’s Dice`, `Bid on hidden dice and call the liar` |
| minutes, icon, color | `10–25`, `circle-dot`, `plum` |
| score | `score_label="Dice left"`, `score_order="high"` |
| rules_version | `friendly-1` |
| settings | `wild_ones`, label "Ones are wild", default **on** |

`manifest.rules` holds seven plain sentences for the rules sheet.

## Rules

- Everyone starts with five dice. Each round the server rolls every die;
  a player sees only their own.
- On your turn you raise the bid or call liar. A bid is a quantity and a face:
  "there are at least this many dice of this face on the whole table".
- **Raise order.** A raise is a higher quantity of any face, or the same
  quantity of a higher face. Ones are the lowest face for this comparison, with
  or without `wild_ones`. The first bid of a round can be any quantity from 1.
  The highest quantity is the number of dice on the table.
- **Call.** Every die is shown. If the table holds at least the bid quantity of
  that face, the bid held and the caller loses one die. Otherwise the bidder
  loses one. Exactly meeting the bid counts as held.
- **Wild ones.** With `wild_ones` on, a one counts as any face. A bid on ones
  itself counts only ones.
- The player who lost the die starts the next round. A player with no dice is
  out, and the next player clockwise who still has dice starts instead.
- The last player with dice wins.

## Phases

| Phase | Meaning | Who acts |
| --- | --- | --- |
| `bidding` | Dice are hidden. | `current_player`: `bid`, and `call_liar` once there is a bid. |
| `reveal` | A call was made; every die is on the table. | `current_player` is the next round's starter: `next_round`. |
| `finished` | One player has dice left. The last reveal stays in `detail`. | Nobody. |

## Actions

| Type | Fields | Input | Label | Notes |
| --- | --- | --- | --- | --- |
| `bid` | `choice` = face `"1"`..`"6"`, `amount` = quantity | `input="amount"`, `minimum`, `maximum`, `step=1` | `Bid fours` | One option per face that can still be bid. `minimum` is the lowest legal quantity for that face (the current quantity for a higher face, one more for the same or a lower face, 1 when opening). `maximum` is the number of dice on the table. Any quantity in the range is accepted. A face is left out when no legal quantity remains. |
| `call_liar` | none | none | `Call liar` | Offered whenever there is a bid. When no raise is possible it is the only action. |
| `next_round` | none | none | `Roll the next round` | Only in `reveal`, only for the starter. Rolls every remaining die. |

Up to six `bid` options and one `call_liar`: the list never grows with the
number of dice.

## What a player sees

`players[]` has `id`, `count` (dice that player has now), `score` (the same
number) and `eliminated`. `hand` and `community` are always empty.

`detail` holds exactly these keys, in every phase:

| Key | Shape | Notes |
| --- | --- | --- |
| `round` | `int`, from 1 | |
| `dice` | `int[]`, ascending | The viewer's own dice as rolled this round. `[]` when out or not seated. |
| `total_dice` | `int` | Dice rolled this round: what a bid is measured against. |
| `wild_ones` | `bool` | |
| `bid` | `{player, quantity, face}` or `null` | The standing bid. Kept through `reveal` and `finished`. |
| `bids` | list of `{player, quantity, face}` | This round's bids, oldest first. |
| `starter` | player id | Who opened this round; in `reveal`, who rolls and opens the next one. |
| `out` | player ids | In the order they went out. |
| `reveal` | `null`, or `{caller, bidder, quantity, face, count, held, loser, eliminated, dice}` | Set in `reveal` and `finished`. `count` is how many dice counted for the bid, `held` whether the bid was met, `dice` is `{player id: int[]}` for every player exactly as rolled. |

During `reveal`, `players[].count` already shows the loser one die down, while
`reveal.dice` and the viewer's `dice` still show the dice as they were rolled.

`message` speaks to the player who acts: `Open the bidding: choose a face and
how many of it are on the table.`, `The bid is 3 × fours. Raise it or call
liar.`, `Every die is shown. Check the count, then roll the next round.`, and at
the end `Only one player still has dice. They win.`

## Secrecy

- During `bidding` a view holds one dice list: the viewer's own. Other players
  appear only as a count.
- The private roll number (`seed` in the saved state) never leaves the server.
  Each round's roll is derived from it and the round number, so a roll does not
  depend on anything a client sends.
- Public history records the bid as spoken (`Bid 3 × fours`), then `Called liar
  and was right` or `Called liar and was wrong`, and `Rolled the next round`.
  No die value enters history.

## Bots and pacing

The bot works out, from its own dice, how likely a bid is to hold, and calls
when calling is the better bet. A bot starter waits the standard 8 seconds on
the reveal before `next_round`. Details are in `app/bots/README.md`.

## States worth a tutorial step

1. The opening bid: your five dice, six faces to choose from.
2. Facing a bid: the raise ranges per face, and `call_liar`.
3. A bid that cannot be raised: only `call_liar`.
4. The reveal with the bid met (the caller loses a die), with wild ones counted.
5. The reveal with the bid missed (the bidder loses a die).
6. A player going out, and the next player starting.

## Tests

`tests/test_liars_dice.py`: the seeded roll, raise order and limits, the
highest bid, wild ones on and off, a bid on ones, exactly-met bids, who loses a
die, who starts next, elimination, the last player winning, strict `detail`
keys, a canary that replaces every other player's dice and requires
byte-identical views, the shared reveal, rejected actions, history labels and
the bot's decisions. `tests/test_parlour_rooms.py` plays a two-person match and
a one-person match against bots over HTTP.
