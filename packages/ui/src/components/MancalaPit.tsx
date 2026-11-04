import type { MouseEvent, PointerEvent } from 'react';
import { cn } from '../lib/cn';
import { TokenArt } from './TokenArt';

export function MancalaPit({
  count,
  label,
  store = false,
  caption,
  highlighted = false,
  marker,
  disabled = false,
  onClick,
  onFocus,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
}: {
  count: number;
  label: string;
  store?: boolean;
  /** Short visible text under the count; defaults to "store" or "seeds". */
  caption?: string;
  highlighted?: boolean;
  /** A public consequence drawn on the pit: a sowing preview or the last move's effects. */
  marker?: 'source' | 'landing' | 'captured' | 'last-source';
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onFocus?: () => void;
  onPointerDown?: (event: PointerEvent<HTMLElement>) => void;
  onPointerEnter?: (event: PointerEvent<HTMLElement>) => void;
  onPointerLeave?: (event: PointerEvent<HTMLElement>) => void;
}) {
  const className = cn('mancala-pit', store && 'mancala-pit--store');
  const content = (
    <>
      {count > 0 ? (
        <span className="mancala-seeds" aria-hidden="true">
          {Array.from({ length: Math.min(count, 6) }, (_, index) => (
            <span className="mancala-seed" key={index}>
              <TokenArt kind="marble" />
            </span>
          ))}
        </span>
      ) : null}
      <strong>{count}</strong>
      <span>{caption ?? (store ? 'store' : count === 1 ? 'seed' : 'seeds')}</span>
    </>
  );
  return onClick ? (
    <button
      type="button"
      className={className}
      aria-label={label}
      data-last={highlighted}
      data-marker={marker}
      disabled={disabled}
      onClick={onClick}
      onFocus={onFocus}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {content}
    </button>
  ) : (
    <div
      className={className}
      role="img"
      aria-label={label}
      data-last={highlighted}
      data-marker={marker}
    >
      {content}
    </div>
  );
}
