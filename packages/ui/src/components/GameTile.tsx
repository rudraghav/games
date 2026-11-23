import type { ReactNode } from 'react';

/**
 * One game in the library: its cover, its name and one quiet line saying who
 * can play and for how long ("2–10 players · 10–20 min"). The whole tile is a
 * single link or button named "Open <game>".
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
}) {
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
      <h3 className="game-tile-name">{name}</h3>
      <p className="game-tile-meta">
        {players} · {minutes} min
      </p>
    </>
  );
  const attributes = {
    className: 'game-tile',
    'data-edition': edition,
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
