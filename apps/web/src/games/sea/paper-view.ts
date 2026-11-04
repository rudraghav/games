import { z } from 'zod';
import type { Card, Match } from '@games/api-client';
import { mapCard } from '@games/api-client/mappers';

/*
 * Projection fields added for table clarity. They are parsed here, tolerantly,
 * so older saved fixtures without them still render. Every field is either
 * public (protected hands, round results) or this viewer's own private notice.
 */
const card = z
  .looseObject({ id: z.string(), label: z.string() })
  .transform((value) => mapCard(value as Parameters<typeof mapCard>[0]));
const count = z.number().int().nonnegative();
const result = z.object({ card_points: count, color_bonus: count, award: count });

const extras = z.object({
  protected_points: z.record(z.string(), count).catch({}),
  crab_pile: z.number().int().min(0).max(1).nullable().catch(null),
  last_round: z
    .object({
      round: count,
      outcome: z.enum(['stopped', 'caller_won', 'caller_lost', 'exhausted', 'mermaids']),
      caller: z.string().nullable(),
      stopper: z.string().nullable(),
      result: z.record(z.string(), result),
    })
    .nullable()
    .catch(null),
  private_events: z
    .array(
      z.object({
        kind: z.enum(['stole', 'stolen', 'fish', 'crab']),
        // A victim gets the name of what they lost, never its card identity.
        name: z.string(),
        card: card.nullable(),
        other: z.string().nullable(),
      }),
    )
    .catch([]),
});

export type PaperExtras = z.infer<typeof extras>;
export type PaperEvent = PaperExtras['private_events'][number];
export type RoundSummary = NonNullable<PaperExtras['last_round']>;

export function paperExtras(detail: Match['detail']): PaperExtras {
  const parsed = extras.safeParse(detail);
  return parsed.success
    ? parsed.data
    : { protected_points: {}, crab_pile: null, last_round: null, private_events: [] };
}

export type DuoKind = 'crab' | 'boat' | 'fish' | 'steal';

/** The duo a pair of cards forms, mirroring the server's pair rule for labels only. */
export function duoKind(cards: Card[]): DuoKind | null {
  if (cards.length !== 2) return null;
  const [a, b] = cards.map((item) => item.suit);
  if (a === b && (a === 'crab' || a === 'boat' || a === 'fish')) return a;
  return new Set([a, b]).size === 2 && [a, b].every((kind) => ['shark', 'swimmer'].includes(kind))
    ? 'steal'
    : null;
}

export const duoEffects: Record<DuoKind, string> = {
  crab: 'Search one discard pile and take any card from it.',
  boat: 'Take another turn right away.',
  fish: 'Draw the top card of the stock.',
  steal: 'Steal a random card from an opponent’s hand.',
};

/** Fuller rule copy for the inspector; the server's short subtitle stays on the card. */
export const paperRules: Record<string, string> = {
  crab: 'Play two crabs to look through one discard pile and take any card from it. Each pair scores 1 point.',
  boat: 'Play two boats to take another turn right away. Each pair scores 1 point.',
  fish: 'Play two fish to draw the top card of the stock. Each pair scores 1 point.',
  swimmer:
    'Play with a shark to steal a random card from an opponent’s hand. Each shark and swimmer pair scores 1 point.',
  shark:
    'Play with a swimmer to steal a random card from an opponent’s hand. Each shark and swimmer pair scores 1 point.',
  mermaid:
    'Each mermaid scores one color group: the first your most common color, the next your second most common, and so on. All four mermaids win the game at once.',
  shell: 'Shells score 0, 2, 4, 6, 8 or 10 points for one to six shells.',
  octopus: 'Octopuses score 0, 3, 6, 9 or 12 points for one to five octopuses.',
  penguin: 'Penguins score 1, 3 or 5 points for one to three penguins.',
  sailor: 'One sailor scores nothing; two sailors score 5 points.',
  lighthouse: 'Scores 1 point for each boat you have.',
  shoal: 'Scores 1 point for each fish you have.',
  'penguin-colony': 'Scores 2 points for each penguin you have.',
  captain: 'Scores 3 points for each sailor you have.',
};
