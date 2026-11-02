'use client';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '../lib/cn';
import { tarotArtwork } from '../lib/tarot-artwork';
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
  const artwork = id ? tarotArtwork[id] : undefined;
  const displayName = name || artwork?.name;
  const content = (
    <>
      {!id ? (
        <span className="tarot-back">
          <span className="tarot-back-orbit">✳</span>
          <i>g.</i>
        </span>
      ) : (
        <>
          <span className="tarot-art" data-suit={id.split('-')[0]}>
            {artwork ? (
              <svg
                className="tarot-illustration"
                viewBox={artwork.viewBox}
                preserveAspectRatio={`${artwork.alignment} ${artwork.fit ?? 'slice'}`}
                aria-hidden="true"
                focusable="false"
              >
                <image
                  href={imageLoader ? imageLoader(artwork.path) : artwork.path}
                  width={artwork.atlasWidth}
                  height={artwork.atlasHeight}
                />
              </svg>
            ) : (
              <span className="tarot-art-unavailable">Artwork unavailable</span>
            )}
          </span>
          <span className="tarot-name">{displayName}</span>
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
    'aria-label': label || displayName || 'Choose a face-down Tarot card',
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
