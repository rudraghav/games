import { z } from 'zod';
import { cardSchema as card } from './card-schema';
import type { components } from './generated/schema';

// Parse the projected detail at the API boundary, using the generated wire shape.

const blackjack = z.object({
  dealer_hidden: z.boolean(),
  hand_index: z.number().int().nonnegative(),
  hands: z.array(z.object({ cards: z.array(card), bet: z.number().int().nonnegative() })),
});
export function blackjackDetails(detail: components['schemas']['GameView']['detail']) {
  const data = blackjack.parse(detail);
  return { dealerHidden: data.dealer_hidden, activeHand: data.hand_index, hands: data.hands };
}

const holdem = z.object({
  current_bet: z.number().int().nonnegative(),
  pots: z.array(z.object({ amount: z.number().int().nonnegative(), winners: z.array(z.string()) })),
  refunds: z.record(z.string(), z.number().int().nonnegative()).default({}),
});
export function holdemDetails(detail: components['schemas']['GameView']['detail']) {
  const data = holdem.parse(detail);
  return { currentBet: data.current_bet, pots: data.pots, refunds: data.refunds };
}

const skyjo = z.object({ round: z.number().int().positive(), finisher: z.string().nullable() });
export function skyjoDetails(detail: components['schemas']['GameView']['detail']) {
  return skyjo.parse(detail);
}
