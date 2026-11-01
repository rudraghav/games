import type { SupabaseClient } from '@supabase/supabase-js';

type AccountAuth = Pick<SupabaseClient['auth'], 'getSession' | 'linkIdentity' | 'signInWithOAuth'>;
export type AccountNotice = 'connected' | 'failed' | 'identity-exists' | 'canceled';

export const accountNotices: Record<AccountNotice, string> = {
  connected: 'You’re signed in. Your player is ready.',
  failed: 'Sign-in could not finish. Please try again.',
  'identity-exists':
    'That Google account already has a Games player. Choose “Sign in to an existing account” to use it.',
  canceled: 'Sign-in was canceled. You can keep playing.',
};

export function accountNotice(value: unknown): AccountNotice | undefined {
  return typeof value === 'string' && Object.hasOwn(accountNotices, value)
    ? (value as AccountNotice)
    : undefined;
}

export function authFailure(code: string | undefined, error?: string | null): AccountNotice {
  if (code === 'identity_already_exists' || code === 'email_exists') return 'identity-exists';
  return error === 'access_denied' ? 'canceled' : 'failed';
}

export async function continueWithGoogle(
  auth: AccountAuth,
  {
    origin,
    preserveGuest,
    existingAccount = false,
  }: {
    origin: string;
    preserveGuest: boolean;
    existingAccount?: boolean;
  },
) {
  const { data, error: sessionError } = await auth.getSession();
  if (sessionError) throw new Error('Please reconnect your player and try again.');
  const session = data.session;
  const shouldLink = Boolean(
    session && !existingAccount && (!session.user.is_anonymous || preserveGuest),
  );
  const options = {
    redirectTo: `${new URL(origin).origin}/auth/callback`,
    scopes: 'openid email profile',
    queryParams: { prompt: 'select_account' },
  };
  const result = shouldLink
    ? await auth.linkIdentity({ provider: 'google', options })
    : await auth.signInWithOAuth({ provider: 'google', options });
  if (result.error) {
    if (result.error.code === 'identity_already_exists')
      throw new Error(accountNotices['identity-exists']);
    if (
      ['provider_disabled', 'provider_not_found', 'manual_linking_disabled'].includes(
        result.error.code || '',
      )
    ) {
      throw new Error('Google sign-in is still being configured. You can keep playing as a guest.');
    }
    throw new Error('We could not open Google sign-in. Please try again.');
  }
  return shouldLink ? 'link' : 'sign-in';
}
