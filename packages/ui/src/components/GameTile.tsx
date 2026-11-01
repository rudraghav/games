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
  edition = 'standard',
  soloMode = false,
}: {
  name: string;
  subtitle: string;
  minPlayers: number;
  maxPlayers: number;
  minutes: string;
  tone: string;
  artwork: ReactNode;
  onChoose: () => void;
  edition?: 'standard' | 'house';
  soloMode?: boolean;
}) {
  return (
    <button
      type="button"
      className="game-tile"
      data-edition={edition}
      onClick={onChoose}
      aria-label={`Create ${name} room`}
    >
      <div className="game-poster" data-tone={tone}>
        {artwork}
      </div>
      <div className="game-tile-body">
        <div className="game-tile-heading">
          <h3>{name}</h3>
          <ArrowRight className="tile-arrow" size={16} aria-hidden="true" />
        </div>
        <p>{subtitle}</p>
        <div className="game-meta">
          <span>
            {soloMode && minPlayers > 1 ? (
              <Bot size={12} aria-hidden="true" />
            ) : (
              <UsersRound size={12} aria-hidden="true" />
            )}
            {soloMode && minPlayers > 1
              ? 'You + bots'
              : minPlayers === maxPlayers
                ? minPlayers === 1
                  ? 'Solo'
                  : `${minPlayers} players`
                : `${minPlayers}–${maxPlayers} players`}
          </span>
          <span>
            <Clock3 size={12} aria-hidden="true" />
            {minutes} min
          </span>
        </div>
      </div>
    </button>
  );
}
