'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Flame } from 'lucide-react';
import { ApiError, type Progress } from '@games/api-client';
import { LevelRing } from '@games/ui';
import { passiveApi } from '@/lib/session';
import { keys } from './query-keys';
import { useHasPlayed } from './player-preferences';
import { hasPlayedAGame, levelProgress, streakLine } from './progress';

/**
 * The player's level in the header: the small ring, "Level 3" and, while a
 * streak exists, a flame with the day count. One link to the progress page.
 * Someone with no finished game gets nothing at all, not a row of zeroes.
 */
export function ProgressChipView({ progress }: { progress?: Progress | null }) {
  if (!hasPlayedAGame(progress)) return null;
  const streak = streakLine(progress.streak);
  // One spoken sentence; what is drawn is the ring, the level and a flame with a number.
  const name = `Level ${progress.level}${streak ? `, ${streak.label}` : ''}. Open your progress and rewards`;
  return (
    <Link className="progress-chip" href="/rewards" aria-label={name}>
      <LevelRing level={progress.level} fraction={levelProgress(progress).fraction} size="sm" />
      <span className="progress-chip-level">Level {progress.level}</span>
      {streak ? (
        <span className="progress-chip-streak">
          <Flame size={15} aria-hidden="true" />
          {progress.streak.current}
        </span>
      ) : null}
    </Link>
  );
}

/** Reads progress with the passive client, and only for a player this browser knows. */
export function ProgressChip() {
  const played = useHasPlayed();
  const me = useQuery({ queryKey: keys.me, queryFn: () => passiveApi.me(), enabled: played });
  const progress = useQuery({
    queryKey: keys.progress,
    queryFn: () => passiveApi.progress(),
    enabled: played || Boolean(me.data?.profile),
    retry: (count, error) => !(error instanceof ApiError) && count < 1,
  });
  return <ProgressChipView progress={progress.isError ? null : progress.data} />;
}
