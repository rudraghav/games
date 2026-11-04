'use client';
import { PlayingCard, type CardPresentation } from './PlayingCard';
import { cn } from '../lib/cn';
import { HorizontalRail } from './HorizontalRail';
interface HandProps {
  cards: CardPresentation[];
  family?: 'standard' | 'shedding' | 'property' | 'grid';
  selectedIds?: string[];
  onSelect?: (id: string) => void;
  label?: string;
  compact?: boolean;
  playableIds?: string[];
  disabled?: boolean;
  /**
   * A card to keep in view, such as the card just drawn or the first playable
   * card the instruction refers to. The rail scrolls itself, never the page.
   */
  revealId?: string | null;
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
  revealId,
}: HandProps) {
  const revealIndex = revealId ? cards.findIndex((card) => card.id === revealId) : -1;
  return (
    <HorizontalRail
      className="hand-rail"
      viewportClassName={cn('hand-scroll', compact && 'hand-scroll--compact')}
      contentClassName="card-hand"
      label={label}
      revealKey={revealIndex >= 0 ? revealId : null}
      revealIndex={revealIndex >= 0 ? revealIndex : null}
    >
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
    </HorizontalRail>
  );
}
