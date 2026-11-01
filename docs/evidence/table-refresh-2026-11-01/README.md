# All-game table refresh — 1 November 2026

The audit begins with actual rendered screenshots of local `/design` projections.
The 52 synthetic scenarios cover minimum and maximum seats/hands for all 26
experiences. They contain no real room, guest or account data. The development
gallery controls add about 270px above each table and are not production headers.

Before changes, 104 full-page images were captured at 390×844 and 1440×1000.
Every maximum phone image was opened and inspected; the nine-seat desktop poker
image was also inspected. The capture found no horizontal page overflow, but that
alone missed clipped internal boards, overlapping Skyjo cards and tall empty
panels. The fixes below address those visible defects rather than treating a
page-width check as a complete design audit.

## Game matrix

Each row corresponds to two fixtures and both viewports. Shared changes apply to
both editions where appropriate; engine actions and scoring remain server owned.

| Game | Observed issue / retained behavior | Implemented presentation change |
|---|---|---|
| Uno | Tall empty felt before a 42-card hand; small symbols crowd action text | Compact piles beside the hand on desktop; smaller phone pile area; shared readable shedding-card interiors |
| Uno No Mercy | Action glyphs and long labels collide in compact cards | Shared action glyph/label treatment; full hand retains its own scroller |
| Monopoly Deal | Five repeated empty bank/property panels; cramped property card labels | One seat row for empty opponents, complete actual collections retained; shared property-card art and readable names |
| Deal No Mercy | Same collection waste, with longer edition-specific action names | Reuses the property layout/card variants; house-deck labeling remains unchanged |
| Texas Hold’em | Private cards duplicated at the seat; crowded ellipse collisions | One private decision workspace first; spaced crowded ring and container-based grid fallback |
| Rummy | Large pile area pushes hand sorting and moves below the fold | Compact piles, hand tools and grouped hand; standard card art; keyboard grouping and rank order retained |
| Teen Patti | Empty felt consumes the first phone viewport before betting | Betting and permitted private cards precede the table; blind hands remain hidden |
| Blackjack | Fake undealt backs; split hands flattened into one display | Empty seats show no invented cards; each projected split hand keeps its wager and active state |
| Skyjo | Mobile compact-card overrides make cards overlap inside opponent columns | Shared mobile card cascade repaired; actual four-column card collision checks added |
| Pop Tarot | Large intro and empty spread delay the actual card picker | Short heading; card picker first while choosing; mini spread below; all 78 illustrations retained |
| Four in a Row | Full board already functional; generic display-only pieces | Compact board frame, original wood material and piece treatment; real column controls retained |
| Reversi | Eighth column clipped inside the phone board scroller | Eight 44px columns fit a 390px phone; full board stays visible; legal-square indicators retained |
| Word Agents | Large decorative waiting headline; clue/role information matters | Direct waiting copy and compact clue spacing; private spymaster key remains private |
| Gem Market | Placeholder diamonds/crowns; tall patron/opponent sections | 16 original district/patron illustrations, own discounts, expandable secondary collections and reserve controls |
| Checkers | Full board functional; excess phone panel/grid spacing | Eight 44px columns fit; original material/pieces; source/destination and king crowns retained |
| Mancala | Numeric pits lack visible pieces | Original material and shared piece treatment; seed counts and legal pits remain real controls |
| Flip 7 | Ten tall player panels with one small card each | Compact phone run/score rows; all public cards remain visible in their row |
| Trio | Empty reveal panel wastes 150px; six tall hand-end panels | Empty reveal state shrinks; compact hand-end rows and stable memory slots |
| Azul | Factories and all expanded opponents precede the own board | Six patterned ceramic illustrations, horizontal phone factory rail, own board open, opponents expandable |
| Spill or Chill | Decorative title/icon and repeated instruction copy delay choices | Compact question card, direct choices, original cloth surface; pass/private choices retained |
| Most Likely | Long header/spotlight stack before the vote grid | Compact prompt and grouped 44px votes; hidden choices remain hidden |
| Hot Seat | Duplicate instructions and oversized decorative prompt | Compact prompt/choice rows; chooser and guesser semantics retained |
| The Gang | Empty preflop board slots consume space before pocket cards | Empty preflop placeholder hidden; compact headings/private hand; chips retain explicit rank labels |
| 6 nimmt! | Four oversized row panels; ten-card hand wraps into three rows | Two-column rows, scrolling phone hand, readable three-digit ranks and penalties |
| Sea Salt & Paper | Large poetic heading above precise draw/keep choices | Direct decision labels, compact layout; all original 14 ocean illustrations retained |
| boop. | Decorative heading delays the playable bed | Compact piece controls and board; original kitten/cat artwork and keyboard moves retained |

## Inspected after evidence

All 26 maximum phone and all 26 maximum desktop images were opened and visually
reviewed. Changed frames were reopened after the final CSS corrections. Minimum
scenarios were captured and geometry checked; they were not all individually
reviewed as images. `checks.json` preserves all 104 before and 104 final after
measurements. The disposable raw capture set was removed after retaining the complete metrics
and the following 15 concise original screenshots.

- No Mercy action symbols: [before](before-uno-mercy-phone.png) · [after](after-uno-mercy-phone.png).
- Skyjo grid spacing: [before](before-skyjo-phone.png) · [after](after-skyjo-phone.png).
- Gem artwork/collections: [before](before-gems-phone.png) · [after phone](after-gems-phone.png) · [after desktop](after-gems-desktop.png).
- Azul pieces and compact boards: [before](before-azul-phone.png) · [after](after-azul-phone.png).
- Nine-seat poker: [before desktop](before-holdem-desktop.png) · [after desktop](after-holdem-desktop.png) · [after phone](after-holdem-phone.png).
- Complete phone board and real pieces: [Reversi](after-reversi-phone.png) · [Mancala](after-mancala-phone.png).
- Tarot picking before the spread: [after](after-tarot-phone.png).

The original captures include the local gallery header. With that unchanged,
maximum phone document height falls from 2,821px to 1,211px for Azul, 2,738px to
1,979px for Gem Market, 1,950px to 1,429px for Deal and 1,580px to 1,063px for
6 nimmt. The final 104 captures have zero page overflow. These measurements are
repeatable fixture evidence; actual rooms use the compact production room shell.

The final review also corrected an atlas issue invisible to text geometry:
meet-aligned rectangular viewports exposed neighboring source cells. An explicit
SVG clip now isolates the selected rectangle while keeping its whole illustration.
Mancala's exact counts remain readable above bounded piece artwork, and phone
Reversi preserves visible grid lines after removing the excess gaps.

## Verification scope

The new density test checks every projection for page width, painted card text
bounds, enabled 44px controls, reachable private decision workspaces, Skyjo grid
card collisions and complete classic board visibility at 390px or wider. A second
case tests crowded casino seats at 1120px and 740px available canvas widths.
Existing usability checks cover keyboard hand selection/grouping, sorting,
pending/disconnected disabling and reduced motion. Static units cover single
rendered poker hands, split-hand wagers/active state/dealer hiding, all district
and ceramic atlas cells and explicit bot labels.

These checks establish responsive presentation and targeted saved interaction
behavior. They do not replace full-engine rule acceptance, all-nine-seat live
matches, screen-reader testing or a production release smoke test. Production,
commit and release proof are recorded separately by the release owner.


## Local results

- `vitest` focused table/modern/co-op-number/Sea Salt/boop modules: 19 tests pass. A separate fresh 52-scenario tab reports no uncaught page errors.
- `table-density.spec.ts` and `table-usability.spec.ts`: 8 cases pass across both
  viewports, including all 52 projections per width and 1120/740px casino canvases.
- Existing `modern.spec.ts` and `sea-cats.spec.ts`: 8 cases pass across both
  viewports, including independent players making saved moves, refreshing,
  private draw choices and mouse/keyboard board interactions.
- Focused game-table/story/test lint, web TypeScript and browser TypeScript pass.
- No engine rules, schema migration, production data, API key or account setting
  is changed by this table pass. Source is local; push/deployment and final natural
  bot-match release proof belong to the parent release verification.


Cleanup closed the exact isolated `tables-20261101` browser session and removed
only four obsolete task-owned debug PNGs after retaining the final captures.
Requested web/API services, artwork masters, dependencies, credentials, database
state and other browser sessions remain. The parent authorized removing raw matrices after the selected originals and
complete metrics were retained. No production mutation or commit was made here.
Actual room captures are in compact-live evidence; exhaustive 245-face coverage
is in card-inventory evidence.
