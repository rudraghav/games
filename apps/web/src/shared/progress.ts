import type { Progress } from '@games/api-client';

/** How far through the current level a player is. All values are whole XP. */
export function levelProgress(progress: Pick<Progress, 'xp' | 'levelXp' | 'nextLevelXp'>) {
  // The level spans [levelXp, nextLevelXp). A reply that breaks that is shown as an empty ring.
  const span = Math.max(1, progress.nextLevelXp - progress.levelXp);
  const earned = Math.min(span, Math.max(0, progress.xp - progress.levelXp));
  return {
    /** XP earned inside this level. */
    earned,
    /** XP this level takes from start to finish. */
    span,
    /** XP still needed for the next level. */
    remaining: span - earned,
    /** 0 to 1, for the ring and the bar. */
    fraction: earned / span,
  };
}

/** "Level 3, 40 of 150 XP toward level 4": what the ring says to a screen reader. */
export function levelLabel(progress: Pick<Progress, 'xp' | 'level' | 'levelXp' | 'nextLevelXp'>) {
  const { earned, span } = levelProgress(progress);
  return `Level ${progress.level}, ${earned} of ${span} XP toward level ${progress.level + 1}`;
}

/**
 * The streak in words, or nothing when there is no streak to show. A streak is
 * only ever described as it stands: there is no wording for one that ended.
 * The nudge appears only while a streak exists and today has no game yet.
 */
export function streakLine(streak: Progress['streak']) {
  if (streak.current < 1) return null;
  return {
    label: `${streak.current}-day streak`,
    hint: streak.playedToday ? null : 'Play today to keep it going',
  };
}

/** "3 of 14 badges". */
export function badgeCount(badges: Progress['badges']) {
  return `${badges.filter((badge) => badge.earned).length} of ${badges.length} badges`;
}

/** Someone with no finished game sees a welcome, not a row of zeroes. */
export function hasPlayedAGame(progress: Progress | null | undefined): progress is Progress {
  return Boolean(progress && progress.totals.games > 0);
}

/** The cosmetics a player has on, read from their own rewards. */
export function wornCosmetics(progress: Pick<Progress, 'rewards'>) {
  const worn = (kind: 'frame' | 'card_back') =>
    progress.rewards.find((reward) => reward.kind === kind && reward.equipped)?.id ?? null;
  return { frame: worn('frame'), cardBack: worn('card_back') };
}
