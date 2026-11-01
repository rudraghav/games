'use client';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '../lib/cn';

export interface CardPresentation {
  id: string;
  label: string;
  value: string;
  color: string;
  subtitle: string;
  suit: string;
}
interface PlayingCardProps {
  card?: CardPresentation;
  family?: 'standard' | 'shedding' | 'property' | 'grid';
  faceDown?: boolean;
  selected?: boolean;
  compact?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  label?: string;
}

const actionSymbols: Record<string, string> = {
  Skip: '⊘',
  Reverse: '↻',
  'Discard all': '⇣',
  'Skip everyone': '⊘∀',
  Wild: '✦',
  'Reverse +4': '↻+4',
  'Colour roulette': '?',
};

function CardContents({ card, family, faceDown }: PlayingCardProps) {
  if (faceDown || !card)
    return (
      <span className="card-back-pattern">
        <span>g.</span>
      </span>
    );
  if (family === 'property')
    return (
      <>
        <span className="property-band" />
        <span className="property-value">{card.value}</span>
        <span className="property-symbol">{card.suit === 'property' ? '⌂' : '✦'}</span>
        <span className="property-name">{card.subtitle || card.label}</span>
      </>
    );
  if (family === 'grid') return <span className="grid-card-value">{card.value}</span>;
  const value = family === 'shedding' ? actionSymbols[card.value] || card.value : card.value;
  return (
    <>
      <span className="card-corner">
        <b>{value}</b>
        <span>{card.suit}</span>
      </span>
      <span className="card-center" data-small={value.length > 2}>
        {family === 'shedding' ? value : card.suit}
      </span>
      {family === 'shedding' ? (
        <span className="card-action-name">
          {actionSymbols[card.value] ? card.value : card.color}
        </span>
      ) : null}
      <span className="card-corner card-corner--bottom">
        <b>{value}</b>
        <span>{card.suit}</span>
      </span>
    </>
  );
}

export function PlayingCard(props: PlayingCardProps) {
  const {
    card,
    family = 'standard',
    faceDown = false,
    selected = false,
    compact,
    onClick,
    disabled,
    className,
    label,
  } = props;
  const reduced = useReducedMotion();
  const classes = cn(
    'playing-card',
    `playing-card--${family}`,
    compact && 'playing-card--compact',
    faceDown && 'playing-card--back',
    selected && 'playing-card--selected',
    className,
  );
  const content = <CardContents {...props} family={family} />;
  const appearance = {
    className: classes,
    'data-color': !faceDown && card ? card.color : 'neutral',
  };
  const accessibleName = label || (!faceDown ? card?.label : undefined) || 'Face-down card';
  if (onClick)
    return (
      <motion.button
        {...appearance}
        type="button"
        aria-label={accessibleName}
        aria-pressed={selected}
        disabled={disabled}
        onClick={onClick}
        animate={{ y: selected ? -12 : 0 }}
        whileHover={reduced ? undefined : { y: selected ? -14 : -5 }}
        transition={{ duration: reduced ? 0 : 0.18 }}
      >
        {content}
      </motion.button>
    );
  return (
    <div {...appearance} aria-label={accessibleName}>
      {content}
    </div>
  );
}
