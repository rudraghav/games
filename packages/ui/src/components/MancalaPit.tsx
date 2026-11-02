import { cn } from '../lib/cn';
import { TokenArt } from './TokenArt';

export function MancalaPit({
  count,
  label,
  store = false,
  highlighted = false,
  disabled = false,
  onClick,
}: {
  count: number;
  label: string;
  store?: boolean;
  highlighted?: boolean;
  disabled?: boolean;
  onClick?: () => void;
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
      <span>{store ? 'store' : 'seeds'}</span>
    </>
  );
  return onClick ? (
    <button
      type="button"
      className={className}
      aria-label={label}
      data-last={highlighted}
      disabled={disabled}
      onClick={onClick}
    >
      {content}
    </button>
  ) : (
    <div className={className} role="img" aria-label={label} data-last={highlighted}>
      {content}
    </div>
  );
}
