import { expect, it } from 'vitest';
import { mapRoom } from '@games/api-client/mappers';
import type { Match } from '@games/api-client';
import { midgameScenarios } from '@/stories/generated/midgame-scenarios';
import { blackjackHitBustChance } from '@/games/casino/blackjack-hit-odds';

const fixture = (id: string) =>
  mapRoom(midgameScenarios.find((item) => item.id === id)!.room).game!;
const value = (rank: string) =>
  rank === 'A' ? 1 : ['K', 'Q', 'J'].includes(rank) ? 10 : Number(rank);

// Independently deal every permitted pair of physical cards from the unseen six-deck shoe.
function enumerate(match: Match) {
  const unseen = Array.from({ length: 24 }, () => 'A 2 3 4 5 6 7 8 9 10 J Q K'.split(' ')).flat();
  for (const card of [...match.community, ...match.players.flatMap((seat) => seat.cards)])
    unseen.splice(unseen.indexOf(card!.value), 1);
  const up = value(match.community[0].value);
  const minimum = match.hand.reduce((sum, card) => sum + value(card.value), 0);
  let deals = 0,
    busts = 0;
  for (let hole = 0; hole < unseen.length; hole++) {
    if (up + value(unseen[hole]) === 11 && (up === 1 || up === 10)) continue;
    for (let next = 0; next < unseen.length; next++) {
      if (next === hole) continue;
      deals++;
      if (minimum + value(unseen[next]) > 21) busts++;
    }
  }
  return busts / deals;
}

it.each(['A', 'K', '8'])('matches all permitted hole/hit pairs with %s showing', (upcard) => {
  const match = fixture('blackjack-7-31-8');
  match.community[0] = { ...match.community[0], value: upcard };
  expect(blackjackHitBustChance(match)).toBe(enumerate(match));
});

it('treats a soft hand as safe for one hit and prices a later hard hand with a spent ace', () => {
  expect(blackjackHitBustChance(fixture('blackjack-1-17-2'))).toBe(0);
  const hard = fixture('blackjack-1-11-5-crowded');
  expect(blackjackHitBustChance(hard)).toBe(enumerate(hard));
  expect(blackjackHitBustChance(hard)).toBeGreaterThan(0);
});

it('omits the preview when the reader cannot hit or the visible shoe is incomplete', () => {
  const match = fixture('blackjack-7-31-8');
  expect(blackjackHitBustChance({ ...match, actions: [] })).toBeNull();
  expect(blackjackHitBustChance({ ...match, drawCount: 0 })).toBeNull();
  match.players[0].cards[0] = null;
  expect(blackjackHitBustChance(match)).toBeNull();
});
