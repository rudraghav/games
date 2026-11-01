import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient, Session } from '@supabase/supabase-js';
import { accountNotice, authFailure, continueWithGoogle } from '@/lib/account-auth';

function client(anonymous: boolean | null) {
  const response: Awaited<ReturnType<SupabaseClient['auth']['getSession']>> =
    anonymous == null
      ? { data: { session: null }, error: null }
      : {
          data: { session: { user: { id: 'current-player', is_anonymous: anonymous } } as Session },
          error: null,
        };
  const getSession = vi.fn<SupabaseClient['auth']['getSession']>().mockResolvedValue(response);
  const linkIdentity = vi
    .fn()
    .mockResolvedValue({ data: { url: 'https://accounts.google.com/' }, error: null });
  const signInWithOAuth = vi.fn<SupabaseClient['auth']['signInWithOAuth']>().mockResolvedValue({
    data: { provider: 'google', url: 'https://accounts.google.com/' },
    error: null,
  });
  return { getSession, linkIdentity, signInWithOAuth };
}
describe('Google account flow', () => {
  it('links a guest with saved play instead of replacing its identity', async () => {
    const auth = client(true);
    expect(
      await continueWithGoogle(auth, { origin: 'https://games.example', preserveGuest: true }),
    ).toBe('link');
    expect(auth.linkIdentity).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'https://games.example/auth/callback',
        scopes: 'openid email profile',
        queryParams: { prompt: 'select_account' },
      },
    });
    expect(auth.signInWithOAuth).not.toHaveBeenCalled();
  });
  it('uses regular OAuth for a fresh visitor, allowing returning accounts to sign in', async () => {
    const auth = client(true);
    expect(
      await continueWithGoogle(auth, { origin: 'https://games.example', preserveGuest: false }),
    ).toBe('sign-in');
    expect(auth.signInWithOAuth).toHaveBeenCalledOnce();
    expect(auth.linkIdentity).not.toHaveBeenCalled();
  });
  it('links Google to an existing email player without replacing that player', async () => {
    const auth = client(false);
    expect(
      await continueWithGoogle(auth, { origin: 'https://games.example', preserveGuest: false }),
    ).toBe('link');
  });
  it('switches identity only when the player explicitly chooses an existing account', async () => {
    const auth = client(true);
    expect(
      await continueWithGoogle(auth, {
        origin: 'https://games.example',
        preserveGuest: true,
        existingAccount: true,
      }),
    ).toBe('sign-in');
  });
  it('does not silently sign in over the guest when Google is already linked elsewhere', async () => {
    const auth = client(true);
    auth.linkIdentity.mockResolvedValue({
      data: null,
      error: { code: 'identity_already_exists', message: 'private provider detail' },
    });
    await expect(
      continueWithGoogle(auth, { origin: 'https://games.example', preserveGuest: true }),
    ).rejects.toThrow('already has a Games player');
    expect(auth.signInWithOAuth).not.toHaveBeenCalled();
  });
  it('handles cancellation/conflicts without echoing arbitrary provider content', () => {
    expect(authFailure('identity_already_exists', 'server_error')).toBe('identity-exists');
    expect(authFailure(undefined, 'access_denied')).toBe('canceled');
    expect(accountNotice('https://another-site.example')).toBeUndefined();
    expect(accountNotice('__proto__')).toBeUndefined();
  });
});
