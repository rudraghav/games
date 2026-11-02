# Independent Tarot, astrology and multiplayer architecture review

Reviewed 2 November 2026 against local `main` `4233d6c9da9269de1bf19165c8ba38afa869c15b`. This is a review artifact only. No application source, configuration, deployment, credentials, real user record or provider setting was changed by this reviewer. No new Gemini request was made. Root-owned verification results and current browser captures are reported separately in the main audit.

## Verdict

The optional chart is a real deterministic calculation layer with useful privacy and recovery boundaries, not a picture generated from a prompt. The Tarot deck is complete and coherent, and the active cast now depicts the fictional characters themselves. Preserve those decisions. The highest-value changes found here are a shared stale-response fix, restoration of the saved question on retry, and selective correction of numbered minor-card artwork. The remaining numerical, reading-quality and rights questions should be tracked as bounded evidence gaps, not disguised as game-engine defects.

Evidence labels used below: **current source** means read at the revision above; **fresh probe** means executed in this audit; **fresh asset inspection** means current bundled files were individually inspected; **historical** means a user-supplied prior evidence artifact. Synthetic repository or query probes are not live browser or production evidence.

## Confirmed findings and implementation tickets

### TA-01 — Older room GETs can replace a newer committed snapshot (P2, shared behavior defect)

- **Game/state:** Any live room with an outstanding room GET when an action, heartbeat or bot response commits a newer revision.
- **Observed issue:** The mutation/heartbeat paths reject older revisions, but the ordinary `useQuery` success path accepts them. A fresh probe using the installed React Query dependency set revision 10, began a delayed GET, applied revision 12 using the hook's guarded `setQueryData` pattern, then resolved the GET at revision 11. The cache ended at 11.
- **Evidence:** `apps/web/src/features/room/useRoom.ts:12`–19, 24–30, 70–79, 90–97; `tarot-review/probe-results.json`. This reproduces the ingestion race; it does not claim a specific user's room suffered it.
- **Player impact:** A hand, legal choice, current actor or result can temporarily move backwards. The server still rejects stale actions, so this is not lost server state. It can also interfere with selection and animation continuity.
- **Root cause:** Revision ordering is applied at some cache writers rather than at every snapshot ingress.
- **Proposed change:** Keep the existing hook/API-client architecture. Use one room snapshot acceptance function for normal queries, heartbeat, mutation and bot responses; cancel/co-ordinate outstanding room queries when needed. Preserve equal-revision presence updates and room/match changes. Avoid merely adding another periodic refetch.
- **Owner:** `useRoom.ts`, shared room-query utilities and focused query tests; no engine migration.
- **Acceptance:** Delay GET revision 11 until after a revision-12 action response; the rendered state stays at 12. Repeat for bot drive and a rematch. Equal-revision connection changes still appear. The next valid action succeeds once; reconnect does not replay a prior casino cue.

### TA-02 — Failed-reading refresh restores the chart but loses the saved question (P2, recovery defect)

- **Game/state:** Tarot, three cards selected, nonempty question submitted, provider failure or interrupted generation, then page refresh and retry.
- **Observed issue:** `RoomService.reading` returns the saved question, but the frontend always starts `question` at `''` and never adopts `saved.data.question`. Its retry submits this empty value. A failed computed chart does recover automatically, making the lost question easy to miss.
- **Evidence:** `apps/web/src/games/tarot/TarotTable.tsx:15`, 23–33, 124–132; `backend/app/rooms/service.py:508`–524, 557. Current recovery browser fixture at `tests/browser/tarot-astrology.spec.ts:376` onward uses an empty question, so it does not cover this case. Source-confirmed; root browser reproduction is separate.
- **Player impact:** The next reading can silently lose the user's intended context even though the app says the spread/chart is saved.
- **Root cause:** Saved server draft and local question draft have no hydration/dirty-state contract.
- **Proposed change:** Adopt the saved question once for the current room/match before the user edits; preserve deliberate local changes and explicit clearing. Keep birth inputs ephemeral. Never rehydrate one match's question into another match.
- **Owner:** `TarotTable.tsx`, Tarot browser recovery coverage.
- **Acceptance:** Save a synthetic nonempty question, fail the provider, refresh, and retry both with and without saved astrology. The original question remains visible and is sent exactly once. Editing/clearing it is respected; rematch starts blank; no private question enters local storage, public activity or logs.

### TA-03 — Several numbered minor illustrations disagree with their rank (P2, visual/symbolism quality)

- **Game/state:** Tarot deck explorer and revealed cards.
- **Observed issue:** All 78 scenes exist, but some source art does not encode the named rank. Clear examples in the full source cells: Two of Cups has the two shared cups plus an extra cup on the table; Six of Cups has one exchanged flower cup plus four foreground cups; Eight of Cups has five visible cups; Eight of Pentacles has one worked coin plus six bench coins; Nine of Pentacles has one prominent coin. Some `slice` crops remove still more of the lower symbolism.
- **Evidence:** Current `apps/web/public/tarot/minor-cups-v1.png` and `minor-pentacles-v1.png`; mappings at `packages/ui/src/lib/tarot-artwork.ts:52`–81; five fresh analytical contact sheets and individual records in `tarot-review/art-inventory.json`. These sheets show registered source crops, not browser screenshots; the exact in-app crop also depends on its name/frame allocation.
- **Player impact:** Artwork remains attractive but teaches an inconsistent visual vocabulary and is weaker as an inspectable Tarot deck. This does not affect random draws, identity or scoring.
- **Root cause:** The existing asset tests prove presence, bounds and unique cells; they cannot count or interpret the pictured objects. Atlas composition and a single framing policy also compete with symbolic details.
- **Proposed change:** Retain the deck palette, characters, editable names and existing atlas/asset registry. Revise only the affected cells or add reviewed derivative assets/focal boxes. Do not regenerate the whole deck. Treat rank-count and essential narrative-symbol review as human art acceptance.
- **Owner:** Original art source/derivatives, `tarot-artwork.ts`, per-card visual acceptance inventory.
- **Acceptance:** Every targeted card has the intended count/motif visible in source and at 320/390/1440 layouts; names remain legible, faces/crowns survive cropping, adjacent atlas cells never bleed, all 78 identities remain unique. Check the actual browser frame, not only the source sheet.

### TA-04 — Pre-1970 timezone accuracy has no explicit uncertainty boundary (P2, evidence/labeling gap)

- **Game/state:** Astrology with dates from 1900 through 1969.
- **Observed issue:** The app accepts dates from 1900 and correctly uses pinned historical IANA transitions, but neither its precision note nor form distinguishes those computations from independently verified locality-specific civil-time history. IANA explicitly says the database does not suffice for accurate handling of all past times everywhere, particularly before 1970.
- **Evidence:** `backend/app/astrology/models.py:19`–27 and 118–122; `timezones.py:12`–48; `AstrologyForm.tsx:165` onward; [IANA scope and accuracy](https://data.iana.org/time-zones/tzdb/theory.html). No particular user's chart was shown to be wrong.
- **Player impact:** A calculated time can appear more certain than the historical birthplace mapping warrants; angle/house changes can be much larger than the ephemeris precision.
- **Root cause:** Ephemeris numerical precision and civil-time provenance are currently summarized together.
- **Proposed change:** Keep pinned IANA resolution and explicit gap/fold handling. Surface a concise pre-1970 uncertainty note and the selected convention/UTC offset in the transient preview, without persisting raw birth fields. Define which historic locations/dates have separately checked references before making stronger accuracy claims.
- **Acceptance:** A pre-1970 synthetic case receives the limitation; a modern case does not gain unnecessary warnings. DST gap/fold cases retain exact current behavior. Any newly supported historical exception has an independent civil-time reference and an explicit fixture.

### TA-05 — Character-image attribution is complete enough to inspect, but is not permission evidence (P2, release/provenance decision)

- **Game/state:** Tarot character panels.
- **Observed issue:** The current 48-image registry contains 44 `copyright-reference`, 3 `public-domain` and 1 `licensed` records. The ledger is honest that the 44 references are not an open asset kit. This audit found source links and rights notes, not documented permission grants for those 44 assets.
- **Evidence:** `apps/web/public/characters/character-art-v2/manifest.json`, its README, generated character registry; fresh integrity receipt `tarot-review/asset-review.json`; displayed credit implementation `TarotReading.tsx:93`–119. This is not a legal conclusion that the current use is unlawful.
- **Player/product impact:** Reuse or broader distribution cannot be assumed to inherit an open license merely because Wikipedia or a publisher hosts an image.
- **Root cause:** Provenance categorization and approved usage rights are different checks.
- **Proposed change:** Preserve the archive and honest credit labels. Record the approved usage basis or obtain suitable cleared assets for any distribution requiring them; keep unknown historical characters text-only. Do not change a rights field to `licensed` without evidence.
- **Acceptance:** Each active asset has a reviewed usage basis, correct identity/source/credit and any required license terms; generated registry and local bytes still match; no performer/cosplay substitute appears as a character.

### TA-06 — Waiting-member casino cues have inconsistent documentation (P3, product boundary decision)

- **Game/state:** A late member waits outside an active Hold'em/Teen Patti/Blackjack match.
- **Observed issue:** The actual `room_view` correctly returns `game=null` and `activity=[]` to a waiting nonparticipant, but still includes the current `last_action` actor/type/amount. A fresh in-memory probe confirmed it. `APP_FLOW.md` says waiting arrivals do not receive match details, while `BACKEND_STRUCTURE.md` deliberately describes the narrow casino cue as member-visible.
- **Evidence:** `backend/app/rooms/views.py:27`–49 and 93; `public_actions.py`; `tarot-review/probe-results.json`.
- **Impact:** An unclear visibility promise. This cue contains public betting metadata only, not concealed cards, deck order or private decisions. Do not report it as a hidden-hand leak.
- **Proposed change:** Decide and document one rule. If all match data is participant-only, gate the cue and bot-match metadata at the same projection boundary. If the limited cue is intentionally member-visible, narrow the app-flow wording and test that exact allowlist.
- **Acceptance:** A late joiner, participant and outsider each receive precisely their documented fields; all concealed data remains absent.

## Tarot complete-decision coverage

| Area | Current contract / observed implementation | Review status and gaps |
| --- | --- | --- |
| Identity and edition | Registry `tarot`, rules version `1`, one player, 78 upright cards, no house-rule toggles, solo/no score order, no bot. | Current manifest/engine inspected. Upright-only is intentional, not a missing standard-rule bug. |
| Deck/components | 22 major plus four suits of 14; all 78 IDs, meanings and atlas cells present. Original ImageGen provenance documented; canonical explorer is independent of shuffle. | All 78 current illustrations individually inspected; see per-ID JSON. No blank or duplicate registered cell found; selected count/symbol issues above. |
| Choosing | Three successive face-down position choices; irreversible committed picks; selected face is revealed only to participant. | Current engine/action validation inspected. No unrevealed deck order or identities appear in projection. Actual long-rail keyboard/touch browser acceptance belongs to root. |
| Ready for reading | Optional 400-character question; provider availability/tier notice must load before submission; astrology defaults off. | Current source inspected. No invented fallback. Saved-question recovery defect above. |
| Generation | One saved lease and transactional attempt budget; release DB lock before provider call; exact three-card order required; ASTRO adds one combined call. | Current source and existing tests inspected; root reruns test groups. No new real-provider call in this subreview. |
| Failure/retry | Saved spread survives; GET recovers committed result; failed chart can be reused without raw birth fields or new geocoder lookup; explicit opt-out clears draft on next submission. | Real persistence tests exist. Current recovery test uses blank question and misses TA-02. |
| Finished | Grounded/quirky/1–2 character connections per card, exact saved chart and interpretations; room finished, shared rematch/change-game. | Current presentation/result code inspected. Prior saved hosted matches are historical evidence; no new hosted mutation here. |
| Private/public | Sole participant receives reading; room activity cannot contain question/reading/birth details; public deck browser reveals canonical artwork only. | Service and projection source reviewed; existing canary tests inspected. No concealed-data defect found in reviewed paths. |
| Unchecked | Screen reader end-to-end, 200–400% zoom, real slow-provider outage, cross-tab account switch, full 78-card human semantic rating, large fresh repeated reading evaluation. | Explicit remaining work; source and screenshots are not exhaustive proof. |

## All 78 illustrations: review record

`tarot-review/art-inventory.json` records each individual ID, source rectangle, source hash and fresh review note. The five analytical sheets were opened and visually reviewed in this audit. The art itself is unchanged.

| Family | Individually reviewed cards | Result |
| --- | --- | --- |
| Major (22) | Fool, Magician, High Priestess, Empress, Emperor, Hierophant, Lovers, Chariot, Strength, Hermit, Wheel of Fortune, Justice, Hanged Man, Death, Temperance, Devil, Tower, Star, Moon, Sun, Judgement, World | Complete, distinct recognizable archetypes. Cliff/dog, tools, book/moon, abundance, throne, teaching, relationship, chariot, lion, lantern, wheel, scales, suspension, transition, pouring, chains, lightning, water/stars, night path, horse/sun, trumpet and completion motifs are visible. |
| Wands (14) | Ace through Ten, Page, Knight, Queen, King | Complete and visually coherent; energetic staff scenes, defensive posture and load-bearing Ten distinguish ranks. Current top-aligned Queen/King crops keep heads/crowns. No broad redraw warranted. |
| Cups (14) | Ace through Ten, Page, Knight, Queen, King | Complete and emotionally distinct; number/motif correction needed for Two/Six/Eight. Lower cups can be lost further in cropped frames. Courts retain identifiable cups and faces. |
| Swords (14) | Ace through Ten, Page, Knight, Queen, King | Complete; heart/pause/conflict/journey/sneaking/binding/anxiety/endings and court poses recognizable. Source inventory checks do not establish exact depicted sword counts for every scene; retain a focused human count check before claiming numerical fidelity. |
| Pentacles (14) | Ace through Ten, Page, Knight, Queen, King | Complete; work, scarcity, exchange, patience, skill and family scenes distinct. Eight/Nine need stronger rank encoding. Nine/Queen share a similar seated abundance composition but are not the same source cell. |

The fresh 48-character sheet shows actual animated/game characters and in-character stills/illustrations. It does not show the old performer/cosplay archive. Current local image bytes, dimensions and hashes match all 48 generated entries. Mixed source illustration/still styles remain visible; the common 4:5 frame makes them usable without pretending they are one illustrated deck.

## Reading quality: content, not only schemas

Read in full: `docs/evidence/game-info-2026-11-02/tarot-ordinary-evaluation.json` and `astrology-grounded-evaluation.json`. Both are explicitly synthetic nonpersonal scenarios from the prior real-provider evaluation, not fresh requests or a sample of private player readings.

- The grounded Fool/Ace of Wands/Strength reading is useful and tied to the supplied creative-hobby question. It distinguishes beginning, spark and patient persistence, then gives a small next action.
- The quirky paragraphs are meaningfully different images from the grounded prose (diving board/paintbrush, electric squirrel, patient toaster or lion-herding librarian). Some humor is arbitrary prop decoration rather than a new interpretive insight. Treat this as an editorial opportunity, not a schema failure.
- Ted Lasso's optimism/learning, Tony Stark's workshop experimentation and Hermione's determined effort are plausible parallels; no fabricated named scene was needed. Identity/source matching alone would not catch an inaccurate event or personality claim.
- Both ordinary and Both samples choose Ted/Tony/Hermione for the same spread. The source rotates allowed reference genres from the spread hash, so there is some designed variety across spreads, but no measured evidence here for long-term character diversity. Do not conclude every reading repeats.
- Western Sun/Mercury in Capricorn/house 10 and Vedic Sun/Mercury in Sagittarius/house 9 agree with that saved calculated chart. Quirky interpretations use corresponding work/learning images. The separate Tarot link is fairly generic but does not contradict supplied positions.
- The runtime regex checks named selected body/sign/house anchors; it cannot guarantee every free-text assertion, aspect description or character connection. Retain strict structural validation and add a small fixed human-reviewed evaluation matrix covering difficult majors, all four minor suits, one/two character choices and both chart systems. Score relevance, useful advice, non-repetition, character factuality and placement consistency separately. Avoid accumulating card-specific prompt patches.

## Astrology checks and limits

| Dimension | Current evidence / assessment |
| --- | --- |
| Consent/system | Off initially; Both/Western/Vedic explicit. Both defaults only after opting in. Source inspected. |
| Calculation ownership | Server uses Astronomy Engine 2.1.19, geocentric apparent ecliptic longitudes, whole-sign houses; AI supplies interpretation only. Keep. |
| Vedic convention | True Chitrapaksha via fixed-J2000 Spica anchor, mean Rahu/Ketu and geometric aspects are explicitly labeled; no Lahiri or classical drishti claim. Swiss documentation independently defines True Chitrapaksha's Spica-at-180 convention. Small proper-motion convention difference is documented. |
| Fresh independent numerical check | NASA/JPL Horizons Earth center `500@399`, observer quantity `31`: Sun/Moon/Mercury/Saturn/Pluto at 1900, 1950 and 2026 Jan 1 noon UTC. **15/15 within one arcminute; max error 0.128894 arcminute (~7.73 arcsec).** Results/parameters in `fresh-jpl-comparison.json`. First parallel attempt hit HTTP503; batched per-body follow-up succeeded, with no failed response counted as a pass. |
| Angles/nodes/whole-sign houses | Existing test constants compare J2000 ASC/MC/mean nodes/sidereal Sun/Moon with Swiss; physical-horizon tests cover both hemispheres. Source inspected; no fresh external Swiss installation or broad angle/station sweep in this subreview. |
| Civil time | Pinned tzdata, UTC round-trip gap/fold validation, explicit fold choices, half-hour fold and historical seconds cases. No arbitrary client coordinates/offsets. Pre-1970 limitation in TA-04. |
| Location | Canonical geocoder ID resolved again server-side; bounded query/results, six-second external timeout, 128KiB response limit and ten-minute/256-place cache. City text only sent externally, not birth date/time. Source inspected; existing live-geocoder browser run is historical. |
| Stale inputs | Incrementing request versions discard obsolete search/chart responses; changes clear previews and fold selection. Source inspected; root browser evidence separate. |
| Chart inspection | Exact dots plus separated labels, native planet/house selector, text placement/house/aspect tables; Vedic crowded house shows first three plus additional count, with full data accessible below. Preserve these alternatives. |
| Recovery/opt-out | Saved computed draft survives failed generation; explicit reuse avoids new lookup; opt-out sends ordinary reading. Nonempty question recovery still needs TA-02. |
| Raw data/storage/provider | Source persists computed chart only, not raw birth fields; Gemini context includes chart placements/conventions/aspects rather than date/time/place. `store:false`; exception-class/count logging. No hidden raw state in activity. |
| Provider privacy qualification | Google documents stateless Interactions requests with `store=false`, but separate unpaid-service terms allow improvement use/human review. The UI warns about free-tier processing. Actual key billing tier is an operational fact not independently proven by `TAROT_API_TIER`; verify it when configuring a release. No tier setting was changed. |
| Unchecked | All ephemeris bodies/dates, station retrograde boundaries, high-latitude near-degeneracy, cross-source historic locality offsets, numerical sign/house cusp cases, sustained provider quality/outage behavior and actual provider-side retention implementation. |

References consulted freshly: [NASA/JPL Horizons manual](https://ssd.jpl.nasa.gov/horizons/manual.html), [Swiss Ephemeris conventions](https://www.astro.com/swisseph/swisseph.htm), [IANA scope](https://data.iana.org/time-zones/tzdb/theory.html), [Google Interactions storage](https://ai.google.dev/gemini-api/docs/interactions-overview), [Google API data-use terms](https://ai.google.dev/gemini-api/terms). These support calculation/convention/privacy comparisons; they are not evidence that astrology predicts outcomes.

## Multiplayer, bots and architecture

The server structure is appropriate for this app and should be retained. `RoomService` owns auth and transactions; Repository owns SQL; engines implement pure setup/actions/projections; generated wire types and explicit registries connect the frontend. There is no reason here for a rewrite, new event store, bot framework or additional state-management package.

| Concern | Current implementation reviewed | Evidence scope / next proof |
| --- | --- | --- |
| Membership/roles | `_room` requires active human membership; host-only actions checked server-side; bot IDs are not UUID auth subjects. | Source + existing HTTP tests reviewed; root execution separate. |
| Duplicate/stale/simultaneous actions | Room row lock, expected match/version, receipt actor/fingerprint, atomic state/result/receipt/revision. Exact duplicate returns fresh authorized snapshot; competing move conflicts safely. | Preserve; client ingress race TA-01 is distinct from server transaction correctness. |
| Reconnect/presence | 45-second human lease, visible-tab heartbeats, private broadcast invalidation, 4-second polling fallback/15-second live polling, snapshot refetch on focus/reconnect; host claim after 90 seconds. | Intentional untimed turns preserved. New real network partition/background-device/server-process restart not executed by this reviewer. |
| Late arrival/revoked invite | Fixed participants, late member unseated/game absent, invite rotation changes code/hash/token; invalid/closed invite rejected. | Narrow casino cue discrepancy TA-06. |
| Rematch/game switch | New match ID and rotated starting order; ready reset; retained membership; pure game results mapped by manifest. | Current source reviewed; per-game natural completion and group lifecycle belongs to main audit. |
| Private responses | Backend middleware and same-origin successful responses set `private, no-store`; frontend API requests no-store; private state tables have RLS/revoked public access. | Review is source-based plus tests, not a fresh cloud-policy audit. |
| Realtime | Revision-only payload (`roomId`, `version`) in private member-scoped broadcast; clients fetch authorized projection. | Preserve; production channel permissions are changeable and require live verification to claim current cloud state. |
| Public history | Explicit allowlisted public descriptions, intersection of genuinely public zones, bounded last 80; no raw actions/private payload saved as activity. | Existing privacy canary/round tests are substantial; source review cannot prove every engine projection has no future leak. |
| Bot boundary | `next_bot_view` computes authorized seat view; `choose_action` receives only that view and own durable memory, not state/shuffle seed. Independent 128-bit seed; max16KiB memory; no provider/network call in policy. | Preserve. Engine projection correctness remains essential. |
| Bot pacing/restart | 800ms due schedule persisted; one versioned action per drive; concurrent drives no-op safely; due/memory survive process lifetime; one connected human drives progression. | Natural automation is deliberately paused when a human's presence expires. It is not an autonomous background server worker. |
| Bot competence | Family-specific bounded search/heuristics, blackjack basic strategy, Rummy disjoint meld coverage, memory for Trio/Flip7, fixed Word Agents lexicon, simulated party choices. | Useful casual opponents; not expert solvers or unrestricted language agents. Existing 104 min/max seeded completion cases test four scenarios per 26 games; each is bot-v-bot algorithm proof, not human usability proof. |
| Rummy limitation | 70 unsuccessful own turns may lead a bot to drop; a constructed genuine-declaration unit case exists. | Matches ending by drop must not be reported as declaration-victory evidence. Other reviewer owns natural declaration proof. |
| Source growth | Room service owns several domain orchestration flows but preserves layers and no engine I/O. | Improve identified boundaries surgically. Do not split modules solely for aesthetics without a concrete transaction/ownership problem. |

## Ordered acceptance work

1. Fix monotonic room cache ingestion (TA-01), with a delayed-response regression including bot drive and rematch.
2. Restore saved-question context on Tarot retry (TA-02), with a real saved synthetic question and no extra provider request.
3. Settle the waiting-member cue boundary (TA-06); one source-of-truth statement plus one projection test.
4. Correct selected Tarot art counts/crops (TA-03), retaining style and masters. Use per-card before/after browser approval at 320/390/1440.
5. Add historical-time precision disclosure/reference coverage and a small multi-epoch numerical suite based on independently stored reference values (TA-04).
6. Finish the active character usage-rights ledger (TA-05); do not infer permission from credit text.
7. Run a bounded, nonpersonal reading-quality matrix (ordinary, Western, Vedic, Both; difficult majors/minor suits), with separate semantic/variety scores and exact saved readback. Keep provider budgets/authorization and metadata-only logs.

## Checks and cleanup receipt

Fresh subreview work: read source/docs/tests; inspect five current Tarot source-cell contact sheets (all78) plus all48 current character assets; verify48 hashes/dimensions/byte counts against registry; reproduce two in-memory projection/cache probes; query NASA/JPL15 multi-epoch positions successfully after a recorded503 first attempt; read authoritative numerical/privacy documentation. Parent runs repository verification groups and browser checks; their results must not be inferred from this file.

The only added files are this review and compact `tarot-review` evidence (about2.4MiB at generation). Existing source masters/derivatives, production evidence, archived portraits, user data and active services were preserved. No server/browser/database was started or stopped by this reviewer, no QA room was created, no dependency installed and no Gemini call made. A failed initial Pillow import produced no output; existing Sharp produced the analytical contact sheets. No task-owned disposable runtime/cache needs removal.
