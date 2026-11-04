import { z } from 'zod';
import type { Card, Match, Room } from '@games/api-client';
import { playerName } from '../types';

/**
 * Uno and Uno No Mercy presentation from the viewer's authorized projection.
 * Descriptions only: the server decides legal moves and every outcome.
 */

const eventSchema = z.object({
  type: z.enum([
    'opening',
    'play',
    'draw',
    'choose',
    'accept',
    'challenge',
    'catch_uno',
    'end_turn',
  ]),
  actor: z.string().nullable(),
  kind: z.string().nullable(),
  color: z.string().nullable(),
  // The colour current before this play: what a Wild +4 challenge is judged against.
  from_color: z.string().nullable().default(null),
  target: z.string().nullable(),
  outcome: z.enum(['succeeded', 'failed']).nullable(),
  discarded: z.number().int().nonnegative(),
  skipped: z.array(z.string()),
  drew: z.record(z.string(), z.number().int().nonnegative()),
  eliminated: z.array(z.string()),
});
// Older saved projections have none of these fields; they degrade to "nothing new".
const extrasSchema = z.object({
  last_event: eventSchema.nullable().catch(null).default(null),
  you_drew: z.array(z.string()).catch([]).default([]),
  out: z
    .array(z.object({ player: z.string(), cards: z.number().int().nonnegative() }))
    .catch([])
    .default([]),
});

export type UnoEvent = z.infer<typeof eventSchema>;

export function unoExtras(detail: Match['detail']) {
  const data = extrasSchema.parse(detail ?? {});
  return { lastEvent: data.last_event, youDrew: data.you_drew, out: data.out };
}

const COLOURS = ['red', 'yellow', 'green', 'blue', 'wild'] as const;
const VALUES = [
  'Skip',
  'Reverse',
  '+2',
  'Discard all',
  'Skip everyone',
  '+4',
  'Wild',
  'Reverse +4',
  '+6',
  '+10',
  'Colour roulette',
];
const valueRank = (value: string) =>
  /^\d$/.test(value) ? Number(value) : 10 + Math.max(0, VALUES.indexOf(value));
const colourRank = (color: string) => {
  const index = COLOURS.indexOf(color as (typeof COLOURS)[number]);
  return index < 0 ? COLOURS.length : index;
};

/**
 * Cards you can play now first, then by colour and value. A drawn or stackable
 * card therefore always starts the row, where the instruction points.
 */
export function arrangeHand(cards: Card[], playable: ReadonlySet<string>) {
  return [...cards].sort(
    (a, b) =>
      Number(playable.has(b.id)) - Number(playable.has(a.id)) ||
      colourRank(a.color) - colourRank(b.color) ||
      valueRank(a.value) - valueRank(b.value) ||
      a.id.localeCompare(b.id),
  );
}

export function colourCounts(cards: Card[]) {
  return COLOURS.map((color) => ({
    color,
    count: cards.filter((card) => card.color === color).length,
  })).filter((entry) => entry.count > 0);
}

export const colourName = (color: string | null | undefined) =>
  color ? color.charAt(0).toUpperCase() + color.slice(1) : '';

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;
const cards = (count: number) => plural(count, 'card');

interface Context {
  match: Match;
  room: Room;
  selfId: string;
  mercy: boolean;
  limit: number | null;
}

function people({ room, selfId }: Pick<Context, 'room' | 'selfId'>) {
  const name = (id: string | null | undefined) =>
    !id ? 'A player' : id === selfId ? 'you' : playerName(room, id);
  const Name = (id: string | null | undefined) => {
    const value = name(id);
    return value === 'you' ? 'You' : value;
  };
  return { name, Name };
}

/** Players still in, in seat order. */
export function activeOrder(match: Match) {
  return match.players.filter((player) => !player.eliminated);
}

/** The next active seat after `id` in the current direction. */
export function seatAfter(match: Match, id: string, direction: number, steps = 1) {
  const order = activeOrder(match);
  const index = order.findIndex((player) => player.id === id);
  if (index < 0 || !order.length) return null;
  return order[(((index + direction * steps) % order.length) + order.length) % order.length].id;
}

const countOf = (match: Match, id: string | null | undefined) =>
  match.players.find((player) => player.id === id)?.count ?? 0;

/**
 * The public outcome of the latest action, said from the viewer's seat. The
 * banner already attributes the move itself ("Dev played: Red 7"), so this is
 * only what that line cannot say: who drew how many, who swapped or was
 * skipped, a challenge result, an elimination, or the card you just drew.
 */
export function describeEvent(
  event: UnoEvent | null,
  context: Context & { youDrew: Card[]; direction: number; sevenZero: boolean },
): string | null {
  if (!event) return null;
  const { match, selfId, mercy } = context;
  const { name, Name } = people(context);
  const is = (id: string | null | undefined) => (id === selfId ? 'are' : 'is');
  const out = (id: string) =>
    event.eliminated.includes(id) ? ` ${id === selfId ? 'You are' : `${Name(id)} is`} out.` : '';
  const drew = (id: string) => event.drew[id] ?? 0;
  const actor = event.actor;
  switch (event.type) {
    case 'opening': {
      const first = event.skipped[0];
      if (event.kind === 'draw2' && first)
        return `The opening +2 made ${name(first)} draw 2 and skip a turn.`;
      if (event.kind === 'skip' && first) return `The opening Skip skipped ${name(first)}.`;
      if (event.kind === 'reverse') return 'The opening Reverse turned play counterclockwise.';
      return null;
    }
    case 'challenge': {
      const target = event.target;
      if (event.outcome === 'succeeded')
        return `Challenge succeeded: ${name(target)} could have matched, so ${name(target)} drew ${drew(target || '') || 4}.`;
      return `Challenge failed: ${name(actor)} drew ${drew(actor || '') || 6}.`;
    }
    case 'accept':
      return null;
    case 'catch_uno':
      return `${Name(actor)} caught ${name(event.target)} without UNO: ${name(event.target)} drew ${drew(event.target || '') || 2}.`;
    case 'choose':
      if (event.kind === 'opening') return null;
      return `${Name(actor)} named ${colourName(event.color)} and drew ${cards(drew(actor || ''))}.${out(actor || '')}`;
    case 'end_turn':
      return null;
    case 'draw': {
      const count = drew(actor || '');
      if (actor !== selfId)
        return event.eliminated.includes(actor || '')
          ? `${Name(actor)} drew ${count} and is out with ${cards(countOf(match, actor))}.`
          : null;
      if (event.kind === 'penalty')
        return `You drew ${count}.${event.eliminated.includes(selfId) ? ' You are out.' : ''}`;
      if (context.youDrew.length) {
        const last = context.youDrew.at(-1)!;
        const list =
          context.youDrew.length > 1
            ? `${cards(context.youDrew.length)}, ending with ${last.label}`
            : last.label;
        if (event.eliminated.includes(selfId)) return `You drew ${list}. You are out.`;
        return match.currentPlayer === selfId
          ? `You drew ${list}. It can be played now.`
          : `You drew ${list}. It doesn’t match, so your turn passed.`;
      }
      return null;
    }
    case 'play': {
      const kind = event.kind || '';
      if (event.eliminated.length)
        return event.eliminated.map((id) => `${Name(id)} ${is(id)} out.`).join(' ');
      // No Mercy's final card wins before any swap or pass happens.
      const won = mercy && match.phase === 'finished';
      if (kind === '7' && event.target && !won) {
        if (actor === selfId)
          return `You swapped hands with ${name(event.target)}: you now hold ${cards(countOf(match, selfId))}.`;
        if (event.target === selfId)
          return `${Name(actor)} swapped hands with you: you now hold ${cards(countOf(match, selfId))}.`;
        return `${Name(actor)} swapped hands with ${name(event.target)} (now ${countOf(match, actor)} and ${countOf(match, event.target)}).`;
      }
      if (kind === '0' && (mercy || context.sevenZero) && !won) {
        const way = context.direction === 1 ? 'clockwise' : 'counterclockwise';
        const from = activeOrder(match).some((player) => player.id === selfId)
          ? seatAfter(match, selfId, -context.direction)
          : null;
        return from && from !== selfId
          ? `Hands passed ${way}: you got ${name(from)}’s hand (${cards(countOf(match, selfId))}).`
          : `Every hand passed ${way}.`;
      }
      if (kind === 'discard_all' && event.discarded)
        return `${Name(actor)} also discarded ${plural(event.discarded, `${event.color} card`)}.`;
      if (kind === 'skip_all')
        return actor === selfId
          ? 'You skipped everyone: play again.'
          : `${Name(actor)} skipped everyone and plays again.`;
      if (event.skipped.length === 1)
        return `${Name(event.skipped[0])} ${event.skipped[0] === selfId ? 'were' : 'was'} skipped.`;
      const drawn = Object.entries(event.drew);
      if (drawn.length) return drawn.map(([id, count]) => `${Name(id)} drew ${count}.`).join(' ');
      return null;
    }
  }
}

/** What is waiting on the table, for everyone (the penalty, a challenge window, roulette). */
export function tableSituation(
  context: Context & {
    penalty: number;
    pendingKind: string | null;
    actor: string | null;
    stackDrawTwo: boolean;
    /** Whether the viewer, when it is their turn, holds a card that can stack. */
    canStack?: boolean;
  },
) {
  const { match, selfId, limit, penalty, pendingKind } = context;
  const { name, Name } = people(context);
  const current = match.currentPlayer;
  if (!current || match.phase === 'finished') return null;
  const you = current === selfId;
  if (pendingKind === 'opening_color')
    return you ? 'Choose the opening colour.' : `${Name(current)} chooses the opening colour.`;
  const whose = (id: string | null) => (!id ? 'the' : id === selfId ? 'your' : `${name(id)}’s`);
  if (pendingKind === 'challenge')
    return you
      ? `${context.actor ? `${Name(context.actor)}’s` : 'The'} Wild +4 is on you: take 4 or challenge.`
      : `${Name(current)} takes 4 or challenges ${whose(context.actor)} Wild +4.`;
  if (pendingKind === 'roulette')
    return you
      ? 'Colour roulette: name a colour, then draw until it appears.'
      : `${Name(current)} names a colour and draws until it appears.`;
  if (penalty > 0) {
    const total = countOf(match, current) + penalty;
    const danger =
      limit && total >= limit ? ` Drawing puts ${name(current)} out (${total} cards).` : '';
    const stack = context.mercy || context.stackDrawTwo ? ' or stack' : '';
    return you
      ? `+${penalty} is on you: draw ${penalty}${context.canStack === false ? '' : stack}.${danger}`
      : `${Name(current)} must draw ${penalty}${stack}.${danger}`;
  }
  return null;
}

/**
 * What the selected card would do here, with names and counts from the public
 * table and the viewer's own hand (who plays next, who draws, how many cards move).
 */
export function cardConsequence(
  card: Card,
  context: Context & {
    hand: Card[];
    color: string;
    penalty: number;
    direction: number;
    sevenZero: boolean;
    stackDrawTwo: boolean;
  },
): string | null {
  const { match, selfId, mercy, limit, hand } = context;
  const { name, Name } = people(context);
  const active = activeOrder(match);
  const next = seatAfter(match, selfId, context.direction);
  const two = active.length === 2;
  const held = hand.length - 1;
  const after = (id: string | null, extra: number) =>
    id && limit ? ` ${Name(id)} would hold ${countOf(match, id) + extra}; out at ${limit}.` : '';
  const matchNext = `${Name(next)} plays next and must match ${colourName(card.color)} or ${card.value}.`;
  // Classic 7/0 still hands an empty hand on; every other last card simply wins.
  if (held === 0 && (mercy || !context.sevenZero || !['7', '0'].includes(card.value)))
    return 'Your last card: play it to win.';
  switch (card.value) {
    case '7':
      if (!(mercy || context.sevenZero)) return matchNext;
      return held === 0
        ? mercy
          ? 'Your last card: you win before any swap.'
          : 'Your empty hand goes to the player you pick, so they win.'
        : `Swap your other ${cards(held)} for the hand of the player you pick.`;
    case '0': {
      if (!(mercy || context.sevenZero)) return matchNext;
      if (held === 0)
        return mercy
          ? 'Your last card: you win before hands pass.'
          : `Your empty hand passes to ${name(next)}, so they win.`;
      const from = seatAfter(match, selfId, -context.direction);
      return `Every hand passes ${context.direction === 1 ? 'clockwise' : 'counterclockwise'}: your ${cards(held)} go to ${name(next)}; you get ${name(from)}’s ${countOf(match, from)}.`;
    }
    case 'Skip':
      return two
        ? `${Name(next)} loses their turn; you play again.`
        : `${Name(next)} loses their turn; ${name(seatAfter(match, selfId, context.direction, 2))} plays next.`;
    case 'Reverse':
      return two
        ? `With two players, Reverse skips ${name(next)}: you play again.`
        : `Play turns ${context.direction === 1 ? 'counterclockwise' : 'clockwise'}; ${name(seatAfter(match, selfId, -context.direction))} plays next.`;
    case 'Skip everyone':
      return 'Everyone else is skipped: you play again.';
    case 'Discard all': {
      const same = hand.filter((item) => item.color === card.color && item.id !== card.id).length;
      return same
        ? `Also discards your other ${plural(same, `${card.color} card`)}.`
        : `You hold no other ${card.color} cards to discard.`;
    }
    case 'Colour roulette':
      return `${Name(next)} names a colour and draws until it appears.${limit ? ` ${Name(next)} holds ${countOf(match, next)}; out at ${limit}.` : ''}`;
    case 'Wild':
      return 'Choose the colour the next player must match.';
    default:
      break;
  }
  if (/^\d$/.test(card.value)) return matchNext;
  const draw = card.value.match(/^\+(\d+)$/) || (card.value === 'Reverse +4' ? ['', '4'] : null);
  if (!draw) return null;
  const amount = Number(draw[1]);
  if (!mercy && card.color === 'wild') {
    const holds = hand.some((item) => item.id !== card.id && item.color === context.color);
    const colour = colourName(context.color);
    return `Choose a colour. ${Name(next)} takes 4 or challenges: ${
      holds
        ? `you still hold ${colour}, so a challenge would make you draw 4`
        : `you hold no ${colour}, so a challenge would fail and ${name(next)} draws 6`
    }.`;
  }
  const total = context.penalty + amount;
  if (card.value === 'Reverse +4' && two)
    return `With two players the reverse sends +${total} back to you.`;
  const victim = card.value === 'Reverse +4' ? seatAfter(match, selfId, -context.direction) : next;
  if (!mercy)
    return context.stackDrawTwo
      ? `${Name(victim)} draws ${total} or stacks another +2.`
      : `${Name(victim)} draws ${total} and loses their turn.`;
  return `${Name(victim)} must draw ${total} or stack +${amount} or more.${after(victim, total)}`;
}

/** The smallest draw card that may stack on the current penalty (the top card's draw). */
export function stackFloor(discard: Card | null) {
  if (!discard) return 0;
  if (discard.value === 'Reverse +4') return 4;
  const draw = discard.value.match(/^\+(\d+)$/);
  return draw ? Number(draw[1]) : 0;
}

/** Why a selected card has no move right now. */
export function unplayableReason(
  card: Card,
  context: {
    mercy: boolean;
    stackDrawTwo: boolean;
    color: string;
    penalty: number;
    drawn: boolean;
    discard: Card | null;
  },
) {
  if (context.penalty > 0)
    return context.mercy
      ? `Only a draw card of +${stackFloor(context.discard)} or more can stack on this +${context.penalty}.`
      : context.stackDrawTwo
        ? `Only a +2 can stack on this +${context.penalty}.`
        : `Nothing stacks here: draw ${context.penalty}.`;
  if (context.drawn) return 'Only the card you drew can be played now.';
  const top = context.discard;
  const match = top && top.color !== 'wild' ? ` or ${top.value}` : '';
  return `${card.label} can’t be played now: match ${colourName(context.color)}${match}.`;
}
