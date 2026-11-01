import { describe, expect, it } from 'vitest';
import { mapCard, mapRoom } from '@games/api-client/mappers';
import { sixNimmtDetails, blackjackDetails, paperDetails, trioDetails } from '@games/api-client';
import { games } from '@games/api-client/catalog';
import { fixtures } from '@/stories/generated/rooms';
import { findGames } from '@/features/lounge/catalogue-search';
import { isBackendRoute } from '@/lib/backend-routes';
import type { components } from '@games/api-client/wire';

describe('Bot identity, discovery and proxy boundaries', () => {
  it('normalizes legacy and illustrated card metadata equally in every nested card boundary', () => {
    const base = {
      id: 'public-card',
      label: 'Public card',
      value: '4M',
      suit: 'property',
      color: 'green',
      subtitle: 'Wild property',
    };
    const detail = (game: string) =>
      structuredClone(fixtures.find((f) => f.room.game_id === game)!.room.game!.detail);
    for (const card of [base, { ...base, colors: ['green', 'rail'], effect: 'rent' }]) {
      const expected = mapCard(card);
      const six = detail('six-nimmt');
      (six.rows as unknown[][])[0][0] = card;
      expect(sixNimmtDetails(six).rows[0][0]).toEqual(expected);
      const blackjack = {
        ...detail('blackjack'),
        hands: [{ cards: [card], bet: 10 }],
        hand_index: 0,
      };
      expect(blackjackDetails(blackjack).hands[0].cards[0]).toEqual(expected);
      const paper = { ...detail('sea-salt-paper'), discard_tops: [card, null] };
      expect(paperDetails(paper).discard_tops[0]).toEqual(expected);
      const trio = { ...detail('trio'), revealed: [{ owner: 'table', slot: 0, card }] };
      expect(trioDetails(trio).revealed[0].card).toEqual(expected);
    }
  });
  it('accepts synthetic seats only when marked as bots and keeps ownership human', () => {
    const fixture = fixtures.find((f) => f.room.game_id === 'uno' && f.room.capacity === 2)!;
    const wire: components['schemas']['RoomView'] = structuredClone(fixture.room);
    const botId = 'bot:' + 'a'.repeat(32);
    wire.members[1] = { ...wire.members[1], id: botId, is_bot: true };
    expect(mapRoom(wire).members[1].isBot).toBe(true);
    expect(() =>
      mapRoom({ ...wire, members: [wire.members[0], { ...wire.members[1], is_bot: false }] }),
    ).toThrow();
    expect(() =>
      mapRoom({ ...wire, members: [{ ...wire.members[0], is_bot: true }, wire.members[1]] }),
    ).toThrow();
    expect(() => mapRoom({ ...wire, owner_id: botId })).toThrow();
  });
  it('allows exactly the versioned bot routes and seat removal methods', () => {
    const base = 'v1/rooms/11111111-1111-4111-8111-111111111111';
    expect(isBackendRoute(base + '/bots', 'POST')).toBe(true);
    expect(isBackendRoute(base + '/bots/drive', 'POST')).toBe(true);
    expect(isBackendRoute(base + '/members/bot:' + 'a'.repeat(32), 'DELETE')).toBe(true);
    for (const [path, method] of [
      [base + '/bots/drive', 'GET'],
      [base + '/bots/admin', 'POST'],
      [base + '/members/bot:bad', 'DELETE'],
      [base + '/members/bot:' + 'a'.repeat(32), 'POST'],
      ['health', 'GET'],
    ])
      expect(isBackendRoute(path, method)).toBe(false);
  });
  it('finds typos without relaxing group/category filters and makes solo bots discoverable', () => {
    expect(findGames(games, 'monoply', 2, 'cards').map((g) => g.id)).toContain('deal');
    expect(findGames(games, 'monoply', 2, 'boards')).toEqual([]);
    expect(findGames(games, 'not-a-real-game-zxq', 0, 'all')).toEqual([]);
    expect(findGames(games, '', 1, 'solo')).toHaveLength(games.length);
    expect(games.filter((g) => g.botsSupported)).toHaveLength(games.length - 1);
    expect(games.find((g) => g.id === 'tarot')?.botsSupported).toBe(false);
  });
});
