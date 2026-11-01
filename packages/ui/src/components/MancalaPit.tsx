import { cn } from '../lib/cn';

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
    <div className={className} aria-label={label} data-last={highlighted}>
      {content}
    </div>
  );
}
