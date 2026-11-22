import type { BotLevel, BotSeat } from '@games/api-client';

/** Plain words for how a bot plays. Hard is each game's full policy. */
export const botLevelChoices: readonly { value: BotLevel; label: string; hint: string }[] = [
  { value: 'easy', label: 'Easy', hint: 'Often slips' },
  { value: 'medium', label: 'Medium', hint: 'Sometimes slips' },
  { value: 'hard', label: 'Hard', hint: 'Plays its best' },
];

export function botLevelLabel(level: BotLevel) {
  return botLevelChoices.find((choice) => choice.value === level)!.label;
}

/** The most bots one room can seat beside its host. */
export const MAX_BOTS = 9;

// The order the server names bots in (backend/app/rooms/bots.py). Used only to
// show the name a bot will get; the server stays the authority.
const NAMES = ['Ada', 'Bo', 'Cleo', 'Dax', 'Eli', 'Fern', 'Gus', 'Hana', 'Ivo'] as const;

/** One editable row of the setup dialog. A `null` name means "not renamed". */
export type BotRow = { name: string | null; level: BotLevel };

export function emptyBotRows(): BotRow[] {
  return Array.from({ length: MAX_BOTS }, () => ({ name: null, level: 'hard' as const }));
}

const tidy = (value: string) => value.trim().replace(/\s+/g, ' ');
const same = (a: string, b: string) => tidy(a).toLowerCase() === tidy(b).toLowerCase();

/** The names the server gives bots nobody renamed, skipping the host's own name. */
export function defaultBotNames(count: number, hostName = '') {
  const host = tidy(hostName);
  return NAMES.map((name) => `Bot ${name}`)
    .filter((name) => name !== host)
    .slice(0, count);
}

/** The name each row shows: the player's own, or the default it will be given. */
export function botRowNames(rows: readonly BotRow[], hostName = '') {
  const defaults = defaultBotNames(rows.length, hostName);
  return rows.map((row, index) =>
    row.name !== null && tidy(row.name) ? tidy(row.name) : (defaults[index] ?? `Bot ${index + 1}`),
  );
}

/** A sentence for the first clash between bot names, or with the host's name. */
export function botNameProblem(rows: readonly BotRow[], hostName = '') {
  const names = botRowNames(rows, hostName);
  for (const [index, name] of names.entries()) {
    if (hostName.trim() && same(name, hostName))
      return `“${name}” is your name. Give that bot a different one.`;
    const first = names.findIndex((other) => same(other, name));
    if (first !== index)
      return `Two bots are called “${names[first]}”. Give each bot its own name.`;
  }
  return null;
}

/**
 * The `bot_seats` to send. A name stays `null` while that bot and every bot before
 * it keep their default, so the server names them exactly as shown. From the first
 * renamed bot on, the shown names are sent, which keeps later defaults from
 * shifting up into a slot the player did not expect.
 */
export function botSeatsRequest(rows: readonly BotRow[], hostName = ''): BotSeat[] {
  const names = botRowNames(rows, hostName);
  const defaults = defaultBotNames(rows.length, hostName);
  let untouched = true;
  return rows.map((row, index) => {
    untouched &&= names[index] === defaults[index];
    return { name: untouched ? null : names[index], level: row.level };
  });
}
