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
