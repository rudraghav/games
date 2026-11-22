'use client';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiError, santaTokenPattern, type SantaReveal } from '@games/api-client';
import { api } from '@/lib/session';
import { usePrivateViewScope } from '@/shared/use-private-view-scope';
import { SantaLinkView, type SantaLinkState } from './SantaLinkView';

/** Which page state a failed reveal leads to. A refused link is never retried. */
export function santaLinkFailure(error: unknown): SantaLinkState {
  const status = error instanceof ApiError ? error.status : 0;
  if (status === 429) return { kind: 'limited' };
  // One answer for a mistyped, outdated or malformed link.
  if (status === 404 || status === 410 || status === 422) return { kind: 'invalid' };
  return { kind: 'failed' };
}

/**
 * The private link page. The token comes from the address and goes only into
 * the path of one API request: never a query string, a log, storage or another
 * page. A link that cannot be valid is answered here without asking the server.
 */
export function SantaLinkScreen({ token }: { token: string }) {
  const scope = usePrivateViewScope();
  const wellFormed = santaTokenPattern.test(token);
  const [shown, setShown] = useState(false);
  const reveal = useQuery<SantaReveal>({
    // Kept in memory for this page only; it is gone as soon as the page is left.
    queryKey: ['secret-santa-reveal', scope, token],
    queryFn: () => api.santaReveal(token),
    enabled: wellFormed && !!scope,
    // Asked once. Wrong links count toward a limit, so nothing repeats on its own.
    retry: false,
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
  const moved = useRef(false);
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    document
      .getElementById(shown ? 'santa-page-name' : 'santa-page-show')
      ?.focus({ preventScroll: true });
  }, [shown]);
  const state: SantaLinkState = !wellFormed
    ? { kind: 'invalid' }
    : reveal.data
      ? { kind: 'ready', reveal: reveal.data }
      : reveal.error
        ? santaLinkFailure(reveal.error)
        : { kind: 'loading' };
  return (
    <SantaLinkView
      state={state}
      shown={shown}
      retrying={reveal.isFetching}
      onShow={() => {
        moved.current = true;
        setShown(true);
      }}
      onHide={() => {
        moved.current = true;
        setShown(false);
      }}
      onRetry={() => void reveal.refetch()}
    />
  );
}
