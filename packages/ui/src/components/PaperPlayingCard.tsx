'use client';
import { cn } from '../lib/cn';
import type { CardPresentation } from './PlayingCard';
import { PaperCardArt, paperCardKinds, type PaperCardKind } from './PaperCardArt';

export function PaperPlayingCard({
  card,
  selected,
  onClick,
  disabled,
  compact,
  label,
}: {
  card: CardPresentation;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  compact?: boolean;
  label?: string;
}) {
  const art = paperCardKinds.includes(card.suit as PaperCardKind);
  const content = (
    <>
      <span className="paper-playing-card__color">{card.color}</span>
      <span className="paper-playing-card__art" aria-hidden="true">
        {art ? <PaperCardArt kind={card.suit as PaperCardKind} /> : null}
      </span>
      <strong>{card.value}</strong>
      {!compact ? <span className="paper-playing-card__rule">{card.subtitle}</span> : null}
    </>
  );
  const shared = {
    className: cn(
      'paper-playing-card',
      selected && 'paper-playing-card--selected',
      compact && 'paper-playing-card--compact',
    ),
    'data-color': card.color,
    'aria-label': label || `${card.label}. ${card.subtitle}`,
    title: card.subtitle,
  };
  return onClick ? (
    <button
      {...shared}
      type="button"
      aria-pressed={Boolean(selected)}
      disabled={disabled}
      onClick={onClick}
    >
      {content}
    </button>
  ) : (
    <div {...shared}>{content}</div>
  );
}
