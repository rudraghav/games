import type { ReactNode } from 'react';
import { ArrowRight, Bot, Clock3, UsersRound } from 'lucide-react';

export function GameTile({
  name,
  subtitle,
  minPlayers,
  maxPlayers,
  minutes,
  tone,
  artwork,
  onChoose,
  href,
  edition = 'standard',
  soloMode = false,
  variant = 'standard',
  actionLabel = 'Play now',
  groupLabel,
}: {
  name: string;
  subtitle: string;
  minPlayers: number;
  maxPlayers: number;
  minutes: string;
  tone: string;
  artwork: ReactNode;
  onChoose?: () => void;
  href?: string;
  edition?: 'standard' | 'house';
  soloMode?: boolean;
  /**
   * `rail` is the smaller card used in a collection rail. It is named by the
   * game with its players and length ("Uno, 2–10 players, 10–20 min"), so the
   * library's own "Open Uno" tile stays the one entry of that name on a page.
   */
  variant?: 'standard' | 'featured' | 'rail';
  actionLabel?: string;
  /** Who it is for, when seat counts would mislead (one organiser, a whole group). */
  groupLabel?: string;
}) {
  const featured = variant === 'featured';
  const rail = variant === 'rail';
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
      <div className="game-tile-body">
        {featured ? <span className="eyebrow game-featured-label">Featured</span> : null}
        <div className="game-tile-heading">
          <h3>{name}</h3>
          {!featured ? <ArrowRight className="tile-arrow" size={16} aria-hidden="true" /> : null}
        </div>
        <p>{subtitle}</p>
        <div className="game-meta">
          <span>
            {soloMode && minPlayers > 1 ? (
              <Bot size={12} aria-hidden="true" />
            ) : (
              <UsersRound size={12} aria-hidden="true" />
            )}
            {players}
          </span>
          <span>
            <Clock3 size={12} aria-hidden="true" />
            {minutes} min
          </span>
        </div>
        {featured ? (
          <span className="game-featured-action">
            {actionLabel} <ArrowRight size={17} aria-hidden="true" />
          </span>
        ) : null}
      </div>
    </>
  );
  const attributes = {
    className: rail ? 'game-rail-tile' : 'game-tile',
    'data-edition': edition,
    'data-variant': variant,
    'aria-label': rail ? `${name}, ${players}, ${minutes} min` : `Open ${name}`,
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
