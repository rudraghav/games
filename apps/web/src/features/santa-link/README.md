# Private Secret Santa link

The thin `/santa/[token]` route renders `SantaLinkScreen`. The link is the
permission: any session, including a new guest, may open it, and the organiser
need not be present.

- The token comes from the address and goes only into the path of one request
  (`api.santaReveal`, proxied as `GET v1/secret-santa/<token>`). It is never put
  in a query string, storage or a log (`proxyFailure` records `:token`).
- The reveal is asked for once: no retry, no refetch on focus or reconnect. A
  token that cannot be valid is answered on the page without a request.
- `SantaLinkView` is the presentation for every state: loading, `ready`,
  `invalid` (404, 410 or 422: mistyped or from an earlier draw), `limited` (429)
  and `failed` (anything else, with Try again).
- The name is not rendered until the person taps **Show who I’m buying for**.
  It then shows the name with the event title, the date ("Saturday 19 December
  2026"), the location and the budget, leaving out anything unset, and **Hide
  the name** puts the page back.
- The page links only to the home page, with `referrerPolicy="no-referrer"`.
  The route sets `robots: noindex, nofollow` and a `no-referrer` referrer policy.
  Nothing links to the organiser's room.

Checks: `apps/web/src/tests/secret-santa.test.tsx` and the mocked link-page
tests in `tests/browser/secret-santa.spec.ts`.

The page's card is a `Ticket` in its gift-tag shape (an eyelet at the top).
With a draw, the tear-off part holds the one action: "Show who I’m buying for"
before the reveal, the event details and "Hide the name" after it. The loading
and error states are the same tag with no tear line.
