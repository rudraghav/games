import { PlayingCard, type CardPresentation } from './PlayingCard';

export function CardPile({
  card,
  label,
  count,
  family = 'standard',
  compact,
  empty = false,
}: {
  card?: CardPresentation | null;
  label: string;
  count?: number;
  family?: 'standard' | 'shedding' | 'property' | 'grid';
  compact?: boolean;
  empty?: boolean;
}) {
  return (
    <div className="card-pile">
      <div className="pile-shadow">
        {empty && !card ? (
          <div
            className={`playing-card playing-card--${family} playing-card--back playing-card--empty${compact ? ' playing-card--compact' : ''}`}
            role="img"
            aria-label={`Empty ${label.toLowerCase()} pile`}
          >
            Empty
          </div>
        ) : (
          <PlayingCard
            card={card || undefined}
            faceDown={!card}
            family={family}
            compact={compact}
          />
        )}
      </div>
      <span>
        {label}
        {count !== undefined ? ` · ${count}` : ''}
      </span>
    </div>
  );
}
