import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { mapRoom } from '@games/api-client/mappers';
import { partyDetails } from '@games/api-client';
import { fixtures } from '@/stories/generated/rooms';
import { PartyTable } from '@/games/party/PartyTable';

describe('Party decisions and personalized projections', () => {
  it('renders minimum and maximum party tables with an explicit lock-in choice', () => {
    const partyFixtures = fixtures.filter((item) =>
      ['spill-or-chill', 'most-likely', 'hot-seat'].includes(item.room.game_id),
    );
    expect(partyFixtures).toHaveLength(6);
    for (const fixture of partyFixtures) {
      const room = mapRoom(fixture.room);
      const html = renderToStaticMarkup(
        <PartyTable
          room={room}
          match={room.game!}
          selfId={fixture.selfId}
          pending={false}
          onAction={() => undefined}
        />,
      );
      expect(html).toContain('aria-label="Your choice"');
      expect(html).toContain('Lock in my choice');
      expect(html).toContain('aria-pressed="false"');
      expect(html).toContain('Pass');
      expect(html).not.toContain('Fancy a toast?');
    }
  });

  it('shows a viewer’s private locked choice while keeping other decisions absent', () => {
    const fixture = fixtures.find((item) => item.room.game_id === 'hot-seat')!;
    const room = mapRoom(fixture.room);
    const match = room.game!;
    const locked = {
      ...match,
      actions: [],
      detail: { ...match.detail, submitted: [fixture.selfId], own_choice: 'a' },
    };
    const html = renderToStaticMarkup(
      <PartyTable
        room={room}
        match={locked}
        selfId={fixture.selfId}
        pending={false}
        onAction={() => undefined}
      />,
    );
    expect(html).toContain('You’re locked in. Waiting for your friends.');
    expect(html).toContain('Your choice: A');
    expect(html).not.toContain('Lock in my choice');
    expect(html).not.toContain('The answer was');
  });

  it('rejects malformed party result payloads before rendering', () => {
    const fixture = fixtures.find((item) => item.room.game_id === 'most-likely')!;
    expect(() =>
      partyDetails({
        ...fixture.room.game!.detail,
        result: { choices: {}, tallies: {}, answer: null, points: { fake: -1 } },
      }),
    ).toThrow();
    expect(() => partyDetails({ ...fixture.room.game!.detail, mode: 'commercial-deck' })).toThrow();
  });
});
