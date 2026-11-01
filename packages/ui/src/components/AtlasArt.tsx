import { useId } from 'react';

/** Complete illustration cells with proportional framing and no neighbouring art. */
export function AtlasArt({
  src,
  index,
  columns,
  rows,
  width,
  height,
}: {
  src: string;
  index: number;
  columns: number;
  rows: number;
  width: number;
  height: number;
}) {
  const clipId = useId();
  const cellWidth = width / columns;
  const cellHeight = height / rows;
  return (
    <svg
      className="atlas-art"
      viewBox={`${(index % columns) * cellWidth} ${Math.floor(index / columns) * cellHeight} ${cellWidth} ${cellHeight}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={clipId}>
          <rect
            x={(index % columns) * cellWidth}
            y={Math.floor(index / columns) * cellHeight}
            width={cellWidth}
            height={cellHeight}
          />
        </clipPath>
      </defs>
      <image href={src} width={width} height={height} clipPath={`url(#${clipId})`} />
    </svg>
  );
}
