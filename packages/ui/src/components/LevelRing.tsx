import { cn } from '../lib/cn';

const RADIUS = 42;
const LENGTH = 2 * Math.PI * RADIUS;

/**
 * A level number inside a ring that fills with progress toward the next level.
 * `fraction` is 0 to 1; anything else is clamped. With a `label` the ring reads
 * as one image that states the level and the XP in words; without one it is
 * decoration, for places where the same facts are written beside it.
 */
export function LevelRing({
  level,
  fraction,
  label,
  size = 'md',
  className,
}: {
  level: number;
  fraction: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const filled = Number.isFinite(fraction) ? Math.min(1, Math.max(0, fraction)) : 0;
  return (
    <span
      className={cn('level-ring', `level-ring--${size}`, className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <circle className="level-ring-track" cx="50" cy="50" r={RADIUS} />
        <circle
          className="level-ring-fill"
          cx="50"
          cy="50"
          r={RADIUS}
          strokeDasharray={`${(filled * LENGTH).toFixed(2)} ${LENGTH.toFixed(2)}`}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <span className="level-ring-number" aria-hidden="true">
        {level}
      </span>
    </span>
  );
}
