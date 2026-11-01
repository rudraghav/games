# Pop Tarot

An original reflective solo experience, not a competitive game. The player asks
an optional question and chooses three face-down positions from a shuffled
78-card deck: 22 major arcana and four 14-card suits. Cards are unique, upright
only in this edition, and never leave the server until selected. The spread is
**Where you are / What is shifting / Your next move**. Picking cannot be undone.

The meanings in `deck.py` are Games' concise editorial interpretation of
traditional archetypes, not copied guidebook text. All references to films,
characters or music are written analogies; no licensed character artwork,
dialogue or lyrics are bundled.

After three picks, the player explicitly requests a personal AI reading.
`reading.py` owns the compact prompt, schema and provider adapter; engines never
make network calls. Generation reserves a database lease, releases the lock
before calling the provider, validates the exact three cards, then saves the
result atomically. Saved readings survive refresh. A failed or interrupted call
can be retried after its lease; no curated substitute is presented as AI.
If submission fails, the browser fetches the saved reading again before another
generation is needed. A committed response lost in transit can recover without
a second provider call; rejected attempts retain the same cards for explicit retry.

The optional question is limited to 400 characters. It is sent to the configured
Gemini with the selected card meanings. Questions/readings are private to
the solo participant and are not logged. Usage logs contain token counts and
model configuration only. Failures log the exception type and validation-error
count, without exception text, player questions or provider output. Provider
storage is disabled. `GEMINI_API_KEY` is a
dedicated server environment variable; the feature reports unavailable when it
is absent. Live quality evaluation remains required before release.

Provider storage controls do not determine Google's product-improvement policy.
Google's free API tier may use submitted content to improve its products; paid
tier terms differ. The owner selected the free tier for development. The server
returns `api_tier` from `TAROT_API_TIER` (default `free`); the question form shows
the free-tier notice and waits for that server response before enabling submission.
The configured value must match the actual key's project tier. The notice is
associated with the question field for screen readers. Paid-tier configuration
retains the general Gemini transmission notice without the free-tier statement.
See https://ai.google.dev/gemini-api/docs/pricing.

Provider: Google Gemini Interactions API with JSON Schema output, storage off,
low thinking level and a 2,400-token output cap. Default model is configurable
through `TAROT_MODEL`. See https://ai.google.dev/gemini-api/docs/structured-output
and https://ai.google.dev/gemini-api/docs/models (reviewed 31 October 2026).

Cost controls: 16,000-character request ceiling, 10 reading requests per player
per hour, and a transactional application-wide default of 100 provider attempts
per UTC day (`TAROT_DAILY_LIMIT`). Failed provider attempts consume that budget.
The dedicated free-tier key passed authentication and three fixed real-provider
evaluations, reviewed under `docs/evidence/tarot-evaluation`. A browser reading
was saved and remained identical after refresh and an API process restart;
its phone layout had no horizontal overflow. An earlier browser attempt was
rejected before persistence; retry retained the same spread and succeeded.
The earlier prepaid-key HTTP 402 is resolved by replacing the key, not by
purchasing credit or upgrading billing. This small evaluation is not exhaustive.

Acceptance: all 78 identities unique, deterministic seeded draws, no deck leak,
exactly three choices, persisted personal output, wrong-card output rejected,
honest unavailable/error states, keyboard and phone card picking, reduced motion.
