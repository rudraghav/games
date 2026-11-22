# Progress and rewards

`/rewards` shows a player their own progress and lets them redeem and wear the
cosmetics they have earned by playing. Nothing here is bought, nothing is
ranked against other people, and nothing expires.

## What the page shows

`RewardsScreen` reads `GET /v1/progress` with the passive client, so opening
the page never creates a guest. Three sections, each a labelled region:

- **Progress**: the level ring with "40 of 150 XP", the XP still needed and the
  total; the streak as it stands (current, best, and "Play today to keep it
  going" only while a streak exists and today has no game yet); four totals
  (games played, wins, different games, with friends).
- **Badges**: a grid. An earned badge is in colour with a check and the word
  "Earned". An unearned one is muted with a thin bar and "3 of 10".
- **Rewards**: coupons built on the shared `Ticket`, grouped as **Avatar
  frames** and **Card backs**. The stub previews the cosmetic itself (the frame
  on the player's own avatar, or a face-down card in that back).

Every name, description, requirement, count and state is the server's. The
client draws them and decides nothing. A badge id it has no picture for gets
the plain medal; a reward id it cannot draw previews as the plain default.

## Coupon states

| State               | Looks like                                                  | Control                                                               |
| ------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------- |
| `locked`            | muted ticket, "Locked", the requirement, a bar and "1 of 2" | none                                                                  |
| `available`         | plain ticket, "Ready to redeem", the requirement            | `Redeem <name>`                                                       |
| `redeemed`          | sage ticket, "Redeemed"                                     | `Use <name>`                                                          |
| `redeemed` and worn | sage ticket, "In use"                                       | `Take off: <name>` (frame) or `Use standard back: <name>` (card back) |

Redeem calls `POST /v1/rewards/{id}/redeem`. Use and the two "put it away"
buttons call `PUT /v1/profile/cosmetics` with **both** `frame` and `card_back`
every time (`wornCosmetics` reads the current pair from the rewards; `null`
takes one off). Each reply is the fresh progress and replaces the cached one;
after a wear change the player query is refreshed so rooms and the profile page
pick it up. All three requests carry `tz_offset` (minutes east of UTC), so the
streak follows the player's own midnight.

After a redeem the stub tears a little way off and settles back
(`data-just-redeemed`, 620ms). Under reduced motion there is no animation and
the state simply changes. A reserved `role="status"` line above the coupons
says what happened ("Gold frame redeemed. It’s yours to use.", "Now using the
gold frame.", "Frame taken off.", "Back to the standard card back."). A refusal
shows the server's own sentence in a `role="alert"` on that coupon and re-reads
progress.

Without a player (401) the page says "Play a game to get started" and links
home. A failed read offers "Try again".

## Files

- `Rewards.tsx`: the screen, the mutations and `RewardsView` (pure, for tests
  and stories).
- `RewardCoupon.tsx`: one coupon and its state wording.
- `BadgeGrid.tsx`: the badge grid and the icon for each known badge id.
- Shared with the lounge and the room: `@/shared/progress` (`levelProgress`,
  `levelLabel`, `streakLine`, `badgeCount`, `wornCosmetics`) and, in
  `@games/ui`, `LevelRing`, `Ticket`, `Avatar` frames and the card-back CSS.

## Checks

Unit: `apps/web/src/tests/home-progress-rewards.test.tsx`. Browser:
`tests/browser/home-progress-rewards.spec.ts` (mocked states on both devices,
and one real run that plays two games, redeems and wears the Gold frame and
shows it to a second guest).
