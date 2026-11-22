import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

interface AvatarProps {
  name: string;
  seed?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /**
   * An earned frame drawn around the avatar (`frame-gold`, `frame-laurel`,
   * `frame-flame`, `frame-confetti`, `frame-crown`). Decoration only: the
   * accessible name stays the player's name, and an unknown id draws nothing.
   */
  frame?: string | null;
}

/** A point on a circle around the middle of the 100-unit frame drawing. */
function around(radius: number, degrees: number) {
  const angle = (degrees * Math.PI) / 180;
  return {
    x: Number((50 + radius * Math.cos(angle)).toFixed(2)),
    y: Number((50 + radius * Math.sin(angle)).toFixed(2)),
  };
}

// Angles run clockwise from 3 o'clock; 270 is the top of the avatar.
const laurelLeaves = [-1, 1].flatMap((side) =>
  Array.from({ length: 6 }, (_, index) => {
    // Each branch climbs from the tie at the bottom to just short of the top.
    const degrees = 90 + side * (22 + index * 25);
    return { ...around(42.5, degrees), rotate: degrees + side * 62, key: `${side}-${index}` };
  }),
);
const flameTongues = [-66, -44, -22, 0, 22, 44, 66].map((turn, index) => ({
  turn,
  scale: index % 2 ? 0.78 : 1,
}));
const confettiColours = ['#db654d', '#a78442', '#5d8494', '#69506d', '#4d6550'];
const confettiPieces = Array.from({ length: 14 }, (_, index) => {
  const degrees = index * (360 / 14) + (index % 2 ? 7 : -5);
  return {
    ...around(index % 2 ? 44.5 : 41, degrees),
    rotate: degrees * 2.3,
    colour: confettiColours[index % confettiColours.length],
    kind: index % 3,
  };
});

/** Each frame differs by shape, not only by colour. All are drawn on a 100-unit square. */
const frames: Record<string, () => ReactNode> = {
  // Two plain rings.
  'frame-gold': () => (
    <>
      <circle cx="50" cy="50" r="41.5" fill="none" stroke="#c39a35" strokeWidth="6" />
      <circle cx="50" cy="50" r="45" fill="none" stroke="#7d5f18" strokeWidth="1.2" />
      <circle cx="50" cy="50" r="40.6" fill="none" stroke="#f3dc93" strokeWidth="1.6" />
    </>
  ),
  // A wreath: two branches of leaves, open at the top, tied at the bottom.
  'frame-laurel': () => (
    <>
      {laurelLeaves.map((leaf) => (
        <ellipse
          key={leaf.key}
          cx={leaf.x}
          cy={leaf.y}
          rx="7.4"
          ry="3.5"
          fill="#4d6550"
          // A pale edge keeps the leaves readable on dark felt as well as on ivory.
          stroke="#f3efe2"
          strokeWidth="1.5"
          paintOrder="stroke"
          transform={`rotate(${leaf.rotate} ${leaf.x} ${leaf.y})`}
        />
      ))}
      <circle cx="50" cy="93" r="3.4" fill="#a78442" stroke="#7d5f18" strokeWidth="0.9" />
    </>
  ),
  // A thin ring with flames rising over the top half.
  'frame-flame': () => (
    <>
      <circle cx="50" cy="50" r="40.5" fill="none" stroke="#c9523b" strokeWidth="3.6" />
      {flameTongues.map((tongue) => (
        <g key={tongue.turn} transform={`rotate(${tongue.turn} 50 50)`}>
          <path
            d="M50 -4 C58 5 59.5 10 56 16 L44 16 C40.5 10 42 5 50 -4 Z"
            fill="#db654d"
            stroke="#8f3524"
            strokeWidth="0.9"
            transform={`translate(${50 * (1 - tongue.scale)} ${16 * (1 - tongue.scale)}) scale(${tongue.scale})`}
          />
          <path
            d="M50 5 C54 9.5 54.5 12 53 15 L47 15 C45.5 12 46 9.5 50 5 Z"
            fill="#edbe4a"
            transform={`translate(${50 * (1 - tongue.scale)} ${16 * (1 - tongue.scale)}) scale(${tongue.scale})`}
          />
        </g>
      ))}
    </>
  ),
  // Loose pieces of paper all the way round: squares, dots and triangles.
  'frame-confetti': () => (
    <>
      {confettiPieces.map((piece, index) =>
        piece.kind === 0 ? (
          <rect
            key={index}
            x={piece.x - 3}
            y={piece.y - 3}
            width="6"
            height="6"
            rx="0.8"
            fill={piece.colour}
            transform={`rotate(${piece.rotate} ${piece.x} ${piece.y})`}
          />
        ) : piece.kind === 1 ? (
          <circle key={index} cx={piece.x} cy={piece.y} r="2.9" fill={piece.colour} />
        ) : (
          <path
            key={index}
            d={`M${piece.x} ${piece.y - 3.8} L${piece.x + 3.6} ${piece.y + 2.8} L${piece.x - 3.6} ${piece.y + 2.8} Z`}
            fill={piece.colour}
            transform={`rotate(${piece.rotate} ${piece.x} ${piece.y})`}
          />
        ),
      )}
    </>
  ),
  // A thin ring with a crown sitting on top.
  'frame-crown': () => (
    <>
      <circle cx="50" cy="50" r="43.6" fill="none" stroke="#f3efe2" strokeWidth="1.2" />
      <circle cx="50" cy="50" r="41" fill="none" stroke="#69506d" strokeWidth="3.4" />
      <path
        d="M33 17 L30 -3 L41 7 L50 -8 L59 7 L70 -3 L67 17 Z"
        fill="#d9b24a"
        stroke="#7d5f18"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="10" r="2.6" fill="#a93835" />
      <circle cx="39.5" cy="12" r="1.9" fill="#fffdf8" />
      <circle cx="60.5" cy="12" r="1.9" fill="#fffdf8" />
    </>
  ),
};

/** Whether `frame` is one this build knows how to draw. */
export function isAvatarFrame(frame: string | null | undefined): frame is string {
  return typeof frame === 'string' && Object.hasOwn(frames, frame);
}

export function Avatar({ name, seed = 0, size = 'md', className, frame }: AvatarProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  const known = isAvatarFrame(frame);
  return (
    <span
      className={cn('avatar', `avatar--${size}`, className)}
      data-avatar={seed % 8}
      data-frame={known ? frame : undefined}
      aria-label={name}
    >
      {initials || 'G'}
      {known ? (
        <span className="avatar-frame" aria-hidden="true">
          <svg viewBox="0 0 100 100" focusable="false">
            {frames[frame]()}
          </svg>
        </span>
      ) : null}
    </span>
  );
}
