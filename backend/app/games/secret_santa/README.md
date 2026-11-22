# Secret Santa

A solo organiser table (`id="secret-santa"`, `family="organiser"`,
`play_mode="solo"`, one seat, no score, no bot). One person runs it. The people
in the draw are names the organiser types; they are not room members and need
no account. The organiser lists the people, says who must not draw whom, draws,
and gives each person a private link or passes the phone round.

The model follows how DrawNames runs a draw: names, a group name, a budget and a
date; "who can't draw whom"; nobody draws themselves; people can be added or
removed until the draw; each person opens their own link.

## Rules

- 3 to 30 people. Names are 1 to 30 characters, trimmed, with repeated spaces
  and control characters removed. A name already on the list (ignoring case) is
  kept and numbered: `Sam`, `Sam (2)`. A numbered name is shortened to stay
  within 30 characters.
- **Pairs.** Two people who must not draw each other, in either direction.
- **Groups.** Up to 8 named groups (a household, a team). Nobody draws someone
  who shares a group with them. A person can be in several groups.
- **The draw.** Every person gives to exactly one person and receives from
  exactly one. Nobody draws themselves, a person they are paired against, or a
  group mate. Two people drawing each other is allowed.
- Title (1 to 60 characters, "Secret Santa" to start), location (1 to 80),
  budget (1 to 30) and date are optional and can be changed before and after the
  draw. The date is a whole number of days since 1 January 2020 (0 to 40000), so
  the engine holds no time zone.
- Changing the people, pairs or groups after a draw means going back
  (`redraw`) and drawing again. Every earlier link stops working.

## Actions

The organiser is the only player and is `current_player` until the table is
finished. Text arrives in `choice`, a person or group id in `target`, a
complete list of person ids in `cards`, the date in `amount`.

| Phase | Action | Input | Effect |
| --- | --- | --- | --- |
| setup | `add_name` | text 1-30 | Adds a person with the next id (`p1`, `p2`, ...). Not offered at 30 people. |
| setup | `rename` | target person, text 1-30 | Same naming rule; the id, pairs and groups are kept. |
| setup | `remove_name` | target person | Removes the person and every pair and group place they had. Ids are never reused. |
| setup | `set_exclusions` | target person, cards | The complete list of people this person must not be paired with. Replaces every pair that person was in. Offered once there are two people. |
| setup | `add_group` | text 1-30 | Adds an empty group (`g1`, ...). Not offered at 8 groups. Repeated labels are numbered like names. |
| setup | `rename_group`, `remove_group` | target group (and text) | |
| setup | `set_group` | target group, cards | The complete member list. Offered once there is a person. |
| setup, drawn | `set_title`, `set_location`, `set_budget` | text | |
| setup, drawn | `set_day` | amount 0-40000 | |
| setup, drawn | `clear` | target `day`, `location` or `budget` | Always offered; clearing an empty detail changes nothing else. |
| setup | `draw` | none | Offered only when a complete draw exists. Moves to `drawn`. |
| drawn | `reveal` | target person | Pass-the-phone: shows that person their name and marks them as having looked. Showing another person replaces the first. |
| drawn | `hide` | none | Offered only while a name is showing. |
| drawn | `redraw` | none | Back to `setup` with people, details, pairs and groups kept; the draw, the "looked" marks and the shown name are cleared. |
| drawn | `finish` | none | Ends the table: no winner, score 0, no further actions. |

`set_exclusions` and `set_group` check the submitted ids themselves: each must
be offered for that action and appear once, otherwise the action is refused.
Group members are stored in list order whatever order they were sent in; each
pair is stored once with its two ids in string order.
Any refused action leaves the saved state unchanged.

## Can it be drawn?

`blocked_reason` answers exactly, with a largest matching between givers and
allowed recipients (augmenting paths; at most 30 people):

- fewer than 3 people: "Add at least 3 people."
- a person with no allowed recipient: "Sam has nobody left to draw. Remove an
  exclusion or a group."
- everyone has a candidate but no complete draw exists: the engine follows the
  matching out from a person left over to the people competing for too few
  names (Hall's condition) and names them when there are four or fewer, for
  example "Asha and Ben can only draw 1 person between them. ..."; a larger
  crowd gets "These exclusions leave no way for everyone to draw a name. ...".

`detail.can_draw` and the `draw` action are present exactly when
`detail.blocked` is null.

## How the names are drawn

`setup` saves one private random number. Each draw adds one to `draw_number`
and seeds its own generator from the two, so a draw never depends on anything
the client sends and a redraw is a fresh draw.

The engine shuffles the list into a random order and keeps it only if it breaks
no rule, up to 400 times. Every complete draw is equally likely this way. With
few rules about one order in three passes. If none passes (a heavily restricted
list), it builds a matching with the givers and each giver's candidates in
random order, which always finds a complete draw when one exists but is not
exactly uniform.

## State

`people [{id, name}]`, `next_person`, `title`, `day`, `location`, `budget`,
`pairs [[id, id]]` (each pair once, ids in string order, list sorted),
`groups [{id, label, members}]`, `next_group`, `phase` (`setup`, `drawn`,
`finished`), `assignment {giver_id: recipient_id}`, `opened [ids]`, `showing`
(id or null), `draw_number`, the private `seed`, plus `order`, `turn`,
`winners` and `message`.

## What the organiser sees

`project_view` for the organiser fills `detail` with exactly:

```
title, day, location, budget,
people: [{id, name, opened}],
pairs: [[id, id]], groups: [{id, label, members}],
drawn, draw_number, can_draw, blocked,
showing: {giver, giver_name, recipient_name} | null,
limits: {people: 30, groups: 8, name: 30, title: 60, location: 80, budget: 30}
```

Any other player id gets an empty view.

## The secrecy boundary

- `assignment` and `seed` never leave the saved state through a projection, an
  action label, a message or history.
- The organiser's view names a recipient in one place, `detail.showing`, and
  only while a `reveal` is on screen. Tests replace the saved draw with other
  draws and require a byte-identical view.
- Public history uses fixed labels ("Added a name", "Set the date", "Drew the
  names", "Showed one person their name"). No typed text, person id, date or
  count is copied into it.
- `SecretSantaEngine.private_draw(state, person_id)` returns one person's own
  line (title, day, location, budget, their name, their recipient's name) and is
  called only by the room service for the holder of that person's link.
  `mark_opened` returns the state with that person marked as having looked.
  Both are pure and return nothing before a draw.
- The organiser is given every link, so the table cannot stop an organiser from
  opening them. Opening one marks that person as having looked, on the
  organiser's own table, and only drawing again clears the mark.

## Private links

The room service derives each person's token; nothing is stored
(`app/rooms/santa_links.py`). A token is the URL-safe base64 of the match id
(16 bytes), the person's number (1 to 4 bytes) and the first 16 bytes of an
HMAC-SHA256 over the match id, the draw number and the person id. The key is
derived from the application secret with a purpose suffix, so it is not the key
used for sessions or invites. Tokens are 44 to 48 characters. A check
re-derives the token for the saved draw and compares whole tokens in constant
time, so a token from an earlier draw, for a removed person, for another table
or with a respelled encoding opens nothing. The routes are described in
`app/rooms/README.md`.

## Tests

`tests/test_secret_santa.py` covers naming, upkeep of pairs and groups, input
validation, the three kinds of blocked list, 120 random lists whose draws are
checked rule by rule, a ring that has exactly two possible draws (the matching
path), and fairness: four people have nine possible draws and each turns up
between 150 and 250 times in 1800 seeded draws, with each person drawn by each
of the others about a third of the time. It also covers the view's independence
from the draw, reveal and hide, finish, rejected actions, history labels and
token shape. `tests/test_secret_santa_rooms.py` runs the table and the links
over HTTP in an isolated database.
