# Non-Deal stable play areas — 2026-11-02

These checks cover presentation against authorized game projections. Engine and
saved-room acceptance remain separate checks in the release journal.

## Observable changes

| Family              | Stable play area / decision behavior                                                                                                                                                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Uno editions        | Hand, piles and action area retain their bounds when a card is selected or cleared.                                                                                                                                                                      |
| Rummy               | The grouping controls keep their space before selection; selecting a card never inserts a row before the hand.                                                                                                                                           |
| Casino games        | The own-card well remains before dealing and after splitting. Decisions use 192px desktop / 252px phone, start inside the area and scroll internally when needed. Split hands have explicit arrows and preserve the automatic reveal of the active hand. |
| Skyjo               | One full own grid stays first. Opponents have public miniature grids, scores and an explicit public-only inspector.                                                                                                                                      |
| Shithead            | Own private cards, public table cards and hidden slots have stable wells. Opponent summaries retain face-up cards and hidden counts; inspection never invents hidden ranks.                                                                              |
| Gem Market          | Selecting resources/developments preserves market bounds; selected counts stay on one line. Opponent permanent discounts remain visible.                                                                                                                 |
| Azul                | Drafting and placing share the same supply/board positions. A persistent tile preview and disabled-until-legal floor control avoid later insertion. Public wall/floor progress stays in player summaries.                                                |
| Trio / Flip 7       | Reveals and review choices have a reserved lane; longer public card runs remain horizontal rather than wrapping the whole table.                                                                                                                         |
| Word Agents / boop. | Confirmation and graduation choices replace content in a stable workspace; exact word/square targets stay visible on their boards.                                                                                                                       |
| The Gang / 6 nimmt! | Private choices keep the community/penalty rows in place. Row-taking controls retain 44px targets in the later phase.                                                                                                                                    |
| Party games         | Choosing, waiting and revealed results share one bounded decision area.                                                                                                                                                                                  |
| Tarot               | Spread meaning lines reserve their space before reveal; the complete deck has explicit horizontal navigation.                                                                                                                                            |
| Classic boards      | Existing direct square/pit interactions remain; shared seats gain bounded navigation and 44px inspection/disclosure targets.                                                                                                                             |

Shared `DecisionDock`, `HorizontalRail`, `ActionPanel`, `PlayerStrip` and
`OpponentPanel` own these recurring behaviors. No client code calculates a move,
reads an unprojected hand, or writes game state directly.

## Verification

- `pnpm exec playwright test tests/browser/stable-game-tables.spec.ts --workers=2 --trace=off`: **16/16 passed** at 1440×1000 and 390×664, reduced motion.
- Checks compare x/y/width/height before and after selection/clearing/grouping, with a maximum 2px difference. They exercise legally reached guessing/keeping/graduation choices and a committed Azul draft.
- The casino sweep checks every enabled control in the generated casino scenarios, fixed dock height, initial heading/first-action visibility and internal scroll reachability. A committed split checks explicit next-hand navigation and stable felt/card/control bounds.
- Public-only Skyjo and Shithead inspections retain anonymous hidden slots and never render hidden ranks as actionable cards.
- `pnpm --filter @games/web exec eslint src/games`: clean.
- `pnpm exec tsc -p tests/tsconfig.json`: passed.
- Focused Vitest checks for `table-layout`, `casino-motion`, `card-workspaces` and `shithead`: **22/22 passed**.

The separate midgame matrix and saved-room matches cover the wider catalogue;
see the root evidence and journal for those final results. Browser projections
alone do not prove network retries, persistence, bots or complete rules.

## Retained comparisons

The initial and final gallery pass captured 108 before images and 100 non-Deal
after images at both widths. The before images were captured before these family
edits while shared navigation work was also in progress; they are local visual
baselines, not a claim about a deployed revision. These representative phone
pairs retain the own-hand/board and opponent-density changes:

| Game     | Before                               | After                              |
| -------- | ------------------------------------ | ---------------------------------- |
| Uno      | [Before](uno-before-phone.webp)      | [After](uno-after-phone.webp)      |
| Rummy    | [Before](rummy-before-phone.webp)    | [After](rummy-after-phone.webp)    |
| Skyjo    | [Before](skyjo-before-phone.webp)    | [After](skyjo-after-phone.webp)    |
| Shithead | [Before](shithead-before-phone.webp) | [After](shithead-after-phone.webp) |

Legally reached advanced states, selected before capture:

- [Word Agents selected guess](word-agents-midgame-390.webp): ten players, guess phase; confirmation names the exact chosen word.
- [Sea Salt & Paper keep choice](sea-salt-paper-midgame-390.webp): four players; private cards and both discard destinations remain in the source workspace.
- [boop. graduation preview](boop-midgame-1440.webp): the focused legal group highlights its exact squares.
- [Azul placement](azul-midgame-1440.webp): the drafted tiles, remaining factories and highlighted legal pattern lines remain together.

SVG artwork sources were decoded before the advanced-state captures. Casino
split/insurance captures are retained with the wider midgame evidence. Task-owned
scratch captures and superseded failed runs are disposable once the final checks
and concise evidence are retained.
