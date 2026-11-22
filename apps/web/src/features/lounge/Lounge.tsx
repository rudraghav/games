'use client';
import { useState, type ComponentProps } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button, Wordmark, SegmentedTabs } from '@games/ui';
import { passiveApi } from '@/lib/session';
import { RoomDialog } from '@/shared/RoomDialog';
import { SiteHeader } from '@/shared/SiteHeader';
import { keys } from '@/shared/query-keys';
import { useHasPlayed } from '@/shared/player-preferences';
import { GameLibrary } from './GameLibrary';
import { RoomShortcut } from './RoomShortcut';
import { Invitations } from './Invitations';

/** How often the home page checks for a new invitation while it is in view. */
const INVITATION_REFRESH_MS = 20000;

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
    <section className="lounge-rooms" aria-label="Your games">
      {loading ? (
        <div className="lounge-rooms-state" role="status">
          <p>Loading your games…</p>
        </div>
      ) : error ? (
        <div className="lounge-rooms-state" role="alert">
          <h2>Could not load your games</h2>
          <p>Try again to see your games.</p>
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
            <section className="lounge-rooms-group" aria-label="Finished games">
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
          <h2>No games yet</h2>
          <p>Readings and games you start or join appear here.</p>
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
  const [soloRequest, setSoloRequest] = useState(0);
  const played = useHasPlayed();
  // Returning to the tab and a modest interval bring a new invitation without a
  // reload. A hidden tab does not poll, and a visitor who never played is not read.
  const me = useQuery({
    queryKey: keys.me,
    queryFn: () => passiveApi.me(),
    enabled: played,
    refetchInterval: INVITATION_REFRESH_MS,
    refetchOnWindowFocus: 'always',
  });
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
            <h1 className="hero-title">{tab === 'games' ? 'Choose a game' : 'Your games'}</h1>
            <div className="hero-actions">
              <Button
                size="lg"
                onClick={() => {
                  setTab('games');
                  setSoloRequest((value) => value + 1);
                }}
              >
                Play solo
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
        <Invitations invitations={me.data?.invitations || []} />
        <SegmentedTabs
          label="Browse"
          value={tab}
          onValueChange={setTab}
          items={[
            {
              value: 'games',
              label: 'Games',
              content: <GameLibrary key={soloRequest} initialSolo={soloRequest > 0} />,
            },
            {
              value: 'rooms',
              label: 'Your games',
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
