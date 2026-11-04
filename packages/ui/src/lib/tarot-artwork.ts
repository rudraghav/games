/** Original illustration cells; canonical order only, never a shuffled game deck. */
export interface TarotArtwork {
  name: string;
  path: string;
  viewBox: string;
  atlasWidth: number;
  atlasHeight: number;
  alignment: 'xMidYMid' | 'xMidYMin';
  fit?: 'meet' | 'slice';
}
const majorNames = [
  'The Fool',
  'The Magician',
  'The High Priestess',
  'The Empress',
  'The Emperor',
  'The Hierophant',
  'The Lovers',
  'The Chariot',
  'Strength',
  'The Hermit',
  'Wheel of Fortune',
  'Justice',
  'The Hanged Man',
  'Death',
  'Temperance',
  'The Devil',
  'The Tower',
  'The Star',
  'The Moon',
  'The Sun',
  'Judgement',
  'The World',
];
const ranks = [
  'Ace',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Page',
  'Knight',
  'Queen',
  'King',
];
// Inspected image boundaries. Two atlases have intentionally taller court panels.
// A viewBox with slice preserves anatomy and confines each card to its own cell.
const suitRows = {
  wands: [0, 341, 666, 1015, 1536],
  cups: [0, 341, 619, 943, 1536],
  swords: [0, 384, 768, 1152, 1536],
  pentacles: [0, 385, 769, 1152, 1536],
} as const;
/**
 * Single-card masters that replace atlas cells whose symbol count did not match
 * the rank (see apps/web/public/tarot/README.md). Every one renders with the same
 * `slice` framing as the atlas cells, so all 78 faces are full-bleed:
 * - 2 Nov ImageGen masters are 1024×1536; the viewBox crops them to the atlas-cell
 *   aspect (1024×1303 ≈ 0.786) at a checked offset that keeps every counted symbol
 *   inside the frame for art boxes from 0.746 (desktop spread) to 0.82 (phone).
 * - 3 Nov retouched masters are the original atlas cell, edited locally, at the
 *   cell's own size.
 */
const singleCardMasters: Readonly<
  Record<string, { width: number; height: number; viewBox: string }>
> = {
  'cups-02': { width: 1024, height: 1536, viewBox: '0 60 1024 1303' },
  'cups-06': { width: 1024, height: 1536, viewBox: '0 100 1024 1303' },
  'cups-08': { width: 1024, height: 1536, viewBox: '0 120 1024 1303' },
  'pentacles-08': { width: 1024, height: 1536, viewBox: '0 42 1024 1303' },
  'pentacles-09': { width: 1024, height: 1536, viewBox: '0 20 1024 1303' },
  ...Object.fromEntries(
    (
      [
        ['wands-05', 323],
        ['wands-07', 323],
        ['wands-08', 323],
        ['wands-09', 347],
        ['cups-10', 322],
        ['swords-05', 382],
        ['swords-06', 382],
        ['swords-08', 382],
        ['swords-09', 382],
        ['swords-10', 382],
        ['pentacles-05', 382],
        ['pentacles-10', 381],
      ] as const
    ).map(([id, height]) => [id, { width: 254, height, viewBox: `0 0 254 ${height}` }]),
  ),
};
// Crop these tall cells from the bottom: Wands/Cups queens and kings keep their heads,
// and the counted pentacles near the top stay whole at every art-box aspect.
const topAligned = new Set([
  'wands-13',
  'wands-14',
  'cups-13',
  'cups-14',
  'pentacles-03',
  'pentacles-05',
  'pentacles-06',
  'pentacles-07',
  'pentacles-10',
]);
export const tarotArtwork: Readonly<Record<string, TarotArtwork>> = Object.fromEntries([
  ...majorNames.map((name, number) => [
    `major-${String(number).padStart(2, '0')}`,
    {
      name,
      path: `/tarot/major-0${Math.floor(number / 6) + 1}.png`,
      viewBox: `${(number % 3) * 418 + 1} ${Math.floor((number % 6) / 3) * 627 + 1} 416 625`,
      atlasWidth: 1254,
      atlasHeight: 1254,
      alignment: 'xMidYMid',
    },
  ]),
  ...Object.entries(suitRows).flatMap(([suit, rows]) =>
    ranks.map((rank, index) => {
      const row = Math.floor(index / 4);
      const id = `${suit}-${String(index + 1).padStart(2, '0')}`;
      const master = singleCardMasters[id];
      return [
        id,
        {
          name: `${rank} of ${suit[0].toUpperCase()}${suit.slice(1)}`,
          path: `/tarot/minor-${suit}-v1.png`,
          viewBox: `${(index % 4) * 256 + 1} ${rows[row] + 1} 254 ${rows[row + 1] - rows[row] - 2}`,
          atlasWidth: 1024,
          atlasHeight: 1536,
          ...(master
            ? {
                path: `/tarot/minor-${id}-v2.png`,
                viewBox: master.viewBox,
                atlasWidth: master.width,
                atlasHeight: master.height,
              }
            : {}),
          alignment: topAligned.has(id) ? 'xMidYMin' : 'xMidYMid',
        },
      ];
    }),
  ),
]);
