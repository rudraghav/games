# Gem Market table

The table uses server-authored legal actions and purchase quotes. Players can
inspect resources and discounts, select a development or patron, and commit the
current buy/reserve action. Tier controls keep the market readable on phones;
public opponent resources and collections remain in expandable player sections.

Purchased developments and patrons wrap inside their public collection instead
of continuing into a clipped horizontal strip. Read-only collected cards retain
their existing dimensions and never become move controls. The shared stylesheet
owns this wrapping; private reservations and market tiers retain their layouts.

`crowded-modern.spec.ts` checks every expanded public card's bounds and overlap
at 320, 390, 768 and 1440 pixels, including naturally reached collection peaks.
This is legal-projection evidence, separate from saved multiplayer acceptance.
