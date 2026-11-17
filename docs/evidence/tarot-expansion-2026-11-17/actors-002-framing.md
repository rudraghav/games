# Actors batch 002 — framing readback

Completed the 38 framing corrections identified by the parent review of the immutable `actors-002` batch. Each full source image was inspected, an individual bounded 4:5 rectangle selected, and the final before/after pair inspected at 88×110. The changes enlarge faces in full-body, wide, letterboxed and commemorative-stamp sources; they do not modify the depicted people or synthesize details.

All 38 staged WebPs match their recorded byte counts and SHA-256 hashes (541,446 bytes total). The source rectangles use actual decoded dimensions. Original staged files remain in task-owned backups. Small source text persists in some stamp portraits; preserving the full head was preferred to cutting off identifying facial features. Low-light or low-resolution originals remain limited by their source quality.

Ignored evidence under `output/tarot-reference-import-20261117/`:

- `actors-002-sources/ids.json`, `rows.json`, source bytes, previews and metadata: the exact 38 assigned sources.
- `actors-002-sources/crops.json`: individual source rectangles.
- `actors-002-sources/corrections-88-1.png` through `corrections-88-3.png`: final before/after readback, all 38 inspected.
- `actors-002-crop-patches.json` and `actors-002-crop-review.json`: accepted metadata and review receipts.

Only the 38 assigned staged images and separate patch/receipt artifacts were changed. Shared staging manifests and the parent’s `root-review.json` were not edited. The four separate identity/source problems in the batch remain with their assigned reviewers. This is staged source/framing proof; browser, active export and production verification remain separate.
