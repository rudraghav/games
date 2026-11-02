import { z } from 'zod';
import { cardSchema as card } from './card-schema';
import type { components } from './generated/schema';

type Detail = components['schemas']['GameView']['detail'];
const nonnegative = z.number().int().nonnegative();
const chips = z.record(z.string(), nonnegative);
export const pokerEvaluation = z.object({
  category: z.string(),
  comparison: z.array(z.number().int()),
  description: z.string(),
  cards: z.array(card).length(5),
});
const insurance = z.object({
  stake: nonnegative,
  payout: nonnegative.nullable(),
  net: z.number().int().nullable(),
});
const blackjackHand = z.object({
  cards: z.array(card),
  bet: nonnegative,
  settlement: z
    .object({
      outcome: z.enum(['win', 'loss', 'push', 'blackjack']),
      reason: z.string(),
      payout: nonnegative,
      net: z.number().int(),
      natural: z.boolean(),
    })
    .nullable()
    .default(null),
});
const blackjack = z.object({
  dealer_hidden: z.boolean(),
  hand_index: nonnegative,
  active_hand_index: nonnegative.nullable().default(null),
  hands: z.array(blackjackHand),
  insurance: insurance.default({ stake: 0, payout: null, net: null }),
  settlements: z
    .record(
      z.string(),
      z.object({ hands: z.array(blackjackHand), insurance, net: z.number().int() }),
    )
    .default({}),
});
export function blackjackDetails(detail: Detail) {
  const data = blackjack.parse(detail);
  return {
    dealerHidden: data.dealer_hidden,
    activeHand: data.active_hand_index,
    hands: data.hands,
    insurance: data.insurance,
    settlements: data.settlements,
  };
}
const holdem = z.object({
  current_bet: nonnegative,
  pots: z.array(
    z.object({
      amount: nonnegative,
      winners: z.array(z.string()),
      eligible: z.array(z.string()).default([]),
      awards: chips.default({}),
      odd_chips: z.array(z.string()).default([]),
    }),
  ),
  refunds: chips.default({}),
  contributions: chips.default({}),
  live_pots: z
    .array(
      z.object({
        amount: nonnegative,
        contributors: z.array(z.string()),
        eligible: z.array(z.string()),
        refund_to: z.string().nullable(),
      }),
    )
    .default([]),
  hand_evaluations: z.record(z.string(), pokerEvaluation).default({}),
  settlement_reason: z.enum(['showdown', 'uncontested']).nullable().default(null),
});
export function holdemDetails(detail: Detail) {
  const data = holdem.parse(detail);
  return {
    currentBet: data.current_bet,
    pots: data.pots,
    refunds: data.refunds,
    contributions: data.contributions,
    livePots: data.live_pots,
    evaluations: data.hand_evaluations,
    settlementReason: data.settlement_reason,
  };
}
const skyjo = z.object({
  round: z.number().int().positive(),
  finisher: z.string().nullable(),
  remaining: z.array(z.string()).default([]),
  round_ledger: z
    .record(
      z.string(),
      z.object({
        grid_total: z.number().int(),
        removed_columns: nonnegative,
        multiplier: z.union([z.literal(1), z.literal(2)]),
        round_points: z.number().int(),
        total_points: z.number().int(),
      }),
    )
    .default({}),
});
export const skyjoDetails = (detail: Detail) => skyjo.parse(detail);

const rummyAnalysis = z.object({
  valid: z.boolean(),
  deadwood: nonnegative.max(80),
  raw_points: nonnegative.max(80),
  scoring_gate: z.boolean(),
  sequence_count: nonnegative,
  pure_sequence_count: nonnegative,
  melds: z.array(
    z.object({ cards: z.array(z.string()), kind: z.enum(['pure_sequence', 'sequence', 'set']) }),
  ),
  unmatched: z.array(z.string()),
});
const rummy = z.object({
  wild_rank: z.string(),
  analysis: rummyAnalysis.nullable().default(null),
  discard_analyses: z.record(z.string(), rummyAnalysis).default({}),
  drop_cost: nonnegative.default(20),
  finish_reason: z.string().nullable().default(null),
  settlements: z
    .record(
      z.string(),
      z.object({
        analysis: rummyAnalysis,
        penalty: nonnegative.nullable(),
        score: z.number().int(),
      }),
    )
    .default({}),
});
export const rummyDetails = (detail: Detail) => rummy.parse(detail);

const teenPatti = z.object({
  stake: nonnegative,
  blind: z.boolean(),
  seen: z.record(z.string(), z.boolean()).default({}),
  sideshow: z
    .object({ actor: z.string(), target: z.string(), cost: nonnegative })
    .nullable()
    .default(null),
  sideshow_target: z.string().nullable().default(null),
  sideshow_cost: nonnegative.nullable().default(null),
});
export const teenPattiDetails = (detail: Detail) => teenPatti.parse(detail);
