import type { CSSProperties } from 'react';
import type { RouletteSpin } from '@games/api-client';
import { betCovers, EUROPEAN_WHEEL, POCKET_ARC, wheelTurn } from './chance-format';

/** While the wheel turns clockwise into place, the ball runs this far the other way. */
const BALL_TRAVEL = 540;

export function RouletteWheel({
  last,
  previous,
  choice,
  pending,
  landed = false,
}: {
  last?: RouletteSpin;
  previous?: RouletteSpin;
  choice: string;
  pending: boolean;
  /** A spin settled while this table was open, so the ball may be shown dropping in. */
  landed?: boolean;
}) {
  const turn = wheelTurn(last);
  const index = EUROPEAN_WHEEL.findIndex((pocket) => pocket === last?.pocket);
  const stops = EUROPEAN_WHEEL.map(
    (n, i) =>
      `var(--wheel-${n === 0 ? 'green' : i % 2 ? 'red' : 'black'}) ${i * POCKET_ARC}deg ${(i + 1) * POCKET_ARC}deg`,
  ).join(',');
  return (
    <div
      className="roulette-felt"
      data-pending={pending || undefined}
      data-landed={landed || undefined}
    >
      <div
        className="roulette-wheel"
        role="img"
        data-tip={choice ? 'Brass marks show the pockets your bet covers.' : undefined}
        aria-label={
          last
            ? `Single-zero roulette wheel. Spin ${last.spin} landed on ${last.pocket} ${last.color}.`
            : 'European roulette wheel with 37 pockets, including one green zero.'
        }
      >
        <div className="roulette-spin">
          <div
            className="roulette-rotor"
            style={{
              transform: `rotate(${turn}deg)`,
              backgroundImage: `conic-gradient(from ${-POCKET_ARC / 2}deg,${stops})`,
            }}
          >
            {EUROPEAN_WHEEL.map((number, i) => (
              <span
                key={number}
                className="roulette-number"
                data-choice={String(number) === choice || undefined}
                data-cover={betCovers(choice, number) || undefined}
                data-hit={number === last?.pocket || undefined}
                style={{ '--angle': `${i * POCKET_ARC}deg` } as CSSProperties}
              >
                {number}
              </span>
            ))}
            {last ? (
              <span
                key={last.spin}
                className="roulette-ball-arm"
                aria-hidden="true"
                style={
                  {
                    '--angle': `${index * POCKET_ARC}deg`,
                    '--ball-lead': `${turn - wheelTurn(previous) + BALL_TRAVEL}deg`,
                  } as CSSProperties
                }
              >
                <span className="roulette-pointer" />
              </span>
            ) : null}
            <div className="roulette-bowl" aria-hidden="true">
              <span className="roulette-axle">
                <i className="roulette-pivot" />
              </span>
            </div>
          </div>
        </div>
        <span className="roulette-orbit" aria-hidden="true" />
      </div>
      {pending ? (
        <span className="roulette-status" aria-hidden="true">
          Spinning…
        </span>
      ) : null}
    </div>
  );
}
