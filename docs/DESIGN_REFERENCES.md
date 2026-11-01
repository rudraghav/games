# Design references and reuse decisions

Reviewed 31 October 2026. Inspiration is separated from reusable assets.

## Visual references

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
