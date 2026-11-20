'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@games/api-client';
import { Button } from '@games/ui';
import { api } from '@/lib/session';
import { SiteHeader } from '@/shared/SiteHeader';
import { optimizeCardArt } from '@/shared/card-art';
import { TarotReading } from '@/games/tarot/TarotReading';
import { gamePath, readingPath, roomPath } from '@/shared/game-paths';

/** An exact saved spread. Reading this page never requests another interpretation. */
export function SavedReadingScreen({ matchId }: { matchId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const saved = useQuery({
    queryKey: ['saved-tarot-reading', matchId],
    queryFn: () => api.savedReading(matchId),
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: (query) => (query.state.data?.status === 'generating' ? 3000 : false),
  });
  const data = saved.isError ? undefined : saved.data;
  useEffect(() => {
    if (!data) return;
    const canonical = readingPath(data.matchId);
    if (pathname !== canonical) router.replace(canonical, { scroll: false });
  }, [data, pathname, router]);
  const unavailable = saved.error instanceof ApiError && saved.error.status === 404;
  return (
    <>
      <SiteHeader />
      <main className="saved-reading-page page-width">
        <nav className="hero-actions saved-reading-nav" aria-label="Reading navigation">
          <Link href="/profile" className="button button--secondary button--md">
            Back to profile
          </Link>
          {data?.canResume ? (
            <Link
              href={roomPath({ id: data.roomId, gameId: 'tarot' })}
              className="button button--secondary button--md"
            >
              Return to spread
            </Link>
          ) : data ? (
            <Link href={gamePath('tarot')} className="button button--secondary button--md">
              New reading
            </Link>
          ) : null}
        </nav>
        {saved.isPending ? (
          <p className="muted" role="status">
            Loading your saved reading…
          </p>
        ) : saved.error ? (
          <section className="center-state">
            <h1 className="heading-md">
              {unavailable ? 'This reading isn’t available.' : 'The reading couldn’t load.'}
            </h1>
            <p className="muted" role="alert">
              {unavailable
                ? 'Open your profile with the player who saved this reading.'
                : saved.error.message}
            </p>
            {!unavailable ? (
              <Button onClick={() => void saved.refetch()} pending={saved.isFetching}>
                Try again
              </Button>
            ) : null}
          </section>
        ) : data ? (
          <div className="tarot-table stable-tarot-table">
            <header className="tarot-intro">
              <p className="eyebrow">
                {data.readingStyle === 'fun' ? 'Saved Fun Tarot reading' : 'Saved Tarot reading'}
              </p>
              <h1 className="heading-md">{data.reading?.title || 'Your saved spread'}</h1>
              <p className="small muted">
                {new Intl.DateTimeFormat('en', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }).format(new Date(data.createdAt * 1000))}
              </p>
              {data.question ? <p>Your question: {data.question}</p> : null}
              {data.reading ? <p className="muted">{data.reading.introduction}</p> : null}
            </header>
            {data.status === 'complete' && data.reading ? (
              <TarotReading
                reading={data.reading}
                readingStyle={data.readingStyle}
                cards={data.cards}
                imageLoader={optimizeCardArt}
              />
            ) : (
              <section className="center-state" role="status">
                <h2 className="heading-md">
                  {data.status === 'generating'
                    ? 'Your reading is still being written.'
                    : data.status === 'unavailable'
                      ? 'This saved reading can’t be displayed.'
                      : 'No completed reading was saved for this spread.'}
                </h2>
                <p className="muted">
                  {data.status === 'generating'
                    ? 'This page will show it when it is ready.'
                    : data.status === 'unavailable'
                      ? 'The original reading has been kept. Please try again later.'
                      : data.canResume
                        ? 'Return to this spread to continue. Opening this page does not generate a reading.'
                        : 'You can start a new Tarot spread from the games library.'}
                </p>
              </section>
            )}
          </div>
        ) : null}
      </main>
    </>
  );
}
