# Games party originals — house rules v1

These three Games-owned modes use original prompts and artwork. They are not
adaptations of commercial prompt decks. Research on 1 November 2026 included
[Relatable's current Buzzed family](https://relatable.com/collections/buzzed),
its [publisher-described best-selling party format](https://relatable.com/products/buzzed-battle),
and [RallyDeck's online party formats](https://rallydeck.net/); no prompts were
copied. Drinking-card formats informed optional social pacing, not scoring.
Our Hot Seat uses original A/B preferences, not the commercial write-an-answer
deck or its scoring system. All three catalogue entries say Games house rules.

## Shared contract

3–10 human players; two complete rotations of the seats (6–20 rounds). Each
mode has 48 original prompts. A seeded shuffle selects a nonrepeating sequence;
only the current prompt is projected. Everyone has exactly two spotlight turns.
No timer. `sip_prompts` is off by default and only adds an optional suggestion
using any drink. Passing is always available and does not require drinking,
disclosure or an explanation. No quantity, speed or finish-your-drink prompts.
Scores are room-only and have no money value. Equal highest scores share the
result; if all scores are zero, everyone ties. A final reveal remains visible
in results. Rematch uses a new shuffled match through the ordinary room flow.

## Spill or Chill

A rotating spotlight player sees an open conversation prompt. Choose **Share**
after answering aloud, **Chill** to decline answering, or **Pass** to skip. Share
and Chill both earn one participation point; Pass earns zero. Sharing is not
recorded as text or evaluated by AI. The choice is public after submission.
Any optional sip suggestion is a social extra and never a required action.
The spotlight player advances the reveal. The most participation points wins.

## Most Likely

Everyone secretly votes for one other player or passes. You cannot vote for
yourself. Submitted votes are locked, and nobody sees another vote before all
players have submitted. Once all submit, reveal the complete tally and choices.
Each player tied for the largest positive vote total receives one spotlight
point; an all-pass round awards none. The rotating spotlight player advances
the reveal. Most spotlight points wins. Optional sip prompts apply only as a
choice after the tally, with no score effect.

## Hot Seat

The spotlight player secretly chooses A, B or Pass for a two-option preference
prompt. Everyone else secretly predicts A, B or passes. All decisions may arrive
in any order and lock on submission. Neither the hot-seat answer nor predictions
are projected before every player has submitted. After reveal, each matching
prediction scores one; the spotlight player does not score. If the spotlight
passes, nobody scores. The spotlight advances the reveal. The most correct
predictions wins; two equal rotations give every seat equal opportunities.

## Edge cases and acceptance

Outsiders, duplicate submissions, role-mismatched actions, forged targets,
self-votes, reveal advancement by a different player and post-finish actions
are rejected. Applying a move never mutates its input. Public views contain
only submission status while collecting, the viewer's own locked decision and
public revealed results. Hidden prompt order and other decisions stay private.
Minimum/maximum deterministic matches, scoring/ties/all-pass rounds, prompt
uniqueness and every private-view transition are tested. Browser acceptance
must cover phone/desktop choices, pending states and a completed match.

Local verification on 1 November 2026 passed 26 engine tests, two isolated
Postgres HTTP privacy/concurrency/restart tests, three frontend render/contract
tests, six independent-session click workflows and twelve full-match cases
(all modes, both seat limits, both viewports). Full matches verified natural
results, saved scores/history, rematch and same-group game switching. See
`docs/evidence/modern-party-2026-11-01/PARTY.md`; production verification is a
separate release step.

Messages (3 November 2026): the collection-phase message is the instruction for
players still choosing and does not change when others lock in (it used to read
"Decision locked" to undecided players). Spill or Chill's instruction states the
scoring (+1 for Spill or Chill, nothing for Pass).

