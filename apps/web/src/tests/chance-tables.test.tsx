import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { mapRoom } from '@games/api-client/mappers';
import { slotsDetails, type Match, type SlotSpin } from '@games/api-client';
import { ChanceTable } from '@/games/chance/ChanceTable';
import { ChanceHistory } from '@/games/chance/ChanceHistory';
import { EUROPEAN_WHEEL } from '@/games/chance/chance-format';
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
