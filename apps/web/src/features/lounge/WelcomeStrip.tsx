'use client';
import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Award, ChevronRight, Flame, Sparkles } from 'lucide-react';
import { ApiError, type Progress } from '@games/api-client';
import { LevelRing } from '@games/ui';
import { passiveApi } from '@/lib/session';
import { keys } from '@/shared/query-keys';
import { badgeCount, hasPlayedAGame, levelProgress, streakLine } from '@/shared/progress';

/**
 * The strip under the header. Someone who has finished a game sees their level,
 * the XP to the next one, a streak when they have one, and their badge count,
 * all as one link to the progress page. Everyone else sees one welcoming line.
 * Every state fills the same reserved space, so nothing below it moves.
 */
export function WelcomeStripView({
  state,
  progress,
}: {
  /**
   * `pending`: before the browser knows whether this is a returning player.
   * `new`: never played. `loading`: a player whose progress is on its way.
   */
  state: 'pending' | 'new' | 'loading' | 'ready';
  progress?: Progress | null;
}) {
  if (state === 'pending')
    return (
      <div className="welcome-strip" data-state="pending">
        <span className="welcome-placeholder" aria-hidden="true" />
      </div>
    );
  if (state === 'loading')
    return (
      <div className="welcome-strip" data-state="loading" aria-busy="true">
        <span className="welcome-placeholder" aria-hidden="true" />
        <span className="sr-only" role="status">
          Loading your progress…
        </span>
      </div>
    );
  if (state === 'new' || !hasPlayedAGame(progress))
    return (
      <p className="welcome-strip" data-state="new">
        <Sparkles size={18} aria-hidden="true" />
        <span>
          <strong>Welcome.</strong> Play any game to start earning badges, avatar frames and card
          backs.
        </span>
      </p>
    );
  const level = levelProgress(progress);
  const streak = streakLine(progress.streak);
  return (
    <Link className="welcome-strip" data-state="ready" href="/rewards">
      <span className="welcome-level">
        <LevelRing level={progress.level} fraction={level.fraction} size="md" />
        <span className="welcome-text">
          <strong>Level {progress.level}</strong>
          <span>
            {level.remaining} XP to level {progress.level + 1}
          </span>
        </span>
      </span>
      <span className="welcome-stats">
        {streak ? (
          <span className="welcome-stat" data-stat="streak">
            <Flame size={18} aria-hidden="true" />
            <span className="welcome-text">
              <strong>{streak.label}</strong>
              {streak.hint ? <span>{streak.hint}</span> : null}
            </span>
          </span>
        ) : null}
        <span className="welcome-stat" data-stat="badges">
          <Award size={18} aria-hidden="true" />
          <span className="welcome-text">
            <strong>{badgeCount(progress.badges)}</strong>
          </span>
        </span>
      </span>
      <span className="welcome-more">
        <span className="sr-only">Open your progress and rewards</span>
        <ChevronRight size={18} aria-hidden="true" />
      </span>
    </Link>
  );
}

/**
 * Reads progress only for someone who already has a player, with the passive
 * client, so opening the home page never creates a guest.
 */
const never = () => () => undefined;

export function WelcomeStrip({ known }: { known: boolean }) {
  // The server cannot tell a returning player from a new visitor. Until the
  // browser can, the strip holds its place empty, so a returning player is
  // never shown the newcomer's welcome for a moment first.
  const inBrowser = useSyncExternalStore(
    never,
    () => true,
    () => false,
  );
  const progress = useQuery({
    queryKey: keys.progress,
    queryFn: () => passiveApi.progress(),
    enabled: known,
    // No session, or progress is not available: the welcome line stands in.
    retry: (count, error) => !(error instanceof ApiError) && count < 1,
  });
  return (
    <WelcomeStripView
      state={
        !inBrowser
          ? 'pending'
          : !known || progress.isError
            ? 'new'
            : progress.isPending
              ? 'loading'
              : 'ready'
      }
      progress={progress.data}
    />
  );
}
