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
  it('names the turn owner and the responder during a response window', () => {
    const response = {
      ...room.game!,
      detail: { pending_action: { actor: other, responder: self, stage: 'counter' } },
    };
    expect(turnState({ ...response, currentPlayer: self }, room, self).label).toBe('Your response');
    const actorView = turnState({ ...response, currentPlayer: self, actions: [] }, room, other);
    expect(actorView.label).toBe('Your turn');
    expect(actorView.message).toMatch(/^Waiting for .+ to respond\.$/);
    const paying = {
      ...response,
      currentPlayer: self,
      detail: { pending_action: { actor: other, responder: self, stage: 'payment' } },
    };
    expect(turnState(paying, room, self).label).toBe('You owe a payment');
  });
  it('tells waiting seats who they are waiting for instead of the actor’s instruction', () => {
    const waiting = { ...room.game!, currentPlayer: other, actions: [], message: 'Draw 8 cards.' };
    const state = turnState(waiting, room, self);
    expect(state.message).not.toContain('Draw 8');
    expect(state.message).toMatch(/^Waiting for /);
    const locked = {
      ...room.game!,
      actions: [],
      detail: { decision_mode: 'simultaneous', pending_players: [other] },
    };
    expect(turnState(locked, room, self).message).toMatch(/^Waiting for .+\.$/);
  });
  it('names the guessing team in Word Agents instead of its first operative', () => {
    const words = { ...room, gameId: 'word-agents' };
    const guess = {
      ...room.game!,
      phase: 'guess',
      currentPlayer: self,
      message: 'Guess a word for MAP 2.',
      detail: { teams: { [self]: 0, [other]: 1 }, active_team: 0, spymasters: [] },
    };
    expect(turnState(guess, words, self)).toMatchObject({
      label: 'Your team’s turn',
      tone: 'active',
    });
    expect(turnState(guess, words, other)).toMatchObject({
      label: 'Red team’s turn',
      message: 'Waiting for Red operatives to guess.',
    });
  });
  it('tells an eliminated seat it is out instead of waiting for a turn', () => {
    const out = {
      ...room.game!,
      currentPlayer: other,
      actions: [],
      players: room.game!.players.map((player) => ({ ...player, eliminated: player.id === self })),
    };
    expect(turnState(out, room, self)).toMatchObject({ label: 'You’re out', tone: 'waiting' });
    expect(turnState(out, room, other).label).toBe('Your turn');
  });
  it('ranks No Mercy eliminations below the players still in, last out first', () => {
    const finished = {
      ...room.game!,
      phase: 'finished',
      winners: [other],
      detail: { out: [{ player: self, cards: 29 }] },
    };
    const html = renderToStaticMarkup(
      <RoomResults room={{ ...room, status: 'finished', game: finished }} game={gameById('uno')} />,
    );
    expect(html).toContain('Out 1st · 29 cards');
    expect(html.indexOf('Out 1st')).toBeGreaterThan(html.indexOf('data-winner="true"'));
  });
  it('announces the winner from the viewer’s seat when the match ends', () => {
    const finished = { ...room.game!, phase: 'finished', winners: [self] };
    expect(turnState(finished, room, self).label).toBe('You win!');
    expect(turnState(finished, room, other).label).toMatch(/ wins$/);
    expect(turnState({ ...finished, winners: [], detail: { draw: true } }, room, self).label).toBe(
      'It’s a draw',
    );
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
    expect(html.match(/Vaults?\b/g)).toHaveLength(1);
    expect(html).toContain('1</strong> Vault<');
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
