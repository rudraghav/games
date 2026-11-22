'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Flame } from 'lucide-react';
import { ApiError, type Progress, type Reward } from '@games/api-client';
import { Button, LevelRing } from '@games/ui';
import { api, passiveApi } from '@/lib/session';
import { SiteHeader } from '@/shared/SiteHeader';
import { keys } from '@/shared/query-keys';
import { rememberedPlayer } from '@/shared/player-preferences';
import {
  badgeCount,
  levelLabel,
  levelProgress,
  streakLine,
  wornCosmetics,
} from '@/shared/progress';
import { BadgeGrid } from './BadgeGrid';
import { RewardCoupon, type RewardAction } from './RewardCoupon';

/** How long the tear plays on a coupon that was just redeemed. */
const TEAR_MS = 700;

const groups: readonly { kind: Reward['kind']; title: string }[] = [
  { kind: 'frame', title: 'Avatar frames' },
  { kind: 'card_back', title: 'Card backs' },
];

/** What the live region says after each change. */
export function rewardNotice(action: RewardAction, reward: Pick<Reward, 'name' | 'kind'>) {
  if (action === 'redeem') return `${reward.name} redeemed. It’s yours to use.`;
  if (action === 'use') return `Now using the ${reward.name.toLocaleLowerCase()}.`;
  return reward.kind === 'frame' ? 'Frame taken off.' : 'Back to the standard card back.';
}

/** The three sections of the page, drawn from one progress reply. */
export function RewardsView({
  progress,
  player,
  busy,
  failure,
  justRedeemed,
  notice,
  onAction,
}: {
  progress: Progress;
  player: { name: string; avatar: number };
  busy?: { id: string; action: RewardAction } | null;
  failure?: { id: string; message: string } | null;
  justRedeemed?: string | null;
  notice?: string;
  onAction: (reward: Reward, action: RewardAction) => void;
}) {
  const level = levelProgress(progress);
  const streak = streakLine(progress.streak);
  const totals: [string, number][] = [
    ['Games played', progress.totals.games],
    ['Wins', progress.totals.wins],
    ['Different games', progress.totals.differentGames],
    ['With friends', progress.totals.withFriends],
  ];
  return (
    <>
      <section className="rewards-section" aria-labelledby="progress-heading">
        <h2 id="progress-heading" className="heading-md">
          Progress
        </h2>
        <div className="progress-card">
          <div className="progress-level">
            <LevelRing
              level={progress.level}
              fraction={level.fraction}
              size="lg"
              label={levelLabel(progress)}
            />
            <div className="progress-level-copy">
              <strong>Level {progress.level}</strong>
              <span>
                {level.earned} of {level.span} XP
              </span>
              <span className="muted">
                {level.remaining} XP to level {progress.level + 1} · {progress.xp} XP in all
              </span>
            </div>
          </div>
          <div className="progress-streak" data-active={Boolean(streak)}>
            <Flame size={22} aria-hidden="true" />
            <div>
              <strong>{streak ? streak.label : 'No streak yet'}</strong>
              <span>
                {streak?.hint ??
                  (streak ? 'You’ve played today.' : 'Play on two days in a row to start one.')}
              </span>
              {progress.streak.best > 0 ? (
                <span className="muted">
                  Best: {progress.streak.best} {progress.streak.best === 1 ? 'day' : 'days'}
                </span>
              ) : null}
            </div>
          </div>
          <dl className="progress-totals">
            {totals.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <section className="rewards-section" aria-labelledby="badges-heading">
        <div className="rewards-section-heading">
          <h2 id="badges-heading" className="heading-md">
            Badges
          </h2>
          <span className="small muted">{badgeCount(progress.badges)}</span>
        </div>
        <BadgeGrid badges={progress.badges} />
      </section>
      <section className="rewards-section" aria-labelledby="rewards-heading">
        <div className="rewards-section-heading">
          <h2 id="rewards-heading" className="heading-md">
            Rewards
          </h2>
          <span className="small muted">Earned by playing. Nothing here is for sale.</span>
        </div>
        <p className="small rewards-status" role="status">
          {notice}
        </p>
        {groups.map((group) => {
          const rewards = progress.rewards.filter((reward) => reward.kind === group.kind);
          if (!rewards.length) return null;
          const heading = `rewards-${group.kind}`;
          return (
            <section className="reward-group" key={group.kind} aria-labelledby={heading}>
              <h3 id={heading} className="heading-sm">
                {group.title}
              </h3>
              <ul className="reward-list">
                {rewards.map((reward) => (
                  <RewardCoupon
                    key={reward.id}
                    reward={reward}
                    player={player}
                    busy={busy?.id === reward.id ? busy.action : null}
                    disabled={Boolean(busy)}
                    error={failure?.id === reward.id ? failure.message : undefined}
                    justRedeemed={justRedeemed === reward.id}
                    onAction={(action) => onAction(reward, action)}
                  />
                ))}
              </ul>
            </section>
          );
        })}
      </section>
    </>
  );
}

export function RewardsScreen() {
  const cache = useQueryClient();
  // Reading never creates a guest: without a player the page explains how to start.
  const progress = useQuery({
    queryKey: keys.progress,
    queryFn: () => passiveApi.progress(),
    retry: (count, error) => !(error instanceof ApiError) && count < 2,
  });
  const me = useQuery({
    queryKey: keys.me,
    queryFn: () => passiveApi.me(),
    enabled: progress.isSuccess,
  });
  const [busy, setBusy] = useState<{ id: string; action: RewardAction } | null>(null);
  const [failure, setFailure] = useState<{ id: string; message: string } | null>(null);
  const [notice, setNotice] = useState('');
  const [justRedeemed, setJustRedeemed] = useState<string | null>(null);
  const tear = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(tear.current), []);
  const player = me.data?.profile ?? rememberedPlayer() ?? { name: 'You', avatar: 0 };

  async function act(reward: Reward, action: RewardAction) {
    const current = progress.data;
    if (!current || busy) return;
    setBusy({ id: reward.id, action });
    setFailure(null);
    setNotice('');
    try {
      const worn = wornCosmetics(current);
      const next =
        action === 'redeem'
          ? await api.redeemReward(reward.id)
          : await api.wearCosmetics({
              ...worn,
              [reward.kind === 'frame' ? 'frame' : 'cardBack']: action === 'use' ? reward.id : null,
            });
      await cache.cancelQueries({ queryKey: keys.progress, exact: true });
      cache.setQueryData<Progress>(keys.progress, next);
      // The profile carries what is worn into rooms and onto the profile page.
      if (action !== 'redeem') void cache.invalidateQueries({ queryKey: keys.me, exact: true });
      setNotice(rewardNotice(action, reward));
      if (action === 'redeem') {
        setJustRedeemed(reward.id);
        window.clearTimeout(tear.current);
        tear.current = window.setTimeout(() => setJustRedeemed(null), TEAR_MS);
      }
    } catch (error) {
      // The server's own sentence, for example why a reward is still locked.
      setFailure({
        id: reward.id,
        message: error instanceof Error ? error.message : 'Please try again.',
      });
      void cache.invalidateQueries({ queryKey: keys.progress, exact: true });
    } finally {
      setBusy(null);
    }
  }

  const refused = progress.error instanceof ApiError && progress.error.status < 500;
  return (
    <>
      <SiteHeader />
      <main className="rewards-page page-width">
        <div className="profile-intro">
          <p className="eyebrow">Your progress</p>
          <h1 className="hero-title">Progress and rewards</h1>
          <p className="muted">
            Play games to level up, earn badges and unlock avatar frames and card backs.
          </p>
        </div>
        {progress.isPending ? (
          <div className="rewards-loading" role="status">
            Loading your progress…
          </div>
        ) : progress.isError ? (
          refused ? (
            <div className="rewards-empty">
              <h2 className="heading-md">Play a game to get started</h2>
              <p className="muted">
                Your level, badges and rewards appear here after your first finished game.
              </p>
              <Link href="/" className="button button--primary button--md">
                Choose a game
              </Link>
            </div>
          ) : (
            <div className="rewards-empty" role="alert">
              <h2 className="heading-md">Your progress didn’t load</h2>
              <p className="muted">Check your connection and try again.</p>
              <Button
                variant="secondary"
                pending={progress.isFetching}
                onClick={() => void progress.refetch()}
              >
                Try again
              </Button>
            </div>
          )
        ) : (
          <RewardsView
            progress={progress.data}
            player={player}
            busy={busy}
            failure={failure}
            justRedeemed={justRedeemed}
            notice={notice}
            onAction={(reward, action) => void act(reward, action)}
          />
        )}
      </main>
    </>
  );
}
