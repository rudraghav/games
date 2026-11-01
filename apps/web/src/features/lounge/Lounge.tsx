'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button, Wordmark } from '@games/ui';
import { gameById } from '@games/api-client/catalog';
import { api } from '@/lib/session';
import { RoomDialog } from '@/shared/RoomDialog';
import { SiteHeader } from '@/shared/SiteHeader';
import { keys } from '@/shared/query-keys';
import { useHasPlayed } from '@/shared/player-preferences';
import { GameLibrary } from './GameLibrary';

export function Lounge() {
  const [dialog, setDialog] = useState<{
    mode: 'create' | 'join';
    gameId: string;
    withBots?: boolean;
  } | null>(null);
  const played = useHasPlayed();
  const me = useQuery({ queryKey: keys.me, queryFn: () => api.me(), enabled: played });
  return (
    <>
      <SiteHeader>
        <Button size="sm" onClick={() => setDialog({ mode: 'create', gameId: 'uno' })}>
          <Plus size={16} />
          Create room
        </Button>
      </SiteHeader>
      <main className="page-width">
        <section className="hero hero--compact">
          <div>
            <h1 className="hero-title">Choose a game</h1>
            <div className="hero-actions">
              <Button
                size="lg"
                onClick={() => setDialog({ mode: 'create', gameId: 'uno', withBots: true })}
              >
                Play with bots
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => setDialog({ mode: 'join', gameId: 'uno' })}
              >
                Join a room
              </Button>
            </div>
          </div>
        </section>
        <GameLibrary onChoose={(gameId) => setDialog({ mode: 'create', gameId })} />
        {me.data?.rooms.length ? (
          <section aria-label="Your recent rooms">
            <div className="section-heading">
              <h2>Recent rooms</h2>
            </div>
            <div className="recent-rooms">
              {me.data.rooms.slice(0, 3).map((room) => (
                <Link key={room.id} href={`/rooms/${room.id}`} className="recent-room">
                  <span className="eyebrow">{gameById(room.gameId).name}</span>
                  <strong>{room.name}</strong>
                  <span className="small muted">
                    {room.players} players · {room.status === 'playing' ? 'Playing' : 'Lobby'}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <footer className="site-footer page-width">
        <Wordmark />
        <Link href="/privacy">Privacy</Link>
        <span>Free play</span>
      </footer>
      {dialog ? (
        <RoomDialog
          key={`${dialog.mode}-${dialog.gameId}`}
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          mode={dialog.mode}
          gameId={dialog.gameId}
          withBots={dialog.withBots}
        />
      ) : null}
    </>
  );
}
