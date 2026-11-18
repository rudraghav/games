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


## First production observation and correction

The first release `f29a735e68e80ea32cce850b3d42b6b0f7c591cd` reached production;
its core hosted morph check passed with two locally intercepted submissions and
zero forwarded generation requests. Visual review then found that a later retry
explanation could grow the card and move its ETA below the viewport. This first
proof is retained as historical evidence; it did not include a later-growth
viewport assertion. A follow-up adds guarded content-growth following and tests
both visible retry detail and deliberate user scrolling away. No provider behavior
changes are needed for the correction.


## Follow-up local acceptance

The focused card now follows positive content growth after its entrance completes.
Following requires a local request, retained focus and a visible card. Wheel/touch
scrolling, navigation keys or interacting elsewhere stops following. Refresh and
unchanged-height updates preserve scroll. Normal and reduced-motion tests verify
the ETA stays visible, then prove deliberate scrolling away is respected while the
surface still owns focus. No request/result waits were added.

All 64 full Tarot browser cases passed in `verify-0f951ea20a6649bfa1a90f2c08936531`.
Frontend types/lint/build and 266 tests passed in `verify-04fd6ae2c03848e3bfbde0039d76f7f1`.
Both reports retain stable source fingerprints. Prior contract/tooling evidence is
reused for unchanged inputs. Ten focused growth/motion scenarios also passed.
The first growth fixture exceeded the existing 160-character retry-detail limit;
its failed evidence is retained, and the corrected fixture stays within that
contract. Four initial and ten corrected fixture rooms were closed, with zero
provider calls. Final runtime fingerprint:
`a4a358782f96932f9af2ca5ccf08acd3a51b3b675f46743f44144147131ef017` (6,193 files).
