# Expanded Tarot reading verification

The `pop-tarot-3` contract requires a grounded reading, a separate quirky reading
and one or two named character connections for every card. New output is strict;
the independent saved-reading contract still accepts earlier analogies without
inventing missing sections or generating again.

Local checks: 34 deterministic Tarot/provider tests, eight isolated persisted-room
checks, Python lint/types, workspace TypeScript, frontend lint and browser-test
TypeScript passed. Three frontend rendering tests cover modern/earlier output,
two-character rendering and safe text handling. The deck explorer, all 78 entries,
22/14-card filters, three irreversible picks and refresh passed in desktop and
phone browsers. Two additional real-provider full-match browser cases passed in
desktop and phone layouts: natural completion, all new sections, exactly retained
rendered text after refresh, saved history, rematch and same-group switching.
Both test rooms closed with no transport retries or failures; `browser.json`
contains their metadata. An initial comparison mixed rendered `innerText` with
DOM `textContent`; comparing rendered text on both sides fixed that test-only
assertion while preserving the exact saved-output requirement.

Three fixed, non-personal real Gemini scenarios passed strict validation on their
first attempt in 3.83–4.20 seconds, using three of six planned maximum attempts.
They exercise different major/minor archetypes and a question-free spread.
Review found distinct normal/quirky text and explained, named connections across
sitcoms, fantasy, books, Indian cinema and video games; eight different characters
appeared across nine connections. This is a bounded quality sample, with provider
availability and factual perfection remaining outside a deterministic guarantee.

`development.json` contains metadata only. Private raw development evaluation
files are ignored and owner-readable. The Storybook editorial example is based
on a saved non-personal creative-hobby response, with one company-name typo
corrected; it contains no account, credential or player data. Historical v2
evaluation evidence remains unchanged.

Visual review: `deck-wands-*.png` and `deck-pentacles-*.png` show real shared-card
rendering in both viewport sizes, including the minor court cards. All eight
referenced WebP atlases decoded successfully; their metadata is in `visual.json`.
Inspected cells show the correct named scenes with no neighbouring-cell bleed.
`reading-*.png` uses the explicitly intercepted non-personal editorial fixture,
showing side-by-side interpretations on desktop and a stacked layout on phones.
These are layout examples, separate from the real provider/persistence checks
above. Both visual-capture rooms closed, and all views fit their viewport.
