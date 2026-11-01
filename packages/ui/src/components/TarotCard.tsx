'use client';
import type { CSSProperties } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '../lib/cn';

const suitSymbols: Record<string, string> = { wands: '✦', cups: '♡', swords: '✧', pentacles: '◎' };
interface TarotCardProps {
  id?: string;
  name?: string;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  compact?: boolean;
  label?: string;
  imageLoader?: (path: string) => string;
}
export function TarotCard({
  id,
  name,
  selected,
  onClick,
  disabled,
  compact,
  label,
  imageLoader,
}: TarotCardProps) {
  const reduced = useReducedMotion();
  const major = id?.startsWith('major-');
  const number = Number(id?.split('-')[1] || 0);
  const sheet = Math.floor(number / 6) + 1;
  const cell = number % 6;
  const path = `/tarot/major-0${sheet}.png`;
  const style = major
    ? ({
        '--tarot-image': `url(${imageLoader ? imageLoader(path) : path})`,
        '--tarot-x': `${(cell % 3) * 50}%`,
        '--tarot-y': `${Math.floor(cell / 3) * 100}%`,
      } as CSSProperties)
    : undefined;
  const content = (
    <>
      {!id ? (
        <span className="tarot-back">
          <span className="tarot-back-orbit">✳</span>
          <i>g.</i>
        </span>
      ) : (
        <>
          <span
            className={cn('tarot-art', major && 'tarot-art--illustrated')}
            style={style}
            data-suit={id.split('-')[0]}
          >
            {!major ? (
              <>
                <span className="tarot-orbit" />
                <span className="tarot-suit">{suitSymbols[id.split('-')[0]] || '✳'}</span>
                <span className="tarot-rank">
                  {number > 10
                    ? ['Page', 'Knight', 'Queen', 'King'][number - 11]
                    : number === 1
                      ? 'Ace'
                      : number}
                </span>
                <span className="tarot-pips">
                  {Array.from({ length: Math.min(number, 10) }, (_, i) => (
                    <i key={i}>{suitSymbols[id.split('-')[0]]}</i>
                  ))}
                </span>
              </>
            ) : null}
          </span>
          <span className="tarot-name">{name}</span>
        </>
      )}
    </>
  );
  const shared = {
    className: cn(
      'tarot-card',
      !id && 'tarot-card--back',
      selected && 'tarot-card--selected',
      compact && 'tarot-card--compact',
    ),
    'aria-label': label || name || 'Choose a face-down Tarot card',
  };
  return onClick ? (
    <motion.button
      {...shared}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      whileHover={reduced ? undefined : { y: -6 }}
      transition={{ duration: reduced ? 0 : 0.2 }}
    >
      {content}
    </motion.button>
  ) : (
    <div {...shared}>{content}</div>
  );
}
