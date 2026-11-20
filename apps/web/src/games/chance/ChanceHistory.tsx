import type { RouletteSpin, SlotSpin } from '@games/api-client';
import { rouletteBetName, signedChips, slotNames } from './chance-format';

type Spin = RouletteSpin | SlotSpin;

export function spinFace(spin: Spin) {
  return 'pocket' in spin
    ? `${spin.pocket} ${spin.color}`
    : spin.reels.map((face) => slotNames[face]).join(' · ');
}

export function ChanceHistory({
  history,
  expanded = false,
}: {
  history: readonly Spin[];
  expanded?: boolean;
}) {
  if (!history.length) return null;
  return (
    <details className="chance-details chance-history" open={expanded || undefined}>
      <summary>
        Spin history <span>{history.length}</span>
      </summary>
      <ol reversed>
        {[...history].reverse().map((spin) => (
          <li key={spin.spin} value={spin.spin}>
            <div className="chance-history-heading">
              <strong>
                Spin {spin.spin} · {spinFace(spin)}
              </strong>
              <span data-gain={spin.net > 0}>{signedChips(spin.net)} net</span>
            </div>
            <p>
              {'choice' in spin ? `${rouletteBetName(spin.choice)} · ` : ''}Staked {spin.stake} ·
              Returned {spin.payout} · Balance {spin.balance}
            </p>
          </li>
        ))}
      </ol>
    </details>
  );
}
