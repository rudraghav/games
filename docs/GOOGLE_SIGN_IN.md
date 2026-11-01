# Google signup and account connection

Use the owner's personal Google Cloud account and the existing Games Development
project (`games-development-513310`) used for the free-tier Gemini key. Global
gcloud authentication currently belongs to Shikha and must remain unchanged.
The Gemini API key is separate from OAuth credentials; it cannot enable Google
login. No Gmail API or mailbox permissions are required.

## Provider setup

1. In Google Auth Platform, select Games Development and create/configure the
   Games app. Audience is External. Request only openid, email and profile.
   If left in Testing, add the intended Google tester accounts; broader availability
   requires the applicable Google publishing steps. Keep billing unchanged.
2. Create a Web application OAuth client named Games Web. The authorized Google
   redirect URI is `https://pdkkpjpholsgmllehzax.supabase.co/auth/v1/callback`.
   Authorized JavaScript origins include the Games production origin and can include
   `http://127.0.0.1:3217` for development. Redirect-based OAuth uses the stable
   Supabase callback, independent of changing Vercel preview hostnames.
3. On the dedicated personal games-preview Supabase project, enable Google using
   that client ID and secret. Enable manual identity linking. Keep nonce checks
   enabled, anonymous guests enabled and other provider settings intact.
4. Set the production site to `https://games-seven-black.vercel.app` and
   allow its exact `/auth/callback` URL. A
   future preview pattern must be restricted to this personal Games project:
   `https://games-*-rudraghavs-projects.vercel.app/auth/callback`. Local development
   can use `http://127.0.0.1:3217/auth/callback`. Preserve existing allowlist entries.
5. Save secrets only in Supabase or a temporary ignored owner-only handoff file;
   never put an OAuth secret in NEXT_PUBLIC variables, source, logs or chat.

## Product behavior and acceptance

The header opens the profile and its Continue with Google control. An empty
visitor uses regular Google OAuth signup/sign-in. A guest with saved play links
Google to the same Supabase user, keeping room memberships and history under that
ID. Email players can add Google to their existing account too. A Google identity
already connected elsewhere is an explicit conflict; the player can choose an
existing account after the app explains that guest games are not transferred.

Verify provider settings, Google authorization redirect, human-owned consent,
PKCE callback, authenticated API read, refresh and stable player ID/history. Also
check canceled consent, an existing-account conflict, phone layout and private
callback headers. Local mocks cannot prove Cloud consent or provider settings.
The callback uses a relative Location so Next's internal localhost origin cannot
send a player to a different host or lose the player cookie behind a proxy.

## Current state

Google and manual identity linking are configured on the exact Games project.
Anonymous signup, new signup, nonce checks and email confirmation remain enabled.
The first unused client secret was replaced and disabled following its accidental
appearance in an accessibility label; only the replacement is configured in
Supabase. Credentials remain outside Git and frontend environment variables.
The local implementation passed types/lint, ten frontend tests, production build and desktop/phone account
flow checks. Those checks caught and fixed an internal-localhost callback redirect;
the browser now stays on its original host and keeps the same player cookie.
Google branding uses Games, the production home/privacy URLs and basic identity
scopes. The owner approved the API User Data Policy and requested main/production
deployment. Live production consent and PKCE callback passed with the owner's
personal Google account. Scoped database readback proved the guest player ID,
saved name and existing room ownership were retained; the account is permanent,
email-verified and linked to Google. The saved room remained accessible after
linking. Refresh verification and exact rollout evidence are in progress.txt.

References: [Supabase Google sign-in](https://supabase.com/docs/guides/auth/social-sign-in/auth-google),
[guest identity linking](https://supabase.com/docs/guides/auth/auth-anonymous),
[Google web OAuth](https://developers.google.com/identity/protocols/oauth2/web-server).
