import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { mapRoom } from '@games/api-client/mappers';
import { dealDetails, type Match, type Room } from '@games/api-client';
import { DealTable } from '@/games/deal/DealTable';
import { denominations, tableStatus } from '@/games/deal/table-status';
import { dealScenarios } from '@/stories/generated/deal-scenarios';
import { distinctNames } from '@/games/shared/seat-names';
import { playerName } from '@/games/types';

function scenario(id: string) {
  const fixture = dealScenarios.find((item) => item.id === id)!;
  const room = mapRoom(fixture.room);
  return { fixture, room, match: room.game!, selfId: fixture.selfId };
}
/** Status copy uses the table's short, still-distinct seat labels. */
const name = (room: Room, id: string) =>
  distinctNames(room.members.map((member) => playerName(room, member.id)))[
    room.members.findIndex((member) => member.id === id)
  ];
/** The same public table seen from a seat that has no legal action. */
const watching = (match: Match): Match => ({ ...match, actions: [] });
const status = (match: Match, room: Room, selfId: string) =>
  tableStatus(match, room, selfId, dealDetails(match.detail));

describe('Deal table status, from every seat', () => {
  it('labels a normal turn and its remaining plays with their owner', () => {
    const { room, match, selfId } = scenario('placement');
    const mine = status(match, room, selfId);
    expect(mine).toMatchObject({ text: 'Your turn', title: 'Your move', tone: 'active' });
    expect(mine.plays).toEqual({ left: 3, owner: 'you', mine: true });
    const other = room.members.find((member) => member.id !== selfId)!.id;
    const theirs = status(watching(match), room, other);
    expect(theirs.text).toBe(`${name(room, selfId)}’s turn`);
    expect(theirs.plays).toEqual({ left: 3, owner: name(room, selfId), mine: false });
    expect(theirs.hint).toBe('You can inspect any public card while you wait.');
    expect(theirs.hint).not.toContain('Select a card');
  });

  it('names who must answer a pending action and on whose behalf', () => {
    const { room, match, selfId } = scenario('crowded-sly-response');
    const effect = dealDetails(match.detail).pendingAction!;
    const actor = name(room, effect.actor);
    expect(status(match, room, selfId)).toMatchObject({
      text: `${actor} played Sly deal on you`,
      title: 'Your response',
      plays: null,
    });
    const attacker = status(watching(match), room, effect.actor);
    expect(attacker.text).toBe(`Waiting for ${name(room, selfId)} to respond to your Sly deal`);
    expect(attacker.title).toBe(`Waiting for ${name(room, selfId)}`);
    const bystander = room.members.find(
      (member) => ![effect.actor, effect.target].includes(member.id),
    )!.id;
    expect(status(watching(match), room, bystander).text).toBe(
      `${actor}’s Sly deal on ${name(room, effect.target)}: waiting for ${name(room, selfId)}`,
    );
  });

  it('states a bill, a block and a payment for the payer, the collector and everyone else', () => {
    const counter = scenario('counter');
    const collector = dealDetails(counter.match.detail).pendingAction!.actor;
    expect(status(counter.match, counter.room, counter.selfId).text).toBe(
      `${name(counter.room, collector)} charges you 5M`,
    );
    const chain = scenario('counter-chain');
    const blocked = dealDetails(chain.match.detail).pendingAction!;
    expect(status(chain.match, chain.room, chain.selfId).text).toBe(
      `${name(chain.room, blocked.target)} blocked your 5M bill with Just Say No`,
    );
    const pay = scenario('payment-bank');
    expect(status(pay.match, pay.room, pay.selfId)).toMatchObject({
      text: `You owe ${name(pay.room, collector)} 5M`,
      title: 'You owe 5M',
    });
    expect(status(watching(pay.match), pay.room, collector).text).toBe(
      `Waiting for ${name(pay.room, pay.selfId)} to pay you 5M`,
    );
  });

  it('tells only the discarding player how many cards to drop', () => {
    const { room, match, selfId } = scenario('information-hand');
    const discarding: Match = { ...match, phase: 'discard' };
    const own = status(discarding, room, selfId);
    expect(own.text).toBe(`Discard ${match.hand.length - 7} cards: you can keep 7`);
    expect(own.plays).toBeNull();
    const other = room.members.find((member) => member.id !== selfId)!.id;
    expect(status(watching(discarding), room, other).text).toBe(
      `${name(room, selfId)} is discarding down to 7 cards`,
    );
  });

  it('warns before ending a turn that would force a discard', () => {
    const { room, match, selfId } = scenario('information-hand');
    expect(match.hand.length).toBeGreaterThan(7);
    expect(status(match, room, selfId).text).toBe(
      `Your turn: ending now means discarding ${match.hand.length - 7} cards`,
    );
  });

  it('names the winner and their complete sets once the match is over', () => {
    const { room, match, selfId } = scenario('collections');
    const finished: Match = { ...match, phase: 'finished', winners: [selfId], actions: [] };
    const own = status(finished, room, selfId);
    expect(own).toMatchObject({ text: 'You won with Brown', tone: 'complete', plays: null });
    const other = room.members.find((member) => member.id !== selfId)!.id;
    expect(status(finished, room, other).text).toBe(`${name(room, selfId)} won with Brown`);
    const html = renderToStaticMarkup(
      <DealTable
        room={room}
        match={finished}
        selfId={other}
        pending={false}
        onAction={() => undefined}
      />,
    );
    expect(html).not.toContain('plays left');
    expect(html).not.toContain('End turn');
    expect(html).toMatch(
      /<section[^>]*hidden=""[^>]*aria-label="Your actions"|aria-label="Your actions"[^>]*hidden=""/,
    );
  });

  it('groups a bank by printed value', () => {
    const { match, selfId } = scenario('crowded-classic');
    const bank = match.players.find((player) => player.id === selfId)!.bank;
    expect(denominations(bank).map((note) => [note.label, note.count])).toEqual([
      ['1M', 3],
      ['2M', 5],
      ['3M', 2],
    ]);
  });
});

describe('Deal table layout', () => {
  it('puts the hand directly after the shared centre and before your own table', () => {
    const { room, match, selfId } = scenario('crowded-classic');
    const html = renderToStaticMarkup(
      <DealTable
        room={room}
        match={match}
        selfId={selfId}
        pending={false}
        onAction={() => undefined}
      />,
    );
    const order = [
      'deal-opponents',
      'deal-center',
      'deal-hand-dock',
      'deal-command-dock',
      'deal-board-scroll',
    ].map((name) =>
      html.indexOf(`class="${name}`) >= 0
        ? html.indexOf(`class="${name}`)
        : html.indexOf(` ${name}"`),
    );
    expect(order.every((index) => index >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(html).not.toContain('On the table');
    expect(html).toContain('Draw pile, 79 cards');
  });

  it('shows each opponent’s bank and every set as named text, never colour alone', () => {
    const { room, match, selfId } = scenario('crowded-opponent-classic');
    const html = renderToStaticMarkup(
      <DealTable
        room={room}
        match={match}
        selfId={selfId}
        pending={false}
        onAction={() => undefined}
      />,
    );
    for (const label of [
      'Brown',
      'Lt blue',
      'Pink',
      'Orange',
      'Red',
      'Yellow',
      'Green',
      'Dk blue',
      'Rail',
      'Utility',
    ])
      expect(html).toContain(`<span>${label}</span>`);
    expect(html).toMatch(/Bank<\/span><b>19M<\/b>/);
    expect(html).toContain('1M ×3 · 2M ×5 · 3M ×2');
    // A waiting seat sees whose turn it is, never an instruction to play.
    expect(html).not.toContain('Select a card in your hand');
    expect(html).toContain('You can inspect any public card while you wait.');
  });

  it('shows No Mercy debts on the debtor’s row and in the debtor’s own dock', () => {
    const { room, match, selfId } = scenario('no-mercy');
    const debtor = match.players.find((player) => player.id !== selfId)!.id;
    const creditor = selfId;
    const owing: Match = {
      ...match,
      detail: {
        ...match.detail,
        debts: { ...(match.detail.debts as object), [debtor]: [creditor] },
      },
    };
    const html = renderToStaticMarkup(
      <DealTable
        room={room}
        match={owing}
        selfId={selfId}
        pending={false}
        onAction={() => undefined}
      />,
    );
    expect(html).toContain('Owes you');
  });
});
