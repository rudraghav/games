# Visual polish pass, 2026-11-21

The owner asked for a better colour scheme and contrast (starting with Deal),
gradients instead of colour dots on any-colour Rent, refined card faces, hover
and click states, processing feedback, tooltips and small bottom-right
notifications for notable actions; then the same for the other games, with
depth ("3D"), animation, and Tarot gaps and reading improvements.

## Deal colours (measured, WCAG contrast ratio)

Before: sky 2.0, yellow 1.8, pink 2.7, orange 2.5 and utility 2.5 against the
card; captions as small as 6.5px in grey. After, every pair is 4.5 or more:

| Colour  | Text on its fill | Its name on the card |
| ------- | ---------------: | -------------------: |
| Brown   |             7.29 |                 8.76 |
| Sky     |             7.58 |                 5.89 |
| Pink    |             4.53 |                 6.12 |
| Orange  |             6.93 |                 5.33 |
| Red     |             4.66 |                 6.20 |
| Yellow  |            10.28 |                 5.59 |
| Green   |             4.97 |                 6.03 |
| Blue    |             8.34 |                 8.21 |
| Rail    |            14.23 |                14.00 |
| Utility |             9.26 |                 5.55 |

Money denominations are 5.05 to 6.70 on their tints; action art 5.25 to 7.32;
body captions 8.04. The app's shared muted text went from `#77796e` (4.0 on the
canvas) to `#62665b` (5.3).

## What changed

- Deal: faces rebuilt in `deal-cards.css` (colour header with kind and value
  pill, named colour, rent ladder with the full-set step filled); two-colour
  wilds lead with the active colour; any-colour wild and Rent use the
  ten-colour spectrum as a gradient; Rent keeps an action header with a gradient
  ribbon and disc; money is tinted by denomination.
- Shared: hover lift, press, selection ring, processing sweep on the played card
  and commit button; one app tooltip (`data-tip`, or `title` on controls);
  bottom-right action notifications for notable public moves only.
- Other card games: paired fill/print colours for Uno, Flip 7, Skyjo, Trio,
  6 nimmt! and the standard deck; new card back; muted (not faded) unplayable
  cards; arrive, discard-settle and 3D turn-over motion.
- Boards and pieces: lit discs, wells, carved Mancala tray, glazed Azul tiles,
  stacked tokens and chips; drop, flip, slide, capture and seed-hop motion; red
  checkers on green went from 1.03 to 3 or more.
- Tarot: status line for every table state, finished reading with an "In short"
  panel, per-card position and meaning, full-card dialog, copy/share, skeleton;
  solo readings refuse other players; each card in a reading request carries its
  position focus and orientation.

All motion is disabled under reduced motion. No game rules changed.

## Verification on the final source

- Passed: frontend (types, lint, unit tests, production build), backend,
  contracts, tooling, multiplayer, migrations.
- Card inventory browser check with Storybook: no clipped, colliding or
  under-size text on any face.
- Browser suite on the final source: 454 passed, 61 skipped, 9 failed (6
  distinct tests). Five tests fail on the previous commit as well and are
  unrelated to this pass (confirmed by running them against the previous
  commit): `board-accessibility-saved`,
  `crowded-actions-saved`, `crowded-deal` (crowded Sly Deal), `modern`
  (saved Azul move) and `dashboard-live`. Three stale checks were corrected:
  Azul's singular "1 blue tile", Skyjo's "Removed columns" casing, and the
  density check now includes the Roulette and Slots tables. The sixth, the
  split-Blackjack steadiness check, failed once per full run under load (a 52px
  height change in the own-cards rail) and passed 8 of 8 when repeated alone;
  whether it was already intermittent before this pass is not known.

## Not verified

- Tarot reading changes were not evaluated against a real AI reading.
- Roulette and Slots received only minor state polish.
- Motion was reviewed in slowed frame captures, not on physical phones.
