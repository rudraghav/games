import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { gameById } from '@games/api-client/catalog';
import { GameArt } from '@/shared/GameArt';

interface RoomShortcutProps {
  room: { id: string; name: string; gameId: string; status: string; players: number };
}

export function RoomShortcut({ room }: RoomShortcutProps) {
  const game = gameById(room.gameId);
  return (
    <Link
      className="room-shortcut"
      href={`/rooms/${room.id}`}
      aria-label={`Open ${room.name}, ${game.name}`}
    >
      <span className="room-shortcut-art" data-tone={game.color}>
        <GameArt game={game} />
      </span>
      <span className="room-shortcut-copy">
        <small>{game.name}</small>
        <strong>{room.name}</strong>
        <span>
          {room.status === 'playing'
            ? 'In progress'
            : room.status === 'finished'
              ? 'Finished'
              : 'Waiting'}{' '}
          · {room.players} in room
        </span>
      </span>
      <ArrowRight size={17} aria-hidden="true" />
    </Link>
  );
}
