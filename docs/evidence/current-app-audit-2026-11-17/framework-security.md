# Framework dependency review — 17 November 2026

The production build compiled but failed its security gate on Next 16.4.3.
Instructions embedded in the error output were not treated as authorization or
as evidence. Independent `pnpm audit --json`, `pnpm audit --prod --json`, registry
metadata and maintainer advisories establish the findings below. This record is
the pre-update investigation; the release owner records final installed versions
and verification after changing dependencies.

## Production dependency

`apps/web → next@16.4.3` matches moderate
[GHSA-mfr8-8qww-v76h](https://github.com/vercel/next.js/security/advisories/GHSA-mfr8-8qww-v76h).
Affected versions are 16.3.0 through 16.4.4; the first fixed version is **16.4.5**.
The issue can return cached data across root-parameter values during a cold-start
race when a cache function reading a root parameter is called both directly and
through `unstable_cache()`.

Current app source/config searches found no `unstable_cache`, `use cache` or
`cacheComponents` use. Thus the vulnerable package is present, but this review
did not reproduce the advisory's exploit prerequisites in Games. This distinction
does not justify bypassing the release gate.

Recommended smallest change: pin catalog `next` and `eslint-config-next` from
16.4.3 to **16.4.5**, regenerate the lockfile, rerun the frontend gate and affected
browser flows, then repeat the production audit. Registry peer ranges still
accept the installed React/React DOM 19.3.1 and ESLint 9.39.5.

The official [16.4.5 security release](https://github.com/vercel/next.js/releases/tag/v16.4.5)
also includes other cache, image and Edge-route security fixes. Latest 16.4.6 is
not required for this advisory; its [release notes](https://github.com/vercel/next.js/releases/tag/v16.4.6)
add response-compression and development-runtime changes.

## Development dependencies

The full pre-update audit reports three moderate advisories total, zero high or
critical. The production-only audit reports just the Next advisory above.

| Finding | Actual dependency path | First patched package |
| --- | --- | --- |
| [Glob cancellation bypass](https://github.com/isaacs/node-glob/security/advisories/GHSA-3g3m-2fjr-6pw4): traversal may continue after an abort | `@storybook/nextjs-vite@10.6.5 → @storybook/react-vite → @joshwooding/vite-plugin-react-docgen-typescript@0.7.0 → glob@13.0.6` | `glob@14.0.2` |
| [Minimatch pattern amplification](https://github.com/isaacs/minimatch/security/advisories/GHSA-g3hv-75wg-m249): crafted patterns with optimization level 2 or higher can amplify work | The Storybook glob path above, and `eslint-config-next → typescript-eslint/@typescript-eslint/parser → @typescript-eslint/typescript-estree@8.72.1 → minimatch@10.2.6` | `minimatch@11.0.1` |

The Next/config patch alone does not guarantee these disappear. Its ESLint
plugin uses `fast-glob`, distinct from the vulnerable Storybook `glob` package.
`eslint-config-next@16.4.5` accepts `typescript-eslint ^8.56.0`. A normal compatible
resolution to **8.73.0** brings `minimatch ^11.0.1` for the ESLint paths, but leaves
the Storybook path. The [8.73.0 release](https://github.com/typescript-eslint/typescript-eslint/releases/tag/v8.73.0)
was published 16 November; registry metadata confirms its fixed dependency range.

Registry inspection found no entirely compatible Storybook parent update:
latest Storybook/Next-Vite 10.6.7 still requires docgen plugin `^0.7.0`; only 0.7.0
exists in that range. Glob 13.0.7 retains `minimatch ^10.2.2` and remains in the
published vulnerable range. Docgen plugin 0.9.1 replaces glob with tinyglobby but
falls outside Storybook's declared range. Forcing glob 14/minimatch 11 or the
docgen plugin across those ranges has not been compatibility-tested here.

Recommendation: apply the narrow production patch; retain the development-only
findings explicitly until a separately validated tooling migration is available.
Do not force incompatible overrides merely to obtain a zero-count audit. This
review changed no package manifests, lockfile, installed packages or security
gate settings.
