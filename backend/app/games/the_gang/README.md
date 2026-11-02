# The Gang — basic game

Publisher rules audited 1 November 2026: [Kosmos English manual](https://www.thamesandkosmos.com/manuals/full/683887_TheGang_Manual-Web_051624.pdf), pages 3–13. Three to six human players cooperate. Games includes the complete basic game; optional challenge/specialist cards and Advanced, Professional or Master Thief modes are not offered. The physical box has 90 cards, but basic gameplay uses only the standard 52-card deck plus three vault and three alarm counters; overview cards are reference material. Four chip colors have ranks 1–N for N players.

A match has three to five heists. Shuffle all 52 cards for each heist and deal two private pocket cards to each player. Estimate relative hand strength by taking the current round's chips: white preflop, yellow after three community cards, orange after one more, red after the fifth. Anyone may take a free chip or steal another player's chip, returning their previous chip to the center; a chip may also be returned. Each player holds at most one current-color chip. As soon as everyone has a chip the round ends automatically; previous-color chip ranks remain public. There is no betting, folding, dealer money or burn card in this basic game.

The timing is explicit on publisher page 6: “As soon as everyone has a chip in front of them, Round 1 ends.” The same procedure repeats for later chip colors. An added ready/consent window would change this basic edition. The UI describes the last-free-chip consequence before the player confirms it.

After the red chips fill, reveal pocket hands in ascending red-chip order, using each player's best five of their seven cards. Nondecreasing true poker ranks are correct, including exact ties in either order. Any inverted adjacent comparison fails the heist. Games lets each next player explicitly reveal, then displays a review; all pocket cards become public only through those reveal actions. Three successful vaults wins for every player; three alarms loses for the whole group. Winning participants all appear as winners, and a team loss has no individual winner. Each player's recorded score is the shared number of cracked vaults.

Communication is limited by social agreement: never reveal information about your own hand through chat or speech. Chips communicate estimates. The server protects hidden hands/deck order, but cannot adjudicate ordinary conversation. A private best-hand label is offered only once five cards are available; it never appears in another player's view. Next-heist review is advanced by the first seat, a digital pacing convention replacing physical table cleanup.

Acceptance: 52-card conservation per heist; immutable actions; chip uniqueness, stealing, returns and automatic streets; exact tied and inverted showdowns; three-vault/three-alarm terminal outcomes; hidden hand/deck projections; natural complete minimum/maximum matches. Original Games card/chip presentation is used, with no publisher art.

Persistence regression: `test_coop_number_rooms.py` fixes only the ordinary setup
shuffle (seed 0), then performs all 79 legal moves through HTTP. Its two-vault,
three-alarm defeat must finish the room, save an empty winner list with shared
scores in every participant's history, and survive a new application lifespan.

After a pocket-hand reveal, the viewer's privacy caption changes to public and
that hand gains a best-five/category/kicker explanation using the core poker
evaluator. Hidden crew hands receive no explanation. Completed heists show the
chip order, evaluated order and each adjacent inversion that failed the heist;
exact ties are explicitly allowed. `test_casino_explanations.py` verifies staged
reveal boundaries, public best-five identities and the inverted-order explanation.
