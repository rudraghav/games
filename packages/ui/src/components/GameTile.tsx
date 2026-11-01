import type { ReactNode } from 'react';
import { ArrowRight, Clock3, UsersRound } from 'lucide-react';

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
            <UsersRound size={12} aria-hidden="true" />
            {minPlayers === maxPlayers
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
