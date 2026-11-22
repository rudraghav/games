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

Completed Tarot history links to `/readings/{matchId}` so a later spread or closed
room cannot replace the saved reading. Roulette and Slots open the owner’s saved
spin receipts at `/games/{gameId}/results/{matchId}`, including after a rematch
or room closure. Other game history retains its room link.
The archive authorizes the saved participant on every request; switching to a
different existing account does not make the earlier guest's readings public.

## Username

"Let friends find you" in Player details holds the shared `UsernameField`
(`shared/UsernameField.tsx`): 3 to 20 letters, numbers or underscores, lowercase
as typed, with the @ shown beside the field and never sent. Save calls
`api.setUsername`, Remove calls `api.clearUsername`, and both update the cached
player. The server's message is shown for a taken, reserved or invalid name. The
field is disabled until a profile exists ("Save your name first, then choose a
username."); guests can choose one too. The same field opens from the lobby's
invite panel.
