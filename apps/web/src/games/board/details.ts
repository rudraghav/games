import type { Match } from '@games/api-client';

/**
 * Optional public board details added after the shared parsers were written.
 * Every value is derived on the server from the public board; anything missing
 * or malformed (older saved matches) simply reads as "nothing to show".
 */
type Detail = Match['detail'];

const cell = (value: unknown, max: number) =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < max ? value : null;
const cells = (value: unknown, max: number) =>
  Array.isArray(value) ? value.filter((item): item is number => cell(item, max) !== null) : [];
const record = (value: unknown) =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

export function boardExtras(detail: Detail, size: number) {
  const flips: Record<string, number[]> = {};
  for (const [choice, line] of Object.entries(record(detail.flips)))
    flips[choice] = cells(line, size);
  const landing: Record<string, number> = {};
  for (const [choice, target] of Object.entries(record(detail.landing))) {
    const value = cell(target, size);
    if (value !== null) landing[choice] = value;
  }
  return {
    /** Reversi: discs each legal placement would flip, keyed by action choice. */
    flips,
    /** Reversi: discs the latest placement flipped. */
    lastFlips: cells(detail.last_flips, size),
    /** Reversi: the seat whose turn was skipped by the latest placement. */
    passed: typeof detail.passed === 'string' ? detail.passed : null,
    /** Four in a Row: the cell each legal column drop lands in. */
    landing,
    /** Checkers: where the latest move started and which piece it captured. */
    lastFrom: cell(detail.last_from, size),
    lastCaptured: cell(detail.last_captured, size),
    /** Checkers: the piece that must keep jumping this turn. */
    forced: cell(detail.forced, size),
  };
}

export type SowPreview = { landing: number; captures: number; extraTurn: boolean };

export function mancalaExtras(detail: Detail) {
  const previews: Record<string, SowPreview> = {};
  for (const [choice, raw] of Object.entries(record(detail.previews))) {
    const item = record(raw);
    const landing = cell(item.landing, 14);
    if (landing === null) continue;
    previews[choice] = {
      landing,
      captures: typeof item.captures === 'number' ? item.captures : 0,
      extraTurn: item.extra_turn === true,
    };
  }
  const capture = record(detail.last_capture);
  const pit = cell(capture.pit, 14);
  const opposite = cell(capture.opposite, 14);
  const sweep = Array.isArray(detail.sweep) ? cells(detail.sweep, 49) : [];
  return {
    previews,
    lastSource: cell(detail.last_source, 14),
    lastCapture:
      pit !== null && opposite !== null && typeof capture.seeds === 'number'
        ? { pit, opposite, seeds: capture.seeds }
        : null,
    sweep: sweep.length === 2 ? sweep : null,
  };
}

export const plural = (count: number, unit: string) => `${count} ${unit}${count === 1 ? '' : 's'}`;
