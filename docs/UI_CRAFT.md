# UI craft for Games

The craft rules behind the lounge, the game pages and the tables, translated for a card and board games app
with its own artwork from `docs/UI_CRAFT_RULES.md` in the private `Shikha-Learning-Labs/shikha-website` repository (on the owner's Mac: `~/shikha-website/docs/UI_CRAFT_RULES.md`) (25 November 2026, 34 sources).
[UI_UX_SYSTEM.md](UI_UX_SYSTEM.md) and `packages/ui/src/styles/theme.css` decide values; where they disagree with this file, they win.

## This project's values

| What | Value today | Read from |
| --- | --- | --- |
| Typefaces | DM Sans (`--font-body`) for text; Fraunces serif (`--font-heading`) for display | `apps/web/src/app/layout.tsx`, `packages/ui/src/styles/theme.css` |
| Weights | Four in the interface: 400 body, 500 emphasis and Fraunces display headings, 600 controls and labels, 700 sans headings and `strong`. Card and board art keeps heavier print | `packages/ui/src/styles/theme.css`, `home.css` |
| Type sizes | Buttons 14px (sm 13px); home heading `clamp(26px, 3.2vw, 38px)`; body 12-15px, nothing in the interface under 12px; `.eyebrow` labels 13px in sentence case; card-art labels from 8px | `packages/ui/src/styles/theme.css`, `home.css`, `docs/UI_UX_SYSTEM.md` |
| Colour | Canvas `#F6F3ED`, surface `#FFFCF7`, ink `#272A25`, muted `#62665B`, line `#DDDCD2`; sage `#4D6550` primary, coral `#DB654D`, ochre, pine felt `#21493C`, plum `#69506D` (Tarot); focus `#AF7535` | `packages/ui/src/styles/theme.css` |
| Corners | `--radius-small` 8px, `--radius-control` 12px, `--radius-card` 20px, `--radius-panel` 28px; pills `999px` only, circles `50%`. Cards, tiles, pieces and boards keep their own corners | `packages/ui/src/styles/theme.css` |
| Lines | 1px `--color-border`; focus 3px solid, 4px offset | `packages/ui/src/styles/theme.css` |
| Shadows | `--shadow-soft` `0 12px 40px #2638220c`, `--shadow-card` `0 4px 12px #12291b26` (tinted green-ink) | `packages/ui/src/styles/theme.css` |
| Space | `--space-1` to `--space-7`: 4, 8, 12, 16, 24, 32, 48px. Rules written or edited since 25 November 2026 use them; older rules still hold raw pixels | `packages/ui/src/styles/theme.css` |
| Targets | Buttons 40 / 46 / 52px; icon buttons 44px; 44px wager and board targets | `packages/ui/src/styles/theme.css`, `docs/UI_UX_SYSTEM.md` |
| Icons | `lucide-react` only (64 imports), 16-18px | `packages/ui/src/components/Button.tsx`, `apps/web/src/**` |
| Motion | Controls 140-160ms; card motion 160-320ms on `--ease-out` `cubic-bezier(0.22, 1, 0.36, 1)`; `motion/react`; reduced motion handled per stylesheet | `packages/ui/src/styles/polish.css:13`, `card-motion.css` |

## Rules that apply here unchanged

- One token source in `@games/ui`. A value outside `theme.css` needs a reason.
- No pure black or white; the neutrals and shadows are warm and tinted, never black.
- One colour leads in a view: sage for the primary action, plum only on Tarot. Coral is a signal, not decoration.
- Text contrast at least 4.5:1; colour never carries meaning alone (ranks, suits and properties also say it in words or shape).
- Separate with space first, a ground change second, a line third. At most one shadowed surface in a section.
- No card around a tile; never cards inside cards; no coloured stripe without a meaning.
- Inner corner = outer corner minus the gap. No large corners on small things.
- Space inside a group is smaller than space between groups; a heading sits closer to its own content.
- Weight never changes on hover or selection. `tabular-nums` on chips, pots, scores, timers and counts.
- One primary (filled) button in the page body; secondary actions are visibly quieter.
- Every control has hover, pressed, focus-visible and disabled states; pending shows "Starting…" in words.
- Icon-only controls have an `aria-label`; 44px targets with 8px between them on phones.
- Animate `transform` and `opacity` only; never `transition: all`; nothing that answers a tap takes over 300ms.
- Reduced motion keeps the same outcome and receipt with the movement removed.
- Labels say what happens ("Start reading", "Play with bots", "Join a room"), in sentence case.

## Where this product differs, on purpose

- **Ivory, serif headings and terracotta.** The source lists this mix as a reflex look. Here it is the lounge's
  established brand ("warm ivory lounge"); keep it, with DM Sans for all reading text and coral used sparingly.
- **Game art is not chrome.** Card faces, felt, boards, pieces, tarot illustrations and their gradients, depth
  shadows and many simultaneous colours follow game readability, not these rules. Any-colour wilds may use a gradient.
- **Card-face text** may go below 12px (rank corners, rent ladders) only when the same card shows a large readable
  rank or action. Interface text outside the art keeps the 12px floor; inputs stay 16px.
- **Corners** 8 / 12 / 20 / 28px sit close to the source scale; chips and icon buttons are fully round.
- **Motion that explains an outcome** (deal, settle, turn-over, wheel and reel) may run longer than 300ms, never
  delays input, and shows the saved server result. Spinners and the pending wheel loop only while pending.
- **Hover lift.** Buttons rise 1px and covers lift slightly on hover; size and weight never change.
- **Sparkle icon** is allowed for Tarot readings and rewards, where it means magic or a prize, never "AI".
- **Not applicable (marketing only):** hero bands with two buttons, pill badges, scroll reveals and staggers,
  fact strips, testimonials, sourced-claim rows, 112-160px band spacing. The home page is a catalogue (games first).

## Fixed on 25 November 2026

- Interface text has a 12px floor: seat status lines, "Bot", "you", "Next", card counts, the "Last move" chip,
  dock lines, every `.eyebrow`, the room header's second line, the footer and room shortcuts were 10-11px.
- One filled button per view: the lobby (Ready, then Start once it can start), table docks (the first choice that
  commits; the rest secondary), Secret Santa setup (Draw names), the profile (Save profile).
- No tracked capitals in the interface: `.eyebrow` and 12 other label rules are plain sentence case; the eyebrows
  that only repeated their heading (Profile, Your progress) are gone.
- The lobby has no outer panel; `.santa-card` keeps its hairline and drops its shadow; the active seat is an edge
  on a tinted ground with no ring.
- A table says its instruction once: docks have no "Your turn" heading and drop a line that repeats the notice.
- For teams has no second row of filters (Group size and Time are removed).
- Corners, weights and space have short scales (see the table above); `b` and `strong` are 700, never the
  browser's 900.
- The radial white sheen over every game poster is removed.
- 44px targets: the profile's avatar colours (now 48px, 8px apart, the chosen one ticked), the footer link,
  the header's progress ring and the header's text links.
- A phone shows the badges two to a row, each with its progress bar.
- The shared `.button` already had a pressed state (`polish.css`); the earlier note here was out of date.

## Found while reading (not fixed)

- Mancala seed counts are 10px (`library.css:155`). They sit on the pits, which are board art, with no larger
  number beside them.
- Most stylesheets still use raw pixel spacing; only rules edited since 25 November 2026 use `--space-*`.
- A dock with no buttons (a waiting seat, Skyjo's opening reveal) still shows one line, and that line can repeat
  the notice above the table. Fixed-height docks also keep the room their heading used to fill.
- Deal's table centre still prints "Your turn" beside the play counter, under the notice that says the same.
- The rewards page and Secret Santa's links step have no filled button: every row offers the same action.
- On the roulette mat a chosen bet turns heavier (700). The mat is board art, but it is a weight change on selection.
- On phones the Uno dock sticks to the bottom of the screen with a hairline and an upward shadow together.
- Flip 7, Trio, Azul, Gem Market and the party tables draw bordered player cards and a bordered dock inside a
  bordered table panel. The panel stands in for the table, but it reads as cards inside a card.

## The check

Run in the browser at 320, 390, 768, 1024 and 1440 wide, on the home page, a game page and a live table.

1. Cover the wordmark. Is it this lounge: its art, its tables, its words?
2. Squint. One first thing and one filled button in the body; at a table, the legal move.
3. Any banner, card around a tile, decorative wash, tracked capitals or second set of filters?
4. Do gaps group things, with each heading closer to its own content?
5. Are corners, lines and shadows from the tokens, one shadowed surface per section, inner corners smaller?
6. Tab through it. Is focus always visible? Do controls show hover, pressed, disabled and pending states?
7. Turn on reduced motion. Same outcome and receipt, nothing moving?
8. At 320 wide: no sideways page scroll, 44px targets, readable ranks, nothing outside card art under 12px.
9. Are scores, pots, progress and rewards the server's real values, never a hidden card or the deck order?
10. Read the labels aloud as a player. Remove filler, rules jargon and banned words.
