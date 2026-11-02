# Sea Salt & Paper table

The table consumes the authorized projection and server-enumerated actions.
Private drawn/discard choices use the shared HorizontalRail, with separate
Previous/Next buttons and focus scrolling. Selecting a card reveals its printed
rule before an explicit take/keep action. Clear selection changes only the local
draft; pending and paused states disable decisions.

Public played duos and revealed hands wrap inside each player's expanded
collection. Every projected card remains readable without a concealed horizontal
tail. Private hands retain their existing compact rail; no unrevealed opponent
cards are added to the collection.

`crowded-modern.spec.ts` exercises legal midgame and peak collection projections
at 320, 390, 768 and 1440 pixels. It checks expanded card bounds/overlap and a
six-card private discard choice through keyboard navigation, selection, clear,
pending/paused gating and the exact authoritative take action. These projection
checks do not themselves establish saved-room or every possible game-state proof.
