# Table usability audit — 1 November 2026

Captured the actual local `/design` gallery at 1440×1000 and 390×844 using
synthetic, server-projected min/max player fixtures. The ten before/after images
below were opened and visually inspected. All sixteen sampled min/max layout
checks fit the page width; compact metadata is in `checks.json`.

1. **Monopoly Deal, five players, phone — improved.** Hand and card decisions
   previously followed every opponent's empty collection. They now precede the
   collection grid. Empty collections take less space, and inactive assets do
   not add misleading buttons. [Before](before-deal-phone.png) ·
   [After](after-deal-phone.png).
2. **Skyjo, eight players, phone — improved.** Opening turns previously said
   “Waiting for the next move” despite twelve playable grid cards. Reveal/swap
   instructions now appear above the grids; the player's grid stays first on
   phones. [Before](before-skyjo-phone.png) · [After](after-skyjo-phone.png).
3. **Hold'em, nine players, desktop — improved.** The sticky action panel
   obscured the private hand in the captured viewport. Decisions now follow the
   hand without an overlay. [Before](before-holdem-desktop.png) ·
   [After](after-holdem-desktop.png).
4. **Hold'em, nine players, phone — improved.** Felt, private hand and decisions
   now come before the seat grid, reducing the scroll needed to find them. All
   seats remain available below. [Before](before-holdem-phone.png) ·
   [After](after-holdem-phone.png).
5. **Rummy, six players, phone — healthy with a sorting fix.** The hand stays in
   its own horizontal scroller. Rank sorting now orders 10/J/Q/K/A correctly;
   keyboard selection and moving a card between groups retain its identity.
   Zero scores were removed from seat captions when they added no decision.
   [Before](before-rummy-phone.png) · [After](after-rummy-phone.png).

`table-usability.spec.ts` passed four phone/desktop checks for keyboard selection,
card grouping, rank order, unblocked hands, direct-grid instruction, retained full
name tooltips, pending/disconnected action disabling and reduced-motion mode.
Amount controls are reset when their server-provided bounds change and cannot
submit invalid numbers. This is focused usability evidence; screenshots do not
establish complete accessibility compliance or replace independent full matches.
