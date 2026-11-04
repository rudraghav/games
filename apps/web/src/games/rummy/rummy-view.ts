import { z } from 'zod';
import type { Card, Match } from '@games/api-client';

/** The engine stores the wild rank as a card-id rank character ("T" for tens). */
const rankNames: Record<string, string> = { T: '10', J: 'J', Q: 'Q', K: 'K', A: 'A' };
const pluralNames: Record<string, string> = { A: 'aces', K: 'kings', Q: 'queens', J: 'jacks' };

export function wildValue(rank: string) {
  return rankNames[rank] ?? rank;
}

/** "every 10", "all aces": the wild rank in words a new player can read. */
export function wildPlural(rank: string) {
  return pluralNames[rank] ?? `${wildValue(rank)}s`;
}

export function isPrintedJoker(card: Pick<Card, 'id'>) {
  return card.id.startsWith('JK');
}

/** Matches the engine's `is_joker`: printed jokers and every card of the wild rank. */
export function isJokerCard(card: Pick<Card, 'id'>, wildRank: string) {
  return isPrintedJoker(card) || card.id[0] === wildRank;
}

const outSchema = z
  .record(
    z.string(),
    z.object({
      penalty: z.number().int().nonnegative(),
      reason: z.enum(['drop', 'false_declaration']),
    }),
  )
  .catch({});
export type RummyOut = z.infer<typeof outSchema>[string];

/** Public penalties for players who dropped or declared falsely (absent on older saves). */
export function rummyOut(detail: Match['detail']): Record<string, RummyOut> {
  return outSchema.parse((detail as Record<string, unknown>).out ?? {});
}

export function outCaption(out: RummyOut) {
  return out.reason === 'false_declaration'
    ? `False declaration · −${out.penalty}`
    : `Dropped · −${out.penalty}`;
}

export type CardMark = 'wild' | 'win' | 'taken' | 'new';
const markText: Record<CardMark, string> = {
  wild: 'wild joker',
  win: 'discard it to declare',
  taken: 'taken from the discard',
  new: 'just drawn',
};

/** The card's own name plus what it means for this decision, for assistive technology. */
export function markedLabel(card: Card, marks: CardMark[]) {
  const said = marks.filter((mark) => !(mark === 'wild' && isPrintedJoker(card)));
  return said.length
    ? `${card.label} (${said.map((mark) => markText[mark]).join(', ')})`
    : card.label;
}

export const sortRanks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '★'];
export type RummySort = 'dealt' | 'suit' | 'rank';

export function arrangeCards(cards: Card[], sort: RummySort) {
  return sort === 'dealt'
    ? cards
    : [...cards].sort((a, b) => {
        const rankDifference = sortRanks.indexOf(a.value) - sortRanks.indexOf(b.value);
        return sort === 'suit'
          ? a.suit.localeCompare(b.suit) || rankDifference
          : rankDifference || a.suit.localeCompare(b.suit);
      });
}

export const meldNames = {
  pure_sequence: 'Pure sequence',
  sequence: 'Sequence',
  set: 'Set',
} as const;

/** Cards in a meld, in rank order, so "5♦, 6♦, 7♦, 8♦" reads as the sequence it is. */
export function orderedMeld(ids: string[], cardOf: (id: string) => Card | undefined) {
  const values = new Set(ids.map((id) => cardOf(id)?.value));
  // An ace below a 2 is the low end of a sequence such as A-2-3.
  const order = values.has('A') && values.has('2') ? ['A', ...sortRanks] : sortRanks;
  return [...ids].sort((a, b) => {
    const left = cardOf(a);
    const right = cardOf(b);
    return (
      order.indexOf(left?.value ?? '') - order.indexOf(right?.value ?? '') ||
      (left?.suit ?? '').localeCompare(right?.suit ?? '')
    );
  });
}
