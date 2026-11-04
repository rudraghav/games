import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { boopDetails, paperDetails } from '@games/api-client';
import { mapRoom } from '@games/api-client/mappers';
import { fixtures } from '@/stories/generated/rooms';
import { midgameScenarios } from '@/stories/generated/midgame-scenarios';
import { BoopTable } from '@/games/boop/BoopTable';
import { PaperTable } from '@/games/sea/PaperTable';

describe('Sea Salt & Paper and boop decision surfaces', () => {
  it('renders both limits with illustrated, named controls and all bed squares', () => {
    const selected = fixtures.filter((f) => ['sea-salt-paper', 'boop'].includes(f.room.game_id));
    expect(selected).toHaveLength(4);
    for (const fixture of selected) {
      const room = mapRoom(fixture.room);
      const Table = room.gameId === 'boop' ? BoopTable : PaperTable;
      const html = renderToStaticMarkup(
        <Table
          room={room}
          match={room.game!}
          selfId={fixture.selfId}
          onAction={() => undefined}
          pending={false}
        />,
      );
      expect(html).toContain('/game-art/');
      expect(html).not.toContain('Current bet');
      if (room.gameId === 'boop') {
        expect(html.match(/class="boop-square"/g)).toHaveLength(36);
        expect(html).toContain('Select kitten: 8 available');
        expect(html).toContain('Select cat: 0 available');
        expect(html).toContain('Place kitten at A1');
      } else {
        expect(html).toContain('Draw two · keep one');
        expect(html).toContain('aria-label="Your private hand"');
        expect(html).toContain('Take discard 1:');
        expect(html).toContain('First to');
      }
    }
  });

  it('requires a private draft selection before a keep action can be used', () => {
    const scenario = midgameScenarios.find((item) => item.id === 'sea-salt-paper-2-17-2')!;
    const room = mapRoom(scenario.room);
    const match = room.game!;
    expect(match.phase).toBe('choosing');
    const html = renderToStaticMarkup(
      <PaperTable
        room={room}
        match={match}
        selfId={scenario.selfId}
        onAction={() => undefined}
        pending={false}
      />,
    );
    expect(html).toContain('Choose a card to keep');
    expect(html).toContain('Only you can see these choices.');
    expect(html).not.toContain('Draw two · keep one');
    // Every keep button names the pile and the card it would cover, but stays
    // disabled until one of the two private cards is selected.
    const keeps = html.match(/<button[^>]*aria-label="Keep selected[^"]*"[^>]*>/g) ?? [];
    expect(keeps.length).toBeGreaterThan(0);
    for (const button of keeps) {
      expect(button).toContain('disabled=""');
      const note = button.match(/aria-describedby="([^"]+)"/)![1];
      expect(html).toMatch(new RegExp(`id="${note}">(Covers [A-Z][a-z]+ [A-Z]|Pile is empty)`));
    }
    // The public sea stays visible during the private choice.
    expect(html).toContain('aria-label="Draw pile and discard piles"');
  });

  it('tells only the thief and the victim which card a steal moved', () => {
    const scenario = midgameScenarios.find((item) => item.id === 'sea-salt-paper-2-17-50')!;
    const room = mapRoom(scenario.room);
    const match = room.game!;
    const other = match.players.find((player) => player.id !== scenario.selfId)!.id;
    const render = (events: unknown[], hand = match.hand) =>
      renderToStaticMarkup(
        <PaperTable
          room={room}
          match={{ ...match, hand, detail: { ...match.detail, private_events: events } }}
          selfId={scenario.selfId}
          onAction={() => undefined}
          pending={false}
        />,
      );
    const stolen = match.hand[0];
    const thief = render([{ kind: 'stole', name: 'Green Octopus', card: { ...stolen }, other }]);
    expect(thief).toContain('You took Green Octopus from Dev.');
    expect(thief).toContain('data-fresh="true"');
    const victim = render([{ kind: 'stolen', name: 'Green Octopus', card: null, other }]);
    expect(victim).toContain('Dev took your Green Octopus.');
    expect(victim).not.toContain('data-fresh="true"');
    // Steal targets show what the choice affects.
    expect(render([])).toContain('aria-label="Dev · random card"');
    expect(render([])).toMatch(/\d+ cards? in hand · \d+ points?<\/small>/);
  });

  it('explains a finished round and the Last Chance stakes from the projection', () => {
    const scenario = midgameScenarios.find(
      (item) => item.game === 'sea-salt-paper' && item.room.game!.phase === 'round_over',
    )!;
    const room = mapRoom(scenario.room);
    const html = renderToStaticMarkup(
      <PaperTable
        room={room}
        match={room.game!}
        selfId={scenario.selfId}
        onAction={() => undefined}
        pending={false}
      />,
    );
    expect(html).toMatch(/Round \d+ results/);
    expect(html).toMatch(/stopped the round|Last Chance (worked|failed)|stock ran out/);
    expect(html).toContain('Next round');
    const stakes = midgameScenarios.find((item) => item.id === 'sea-salt-paper-2-17-51')!;
    const bet = mapRoom(stakes.room);
    const text = renderToStaticMarkup(
      <PaperTable
        room={bet}
        match={bet.game!}
        selfId={stakes.selfId}
        onAction={() => undefined}
        pending={false}
      />,
    );
    expect(text).toMatch(/If no one ends with more than your \d+ card points, you score \d+/);
    expect(text).toContain('Your hand is revealed and protected');
  });

  it('disables placement while a move is pending and rejects invalid wire details', () => {
    const fixture = fixtures.find((f) => f.room.game_id === 'boop')!;
    const room = mapRoom(fixture.room);
    const html = renderToStaticMarkup(
      <BoopTable
        room={room}
        match={room.game!}
        selfId={fixture.selfId}
        onAction={() => undefined}
        pending
      />,
    );
    expect(html.match(/disabled=""/g)).toHaveLength(38);
    const detail = room.game!.detail;
    expect(() => boopDetails({ ...detail, last_move: 36 })).toThrow();
    expect(() => boopDetails({ ...detail, pools: { player: { cat: 9, kitten: 0 } } })).toThrow();
    const paper = fixtures.find((f) => f.room.game_id === 'sea-salt-paper')!.room.game!.detail;
    expect(() => paperDetails({ ...paper, pile_counts: [0] })).toThrow();
    expect(() => paperDetails({ ...paper, own_points: -1 })).toThrow();
  });
});
