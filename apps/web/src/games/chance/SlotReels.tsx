import { useState } from 'react';
import { Bell, Cherry, Citrus, Minus, Star } from 'lucide-react';
import type { SlotSpin, SlotSymbol } from '@games/api-client';
import { slotNames } from './chance-format';

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

export function SlotReels({ last, pending }: { last?: SlotSpin; pending: boolean }) {
  const [initialSpin] = useState(last?.spin ?? 0);
  return (
    <div
      className="slot-machine"
      data-pending={pending || undefined}
      data-landed={(last && last.spin > initialSpin) || undefined}
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
            <div className="slot-reel" key={index}>
              <span className="slot-face" data-symbol={symbol} key={last?.spin ?? 'empty'}>
                <SymbolMark symbol={symbol} />
                {symbol ? <span className="slot-face-name">{slotNames[symbol]}</span> : null}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
