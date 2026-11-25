# Games UI vocabulary

One Games-owned primitive layer and one semantic token system. `theme.css` owns
foundations; its table/Tarot style modules compose the same tokens. Components
provide typed size/family/selection/pending variants and accessible Radix dialogs.

Cards, hands, piles, seats, avatars, buttons, dialogs, wordmark and Tarot frames
belong here. Application services, game outcomes and API dependencies do not.
Face-down card names/colours stay hidden, and interactive cards use real buttons.
Motion respects the player's reduced-motion preference.

The interface around the art keeps to short scales (`docs/UI_CRAFT.md`):
corners `--radius-small` 8px, `--radius-control` 12px, `--radius-card` 20px,
`--radius-panel` 28px, pills `999px`; weights 400, 500, 600 and 700; space
`--space-1` to `--space-7` (4, 8, 12, 16, 24, 32, 48px) in new and edited
rules; no interface text under 12px. `.eyebrow` is a plain sentence-case label,
never tracked capitals. Card faces, boards, pieces and felt keep their own
corners, weights and small print.

WordTile provides unknown/red/blue/bystander/assassin and selected/revealed
variants. DevelopmentCard reuses the playing-card surface, with bonus/prestige
and readable costs. Its width/height use shared card dimension variables so
the generic phone hand size cannot clip development-card content. ResourceToken
supplies a labelled colour/count vocabulary for shared supplies, personal
collections, costs and discounts, in full and compact sizes. These components
accept presentation data only; rules and private-role decisions remain server-owned.

Read-only `MancalaPit` instances expose a named image, keeping the supplied owner,
store and seed-count label in the accessibility tree. Interactive pits remain
native buttons; decorative seeds do not create additional announcements or stops.

`styles/piece-depth.css` is the finish for boards, pieces, chips and tiles, in
CSS only: wells, rims, bevels and cast shadows, the state rings, and the short
moves that replay a public result (a falling disc, a flipping disc, a sliding
or captured checker, hopping seeds, a nudged boop piece, a sliding tile). Layout
stays in each game's sheet. Its rule for contrast: a piece is separated from its
board directly (3:1 or more) or by its own rim (3:1 or more against the piece
face); the measured pairs sit beside each board in the sheet. `MancalaPit` takes
`hop` (its place along the last sowing) and `tip`; `ResourceToken` prints its
gem name and count through `data-tip`.

`styles/card-faces.css` prints every card face except Deal (`deal-cards.css`), and
the shared card back. A colour is a set of four values (fill, print on the fill, the
hue as print on white, and the keyline against the white frame); add a colour by
adding the set, and measure it before use. `styles/card-motion.css` owns card motion
and pile depth: arrive, settle, turn-over and the stack under a pile. `PlayingCard`
marks a card `data-turn` only while a card it has just been handed turns face-up
(or back down), covering the face with the back for the first half; `CardPile` sets
`data-depth` from its count and remounts its top card so it settles; `PlayingCard`
and `PaperPlayingCard` take their tooltip through `tip` / `data-tip`.

Tarot masters remain intact. An optional image loader lets the app request compact
static WebP derivatives while Storybook can use the original PNG atlases.
Change tokens and shared variants to improve a family, then inspect the component
and maximum-size table stories before checking the affected room flow.
## Discovery and board additions

GameTile composes artwork, title, subtitle and seat/duration metadata, with a
typed house-edition variant whose label remains visible on phones. ChoiceGroup
provides labeled, keyboard-reachable pressed choices without navigation side
effects. MancalaPit shares numeric pit/store rendering, last-move emphasis and
disabled states between actual play and catalogue art. Components stay unaware
of game engines, API models and feature state. All variants are in Storybook.
