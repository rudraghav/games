'use client';
import {
  Anchor,
  Cloud,
  Flame,
  Flower2,
  Gem,
  Heart,
  Leaf,
  Moon,
  Snowflake,
  Sun,
  Waves,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../lib/cn';
import type { CardPresentation } from './PlayingCard';
import {
  PaperCardArt,
  paperCardKinds,
  isPaperTone,
  type PaperCardKind,
  type PaperTone,
} from './PaperCardArt';

/** A shape for every scoring colour, so colour never depends on hue alone. */
const toneGlyphs: Record<PaperTone, LucideIcon> = {
  navy: Anchor,
  turquoise: Waves,
  black: Moon,
  yellow: Sun,
  green: Leaf,
  gray: Cloud,
  purple: Gem,
  peach: Flower2,
  pink: Heart,
  orange: Flame,
  white: Snowflake,
};

/** Multipliers score with another kind; the badge keeps them apart from pairs at a glance. */
const multipliers: Partial<Record<PaperCardKind, string>> = {
  lighthouse: '+1 / boat',
  shoal: '+1 / fish',
  'penguin-colony': '+2 / penguin',
  captain: '+3 / sailor',
};

export function PaperPlayingCard({
  card,
  selected,
  onClick,
  disabled,
  compact,
  label,
  fresh,
}: {
  card: CardPresentation;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  compact?: boolean;
  label?: string;
  /** Marks a card that just arrived privately (a steal, fish draw or crab take). */
  fresh?: boolean;
}) {
  const kind = paperCardKinds.includes(card.suit as PaperCardKind)
    ? (card.suit as PaperCardKind)
    : null;
  const tone = card.color && isPaperTone(card.color) ? card.color : undefined;
  const Glyph = tone ? toneGlyphs[tone] : null;
  const multiplier = kind ? multipliers[kind] : undefined;
  const content = (
    <>
      <span className="paper-playing-card__color">
        {Glyph ? <Glyph size={compact ? 13 : 14} strokeWidth={2.4} aria-hidden="true" /> : null}
        <span>{card.color}</span>
      </span>
      <span className="paper-playing-card__art" aria-hidden="true">
        {kind ? <PaperCardArt kind={kind} tone={tone} /> : null}
        {multiplier ? <span className="paper-playing-card__multiplier">{multiplier}</span> : null}
      </span>
      <strong>{card.value}</strong>
      {!compact ? <span className="paper-playing-card__rule">{card.subtitle}</span> : null}
      {fresh ? <span className="paper-playing-card__fresh">New</span> : null}
    </>
  );
  const shared = {
    className: cn(
      'paper-playing-card',
      selected && 'paper-playing-card--selected',
      compact && 'paper-playing-card--compact',
    ),
    'data-color': card.color,
    'data-fresh': fresh || undefined,
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
