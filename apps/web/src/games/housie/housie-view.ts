import type { ActionOption, HousieDetails, HousiePrizeKey } from '@games/api-client';

export type HousieCell = {
  /** The printed number, or null for a blank square. */
  number: number | null;
  called: boolean;
  marked: boolean;
  /** The server offers a `mark` for this number (auto-mark is off). */
  markable: boolean;
};

/** The viewer's ticket as rows of cells. Only the projection is read; nothing is inferred. */
export function ticketCells(data: HousieDetails, marks: Map<number, ActionOption>): HousieCell[][] {
  const called = new Set(data.called);
  const marked = new Set(data.marked);
  return data.ticket.map((row) =>
    row.map((number) => ({
      number,
      called: number !== null && called.has(number),
      marked: number !== null && marked.has(number),
      markable: number !== null && marks.has(number),
    })),
  );
}

/** Offered `mark` actions by the number they mark (the action's `amount`). */
export function markOptions(actions: ActionOption[]) {
  return new Map(
    actions
      .filter((option) => option.value.type === 'mark' && option.value.amount)
      .map((option) => [option.value.amount as number, option] as const),
  );
}

/** Offered `claim` actions by prize key (the action's `choice`). */
export function claimOptions(actions: ActionOption[]) {
  return new Map(
    actions
      .filter((option) => option.value.type === 'claim' && option.value.choice)
      .map((option) => [option.value.choice as HousiePrizeKey, option] as const),
  );
}

/**
 * The one move that gets the filled button: a claim first (prizes close on the
 * next call), then a mark (a claim counts only marked numbers), then the call.
 */
export function leadMove(
  data: HousieDetails,
  actions: ActionOption[],
):
  | { type: 'claim'; key: HousiePrizeKey }
  | { type: 'mark'; number: number }
  | { type: 'call' }
  | null {
  const claims = claimOptions(actions);
  const claim = data.prizes.find((prize) => claims.has(prize.key));
  if (claim) return { type: 'claim', key: claim.key };
  const marks = [...markOptions(actions).keys()];
  if (marks.length) {
    // The number just called first, then the earliest called one still waiting.
    const order = [...data.called].reverse();
    const number = order.find((value) => marks.includes(value)) ?? marks[0];
    return { type: 'mark', number };
  }
  if (actions.some((option) => option.value.type === 'call_number')) return { type: 'call' };
  return null;
}

export type PrizeState = 'open' | 'shareable' | 'won';

/**
 * A prize with winners stays open to others only on the call that won it.
 * `wonOnCall` counts the numbers called when it was first won.
 */
export function prizeState(
  prize: HousieDetails['prizes'][number],
  calledCount: number,
): PrizeState {
  if (!prize.winners.length) return 'open';
  return prize.wonOnCall === calledCount ? 'shareable' : 'won';
}

/** The numbers called before the last one, newest first. */
export function recentCalls(called: number[], count = 5) {
  return called.slice(0, -1).slice(-count).reverse();
}

export const plural = (count: number, one: string, many = `${one}s`) =>
  `${count} ${count === 1 ? one : many}`;
