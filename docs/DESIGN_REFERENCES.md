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
tarot artwork is bundled. The later character-photo update adds licensed
performer portraits and two labeled cosplay photos, alongside written analogies;
the complete source and license ledger is in `apps/web/public/characters`.

## Dashboard, portraits and casino motion — 1 November 2026

The existing [Motion layout](https://motion.dev/docs/react-layout-animations)
and [reduced-motion](https://motion.dev/docs/react-use-reduced-motion) primitives
cover table transitions without another animation framework. Committed public
payments, permitted card reveals and viewer-relative seats drive the effects;
fresh snapshots and reconnects stay still. The shared media-query hook responds
to live reduced-motion preference changes. Real-engine playback and actual-room
checks supplement the inspected screenshots.

Named-character image batches produced no usable images. The implemented
alternative uses Wikimedia Commons files with item-specific CC licenses,
credits and source links, transformed into local WebP derivatives. Performer
captions distinguish voice/live-action roles from the two cosplay depictions.
No arbitrary web image is fetched during a reading. Asset hashes, dimensions
and provenance are checked against the curated reference cast.

- https://playdeal.io/ — clear card faces, restrained property-game hierarchy.
- https://apps.apple.com/us/app/zynga-poker-texas-holdem/id354902315 — seated table composition and distinct betting controls (published gameplay screenshots inspected).
- https://dribbble.com/shots/27205355-Card-Game-App-UI — premium table/seat composition; visual inspiration, not an asset licence.
- https://dribbble.com/shots/27054602-Interactive-Card-Game-UI — strong action hierarchy and focused table framing.
- https://dribbble.com/shots/7696045-Tarot-App-Design — colourful Tarot direction and card-led exploration.
- https://dribbble.com/shots/25947541-Tarot-Mobile-iOS-App — progressive card/detail reveal. Its illustrations have separate licences; they are not bundled here.

## Handling the Tarot deck

The overlapping backs and separate moment of choosing draw on the face-down
fan described by Tarot author Yoav Ben-Dov. The browser version lays the backs in
overlapped rows, reveals a card with one tap, preserves vertical page scroll and
raises the chosen card even when movement or vibration is unavailable. The back illustration is original.

- [Yoav Ben-Dov on shuffling and offering a face-down fan](https://cbdtarot.com/the-book/table-of-contents/shuffling-the-deck/)
- [W3C guidance on alternatives to dragging](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)
- [MDN on browser touch gestures](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action) and [vibration support](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate)

### Dimensional oracle table

Higgsfield’s Arc Left gallery shows how a small change in viewpoint separates a
subject from the background. The Tarot table applies that principle to the crystal,
its brass equator and the card in the player's hand. NVIDIA’s glass-rendering
examples informed the bright rim and internal reflections in the crystal. Both the
instrument and printed foil were created for this game with GPT Image.

- [Higgsfield Arc Left gallery](https://higgsfield.ai/motion/2a5d8f86-aef3-4b34-b5ee-fb2020daa131)
- [NVIDIA glass and transparent backgrounds](https://docs.omniverse.nvidia.com/materials-and-rendering/latest/rtx_post-processing.html#transparent-backgrounds-and-glass)

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

## Decision-information review — 2 November 2026

The owner's five Playdeal table/selection/payment screenshots and supplied
changelog are the primary interaction reference for this review. The useful
principles are stable public/own/action/hand zones, exact card/set targets,
amount and payment previews, clear blocked/response states, readable public
player progress, board access during a prompt, and rich details available by
both touch and keyboard. These are evaluated game by game rather than applying
Deal's arrangement to every board. The review does not adopt the reference's
turn clocks: Games deliberately has untimed turns and its own reconnect lease.

The current [Playdeal landing page](https://playdeal.io/) was rechecked; its
changelog URL was unavailable to the text browser, so the supplied changelog
remains the evidence for those specific changes. The published
[Zynga Poker listing](https://apps.apple.com/us/app/zynga-poker-texas-holdem/id354902315)
remains the casino composition reference. Current rendered findings, fixes,
per-game interaction inventories and verification limits are recorded in
`evidence/game-info-2026-11-02/README.md`.

## Home, progress and rewards — 23 November 2026

Four product pages were read for this change. Each gave one or two patterns;
no artwork, copy or layout was copied.

- **Kahoot! home and family pages.** Joining with a code is a first-class
  action on the home page, never buried: here, the code field beside Join a
  room and the same button one tap away on phones. Content is grouped by who
  it is for, which became the occasions (With friends, Two players, Solo, For
  teams): first as rails, then, once the owner found those repetitive, as the
  library's one row of chips.
- **Jackbox how-to-play and at-work pages.** Every game states its player
  range and length up front, so every card here shows both. Games are bundled
  into a few named, curated sets rather than one long list. Their at-work page
  is also where the pitfall came from: a "work-safe" label needs a real
  filter behind it, hence the documented allowlist and its exclusions.
- **Strava home.** Progress is measured against your own past, not ranked
  against friends: level, streak and totals here are the player's own, with no
  leaderboard. Streak wording stays encouraging and never punishes a gap.
- **Apple Wallet overview.** Passes are grouped by type and each shows its
  state clearly: rewards are grouped as Avatar frames and Card backs, each
  coupon reads Locked, Ready to redeem, Redeemed or In use. The ticket shape
  (stub, tear line, notches) is the common visual language for "yours to use".

Decisions that came from the owner rather than a reference: cosmetics are
earned by playing and never bought, and there is no money or outside offer.
Pitfalls deliberately avoided: promotional clutter above the main action,
streak mechanics that punish, and urgency copy ("claim now", countdowns).

Several other product pages could not be read and are not cited.
