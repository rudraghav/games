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
    expect(html).toContain('You’re locked in.');
    // Locked-in viewers see exactly whom the room is waiting for.
    expect(html).toMatch(/1 of \d+ locked in · waiting for /);
    expect(html).toContain('Your choice: A');
    expect(html).not.toContain('Lock in my choice');
    expect(html).not.toContain('chose A');
  });

  it('leads a Most Likely reveal with the result and labels votes cast and received', () => {
    const fixture = fixtures.find((item) => item.room.game_id === 'most-likely')!;
    const room = mapRoom(fixture.room);
    const match = room.game!;
    const [a, b, c] = match.players.map((player) => player.id);
    const html = renderToStaticMarkup(
      <PartyTable
        room={room}
        match={{
          ...match,
          phase: 'reveal',
          actions: [],
          detail: {
            ...match.detail,
            submitted: [a, b, c],
            result: {
              choices: { [a]: b, [b]: a, [c]: a },
              tallies: { [a]: 2, [b]: 1, [c]: 0 },
              answer: null,
              points: { [a]: 1, [b]: 0, [c]: 0 },
            },
          },
        }}
        selfId={c}
        pending={false}
        onAction={() => undefined}
      />,
    );
    const name = (id: string) => room.members.find((member) => member.id === id)!.name;
    expect(html).toContain(`Most likely: ${name(a)} · 2 votes (+1)`);
    expect(html).toContain(`voted for ${name(b)}`);
    // Rows lead with the most votes received.
    expect(html.indexOf('2 votes</span>')).toBeLessThan(html.indexOf('1 vote</span>'));
  });

  it('states Spill or Chill scoring on the buttons', () => {
    const fixture = fixtures.find((item) => item.room.game_id === 'spill-or-chill')!;
    const room = mapRoom(fixture.room);
    const html = renderToStaticMarkup(
      <PartyTable
        room={room}
        match={room.game!}
        selfId={room.game!.detail.spotlight as string}
        pending={false}
        onAction={() => undefined}
      />,
    );
    expect(html).toContain('Spill · I answered aloud (+1)');
    expect(html).toContain('Chill · keep it to myself (+1)');
    expect(html).toContain('Pass (no point)');
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
