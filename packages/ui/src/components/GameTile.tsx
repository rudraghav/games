import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * One game in the library: its cover, its name and one quiet line saying who
 * can play and for how long ("2–10 players · 10–20 min"). The whole tile is a
 * single link or button named "Open <game>".
 *
 * `featured` is the one highlighted game: the same tile laid out wide, with a
 * "Featured" eyebrow, one line about the game and a single call to action. It
 * is still one link with the same name, so it counts as that game's tile.
 */
export function GameTile({
  name,
  minPlayers,
  maxPlayers,
  minutes,
  tone,
  artwork,
  onChoose,
  href,
  edition = 'standard',
  soloMode = false,
  groupLabel,
  variant = 'standard',
  subtitle,
  actionLabel = 'Play now',
}: {
  name: string;
  minPlayers: number;
  maxPlayers: number;
  minutes: string;
  tone: string;
  artwork: ReactNode;
  onChoose?: () => void;
  href?: string;
  edition?: 'standard' | 'house';
  /** The tile opens the game against bots, so it says "You + bots". */
  soloMode?: boolean;
  /** Who it is for, when seat counts would mislead (one organiser, a whole group). */
  groupLabel?: string;
  variant?: 'standard' | 'featured';
  /** One line about the game. Only the featured tile shows it. */
  subtitle?: string;
  /** The featured tile's call to action. */
  actionLabel?: string;
}) {
  const featured = variant === 'featured';
  const players = groupLabel
    ? groupLabel
    : soloMode && minPlayers > 1
      ? 'You + bots'
      : minPlayers === maxPlayers
        ? minPlayers === 1
          ? 'Solo'
          : `${minPlayers} players`
        : `${minPlayers}–${maxPlayers} players`;
  const content = (
    <>
      <div className="game-poster" data-tone={tone}>
        {artwork}
      </div>
      {featured ? (
        <div className="game-featured-body">
          <span className="eyebrow game-featured-label">Featured</span>
          <h3 className="game-tile-name">{name}</h3>
          {subtitle ? <p className="game-featured-line">{subtitle}</p> : null}
          <p className="game-tile-meta">
            {players} · {minutes} min
          </p>
          <span className="game-featured-action">
            {actionLabel} <ArrowRight size={16} aria-hidden="true" />
          </span>
        </div>
      ) : (
        <>
          <h3 className="game-tile-name">{name}</h3>
          <p className="game-tile-meta">
            {players} · {minutes} min
          </p>
        </>
      )}
    </>
  );
  const attributes = {
    className: 'game-tile',
    'data-edition': edition,
    'data-variant': featured ? 'featured' : undefined,
    'aria-label': `Open ${name}`,
  };
  return href ? (
    <a {...attributes} href={href}>
      {content}
    </a>
  ) : (
    <button {...attributes} type="button" onClick={onChoose}>
      {content}
    </button>
  );
}
