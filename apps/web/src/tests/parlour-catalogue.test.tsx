import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { mapRoom } from '@games/api-client/mappers';
import type { Room } from '@games/api-client';
import { games } from '@games/api-client/catalog';
import { fixtures } from '@/stories/generated/rooms';
import { midgameScenarios } from '@/stories/generated/midgame-scenarios';
import { describeMove } from '@/features/room/move-description';
import { browseGames, occasionGames } from '@/features/lounge/occasions';
import { teamGames } from '@/features/lounge/catalogue-search';
import { tutorialLessons } from '@/shared/tutorial/lessons';
import { tableRegistry } from '@/games/registry';
import { HousieTable } from '@/games/housie/HousieTable';
import { LiarsDiceTable } from '@/games/liars-dice/LiarsDiceTable';
import { BluffTable } from '@/games/bluff/BluffTable';
import { TruthOrDareTable } from '@/games/truth-or-dare/TruthOrDareTable';

const parlour = ['housie', 'liars-dice', 'bluff', 'truth-or-dare'] as const;

describe('the parlour games in the catalogue', () => {
  it('registers a table of its own for each family', () => {
    expect(tableRegistry.housie).toBe(HousieTable);
    expect(tableRegistry['liars-dice']).toBe(LiarsDiceTable);
    expect(tableRegistry.bluff).toBe(BluffTable);
    expect(tableRegistry['truth-or-dare']).toBe(TruthOrDareTable);
  });

  it('sits in the occasions the brief names, and Truth or Dare stays out of For teams', () => {
    const ids = (occasion: Parameters<typeof occasionGames>[0]) =>
      occasionGames(occasion, games).map((game) => game.id);
    expect(ids('friends')).toEqual(expect.arrayContaining([...parlour]));
    expect(ids('quick-bots')).toEqual(expect.arrayContaining(['liars-dice', 'bluff']));
    expect(ids('two-players')).toEqual(expect.arrayContaining([...parlour]));
    expect(teamGames).toContain('housie');
    expect(teamGames).not.toContain('truth-or-dare');
    expect(ids('teams')).not.toContain('truth-or-dare');
  });

  it('is found by its other names', () => {
    const found = (query: string) => browseGames(games, query, 'all').map((game) => game.id);
    expect(found('tambola')).toEqual(['housie']);
    expect(found('perudo')).toEqual(['liars-dice']);
    expect(found('cheat')).toEqual(['bluff']);
    expect(found('spin the bottle')).toEqual(['truth-or-dare']);
    expect(found('cards')).toContain('bluff');
  });

  it('explains every action type each engine offers', () => {
    const types: Record<(typeof parlour)[number], string[]> = {
      housie: ['call_number', 'mark', 'claim'],
      'liars-dice': ['bid', 'call_liar', 'next_round'],
      bluff: ['play', 'skip', 'call_bluff', 'continue'],
      'truth-or-dare': ['pick', 'done', 'skip', 'swap', 'assign', 'next'],
    };
    for (const id of parlour)
      expect(Object.keys(tutorialLessons[id].actions).sort()).toEqual([...types[id]].sort());
  });

  it('never shows the naughty edition in a lesson', () => {
    const lesson = JSON.stringify(tutorialLessons['truth-or-dare']);
    for (const word of ['Kill', 'Fuck', '18+', 'naughty']) expect(lesson).not.toContain(word);
  });
});

describe('parlour moves in the history', () => {
  const fixture = fixtures.find((item) => item.label === 'Bluff · minimum seats')!;
  const room = mapRoom(fixture.room);
  const other = room.members.find((member) => member.id !== fixture.selfId)!;
  const move = (gameId: string, type: string, label: string) =>
    [
      { ...room, gameId },
      {
        version: 2,
        actorId: other.id,
        type,
        label,
        targets: [],
        cards: [],
        amount: null,
        destination: null,
        count: null,
      } as unknown as Room['activity'][number],
      fixture.selfId,
    ] as const;
  it('says a Bluff play as a count of cards, never a face', () => {
    expect(describeMove(...move('bluff', 'play', 'Played 2 as Queens'))).toBe(
      `${other.name} played 2 cards as Queens`,
    );
    expect(describeMove(...move('bluff', 'play', 'Played 1 as 7s'))).toBe(
      `${other.name} played 1 card as 7s`,
    );
  });
  it('keeps the server’s wording for the other parlour games', () => {
    expect(describeMove(...move('housie', 'call_number', 'Called 42'))).toBe(
      `${other.name} called 42`,
    );
    expect(describeMove(...move('liars-dice', 'bid', 'Bid 3 × fours'))).toBe(
      `${other.name} bid 3 × fours`,
    );
    expect(describeMove(...move('truth-or-dare', 'pick', 'Chose dare'))).toBe(
      `${other.name} chose dare`,
    );
  });
});

describe('every legal parlour scenario renders', () => {
  it('draws each opening and mid-game table with one filled button at most', () => {
    const sources = [
      ...fixtures.filter((item) => parlour.includes(item.room.game_id as never)),
      ...midgameScenarios.filter((item) => parlour.includes(item.game as never)),
    ];
    expect(sources.length).toBeGreaterThan(40);
    for (const source of sources) {
      const room = mapRoom(source.room);
      const Table = tableRegistry[room.gameId];
      const html = renderToStaticMarkup(
        <Table
          room={room}
          match={room.game!}
          selfId={source.selfId}
          onAction={() => undefined}
          pending={false}
        />,
      );
      expect(html, room.gameId).toContain('table-layout');
      expect(
        (html.match(/class="button button--primary/g) ?? []).length,
        room.gameId,
      ).toBeLessThanOrEqual(1);
    }
  });
});
