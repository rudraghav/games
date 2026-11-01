# Reusable libraries and artwork

Reviewed 1 November 2026 against primary repository metadata, license files and
the actual Games interfaces. Stars are recorded signals, not a substitute for
license, compatibility or behavior checks.

| Project | Review signal | Decision |
| --- | --- | --- |
| [Fuse.js](https://github.com/krisk/Fuse) | 20,520 stars; Apache-2.0; active, not archived | Adopted pinned npm 7.1.0 for a bounded typo-tolerant fallback after exact game/alias matching |
| [Radix Primitives](https://github.com/radix-ui/primitives) | 19,461 stars; MIT; active | Retain the existing accessible dialogs and focus behavior; extend the single Games UI layer |
| [CVA](https://github.com/joe-bell/cva) | 6,906 stars; Apache-2.0 | Reviewed; current typed variants already cover our controls, so another variant runtime is unnecessary |
| [RLCard](https://github.com/datamllab/rlcard) | 3,588 stars; MIT | Reviewed; its supported game formats differ from our editions and do not cover the catalogue. Keep our tested engines and bounded projected-view policies |
| [OpenSpiel](https://github.com/google-deepmind/open_spiel) | 5,568 stars; Apache-2.0; active | Reviewed; native/research framework is disproportionate to deterministic room bots and would not preserve our specific editions automatically |
| [Playing card assets](https://github.com/hayeah/playing-cards-assets) | 360 stars; MIT repository; upstream explicitly identifies public-domain artwork | Adopted 54 vector faces for finished pips/courts/jokers; static assets fit better than replacing our interaction components |

The card asset commit is pinned to
`1e4497c05c3da9956c9f517bd386e9a7090ff7fa`. The original MIT notice, upstream
origin statement, individual hashes and source metadata are retained in
`apps/web/public/playing-cards`. Imported SVGs are checked for executable content;
they are decorative inside the accessible Games-owned card controls.
The vendored SVGs retain upstream formatting and exact hashes, including its
trailing whitespace. A scoped Git whitespace attribute preserves those originals;
all authored code keeps ordinary whitespace checks. Asset integrity and
executable-content tests remain mandatory for every face.

Games keeps one component vocabulary: cards, tiles, hands, seats, action panels,
dialogs and themes. It does not layer a second application shell on top of the
existing Radix/Tailwind/Lucide/Motion foundation. Native grids, labels, ranks and
controls remain real accessible UI. Illustrated districts, ceramic motifs,
wood/felt/cloth and wooden/glass/chip pieces come from original ImageGen atlases.
Preserved masters, exact prompts and reproducible WebP exports live under
`apps/web/public/game-art`. Existing 78-card Tarot originals remain unchanged.

Bot policies reuse the existing validated card evaluation and rummy helpers,
bounded board search, public observations and original offline word categories.
They do not call a model, install training frameworks, inspect other hidden hands
or borrow another engine's rule assumptions. See [bot architecture](../backend/app/bots/README.md).
