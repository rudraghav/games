import { AtlasArt } from './AtlasArt';

const colors = ['pearl', 'sapphire', 'ruby', 'emerald', 'onyx'];

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
  const index = patron ? 15 : colorIndex * 3 + Math.min(2, Math.max(0, tier - 1));
  return (
    <span className="gem-district-art">
      <AtlasArt
        src="/game-art/gem-districts-v1.webp"
        index={index}
        columns={4}
        rows={4}
        width={1254}
        height={1254}
      />
    </span>
  );
}
