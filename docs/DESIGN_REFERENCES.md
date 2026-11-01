# Design references and reuse decisions

Reviewed 31 October 2026. Inspiration is separated from reusable assets.

## 1 November 2026 discovery and table review

Fresh phone/desktop captures of the current production lounge were inspected.
The warm palette, readable ranks and direct room actions remain useful. The
unfiltered fourteen-tile phone page required a long scroll, so GameLibrary now
adds query, group-size and category discovery with one announced result count.
The shared GameTile and ChoiceGroup primitives keep future additions consistent.
Checkers and Kalah/Mancala use the same authoritative room/result contract.

Fresh [Playdeal](https://playdeal.io/) capture confirms clear card values and a
direct guest entry. [PlayingCards.io](https://playingcards.io/) was reviewed for
room-first access and common-game discovery. [this Dribbble lobby concept](https://dribbble.com/shots/26321588-Online-Game-Lobby-Design)
was researched for ready-seat and table composition; its browser capture was
blank and was rejected as visual evidence. Board Game Arena's catalogue did not
render in the text browser, so no unobserved filter behavior is attributed to it.

The official [Kenney Board Game Pack](https://kenney.nl/assets/boardgame-pack)
lists CC0 and 490 files. It is a verified free optional asset source; no download,
relicensing or replacement of the Games-owned card system is necessary for this
release. Dribbble artwork remains inspiration only, never bundled as licensed art.

Table captures exposed hand/action overlap and phone action-discovery problems;
the owning table components address those directly. Current screenshots and
flow-specific findings are retained with this release's verification evidence.

## Visual references

### Modern/social expansion, 1 November 2026

Research checked the [Dribbble card dashboard listing](https://dribbble.com/shots/20197471-UI-Card-Game-Dashboard),
publisher game presentations and [BGA's current review](https://en.boardgamearena.com/news?id=1025).
The Dribbble text result exposed an announcement image rather than usable design
art; it is not treated as an inspected visual or a reusable asset. The existing
Playdeal/readable-card references and fresh Games screenshots guide implementation.
Modern posters now have numeric-card, ceramic-tile and party-prompt variants.
No extra UI kit or commercial illustration library is needed: existing MIT
primitives, semantic tokens and original graphics cover these new tables.

The built-in image-generation skill created four original minor-arcana atlases,
using the Games-owned major sheet as a style reference. All 56 scenes were
inspected; exact rectangle metadata accounts for different source row heights.
The original PNG masters remain, with WebP delivery derivatives. The prompt set
and asset provenance live in `apps/web/public/tarot/ART_PROMPTS.md`; no published
tarot or pop-character artwork is bundled. Fictional characters appear only as
textual reading analogies.

- https://playdeal.io/ — clear card faces, restrained property-game hierarchy.
- https://apps.apple.com/us/app/zynga-poker-texas-holdem/id354902315 — seated table composition and distinct betting controls (published gameplay screenshots inspected).
- https://dribbble.com/shots/27205355-Card-Game-App-UI — premium table/seat composition; visual inspiration, not an asset licence.
- https://dribbble.com/shots/27054602-Interactive-Card-Game-UI — strong action hierarchy and focused table framing.
- https://dribbble.com/shots/7696045-Tarot-App-Design — colourful Tarot direction and card-led exploration.
- https://dribbble.com/shots/25947541-Tarot-Mobile-iOS-App — progressive card/detail reveal. Its illustrations have separate licences; they are not bundled here.

## Reusable foundations

- Radix Primitives (MIT): https://www.radix-ui.com/primitives/docs/overview/introduction — accessible dialogs, focus management and composable behaviour. Adopted.
- shadcn/ui (MIT source): https://ui.shadcn.com/docs — source-owned component/variant patterns; use compatible patterns in the single Games UI layer.
- Kenney: https://kenney.nl/support confirms CC0 for its asset pages. Playing Cards Pack is a candidate for optional themes; its pixel style is not the main lounge deck.
- Lucide, Motion, Tailwind: installed packages retain their respective licence files in the dependency graph; use their primitives, not another application shell.

Figma and Canva connectors are available for later editable design handoff. No
personal designs were searched to obtain generic public inspiration. Community
files require checking the creator's specific licence before importing assets.

## Applied interaction principles

- Stable action location, readable card faces and clear active-seat treatment.
- One primary decision at a time; reveal deeper rules/details through a sheet.
- Tap/keyboard alternatives to dragging; internal hand scrolling on phones.
- Public table information and private hand information have separate components.
- Shared variants own card/seat/action appearance; game modules own composition.
- Tarot is an original modern pop-art deck, with cinematic reveal and a quiet,
  readable result layout. Reading metaphors connect to actual card meanings.
