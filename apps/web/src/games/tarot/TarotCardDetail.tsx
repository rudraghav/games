'use client';
import { Modal } from '@games/ui';
import type { Orientation } from './orientation';
import { positionMeaning } from './spread';
import { TarotCardPage } from './TarotCardPage';

export interface DetailCard {
  id: string;
  label: string;
  subtitle?: string;
  position?: string;
  /** How the card was drawn. The page opens on that side and still offers the other. */
  orientation?: Orientation;
}

/**
 * A drawn card's full page, opened from a spread card or a reading thumbnail. It opens
 * on the orientation the card was drawn in and names the position it was drawn for.
 * The dialog is named after the card, so the page's own copy of the name is hidden.
 */
export function TarotCardDetail({
  card,
  onClose,
  imageLoader,
}: {
  card: DetailCard | null;
  onClose: () => void;
  imageLoader?: (path: string) => string;
}) {
  const orientation = card?.orientation ?? 'upright';
  const meaning = card?.position ? positionMeaning(card.position) : undefined;
  return (
    <Modal
      open={!!card}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={card?.label || 'Tarot card'}
      description={
        card
          ? [
              ...(card.position ? [`${card.position}.`, ...(meaning ? [meaning] : [])] : []),
              `Drawn ${orientation}.`,
            ].join(' ')
          : undefined
      }
      wide
      stickyHeader
    >
      {card ? (
        <div className="tarot-card-detail">
          <TarotCardPage
            cardId={card.id}
            orientation={orientation}
            position={card.position}
            imageLoader={imageLoader}
          />
        </div>
      ) : null}
    </Modal>
  );
}
