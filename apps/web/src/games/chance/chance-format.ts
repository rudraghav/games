import type { SlotSpin, SlotSymbol } from '@games/api-client';

export const EUROPEAN_WHEEL = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14,
  31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
] as const;
export const POCKET_ARC = 360 / EUROPEAN_WHEEL.length;
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

/** Red and black alternate round the wheel after the single green zero. */
export const pocketColor = (pocket: number) =>
  pocket === 0 ? 'green' : EUROPEAN_WHEEL.indexOf(pocket as 0) % 2 ? 'red' : 'black';

/** Which pockets a bet pays on. Display only: the server settles every spin. */
export function betCovers(choice: string, pocket: number) {
  if (!(choice in OUTSIDE_BETS)) return choice === String(pocket);
  if (pocket === 0) return false;
  if (choice === 'red' || choice === 'black') return pocketColor(pocket) === choice;
  if (choice === 'odd' || choice === 'even') return (pocket % 2 === 1) === (choice === 'odd');
  return pocket <= 18 === (choice === 'low');
}

/** How far the wheel has turned once a spin rests with its pocket under the top marker. */
export const wheelTurn = (spin?: { spin: number; pocket: number }) =>
  spin ? spin.spin * 720 - EUROPEAN_WHEEL.indexOf(spin.pocket as 0) * POCKET_ARC : 0;

/** The chip colour that stands for a stake: the largest denomination it reaches. */
export const chipTier = (amount: number) =>
  ([100, 25, 10, 5] as const).find((value) => amount >= value) ?? 1;

export const betTip = (choice: string) =>
  choice in OUTSIDE_BETS
    ? `${OUTSIDE_BETS[choice]} pays 1 to 1: a win returns twice your stake. 18 of 37 pockets; loses on zero.`
    : 'One number pays 35 to 1: a win returns 36 times your stake. 1 of 37 pockets.';

/** The reels that make the winning line, so the highlight never rests on colour alone. */
export const winningReels = (spin: Pick<SlotSpin, 'reels' | 'result'>) =>
  spin.reels.map((symbol) =>
    spin.result === 'miss' ? false : spin.result === 'two_cherries' ? symbol === 'cherry' : true,
  );
