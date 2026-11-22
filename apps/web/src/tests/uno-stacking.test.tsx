import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { mapRoom } from '@games/api-client/mappers';
import type { ActionOption, Card } from '@games/api-client';
import { fixtures } from '@/stories/generated/rooms';
import { CardTable } from '@/games/shared/CardTable';
import { sheddingCardInformation } from '@/games/shared/card-information';
import {
  cardConsequence,
  describeEvent,
  stackingRule,
  tableSituation,
  unoExtras,
  unplayableReason,
  type UnoEvent,
} from '@/games/shared/uno-view';

function table(game: 'uno' | 'uno-no-mercy', seats: 'min' | 'max' = 'max') {
  const fixture = fixtures.find(
    (item) =>
      item.room.game_id === game &&
      (seats === 'max' ? item.room.capacity > 2 : item.room.capacity === 2),
  )!;
  const room = mapRoom(fixture.room);
  const match = room.game!;
  const name = (id: string) => room.members.find((member) => member.id === id)!.name;
  const others = match.players.filter((player) => player.id !== fixture.selfId);
  return { room, match, selfId: fixture.selfId, name, others };
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
  missed: [],
  ...value,
});
const card = (id: string, color: string, value: string, label?: string): Card => ({
  id,
  label: label ?? `${color[0].toUpperCase()}${color.slice(1)} ${value}`,
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

describe('the stacking rule the table reads', () => {
  it('prefers the projected rule, then the saved setting, the retired key, then the default', () => {
    expect(stackingRule(false, {})).toBe(false);
    expect(stackingRule(true, {})).toBe(true);
    expect(stackingRule(false, { stack_draws: true })).toBe(true);
    expect(stackingRule(true, { stack_draws: false })).toBe(false);
    expect(stackingRule(false, { stack_draw_two: true, seven_zero: false })).toBe(true);
    expect(stackingRule(false, { stack_draw_two: false })).toBe(false);
    expect(stackingRule(true, {}, false)).toBe(false);
    expect(stackingRule(false, { stack_draws: false }, true)).toBe(true);
  });

  it('reads the public stacking and missed-turn fields and tolerates older projections', () => {
    const parsed = unoExtras({
      stacking: true,
      stack_floor: 4,
      missing_turn: ['a'],
      last_event: event({ type: 'play', actor: 'b', missed: ['a'] }),
    });
    expect(parsed.stacking).toBe(true);
    expect(parsed.stackFloor).toBe(4);
    expect(parsed.missingTurn).toEqual(['a']);
    expect(parsed.lastEvent?.missed).toEqual(['a']);
    // An event saved before the missed-turn rule has no such list.
    const older: Partial<UnoEvent> = event({ type: 'draw', actor: 'b' });
    delete older.missed;
    expect(unoExtras({ last_event: older }).lastEvent?.missed).toEqual([]);
    expect(unoExtras({ stacking: 'yes', missing_turn: 'a' })).toMatchObject({
      stacking: null,
      missingTurn: [],
    });
  });
});

describe('sentences for stacking and missed turns', () => {
  it('says who was caught, what they drew and which turn they lose', () => {
    const { room, match, selfId, name, others } = table('uno');
    const [dev, mira] = others;
    const context = {
      match,
      room,
      selfId,
      mercy: false,
      limit: null,
      youDrew: [],
      direction: 1,
      sevenZero: false,
    };
    const caught = event({
      type: 'catch_uno',
      actor: dev.id,
      target: mira.id,
      drew: { [mira.id]: 2 },
    });
    // Caught on their own turn: it ends at once.
    expect(describeEvent({ ...caught, missed: [mira.id] }, context)).toBe(
      `${name(dev.id)} caught ${name(mira.id)} without UNO: ${name(mira.id)} drew 2 and misses this turn.`,
    );
    // Caught while someone else is playing: the mark waits for their next turn.
    expect(describeEvent(caught, { ...context, missingTurn: [mira.id] })).toBe(
      `${name(dev.id)} caught ${name(mira.id)} without UNO: ${name(mira.id)} drew 2 and misses their next turn.`,
    );
    expect(
      describeEvent(
        event({ type: 'catch_uno', actor: dev.id, target: selfId, drew: { [selfId]: 2 } }),
        { ...context, missingTurn: [selfId] },
      ),
    ).toBe(`${name(dev.id)} caught you without UNO: you drew 2 and miss your next turn.`);
    expect(
      describeEvent(
        event({
          type: 'catch_uno',
          actor: dev.id,
          target: mira.id,
          drew: { [mira.id]: 2 },
          eliminated: [mira.id],
        }),
        { ...context, mercy: true, limit: 25 },
      ),
    ).toBe(
      `${name(dev.id)} caught ${name(mira.id)} without UNO: ${name(mira.id)} drew 2. ${name(mira.id)} is out.`,
    );
  });

  it('reports the turn a move passed over, alone or after its own outcome', () => {
    const { room, match, selfId, name, others } = table('uno');
    const [dev, mira, sam] = others;
    const context = {
      match,
      room,
      selfId,
      mercy: false,
      limit: null,
      youDrew: [],
      direction: 1,
      sevenZero: false,
    };
    expect(describeEvent(event({ actor: dev.id, kind: '5', missed: [mira.id] }), context)).toBe(
      `${name(mira.id)} was caught without UNO and misses this turn.`,
    );
    expect(describeEvent(event({ actor: dev.id, kind: '5', missed: [selfId] }), context)).toBe(
      'You were caught without UNO and miss this turn.',
    );
    expect(
      describeEvent(
        event({ actor: dev.id, kind: 'skip', skipped: [mira.id], missed: [sam.id] }),
        context,
      ),
    ).toBe(
      `${name(mira.id)} was skipped. ${name(sam.id)} was caught without UNO and misses this turn.`,
    );
    expect(
      describeEvent(event({ type: 'end_turn', actor: dev.id, missed: [mira.id] }), context),
    ).toBe(`${name(mira.id)} was caught without UNO and misses this turn.`);
    expect(describeEvent(event({ actor: dev.id, kind: '5' }), context)).toBeNull();
  });

  it('tells the drawer that a penalty cost the turn', () => {
    const { room, match, selfId } = table('uno');
    const context = {
      match,
      room,
      selfId,
      mercy: false,
      limit: null,
      youDrew: [],
      direction: 1,
      sevenZero: false,
    };
    expect(
      describeEvent(
        event({ type: 'draw', actor: selfId, kind: 'penalty', drew: { [selfId]: 6 } }),
        context,
      ),
    ).toBe('You drew 6 and your turn passed.');
  });

  it('offers stacking in the waiting line only when the room allows it', () => {
    const { room, match, selfId, name, others } = table('uno');
    const base = {
      room,
      selfId,
      mercy: false,
      limit: null,
      penalty: 4,
      pendingKind: null,
      actor: null,
    };
    const theirs = { ...match, currentPlayer: others[0].id };
    const yours = { ...match, currentPlayer: selfId };
    expect(tableSituation({ ...base, match: theirs, stacking: true })).toBe(
      `${name(others[0].id)} must draw 4 or stack.`,
    );
    expect(tableSituation({ ...base, match: theirs, stacking: false })).toBe(
      `${name(others[0].id)} must draw 4.`,
    );
    expect(tableSituation({ ...base, match: yours, stacking: true, canStack: true })).toBe(
      '+4 is on you: draw 4 or stack.',
    );
    expect(tableSituation({ ...base, match: yours, stacking: true, canStack: false })).toBe(
      '+4 is on you: draw 4.',
    );
    expect(tableSituation({ ...base, match: yours, stacking: false })).toBe(
      '+4 is on you: draw 4.',
    );
  });

  it('describes a draw card by the room rule in both games', () => {
    const classic = table('uno');
    const next = classic.name(classic.others[0].id);
    const hand = [
      card('red:draw2:0', 'red', '+2'),
      card('wild:wild4:0', 'wild', '+4', 'Wild +4'),
      card('red:1:0', 'red', '1'),
      card('blue:2:0', 'blue', '2'),
    ];
    const context = {
      match: classic.match,
      room: classic.room,
      selfId: classic.selfId,
      mercy: false,
      limit: null,
      hand,
      color: 'red',
      penalty: 0,
      direction: 1,
      sevenZero: false,
    };
    expect(cardConsequence(hand[0], { ...context, stacking: true })).toBe(
      `${next} must draw 2 or stack +2 or more.`,
    );
    expect(cardConsequence(hand[0], { ...context, stacking: false })).toBe(
      `${next} draws 2 and loses their turn.`,
    );
    // With stacking on a Wild +4 is a stack, not a challenge; and nothing in classic beats it.
    expect(cardConsequence(hand[1], { ...context, stacking: true, penalty: 2 })).toBe(
      `Choose a colour. ${next} must draw 6 or stack +4.`,
    );
    expect(cardConsequence(hand[1], { ...context, stacking: false })).toContain(
      `${next} takes 4 or challenges`,
    );
    const mercy = table('uno-no-mercy');
    const victim = mercy.name(mercy.others[0].id);
    const mercyContext = { ...context, ...mercy, mercy: true, limit: 25 };
    expect(
      cardConsequence(card('wild:wild6:0', 'wild', '+6', 'Wild +6'), {
        ...mercyContext,
        stacking: false,
      }),
    ).toMatch(
      new RegExp(
        `^Choose a colour\\. ${victim} draws 6 and loses their turn\\. ${victim} would hold \\d+; out at 25\\.$`,
      ),
    );
    expect(
      cardConsequence(card('blue:draw4:0', 'blue', '+4'), { ...mercyContext, stacking: true }),
    ).toMatch(new RegExp(`^${victim} must draw 4 or stack \\+4 or more\\. `));
  });

  it('names who really plays next when the next seat misses its turn', () => {
    const { room, match, selfId, name, others } = table('uno');
    const five = card('red:5:1', 'red', '5');
    const context = {
      match,
      room,
      selfId,
      mercy: false,
      limit: null,
      hand: [five, card('blue:2:0', 'blue', '2')],
      color: 'red',
      penalty: 0,
      direction: 1,
      sevenZero: false,
      stacking: false,
    };
    expect(cardConsequence(five, context)).toBe(
      `${name(others[0].id)} plays next and must match Red or 5.`,
    );
    expect(cardConsequence(five, { ...context, missingTurn: [others[0].id] })).toBe(
      `${name(others[1].id)} plays next and must match Red or 5.`,
    );
    // A draw card still lands on the very next seat, marked or not.
    expect(
      cardConsequence(card('red:draw2:0', 'red', '+2'), {
        ...context,
        missingTurn: [others[0].id],
      }),
    ).toBe(`${name(others[0].id)} draws 2 and loses their turn.`);
    const duel = table('uno', 'min');
    expect(cardConsequence(five, { ...context, ...duel, missingTurn: [duel.others[0].id] })).toBe(
      'You play again and must match Red or 5.',
    );
  });

  it('explains why a card cannot answer a penalty', () => {
    const blocked = card('red:draw2:0', 'red', '+2');
    const context = { color: 'red', penalty: 6, drawn: false, discard: null };
    expect(unplayableReason(blocked, { ...context, stacking: true, floor: 4 })).toBe(
      'Only a draw card of +4 or more can stack on this +6.',
    );
    expect(unplayableReason(blocked, { ...context, stacking: false, floor: 0 })).toBe(
      'Stack draw cards is off in this room: draw 6.',
    );
  });

  it('describes draw cards in the card tip by the room rule', () => {
    const plusTwo = card('red:draw2:0', 'red', '+2');
    const wildFour = card('wild:wild4:0', 'wild', '+4', 'Wild +4');
    expect(sheddingCardInformation(plusTwo, false, {}, 4)).toBe(
      'The next player draws two and loses their turn.',
    );
    expect(sheddingCardInformation(plusTwo, false, { stack_draws: true }, 4)).toBe(
      'The next player draws two, or stacks a +2 or Wild +4 to pass it on.',
    );
    expect(sheddingCardInformation(wildFour, false, { stack_draw_two: true }, 4)).toContain(
      'cannot be challenged while stacking is on',
    );
    expect(sheddingCardInformation(wildFour, false, {}, 4)).toContain('may challenge');
    expect(sheddingCardInformation(plusTwo, true, {}, 4)).toContain('Stack an equal or higher');
    expect(sheddingCardInformation(plusTwo, true, { stack_draws: false }, 4)).toBe(
      'The next player draws 2 and loses their turn; 25 cards means elimination.',
    );
    // The projected rule wins over whatever the room settings say.
    expect(sheddingCardInformation(plusTwo, true, {}, 4, false)).toContain('loses their turn');
  });
});

describe('the Uno table with stacking and missed turns', () => {
  const render = (
    game: 'uno' | 'uno-no-mercy',
    change: (base: ReturnType<typeof table>) => Partial<ReturnType<typeof table>['match']>,
  ) => {
    const base = table(game);
    return {
      ...base,
      html: renderToStaticMarkup(
        <CardTable
          room={base.room}
          selfId={base.selfId}
          pending={false}
          onAction={() => undefined}
          match={{ ...base.match, ...change(base) }}
        />,
      ),
    };
  };

  it('puts the playable card you just drew first in the dock, named, ahead of Pass', () => {
    const drawn = card('red:9:1', 'red', '9');
    const { html } = render('uno', ({ match, selfId }) => ({
      currentPlayer: selfId,
      hand: [...match.hand, drawn],
      detail: {
        ...match.detail,
        color: 'red',
        penalty: 0,
        pending_kind: null,
        you_drew: [drawn.id],
        last_event: event({ type: 'draw', actor: selfId, drew: { [selfId]: 1 } }),
      },
      actions: [
        option({ type: 'play', card: drawn.id }, 'Play Red 9'),
        option({ type: 'end_turn' }, 'Pass'),
      ],
    }));
    expect(html).toContain('You drew Red 9 and it fits: play it now, or pass and keep it.');
    expect(html).toContain('You drew Red 9. It can be played now.');
    expect(html.indexOf('>Play Red 9<')).toBeGreaterThan(0);
    expect(html.indexOf('>Play Red 9<')).toBeLessThan(html.indexOf('>Pass<'));
    expect(html).toMatch(/uno-card--new[^>]*aria-label="Red 9, playable, just drawn"/);
    // The drawn card leads the hand, where the instruction points.
    const first = html.match(/card-hand[^>]*>.*?aria-label="([^"]+)"/)![1];
    expect(first).toBe('Red 9, playable, just drawn');
  });

  it('makes a No Mercy draw-until-playable card the one named move', () => {
    const drawn = card('red:9:1', 'red', '9');
    const { html } = render('uno-no-mercy', ({ match, selfId }) => ({
      currentPlayer: selfId,
      hand: [...match.hand, drawn],
      detail: {
        ...match.detail,
        color: 'red',
        penalty: 0,
        pending_kind: null,
        you_drew: ['yellow:1:0', drawn.id],
        last_event: event({ type: 'draw', actor: selfId, drew: { [selfId]: 2 } }),
      },
      actions: [option({ type: 'play', card: drawn.id }, 'Play Red 9')],
    }));
    expect(html).toContain('You drew Red 9 and it fits: play it now.');
    expect(html).toContain('>Play Red 9<');
    expect(html).not.toContain('>Pass<');
  });

  it('offers a classic stack when the room allows it and a plain draw when it does not', () => {
    const wild = card('wild:wild4:0', 'wild', '+4', 'Wild +4');
    const stackable = render('uno', ({ match, selfId }) => ({
      currentPlayer: selfId,
      hand: [...match.hand, wild],
      discard: card('red:draw2:0', 'red', '+2'),
      detail: {
        ...match.detail,
        color: 'red',
        penalty: 2,
        pending_kind: null,
        stacking: true,
        stack_floor: 2,
      },
      actions: [
        ...['red', 'yellow', 'green', 'blue'].map((color) =>
          option({ type: 'play', card: wild.id, color }, `Play Wild +4 · ${color}`),
        ),
        option({ type: 'draw' }, 'Draw 2'),
      ],
    }));
    expect(stackable.html).toContain('Stack +2 or more to pass it on. Drawing passes your turn.');
    expect(stackable.html).toContain('Stack Wild +4…');
    expect(stackable.html).toContain('+2 is on you: draw 2 or stack.');
    const plain = render('uno', ({ match, selfId }) => ({
      currentPlayer: selfId,
      hand: [...match.hand, wild],
      discard: card('red:draw2:0', 'red', '+2'),
      detail: {
        ...match.detail,
        color: 'red',
        penalty: 2,
        pending_kind: null,
        stacking: false,
        stack_floor: 0,
      },
      actions: [option({ type: 'draw' }, 'Draw 2')],
    }));
    expect(plain.html).toContain('Draw 2; then your turn passes.');
    expect(plain.html).toContain('+2 is on you: draw 2.');
    expect(plain.html).not.toContain('Stack Wild');
  });

  it('tells a No Mercy room with stacking off to draw, without a stack hint', () => {
    const { html, name, others } = render('uno-no-mercy', ({ match, others: seats }) => ({
      currentPlayer: seats[0].id,
      actions: [],
      discard: card('wild:wild6:0', 'wild', '+6', 'Wild +6'),
      detail: { ...match.detail, penalty: 6, pending_kind: null, stacking: false, stack_floor: 0 },
    }));
    expect(html).toContain(`${name(others[0].id)} must draw 6.`);
    expect(html).not.toContain('or stack');
  });

  it('marks the seat that misses a turn for everyone and tells that player why they wait', () => {
    const watching = render('uno', ({ match, others: seats }) => ({
      currentPlayer: seats[0].id,
      actions: [],
      detail: {
        ...match.detail,
        pending_kind: null,
        penalty: 0,
        missing_turn: [seats[1].id],
        next_player: seats[2].id,
      },
    }));
    const marked = watching.name(watching.others[1].id);
    expect(watching.html).toContain('Misses next turn');
    expect(watching.html).toContain(`${marked} misses their next turn (caught without UNO)`);
    expect(watching.html).toMatch(new RegExp(`aria-label="${marked}[^"]*, Misses next turn, `));
    const caught = render('uno', ({ match, selfId, others: seats }) => ({
      currentPlayer: seats[0].id,
      actions: [],
      detail: { ...match.detail, pending_kind: null, penalty: 0, missing_turn: [selfId] },
    }));
    expect(caught.html).toContain('You were caught without UNO, so you miss your next turn.');
    expect(caught.html).toContain('You miss your next turn (caught without UNO)');
    expect(caught.html).toMatch(/aria-label="[^"]*\(you\), Misses next turn, /);
  });

  it('warns about the missed turn before the UNO call and on the catch', () => {
    const calling = render('uno', ({ match, others: seats }) => ({
      currentPlayer: seats[0].id,
      hand: match.hand.slice(0, 1),
      actions: [option({ type: 'uno' }, 'UNO!')],
    }));
    expect(calling.html).toContain(
      'One card left: call UNO! now, or anyone can catch you: 2 cards and a missed turn.',
    );
    const catching = render('uno', ({ others: seats }) => ({
      currentPlayer: seats[0].id,
      actions: [option({ type: 'catch_uno', target: seats[1].id }, 'Catch missed UNO')],
    }));
    expect(catching.html).toContain('catch them for +2 and a missed turn.');
  });
});
