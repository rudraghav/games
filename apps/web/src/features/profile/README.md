# Profile and account connection

ProfileScreen owns editable name/avatar and match history. AccountSection owns
Google connection, verified-email linking and explicit existing-account choice.
Both reuse the shared buttons, forms and dialog vocabulary. AccountNav makes the
profile/sign-in route discoverable without creating a guest on a fresh home visit.

`lib/account-auth.ts` chooses OAuth sign-in for an empty visitor, links an existing
guest player when play/profile data exists, and links Google to an email player.
Existing-account switching is explicit; conflicts never silently replace a guest.
Guest data is not automatically merged into another pre-existing account. Only
openid/email/profile are requested. No Google API secret belongs in this app.

Supabase handles Google exchange; `/auth/callback` exchanges the PKCE code and
returns a whitelisted status to `/profile`. It does not accept arbitrary return
URLs or display provider error descriptions. Callbacks are private/non-cacheable.
Cancel/failure does not sign the current player out. Provider secrets and manual
linking must be configured on the dedicated Games Supabase project before live
Google connection can succeed. See `docs/GOOGLE_SIGN_IN.md` for setup and evidence.
