# Slots

An original, single-player machine with one centre payline, three independent
reels and five spins. The player starts each match with 100 free chips and
chooses a whole-chip stake from 1–10 before each spin. Settlement debits the
stake, then credits the gross award. Finishing above the starting balance wins.
An even balance is a break-even session. Rematch starts a new five-spin session.

## The paytable

Each reel has 12 equally likely stops with four cherries, three lemons, two
bells, two stars and one seven. `REELS` lists each circular strip in order.
A spin independently selects one stop on each reel, giving 1,728 equiprobable
stop triples. Repeated symbols increase their frequency. The visible centre
line determines exactly one award.

| Payline | Gross return including stake | Stop triples |
| --- | ---: | ---: |
| Three sevens | 100× | 1 |
| Three stars | 15× | 8 |
| Three bells | 12× | 8 |
| Three lemons | 8× | 27 |
| Three cherries | 5× | 64 |
| Exactly two cherries in any positions | 2× | 384 |
| All other lines | 0× | 1,236 |

The positive-hit rate is 492/1,728 (28.47%). At a stake of one, the gross
return over all possible lines totals 1,620 chips, for a theoretical return
of 93.75% and a 6.25% house edge. A 4-chip spin with two cherries returns
8 chips, a net gain of 4. A miss on the same stake costs 4. Each new spin
has the same odds regardless of earlier results or the chosen stake.

## State and verification

Setup samples independent stop indices using the operating system’s random source in ordinary games. A fixed test seed reproduces a session.
The saved private stops make a retry from the same state deterministic. The
participant's projection includes the table, exact counts, balance and settled lines.
Only the participant can commit spins; there are no bot seats. Room version
and action receipts guard against committing the same spin twice.

`backend/tests/test_slots.py` enumerates all 1,728 stop triples, checks gross
and net payments at both stake bounds, and covers authorization, private
projection, stake validation, replay and complete five-spin sessions.
