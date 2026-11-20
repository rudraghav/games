import type { CSSProperties } from 'react';
import type { RouletteSpin } from '@games/api-client';
import { EUROPEAN_WHEEL } from './chance-format';

export function RouletteWheel({
  last,
  choice,
  pending,
}: {
  last?: RouletteSpin;
  choice: string;
  pending: boolean;
}) {
  const arc = 360 / EUROPEAN_WHEEL.length;
  const index = EUROPEAN_WHEEL.findIndex((pocket) => pocket === last?.pocket);
  const stops = EUROPEAN_WHEEL.map(
    (n, i) =>
      `var(--wheel-${n === 0 ? 'green' : i % 2 ? 'red' : 'black'}) ${i * arc}deg ${(i + 1) * arc}deg`,
  ).join(',');
  return (
    <div className="roulette-felt" data-pending={pending || undefined}>
      <div
        className="roulette-wheel"
        role="img"
        aria-label={
          last
            ? `Single-zero roulette wheel. Spin ${last.spin} landed on ${last.pocket} ${last.color}.`
            : 'European roulette wheel with 37 pockets, including one green zero.'
        }
      >
        <div
          className="roulette-rotor"
          style={{
            transform: `rotate(${last ? last.spin * 720 - index * arc : 0}deg)`,
            backgroundImage: `conic-gradient(from ${-arc / 2}deg,${stops})`,
          }}
        >
          {EUROPEAN_WHEEL.map((number, i) => (
            <span
              key={number}
              className="roulette-number"
              data-choice={String(number) === choice || undefined}
              style={{ '--angle': `${i * arc}deg` } as CSSProperties}
            >
              {number}
            </span>
          ))}
        </div>
        <div className="roulette-bowl" aria-hidden="true">
          <span className="roulette-axle">
            <i className="roulette-pivot" />
          </span>
        </div>
        {last ? <span className="roulette-pointer" aria-hidden="true" /> : null}
      </div>
    </div>
  );
}
