import type { Action, ActionOption, Card } from '@games/api-client';

/** How a rank reads in a sentence: "as 7s", "as Queens". */
const RANK_WORDS: Record<string, string> = {
  A: 'Aces',
  J: 'Jacks',
  Q: 'Queens',
  K: 'Kings',
};
export function rankPlural(rank: string) {
  return RANK_WORDS[rank] ?? `${rank}s`;
}
/** The rank as a word for a screen reader ("Tens", "Queens"). */
const RANK_NAMES: Record<string, string> = {
  A: 'Aces',
  '2': 'Twos',
  '3': 'Threes',
  '4': 'Fours',
  '5': 'Fives',
  '6': 'Sixes',
  '7': 'Sevens',
  '8': 'Eights',
  '9': 'Nines',
  '10': 'Tens',
  J: 'Jacks',
  Q: 'Queens',
  K: 'Kings',
};
export const rankName = (rank: string) => RANK_NAMES[rank] ?? rank;

export const cards = (count: number) => `${count} ${count === 1 ? 'card' : 'cards'}`;

/** The cards a play may hold at most: the option's own limit, never more than four. */
export function playLimit(options: ActionOption[]) {
  const plays = options.filter((option) => option.value.type === 'play');
  if (!plays.length) return 0;
  return Math.min(4, ...plays.map((option) => option.maximum ?? 4));
}

/**
 * Add or remove one card from the selection. A fifth card (or one past the
 * option's limit) is refused and reported, so the player knows why it did not lift.
 */
export function toggleCard(selected: string[], id: string, limit: number) {
  if (selected.includes(id)) return { cards: selected.filter((item) => item !== id), full: false };
  if (selected.length >= limit) return { cards: selected, full: true };
  return { cards: [...selected, id], full: false };
}

/** A starter's default declaration: the rank of the chosen cards when they all share one. */
export function suggestedRank(hand: Card[], selected: string[]) {
  const values = new Set(
    selected.map((id) => hand.find((card) => card.id === id)?.value).filter(Boolean),
  );
  return values.size === 1 ? ([...values][0] as string) : null;
}

/**
 * The `play` option for this declaration. A starter has one option per rank;
 * a follower has exactly one, already set to the round's rank.
 */
export function playOption(options: ActionOption[], rank: string | null) {
  const plays = options.filter((option) => option.value.type === 'play');
  if (plays.length === 1) return plays[0];
  return rank ? (plays.find((option) => option.value.choice === rank) ?? null) : null;
}

/** The action to send: the offered option with the chosen card ids, or null when incomplete. */
export function playAction(
  options: ActionOption[],
  rank: string | null,
  selected: string[],
): Action | null {
  const option = playOption(options, rank);
  if (!option) return null;
  const minimum = option.minimum ?? 1;
  const maximum = Math.min(4, option.maximum ?? 4);
  if (selected.length < minimum || selected.length > maximum) return null;
  if (option.eligibleCards.length && selected.some((id) => !option.eligibleCards.includes(id)))
    return null;
  return { ...option.value, cards: selected };
}

/** "Ada played 3 cards as 7s" / "You played 1 card as Queens". */
export function playLine(name: string, count: number, rank: string | null) {
  return `${name} played ${cards(count)}${rank ? ` as ${rankPlural(rank)}` : ''}`;
}

export interface Decision {
  key: 'continue' | 'play' | 'skip' | 'call_bluff';
  label: string;
  /** Exactly one decision in a view is filled. */
  variant: 'primary' | 'secondary';
  /** Null while the play is incomplete (no cards, or no declared rank). */
  action: Action | null;
}

/**
 * The dock's commit buttons for this projection and the unsent choice. Every
 * action is one the server offered; a play only adds the chosen card ids.
 */
export function decisions(
  options: ActionOption[],
  rank: string | null,
  selected: string[],
): Decision[] {
  const list: Decision[] = [];
  const find = (type: string) => options.find((option) => option.value.type === type);
  const proceed = find('continue');
  if (proceed)
    list.push({ key: 'continue', label: proceed.label, variant: 'primary', action: proceed.value });
  if (options.some((option) => option.value.type === 'play'))
    list.push({
      key: 'play',
      label: `Play${selected.length ? ` ${selected.length}` : ''}${rank ? ` as ${rankPlural(rank)}` : ''}`,
      variant: 'primary',
      action: playAction(options, rank, selected),
    });
  const pass = find('skip');
  if (pass) list.push({ key: 'skip', label: pass.label, variant: 'secondary', action: pass.value });
  const call = find('call_bluff');
  if (call)
    list.push({ key: 'call_bluff', label: call.label, variant: 'secondary', action: call.value });
  // A view without a play or a continue still fills its first choice.
  if (list.length && !list.some((item) => item.variant === 'primary')) list[0].variant = 'primary';
  return list;
}
