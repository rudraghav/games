# Truth or Dare

The traditional party game, with an optional adult edition and
"burning building" forced-choice rounds (`id="truth-or-dare"`,
`family="truth-dare"`, 2 to 10 players, competitive). An original
implementation: every prompt in `prompts.py` was written for Games, none is
taken from a site, an app or a published deck.

**Anyone can pass at any time.** A pass scores nothing and costs nothing else.
Nobody has to answer, do a dare, or agree to be part of somebody else's dare.

## Manifest

| Field | Value |
| --- | --- |
| name, subtitle | `Truth or Dare`, `Answer honestly, take the dare, or save one from the fire` |
| minutes, icon, color | `10–25`, `flame`, `coral` |
| score | `score_label="Points"`, `score_order="high"` |
| rules_version | `house-1` |

Settings, in this order:

| Key | Label | Default |
| --- | --- | --- |
| `adults_only` | Naughty edition (18+) | off |
| `burning_building` | Burning building rounds | on |
| `name_players` | Burning building can name players in this room | off |

`manifest.rules` holds eight plain sentences. The public catalogue never
carries the adult fate wording.

## Rules

- Players take turns in seat order. On your turn you choose `truth`, `dare` or,
  when `burning_building` is on, `burning`. The server draws one prompt of that
  kind and shows it to **everyone**.
- **Truth or dare.** Answer or do it out loud, then mark it done, or pass.
- **Burning building.** Three candidates and three fates. Give each candidate a
  different fate. There is no pass on this round. Everyone sees the choice,
  then the player whose turn it was moves on.
- **Swap.** Once per match each player may swap the prompt they drew for
  another of the same kind, before answering. The one swap covers all three
  kinds.
- **Score.** A truth done 1, a dare done 2, a burning-building choice 1, a
  pass 0.
- **Length.** Everyone has the same number of turns: 4 each with 2 to 4
  players, 3 with 5 to 7, 2 with 8 to 10. Highest score wins; equal highest
  scores share the win (everyone, if all scores are 0).
- **No repeats.** A prompt is never drawn twice in a match. The decks are large
  enough that none can run out (at most 21 turns and 10 swaps).

### Editions and fates

| Edition | When | Truths and dares | Fates (`detail.fates`) |
| --- | --- | --- | --- |
| `friendly` | `adults_only` off | The friendly deck: no sexual content. | `Kiss`, `Marry`, `Leave behind` |
| `naughty` | `adults_only` on | The adult deck. | `Fuck`, `Marry`, `Kill` |

The two decks are separate lists and never mix. With `adults_only` off, no
adult prompt and no adult fate label appears in any view, action label,
message or history entry. The client reads the three fate labels from
`detail.fates` and never hard-codes them. Burning-building candidates come from
one shared list of fictional adult archetypes, roles and creatures.

### Naming players

With `name_players` on and at least three **other** players seated, about half
of the burning-building rounds use three other players as the candidates. The
engine knows only ids: a candidate is then `{label: null, player: <id>}` and
the client shows that player's display name. The same three people are not
shown to the same player twice; when no fresh trio is left, or with fewer than
three other players, candidates come from the written list. The player whose
turn it is never appears as a candidate.

## Phases

| Phase | Meaning | Who acts |
| --- | --- | --- |
| `choose` | A turn starts. | `current_player`: `pick`. |
| `prompt` | A truth or a dare is on the table. | `current_player`: `done`, `skip`, and `swap` if they still have it. |
| `assign` | A burning-building round is on the table. | `current_player`: six `assign` options, and `swap` if they still have it. |
| `result` | The three fates are shown to everyone. | `current_player` (the same player): `next`. |
| `finished` | Everyone has had their turns. | Nobody. |

After `done` or `skip` the next player's `choose` phase starts at once; what
happened is in `detail.last_result`.

## Actions

None of these uses an input kind: send the action exactly as it is offered.

| Type | Fields | Label | Notes |
| --- | --- | --- | --- |
| `pick` | `choice` = `truth`, `dare` or `burning` | `Truth`, `Dare`, `Burning building` | `burning` is offered only when the setting is on. |
| `done` | none | `Done` | Scores the truth (1) or dare (2). |
| `skip` | none | `Pass` | Scores 0. Named `skip`, not `pass`, so that lower bot levels can sometimes pass (see `app/bots/README.md`). |
| `swap` | none | `Swap for another` | Draws another prompt of the same kind. Offered while `swaps_left[player]` is 1. |
| `assign` | `choice` = three digits | e.g. `Kiss a vampire · Marry a pirate captain · Leave behind a wizard` | Six options: `012`, `021`, `102`, `120`, `201`, `210`. Digit *i* is the index into `detail.fates` given to candidate *i*. A named player appears in the label as `the player in seat 3`; build your own label from `detail.prompt.candidates` if you want names. |
| `next` | none | `Next turn` | Only in `result`. |

Three steps (one fate at a time) were considered and not used: six complete
options keep every action a whole, valid choice, and the client is free to
present them as three taps and submit the matching option.

## What a player sees

This is a shared table: every viewer gets the same `detail`. Only `actions`
differ. `players[]` has `id`, `count` (turns taken) and `score`. `hand` and
`community` are always empty.

`detail` holds exactly these keys, in every phase:

| Key | Shape | Notes |
| --- | --- | --- |
| `edition` | `friendly` or `naughty` | |
| `fates` | three strings | In the order the `assign` digits refer to. |
| `burning_building` | `bool` | The setting. |
| `turns_per_player` | `int` | 4, 3 or 2. |
| `turns_taken` | `{player id: int}` | |
| `prompt` | `null`, or `{player, kind, text, candidates, swapped}` | Set in `prompt` and `assign`. `text` is the truth or dare (`null` for burning). `candidates` is `null`, or three `{label, player}`: exactly one of the two is set. `swapped` is true once this prompt came from a swap. |
| `swaps_left` | `{player id: 0 or 1}` | For the viewer and every other player. |
| `last_result` | `null`, or `{player, kind, text, candidates, fates, outcome, points}` | The most recent finished prompt. `outcome` is `done`, `passed` or `assigned`. For burning, `fates[i]` is the index into `detail.fates` given to `candidates[i]`; otherwise `fates` and `candidates` are `null`. |
| `scores` | `{player id: int}` | |

`message` speaks to the player who acts: `Choose truth, dare or burning
building.` (or `Choose truth or dare.`), `Answer out loud, then mark it done.
You can always pass.`, `Do the dare, then mark it done. You can always pass.`,
`Three in a burning building. Give each a different fate: Kiss, Marry or Leave
behind.` (with ` You can swap once in the match.` added while the swap is
unused), `Everyone can see the choices. Move on when you are ready.`, and at
the end `Everyone has had their turns. Most points wins.`

## What the server keeps to itself

There is no private information between players. The only hidden things are
the undrawn prompts and their order (`stock` in the saved state) and the
private number that decides when a round names players. Neither appears in a
view. Public history uses fixed wording only (`Chose truth`, `Chose dare`,
`Chose burning building`, `Marked it done`, `Passed`, `Swapped the prompt`,
`Chose three fates`, `Moved to the next turn`): a prompt's text never enters
durable history.

## The decks

`prompts.py` holds 74 friendly truths, 74 friendly dares, 74 adult truths, 74
adult dares and 48 trios (144 different candidates). Rules every line follows:

- Short, second person, playable in a living room or on a video call. A dare
  that needs someone in the same room can be swapped or passed on a call.
- Nothing dangerous, illegal or likely to injure. No alcohol or drugs.
- No photos, recordings or posting, and no messages to people outside the room.
- No real, named people anywhere. Candidates are fictional archetypes.
- Nothing about anyone under 18. Nothing degrading, hateful or about
  non-consent.
- Friendly deck: suitable for a mixed group of adults and older teens, no
  sexual content.
- Adult deck: flirtatious and frank about attraction, dating and sex lives.
  Dares stay between consenting adults who are present and stop short of sex
  acts and nudity. Every dare that involves another player says it needs that
  player's yes ("…if they say yes").

`tests/test_truth_or_dare.py` checks the mechanical part of these rules on
every line: length, no digits, banned words, no capitalised names, no adult
words in the friendly deck, and the "if they say yes" rule.

## Bots and pacing

A bot picks truth, dare or burning building with fixed weights, marks most
prompts done, and gives fates at random. A bot's `done` is a table move that
keeps the scoring alive; it is not a claim that a bot said or did anything. A
bot waits 6 seconds on a burning-building result before `next`. Details are in
`app/bots/README.md`.

## States worth a tutorial step

1. Choosing: `Truth`, `Dare`, `Burning building`.
2. A truth on the table with `Done`, `Pass` and `Swap for another`.
3. A dare after a swap (`prompt.swapped`, no swap left).
4. A burning-building round: three candidates, three fates.
5. The result everyone sees, before `Next turn`.
6. A burning-building round naming three players (with `name_players` on).

## Tests

`tests/test_truth_or_dare.py`: deck sizes and uniqueness, the lint above, turn
counts at 2, 3, 4, 5, 7, 8 and 10 seats, scoring, one swap per player across
kinds, the six assignments, each setting, the adult edition, named players and
the fallback below three other players, no repeats in a match, whole friendly
matches searched view by view for every adult prompt and fate, the undrawn
deck never in a view, rejected actions, fixed history wording and the bot's
choices at every level. `tests/test_parlour_rooms.py` plays a two-person match
and a one-person match against bots over HTTP and checks both editions.
