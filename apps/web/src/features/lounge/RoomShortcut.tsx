import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { gameById } from '@games/api-client/catalog';
import { GameArt } from '@/shared/GameArt';
import { roomPath } from '@/shared/game-paths';

interface RoomShortcutProps {
  room: { id: string; name: string; gameId: string; status: string; players: number };
}

export function RoomShortcut({ room }: RoomShortcutProps) {
  const game = gameById(room.gameId);
  const solo = game.playMode === 'solo';
  const title = solo ? 'Your reading' : room.name;
  return (
    <Link
      className="room-shortcut"
      href={roomPath(room)}
      aria-label={`Open ${title}, ${game.name}`}
    >
      <span className="room-shortcut-art" data-tone={game.color}>
        <GameArt game={game} />
      </span>
      <span className="room-shortcut-copy">
        <small>{game.name}</small>
        <strong>{title}</strong>
        <span>
          {room.status === 'playing'
            ? 'In progress'
            : room.status === 'finished'
              ? 'Finished'
              : solo
                ? 'Ready to start'
                : 'Waiting'}
          {!solo ? <> · {room.players} in room</> : null}
        </span>
      </span>
      <ArrowRight size={17} aria-hidden="true" />
    </Link>
  );
}
