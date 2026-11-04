import { PlayingCard, type CardFamily, type CardPresentation } from './PlayingCard';

/**
 * A pile shows a card back only while it holds hidden cards. A face-up pile
 * with no top card (a discard that was just taken) and a draw pile counted
 * down to zero are drawn as an empty, labelled slot, never as a hidden card.
 * `empty` forces the slot; `empty={false}` keeps the old face-down fallback.
 */
export function CardPile({
  card,
  label,
  count,
  family = 'standard',
  compact,
  empty,
}: {
  card?: CardPresentation | null;
  label: string;
  count?: number;
  family?: CardFamily;
  compact?: boolean;
  empty?: boolean;
}) {
  const isEmpty = !card && (empty ?? (count === undefined || count <= 0));
  return (
    <div className="card-pile" data-empty={isEmpty || undefined}>
      <div className="pile-shadow">
        {isEmpty ? (
          <div
            className={`playing-card playing-card--${family} playing-card--back playing-card--empty${compact ? ' playing-card--compact' : ''}`}
            role="img"
            aria-label={`Empty ${label.toLowerCase().replace(/ pile$/, '')} pile`}
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
