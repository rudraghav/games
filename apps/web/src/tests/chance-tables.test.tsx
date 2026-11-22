import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { mapRoom } from '@games/api-client/mappers';
import { slotsDetails, type Match, type SlotSpin } from '@games/api-client';
import { ChanceTable } from '@/games/chance/ChanceTable';
import { ChanceHistory } from '@/games/chance/ChanceHistory';
import {
  betCovers,
  chipTier,
  EUROPEAN_WHEEL,
  pocketColor,
  wheelTurn,
  winningReels,
} from '@/games/chance/chance-format';
import { midgameScenarios } from '@/stories/generated/midgame-scenarios';

const fixture = midgameScenarios.find((item) => item.id === 'blackjack-7-31-2')!;
const room = mapRoom(fixture.room);
const base = room.game!;
const owner = fixture.selfId;
const sample = base.actions.find((item) => item.input === 'amount')!;
function table(match: Match, selfId = owner, pending = false) {
  return renderToStaticMarkup(
    <ChanceTable
      room={room}
      match={match}
      selfId={selfId}
      onAction={() => undefined}
      pending={pending}
    />,
  );
}
const session = { spin_limit: 5, spins_remaining: 5, history: [] };
const slotData = {
  ...session,
  chips: 100,
  starting_chips: 100,
  total_outcomes: 1728,
  winning_outcomes: 492,
  return_numerator: 1620,
  paytable: [{ result: 'triple_seven', label: 'Three sevens', multiplier: 100, ways: 1 }],
};
const view = (id: string, detail: Match['detail'], choices: string[]) => ({
  ...base,
  id,
  phase: 'betting',
  detail,
  actions: choices.map((choice) => ({
    ...sample,
    minimum: 1,
    maximum: 100,
    step: 1,
    value: { ...sample.value, type: 'spin', choice },
  })),
  players: base.players.filter((p) => p.id === owner).map((p) => ({ ...p, chips: 100 })),
});
it('renders the European wheel order, red pockets and exact single-zero payouts', () => {
  expect([...EUROPEAN_WHEEL].sort((a, b) => a - b)).toEqual(
    Array.from({ length: 37 }, (_, i) => i),
  );
  expect(EUROPEAN_WHEEL.filter((_, i) => i % 2 === 1).sort((a, b) => a - b)).toEqual([
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
  ]);
  const html = table(view('roulette', session, ['red', 'black', '0', '36']));
  expect(html).toContain('Red · 2 chips returned on a win · 99 left unbet.');
  expect(html).toContain('value="36"');
  expect(html).toContain('18/37');
  expect(html).not.toContain('roulette-pointer');
});
it('hides unauthorised private data and exposes no imaginary spin before the server settles', () => {
  const initial = view('slots', slotData, ['']);
  expect(table({ ...initial, detail: {}, players: [] }, 'outsider')).toContain('Only the player');
  const html = table(initial, owner, true);
  expect(html).toContain('Three empty reels');
  expect(html).toContain('Spinning…');
  expect(html).toContain('93.75%');
  expect(html).toContain('28.47%');
  expect(html).not.toContain('Latest spin');
});
it('keeps saved reel faces, returned chips, net and balance readable in reverse spin order', () => {
  const spin: SlotSpin = {
    spin: 1,
    stake: 2,
    payout: 0,
    net: -2,
    balance: 98,
    reels: ['lemon', 'bell', 'star'],
    result: 'miss',
    multiplier: 0,
  };
  const win: SlotSpin = {
    ...spin,
    spin: 2,
    stake: 2,
    payout: 4,
    net: 2,
    balance: 100,
    reels: ['cherry', 'bell', 'cherry'],
    result: 'two_cherries',
    multiplier: 2,
  };
  const history = [spin, win];
  const text = renderToStaticMarkup(<ChanceHistory history={history} expanded />);
  expect(text.indexOf('Spin 2')).toBeLessThan(text.indexOf('Spin 1'));
  expect(text).toContain('Cherry · Bell · Cherry');
  expect(text).toContain('Staked 2 · Returned 4 · Balance 100');
  expect(text).toContain('−2 net');
  expect(slotsDetails({ ...slotData, history }).history[1]).toEqual(win);
  expect(() =>
    slotsDetails({ ...slotData, history: [{ ...spin, reels: ['cherry', 'bell'] }] }),
  ).toThrow();
  const ended = table({
    ...view('slots', { ...slotData, history, spins_remaining: 0 }, []),
    phase: 'finished',
  });
  expect(ended).toContain('Spin 2 · Cherry · Bell · Cherry');
  expect(ended).not.toContain('aria-label="Your wager"');
});
it('marks covered pockets, bet spots and outcomes with words and shapes, never colour alone', () => {
  const pockets = Array.from({ length: 37 }, (_, i) => i);
  for (const bet of ['red', 'black', 'odd', 'even', 'low', 'high']) {
    expect(pockets.filter((pocket) => betCovers(bet, pocket))).toHaveLength(18);
    expect(betCovers(bet, 0)).toBe(false);
  }
  expect(pockets.filter((pocket) => betCovers('0', pocket))).toEqual([0]);
  expect(pockets.filter((pocket) => betCovers('', pocket))).toEqual([]);
  expect([0, 32, 26].map(pocketColor)).toEqual(['green', 'red', 'black']);
  expect([1, 4, 5, 10, 24, 25, 99, 100].map(chipTier)).toEqual([1, 1, 5, 10, 10, 25, 25, 100]);
  // A settled wheel always rests with the saved pocket under the top marker.
  expect(wheelTurn()).toBe(0);
  expect(wheelTurn({ spin: 2, pocket: 0 })).toBe(1440);
  expect(wheelTurn({ spin: 1, pocket: 32 })).toBeCloseTo(720 - 360 / 37);
  expect(winningReels({ reels: ['cherry', 'bell', 'cherry'], result: 'two_cherries' })).toEqual([
    true,
    false,
    true,
  ]);
  expect(winningReels({ reels: ['star', 'star', 'star'], result: 'triple_star' })).toEqual([
    true,
    true,
    true,
  ]);
  expect(winningReels({ reels: ['star', 'bell', 'star'], result: 'miss' })).toEqual([
    false,
    false,
    false,
  ]);

  const spin = {
    spin: 1,
    choice: 'red',
    stake: 5,
    pocket: 32,
    color: 'red' as const,
    payout: 10,
    net: 5,
    balance: 105,
  };
  const html = table({
    ...view('roulette', { ...session, spins_remaining: 4, history: [spin] }, ['red', 'black', '0']),
    players: base.players.filter((p) => p.id === owner).map((p) => ({ ...p, chips: 105 })),
  });
  // The chosen bet carries the stake chip; every covered pocket is marked on the wheel.
  expect(html.match(/class="chance-chip"/g)).toHaveLength(1);
  expect(html.match(/data-cover="true"/g)).toHaveLength(18);
  expect(html.match(/data-hit="true"/g)).toHaveLength(1);
  expect(html).toContain('roulette-pointer');
  expect(html).toContain('data-outcome="won"');
  expect(html).toContain('<em>Won</em> +5 net');
  expect(html).toContain('Red pays 1 to 1');
  expect(html).toContain('>0 · Green</option>');
  // Nothing plays a landing for a spin that was already saved when the table opened.
  expect(html).not.toContain('data-landed');
  expect(html).not.toContain('roulette-status');

  const lost = { ...spin, payout: 0, net: -5, balance: 95 };
  const waiting = table(
    view('roulette', { ...session, spins_remaining: 4, history: [lost] }, ['red', '0']),
    owner,
    true,
  );
  expect(waiting).toContain('<em>Lost</em> −5 net');
  expect(waiting).toContain('roulette-status');

  const miss: SlotSpin = {
    spin: 1,
    stake: 2,
    payout: 0,
    net: -2,
    balance: 98,
    reels: ['lemon', 'bell', 'star'],
    result: 'miss',
    multiplier: 0,
  };
  const paytable = [
    ...slotData.paytable,
    { result: 'two_cherries', label: 'Exactly two cherries', multiplier: 2, ways: 384 },
    { result: 'miss', label: 'All other lines', multiplier: 0, ways: 1236 },
  ];
  const reels = (history: SlotSpin[]) =>
    table(view('slots', { ...slotData, paytable, history, spins_remaining: 4 }, ['']));
  expect(reels([miss])).toContain('No winning line');
  expect(reels([miss])).not.toContain('slot-reel" data-win');
  const cherries = reels([
    {
      ...miss,
      payout: 4,
      net: 2,
      balance: 102,
      reels: ['cherry', 'bell', 'cherry'],
      result: 'two_cherries',
      multiplier: 2,
    },
  ]);
  expect(cherries).toContain('Exactly two cherries · pays 2×');
  expect(cherries.match(/class="slot-reel" data-win="true"/g)).toHaveLength(2);
});
