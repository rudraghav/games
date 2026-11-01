import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { mapRoom } from '@games/api-client/mappers';
import { gameById } from '@games/api-client/catalog';
import { fixtures } from '@/stories/generated/rooms';
import { turnState, pendingPlayerIds } from '@/games/shared/turn-state';
import { RoomResults } from '@/features/room/RoomResults';

const fixture = fixtures.find((item) => item.room.game_id === 'uno' && item.room.capacity === 2)!;
const room = mapRoom(fixture.room);
const [self, other] = room.game!.players.map((player) => player.id);

describe('Authoritative room presentation', () => {
  it('distinguishes a reaction from owning the ordinary turn', () => {
    const match = { ...room.game!, currentPlayer: other };
    expect(turnState(match, room, self).label).toBe('Your decision');
    expect(turnState({ ...match, actions: [] }, room, self).label).toContain('’s turn');
    expect(turnState({ ...match, currentPlayer: self }, room, self).label).toBe('Your turn');
  });
  it('treats simultaneous choices and already-locked choices honestly', () => {
    const match = {
      ...room.game!,
      currentPlayer: other,
      detail: { decision_mode: 'simultaneous', pending_players: [self, other] },
    };
    expect(turnState(match, room, self).label).toBe('Your decision');
    expect(pendingPlayerIds(match)).toEqual([self, other]);
    expect(
      turnState(
        { ...match, actions: [], detail: { ...match.detail, pending_players: [other] } },
        room,
        self,
      ).label,
    ).toBe('Your choice is locked');
    expect(turnState(match, { ...room, paused: true }, self).tone).toBe('paused');
  });
  it('shows a cooperative loss without inventing a draw and shows a team score once', () => {
    const game = { ...gameById('uno'), playMode: 'cooperative' as const, scoreLabel: 'Vaults' };
    const match = {
      ...room.game!,
      phase: 'finished',
      winners: [],
      players: room.game!.players.map((player) => ({ ...player, score: 1 })),
    };
    const html = renderToStaticMarkup(<RoomResults room={{ ...room, game: match }} game={game} />);
    expect(html).toContain('The team didn’t make it this time.');
    expect(html).not.toContain('draw');
    expect(html.match(/Vaults/g)).toHaveLength(1);
    expect(html.match(/role="listitem"/g)).toHaveLength(2);
  });
  it('orders penalty results low first without changing server winners', () => {
    const game = { ...gameById('uno'), scoreOrder: 'low' as const, scoreLabel: 'Penalty points' };
    const match = {
      ...room.game!,
      phase: 'finished',
      winners: [other],
      players: room.game!.players.map((player, i) => ({ ...player, score: i ? 4 : 20 })),
    };
    const html = renderToStaticMarkup(<RoomResults room={{ ...room, game: match }} game={game} />);
    expect(html.indexOf('4 penalty points')).toBeLessThan(html.indexOf('20 penalty points'));
    expect(html.match(/Lower score wins\./g)).toHaveLength(1);
    expect(html).toContain(', winner');
  });
  it('keeps result identities while hiding meaningless scores for no-score games', () => {
    const game = { ...gameById('uno'), scoreOrder: 'none' as const };
    const html = renderToStaticMarkup(
      <RoomResults
        room={{ ...room, game: { ...room.game!, phase: 'finished', winners: [self] } }}
        game={game}
      />,
    );
    expect(html.match(/role="listitem"/g)).toHaveLength(2);
    expect(html).not.toContain(' points');
  });
});
