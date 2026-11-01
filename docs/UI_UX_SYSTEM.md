# Games design system

Warm ivory lounge; dark ink, muted sage and terracotta accents. Cards are original
vector/typographic compositions with large readable symbols. Casino tables use
deep pine felt, warm rails, clear seat positions, pots and compact action controls.
Property games show banks and property collections; rummy supports hand groups;
Skyjo uses a 3×4 grid. Never shrink a full desktop table into an unreadable phone.

One token source in `@games/ui`: colours, type scale, spacing, radii, borders,
shadows and motion. One shared primitive layer, typed variants, accessible
Radix dialogs/sheets, Lucide icons, reduced-motion-aware Motion animations.

Game layouts compose shared cards, hands, piles, seats, chips, action controls,
chat and rule sheets. Features own composition, packages own vocabulary. Use
minimum 44px hit areas, visible focus, labels for icon controls, rank/action
symbols alongside colours, keyboard selection, and click alternatives to dragging.

Reference research: https://playdeal.io/ and Zynga's official App Store gameplay
screenshots. Reuse interaction ideas, create Games-owned artwork and components.

Storybook covers primitive variants, table layouts, crowded/maximum hands,
pending/disconnected states and narrow viewports.
