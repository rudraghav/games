import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { mapRoom } from '@games/api-client/mappers';
import { gameById } from '@games/api-client/catalog';
import type { Match, Room } from '@games/api-client';
import { midgameScenarios } from '@/stories/generated/midgame-scenarios';
import { RoomResults } from '@/features/room/RoomResults';
import { CasinoTable } from '@/games/casino/CasinoTable';
import {
  callIsAllIn,
  casinoInstruction,
  choiceView,
  feltCue,
  seatResult,
  wagerImpact,
  wagerProblem,
  wagerView,
} from '@/games/casino/casino-guidance';
import { groupSettledPots } from '@/games/casino/casino-pots';

const scenario = (id: string) => {
  const fixture = midgameScenarios.find((item) => item.id === id)!;
  const room = mapRoom(fixture.room);
  return { room, match: room.game!, selfId: fixture.selfId };
};
const option = (match: Match, type: string) =>
  match.actions.find((item) => item.value.type === type)!;

describe('Casino decision guidance', () => {
  it('deducts only new chips for a Hold’em raise-to, and the full amount for a new bet', () => {
    const blind = scenario('holdem-2-17-2');
    expect(wagerImpact(blind.match, blind.selfId, 10)).toEqual({ added: 8, remaining: 190 });
    expect(wagerImpact(blind.match, blind.selfId, 200)).toEqual({ added: 198, remaining: 0 });
    expect(wagerImpact(blind.match, blind.selfId, 201)).toBeNull();
    const blackjack = scenario('blackjack-7-31-2');
    expect(wagerImpact(blackjack.match, blackjack.selfId, 20)).toEqual({
      added: 20,
      remaining: 180,
    });
    const patti = scenario('teen-patti-2-17-2');
    expect(wagerImpact(patti.match, patti.selfId, 4)).toEqual({ added: 4, remaining: 195 });
  });
  it('offers a pot preset only when the actual pot-sized raise fits the stack', () => {
    const { match, selfId } = scenario('holdem-2-17-2');
    const capped = { ...option(match, 'raise'), maximum: 5 };
    expect(wagerView(match, selfId, capped).presets).toEqual([{ label: 'Min 4', value: 4 }]);
  });
  it('prices an irreversible Teen Patti peek from the offered blind limit and affordable even chips', () => {
    const { match, room, selfId } = scenario('teen-patti-2-17-3');
    const projected = (chips: number) => ({
      ...match,
      players: match.players.map((p) => (p.id === selfId ? { ...p, chips } : p)),
      actions: match.actions.map((a) =>
        a.value.type === 'bet' ? { ...a, minimum: 48, maximum: Math.min(64, chips) } : a,
      ),
    });
    for (const [stack, phrase] of [
      [199, '96–128 chips'],
      [99, '96–98 chips'],
      [97, 'cost 96 chips.'],
      [95, 'you can only pack'],
    ] as const) {
      const view = projected(stack);
      const instruction = casinoInstruction(view, room, selfId);
      expect(instruction).toContain(phrase);
      expect(choiceView(view, selfId, option(view, 'peek')).description).toContain(phrase);
    }
    const seen = scenario('teen-patti-2-17-2');
    const narrow = { ...option(seen.match, 'bet'), maximum: 3 };
    expect(wagerView(seen.match, seen.selfId, narrow).max).toBe(2);
  });
  it('states the call, the raise range and the cost of folding, never a raw phase', () => {
    const { room, match, selfId } = scenario('holdem-9-31-2');
    const line = casinoInstruction(match, room, selfId)!;
    expect(line).toMatch(/^2 chips to call\./);
    expect(line).not.toContain('preflop');
    const raise = wagerView(match, selfId, option(match, 'raise'));
    expect(raise.range).toBe('Raise to 4–200 chips');
    expect(raise.presets.map((item) => item.label)).toEqual(['Min 4', '½ pot', 'Pot']);
    expect(wagerProblem(3, raise)).toBe('Enter at least 4.');
    expect(wagerProblem(201, raise)).toBe('Enter at most 200.');
    expect(wagerProblem(Number.NaN, raise)).toBe('Enter an amount.');
    expect(wagerProblem(10, raise)).toBeNull();
  });
  it('offers one call when calling already takes every chip', () => {
    const { match, selfId } = scenario('holdem-9-31-2');
    const own = match.players.find((player) => player.id === selfId)!;
    const facing: Match = {
      ...match,
      players: match.players.map((player) =>
        player.id === selfId ? { ...player, chips: 5, bet: 0 } : player,
      ),
      detail: { ...match.detail, current_bet: 40 },
    };
    expect(own).toBeTruthy();
    expect(callIsAllIn(facing, selfId)).toBe(true);
    expect(choiceView(facing, selfId, option(facing, 'all_in')).hidden).toBe(true);
    expect(choiceView(facing, selfId, option(facing, 'call')).name).toBe('Call all in · 5');
  });
  it('prices Blackjack doubles and splits on the button and in the line', () => {
    const { room, match, selfId } = scenario('blackjack-7-31-11');
    const split = choiceView(match, selfId, option(match, 'split'));
    expect(split.name).toBe('Split pair');
    expect(split.suffix).toBe(' · +10');
    expect(casinoInstruction(match, room, selfId)).toContain('Split adds 10 and plays two hands.');
    const even = wagerView(match, selfId, option(scenario('blackjack-7-31-2').match, 'bet'));
    expect(wagerProblem(5, even)).toBe('Use an even amount.');
  });
  it('addresses the sideshow responder as you and states the tie rule', () => {
    const responder = midgameScenarios.find(
      (item) =>
        item.game === 'teen-patti' &&
        item.room.game?.actions?.some((move) => move.action.type === 'accept'),
    )!;
    const { room, match, selfId } = scenario(responder.id);
    const line = casinoInstruction(match, room, selfId)!;
    expect(line).toContain('asks you for a sideshow');
    expect(line).toMatch(/equal hands: .+ packs/);
  });
  it('reads a raise as the total it raised to, with the chips it added', () => {
    const { room, match, selfId } = scenario('holdem-9-31-2');
    const actor = match.players.find((player) => player.id !== selfId)!;
    const cueRoom: Room = {
      ...room,
      matchVersion: 9,
      lastAction: { version: 9, actorId: actor.id, type: 'raise', amount: 22 },
    };
    const raised: Match = {
      ...match,
      players: match.players.map((player) =>
        player.id === actor.id ? { ...player, bet: 24 } : player,
      ),
    };
    expect(feltCue(cueRoom, raised, selfId)?.text).toBe('raised to 24 (+22)');
  });
});

describe('Casino results on the table', () => {
  it('names the winning hand on the seat and shows the result instead of the bet', () => {
    const { room, match, selfId } = scenario('holdem-2-17-7');
    const [winner, loser] = match.players;
    const finished: Match = {
      ...match,
      phase: 'finished',
      winners: [winner.id],
      players: [
        { ...winner, score: 4, bet: 2 },
        { ...loser, score: -4, bet: 2 },
      ],
      detail: {
        ...match.detail,
        pots: [{ amount: 8, winners: [winner.id], eligible: [winner.id, loser.id] }],
        hand_evaluations: {
          [winner.id]: {
            category: 'Flush',
            comparison: [13, 11, 10, 8, 4],
            description: 'Flush, king high; then jack, 10, 8, 4',
            short: 'Flush',
            cards: match.community.slice(0, 5),
          },
        },
      },
    };
    expect(seatResult(finished, winner.id)).toEqual({
      tone: 'win',
      chip: '+4',
      caption: 'Won · Flush',
    });
    const html = renderToStaticMarkup(
      <CasinoTable
        room={{ ...room, status: 'finished' }}
        match={finished}
        selfId={selfId}
        onAction={() => undefined}
        pending={false}
      />,
    );
    expect(html).toContain('Won · Flush');
    expect(html).toContain('casino-seat-result');
    expect(html).not.toMatch(/class="seat-bet"/);
    expect(html).toContain('data-winning="true"');
  });
  it('shows contribution layers with the same players as one pot, and explains a real side pot', () => {
    expect(
      groupSettledPots([
        { amount: 3, winners: ['b'], eligible: ['a', 'b'], awards: { b: 3 }, odd_chips: [] },
        { amount: 46, winners: ['b'], eligible: ['a', 'b'], awards: { b: 46 }, odd_chips: [] },
      ]).map((pot) => [pot.name, pot.amount, pot.awards]),
    ).toEqual([['Pot', 49, { b: 49 }]]);
    const side = groupSettledPots([
      { amount: 60, winners: ['a'], eligible: ['a', 'b'], awards: { a: 60 }, odd_chips: [] },
      { amount: 80, winners: ['b'], eligible: ['b'], awards: { b: 80 }, odd_chips: [] },
    ]);
    expect(side.map((pot) => pot.name)).toEqual(['Main pot', 'Side pot 1']);
    expect(side[1].allInBelow).toEqual(['a']);
  });
  it('lists the viewer’s own Blackjack ledger first', () => {
    const { room, match } = scenario('blackjack-7-31-8');
    const [first, , third] = match.players;
    const own = { cards: match.hand, bet: 10, settlement: null };
    const ledger = (net: number, hand: unknown) => ({
      hands: [hand],
      insurance: { stake: 0, payout: 0, net: 0 },
      net,
    });
    const settled = {
      ...room,
      game: {
        ...match,
        phase: 'finished',
        detail: {
          ...match.detail,
          dealer_hidden: false,
          hands: [own],
          settlements: {
            [first.id]: ledger(10, { cards: [], bet: 10, settlement: null }),
            [third.id]: ledger(-10, own),
          },
        },
      },
    } as Room;
    const html = renderToStaticMarkup(<RoomResults room={settled} game={gameById('blackjack')} />);
    const mine = html.indexOf('You: -10 chips net');
    const theirs = html.indexOf(': +10 chips net');
    expect(mine).toBeGreaterThan(-1);
    expect(theirs).toBeGreaterThan(mine);
  });
});
