# Tarot astrology — 2 November 2026

Local implementation evidence. These images use synthetic calculations, mock provider responses and explicitly labeled interpretation layout text. They are not evidence of a new production deployment or of AI output quality. The real provider evaluation and release record belong to the root journal.

## Verified behavior

- 12 actual-room browser cases passed across desktop and phone (34.5 seconds), including ordinary Tarot, all card reading layers, required input validation, both chart types, saved reading refresh/show/hide, stale calculation and location responses, geocoder failure, explicit daylight-saving occurrence, nonexistent time, saved chart retry and opt-out.
- Every Western planet label was clicked at 320px and selected its own exact inspector entry. Keyboard Enter also selects a chart point. Full native inspectors and placement/house/aspect tables remain available.
- Two focused daylight-saving cases passed at 320px after confirming real server choice labels wrap without repeated offsets (6.6 seconds).
- All seven Storybook stories passed at 320, 390, 768 and 1440px with reduced motion: 28 rendered checks, no page overflow, every enabled native action at least 44px.
- Web TypeScript, scoped ESLint, 13 focused unit cases and the final Storybook build passed.
- The real authorized UI → Next.js proxy → FastAPI → public geocoder → deterministic calculator → Western/Vedic preview passed on phone and desktop (2 cases, 6.8 seconds). These checks did not call Gemini. Every owned room was closed and its subsequent GET returned 404.
- Off readings omit raw astrology and the saved-chart reuse flag. Browser checks found no birth fields/date in URLs or local storage. Location/calculation requests use POST bodies. Saved chart recovery needs no raw birth fields.

## Images

| Image                      | State                                                                                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| before-choosing-1440 / 390 | Actual local table before edits, synthetic saved-match projection.                                                                                            |
| before-reading-form-390    | Original three-card question form, before optional astrology.                                                                                                 |
| western-chart-1440 / 390   | Computed Western chart, exact position dots, separated labels and full-size native inspector.                                                                 |
| vedic-chart-1440 / 390     | North Indian fixed-house diagram with returned sidereal signs and bodies.                                                                                     |
| both-chart-layout-768      | Tablet layout of the two-system chart.                                                                                                                        |
| recovered-chart-390        | Computed draft restored without birth inputs; retry remains possible.                                                                                         |
| ambiguous-time-320         | Real-shape daylight-saving choices, long labels contained within the phone layout.                                                                            |
| actual-room-chart-1440     | Three actual selected cards, question, optional form and chart preview in a local room; calculation response intercepted with the computed synthetic fixture. |
| saved-reading-320          | Saved card reading, both interpretation layers, characters and optional astrology; deliberately long reading remains a normal vertical page.                  |

`real-server-chart-1440` shows an actual local room using the public city lookup and server calculator, with no AI generation request.

The J2000 fixture uses noon at Greenwich, not a person's birth data. The daylight-saving fixture uses the repeated 2024-11-03 01:30 local time in New York. Vedic output explicitly identifies True Chitrapaksha and geometric aspects; it makes no Lahiri or classical graha-drishti claim. SVG layout is presentation only; the backend owns every sign, degree, house, aspect and nakshatra.

## Verification limit

Initial direct local browser requests found the Next.js route allowlist did not yet include astrology. The strict POST-only allowlist was extended by the root task; the final real-geocoder/calculator readback passed in both widths. AI generation stays intercepted in this child task to avoid duplicate provider calls.

## Cleanup

The task-owned Storybook server on 6106 and the isolated `tarot-astrology` browser were closed. Superseded builds and raw test artifacts were removed after retaining these compact screenshots and the verification receipt (about 254 MiB reclaimed). The requested web/API services on 3217/8217, the existing Storybook service on 6105, user browser sessions, source, dependencies and credentials were preserved. Web/API health readbacks both returned 200.

## Parent production verification

Source `9627e530be1c79abaf1c4b10b27b0037c8677ed8` is deployed to the public Games
production alias. A two-guest live run generated and saved Both and ordinary
readings, compared the saved chart with its real calculated preview, checked
private access and unchanged refresh, and reviewed320/390/1440 bounds. Raw birth
fields are absent from saved payloads. All three hosted QA rooms are closed;
records remain. See [`production evidence`](../game-info-2026-11-02/production.json).
The parent later started its own6105Storybook for the final gate and closed it
afterward; requested3217/8217 services remain healthy.
