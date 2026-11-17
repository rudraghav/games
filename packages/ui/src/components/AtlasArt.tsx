import { useId } from 'react';

/** Complete illustration cells with proportional framing and no neighbouring art. */
export function AtlasArt({
  src,
  index,
  columns,
  rows,
  width,
  height,
  sourceRect,
}: {
  src: string;
  index: number;
  columns: number;
  rows: number;
  width: number;
  height: number;
  /** Exact subject bounds for atlases whose illustrations do not follow a uniform grid. */
  sourceRect?: { x: number; y: number; width: number; height: number };
}) {
  const clipId = useId();
  const cellWidth = width / columns;
  const cellHeight = height / rows;
  const bounds = sourceRect ?? {
    x: (index % columns) * cellWidth,
    y: Math.floor(index / columns) * cellHeight,
    width: cellWidth,
    height: cellHeight,
  };
  return (
    <svg
      className="atlas-art"
      viewBox={`${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={bounds.x} y={bounds.y} width={bounds.width} height={bounds.height} />
        </clipPath>
      </defs>
      <image href={src} width={width} height={height} clipPath={`url(#${clipId})`} />
    </svg>
  );
}
