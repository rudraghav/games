import { describe, expect, it } from 'vitest';
import type { ActionOption } from '@games/api-client';
import { mapRoom } from '@games/api-client/mappers';
import { fixtures } from '@/stories/generated/rooms';
import { describeMove } from '@/features/room/move-description';
import { cardPracticeHint, cardPracticeMove } from '@/shared/tutorial/card-hint';

const roomFor = (id: string) => mapRoom(fixtures.find((f) => f.room.game_id === id)!.room);
const option = (type: string, card = ''): ActionOption => ({
  ...roomFor('uno').game!.actions[0],
  value: { ...roomFor('uno').game!.actions[0].value, type, card },
  label: type,
});

describe('card tutorial guidance follows the visible decision', () => {
  it('distinguishes accepting a stacked draw penalty from drawing until playable', () => {
    const room = roomFor('uno-no-mercy');
    const match = room.game!;
    match.detail = { ...match.detail, penalty: 16 };
    expect(cardPracticeHint(match, option('draw'), room, room.ownerId)).toContain(
      '16-card penalty',
    );
    expect(cardPracticeHint(match, option('draw'), room, room.ownerId)).not.toContain('playable');
    match.detail = { ...match.detail, penalty: 0, pending_kind: 'roulette' };
    expect(cardPracticeHint(match, option('draw'), room, room.ownerId)).toContain('Draw until');
    const classic = roomFor('uno');
    classic.game!.detail = { ...classic.game!.detail, penalty: 0 };
    expect(cardPracticeHint(classic.game!, option('draw'), classic, classic.ownerId)).toBe(
      'Draw one card. If it fits, you can play that card immediately or pass.',
    );
    expect(cardPracticeHint(match, option('choose'), room, room.ownerId)).toContain('draw until');
    match.detail = { ...match.detail, pending_kind: 'opening_color' };
    expect(cardPracticeHint(match, option('choose'), room, room.ownerId)).toContain(
      'opening colour',
    );
  });
  it('describes only the chosen discard as taken when a second public face was exposed', () => {
    const room = roomFor('rummy');
    const game = room.game!;
    const [first, next] = game.hand;
    const move = {
      type: 'draw_discard',
      actorId: room.ownerId,
      version: 3,
      label: 'Took the discard',
      targets: [],
      amount: null,
      count: null,
      destination: null,
      cards: [first, next],
    };
    expect(describeMove(room, move, room.ownerId)).toBe(
      `You took the discard: ${first.label} · Also revealed: ${next.label}`,
    );
    expect(describeMove(room, { ...move, cards: [first] }, room.ownerId)).toBe(
      `You took the discard: ${first.label}`,
    );
  });
  it('identifies the exact Skyjo square and drawn face using the same grid coordinates as the table', () => {
    const room = roomFor('skyjo');
    const match = room.game!;
    const swap = option('swap');
    swap.value.slot = 6;
    expect(cardPracticeHint(match, swap, room, room.ownerId)).toContain('row 2, column 3');
  });
  it('uses the lowest projected loss and offers a winning declaration as soon as one is possible', () => {
    const room = roomFor('rummy');
    const match = room.game!;
    match.phase = 'discard';
    const first = option('discard', 'A');
    const second = option('discard', 'B');
    const winning = option('declare', 'B');
    match.actions = [first, second, winning];
    const analysis = {
      valid: false,
      deadwood: 14,
      raw_points: 14,
      scoring_gate: false,
      melds: [],
      unmatched: [],
      sequence_count: 0,
      pure_sequence_count: 0,
    };
    match.detail = {
      ...match.detail,
      discard_analyses: { A: analysis, B: { ...analysis, deadwood: 2 } },
    };
    expect(cardPracticeMove(match)).toBe(second);
    expect(cardPracticeHint(match, second, room, room.ownerId)).toContain('2 loss points');
    match.detail = {
      ...match.detail,
      discard_analyses: { A: analysis, B: { ...analysis, deadwood: 0, valid: true } },
    };
    expect(cardPracticeMove(match)).toBe(winning);
  });
});
