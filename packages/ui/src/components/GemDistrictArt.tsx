import { AtlasArt } from './AtlasArt';

const colors = ['pearl', 'sapphire', 'ruby', 'emerald', 'onyx'];

// Measured subject bounds in the preserved 1254px atlas. Its buildings are packed
// unevenly; uniform quarter-image cells include parts of neighbouring districts.
const districtBounds = [
  [35, 35, 258, 254],
  [324, 11, 287, 291],
  [629, 4, 310, 315],
  [971, 61, 256, 237],
  [28, 312, 279, 294],
  [315, 310, 327, 307],
  [657, 340, 272, 267],
  [953, 319, 281, 298],
  [17, 606, 322, 313],
  [352, 670, 259, 239],
  [627, 623, 293, 293],
  [939, 620, 305, 310],
  [20, 963, 271, 253],
  [319, 925, 287, 297],
  [616, 923, 327, 315],
  [976, 944, 259, 291],
] as const;

/** Original district artwork; rank, cost and selection remain accessible UI. */
export function GemDistrictArt({
  color,
  tier = 1,
  patron = false,
}: {
  color: string;
  tier?: number;
  patron?: boolean;
}) {
  const colorIndex = Math.max(0, colors.indexOf(color));
  const rank = Number.isFinite(tier) ? Math.min(2, Math.max(0, Math.floor(tier) - 1)) : 0;
  const index = patron ? 15 : colorIndex * 3 + rank;
  const [x, y, width, height] = districtBounds[index];
  return (
    <span className="gem-district-art">
      <AtlasArt
        src="/game-art/gem-districts-v1.webp"
        index={index}
        columns={4}
        rows={4}
        width={1254}
        height={1254}
        sourceRect={{ x, y, width, height }}
      />
    </span>
  );
}
