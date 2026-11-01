# Word Agents

A Games-owned Codenames-style experience for 4–10 people. Publisher reference:
https://www.czechgames.com/for-press-games/codenames (25 public words, two teams,
private spymaster key, clue-plus-one guesses, bystanders, opposing agents and the
assassin). This module uses an original common-noun list and original visual design.

The first two seats are the red/blue spymasters; remaining seats alternate
red/blue operative roles. A seeded shuffle chooses 25 distinct words, a starting
team and the key (starting team nine agents, other team eight, seven bystanders,
one assassin). Only spymasters can see unrevealed identities. Finished games
reveal the key. Public remaining counts do not disclose positions.

Edition choices: a one-word English clue with a count from one to nine; zero and
unlimited clues are not used. Exact visible board words are rejected. Spelling,
word forms and semantic fairness are group agreements rather than unreliable NLP
judgments. Operatives of the active team may confirm guesses, with version checks
serializing simultaneous selections. At least one guess is required; after a
correct guess, stop voluntarily or continue to at most count plus one. An enemy
agent or bystander ends the turn. Finding either team's last agent immediately
awards that team victory; the assassin immediately awards the opposing team victory.

There is no deck/discard score. The result names every member of the winning team;
contact counts are shown as scores. Setup, moves and views are deterministic for
a saved seed/state. Acceptance covers all endings, clue bounds, mandatory first
guess, guess limits, teammate actions and key privacy across every role.

The 1 November 2026 audit reviewed CGE's publisher description against these
explicit house choices. `test_expansion.py` covers the assassin, last enemy agent,
clue rejection, guess limit and key privacy; `test_table_rules.py` completes
shuffled matches at 4/10 seats without altering the saved key or board.
