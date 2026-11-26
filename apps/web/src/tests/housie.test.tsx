import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { mapRoom } from '@games/api-client/mappers';
import { housieDetails, type Action, type ActionOption } from '@games/api-client';
import { fixtures } from '@/stories/generated/rooms';
import { HousieTable } from '@/games/housie/HousieTable';
import {
  claimOptions,
  leadMove,
  markOptions,
  prizeState,
  recentCalls,
  ticketCells,
} from '@/games/housie/housie-view';

const fixture = fixtures.find((item) => item.label === 'Housie · minimum seats')!;
const base = mapRoom(fixture.room);
const selfId = fixture.selfId;
const otherId = base.members.find((member) => member.id !== selfId)!.id;
const detail = base.game!.detail as Record<string, unknown>;
const ticket = detail.ticket as (number | null)[][];
const own = ticket.flat().filter((value): value is number => value !== null);

const option = (label: string, value: Partial<Action>): ActionOption => ({
  label,
  value: {
    type: '',
    card: '',
    target: '',
    color: '',
    choice: '',
    amount: 0,
    slot: 0,
    cards: [],
    groups: [],
    ...value,
  } as Action,
  input: null,
  minimum: null,
  maximum: null,
  step: 1,
  eligibleCards: [],
});

function render(change: Record<string, unknown>, actions: ActionOption[], current = selfId) {
  const match = {
    ...base.game!,
    currentPlayer: current,
    actions,
    detail: { ...detail, ...change },
  };
  return renderToStaticMarkup(
    <HousieTable
      room={base}
      match={match}
      selfId={selfId}
      pending={false}
      onAction={() => undefined}
    />,
  );
}

describe('Housie projection and table', () => {
  it('accepts the README contract and the generated fixtures, and refuses extra keys', () => {
    for (const item of fixtures.filter((entry) => entry.room.game_id === 'housie')) {
      const data = housieDetails(item.room.game!.detail);
      expect(data.ticket).toHaveLength(3);
      expect(data.ticket.every((row) => row.length === 9)).toBe(true);
      expect(data.ticket.flat().filter((value) => value !== null)).toHaveLength(15);
      expect(data.prizes.map((prize) => prize.key)).toEqual([
        'early_five',
        'top_line',
        'middle_line',
        'bottom_line',
        'full_house',
      ]);
    }
    // A viewer who is not seated has no ticket.
    expect(housieDetails({ ...detail, ticket: [] }).ticket).toEqual([]);
    expect(() => housieDetails({ ...detail, bag: [1, 2, 3] })).toThrow();
    expect(() => housieDetails({ ...detail, tickets: { [otherId]: ticket } })).toThrow();
    const prizes = detail.prizes as Record<string, unknown>[];
    expect(() =>
      housieDetails({ ...detail, prizes: prizes.map((prize) => ({ ...prize, next: 4 })) }),
    ).toThrow();
    expect(() => housieDetails({ ...detail, claimable: ['house'] })).toThrow();
  });

  it('renders the 3 × 9 ticket with stamps on marked numbers only', () => {
    const called = [own[0], own[1], 89];
    const html = render({ called, marked: [own[0], own[1]], last_called: 89 }, [
      option('Call the next number', { type: 'call_number' }),
    ]);
    expect(html.match(/<tr>/g)).toHaveLength(3);
    expect(html.match(/class="housie-cell"/g)).toHaveLength(27);
    expect(html.match(/data-housie-number=/g)).toHaveLength(15);
    expect(html.match(/class="housie-stamp"/g)).toHaveLength(2);
    expect(html).toContain(`data-housie-number="${own[0]}" data-marked="true"`);
    expect(html).toContain('Last number called: 89');
    expect(html).toContain('3 of 90 called');
    // One filled button: the call.
    expect(html.match(/button--primary/g)).toHaveLength(1);
    expect(html).toContain('Call the next number');
  });

  it('with auto-mark off, offers the server’s mark for the called number on the ticket', () => {
    const mark = option(`Mark ${own[2]}`, { type: 'mark', amount: own[2] });
    const change = { auto_mark: false, called: [own[2]], marked: [], last_called: own[2] };
    const data = housieDetails({ ...detail, ...change });
    const marks = markOptions([mark]);
    const cells = ticketCells(data, marks).flat();
    expect(cells.filter((cell) => cell.markable).map((cell) => cell.number)).toEqual([own[2]]);
    expect(marks.get(own[2])!.value).toMatchObject({ type: 'mark', amount: own[2] });
    expect(leadMove(data, [mark])).toEqual({ type: 'mark', number: own[2] });
    const html = render(change, [mark], otherId);
    // The ticket cell can be tapped, and the same move is a full-size labelled button.
    expect(html).toContain(`data-mark="${own[2]}"`);
    expect(html).toContain(`>Mark ${own[2]}</button>`);
    expect(html).toContain('called, not marked');
    expect(html).toContain('Caller');
  });

  it('turns only claimable prizes into claim buttons, reachable when it is not your turn', () => {
    const claim = option('Claim Early five', { type: 'claim', choice: 'early_five' });
    const call = option('Call the next number', { type: 'call_number' });
    const five = own.slice(0, 5);
    const change = { called: five, marked: five, last_called: five[4], claimable: ['early_five'] };
    const html = render(change, [claim], otherId);
    expect(html).toContain('Claim Early five');
    expect(html.match(/<button/g)).toHaveLength(1);
    expect(html.match(/button--primary/g)).toHaveLength(1);
    // With a call and a claim both offered, the claim is the filled one.
    const both = render(change, [call, claim]);
    expect(both.match(/button--primary/g)).toHaveLength(1);
    expect(both).toMatch(/button--primary[^>]*>.*Claim Early five/);
    expect(claimOptions([claim, call]).get('early_five')).toBe(claim);
  });

  it('shows winners by name and points, and a shareable prize until the next call', () => {
    const prizes = (detail.prizes as Record<string, unknown>[]).map((prize) =>
      prize.key === 'early_five'
        ? { ...prize, winners: [otherId], won_on_call: 7 }
        : prize.key === 'top_line'
          ? { ...prize, winners: [selfId, otherId], won_on_call: 3 }
          : prize,
    );
    const called = [1, 2, 3, 4, 5, 6, 7];
    const data = housieDetails({ ...detail, prizes, called });
    expect(prizeState(data.prizes[0], 7)).toBe('shareable');
    expect(prizeState(data.prizes[1], 7)).toBe('won');
    expect(prizeState(data.prizes[2], 7)).toBe('open');
    const html = render({ prizes, called, last_called: 7 }, []);
    expect(html).toContain('Dev · can be shared until the next call');
    expect(html).toContain('Won by You and Dev');
    expect(html).toContain('2 pts');
    expect(html).toContain('5 pts');
    expect(recentCalls(called)).toEqual([6, 5, 4, 3, 2]);
  });

  it('never shows another ticket or the call order', () => {
    const html = render({ called: [own[0]], marked: [own[0]], last_called: own[0] }, []);
    // Ticket numbers on screen are the viewer's own fifteen.
    const shown = [...html.matchAll(/data-housie-number="(\d+)"/g)].map((m) => Number(m[1]));
    expect(shown.sort((a, b) => a - b)).toEqual([...own].sort((a, b) => a - b));
    expect(html).not.toContain('bag');
  });
});
