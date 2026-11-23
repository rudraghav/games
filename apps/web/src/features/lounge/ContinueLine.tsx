import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { gameById } from '@games/api-client/catalog';
import { roomPath } from '@/shared/game-paths';

interface ContinueRoom {
  id: string;
  name: string;
  gameId: string;
  status: string;
}

/** Only a match that is being played right now is worth a line on the home page. */
export function gamesInProgress<Room extends ContinueRoom>(rooms: readonly Room[]) {
  return rooms.filter((room) => room.status === 'playing');
}

/**
 * One slim line under the start actions, and only while a game is in progress:
 * "Continue Friday table · Uno". With several, it is the most recent, and "and
 * 2 more" opens Your games. Waiting and finished rooms live in that tab only.
 */
export function ContinueLine({
  rooms,
  onShowAll,
}: {
  /** The player's rooms, most recent first, as the server lists them. */
  rooms: readonly ContinueRoom[];
  onShowAll: () => void;
}) {
  const [room, ...others] = gamesInProgress(rooms);
  if (!room) return null;
  const game = gameById(room.gameId);
  const title = game.id === 'tarot' ? 'Your reading' : room.name;
  return (
    <section className="continue-line" aria-label="Continue">
      <Link className="continue-link" href={roomPath(room)}>
        <span>
          Continue <strong>{title}</strong> · {game.name}
        </span>
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
      {others.length ? (
        <button type="button" className="text-button continue-more" onClick={onShowAll}>
          and {others.length} more
        </button>
      ) : null}
    </section>
  );
}
