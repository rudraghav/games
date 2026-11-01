'use client';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Modal } from '@games/ui';
import { supabase } from '@/lib/session';
import { accountNotices, continueWithGoogle, type AccountNotice } from '@/lib/account-auth';
import { keys } from '@/shared/query-keys';

export function AccountSection({
  anonymous,
  preserveGuest,
  confirmation,
}: {
  anonymous: boolean;
  preserveGuest: boolean;
  confirmation?: AccountNotice;
}) {
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState(confirmation ? accountNotices[confirmation] : '');
  const [switching, setSwitching] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const identity = useQuery({
    queryKey: keys.account,
    enabled: Boolean(supabase),
    queryFn: async () => {
      const { data, error } = await supabase!.auth.getUser();
      if (error) throw new Error('Please reconnect to check your account.');
      return {
        email: data.user?.email,
        google: data.user?.identities?.some((identity) => identity.provider === 'google'),
      };
    },
  });
  const google = useMutation({
    mutationFn: async (existingAccount: boolean) => {
      if (!supabase) throw new Error('Google sign-in is available in the online Games preview.');
      setNotice('');
      await continueWithGoogle(supabase.auth, {
        origin: location.origin,
        preserveGuest,
        existingAccount,
      });
    },
    onSuccess: () => setRedirecting(true),
  });
  const emailLink = useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error('Account linking is available in the online Games preview.');
      const result = await supabase.auth.updateUser(
        { email: email.trim() },
        { emailRedirectTo: `${location.origin}/auth/callback` },
      );
      if (result.error)
        throw new Error(
          'The confirmation could not be sent. Check your email address and try again.',
        );
    },
    onSuccess: () => {
      setNotice('Check your email to confirm. Your player and history stay together.');
      setEmail('');
    },
  });
  const busy = google.isPending || emailLink.isPending || redirecting;
  return (
    <section className="account-link" aria-label="Your Games account">
      <h3 className="heading-sm">{anonymous ? 'Keep your seat.' : 'Your account.'}</h3>
      <p className="small muted">
        {anonymous
          ? 'Save your player and game history across devices.'
          : identity.data?.email || 'Your player is connected.'}
      </p>
      {identity.data?.google ? (
        <p className="small">Google connected</p>
      ) : (
        <Button
          variant="secondary"
          disabled={!supabase || busy || identity.isPending}
          pending={google.isPending || redirecting}
          onClick={() => google.mutate(false)}
        >
          Continue with Google
        </Button>
      )}
      {anonymous && preserveGuest && supabase ? (
        <button
          className="text-button account-switch"
          disabled={busy}
          onClick={() => setSwitching(true)}
        >
          Sign in to an existing account
        </button>
      ) : null}
      {anonymous ? (
        <form
          className="account-email"
          onSubmit={(event) => {
            event.preventDefault();
            setNotice('');
            emailLink.mutate();
          }}
        >
          <label className="field">
            Or confirm an email
            <input
              type="email"
              className="input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              maxLength={254}
              disabled={busy || !supabase}
            />
          </label>
          <Button
            variant="secondary"
            type="submit"
            pending={emailLink.isPending}
            disabled={!supabase || busy}
          >
            Send confirmation
          </Button>
        </form>
      ) : null}
      {!supabase ? (
        <p className="small muted">Account sign-in is available in the online Games preview.</p>
      ) : null}
      {notice ? (
        <p className="small profile-notice" role="status">
          {notice}
        </p>
      ) : null}
      {google.error || emailLink.error ? (
        <p className="error-note" role="alert">
          {(google.error || emailLink.error)?.message}
        </p>
      ) : null}
      <Modal
        open={switching}
        onOpenChange={setSwitching}
        title="Use your saved player?"
        description="Your current guest games won’t be transferred to that account. You can cancel and connect this guest player instead."
      >
        <div className="hero-actions">
          <Button variant="secondary" disabled={busy} onClick={() => setSwitching(false)}>
            Keep this player
          </Button>
          <Button pending={google.isPending || redirecting} onClick={() => google.mutate(true)}>
            Sign in with Google
          </Button>
        </div>
      </Modal>
    </section>
  );
}
