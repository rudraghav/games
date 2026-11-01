import { AtlasArt } from './AtlasArt';

const colors = ['blue', 'yellow', 'red', 'black', 'white', 'first'];

/** Original ceramic motifs, independent of published game artwork. */
export function AzulTileArt({ color }: { color: string }) {
  return (
    <span className="azul-tile-art" aria-hidden="true">
      <AtlasArt
        src="/game-art/ceramic-tiles-v1.webp"
        index={Math.max(0, colors.indexOf(color))}
        columns={3}
        rows={2}
        width={1536}
        height={1024}
      />
    </span>
  );
}
