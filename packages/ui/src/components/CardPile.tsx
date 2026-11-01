import { PlayingCard, type CardPresentation } from './PlayingCard';

export function CardPile({
  card,
  label,
  count,
  family = 'standard',
}: {
  card?: CardPresentation | null;
  label: string;
  count?: number;
  family?: 'standard' | 'shedding' | 'property' | 'grid';
}) {
  return (
    <div className="card-pile">
      <div className="pile-shadow">
        <PlayingCard card={card || undefined} faceDown={!card} family={family} />
      </div>
      <span>
        {label}
        {count !== undefined ? ` · ${count}` : ''}
      </span>
    </div>
  );
}
