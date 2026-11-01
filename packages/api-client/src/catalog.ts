import { z } from 'zod';
import data from './generated/catalog.json';

const gameSchema = z.object({
  id: z.string(),
  name: z.string(),
  subtitle: z.string(),
  family: z.string(),
  min_players: z.number().int(),
  max_players: z.number().int(),
  minutes: z.string(),
  icon: z.string(),
  color: z.string(),
  bots_supported: z.boolean().default(false),
  play_mode: z.enum(['competitive', 'cooperative', 'solo']).default('competitive'),
  score_label: z.string().default('Points'),
  score_order: z.enum(['high', 'low', 'none']).default('high'),
  rules_version: z.string(),
  settings: z.array(z.object({ key: z.string(), label: z.string(), default: z.boolean() })),
  rules: z.array(z.string()),
});
export const games = z
  .array(gameSchema)
  .parse(data)
  .map((game) => ({
    id: game.id,
    name: game.name,
    subtitle: game.subtitle,
    family: game.family,
    minPlayers: game.min_players,
    maxPlayers: game.max_players,
    minutes: game.minutes,
    icon: game.icon,
    color: game.color,
    botsSupported: game.bots_supported,
    playMode: game.play_mode,
    scoreLabel: game.score_label,
    scoreOrder: game.score_order,
    rulesVersion: game.rules_version,
    settings: game.settings,
    rules: game.rules,
  }));
export type Game = (typeof games)[number];
export function gameById(id: string) {
  const game = games.find((game) => game.id === id);
  if (!game) throw new Error('Unknown game.');
  return game;
}
