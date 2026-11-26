# Housie

The number-calling game also known as Tambola (`id="housie"`,
`family="housie"`, 2 to 10 players, competitive). An original implementation of
a traditional, public-domain game: our own wording, no third-party art.

## Manifest

| Field | Value |
| --- | --- |
| name, subtitle | `Housie`, `Mark your ticket and claim the prizes` |
| minutes, icon, color | `10–25`, `grid`, `ochre` |
| score | `score_label="Points"`, `score_order="high"` |
| rules_version | `friendly-1` |
| settings | `auto_mark`, label "Mark called numbers for me", default **on** |

`manifest.rules` holds eight plain sentences for the rules sheet.

## Rules

- **Ticket.** Each player holds one ticket: 3 rows by 9 columns, 15 numbers,
  exactly 5 in each row. Column 1 holds numbers 1-9, column 2 holds 10-19, and
  so on to column 9, which holds 80-90. Every column has 1 to 3 numbers, sorted
  top to bottom. The same number can be on several players' tickets.
- **Calling.** Numbers 1 to 90 come out one at a time and never repeat. The
  server shuffles the order at setup. `current_player` is the caller; the caller
  changes to the next seat after every call.
- **Marking.** A called number on your ticket can be marked. With `auto_mark`
  on, every ticket is marked as the number is called. With it off, marking is
  the player's own action and can be done at any later time.
- **Prizes.** Early five (any 5 marked numbers, 1 point), Top line, Middle line,
  Bottom line (all 5 numbers of that row, 2 points each), Full house (all 15,
  5 points). A claim counts only numbers that are called **and marked**.
- **One winner per prize, shared on the same call.** The first valid claim wins
  the prize. Until the next number is called, any other player whose ticket
  also qualifies may claim it too and shares it. Every sharer scores the prize
  in full. Once the next number is called the prize is closed.
- **Late claims.** A prize nobody has won stays open and can be claimed on any
  later call.
- **No false claims.** A claim is offered only when it is valid, so a claim
  never fails.
- **Finish.** The Full house claim ends the match at once. Because nobody can
  claim after that, the same-call share is settled automatically: every other
  ticket whose 15 numbers have all been called (marked or not) shares Full
  house. Highest score wins; equal highest scores share the win.
- **All 90 called.** The match does not end the instant the 90th number is
  called, because that number can be the one that completes a ticket. Calling
  stops (`phase="final_claims"`) and the match ends on the Full house claim.
  At that point every ticket is complete, so every seat can always act.

## Phases

| Phase | Meaning |
| --- | --- |
| `calling` | Numbers are still to come. The caller has `call_number`. |
| `final_claims` | All 90 are out. No more calls; only marks and claims. |
| `finished` | Full house was claimed. No actions. |

## Actions

Marks and claims are offered to **every** seat at any time, not only to
`current_player`. None of these uses an input kind: send the action exactly as
it is offered.

| Type | Who | Fields | Label | Notes |
| --- | --- | --- | --- | --- |
| `call_number` | the caller, in `calling` | none | `Call the next number` | Draws the next number and passes the call to the next seat. |
| `mark` | any seat, only with `auto_mark` off | `amount` = the number | `Mark 42` | One option per called, unmarked number on the viewer's own ticket. |
| `claim` | any seat | `choice` = prize key | `Claim Top line` | One option per prize the viewer can claim right now. |

Prize keys: `early_five`, `top_line`, `middle_line`, `bottom_line`,
`full_house`.

## What a player sees

`players[]` has `id`, `count` (how many numbers that player has marked) and
`score`. `draw_count` is how many numbers are still to be called. `hand` and
`community` are always empty. `winners` is filled when finished.

`detail` holds exactly these keys, in every phase:

| Key | Shape | Notes |
| --- | --- | --- |
| `ticket` | 3 rows of 9, each `int` or `null` | The viewer's own ticket. `[]` for someone not seated. No other ticket is ever sent. |
| `marked` | `int[]`, ascending | The viewer's own marked numbers. |
| `called` | `int[]` | Every number called so far, in call order. |
| `last_called` | `int` or `null` | |
| `auto_mark` | `bool` | |
| `prizes` | 5 objects, fixed order | `{key, label, points, winners: id[], won_on_call: int or null}`. `won_on_call` is how many numbers had been called when it was first won. A prize with winners is still open to others only while `won_on_call == called.length`. |
| `claimable` | prize keys | What the viewer can claim now (the same prizes as their `claim` actions). |

`message` is written for the viewer: `You can claim Early five, Top line.`,
`Mark 12, 45 on your ticket.`, `Call the next number.`, `Wait for the next
number.`, `All 90 numbers are out. Waiting for the Full house claim.`, and at the
end `Full house! The match is over. Most points wins.`

## Secrecy

- The call order (`bag` in the saved state) never leaves the server. A view
  carries only the numbers already called.
- Tickets are private. A view carries the viewer's ticket and, for everyone
  else, only the marked count and prizes won.
- Public history says `Called 42`, `Marked a number` and `Claimed Top line`.
  A marked number is never copied into history.

## Bots and pacing

The bot marks its numbers, claims at once (small prizes before Full house), and
calls when it is the caller. In a room a bot that can mark or claim acts before
a bot caller draws again, and a bot caller waits 3 seconds before each call.
Details are in `app/bots/README.md` and `app/rooms/README.md`.

## States worth a tutorial step

1. The opening: your ticket, nothing called, "Call the next number" for the
   caller and "Wait for the next number" for everyone else.
2. A called number that is on your ticket (marked for you, or a `mark` action).
3. Your first claim: `claimable` has `early_five`.
4. A prize another player just won that you can still share on the same call.
5. A line claimed late, several calls after it was completed.
6. `final_claims`, and the finished table with every prize's winners.

## Tests

`tests/test_housie.py`: ticket shape over 250 seeds, the seeded call order,
caller rotation over all 90 numbers, auto-mark on and off, each prize won once,
shares on the same call, closure on the next call, late claims, the Full house
finish and its automatic share, `final_claims`, strict `detail` keys, a canary
that swaps every other ticket and the remaining call order and requires
byte-identical views, rejected actions, history labels, the bot's order of
play and room scheduling. `tests/test_parlour_rooms.py` plays a two-person
match and a one-person match against bots over HTTP.
