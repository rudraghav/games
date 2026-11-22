import type { ReactNode } from 'react';
import { Bell, Cherry, Citrus, Minus, Star } from 'lucide-react';
import type { SlotSpin, SlotSymbol } from '@games/api-client';
import { slotNames, winningReels } from './chance-format';

export function SymbolMark({ symbol }: { symbol?: SlotSymbol }) {
  const icon = { cherry: Cherry, lemon: Citrus, bell: Bell, star: Star } as const;
  if (symbol === 'seven')
    return (
      <span aria-hidden="true" className="slot-seven">
        7
      </span>
    );
  const Icon = symbol ? icon[symbol] : Minus;
  return <Icon aria-hidden="true" strokeWidth={1.65} />;
}

export function SlotReels({
  last,
  pending,
  landed = false,
  line,
  bet,
}: {
  last?: SlotSpin;
  pending: boolean;
  /** A spin settled while this table was open, so the reels may be shown stopping. */
  landed?: boolean;
  /** What the payline paid, in words. */
  line: string;
  /** The stake resting on the bet spot, when one can be placed. */
  bet?: ReactNode;
}) {
  const wins = last ? winningReels(last) : [];
  return (
    <div
      className="slot-machine"
      data-pending={pending || undefined}
      data-landed={landed || undefined}
    >
      <div
        className="slot-window"
        role="img"
        aria-label={
          last
            ? `Payline: ${last.reels.map((s) => slotNames[s]).join(', ')}.`
            : 'Three empty reels awaiting the first spin.'
        }
      >
        {[0, 1, 2].map((index) => {
          const symbol = last?.reels[index];
          return (
            <div className="slot-reel" key={index} data-win={wins[index] || undefined}>
              <span className="slot-face" data-symbol={symbol} key={last?.spin ?? 'empty'}>
                <SymbolMark symbol={symbol} />
                {symbol ? <span className="slot-face-name">{slotNames[symbol]}</span> : null}
              </span>
            </div>
          );
        })}
        <span
          className="slot-payline"
          aria-hidden="true"
          data-win={wins.some(Boolean) || undefined}
          key={`payline-${last?.spin ?? 0}`}
        />
        <span className="slot-glass" aria-hidden="true" />
      </div>
      <div className="slot-plaque">
        {bet}
        <span className="slot-line" data-win={wins.some(Boolean) || undefined}>
          {line}
        </span>
      </div>
    </div>
  );
}
