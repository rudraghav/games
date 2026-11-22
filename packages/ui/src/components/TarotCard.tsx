'use client';
import { cn } from '../lib/cn';
import { tarotArtwork } from '../lib/tarot-artwork';
const backArtwork = '/tarot/astrolabe-foil-back.webp';

interface TarotCardProps {
  id?: string;
  name?: string;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  compact?: boolean;
  label?: string;
  imageLoader?: (path: string) => string;
  /** Roving focus for a deck of choices: only one card is a Tab stop. */
  tabIndex?: number;
  onFocus?: () => void;
  /** A short hint for the app tooltip, for a card that does something when pressed. */
  tip?: string;
  /**
   * A card drawn reversed: the picture turns half a circle, the name stays the right
   * way up, the word "Reversed" sits under it and the accessible name says so.
   */
  reversed?: boolean;
  /** The id of text that says a little more about this card, read after its name. */
  describedBy?: string;
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
  tabIndex,
  onFocus,
  tip,
  reversed,
  describedBy,
}: TarotCardProps) {
  const artwork = id ? tarotArtwork[id] : undefined;
  const displayName = name || artwork?.name;
  const content = (
    <>
      {!id ? (
        <span
          className="tarot-back"
          aria-hidden="true"
          style={{
            backgroundImage: `url("${imageLoader ? imageLoader(backArtwork) : backArtwork}")`,
          }}
        />
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
          {reversed ? <span className="tarot-reversed-word">Reversed</span> : null}
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
      id && reversed && 'tarot-card--reversed',
    ),
    'aria-label':
      (label || displayName || 'Choose a face-down Tarot card') +
      (id && reversed ? ', reversed' : ''),
    'aria-describedby': describedBy,
    'data-tip': tip,
  };
  return onClick ? (
    <button
      {...shared}
      type="button"
      onClick={onClick}
      onFocus={onFocus}
      tabIndex={tabIndex}
      disabled={disabled}
      aria-pressed={selected}
    >
      {content}
    </button>
  ) : (
    <div {...shared}>{content}</div>
  );
}
