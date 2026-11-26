import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { mapRoom } from '@games/api-client/mappers';
import { liarsDiceDetails, type ActionOption, type Match } from '@games/api-client';
import { fixtures } from '@/stories/generated/rooms';
import { LiarsDiceTable } from '@/games/liars-dice/LiarsDiceTable';
import {
  bidAction,
  bidRanges,
  bidText,
  clampQuantity,
  countsFor,
  revealSummary,
} from '@/games/liars-dice/bid-builder';
import type { TableProps } from '@/games/types';

const diceFixtures = fixtures.filter((item) => item.room.game_id === 'liars-dice');

function props(index = 0): TableProps {
  const fixture = diceFixtures[index];
  const room = mapRoom(fixture.room);
  return { room, match: room.game!, selfId: fixture.selfId, pending: false, onAction: () => {} };
}

const bid = (face: number, minimum: number, maximum: number): ActionOption => ({
  label: `Bid face ${face}`,
  value: {
    type: 'bid',
    card: '',
    target: '',
    color: '',
    choice: String(face),
    amount: 0,
    slot: 0,
    cards: [],
    groups: [],
  },
  input: 'amount',
  minimum,
  maximum,
  step: 1,
  eligibleCards: [],
});
const callLiar: ActionOption = {
  label: 'Call liar',
  value: { ...bid(1, 1, 1).value, type: 'call_liar', choice: '' },
  input: null,
  minimum: null,
  maximum: null,
  step: 1,
  eligibleCards: [],
};

function withDetail(base: TableProps, detail: Record<string, unknown>, actions: ActionOption[]) {
  const match: Match = { ...base.match, detail: { ...base.match.detail, ...detail }, actions };
  return { ...base, match };
}

describe('Liar’s Dice projection', () => {
  it('accepts the generated projections and the README reveal contract', () => {
    expect(diceFixtures).toHaveLength(2);
    for (const fixture of diceFixtures) {
      const data = liarsDiceDetails(fixture.room.game!.detail);
      expect(data.dice.length).toBeLessThanOrEqual(5);
      expect(data.reveal).toBeNull();
    }
    const data = liarsDiceDetails({
      ...diceFixtures[0].room.game!.detail,
      bid: { player: 'a', quantity: 3, face: 4 },
      bids: [
        { player: 'b', quantity: 2, face: 4 },
        { player: 'a', quantity: 3, face: 4 },
      ],
      reveal: {
        caller: 'b',
        bidder: 'a',
        quantity: 3,
        face: 4,
        count: 4,
        held: true,
        loser: 'b',
        eliminated: false,
        dice: { a: [1, 4, 4, 2, 6], b: [4, 5, 5, 3, 3] },
      },
    });
    expect(data.reveal?.dice.b).toEqual([4, 5, 5, 3, 3]);
    expect(data.totalDice).toBe(10);
  });

  it('refuses extra keys anywhere in the detail', () => {
    const detail = diceFixtures[0].room.game!.detail;
    expect(() => liarsDiceDetails({ ...detail, seed: 7 })).toThrow();
    expect(() =>
      liarsDiceDetails({ ...detail, bid: { player: 'a', quantity: 2, face: 3, hidden: [] } }),
    ).toThrow();
    expect(() =>
      liarsDiceDetails({
        ...detail,
        reveal: {
          caller: 'b',
          bidder: 'a',
          quantity: 3,
          face: 4,
          count: 4,
          held: true,
          loser: 'b',
          eliminated: false,
          dice: {},
          seed: 1,
        },
      }),
    ).toThrow();
    expect(() => liarsDiceDetails({ ...detail, dice: [7] })).toThrow();
  });
});

describe('the bid builder', () => {
  it('reads each face’s range from the offered option only', () => {
    const ranges = bidRanges([bid(4, 3, 10), bid(5, 3, 10), bid(6, 3, 10), callLiar]);
    expect(ranges.map((range) => range.face)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(ranges.filter((range) => range.option).map((range) => range.face)).toEqual([4, 5, 6]);
    expect(ranges[3]).toMatchObject({ minimum: 3, maximum: 10 });
    expect(ranges[0].option).toBeNull();
    expect(bidAction(ranges[0], 5)).toBeNull();
  });

  it('clamps the stepper and sends the chosen face and quantity', () => {
    const [range] = bidRanges([bid(2, 4, 9)]).filter((item) => item.option);
    expect(clampQuantity(1, range)).toBe(4);
    expect(clampQuantity(12, range)).toBe(9);
    expect(clampQuantity(6, range)).toBe(6);
    expect(clampQuantity(Number.NaN, range)).toBe(4);
    expect(bidAction(range, 20)).toMatchObject({ type: 'bid', choice: '2', amount: 9 });
    expect(bidAction(range, 5)).toMatchObject({ type: 'bid', choice: '2', amount: 5 });
    expect(bidText(1, 6)).toBe('1 × six');
    expect(bidText(3, 4)).toBe('3 × fours');
  });

  it('renders six face buttons and disables the faces with no offered bid', () => {
    const base = props();
    const html = renderToStaticMarkup(
      <LiarsDiceTable {...withDetail(base, {}, [bid(4, 3, 10), bid(5, 3, 10), callLiar])} />,
    );
    expect(html.match(/class="liars-dice-face"/g)).toHaveLength(6);
    expect(html).toMatch(/aria-label="ones, no legal bid" disabled=""/);
    expect(html).toMatch(/aria-label="fours, 3 to 10"/);
    expect(html).not.toMatch(/aria-label="fours, 3 to 10" disabled/);
    // No face is chosen yet: the filled Bid button waits, Call liar stays quiet.
    expect(html).toContain('Choose a face to bid');
    expect(html.match(/button--primary/g)).toHaveLength(1);
    expect(html).toMatch(/button--secondary[^"]*"[^>]*>Call liar/);
  });

  it('makes Call liar the filled button when no raise is possible', () => {
    const base = props();
    const html = renderToStaticMarkup(
      <LiarsDiceTable
        {...withDetail(
          base,
          {
            bid: { player: base.room.members[1].id, quantity: 10, face: 6 },
            bids: [{ player: base.room.members[1].id, quantity: 10, face: 6 }],
          },
          [callLiar],
        )}
      />,
    );
    expect(html).not.toContain('liars-dice-faces');
    expect(html).toMatch(/button--primary[^"]*"[^>]*>Call liar/);
    expect(html).toContain('No higher bid is possible');
    expect(html).toContain('10 × sixes');
  });

  it('shows only the viewer’s own dice while bidding', () => {
    const base = props(1);
    const html = renderToStaticMarkup(<LiarsDiceTable {...base} />);
    const own = liarsDiceDetails(base.match.detail).dice;
    expect(html.match(/class="liars-die" data-size="lg"/g)).toHaveLength(own.length);
    expect(html).toContain('Only you can see your dice.');
    expect(html).not.toContain('Every die on the table');
  });
});

describe('the reveal', () => {
  const reveal = {
    caller: 'b',
    bidder: 'a',
    quantity: 3,
    face: 4,
    count: 4,
    held: true,
    loser: 'b',
    eliminated: false,
    dice: { a: [1, 4, 4, 2, 6], b: [1, 5, 5, 3, 3] },
  };

  it('counts the bid face and wild ones, never ones on a bid of ones', () => {
    expect(countsFor(4, 4, true)).toBe('face');
    expect(countsFor(1, 4, true)).toBe('wild');
    expect(countsFor(1, 4, false)).toBeNull();
    expect(countsFor(1, 1, true)).toBe('face');
    expect(countsFor(5, 4, true)).toBeNull();
  });

  it('states the outcome in words with the server’s count', () => {
    const name = (id: string) => ({ a: 'Ada', b: 'You' })[id] ?? id;
    expect(revealSummary(reveal, true, name)).toBe(
      '4 fours on the table (2 were wild ones). The bid of 3 × fours held, so you, who called liar, lose a die.',
    );
    expect(
      revealSummary(
        { ...reveal, held: false, count: 2, loser: 'a', eliminated: true },
        false,
        name,
      ),
    ).toBe(
      '2 fours on the table. The bid of 3 × fours failed, so Ada, who made the bid, loses a die. Ada is out of dice.',
    );
  });

  it('rings and labels every counting die for every player', () => {
    const base = props();
    const [self, other] = base.match.players.map((player) => player.id);
    const html = renderToStaticMarkup(
      <LiarsDiceTable
        {...withDetail(
          { ...base, match: { ...base.match, phase: 'reveal' } },
          {
            bid: { player: other, quantity: 3, face: 4 },
            bids: [{ player: other, quantity: 3, face: 4 }],
            reveal: {
              ...reveal,
              caller: self,
              bidder: other,
              loser: self,
              dice: { [self]: [1, 4, 4, 2, 6], [other]: [1, 5, 5, 3, 3] },
            },
          },
          [],
        )}
      />,
    );
    expect(html).toContain('Every die on the table');
    expect(html).toContain('so you, who called liar, lose a die.');
    // Two fours and two wild ones are ringed; each also says so in words.
    expect(html.match(/data-counts="face"/g)).toHaveLength(2);
    expect(html.match(/data-counts="wild"/g)).toHaveLength(2);
    expect(html.match(/>counts</g)).toHaveLength(2);
    expect(html.match(/>wild</g)).toHaveLength(2);
    expect(html).toContain('aria-label="one, wild, counts"');
  });
});
