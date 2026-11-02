# Browser verification

Routine `pnpm test:browser` checks independent sessions and responsive controls.

`deal-workspace.spec.ts` also checks the local-only `/design/deal` review harness.
Its twelve synthetic scenarios and paired outcomes come from real Deal engine
actions and authorized projections, with conservation/privacy assertions in
`scripts/export_deal_scenarios.py`. Only public views and visible test identifiers
are exported. `--check` participates in the contracts gate. The review page
cannot create rooms, mutate databases or appear in a production build.

The focused phone/desktop checks cover exact existing/new pile destinations,
same-color rearrangement, target resets, banking cancellation, forced swap
give/take labels, counter chains, exact/overpaid/insolvent payments, hidden hands,
named properties, rent, house-deck disclosure and paused controls. Submitted
callbacks are compared with engine-produced actions and known next projections.
This verifies the mounted decision UI; independent real-room HTTP/full-match
tests remain required for persistence, multiplayer and authorization proof.

Run with `pnpm exec playwright test tests/browser/deal-workspace.spec.ts tests/browser/stable-deal.spec.ts
--output=output/playwright/deal-workspace-results`; screenshots are retained in
`output/playwright/deal-workspace/` for visual review. Regenerate fixtures with
`backend/.venv/bin/python scripts/export_deal_scenarios.py` after producer changes.
Long acceptance and cloud checks are explicit opt-ins so normal verification does
not silently consume guest-signup quotas or AI calls. No test persists auth state.

`stable-deal.spec.ts` measures the public table, bank, action bar and hand before
and after selections, target changes, existing/new set choices, banking, payment
toggles, table peeking and public inspection. It checks focus restoration,
unbroken property words, full collection visibility in portalled inspection,
and public Take/Give previews at phone and desktop sizes. The doubled-rent fixture
plays a house, hotel and Double the Rent through the engine, then compares the
18M preview with the committed bill. Captures are in `output/playwright/stable-deal/`.

## Complete matches

```sh
GAMES_FULL_MATCHES=1 GAMES_TEST_AI=1 pnpm exec playwright test tests/browser/fullmatches.spec.ts --project desktop --project phone --output output/playwright/fullmatches
```

The catalogue supplies each game's minimum and maximum seats; an equal limit is
tested once. Ten independent browser contexts are reused, with authorized private
API projections supplying decisions. Matches finish through legal actions rather
than state injection. The browser checks rendered scores, refreshed results,
portrait width, clicked rematch, and the change-game sheet while preserving the
group. Rematches are started, then explicitly ended to move to the next game.
Rummy's browser scenario ends through legal drops; valid declarations and
sequence/scoring rules receive independent controlled-deal engine tests.

`GAMES_FULL_MATCH_GAME=deal,deal-no-mercy` restricts a debugging rerun. Omit the
filter for catalogue-wide acceptance. `GAMES_FULL_MATCH_SEATS=5` can further
restrict a focused retry to one supported seat limit. `GAMES_TEST_AI=1` enables one real Tarot
generation per browser project; without it, Tarot generation is explicitly
omitted. The saved real reading is rendered and reread after refresh. Failure
traces/screenshots are disabled because projections contain private cards.
Metadata-only per-case progress is written to ignored `.vercel/fullmatches-*.json`.

For cloud acceptance, set `GAMES_TEST_URL=https://games-seven-black.vercel.app`.
Do not run multiple cloud suites blindly: anonymous signups and application
actions are rate-limited. The driver paces moves within the production limit;
it does not bypass or weaken authorization, presence or rate limits.
Supabase's default anonymous-signup limiter uses a token bucket with capacity
thirty and a continuous refill of thirty per hour per IP, rather than a hard
rolling-hour reset. Consult the actual project configuration and the
[current Auth limits](https://supabase.com/docs/guides/auth/rate-limits) before
restarting cloud suites; a 429 remains a failure, never a cue to weaken limits.
The driver retries one allowlisted transient transport failure for a snapshot
GET or idempotent presence heartbeat. It records recovery counts and safe reason
codes, never original errors/headers. HTTP errors and other mutations are never
retried, so application/rule failures remain visible.

## Fifty-room hosted load

```sh
GAMES_TEST_URL=https://games-seven-black.vercel.app GAMES_LOAD_ROOMS=50 node scripts/check_hosted_load.mjs
```

This separate tool creates five real anonymous identities, each owning ten rooms
and observing ten others, staying within existing create/join/start limits.
It prepares fifty blackjack rooms, subscribes to fifty private Broadcast channels,
then commits fifty simultaneous bets. Metrics separate submission-to-commit,
Broadcast arrival, and authorized observer snapshot completion. Optional
`GAMES_LOAD_MODE=poll` measures explicit 250ms polling separately; it must not be
reported as Broadcast latency. Tokens, invite codes and card data remain in memory.

The tool preserves database history and closes only its own rooms through abandon
and leave endpoints, reporting cleanup counts. It disconnects its own Realtime
clients and writes only aggregate latency/status metadata to ignored `.vercel`.
It reads the exact personal Games publishable configuration from `.env.cloud.local`
and refuses other deployment origins. It never uses a database/service-role key.
