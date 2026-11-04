# Teen Patti

Classic three-card table, 2–6 humans, 52 cards, 200 free chips, boot 1. House
baseline: trails > pure sequences > sequences > colours > pairs > high cards;
AKQ is highest sequence, A23 next, then KQJ through 432. Suits do not break ties.
Blind players pay 1–2× the current base stake; seen players pay 2–4×. Looking at
cards is irreversible. Only seen neighbours may request/accept a sideshow with
three or more active players; rejection preserves both hands. Requester loses
equal hands. With two active players, blind may request show; seen may request
show only against seen. The table caps base stake at 64 and pot at 1024; a pot
cap causes a multiway showdown. These are explicit app house limits.

Optional sideshows default on. Folded cards remain hidden. Reference checked on
1 November 2026: [Pagat's documented rules](https://www.pagat.com/vying/teen_patti.html).
This app deliberately uses AKQ above A23 and permits seen-neighbour sideshows
without requiring every remaining player to be seen; these are fixed house
choices rather than a claim of one universal edition. `test_table_rules.py`
checks seen stake parity, blind privacy, show eligibility, sideshow consent/ties,
requester-loses showdown ties, min/max full matches and chip conservation.
The pot cap settles immediately, even when a sideshow payment crosses it.

Blind/Seen status is public for every seat. Sideshow detail identifies the
requester, responding neighbour and paid cost, and the eligible request names its
target before commitment. The UI explains accept/decline consequences and the
server-offered wager range/parity. This exposes no pocket cards: a private
sideshow comparison still does not add either hand to the public reveal list.
`test_casino_explanations.py` drives peek/bet/request/decline legally and verifies
public parties/status while each participant sees only their own pocket cards.

The projection also carries public table records that reveal no cards: chips each
seat has put in (`paid`, boot included), why a seat is out (`out_reasons`:
packed, lost_sideshow, lost_show), the latest sideshow response
(`sideshow_result`: requester, target, accepted, loser — who packs is public,
neither hand is) and how the hand ended (`finish_reason`: show, pot_limit,
packed). At the end, publicly shown hands get a category, rank and description
(`hand_evaluations`, Trail through High card); the viewer's own seen hand gets
`own_evaluation`. `message` is the instruction for the seat that can act (or the
responding neighbour), and at the end the comparison that decided it ("Show:
colour beats pair.", "Pot limit reached, so every hand was shown: both hands are
high card; the third card decides."). The bet is labelled "Blind bet" or "Chaal"
(seen bet). Rules and outcomes are unchanged.
