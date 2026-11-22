/**
 * Original, decorative cover for Secret Santa: two wrapped gifts and a name tag
 * whose name is still hidden. Drawn with the shared colour tokens, no outside art.
 */
export function SantaArtwork() {
  return (
    <div className="game-art game-art--santa" aria-hidden="true">
      <svg viewBox="0 0 240 180" focusable="false">
        {/* Soft ground shadow keeps the gifts on the poster for every tone. */}
        <ellipse cx="120" cy="158" rx="92" ry="9" fill="var(--color-black)" opacity="0.12" />
        {/* The smaller gift behind. */}
        <g transform="rotate(-7 66 118)">
          <rect
            x="34"
            y="92"
            width="64"
            height="60"
            rx="6"
            fill="var(--color-sage)"
            stroke="var(--color-white)"
            strokeWidth="3"
          />
          <rect x="60" y="92" width="12" height="60" fill="var(--color-ochre-light)" />
          <rect
            x="29"
            y="82"
            width="74"
            height="16"
            rx="5"
            fill="var(--color-pine)"
            stroke="var(--color-white)"
            strokeWidth="3"
          />
          <rect x="60" y="82" width="12" height="16" fill="var(--color-ochre-light)" />
        </g>
        {/* The main gift. */}
        <rect
          x="88"
          y="78"
          width="104"
          height="80"
          rx="8"
          fill="var(--color-coral)"
          stroke="var(--color-white)"
          strokeWidth="3"
        />
        <rect x="131" y="78" width="18" height="80" fill="var(--color-card-yellow)" />
        <rect
          x="80"
          y="60"
          width="120"
          height="24"
          rx="7"
          fill="var(--color-card-red)"
          stroke="var(--color-white)"
          strokeWidth="3"
        />
        <rect x="131" y="60" width="18" height="24" fill="var(--color-card-yellow)" />
        {/* The bow. */}
        <path
          d="M140 60c-10-22-34-26-38-12s18 16 38 12zm0 0c10-22 34-26 38-12s-18 16-38 12z"
          fill="var(--color-card-yellow)"
          stroke="var(--color-white)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <circle cx="140" cy="59" r="7" fill="var(--color-ochre)" />
        {/* The name tag: the name is still a secret. */}
        <path
          d="M170 66c10 4 18 12 22 22"
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <g transform="rotate(14 196 116)">
          <path
            d="M176 98l12-12h22a6 6 0 0 1 6 6v46a6 6 0 0 1-6 6h-28a6 6 0 0 1-6-6z"
            fill="var(--color-white)"
            stroke="var(--color-ink)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle cx="191" cy="97" r="3.5" fill="var(--color-ink)" />
          <text
            x="196"
            y="128"
            textAnchor="middle"
            fontSize="26"
            fontWeight="700"
            fontFamily="var(--font-display)"
            fill="var(--color-coral)"
          >
            ?
          </text>
          <path
            d="M184 136h24"
            stroke="var(--color-border)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
        {/* Small sparkles in the lounge's own star shape. */}
        <text x="40" y="58" fontSize="20" fill="var(--color-ochre)">
          ✳
        </text>
        <text x="204" y="44" fontSize="14" fill="var(--color-white)">
          ✳
        </text>
      </svg>
    </div>
  );
}
