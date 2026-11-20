# Roulette

One player starts with 100 free chips and places one wager per spin, for up to five spins. The player can change the bet and stake until submitting the spin. An empty balance ends the round early. The final score is the change from 100 chips. Finishing above 100 wins. A rematch starts a fresh wheel and balance.

| Bet | Winning pockets | Chance | Total returned on a win |
| --- | --- | --- | --- |
| Any one number from 0 to 36 | The selected pocket | 1/37 | 36 × stake |
| Red or black | 18 of the numbered pockets | 18/37 | 2 × stake |
| Odd or even | 18 numbers from 1 to 36 | 18/37 | 2 × stake |
| Low (1–18) or high (19–36) | The chosen inclusive range | 18/37 | 2 × stake |

Zero is green. Only a straight bet on zero wins there. A losing wager returns zero. All displayed returns include the stake, so a successful one-chip single-number wager has a net gain of 35 chips. Each supported bet returns 36/37 of its stake on average over equally likely pockets. [Massachusetts Gaming Commission roulette rules](https://massgaming.com/wp-content/uploads/RULES-Roulette-10-8-20.pdf)

Production samples each of the five independent pockets with replacement using operating-system randomness when the match starts. Unrevealed pockets stay in private match state. Retrying a committed action through the room service returns its existing receipt. A submitted bet cannot influence the pocket. Only a player's settled results and available choices appear in their projection.

`backend/tests/test_roulette.py` checks the 43 legal choices on all 37 pockets against the physical wheel order, gross and net awards, repeatable game-state transitions, privacy, bankruptcy, final settlement and fresh starts.
