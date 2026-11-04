import { useId } from 'react';
import { cn } from '../lib/cn';

export const paperCardKinds = [
  'crab',
  'boat',
  'fish',
  'swimmer',
  'shark',
  'mermaid',
  'shell',
  'octopus',
  'penguin',
  'sailor',
  'lighthouse',
  'shoal',
  'penguin-colony',
  'captain',
] as const;
export type PaperCardKind = (typeof paperCardKinds)[number];

/**
 * Scoring colours of the base deck. Each card's folded-paper illustration is
 * re-toned in its own colour, so the art can never advertise a different one.
 * Stops run from line work to paper highlight (sRGB, 0–1 per channel).
 */
export const paperTones = {
  navy: ['#0c1a2e', '#1d3a63', '#2c5689', '#2c5689', '#6f93c0', '#c4d4e8', '#eef3f9'],
  turquoise: ['#0b3f44', '#1d7f88', '#2fa4ad', '#2fa4ad', '#73c7cc', '#c3e9ea', '#eefafa'],
  black: ['#050607', '#1c2124', '#30373b', '#30373b', '#5f676b', '#a7acae', '#e2e4e3'],
  yellow: ['#5c4100', '#c7920f', '#ebb92a', '#ebb92a', '#f3d067', '#fae7a8', '#fff9e6'],
  green: ['#102c16', '#2f6b3b', '#4a9455', '#4a9455', '#82b98a', '#c9e3cb', '#f0f8ef'],
  gray: ['#2b2e2c', '#5f6461', '#878d89', '#878d89', '#a9aeab', '#d3d6d4', '#f3f4f3'],
  purple: ['#24102f', '#5f347a', '#8556a3', '#8556a3', '#ab86c3', '#dcc9e8', '#f6f0fa'],
  peach: ['#6b351c', '#d17f57', '#eea47f', '#eea47f', '#f5bf9f', '#fadbc8', '#fff4ee'],
  pink: ['#5c1736', '#c4507f', '#e07aa7', '#e07aa7', '#eaa0c1', '#f6d0e1', '#fff1f7'],
  orange: ['#5a2105', '#c2551a', '#e5742f', '#e5742f', '#ef9a63', '#f8cfb0', '#fff2e8'],
  white: ['#4f4c44', '#8f8a7b', '#b4af9f', '#b4af9f', '#d3cebf', '#ece8dd', '#ffffff'],
} as const;
export type PaperTone = keyof typeof paperTones;
export const isPaperTone = (value: string): value is PaperTone => value in paperTones;

const ATLAS = { src: '/game-art/paper-symbols-v2.webp', size: 1280, columns: 4 };

function channels(stops: readonly string[]) {
  const values = stops.map((hex) =>
    [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16) / 255),
  );
  return [0, 1, 2].map((channel) => values.map((rgb) => Number(rgb[channel].toFixed(3))).join(' '));
}

/**
 * One padded atlas cell (no neighbour can bleed in), optionally re-toned to a
 * card colour. Without a tone it keeps the original illustration colours.
 */
export function PaperCardArt({
  kind,
  className,
  tone,
}: {
  kind: PaperCardKind;
  className?: string;
  tone?: PaperTone;
}) {
  const id = `paper-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const cell = ATLAS.size / ATLAS.columns;
  const index = paperCardKinds.indexOf(kind);
  const x = (index % ATLAS.columns) * cell;
  const y = Math.floor(index / ATLAS.columns) * cell;
  const [red, green, blue] = tone ? channels(paperTones[tone]) : [];
  return (
    <span
      className={cn('paper-card-art', className)}
      role="img"
      aria-label={kind.replaceAll('-', ' ')}
      data-tone={tone}
    >
      <svg
        className="atlas-art"
        viewBox={`${x} ${y} ${cell} ${cell}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <clipPath id={`${id}-cell`}>
            <rect x={x} y={y} width={cell} height={cell} />
          </clipPath>
          {tone ? (
            <filter id={`${id}-tone`} colorInterpolationFilters="sRGB">
              <feColorMatrix
                type="matrix"
                values="0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0 0 0 1 0"
              />
              <feComponentTransfer>
                <feFuncR type="table" tableValues={red} />
                <feFuncG type="table" tableValues={green} />
                <feFuncB type="table" tableValues={blue} />
              </feComponentTransfer>
            </filter>
          ) : null}
        </defs>
        <image
          href={ATLAS.src}
          width={ATLAS.size}
          height={ATLAS.size}
          clipPath={`url(#${id}-cell)`}
          filter={tone ? `url(#${id}-tone)` : undefined}
        />
      </svg>
    </span>
  );
}
