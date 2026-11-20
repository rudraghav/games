'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ApiError, rouletteDetails, slotsDetails } from '@games/api-client';
import { gameById } from '@games/api-client/catalog';
import { Button } from '@games/ui';
import { api } from '@/lib/session';
import { SiteHeader } from '@/shared/SiteHeader';
import { usePrivateViewScope } from '@/shared/use-private-view-scope';
import { gamePath } from '@/shared/game-paths';
import { ChanceHistory } from '@/games/chance/ChanceHistory';

export function SavedChanceSession({
  gameId,
  matchId,
}: {
  gameId: 'roulette' | 'slots';
  matchId: string;
}) {
  const scope = usePrivateViewScope();
  const saved = useQuery({
    queryKey: ['saved-chance-session', scope, matchId],
    enabled: !!scope,
    gcTime: 0,
    retry: false,
    queryFn: () => api.savedChanceSession(matchId),
  });
  const match =
    saved.isSuccess && saved.data.id === gameId && saved.data.phase === 'finished'
      ? saved.data
      : null;
  const details = match
    ? gameId === 'roulette'
      ? rouletteDetails(match.detail)
      : slotsDetails(match.detail)
    : null;
  const denied =
    saved.error instanceof ApiError && [401, 403, 404, 422].includes(saved.error.status);
  return (
    <>
      <SiteHeader />
      <main className="saved-reading-page page-width">
        <nav className="hero-actions saved-reading-nav" aria-label="Result navigation">
          <Link href="/profile" className="button button--secondary button--md">
            Back to profile
          </Link>
          <Link href={gamePath(gameId)} className="button button--secondary button--md">
            Back to {gameById(gameId).name}
          </Link>
        </nav>
        <h1>{gameById(gameId).name} results</h1>
        {saved.isPending ? (
          <p role="status">Loading your spins…</p>
        ) : details && match ? (
          <>
            <p>You finished with {match.players[0].chips} chips.</p>
            <ChanceHistory history={details.history} expanded />
          </>
        ) : (
          <div role="alert">
            <p>
              {denied || !saved.isError
                ? 'This session is unavailable.'
                : 'Couldn’t load your spins.'}
            </p>
            {saved.isError && !denied ? (
              <Button onClick={() => void saved.refetch()}>Try again</Button>
            ) : null}
          </div>
        )}
      </main>
    </>
  );
}
