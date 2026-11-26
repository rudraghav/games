/**
 * Original, decorative covers for the parlour games: Housie, Liar's Dice, Bluff
 * and Truth or Dare. Drawn with the shared colour tokens, no outside art. A
 * cover never shows a prompt, so nothing from the 18+ edition can reach a tile.
 */

const line = { stroke: 'var(--color-white)', strokeWidth: 3, strokeLinejoin: 'round' } as const;

/** A Housie ticket with a few stamped numbers. */
function HousieCover() {
  // Five numbers per row in a 3 × 9 grid, as on a real ticket.
  const rows = [
    [4, null, 23, null, 41, null, 67, null, 85],
    [null, 15, null, 32, null, 56, null, 74, 88],
    [8, null, 27, 38, null, 59, null, 79, null],
  ];
  const stamped = new Set([23, 56, 74, 8, 38]);
  return (
    <svg viewBox="0 0 240 180" focusable="false">
      <ellipse cx="120" cy="156" rx="100" ry="9" fill="var(--color-black)" opacity="0.12" />
      <g transform="rotate(-4 120 92)">
        <rect x="16" y="40" width="208" height="104" rx="8" fill="var(--color-white)" />
        <rect
          x="16"
          y="40"
          width="208"
          height="104"
          rx="8"
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="2.5"
        />
        {rows.map((row, r) =>
          row.map((value, c) => {
            const x = 22 + c * 22;
            const y = 46 + r * 31;
            return (
              <g key={`${r}-${c}`}>
                <rect
                  x={x}
                  y={y}
                  width="20"
                  height="28"
                  rx="3"
                  fill={value ? 'var(--color-ochre-light)' : 'var(--color-surface-muted)'}
                />
                {value ? (
                  <text
                    x={x + 10}
                    y={y + 19}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="700"
                    fontFamily="var(--font-body)"
                    fill="var(--color-ink)"
                  >
                    {value}
                  </text>
                ) : null}
                {value && stamped.has(value) ? (
                  <circle
                    cx={x + 10}
                    cy={y + 14}
                    r="10.5"
                    fill="var(--color-coral)"
                    opacity="0.82"
                  />
                ) : null}
              </g>
            );
          }),
        )}
      </g>
      {/* The called ball. */}
      <circle cx="196" cy="34" r="22" fill="var(--color-card-yellow)" {...line} />
      <circle cx="196" cy="34" r="13" fill="var(--color-white)" />
      <text
        x="196"
        y="39"
        textAnchor="middle"
        fontSize="13"
        fontWeight="700"
        fontFamily="var(--font-body)"
        fill="var(--color-ink)"
      >
        56
      </text>
    </svg>
  );
}

/** One die face with its pips. */
function Die({
  x,
  y,
  size,
  face,
  tilt,
}: {
  x: number;
  y: number;
  size: number;
  face: number;
  tilt: number;
}) {
  const at = (u: number) => size * u;
  const pips: Record<number, [number, number][]> = {
    1: [[0.5, 0.5]],
    2: [
      [0.27, 0.27],
      [0.73, 0.73],
    ],
    3: [
      [0.27, 0.27],
      [0.5, 0.5],
      [0.73, 0.73],
    ],
    4: [
      [0.27, 0.27],
      [0.73, 0.27],
      [0.27, 0.73],
      [0.73, 0.73],
    ],
    5: [
      [0.27, 0.27],
      [0.73, 0.27],
      [0.5, 0.5],
      [0.27, 0.73],
      [0.73, 0.73],
    ],
    6: [
      [0.27, 0.25],
      [0.73, 0.25],
      [0.27, 0.5],
      [0.73, 0.5],
      [0.27, 0.75],
      [0.73, 0.75],
    ],
  };
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt} ${size / 2} ${size / 2})`}>
      <rect
        width={size}
        height={size}
        rx={size * 0.2}
        fill="var(--color-white)"
        stroke="var(--color-ink)"
        strokeWidth="2.5"
      />
      {pips[face].map(([u, v], i) => (
        <circle key={i} cx={at(u)} cy={at(v)} r={size * 0.08} fill="var(--color-ink)" />
      ))}
    </g>
  );
}

/** Dice under a lifted cup. */
function DiceCover() {
  return (
    <svg viewBox="0 0 240 180" focusable="false">
      <ellipse cx="120" cy="158" rx="96" ry="9" fill="var(--color-black)" opacity="0.14" />
      <Die x={62} y={116} size={34} face={5} tilt={-8} />
      <Die x={100} y={122} size={30} face={2} tilt={6} />
      <Die x={134} y={114} size={34} face={5} tilt={12} />
      <Die x={174} y={124} size={26} face={1} tilt={-4} />
      {/* The cup, tipped up to peek. */}
      <g transform="rotate(-16 90 70)">
        <path d="M44 100 L58 30 H130 L144 100 Z" fill="var(--color-plum)" {...line} />
        <rect x="38" y="94" width="112" height="14" rx="6" fill="var(--color-pine)" {...line} />
        <path
          d="M66 46 H122"
          stroke="var(--color-plum-light)"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.7"
        />
      </g>
      <text x="196" y="52" fontSize="20" fill="var(--color-card-yellow)">
        ✳
      </text>
    </svg>
  );
}

/** Fanned face-down cards and one card half turned. */
function BluffCover() {
  return (
    <svg viewBox="0 0 240 180" focusable="false">
      <defs>
        <pattern
          id="bluff-cover-back"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="8" height="8" fill="var(--color-pine)" />
          <rect width="4" height="8" fill="var(--color-pine-dark)" />
        </pattern>
      </defs>
      <ellipse cx="120" cy="160" rx="92" ry="9" fill="var(--color-black)" opacity="0.12" />
      {[-30, -15, 0, 15, 30].map((angle, i) => (
        <g key={angle} transform={`rotate(${angle} 120 170)`}>
          <rect
            x="94"
            y="46"
            width="52"
            height="76"
            rx="6"
            fill="var(--color-white)"
            stroke="var(--color-ink)"
            strokeWidth="2"
          />
          <rect x="99" y="51" width="42" height="66" rx="3" fill="url(#bluff-cover-back)" />
          {i === 2 ? (
            <circle cx="120" cy="84" r="9" fill="var(--color-card-yellow)" opacity="0.9" />
          ) : null}
        </g>
      ))}
      {/* The called card, turned face up beside the fan. */}
      <g transform="rotate(14 196 76)">
        <rect
          x="172"
          y="40"
          width="48"
          height="70"
          rx="6"
          fill="var(--color-white)"
          stroke="var(--color-ink)"
          strokeWidth="2"
        />
        <text
          x="196"
          y="84"
          textAnchor="middle"
          fontSize="28"
          fontWeight="700"
          fontFamily="var(--font-heading)"
          fill="var(--color-card-red)"
        >
          7
        </text>
        <text x="180" y="56" fontSize="12" fill="var(--color-card-red)">
          ♥
        </text>
      </g>
      <text
        x="24"
        y="50"
        fontSize="30"
        fontWeight="700"
        fontFamily="var(--font-heading)"
        fill="var(--color-white)"
      >
        ?
      </text>
    </svg>
  );
}

/** A bottle lying down to spin, with a small flame. */
function TruthDareCover() {
  return (
    <svg viewBox="0 0 240 180" focusable="false">
      <ellipse cx="120" cy="156" rx="96" ry="9" fill="var(--color-black)" opacity="0.12" />
      {/* The spinning bottle. */}
      <g transform="rotate(-22 112 116)">
        <rect
          x="46"
          y="98"
          width="108"
          height="38"
          rx="16"
          fill="var(--color-card-green)"
          {...line}
        />
        <rect
          x="150"
          y="108"
          width="34"
          height="18"
          rx="6"
          fill="var(--color-card-green)"
          {...line}
        />
        <rect x="182" y="105" width="12" height="24" rx="4" fill="var(--color-ochre)" {...line} />
        <rect
          x="64"
          y="104"
          width="56"
          height="9"
          rx="4.5"
          fill="var(--color-white)"
          opacity="0.45"
        />
      </g>
      {/* Spin marks. */}
      <path
        d="M40 66 a52 52 0 0 1 36 -30"
        fill="none"
        stroke="var(--color-white)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M200 150 a52 52 0 0 0 20 -28"
        fill="none"
        stroke="var(--color-white)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* The flame for burning building rounds. */}
      <path
        d="M178 74c-16-8-20-28-4-44 0 12 10 14 12 6 10 10 14 26 4 36-4 4-8 4-12 2z"
        fill="var(--color-card-yellow)"
        {...line}
      />
      <path d="M180 70c-6-4-6-12 0-18 2 6 8 8 6 14-1 3-3 5-6 4z" fill="var(--color-card-orange)" />
    </svg>
  );
}

export function ParlourArtwork({ gameId }: { gameId: string }) {
  return (
    <div className={`game-art game-art--parlour game-art--${gameId}`} aria-hidden="true">
      {gameId === 'housie' ? (
        <HousieCover />
      ) : gameId === 'liars-dice' ? (
        <DiceCover />
      ) : gameId === 'bluff' ? (
        <BluffCover />
      ) : (
        <TruthDareCover />
      )}
    </div>
  );
}
