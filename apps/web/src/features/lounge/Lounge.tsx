'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button, Wordmark } from '@games/ui';
import { api } from '@/lib/session';
import { RoomDialog } from '@/shared/RoomDialog';
import { SiteHeader } from '@/shared/SiteHeader';
import { keys } from '@/shared/query-keys';
import { useHasPlayed } from '@/shared/player-preferences';
import { GameLibrary } from './GameLibrary';
import { RoomShortcut } from './RoomShortcut';

export function Lounge() {
  const [dialog, setDialog] = useState<{
    mode: 'create' | 'join';
    gameId: string;
    withBots?: boolean;
  } | null>(null);
  const played = useHasPlayed();
  const me = useQuery({ queryKey: keys.me, queryFn: () => api.me(), enabled: played });
  const activeRooms = (me.data?.rooms || [])
    .filter((room) => room.status === 'playing' || room.status === 'lobby')
    .toSorted((a, b) => Number(b.status === 'playing') - Number(a.status === 'playing'));
  const recentRooms = (me.data?.rooms || []).filter((room) => room.status === 'finished');
  return (
    <>
      <SiteHeader>
        <Button
          size="sm"
          className="lounge-create"
          aria-label="Create room"
          onClick={() => setDialog({ mode: 'create', gameId: 'uno' })}
        >
          <Plus size={16} />
          <span>Create room</span>
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
        {activeRooms.length ? (
          <section className="lounge-room-section" aria-label="Your rooms">
            <h2>Your rooms</h2>
            <div className="room-shortcuts">
              {activeRooms.map((room) => (
                <RoomShortcut key={room.id} room={room} />
              ))}
            </div>
          </section>
        ) : null}
        <GameLibrary
          onChoose={(gameId, withBots) => setDialog({ mode: 'create', gameId, withBots })}
        />
        {recentRooms.length ? (
          <section
            className="lounge-room-section lounge-room-section--recent"
            aria-label="Your recent rooms"
          >
            <div className="section-heading">
              <h2>Recent rooms</h2>
            </div>
            <div className="recent-rooms">
              {recentRooms.slice(0, 3).map((room) => (
                <RoomShortcut key={room.id} room={room} />
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
