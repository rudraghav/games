import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { games as catalog } from '@games/api-client/catalog';
import type { ActionOption, Room } from '@games/api-client';
import { mapRoom } from '@games/api-client/mappers';
import { fixtures } from '@/stories/generated/rooms';
import { midgameScenarios } from '@/stories/generated/midgame-scenarios';
import { fourDrop } from '@/shared/tutorial/four-drop';
import { casinoDirection } from '@/shared/tutorial/casino-direction';
import { tutorialLessons } from '@/shared/tutorial/lessons';
import { TurnCoach } from '@/shared/tutorial/TurnCoach';
import {
  advancePractice,
  beginPractice,
  offeredMove,
  practiceDirection,
} from '@/shared/tutorial/coach-state';

const fixture = (id: string) => fixtures.find((entry) => entry.room.game_id === id)!;
const event = (
  actorId: string,
  version: number,
  type: string,
  label: string,
): Room['activity'][number] => ({
  actorId,
  version,
  type,
  label,
  amount: null,
  destination: null,
  count: null,
  cards: [],
  targets: [],
});
const describeMove = (_room: Room, move: Room['activity'][number], selfId: string) =>
  `${move.actorId === selfId ? 'You' : 'Bot'} · ${move.label}`;

function markup(
  room: Room,
  selfId: string,
  flags: { offline?: boolean; pending?: boolean; botFailed?: boolean } = {},
) {
  return renderToStaticMarkup(
    <TurnCoach
      room={room}
      selfId={selfId}
      pending={false}
      onAction={() => {
        throw new Error('The coach submitted an action while rendering');
      }}
      describeMove={describeMove}
      onExit={() => {}}
      onRules={() => {}}
      {...flags}
    />,
  );
}

afterEach(() => vi.unstubAllGlobals());

describe('Guided practice uses the actual saved game', () => {
  it('counts learner moves once across bot replies, repeated snapshots, refresh and restart', () => {
    const room = mapRoom(fixture('four-in-a-row').room);
    const self = room.ownerId;
    const start = beginPractice(2);
    room.matchVersion = 5;
    room.activity = [
      event('bot', 2, 'drop', 'Dropped a disc'),
      event(self, 3, 'drop', 'Dropped a disc'),
      event('bot', 4, 'drop', 'Dropped a disc'),
      event(self, 5, 'drop', 'Dropped a disc'),
    ];
    const checkpoint = advancePractice(start, room, self);
    expect(checkpoint).toEqual({ start: 2, through: 5, moves: 2 });
    expect(advancePractice(checkpoint, room, self)).toBe(checkpoint);
    expect(advancePractice(checkpoint, { ...room, matchVersion: 4 }, self)).toBe(checkpoint);
    const recovered = JSON.parse(JSON.stringify(checkpoint));
    room.matchVersion = 7;
    room.activity.push(
      event(self, 6, 'drop', 'Dropped a disc'),
      event('bot', 7, 'drop', 'Dropped a disc'),
    );
    expect(advancePractice(recovered, room, self).moves).toBe(3);
    expect(advancePractice(beginPractice(7), room, self).moves).toBe(0);
  });

  it('finds a currently offered action in every recorded playable scenario and protects compound choices', () => {
    const games = new Set<string>();
    for (const sample of midgameScenarios) {
      const match = mapRoom(sample.room).game!;
      if (!match.actions.length) continue;
      const option = offeredMove(match, tutorialLessons[match.id]);
      expect(match.actions).toContain(option);
      const direction = practiceDirection(option, match);
      expect(direction.title.trim()).not.toBe('');
      if (
        option.input ||
        option.value.color ||
        option.value.target ||
        [
          'pick',
          'arrange',
          'fold',
          'raise',
          'bet',
          'pay',
          'vote',
          'choose',
          'respond',
          'guess',
          'claim_chip',
          'select_number',
          'declare',
        ].includes(option.value.type)
      ) {
        expect(direction.direct, match.id + ' ' + option.label).toBe(false);
      }
      games.add(match.id);
    }
    expect(games).toEqual(new Set(catalog.map((game) => game.id)));
  });

  it('offers the Azul round advance directly and leaves drafts and placements on the table', () => {
    const scenarios = midgameScenarios.filter((sample) => sample.game === 'azul');
    for (const phase of ['drafting', 'placing', 'round_over']) {
      const sample = scenarios.find((sample) => sample.room.game?.phase === phase)!;
      const room = mapRoom(sample.room);
      const match = room.game!;
      const option = offeredMove(match, tutorialLessons.azul)!;
      expect(practiceDirection(option, match).direct).toBe(phase === 'round_over');
      const html = markup(room, sample.selfId);
      if (phase === 'round_over') {
        expect(option.value.type).toBe('next_round');
        expect(html).toMatch(/<button[^>]*>Next round<\/button>/);
      } else {
        expect(html).toContain('Go to table');
      }
    }
  });

  it('counts a complete Azul placement once when draft and placement save separately', () => {
    const room = mapRoom(fixture('azul').room);
    const self = room.ownerId;
    room.activity = [event(self, 1, 'draft_tiles', 'Drafted two tiles')];
    room.matchVersion = 1;
    const partial = advancePractice(beginPractice(0), room, self);
    expect(partial.moves).toBe(0);
    room.activity.push(event(self, 2, 'place_tiles', 'Placed two tiles'));
    room.matchVersion = 2;
    const placed = advancePractice(partial, room, self);
    expect(placed.moves).toBe(1);
    expect(advancePractice({ ...placed, moves: 2 }, room, self)).toEqual(placed);
    expect(advancePractice(placed, room, self)).toBe(placed);
  });

  it('teaches a safe blackjack hit from the active split hand and uses the offered wager limits', () => {
    const room = mapRoom(fixture('blackjack').room);
    const match = room.game!;
    const base = mapRoom(fixture('four-in-a-row').room).game!.actions[0];
    const stand = { ...base, value: { ...base.value, type: 'stand' }, label: 'Stand' };
    const hit = { ...base, value: { ...base.value, type: 'hit' }, label: 'Hit' };
    const hand = (ranks: string[]) => ({
      bet: 2,
      cards: ranks.map((value, index) => ({ id: 'c' + index, label: value, value })),
    });
    const split = {
      ...match,
      actions: [stand, hit],
      detail: {
        dealer_hidden: true,
        hand_index: 1,
        active_hand_index: 1,
        hands: [hand(['10', 'Q']), hand(['3', '6'])],
      },
    };
    expect(casinoDirection(split, stand, room.ownerId)).toMatchObject({
      option: hit,
      tip: expect.stringContaining('totals 9'),
    });
    expect(
      casinoDirection(
        { ...split, detail: { ...split.detail, active_hand_index: 0 } },
        stand,
        room.ownerId,
      )?.tip,
    ).toContain('your 20');
    const wager = { ...stand, input: 'amount' as const, minimum: 2, maximum: 8, step: 2 };
    expect(casinoDirection(match, wager, room.ownerId)?.tip).toContain('2–8 chips');
  });

  it('teaches the goal, offers a complete board move and pauses controls when saving or offline', () => {
    const f = fixture('four-in-a-row');
    const room = mapRoom(f.room);
    const html = markup(room, f.selfId);
    expect(html).toContain('Guided move 1 of 3');
    expect(html).toContain(tutorialLessons['four-in-a-row'].goal);
    expect(html).toMatch(/<button[^>]*>Drop in column [1-7]<\/button>/);
    for (const flags of [{ pending: true }, { offline: true }]) {
      expect(markup(room, f.selfId, flags)).not.toMatch(/<button[^>]*>Drop in column/);
    }
  });

  it('shows an applied rule for the public bot reply and keeps the learner’s previous move available', () => {
    const f = fixture('four-in-a-row');
    const room = mapRoom(f.room);
    const bot = room.members.find((m) => m.id !== f.selfId)!;
    bot.isBot = true;
    room.matchVersion = 4;
    room.activity = [
      event(f.selfId, 3, 'drop', 'Dropped in column 4'),
      event(bot.id, 4, 'drop', 'Dropped in column 3'),
    ];
    vi.stubGlobal('window', {
      sessionStorage: { getItem: () => JSON.stringify(beginPractice(2)) },
    });
    const html = markup(room, f.selfId);
    expect(html).toContain('Guided move 2 of 3');
    expect(html).toContain('Bot · Dropped in column 3');
    expect(html.split(tutorialLessons['four-in-a-row'].actions.drop)).toHaveLength(2);
    expect(html).toContain('You · Dropped in column 4');
    expect(html).not.toContain(tutorialLessons['four-in-a-row'].goal);
  });

  it('hands hidden Tarot picks to the deck and leaves reading generation to the player', () => {
    const f = fixture('tarot');
    const room = mapRoom(f.room);
    const face = room.game!.community[0] || mapRoom(fixture('uno').room).game!.hand[0];
    for (let count = 0; count <= 3; count++) {
      const html = markup(
        { ...room, game: { ...room.game!, community: Array.from({ length: count }, () => face) } },
        f.selfId,
      );
      expect(html).not.toMatch(/<button[^>]*>(Read my cards|Choose card|Pick your)/);
      if (count < 3) {
        expect(html).toContain('Go to cards');
        expect(html).toContain('Card ' + (count + 1) + ' of 3');
      } else {
        expect(html).toContain('Your spread is ready');
        expect(html).toContain('Continue to spread');
      }
    }
  });

  it('keeps suggesting real moves beyond the first three and prioritizes an immediate win or block', () => {
    const f = fixture('four-in-a-row');
    const room = mapRoom(f.room);
    const match = room.game!;
    const current = match.players.findIndex((p) => p.id === match.currentPlayer);
    expect([0, 1]).toContain(current);
    const own = String(current + 1);
    const enemy = String(2 - current);
    const option = match.actions.find((o) => o.value.choice === '3')!;
    const disc = (index: number, value: string) => ({ ...match.community[index], value });
    const board = Array.from({ length: 42 }, (_, i) => disc(i, ''));
    const state = {
      ...match,
      community: board,
      detail: { ...match.detail, landing: { '3': 38 } },
      actions: [option],
    };
    for (const [line, cells] of [
      ['horizontal', [35, 36, 37]],
      ['vertical', [17, 24, 31]],
      ['diagonal', [14, 22, 30]],
    ] as const) {
      for (const color of [own, enemy]) {
        const community = board.map((card, i) => ({
          ...card,
          value: (cells as readonly number[]).includes(i) ? color : '',
        }));
        // The projected landing square for a vertical line must lie above its supporting discs.
        const landing = line === 'vertical' ? 10 : 38;
        const tip = fourDrop({ ...state, community, detail: { landing: { '3': landing } } });
        expect(tip?.option).toBe(option);
        expect(tip?.tip).toContain(line);
        expect(tip?.tip).toContain(color === own ? 'completes your' : 'block it');
      }
    }
    vi.stubGlobal('window', {
      sessionStorage: { getItem: () => JSON.stringify({ start: 1, through: 8, moves: 4 }) },
    });
    const html = markup({ ...room, matchVersion: 8, game: state }, f.selfId);
    expect(html).toContain('Guided move 5');
    expect(html).toContain('Finish tutorial');
    expect(html).toMatch(/<button[^>]*>Drop in column 4<\/button>/);
  });

  it('explains the printed effect of a public Deal action without revealing any private cards', () => {
    const f = fixture('deal');
    const room = mapRoom(f.room);
    const played = { ...room.game!.hand[0], label: 'Sly Deal', effect: 'sly' };
    room.matchVersion = 3;
    room.activity = [{ ...event(f.selfId, 3, 'play', 'Played an action'), cards: [played] }];
    vi.stubGlobal('window', {
      sessionStorage: { getItem: () => JSON.stringify(beginPractice(2)) },
    });
    expect(markup(room, f.selfId)).toContain('Take one property from an incomplete set.');
  });
  it('does not assume a default price or partner when the server offers a parameter', () => {
    const match = mapRoom(fixture('holdem').room).game!;
    const action: ActionOption = {
      ...match.actions[0],
      label: 'Raise',
      value: { ...match.actions[0].value, type: 'raise' },
      input: 'amount',
      minimum: 4,
      maximum: 200,
    };
    expect(practiceDirection(action, match)).toEqual({ title: 'Choose a raise', direct: false });
  });
});
