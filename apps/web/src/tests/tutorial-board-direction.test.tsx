import { expect, it } from 'vitest';
import { mapRoom } from '@games/api-client/mappers';
import { fixtures } from '@/stories/generated/rooms';
import { boardDirection } from '@/shared/tutorial/board-direction';

const saved = (game: string) =>
  mapRoom(fixtures.find((row) => row.room.game_id === game)!.room).game!;

it('names the exact flipped disc and playable square from the public Reversi preview', () => {
  const match = saved('reversi');
  const suggestion = boardDirection(match)!;
  expect(suggestion.option.label).toBe('Place at D3');
  expect(suggestion.tip).toContain('flip at D4');
  expect(boardDirection({ ...match, detail: {} })).toBeUndefined();
});

it('shows a compulsory jump and the exact checker it crosses', () => {
  const match = saved('checkers');
  const move = { ...match.actions[0], value: { ...match.actions[0].value, choice: '33:19' } };
  const suggestion = boardDirection({ ...match, actions: [move] })!;
  expect(suggestion.option).toBe(move);
  expect(suggestion.tip).toContain('Jump from B4 over C5 to D6');
});

it('recommends a projected extra turn and uses a capture only when offered', () => {
  const match = saved('mancala');
  const opening = boardDirection(match)!;
  expect(opening.option.value.choice).toBe('2');
  expect(opening.tip).toContain('another sow');
  const next = {
    ...match,
    detail: { previews: { '0': { landing: 2, captures: 5, extra_turn: false } } },
  };
  expect(boardDirection(next)?.tip).toContain('5 seeds in your store');
  expect(boardDirection({ ...next, actions: match.actions.slice(1) })).toBeUndefined();
});

it('surfaces a development only when the player can afford it', () => {
  const match = saved('gem-market');
  expect(boardDirection(match)).toBeUndefined();
  const card = match.community[0];
  const option = {
    ...match.actions[0],
    value: { ...match.actions[0].value, type: 'buy', card: card.id },
  };
  const suggestion = boardDirection({ ...match, actions: [...match.actions, option] })!;
  expect(suggestion.option).toBe(option);
  expect(suggestion.tip).toContain('Tier 1');
});
