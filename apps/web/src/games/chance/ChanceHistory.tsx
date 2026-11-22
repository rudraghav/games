import type { RouletteSpin, SlotSpin } from '@games/api-client';
import { rouletteBetName, signedChips, slotNames } from './chance-format';

type Spin = RouletteSpin | SlotSpin;

export function spinFace(spin: Spin) {
  return 'pocket' in spin
    ? `${spin.pocket} ${spin.color}`
    : spin.reels.map((face) => slotNames[face]).join(' · ');
}

/** Won, lost or even in a word, so the result never rests on colour or a sign alone. */
export const spinOutcome = (net: number) => (net > 0 ? 'Won' : net < 0 ? 'Lost' : 'Even');

/** The pocket as it looks on the wheel. The colour is always named beside it. */
export function PocketToken({ spin }: { spin: Spin }) {
  return 'pocket' in spin ? (
    <span className="chance-token" data-color={spin.color} aria-hidden="true">
      {spin.pocket}
    </span>
  ) : null;
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
            <PocketToken spin={spin} />
            <div className="chance-history-heading">
              <strong>
                Spin {spin.spin} · {spinFace(spin)}
              </strong>
              <span data-gain={spin.net > 0} data-loss={spin.net < 0 || undefined}>
                {signedChips(spin.net)} net
              </span>
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
