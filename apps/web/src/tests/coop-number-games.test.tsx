import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { gangDetails, sixNimmtDetails } from '@games/api-client';
import { mapRoom } from '@games/api-client/mappers';
import { fixtures } from '@/stories/generated/rooms';
import { midgameScenarios } from '@/stories/generated/midgame-scenarios';
import { GangTable } from '@/games/coop-number/GangTable';
import { SixNimmtTable } from '@/games/coop-number/SixNimmtTable';

describe('Cooperative poker and number-row decisions', () => {
  it('renders both seat limits with private cards and deliberate move controls', () => {
    const selected = fixtures.filter((f) => ['the-gang', 'six-nimmt'].includes(f.room.game_id));
    expect(selected).toHaveLength(4);
    for (const fixture of selected) {
      const room = mapRoom(fixture.room);
      const Table = room.gameId === 'the-gang' ? GangTable : SixNimmtTable;
      const html = renderToStaticMarkup(
        <Table
          room={room}
          match={room.game!}
          selfId={fixture.selfId}
          onAction={() => undefined}
          pending={false}
        />,
      );
      expect(html).toContain(room.gameId === 'the-gang' ? 'Everyone can choose' : 'Lock my number');
      expect(html).toContain(
        room.gameId === 'the-gang' ? 'Your pocket cards' : 'Choose one number',
      );
      expect(html).toContain('disabled=""');
      expect(html).not.toContain('Current bet');
    }
  });

  it('a locked number renders only the viewer’s own choice and waiting state', () => {
    const fixture = fixtures.find((f) => f.room.game_id === 'six-nimmt')!;
    const room = mapRoom(fixture.room);
    const match = room.game!;
    const card = match.hand[0];
    const locked = {
      ...match,
      actions: [],
      hand: match.hand.slice(1),
      detail: {
        ...match.detail,
        selected_players: [fixture.selfId],
        own_selection: card,
      },
    };
    const html = renderToStaticMarkup(
      <SixNimmtTable
        room={room}
        match={locked}
        selfId={fixture.selfId}
        onAction={() => undefined}
        pending={false}
      />,
    );
    expect(html).toContain('Your number is locked');
    expect(html).toContain('Their numbers stay secret');
    expect(html).not.toContain('Lock my number');
    expect(html).not.toContain('Revealed, in order');
  });

  it('tells a player whose chip was taken, and shows their own chip as held', () => {
    const scenario = midgameScenarios.find((item) => item.id === 'the-gang-6-31-7')!;
    const room = mapRoom(scenario.room);
    const match = room.game!;
    const thief = match.players.find((player) => player.id !== scenario.selfId)!.id;
    const chips = Object.fromEntries(match.players.map((player) => [player.id, null]));
    const lost = renderToStaticMarkup(
      <GangTable
        room={room}
        match={{
          ...match,
          detail: {
            ...match.detail,
            chips: { ...chips, [thief]: 4 },
            taken_chips: { [scenario.selfId]: { by: thief, rank: 4 } },
          },
        }}
        selfId={scenario.selfId}
        onAction={() => undefined}
        pending={false}
      />,
    );
    expect(lost).toContain('took your 4-star chip. Choose another chip');
    expect(lost).toContain('data-attention="true"');
    const holding = renderToStaticMarkup(
      <GangTable
        room={room}
        match={{
          ...match,
          actions: [
            ...match.actions.filter((o) => o.value.amount !== 2),
            {
              ...match.actions[0],
              label: 'Return my chip',
              value: { ...match.actions[0].value, type: 'return_chip', amount: 0 },
            },
          ],
          detail: { ...match.detail, chips: { ...chips, [scenario.selfId]: 2 } },
        }}
        selfId={scenario.selfId}
        onAction={() => undefined}
        pending={false}
      />,
    );
    expect(holding).toMatch(/data-own="true"[^>]*aria-label="2-star chip held by you"/);
    expect(holding).toContain('Return my chip');
  });

  it('leads a finished heist with the verdict and a red-chip ladder before Next heist', () => {
    const scenario = midgameScenarios.find((item) => item.id === 'the-gang-6-31-31')!;
    const room = mapRoom(scenario.room);
    const html = renderToStaticMarkup(
      <GangTable
        room={room}
        match={room.game!}
        selfId={scenario.selfId}
        onAction={() => undefined}
        pending={false}
      />,
    );
    const verdict = html.indexOf('aria-label="Heist ranking explanation"');
    const ladder = html.indexOf('Hands by red chip, weakest first');
    const next = html.indexOf('>Next heist<');
    expect(verdict).toBeGreaterThan(-1);
    expect(ladder).toBeGreaterThan(verdict);
    expect(next).toBeGreaterThan(ladder);
    expect(html).toContain('aria-label="Red chip 1"');
    expect(html).toMatch(/Weaker than red \d|At least as strong as red \d/);
    expect(html).toContain('Crew chip history');
  });

  it('shows row costs, where each number went and the round standings', () => {
    const take = midgameScenarios.find((item) => item.id === 'six-nimmt-10-31-33')!;
    const room = mapRoom(take.room);
    const decision = renderToStaticMarkup(
      <SixNimmtTable
        room={room}
        match={room.game!}
        selfId={take.selfId}
        onAction={() => undefined}
        pending={false}
      />,
    );
    expect(decision).toMatch(/Your \d+ is lower than every row end/);
    expect(decision).toMatch(/aria-label="Take row 1 · \d+ cards? · \d+ penalt(y|ies)"/);
    expect(decision).toContain('cheapest');
    expect(decision.indexOf('lower than every row end')).toBeLessThan(decision.indexOf('Row 1<'));
    const review = midgameScenarios.find((item) => item.id === 'six-nimmt-10-31-11')!;
    const reviewRoom = mapRoom(review.room);
    const steps = renderToStaticMarkup(
      <SixNimmtTable
        room={reviewRoom}
        match={reviewRoom.game!}
        selfId={review.selfId}
        onAction={() => undefined}
        pending={false}
      />,
    );
    expect(steps).toContain('This selection, lowest number first');
    expect(steps).toMatch(/→ Row \d/);
    const over = midgameScenarios.find((item) => item.id === 'six-nimmt-10-31-117')!;
    const overRoom = mapRoom(over.room);
    const standings = renderToStaticMarkup(
      <SixNimmtTable
        room={overRoom}
        match={overRoom.game!}
        selfId={over.selfId}
        onAction={() => undefined}
        pending={false}
      />,
    );
    expect(standings).toContain('Round 1 penalties');
    expect(standings).toMatch(/\+\d+ this round/);
    expect(standings).toContain('anyone reaches 66');
  });

  it('rejects impossible chips, oversized rows and malformed penalties at the wire boundary', () => {
    const gang = fixtures.find((f) => f.room.game_id === 'the-gang')!.room.game!.detail;
    const six = fixtures.find((f) => f.room.game_id === 'six-nimmt')!.room.game!.detail;
    expect(() => gangDetails({ ...gang, chips: { player: 7 } })).toThrow();
    expect(() => sixNimmtDetails({ ...six, row_penalties: [-1, 1, 1, 1] })).toThrow();
    const row = (six.rows as unknown[][])[0];
    expect(() =>
      sixNimmtDetails({ ...six, rows: [Array(6).fill(row[0]), row, row, row] }),
    ).toThrow();
  });
});
