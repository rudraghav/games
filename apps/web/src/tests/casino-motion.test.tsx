import { describe, expect, it } from 'vitest';
import { mapRoom } from '@games/api-client/mappers';
import { fixtures } from '@/stories/generated/rooms';
import {
  casinoSnapshot,
  casinoTransition,
  casinoActionLabel,
  type CasinoSnapshot,
} from '@/games/casino/casino-transitions';

function snapshot(): CasinoSnapshot {
  const fixture = fixtures.find((item) => item.room.game_id === 'holdem')!;
  const room = mapRoom(fixture.room);
  return casinoSnapshot(room, room.game!, fixture.selfId);
}
function next(before: CasinoSnapshot, patch: Partial<CasinoSnapshot> = {}): CasinoSnapshot {
  return { ...structuredClone(before), version: before.version + 1, ...patch };
}
describe('Authoritative casino transition reconciliation', () => {
  it('never replays duplicates, old snapshots, resync jumps or a different match', () => {
    const before = snapshot();
    for (const after of [
      before,
      next(before, { version: before.version - 1 }),
      next(before, { version: before.version + 2 }),
      next(before, { matchId: 'another-match' }),
    ])
      expect(casinoTransition(before, after)).toBeNull();
  });
  it('keeps paused and resumed baseline changes static', () => {
    const before = snapshot();
    expect(casinoTransition(before, next(before, { paused: true }))).toBeNull();
    expect(casinoTransition({ ...before, paused: true }, next(before))).toBeNull();
  });
  it('uses exact receipt payment amounts without treating a raise target as paid chips', () => {
    const before = snapshot(),
      actor = before.players[0].id;
    const event = casinoTransition(
      before,
      next(before, {
        action: { actorId: actor, type: 'raise', amount: 8, version: before.version + 1 },
      }),
    );
    expect(event?.transfers).toEqual([{ playerId: actor, amount: 8, direction: 'bet' }]);
    expect(event?.action?.type).toBe('raise');
  });
  it('can show a check cue without inventing chip movement', () => {
    const before = snapshot(),
      actor = before.players[0].id;
    const event = casinoTransition(
      before,
      next(before, {
        currentPlayer: before.players[1].id,
        action: { actorId: actor, type: 'check', amount: null, version: before.version + 1 },
      }),
    );
    expect(event?.transfers).toEqual([]);
    expect(event?.turnChanged).toBe(true);
    expect(casinoActionLabel('holdem', event!.action!.type)).toBe('Check');
  });
  it('does not infer check/call text when a legacy snapshot has no public receipt', () => {
    const before = snapshot();
    const players = structuredClone(before.players);
    players[0].chips -= 4;
    const event = casinoTransition(before, next(before, { players, action: null }));
    expect(event?.transfers).toEqual([{ playerId: players[0].id, amount: 4, direction: 'bet' }]);
    expect(event?.action).toBeNull();
  });
  it('reconciles same-action payment and payout against visible authoritative chip changes', () => {
    const before = snapshot(),
      actor = before.players[0].id;
    const players = structuredClone(before.players);
    players[0].chips += 12;
    const event = casinoTransition(
      before,
      next(before, {
        phase: 'finished',
        players,
        action: { actorId: actor, type: 'call', amount: 4, version: before.version + 1 },
      }),
    );
    expect(event?.transfers).toEqual([
      { playerId: actor, amount: 4, direction: 'bet' },
      { playerId: actor, amount: 16, direction: 'payout' },
    ]);
  });
  it('reveals only newly permitted identities and never gives hidden backs a rank', () => {
    const before = snapshot();
    before.cards = { community: ['AS:0', 'dealer-hidden'], 'seat-other': ['hidden-0', 'hidden-1'] };
    const after = next(before, {
      cards: { community: ['AS:0', 'KH:0'], 'seat-other': ['hidden-0', 'hidden-1'] },
    });
    expect(casinoTransition(before, after)?.newCards).toEqual(['community:1:KH:0']);
  });
  it('moves already-known split cards without pretending they were newly dealt', () => {
    const before = snapshot();
    before.cards = { 'own-0': ['8S:0', '8H:0'] };
    const after = next(before, { cards: { 'own-0': ['8S:0', '3C:0'], 'own-1': ['8H:0', '7D:0'] } });
    expect(casinoTransition(before, after)?.newCards).toEqual(['own-0:1:3C:0', 'own-1:1:7D:0']);
  });
  it('preserves its input snapshots and accepts no opponent hand parameter', () => {
    const before = snapshot(),
      after = next(before);
    const saved = structuredClone({ before, after });
    casinoTransition(before, after);
    expect({ before, after }).toEqual(saved);
    expect(Object.keys(before).sort()).toEqual(
      [
        'action',
        'cards',
        'currentPlayer',
        'matchId',
        'paused',
        'phase',
        'players',
        'pot',
        'version',
      ].sort(),
    );
  });
});
