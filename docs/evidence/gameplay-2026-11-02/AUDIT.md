# Gameplay framing audit — 2 November 2026

The outcome is a readable play area whose cards and board explain the next
decision. The supplied Playdeal screenshots set the interaction reference:
recognizable card identities, public collections visible while choosing, direct
targets, clear turn ownership and compact secondary information. Untimed turns
and the existing authoritative engines remain product requirements.

## Evidence and limits

Before changes, all 54 synthetic `/design` projections were captured at 390×844
and 1440×1000: **108 original frames**. Every frame was visually reviewed in
18 labeled contact sheets; important changed cases were also opened full size.
The baseline is the clean `b2baa710` checkout. These are public synthetic names
and projections, never saved private rooms or hidden engine state.

The full local captures and measurements are retained under
`output/playwright/gameplay-audit-20261102/before`. They report zero document
overflow and zero enabled controls below 44px at these sizes. That establishes
geometry, not good gameplay: several tables still spend the first fold on
controls or empty information, and a horizontal rail can hide an important
choice without overflowing the page.

This matrix assesses the initial projected play area at both seat limits. It
does **not** establish every mid-game state, rules correctness, complete live
matches, all large-hand states, screen-reader quality or production behavior.
Selected-card, payment, split-hand, closed-round and AI-reading states require
their separate focused checks. The parent release owns the Deal/shared-card
redesign and complete release verification.

## All 27 games

Phone heights below measure only the maximum-seat table component, excluding
the gallery header. "Retain" means no material fault in that captured initial
state; it is not a claim that every state is perfect.

| Game | Phone baseline height | Captured decision / problem | Disposition |
|---|---:|---|---|
| Uno | 550px | Clear piles and hand, but generic color labels and pale ranks; an out-of-turn pane can be visually empty. Forty-two-card stress hand needs deliberate inspection. | Parent owns card identity, pile/hand workspace and turn framing. |
| Uno No Mercy | 502px | Special-card names and symbol hierarchy are harder to distinguish in the same generic card frame. Horizontal stress hand is safe but hides later cards. | Parent owns edition-specific faces and shared workspace. |
| Monopoly Deal | 1,082px | Piles, hand and actions appear before the actual property board. Generic colors/castles do not identify properties; empty opponents consume space. | Parent replaces the play area, names, property sets and contextual actions. |
| Monopoly Deal No Mercy | 1,082px | Same composition problem; edition effects must remain distinct and the approved house deck label must survive. | Parent owns Deal family and edition treatment. |
| Texas Hold’em | 822px | Phone cards and a tall betting panel precede the tiny table; desktop seats read better. Opening fixture does not exercise split pots or later streets. | Parent owns casino workspace/micro-interactions. |
| Rummy | 868px | Stock, sort tools, grouped hand and decisions work, but card/toolbar proportions consume the phone fold. Declaration groups are not exercised here. | Parent owns rummy/table changes. |
| Teen Patti | 676px | Betting controls precede all public context. Blind hands remain correctly hidden; desktop ring is clear. | Parent owns casino workspace. |
| Blackjack | 499px | Initial wager screen is compact but mostly empty. No fake cards are invented. Split/hit/double hands require separate evidence. | Parent owns casino workspace and actual active-hand states. |
| Skyjo | 1,845px | Own grid is readable; seven opponent grids produce a very long page. Grid identities must remain fixed while compacting. | Parent owns grid/table pass. |
| Pop Tarot | 744px | Card picker and the three spread positions are readable and consistent. Captures show backs only, not all 78 illustrations or character/reading results. | Retain initial picker. No artwork-completeness or AI-reading claim from this audit. |
| Four in a Row | 493px | Actual board dominates; seven column controls, distinct tokens and legal disabled states are readable. | Retain direct board controls. |
| Reversi | 489px | Complete eight-column board, visible legal markers and contrasting pieces. | Retain direct board; no decorative redesign needed for this state. |
| Word Agents | 600px | All 25 words fit. Visible team counts and explicit private spymaster key distinguish roles. This fixture is an inactive spymaster, so no clue form or operative confirmation is being claimed. | Retain board-first composition; exercise role transitions separately. |
| Gem Market | 1,632px | Empty resource/discount stack, actions and high-tier cards precede affordable cards; phone rows hide half their cards. | Own pass: paired wallet counts/discounts, Tier 1 first, three phone tier pills and readable 2×2 market; all 12 cards remain visible on desktop. |
| Checkers | 507px | Whole board and kings are recognizable; source/destination flow is explicit. | Retain direct board. Initial state does not prove multi-jump behavior. |
| Mancala | 459px | Seed counts remain exact over bounded marbles, own side is labeled, legal pits are clear. | Retain board/pits. Opening state does not prove capture or extra-turn messaging. |
| Flip 7 | 1,745px | Hit/stay precede the own live run; ten fully expanded players make it difficult to compare a hand with its risk. | Own pass: own cards/risk immediately precede decisions; public opponent score/status stays visible with keyboard-expandable cards. |
| Trio | 1,024px | Private sorted hand, table cards and hand-end requests are distinct but table memory positions are unnumbered; noninteractive private ranks extend outside the phone view. | Own pass: numbered stable positions and a private low-to-high hand that wraps, so every rank is readable without scrolling; direct lowest/highest actions retained. |
| Azul | 863px | Phone factory rail conceals the center at its far end. Factory scrolling has no explicit click alternative; placement board itself is readable. | Own pass: always-visible center/first-player marker and explicit previous/next factory navigation; placement keeps board first. |
| Spill or Chill | 716px | Question and share/private/pass actions are clear; confirmation is an isolated short button. | Own pass: full-row confirmation; private/pass options preserved. |
| Most Likely | 869px | Two-column vote targets work at ten seats; submitted count is readable and votes remain secret. | Own pass: full-row confirmation; retain grouped vote grid and hidden choices. |
| Hot Seat | 763px | A/B text repeats in the prompt and in the actual answer buttons. | Own pass: one active choice set; revealed rounds retain the A/B reference; full-row confirmation. |
| The Gang | 831px | Cards sit far from instructions on desktop; six ranking chips wrap into two rows on phone without a visible weakest-to-strongest scale. | Own pass: grouped private hand, rank scale and a single six-chip row at 390px; narrow 320px fallback preserves 44px touch controls. |
| 6 nimmt! | 715px | Private number is selected before seeing row ends/capacity; four generic boxes conceal why the sixth card is risky. | Own pass: four ascending rows before the hand, five explicit slots each, exact penalty totals and full-row commit. |
| Sea Salt & Paper | 950px | Shared draw/keep choice leads; illustrated discard identities, own hand and expandable played duos are readable. | Retain initial composition. Empty opening hand does not establish duo/action/scoring states. |
| boop. | 647px | Kitten/cat inventory and actual 6×6 bed dominate; coordinates and graduation counts are readable. | Retain distinct illustrated pieces and direct placement board. Promotions/edge boops require separate saved interaction tests. |
| Shithead | 1,469px | Six-card selection is reachable, but five full opponent face-up/hidden areas produce a very long setup page. | Parent owns compact player table states and setup/turn action framing. |

## Acceptance for the scoped pass

- The live hand/board is visible alongside the decision it informs; opponent
  cards remain inspectable using mouse, touch and keyboard.
- Azul's center never depends on reaching the end of a factory rail. Every
  factory remains reachable without dragging, including with reduced motion.
- Gem Market exposes all four developments in each phone tier, preserves each
  card's real tier, and keeps the full 12-card desktop market.
- Number-row capacity is visible before committing a private number. No private
  opponent selections are inferred or exposed.
- Party answers appear once while choosing. Required confirmations occupy a
  complete row; waiting/reveal/privacy behavior remains server-owned.
- Each changed family is checked on phone/desktop, pending/disconnected controls
  and real room decisions, not just compiled.

Scoped source ownership: `modern/*`, `coop-number/*`, `party/PartyTable`,
`gems/GemsTable`, their four stylesheets, and `gameplay-framing.spec.ts`.
No engine rule, schema, API response or production configuration is changed by
this scoped composition pass.

## Scoped verification and retained after evidence

- `gameplay-framing.spec.ts`: final **12/12** cases pass on phone and desktop,
  including an additional 320px sweep, private Trio ranks without scrolling,
  keyboard opponent inspection, factory navigation without dragging, visible
  five-slot rows, pending commitment, all phone market tiers and single Hot Seat
  choices. The phone tier controls are hidden on desktop because all tiers show.
- Existing modern/co-op/party room flows: **10/10 saved interaction cases** pass
  across phone and desktop, including independent players, private choices,
  ranking-chip transfers, reveals and refresh. The four corresponding visual
  cases pass. One initial desktop assertion counted CSS-hidden navigation as
  0px controls; the corrected `:enabled:visible` assertion matches the existing
  density test's visibility rule and passes on both sizes.
- Focused modern/co-op/party unit/policy files: **14/14** pass, including seeded
  modern full-match drivers. Scoped component ESLint, browser TypeScript and
  `git diff --check` pass. Global web TypeScript was still affected by the
  parent's in-progress Deal review fixture types when this subtask checked it;
  it is part of the parent's final release gates.
- The full final changed-family capture set has 36 min/max phone/desktop frames
  plus two 320px Trio frames. All have zero document overflow and no visible
  enabled control below 44px. The 36 frames were reviewed as six contact sheets,
  with important cases opened full size. This establishes current projection
  layout, not all possible game states. Gem Market's new tier selection was
  checked in the synthetic browser; its saved-room flow belongs to the parent
  catalogue/release check.

Measured maximum phone component heights improve from 1,745→1,151px in Flip 7,
1,632→1,339px in Gem Market, 831→629px in The Gang and 763→681px in Hot Seat.
Azul's desktop table falls from 1,052→739px by putting its supply beside the
player board. Some phone layouts deliberately grow: Azul keeps the center
accessible; Trio exposes every private rank and numbered memory position;
6 nimmt! shows all five row spaces before a decision. Height alone is not the
acceptance criterion.

The 18 `before-*-page-*.webp` sheets retain the full original audit. The six
`after-*-page-*.webp` sheets retain all scoped final projections. Fourteen
full-size after frames and [checks.json](checks.json) preserve readable details
and measurements. Selected examples:

- [Azul desktop](after-azul-1440.webp) · [phone](after-azul-390.webp)
- [Gem Market phone](after-gems-390.webp) · [desktop](after-gems-1440.webp)
- [Flip 7 phone](after-flip-7-390.webp) · [Trio phone](after-trio-390.webp)
- [The Gang phone](after-gang-390.webp) · [6 nimmt! phone](after-six-nimmt-390.webp)
- [Hot Seat phone](after-hot-seat-390.webp)

All changes/evidence in this subtask are local. Parent owns commit, push,
deployment and current production acceptance. The exact isolated audit browser
is closed after capture. Baseline frames remain available for the parent/shared
card comparison; requested app/API services, account sessions and all other work
are preserved.

## Final saved-room follow-up

Gem Market actual-room checks passed on phone and desktop after the composition
changes: select three gems, save the move, observe the authoritative version and
refresh. Both test matches/members and independent browser contexts were cleaned
up. This closes the earlier synthetic-only Gem Market caveat. Root release
evidence separately records Deal full matches, shared cards and hosted proof.
