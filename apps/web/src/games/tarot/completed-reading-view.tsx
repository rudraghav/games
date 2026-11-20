'use client';
import { useEffect, useId, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiError, type ReadingStyle, type ReadingView } from '@games/api-client';
import { Button } from '@games/ui';
import { api, supabase } from '@/lib/session';
import { ReadingStyleSwitch } from './ReadingStyleSwitch';

/** Separate private query results across account changes, including changes in another tab. */
export function usePrivateReadingScope(localPlayer?: string) {
  const screen = useId();
  const [identity, setIdentity] = useState<string>();
  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((_, session) => {
      setIdentity(session?.user.id ?? 'signed-out');
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return supabase ? identity : (localPlayer ?? screen);
}

export function useCompletedReadingView(
  matchId: string | null | undefined,
  scope: string | undefined,
  originalStyle: ReadingStyle,
  original: ReadingView['reading'] | undefined,
) {
  const [choice, setChoice] = useState<{ matchId: string; scope: string; style: ReadingStyle }>();
  const style =
    choice && choice.matchId === matchId && choice.scope === scope ? choice.style : originalStyle;
  const otherStyle = originalStyle === 'fun' ? 'classic' : 'fun';
  const alternate = !!original && style !== originalStyle;
  const view = useQuery({
    queryKey: ['completed-tarot-view', scope, matchId, otherStyle],
    enabled: alternate && !!scope && !!matchId,
    // Keep the other view ready while this viewer is reading. Drop it on unmount.
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
    queryFn: async () => {
      if (!matchId || !original) throw new Error('This view is unavailable.');
      const result = await api.savedReading(matchId, otherStyle);
      const reading = result.reading;
      if (
        result.matchId !== matchId ||
        result.status !== 'complete' ||
        result.readingStyle !== otherStyle ||
        result.originalReadingStyle !== originalStyle ||
        !reading ||
        reading.cards.length !== original.cards.length ||
        reading.cards.some((card, i) => card.card_id !== original.cards[i].card_id)
      )
        throw new Error('This view is unavailable.');
      return reading;
    },
  });
  const reading = alternate
    ? view.data && !view.isError
      ? { ...view.data, astrology: original?.astrology }
      : undefined
    : original;
  const denied = view.error instanceof ApiError && [401, 403, 404].includes(view.error.status);
  return {
    style,
    alternate,
    reading,
    loading: alternate && !reading && !view.isError,
    error: alternate && view.isError,
    retry: denied ? undefined : () => void view.refetch(),
    select: (next: ReadingStyle) => {
      if (scope && matchId) setChoice({ matchId, scope, style: next });
    },
  };
}

export function CompletedReadingControls({
  view,
}: {
  view: ReturnType<typeof useCompletedReadingView>;
}) {
  const name = view.style === 'fun' ? 'Fun' : 'Classic';
  return (
    <div className="tarot-completed-style">
      <ReadingStyleSwitch value={view.style} onChange={view.select} />
      {view.loading ? (
        <p role="status" className="small muted">
          Opening {name} view…
        </p>
      ) : null}
      {view.error ? (
        <div className="tarot-view-error">
          <p className="small" role="alert">
            Couldn’t open the {name} view.
          </p>
          {view.retry ? (
            <Button type="button" variant="secondary" size="sm" onClick={view.retry}>
              Retry view
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
