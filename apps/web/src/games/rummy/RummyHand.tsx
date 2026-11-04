'use client';
import { HorizontalRail, PlayingCard } from '@games/ui';
import type { Card } from '@games/api-client';
import { markedLabel, type CardMark } from './rummy-view';

/**
 * One group of the viewer's own cards as an overlapped fan. Every card keeps
 * its rank/suit corner visible, and the fan wraps instead of scrolling, so a
 * 13- or 14-card hand is readable at a glance on a phone. Markers are drawn
 * by the table (classes on the card), never inside the shared card face.
 */
export function RummyHand({
  cards,
  label,
  selectedId,
  marks,
  disabled,
  onSelect,
}: {
  cards: Card[];
  label: string;
  selectedId: string | null;
  marks: (card: Card) => CardMark[];
  disabled: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <HorizontalRail
      className="hand-rail rummy-fan-rail"
      viewportClassName="hand-scroll rummy-fan-scroll"
      contentClassName="card-hand rummy-fan"
      label={label}
    >
      {cards.map((card) => {
        const cardMarks = marks(card);
        return (
          <PlayingCard
            key={card.id}
            card={card}
            className={cardMarks.map((mark) => `rummy-mark--${mark}`).join(' ') || undefined}
            label={markedLabel(card, cardMarks)}
            selected={card.id === selectedId}
            disabled={disabled}
            onClick={() => onSelect(card.id)}
          />
        );
      })}
    </HorizontalRail>
  );
}
