'use client';
import { useState, type ComponentProps } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button, Wordmark, SegmentedTabs } from '@games/ui';
import { api } from '@/lib/session';
import { RoomDialog } from '@/shared/RoomDialog';
import { SiteHeader } from '@/shared/SiteHeader';
import { keys } from '@/shared/query-keys';
import { useHasPlayed } from '@/shared/player-preferences';
import { GameLibrary } from './GameLibrary';
import { RoomShortcut } from './RoomShortcut';

type ShortcutRoom = ComponentProps<typeof RoomShortcut>['room'];

export function LoungeRooms({
  rooms,
  loading = false,
  error = false,
  onRetry,
}: {
  rooms: readonly ShortcutRoom[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}) {
  const active = rooms
    .filter((room) => room.status === 'playing' || room.status === 'lobby')
    .toSorted((a, b) => Number(b.status === 'playing') - Number(a.status === 'playing'));
  const finished = rooms.filter((room) => room.status === 'finished');
  return (
    <section className="lounge-rooms" aria-label="Your rooms">
      {loading ? (
        <div className="lounge-rooms-state" role="status">
          <p>Loading your rooms…</p>
        </div>
      ) : error ? (
        <div className="lounge-rooms-state" role="alert">
          <h2>Could not load rooms</h2>
          <p>Try again to see your rooms.</p>
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : active.length || finished.length ? (
        <>
          {active.length ? (
            <section className="lounge-rooms-group" aria-label="In progress and waiting">
              <h2>In progress and waiting</h2>
              <div className="room-shortcuts">
                {active.map((room) => (
                  <RoomShortcut key={room.id} room={room} />
                ))}
              </div>
            </section>
          ) : null}
          {finished.length ? (
            <section className="lounge-rooms-group" aria-label="Finished rooms">
              <h2>Finished</h2>
              <div className="recent-rooms">
                {finished.map((room) => (
                  <RoomShortcut key={room.id} room={room} />
                ))}
              </div>
            </section>
          ) : null}
        </>
      ) : (
        <div className="lounge-rooms-state">
          <h2>No rooms yet</h2>
          <p>Rooms you create or join appear here.</p>
        </div>
      )}
    </section>
  );
}

export function Lounge() {
  const [dialog, setDialog] = useState<{
    mode: 'create' | 'join';
    gameId: string;
    withBots?: boolean;
  } | null>(null);
  const [tab, setTab] = useState<'games' | 'rooms'>('games');
  const played = useHasPlayed();
  const me = useQuery({ queryKey: keys.me, queryFn: () => api.me(), enabled: played });
  return (
    <>
      <SiteHeader showGamesLink={false} onHomeClick={() => setTab('games')}>
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
      <main className="page-width lounge-dashboard">
        <section className="hero hero--compact">
          <div>
            <h1 className="hero-title">{tab === 'games' ? 'Choose a game' : 'Your rooms'}</h1>
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
        <SegmentedTabs
          label="Browse"
          value={tab}
          onValueChange={setTab}
          items={[
            {
              value: 'games',
              label: 'Games',
              content: (
                <GameLibrary
                  onChoose={(gameId, withBots) => setDialog({ mode: 'create', gameId, withBots })}
                />
              ),
            },
            {
              value: 'rooms',
              label: 'Rooms',
              content: (
                <LoungeRooms
                  rooms={me.data?.rooms || []}
                  loading={played && me.isPending}
                  error={played && me.isError}
                  onRetry={() => void me.refetch()}
                />
              ),
            },
          ]}
        />
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
