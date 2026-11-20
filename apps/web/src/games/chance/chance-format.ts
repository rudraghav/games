import type { SlotSymbol } from '@games/api-client';

export const EUROPEAN_WHEEL = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14,
  31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
] as const;
export const OUTSIDE_BETS: Record<string, string> = {
  red: 'Red',
  black: 'Black',
  odd: 'Odd',
  even: 'Even',
  low: '1–18',
  high: '19–36',
};
export const rouletteBetName = (choice: string) => OUTSIDE_BETS[choice] ?? `Number ${choice}`;
export const slotNames: Record<SlotSymbol, string> = {
  cherry: 'Cherry',
  lemon: 'Lemon',
  bell: 'Bell',
  star: 'Star',
  seven: 'Seven',
};
export const signedChips = (net: number) => (net > 0 ? `+${net}` : net < 0 ? `−${-net}` : '0');
export const chips = (amount: number) => `${amount} ${amount === 1 ? 'chip' : 'chips'}`;
