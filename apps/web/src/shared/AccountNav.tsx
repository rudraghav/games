'use client';
import Link from 'next/link';
import { UserRound } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/session';
import { keys } from './query-keys';
import { useHasPlayed } from './player-preferences';

export function AccountNav() {
  const played = useHasPlayed();
  const me = useQuery({ queryKey: keys.me, queryFn: () => api.me(), enabled: played });
  const signedIn = me.data && !me.data.anonymous;
  return (
    <Link
      href="/profile"
      className={signedIn ? 'icon-button' : 'button button--secondary button--sm'}
      aria-label={signedIn ? 'Your profile' : undefined}
    >
      <UserRound size={18} />
      {signedIn ? null : 'Sign in'}
    </Link>
  );
}
