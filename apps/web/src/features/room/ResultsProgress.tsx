'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { ApiError, type Progress } from '@games/api-client';
import { LevelRing } from '@games/ui';
import { api } from '@/lib/session';
import { keys } from '@/shared/query-keys';
import { levelLabel, levelProgress, streakLine } from '@/shared/progress';

/**
 * The line under a result: where the player stands now, with a way to the
 * progress page. It states the current level, XP and streak as they are and
 * compares nothing. The same space is held while it loads and if it cannot.
 */
export function ResultsProgressView({
  progress,
  loading = false,
}: {
  progress?: Progress | null;
  loading?: boolean;
}) {
  const level = progress ? levelProgress(progress) : null;
  const streak = progress ? streakLine(progress.streak) : null;
  return (
    <section
      className="results-progress"
      aria-label="Your progress"
      aria-busy={loading || undefined}
    >
      {progress && level ? (
        <>
          <LevelRing level={progress.level} fraction={level.fraction} size="sm" />
          <div className="results-progress-copy">
            <strong>
              Your progress <span>Level {progress.level}</span>
            </strong>
            <span className="results-progress-bar">
              <progress value={level.earned} max={level.span} aria-label={levelLabel(progress)} />
              <span>
                {level.remaining} XP to level {progress.level + 1}
                {streak ? ` · ${streak.label}` : ''}
              </span>
            </span>
          </div>
        </>
      ) : (
        <div className="results-progress-copy">
          <strong>Your progress</strong>
          <span className="muted small">Levels, badges and rewards.</span>
        </div>
      )}
      <Link href="/rewards" className="results-progress-link">
        See rewards
        <ArrowRight size={15} aria-hidden="true" />
      </Link>
    </section>
  );
}

/** Asks for progress once when a result appears. It never holds up the rematch controls. */
export function ResultsProgress() {
  const progress = useQuery({
    queryKey: keys.progress,
    queryFn: () => api.progress(),
    // The match that just ended is not in anything cached earlier.
    staleTime: 0,
    refetchOnMount: 'always',
    retry: (count, error) => !(error instanceof ApiError) && count < 1,
  });
  // Anything cached is from before this match, so only a fresh reply is shown.
  const fresh = progress.isFetching || progress.isError ? undefined : progress.data;
  return <ResultsProgressView progress={fresh} loading={progress.isFetching} />;
}
