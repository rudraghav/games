# Private saved Tarot readings

The thin `/games/tarot/readings/[matchId]` route renders `SavedReadingScreen`,
reached from Profile history. Old `/readings/[matchId]` links remain compatible
and redirect only after an authorized read. It reads the exact saved match independently of the room's
current match or closure. Shared `TarotReading`, card-art loading, navigation and
buttons retain the normal reading presentation, character art and chart controls.

The archive owns its compact page/navigation spacing instead of inheriting the
profile hero's top and bottom margins. Navigation keeps full touch targets and
the reading retains the same line lengths and card spacing as the current table.

The backend authorizes the match's sole recorded participant. The page does not
generate output, edit history or expose a room return link after closure/rematch.
It refreshes on focus and polls only while an existing generation lease is live.
Missing/expired/failed, invalid and inaccessible historical entries have explicit
states; errors hide previously cached content. The original question remains
private and visible alongside its exact saved result.

`saved-reading.test.tsx` checks the API boundary, GET-only proxy and identifier
redaction. `tests/browser/tarot-archive.spec.ts` uses two independent guests and
guarded local constructed readings to check ordinary/Both astrology, Profile
navigation, reload, rematch, closure and outsider denial on desktop and phone.
The fixture writer refuses hosted/non-loopback databases and existing readings.

A completed reading opens in its saved style. The shared completed-reading switch can request a second presentation of the same match with `api.savedReading(matchId, style)`. Closing the room has no effect on the participant’s access. Switching back renders the original response.

## Reading polish — 21 November 2026

The archive inherits the shared `TarotReading` changes: card thumbnails open the
full card, each section states its position, what it asks and `Upright`, text
follows the 16px/64-character measure and Tarot's 4.5:1 muted ink, and “Copy
reading” copies the saved text. The page keeps its own header (date, question,
introduction), so it does not pass `summary`. It also does not pass `question`
or `savedHref`: the copied text omits the question here, and there is no “Saved
reading” link to the page already open. Passing `question={data.question}` to
`TarotReading` in `SavedReading.tsx` would add the question to the copied text.
