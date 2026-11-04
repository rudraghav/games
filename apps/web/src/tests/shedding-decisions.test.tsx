import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { sheddingDetails } from '@games/api-client';
import { mapRoom } from '@games/api-client/mappers';
import { CardTable } from '@/games/shared/CardTable';
import { fixtures } from '@/stories/generated/rooms';

it('explains roulette as a draw choice, displays direction, and rejects a hidden challenge answer', () => {
  // Direction only matters with three or more players still in.
  const fixture = fixtures.find(
    (item) => item.room.game_id === 'uno-no-mercy' && item.room.capacity > 2,
  )!;
  const room = mapRoom(fixture.room);
  const match = {
    ...room.game!,
    detail: {
      color: 'red',
      penalty: 0,
      direction: -1,
      pending_kind: 'roulette',
      next_player: room.members[1].id,
      elimination_limit: 25,
      illegal: true,
    },
    actions: [
      {
        label: 'Choose blue',
        value: {
          type: 'choose',
          color: 'blue',
          card: '',
          target: '',
          choice: '',
          amount: 0,
          slot: 0,
          cards: [],
          groups: [],
        },
        input: null,
        eligibleCards: [],
        minimum: null,
        maximum: null,
        step: 1,
      },
    ],
  };
  const data = sheddingDetails(match.detail);
  expect(data).not.toHaveProperty('illegal');
  const html = renderToStaticMarkup(
    <CardTable
      room={room}
      match={match}
      selfId={fixture.selfId}
      pending={false}
      onAction={() => undefined}
    />,
  );
  expect(html).toContain('Choose the colour you will draw until.');
  expect(html).toContain('Wild cards do not stop the draw.');
  expect(html).toContain('At 25 cards you are out.');
  expect(html).toContain('Counterclockwise');
  expect(html).toContain(`Next: ${room.members[1].name}`);
  expect(html).not.toContain('Choose the colour for the next play.');
  expect(() =>
    sheddingDetails({ ...match.detail, pending_kind: 'private_internal_phase' }),
  ).toThrow();
});
