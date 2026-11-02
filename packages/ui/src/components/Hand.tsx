'use client';
import { PlayingCard, type CardPresentation } from './PlayingCard';
import { cn } from '../lib/cn';
interface HandProps {
  cards: CardPresentation[];
  family?: 'standard' | 'shedding' | 'property' | 'grid';
  selectedIds?: string[];
  onSelect?: (id: string) => void;
  label?: string;
  compact?: boolean;
  playableIds?: string[];
  disabled?: boolean;
}
export function Hand({
  cards,
  family = 'standard',
  selectedIds = [],
  onSelect,
  label = 'Your hand',
  compact,
  playableIds,
  disabled,
}: HandProps) {
  return (
    <div
      className={cn('hand-scroll', compact && 'hand-scroll--compact')}
      role="group"
      aria-label={label}
    >
      <div className="card-hand">
        {cards.map((card) => (
          <PlayingCard
            key={card.id}
            card={card}
            family={family}
            compact={compact}
            selected={selectedIds.includes(card.id)}
            playable={playableIds ? playableIds.includes(card.id) : undefined}
            disabled={disabled}
            onClick={onSelect ? () => onSelect(card.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
