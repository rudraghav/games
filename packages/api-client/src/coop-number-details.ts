import { z } from 'zod';
import { cardSchema as card } from './card-schema';
import type { components } from './generated/schema';

type Detail = components['schemas']['GameView']['detail'];
const nonnegative = z.number().int().nonnegative();
const counts = z.record(z.string(), nonnegative);

const mode = z.enum(['simultaneous', 'turn']);
const gang = z.object({
  heist: z.number().int().min(1).max(5),
  street: z.number().int().min(0).max(3),
  vaults: nonnegative.max(3),
  alarms: nonnegative.max(3),
  chips: z.record(z.string(), z.number().int().min(1).max(6).nullable()),
  history: z.array(z.record(z.string(), z.number().int().min(1).max(6))).max(4),
  revealed: z.array(z.string()),
  last_success: z.boolean().nullable(),
  own_hand_name: z.string().nullable(),
  decision_mode: mode,
  pending_players: z.array(z.string()),
  hand_names: z.record(z.string(), z.string()),
});
const six = z.object({
  round: z.number().int().positive(),
  trick: z.number().int().min(1).max(10),
  rows: z.array(z.array(card).min(1).max(5)).length(4),
  row_penalties: z.array(nonnegative).length(4),
  selected_players: z.array(z.string()),
  own_selection: card.nullable(),
  revealed: z.array(z.object({ player: z.string(), card })).max(10),
  round_penalties: counts,
  total_penalties: counts,
  round_scores: counts,
  pending_player: z.string().nullable(),
  decision_mode: mode,
  pending_players: z.array(z.string()),
});

export const gangDetails = (detail: Detail) => gang.parse(detail);
export const sixNimmtDetails = (detail: Detail) => six.parse(detail);
