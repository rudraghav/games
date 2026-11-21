'use client';
import { Modal, TarotCard } from '@games/ui';
import { orientationNote, positionMeaning } from './spread';

export interface DetailCard {
  id: string;
  label: string;
  subtitle?: string;
  position?: string;
}

/** The full card, opened from a spread card or a reading thumbnail. Shows only a drawn card. */
export function TarotCardDetail({
  card,
  onClose,
  imageLoader,
}: {
  card: DetailCard | null;
  onClose: () => void;
  imageLoader?: (path: string) => string;
}) {
  const meaning = card?.position ? positionMeaning(card.position) : undefined;
  return (
    <Modal
      open={!!card}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={card?.label || 'Tarot card'}
      description={card?.position ? `${card.position}. ${meaning || ''}`.trim() : undefined}
    >
      {card ? (
        <div className="tarot-card-detail">
          <TarotCard id={card.id} name={card.label} imageLoader={imageLoader} />
          <dl>
            <div>
              <dt>Orientation</dt>
              <dd>{orientationNote}</dd>
            </div>
            {card.subtitle ? (
              <div>
                <dt>Card meaning</dt>
                <dd>{card.subtitle}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : null}
    </Modal>
  );
}
