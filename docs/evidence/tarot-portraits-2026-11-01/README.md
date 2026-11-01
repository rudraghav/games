# Tarot portrait sources — 1 November 2026

All 48 canonical character references have local, readable licensed WebP photos.
This is a character-reference catalogue: **46 images show the performer, and two
show labelled cosplay**, rather than film stills or official character art.
Every performer caption explicitly states Portrayed by, Voiced by, or English
voice by. Link and Princess Peach explicitly state Cosplay photo. There are no
placeholder photos or unrelated-character substitutions.

- [All 48 contact sheet](contact-sheet.webp), visually reviewed in full.
- [Image checks](checks.json): canonical IDs, dimensions, bytes and SHA-256 hashes.
- [Public source manifest](../../../apps/web/public/characters/manifest.json):
  each image path, performer/cosplay label, creator, license/license URL, Commons
  file page, source page, remote image, dimensions, bytes and derivative hash.
- [Full attribution](../../../apps/web/public/characters/README.md).

Sources are Commons files licensed CC BY, CC BY-SA or public domain. Original
source URLs and licenses remain intact; resizing and WebP conversion are recorded.
Share-alike photos retain their source licenses. Chihiro uses Daveigh Chase,
explicitly the English voice, confirmed by [Disney D23](https://d23.com/a-to-z/spirited-away-film/).
Link's green tunic, cap and ocarina and Peach's pink sports costume/crown are
recognizable cosplay subjects with exact Commons descriptions. Two pairs of
characters share a performer's photograph (Amy Poehler and Kareena Kapoor Khan)
with distinct character IDs and captions; they are deliberate references.

48 decoded files match the canonical ID set exactly, every required attribution
field is populated, and every retained hash/size matches its image. Maximum
image size is400×500; total48WebPs are1,130,406bytes. No question/reading was sent
to Wikimedia. Acquisition was bounded to12MiB per request and conservative
sequential downloads, with complete temporary original-file cleanup on success.
The original files are recoverable via their recorded remote/file-page URLs.
No source/prompt, build, deployment, cloud, or browser-session changes belong to
this asset task. Production verification remains with the parent release.

## Frontend verification

The actual TwoCharacterConnections reading story and the added
CosplayAndLongNames story were inspected at320/390/1440px. All four local images
in each story decode; captions, long names and franchises fit; portrait/copy rows
do not collide or widen the page. Enter opens Image credits, Tab reaches its
first source link, and the expanded eight-link attribution list fits every width.
No portrait CSS adjustment was needed.

- [Two characters at320px](two-characters-phone.png).
- [Cosplay and long franchises at1440px](cosplay-desktop.png).
- [Six measured layouts and frontend checks](frontend-checks.json).

The isolated Storybook preview does not mount Next's font layout. These final
captures load the existing local DM Sans/Fraunces files into that test page only;
both fonts are confirmed loaded in every measurement. No font/source or public
asset was changed. The examples contain only non-personal fixture text.

Four added frontend contracts cover local licensed image/caption/attribution,
honest cosplay labels, legacy/unknown or mismatched references without guessed
faces, and character-based credits when Joy and Leslie Knope share Amy Poehler's
photo. A repeated character receives one credit entry. The stale catalogue-order
test now includes Shithead. All84frontend tests pass across22files; focused lint,
web TypeScript and diff whitespace checks pass. This follow-up made no backend,
API, cloud, build or deployment changes.

The focused deterministic character suite adds71cases: every cast/alias/source,
unknown/mismatched references (including substringspoof sources), duplicate aliases,
legacy history compatibility, allseven promptlanes, fresh schema parity and actual
asset/license/hash/dimension/generatedregistry parity. Together with Tarot and
Gemini tests,105cases pass locally. The exporter now rejects byte/hash/dimension
drift and incomplete WebP containers; four tamper fixtures protect those gates.
Ruff and the48portrait exportercheck pass. No live provider call was made.

## Final hosted readback

Application `02ff603` on READY production deployment
`dpl_JB1s7UJpd8qxvK8P4a65phGGSb96` delivers the bounded portraits directly,
retaining lazy loading, alt text and intrinsic dimensions. Actual photo decoding
caught the initial production optimizer 404. The correction passed 84 units,
types, lint and build before its focused rollout.

Fresh AI matches passed on desktop (36.8s) and phone (28.6s): all normal, quirky
and character sections, every photo decoded, identical refresh, history, rematch,
switching and room closure. `production-desktop.json` and `production-phone.json`
record the exact application revision. The combined release retains 121 hosted
path/hash/auth checks and final log scans.

The combined record also documents one guest-setup failure and an interrupted
test waiting for a lobby code after Tarot auto-started. No auth limits were
relaxed. The interrupted test's exact room was closed through RoomService.
