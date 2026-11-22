import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { gameById } from '@games/api-client/catalog';
import { HorizontalRail } from '@games/ui';
import { GameArt } from '@/shared/GameArt';
import { roomPath } from '@/shared/game-paths';

interface ContinueRoom {
  id: string;
  name: string;
  gameId: string;
  status: string;
  players: number;
}

/** Rooms worth going back to: a match in progress first, then lobbies still waiting. */
export function activeRooms<Room extends ContinueRoom>(rooms: readonly Room[]) {
  return rooms
    .filter((room) => room.status === 'playing' || room.status === 'lobby')
    .toSorted((a, b) => Number(b.status === 'playing') - Number(a.status === 'playing'));
}

/**
 * One tap back into a room the player is already in. It shows only while there
 * is one; the Your games tab still lists everything, finished games included.
 */
export function ContinueRail({ rooms }: { rooms: readonly ContinueRoom[] }) {
  const active = activeRooms(rooms);
  if (!active.length) return null;
  return (
    <section className="continue-rail" aria-labelledby="continue-heading">
      <h2 id="continue-heading" className="eyebrow">
        Continue
      </h2>
      <HorizontalRail
        label="Rooms to continue"
        navigationLabel="rooms to continue"
        className="home-rail"
        contentClassName="continue-cards"
      >
        {active.map((room) => {
          const game = gameById(room.gameId);
          const solo = game.playMode === 'solo';
          const title = game.id === 'tarot' ? 'Your reading' : room.name;
          return (
            <Link
              key={room.id}
              className="continue-card"
              href={roomPath(room)}
              aria-label={`Continue ${title}, ${game.name}`}
            >
              <span className="room-shortcut-art" data-tone={game.color}>
                <GameArt game={game} />
              </span>
              <span className="room-shortcut-copy">
                <small>{game.name}</small>
                <strong>{title}</strong>
                <span>
                  {room.status === 'playing' ? 'In progress' : solo ? 'Ready to start' : 'Waiting'}
                  {!solo ? <> · {room.players} in room</> : null}
                </span>
              </span>
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          );
        })}
      </HorizontalRail>
    </section>
  );
}
