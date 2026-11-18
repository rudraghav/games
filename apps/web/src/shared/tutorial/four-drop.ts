import type { Match } from '@games/api-client';

/** Teach an immediate line or block using only the public discs and legal landing squares. */
export function fourDrop(match: Match) {
  const lands = match.detail.landing;
  if (
    match.id !== 'four-in-a-row' ||
    !lands ||
    typeof lands !== 'object' ||
    Array.isArray(lands) ||
    match.community.length !== 42 ||
    !match.currentPlayer
  )
    return;
  const seat = match.players.findIndex((p) => p.id === match.currentPlayer);
  if (seat !== 0 && seat !== 1) return;
  const landingByColumn = lands as Record<string, unknown>;
  const paths = [
    [0, 1, 'horizontal'],
    [1, 0, 'vertical'],
    [1, 1, 'diagonal'],
    [1, -1, 'diagonal'],
  ] as const;
  const outside = (r: number, c: number) => r < 0 || r >= 6 || c < 0 || c >= 7;
  for (const own of [true, false]) {
    const disc = String(own ? seat + 1 : 2 - seat);
    for (const option of match.actions) {
      if (option.value.type !== 'drop') continue;
      const column = Number(option.value.choice);
      const cell = landingByColumn[option.value.choice];
      if (
        typeof cell !== 'number' ||
        !Number.isInteger(cell) ||
        cell < 0 ||
        cell >= 42 ||
        cell % 7 !== column
      )
        continue;
      const row = Math.floor(cell / 7);
      for (const [dr, dc, name] of paths) {
        let run = 1;
        for (const side of [-1, 1]) {
          let r = row + side * dr,
            c = column + side * dc;
          while (!outside(r, c) && match.community[r * 7 + c].value === disc) {
            run++;
            r += side * dr;
            c += side * dc;
          }
        }
        if (run >= 4)
          return {
            option,
            tip: own
              ? `A disc in column ${column + 1} completes your ${name} line of four.`
              : `The other player could complete a ${name} four in column ${column + 1}. Drop there to block it.`,
          };
      }
    }
  }
}
