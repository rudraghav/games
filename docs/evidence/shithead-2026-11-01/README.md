# Shithead verification — 1 November 2026

Initial local source evidence is based on main `3335cdae`; those local records
make no deployment claim. The production section below records the subsequent
live acceptance against the parent's verified serving revision.

- 38 focused rule tests include 28 natural matches at 2/5 seats, default and
  optional rules, all 52 cards conserved, legal/illegal actions and hidden privacy.
- 11 registry/generic-playthrough/shared policy cases and two isolated HTTP cases
  pass. HTTP checks naturally finish one human plus bot and start five seats.
- Four phone/desktop checks cover min/max setup geometry, real two-human setup
  via mouse/touch/keyboard, a hand move, refresh, stale rejection and room closure.
- Both real-client solo matches pass results/history/profile/rematch/game-switch.
  Phone: final version65, 32human moves/32bot drives. Desktop: version75,
  38human moves/36bot drives. Both groups are closed. Safe details: `local.json`.
- Three focused frontend units, workspace TypeScript, browser TypeScript,
  focused lint, Ruff, mypy and import boundaries pass.
- Final separate-card/viewport/44px geometry checks pass both widths. Initial
  visual checks found a short Sort target and a max-seat strip with clipped
  overflow; scoped card/strip sizing fixes were verified and inspected again.

The retained images are synthetic canonical maximum-seat setup fixtures in the
local component gallery, **not production room screenshots**. Its heading and
scenario controls belong to the gallery. Production rooms reuse the same table.
The five-seat strip and hand scroll internally on phones; panel bounds stay
inside the viewport. No other hand or hidden table-card identity is present.

- [Phone maximum setup](phone-five-seat-setup.png)
- [Desktop maximum setup](desktop-five-seat-setup.png)
- [Owning rules](../../../backend/app/games/shithead/README.md)

The bounded rule-based bot uses only its own cards and public data. Its cycle
memory varies legal choices; it does not create a draw, force a loser, or impose
a turn deadline. Traditional Shithead can be long; rule correctness remains
separate from playing strength. All task rooms were closed in test cleanup.

Cleanup removed only eight verified task-owned temporary output directories and
obsolete attempt logs/summaries (about5.5MB). The inspected images, this concise
record and final local logs remain. Web3217 and API8217 health/catalogue return
200; requested services and the user's browser were preserved.

## Independent human full matches at both limits

The current uncommitted local workspace also passes all four full-match cases
(two viewport projects,51.8s total): desktop2seats59moves/5seats107moves,
phone2seats57moves/5seats155moves. Choices use only each independent human
session's authorized projection. All matches reach their natural result and
verify saved/profile/rendered results, rematch and group retention. No engine
state or outcome was overridden.

[Desktop summary](fullmatches-desktop.json) and [phone summary](fullmatches-phone.json)
explicitly label dirty local source, without claiming a deployed revision.
Both are complete with no active case, allnine guest leaves200, host leave200
and roomClosed:true. The final newly started rematch is deliberately abandoned
before group closure; the four scored/finished acceptance matches are natural.
All task browser contexts close. The exact disposable output directory was
removed after source/symlink/open-file checks, with the concise log retained;
web3217/API8217 health still return200. No runtime change or restart occurred.

## Production acceptance

The live app at https://games-seven-black.vercel.app passes all four natural
Shithead matches at both seat limits and widths (two viewport projects, 1.9 minutes total):

| Width | 2 players | 5 players |
| --- | --- | --- |
| Desktop | 99 moves | 140 moves |
| Phone | 76 moves | 143 moves |

Serving application SHA: `c1169d204e99e2da70cafa2c9a8fe0aaf7793142`.
Deployment: `dpl_8F3o8ntZKUXCbpvoGxi5G93LDt43`, verified by the parent release.
[Desktop production summary](production-desktop.json) and
[phone production summary](production-phone.json) retain the explicit serving
revision separately from dirty local test-driver changes. Local evidence above
is preserved. No runtime, configuration or deployment change was made by this run.

Natural outcomes, history/profile, rendered results, rematches and group retention
pass in all four cases. Both groups are complete, have no active case, and close
successfully: each four guest leaves200, host leave200, roomClosed:true and no
cleanup failure. Fresh rematches are deliberately abandoned before closure.
Task browser contexts close; trace capture was off. The exact owned disposable
output was removed after Git/symlink/open-file checks; concise log retained.
Production home and requested local web/API health all return200 after cleanup.
