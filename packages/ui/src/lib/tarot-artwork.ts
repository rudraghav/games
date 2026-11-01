/** Original illustration cells; canonical order only, never a shuffled game deck. */
export interface TarotArtwork {
  name: string;
  path: string;
  viewBox: string;
  atlasWidth: number;
  atlasHeight: number;
  alignment: 'xMidYMid' | 'xMidYMin';
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
      return [
        `${suit}-${String(index + 1).padStart(2, '0')}`,
        {
          name: `${rank} of ${suit[0].toUpperCase()}${suit.slice(1)}`,
          path: `/tarot/minor-${suit}-v1.png`,
          viewBox: `${(index % 4) * 256 + 1} ${rows[row] + 1} 254 ${rows[row + 1] - rows[row] - 2}`,
          atlasWidth: 1024,
          atlasHeight: 1536,
          alignment: index >= 12 && (suit === 'wands' || suit === 'cups') ? 'xMidYMin' : 'xMidYMid',
        },
      ];
    }),
  ),
]);
