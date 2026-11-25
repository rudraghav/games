'use client';
import { useEffect, useState, type ComponentProps } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Award, LayoutGrid, MoreHorizontal, Plus } from 'lucide-react';
import { Button, Menu, Wordmark, SegmentedTabs } from '@games/ui';
import { passiveApi } from '@/lib/session';
import { RoomDialog } from '@/shared/RoomDialog';
import { SiteHeader } from '@/shared/SiteHeader';
import { keys } from '@/shared/query-keys';
import { useHasPlayed } from '@/shared/player-preferences';
import { GameLibrary } from './GameLibrary';
import { RoomShortcut } from './RoomShortcut';
import { Invitations } from './Invitations';
import { ContinueLine } from './ContinueLine';

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
  const [dialog, setDialog] = useState<{ mode: 'create' | 'join'; gameId: string } | null>(null);
  const [tab, setTab] = useState<'games' | 'rooms'>('games');
  // Set when the header menu asks for Your games, so the tabs come into view.
  const [roomsRequest, setRoomsRequest] = useState(0);
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
  useEffect(() => {
    if (!roomsRequest) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document
      .getElementById('browse')
      ?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }, [roomsRequest]);
  function showRooms() {
    setTab('rooms');
    setRoomsRequest((request) => request + 1);
  }
  return (
    <>
      {/* The game is the first decision, so the page opens on the games. Joining
          with a code stays one tap away here; everything else is in More. */}
      <SiteHeader showGamesLink={false} onHomeClick={() => setTab('games')}>
        <Button
          size="sm"
          variant="secondary"
          className="header-join"
          aria-label="Join a room"
          onClick={() => setDialog({ mode: 'join', gameId: 'uno' })}
        >
          <span>
            Join<span className="header-join-rest"> a room</span>
          </span>
        </Button>
        <Menu
          label="More"
          icon={<MoreHorizontal size={20} aria-hidden="true" />}
          linkAs={Link}
          items={[
            {
              label: 'Create room',
              icon: <Plus size={17} aria-hidden="true" />,
              onSelect: () => setDialog({ mode: 'create', gameId: 'uno' }),
            },
            {
              label: 'Your games',
              icon: <LayoutGrid size={17} aria-hidden="true" />,
              onSelect: showRooms,
            },
            {
              label: 'Progress and rewards',
              icon: <Award size={17} aria-hidden="true" />,
              href: '/rewards',
            },
          ]}
        />
      </SiteHeader>
      <main className="page-width lounge-dashboard">
        {/* Time-sensitive, so it is the one thing allowed above the heading. */}
        <Invitations invitations={me.data?.invitations || []} />
        <SegmentedTabs
          label="Browse"
          variant="text"
          className="home-browse"
          heading={
            <h1 id="browse" className="home-headline">
              {tab === 'games' ? 'Choose a game' : 'Your games'}
            </h1>
          }
          value={tab}
          onValueChange={setTab}
          items={[
            {
              value: 'games',
              label: 'Games',
              content: (
                <>
                  <ContinueLine rooms={me.data?.rooms || []} onShowAll={showRooms} />
                  <GameLibrary />
                </>
              ),
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
        />
      ) : null}
    </>
  );
}
