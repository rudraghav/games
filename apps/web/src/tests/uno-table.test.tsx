import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { mapRoom } from '@games/api-client/mappers';
import type { ActionOption, Card, Match } from '@games/api-client';
import { fixtures } from '@/stories/generated/rooms';
import { CardTable } from '@/games/shared/CardTable';
import {
  arrangeHand,
  cardConsequence,
  describeEvent,
  tableSituation,
  unoExtras,
  type UnoEvent,
} from '@/games/shared/uno-view';

function table(game: 'uno' | 'uno-no-mercy', seats: 'min' | 'max' = 'max') {
  const fixture = fixtures.find(
    (item) =>
      item.room.game_id === game &&
      (seats === 'max' ? item.room.capacity > 2 : item.room.capacity === 2),
  )!;
  const room = mapRoom(fixture.room);
  return { room, match: room.game!, selfId: fixture.selfId };
}
const option = (value: Partial<ActionOption['value']>, label: string): ActionOption => ({
  label,
  value: {
    type: 'play',
    card: '',
    target: '',
    color: '',
    choice: '',
    amount: 0,
    slot: 0,
    cards: [],
    groups: [],
    ...value,
  } as ActionOption['value'],
  input: null,
  eligibleCards: [],
  minimum: null,
  maximum: null,
  step: 1,
});
const event = (value: Partial<UnoEvent>): UnoEvent => ({
  type: 'play',
  actor: null,
  kind: null,
  color: null,
  from_color: null,
  target: null,
  outcome: null,
  discarded: 0,
  skipped: [],
  drew: {},
  eliminated: [],
  ...value,
});
const card = (id: string, color: string, value: string): Card => ({
  id,
  label: `${color[0].toUpperCase()}${color.slice(1)} ${value}`,
  value,
  color,
  subtitle: 'UNO',
  suit: '',
  colors: [],
  effect: '',
  setName: null,
  setSize: null,
  rentLadder: [],
});

describe('Uno presentation from the authorized projection', () => {
  it('validates the public event and keeps older projections usable', () => {
    expect(unoExtras({ color: 'red' })).toEqual({ lastEvent: null, youDrew: [], out: [] });
    expect(unoExtras({ last_event: { type: 'peek_at_deck' } }).lastEvent).toBeNull();
    const parsed = unoExtras({
      last_event: event({ type: 'challenge', actor: 'a', target: 'b', outcome: 'failed' }),
      you_drew: ['red:1:0'],
      out: [{ player: 'c', cards: 27 }],
    });
    expect(parsed.lastEvent?.outcome).toBe('failed');
    expect(parsed.out).toEqual([{ player: 'c', cards: 27 }]);
  });

  it('puts playable cards first, then groups the rest by colour and value', () => {
    const hand = [
      card('blue:7:0', 'blue', '7'),
      card('red:9:0', 'red', '9'),
      card('wild:wild:0', 'wild', 'Wild'),
      card('red:2:0', 'red', '2'),
      card('green:skip:0', 'green', 'Skip'),
    ];
    expect(arrangeHand(hand, new Set(['green:skip:0'])).map((item) => item.id)).toEqual([
      'green:skip:0',
      'red:2:0',
      'red:9:0',
      'blue:7:0',
      'wild:wild:0',
    ]);
  });

  it('attributes outcomes the last-move line cannot show', () => {
    const { room, match, selfId } = table('uno');
    const [other, third] = match.players.filter((player) => player.id !== selfId);
    const name = (id: string) => room.members.find((member) => member.id === id)!.name;
    const context = {
      match,
      room,
      selfId,
      mercy: false,
      limit: null,
      youDrew: [],
      direction: 1,
      sevenZero: true,
    };
    expect(
      describeEvent(
        event({
          type: 'challenge',
          actor: other.id,
          target: selfId,
          outcome: 'succeeded',
          drew: { [selfId]: 4 },
        }),
        context,
      ),
    ).toBe('Challenge succeeded: you could have matched, so you drew 4.');
    expect(
      describeEvent(
        event({ type: 'catch_uno', actor: other.id, target: third.id, drew: { [third.id]: 2 } }),
        context,
      ),
    ).toBe(`${name(other.id)} caught ${name(third.id)} without UNO: ${name(third.id)} drew 2.`);
    expect(describeEvent(event({ actor: other.id, kind: '7', target: selfId }), context)).toContain(
      `${name(other.id)} swapped hands with you: you now hold`,
    );
    expect(describeEvent(event({ actor: other.id, kind: '0' }), context)).toMatch(
      /^Hands passed clockwise: you got .+’s hand/,
    );
    // A plain move is already attributed by the banner, so the table adds nothing.
    expect(describeEvent(event({ actor: other.id, kind: '5' }), context)).toBeNull();
    expect(describeEvent(event({ type: 'accept', actor: other.id }), context)).toBeNull();
  });

  it('tells bystanders who owes a penalty instead of instructing them to draw', () => {
    const { room, match, selfId } = table('uno-no-mercy');
    const victim = match.players.find((player) => player.id !== selfId)!;
    const situation = tableSituation({
      match: { ...match, currentPlayer: victim.id },
      room,
      selfId,
      mercy: true,
      limit: 25,
      penalty: 25,
      pendingKind: null,
      actor: null,
      stackDrawTwo: false,
    });
    expect(situation).toMatch(/must draw 25 or stack\. Drawing puts .+ out \(\d+ cards\)\./);
    expect(situation).not.toMatch(/^Draw/);
  });

  it('names who is affected and how many cards move', () => {
    const { room, match, selfId } = table('uno-no-mercy');
    const hand = [
      card('red:discard_all:0', 'red', 'Discard all'),
      card('red:1:0', 'red', '1'),
      card('red:4:0', 'red', '4'),
      card('blue:2:0', 'blue', '2'),
    ];
    const context = {
      match,
      room,
      selfId,
      mercy: true,
      limit: 25,
      hand,
      color: 'red',
      penalty: 0,
      direction: 1,
      sevenZero: false,
      stackDrawTwo: false,
    };
    expect(cardConsequence(hand[0], context)).toBe('Also discards your other 2 red cards.');
    expect(cardConsequence(card('wild:wild10:0', 'wild', '+10'), context)).toMatch(
      /^.+ must draw 10 or stack \+10 or more\. .+ would hold \d+; out at 25\.$/,
    );
    const classic = table('uno');
    expect(
      cardConsequence(card('wild:wild4:0', 'wild', '+4'), {
        ...context,
        ...classic,
        mercy: false,
        limit: null,
      }),
    ).toContain('you still hold Red, so a challenge would make you draw 4');
  });
});

describe('Uno table states', () => {
  it('warns before an eliminating draw and offers the stack that survives it', () => {
    const { room, match, selfId } = table('uno-no-mercy');
    const stack = match.hand[0];
    const html = renderToStaticMarkup(
      <CardTable
        room={room}
        selfId={selfId}
        pending={false}
        onAction={() => undefined}
        match={{
          ...match,
          currentPlayer: selfId,
          discard: card('wild:wild10:1', 'wild', '+10'),
          detail: { ...match.detail, penalty: 22, color: 'red', pending_kind: null },
          actions: [
            option({ type: 'play', card: stack.id, color: 'red' }, `Play ${stack.label} · Red`),
            option({ type: 'draw' }, 'Draw 22 — you’re out'),
          ],
        }}
      />,
    );
    expect(html).toContain('Draw 22 — you’re out');
    expect(html).toMatch(/button--danger[^>]*>Draw 22 — you’re out/);
    expect(html).toContain('Stack +10 or more to pass it on.');
    expect(html).toContain('Drawing puts you out with');
    // The stack that survives is one tap in the dock, wherever the card sits in the hand.
    expect(html).toContain(`Stack ${stack.label}…`);
  });

  it('shows an eliminated player that they are out instead of a hand and a wait', () => {
    const { room, match, selfId } = table('uno-no-mercy');
    const other = match.players.find((player) => player.id !== selfId)!;
    const html = renderToStaticMarkup(
      <CardTable
        room={room}
        selfId={selfId}
        pending={false}
        onAction={() => undefined}
        match={
          {
            ...match,
            currentPlayer: other.id,
            actions: [],
            players: match.players.map((player) =>
              player.id === selfId ? { ...player, eliminated: true, count: 43 } : player,
            ),
            detail: {
              ...match.detail,
              out: [{ player: selfId, cards: 43 }],
              last_event: event({
                type: 'draw',
                actor: selfId,
                kind: 'penalty',
                drew: { [selfId]: 22 },
                eliminated: [selfId],
              }),
            },
          } satisfies Match
        }
      />,
    );
    expect(html).toContain('You’re out');
    expect(html).toContain('Eliminated with 43 cards (out at 25)');
    expect(html).toContain('You drew 22. You are out.');
    expect(html).not.toContain('aria-label="Your hand"');
    expect(html).not.toContain('Waiting for the next move');
  });

  it('keeps swap targets out of the dock until the 7 is selected', () => {
    const { room, match, selfId } = table('uno');
    const seven = card('red:7:1', 'red', '7');
    const others = match.players.filter((player) => player.id !== selfId);
    const props = {
      room: { ...room, settings: { seven_zero: true } },
      selfId,
      pending: false,
      onAction: () => undefined,
      match: {
        ...match,
        currentPlayer: selfId,
        hand: [seven, ...match.hand],
        actions: [
          ...others.map((player) =>
            option({ type: 'play', card: seven.id, target: player.id }, 'Play Red 7'),
          ),
          option({ type: 'draw' }, 'Draw a card'),
        ],
      },
    };
    const html = renderToStaticMarkup(<CardTable {...props} />);
    // Selection is a viewer draft; without one the dock offers no target buttons.
    expect(html).not.toContain('Choose who to swap with');
    expect(others.length).toBeGreaterThan(3);
  });
});
