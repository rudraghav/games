# Games UI vocabulary

One Games-owned primitive layer and one semantic token system. `theme.css` owns
foundations; its table/Tarot style modules compose the same tokens. Components
provide typed size/family/selection/pending variants and accessible Radix dialogs.

Cards, hands, piles, seats, avatars, buttons, dialogs, wordmark and Tarot frames
belong here. Application services, game outcomes and API dependencies do not.
Face-down card names/colours stay hidden, and interactive cards use real buttons.
Motion respects the player's reduced-motion preference.

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
