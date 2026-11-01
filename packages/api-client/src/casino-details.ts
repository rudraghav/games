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
