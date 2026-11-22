import { z } from 'zod';
import type { components } from './generated/schema';

type Wire = components['schemas'];

/** The cosmetics the app can draw. An id outside these lists renders as the plain default. */
export const frameIds = [
  'frame-gold',
  'frame-laurel',
  'frame-flame',
  'frame-confetti',
  'frame-crown',
] as const;
export const cardBackIds = ['back-midnight', 'back-sunrise', 'back-emerald', 'back-royal'] as const;
export type FrameId = (typeof frameIds)[number];
export type CardBackId = (typeof cardBackIds)[number];

/**
 * A worn cosmetic id as the server sends it: a short slug, or nothing. It is
 * decoration only, so a value of the wrong shape reads as "nothing worn" rather
 * than failing the whole room or profile.
 */
export const cosmeticId = z
  .string()
  .regex(/^[a-z0-9-]{1,32}$/)
  .nullish()
  .catch(null);

const count = z.number().int().nonnegative();
const badgeGate = z.object({
  id: z.string().min(1).max(40),
  name: z.string().min(1).max(60),
  description: z.string().max(160),
  earned: z.boolean(),
  value: count,
  goal: z.number().int().positive(),
});
const rewardGate = z.object({
  id: z.string().min(1).max(40),
  kind: z.enum(['frame', 'card_back']),
  name: z.string().min(1).max(60),
  requirement: z.string().max(160),
  state: z.enum(['locked', 'available', 'redeemed']),
  equipped: z.boolean(),
  value: count,
  goal: z.number().int().positive(),
});
const progressGate = z
  .object({
    xp: count,
    level: z.number().int().positive(),
    level_xp: count,
    next_level_xp: z.number().int().positive(),
    streak: z.object({ current: count, best: count, played_today: z.boolean() }),
    totals: z.object({
      games: count,
      wins: count,
      different_games: count,
      with_friends: count,
    }),
    badges: z.array(badgeGate).max(40).default([]),
    rewards: z.array(rewardGate).max(40).default([]),
  })
  .refine(
    (progress) => progress.next_level_xp > progress.level_xp,
    'The next level must begin after this one.',
  );

/**
 * A player's own progress. Every number, name and requirement is the server's;
 * the client only shows them. `levelXp` and `nextLevelXp` are the XP totals at
 * which this level began and the next one begins.
 */
export function mapProgress(wire: Wire['ProgressView']) {
  const progress = progressGate.parse(wire);
  return {
    xp: progress.xp,
    level: progress.level,
    levelXp: progress.level_xp,
    nextLevelXp: progress.next_level_xp,
    streak: {
      current: progress.streak.current,
      best: progress.streak.best,
      playedToday: progress.streak.played_today,
    },
    totals: {
      games: progress.totals.games,
      wins: progress.totals.wins,
      differentGames: progress.totals.different_games,
      withFriends: progress.totals.with_friends,
    },
    badges: progress.badges.map((badge) => ({
      ...badge,
      // An earned badge is complete even if a count arrives short.
      value: Math.min(badge.value, badge.goal),
    })),
    rewards: progress.rewards.map((reward) => ({
      id: reward.id,
      kind: reward.kind,
      name: reward.name,
      requirement: reward.requirement,
      state: reward.state,
      // Only a redeemed reward can be worn.
      equipped: reward.state === 'redeemed' && reward.equipped,
      value: Math.min(reward.value, reward.goal),
      goal: reward.goal,
    })),
  };
}

export type Progress = ReturnType<typeof mapProgress>;
export type Badge = Progress['badges'][number];
export type Reward = Progress['rewards'][number];
export type RewardKind = Reward['kind'];
export type RewardState = Reward['state'];
