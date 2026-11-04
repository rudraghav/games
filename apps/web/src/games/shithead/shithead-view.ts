import type { Card, shitheadDetails } from '@games/api-client';

type Details = ReturnType<typeof shitheadDetails>;
type LastPlay = Details['last_play'];

/** Plain-language stages for opponent summaries. */
export const stageNames: Record<Details['stages'][string], string> = {
  setup: 'choosing face-up cards',
  hand: 'playing from hand',
  face_up: 'on face-up cards',
  face_down: 'on hidden cards',
  out: 'escaped',
};

export function finishPlace(index: number) {
  if (index < 0) return '';
  const place = index + 1;
  const suffix =
    place % 100 >= 11 && place % 100 <= 13
      ? 'th'
      : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[place % 10] || 'th';
  return `${place}${suffix}`;
}

/** What the next card must do, from the public comparison rank and house rules. */
export function requirement(data: Pick<Details, 'comparison_rank' | 'low_required' | 'settings'>) {
  const specials = data.settings.transparent_three ? 'a 2, 3 or 10' : 'a 2 or 10';
  if (!data.comparison_rank || data.comparison_rank === '2')
    return { label: 'Any rank', short: 'the pile', text: 'any card' };
  if (data.low_required)
    return {
      label: 'Seven or lower',
      short: 'the 7',
      text: `a 7 or lower, or ${specials}`,
    };
  return {
    label: `Match or beat ${data.comparison_rank}`,
    short: data.comparison_rank,
    text: `${data.comparison_rank} or higher, or ${specials}`,
  };
}

/** Equal ranks on top of the public pile: four in a row burn it. */
export function topRun(community: Card[], top: Card | null | undefined) {
  if (!top) return [];
  const run: Card[] = [];
  for (let index = community.length - 1; index >= 0; index--) {
    if (community[index].value !== top.value) break;
    run.unshift(community[index]);
  }
  return run.length ? run : [top];
}

/** Why the pile last changed, attributed to the player who changed it. */
export function pileEvent(
  last: LastPlay,
  name: (id: string) => string,
  currentPlayer: string | null,
) {
  if (!last) return null;
  const who = name(last.player);
  if (last.type === 'burn') {
    const card = last.cards?.[0];
    const reason = card?.value === '10' ? 'a 10' : card ? `four ${card.value}s in a row` : 'a burn';
    const again =
      currentPlayer === last.player ? ` ${who === 'You' ? 'You play' : `${who} plays`} again.` : '';
    return `${who} burned ${last.burned ?? 0} cards with ${reason}.${again}`;
  }
  if (last.type === 'failed_flip')
    return `${who} flipped ${last.card?.label ?? 'a hidden card'}, which couldn’t beat the pile, and took ${last.count} cards.`;
  if (last.type === 'pickup') return `${who} took the pile: ${last.count} cards.`;
  return null;
}
