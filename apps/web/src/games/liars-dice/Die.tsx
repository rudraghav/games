import { faceName } from './bid-builder';

/** Pip centres on a 100 × 100 face, drawn the way a real die is laid out. */
const PIPS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [
    [28, 28],
    [72, 72],
  ],
  3: [
    [26, 26],
    [50, 50],
    [74, 74],
  ],
  4: [
    [28, 28],
    [72, 28],
    [28, 72],
    [72, 72],
  ],
  5: [
    [27, 27],
    [73, 27],
    [50, 50],
    [27, 73],
    [73, 73],
  ],
  6: [
    [29, 25],
    [71, 25],
    [29, 50],
    [71, 50],
    [29, 75],
    [71, 75],
  ],
};

/**
 * One die, as original SVG art. The pips are the art (shape, not colour, tells
 * the face); the accessible name says the face in words. `counts` rings a die
 * that counts for the bid in a reveal; the caller adds the visible text marker.
 */
export function Die({
  face,
  size = 'md',
  counts,
  label,
}: {
  face: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  counts?: 'face' | 'wild' | null;
  /** Overrides the default accessible name; an empty string hides a decorative die. */
  label?: string;
}) {
  return (
    <svg
      className="liars-die"
      data-size={size}
      data-face={face}
      data-counts={counts || undefined}
      viewBox="0 0 100 100"
      // An empty label marks a die that sits beside its own words (a face button, a bid line).
      role={label === '' ? undefined : 'img'}
      aria-hidden={label === '' ? true : undefined}
      aria-label={
        label === ''
          ? undefined
          : (label ??
            `${faceName(face, 1)}${counts === 'wild' ? ', wild' : ''}${counts ? ', counts' : ''}`)
      }
    >
      <rect className="liars-die__body" x="5" y="5" width="90" height="90" rx="20" />
      {(PIPS[face] ?? []).map(([cx, cy], index) => (
        <circle key={index} className="liars-die__pip" cx={cx} cy={cy} r={face === 1 ? 11 : 9} />
      ))}
    </svg>
  );
}
