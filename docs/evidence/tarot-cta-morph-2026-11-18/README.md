# Tarot action-to-progress transition — 18 November 2026

The reading CTA expands into the processing card on the same persistent surface.
A short grid-height transition, color/corner change and content fade preserve the
existing readable progress content. The action is inert and hidden while processing.
Network requests and results remain immediate. Reduced motion and restored saved
progress skip the morph. Keyboard focus follows the surface and returns to the
available retry action unless the user has moved focus elsewhere.

## Focused evidence

Six affected browser scenarios passed. The normal-motion 320px case measures a
54px-to-141px expansion at a constant 296px width, with intermediate rendered
frames, the same DOM surface and no horizontal overflow. Before/during/after
screenshots were inspected. Recovery, failed-status checks, retry, duplicate-submit
prevention, immediate success and refresh are covered. Seven fixture rooms were
closed; no provider calls occurred. The first reduced-motion assertion incorrectly
expected literal 0s; the shared theme uses 0.01ms, so the corrected assertion accepts
at most 1ms. No application change was needed for that test failure.

## Broader local acceptance

All 60 selected mobile and desktop cases passed, covering the full Tarot table and
astrology suites. Frontend types, lint, production build and 266 tests passed;
generated contracts, catalogue/assets and 44 tooling tests passed. Both reports
retain stable source fingerprints:

- `verify-2f29b9129dbe498e9409ad2e4e2a5395`: frontend, contracts, tooling.
- `verify-0aee19d7199943c2ae326604b56612e6`: browser.

The runtime fingerprint is `d80b27451bf356db424bd4225a4c80e67a6f0801a791e8879332cf81cdc0c3f8`
across 6,193 files. Release status and cleanup follow after production readback.
Production UI checks use intercepted synthetic reading responses and do not claim
new hosted AI-output validation. Existing provider behavior is unchanged.
