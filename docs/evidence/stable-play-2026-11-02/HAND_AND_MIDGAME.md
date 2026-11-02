# Shared hand navigation and legal mid-game review

Local evidence for the stable-play-area change on 2026-11-02. Release and hosted
verification are recorded separately by the release owner.

## Shared interaction

`HorizontalRail` is the shared native-scroll primitive for hands, player strips,
collections and Tarot choices. It has separate 44px previous/next buttons when
content exceeds the available width; those buttons never cover a card face.
`navigationLabel` gives non-hand rails concise control names. `Hand` retains its
existing props, `.hand-scroll` group and `.card-hand` content selectors.

Touch scrolling, mouse controls and keyboard focus all reveal offscreen cards.
Focus revelation changes only horizontal scroll. Reduced motion disables smooth
navigation. Overflow decisions use the full rail width so adding its control
gutters cannot make the arrows repeatedly appear and disappear. At 390px, Deal
shows two complete 126px card faces between the controls. Selecting a card leaves
the hand and public table in place.

## Reproducible scenarios

`scripts/export_midgame_scenarios.py` exports **235 legal engine projections across
all 27 games**, including minimum and maximum player counts. Every trajectory
starts from a seeded engine setup and uses authorized legal actions. No hands,
decks or intermediate engine states are assembled manually. The dev-only route
`/design/midgame` renders these projections through the production table registry.
The route returns 404 in a production build and cannot save actions to real rooms.
Its Tarot cache disables external reading generation.

The exporter records which actions were offered, chosen and captured, rather than
equating a phase name with complete branch coverage. See
[`midgame-coverage.json`](midgame-coverage.json) for each run. Coverage includes:

- Deal payment, counters, blocked actions and property rearrangement; No Mercy
  keep/give/choose/debt decisions. The existing ten targeted Deal fixtures remain
  separate evidence for constructed swaps and counter-counter chains.
- Hold'em preflop, flop, turn and river; legal Blackjack splitting, insurance and
  doubling; Teen Patti sideshow and acceptance.
- Uno wild-four challenge and a legally reached 41-card hand; No Mercy choice
  decisions and a legally reached 24-card hand.
- Rummy stock draw, discard and valid declaration; Skyjo replacement, reveal and
  round closure; Shithead arrangement and pile play.
- Checkers captures, multi-jumps and kings; boop graduation; Gem Market patron
  and token-return decisions; Azul drafting, placement and next round.
- Flip 7 targeted effects; Trio reveal review; 6 nimmt row choice and ordered
  reveal; Sea Salt & Paper draft/steal/stop; The Gang street/showdown decisions;
  Word Agents clue/guess; party-game private response and public reveal phases.

Each move preserves independently counted physical inventory for the sixteen
card/tile game IDs (fourteen families when Uno and Deal editions are grouped).
Board-piece and party-game inventory are not claimed by this exporter. Projection
canaries reject stock identities, other private hands, Blackjack's dealer hole
card, unrevealed Skyjo cells, Shithead's facedown cards and internal shuffle keys.
Narrow public-reveal exceptions are documented beside the assertions. Only
synthetic UUIDs and display names enter the public development fixtures.

JSON keys are sorted for reproducible checks across independent Python processes.
Regenerate with `backend/.venv/bin/python scripts/export_midgame_scenarios.py`;
verify drift with the same command followed by `--check`.

## Browser checks and limits

The combined hand/mid-game browser run passed **10/10 checks** at 390px and 1440px.
The full scenario sweep checks page overflow, 44px enabled controls, card-text
bounds and successful decoding of every visible vector artwork resource. Other
checks verify stable card selection, native hand scrolling, keyboard revelation
without vertical movement, and actual split/insurance/declaration/challenge,
round-close and special-choice controls against their recorded legal continuation.
The preview emits no backend POST requests.

Visual review covered 34 representative and critical scenes at both widths,
including the committed seven-player split hand, insurance, Deal payments and
repossession, Rummy declaration, Uno challenge and large hands. Decoded artwork
was checked before capture. Six contact sheets, eight full-size views and a
manifest are retained in [`midgame-visuals/`](midgame-visuals/manifest.json). The
review caught clipped casino controls and unexplained split-hand overflow; the
owning table change corrected both before the final 10-check rerun (35.8s).

These projections are **not saved API rooms**. `GAMES_MIDGAME=1` extends the
existing `tests/browser/fullmatches.spec.ts` acceptance flow with up to eight
refreshed actor views per game/seat case, selected across phase changes and
critical action types. It checks stable selection in real authorized rooms and
records phase/action/version evidence. Its Rummy path draws and discards before
using legal drops to finish; a complete online declaration is not claimed by that
driver. Valid declarations are independently reached by the exporter and exercised
through the actual declaration control in this local review.

Full-match, reconnect, concurrency, authorization, production-route isolation and
deployment results belong to the release evidence. This document does not treat
local projections as proof of those flows or claim every rare rule branch appears.
