'use client';
import { useEffect, useState, type ComponentProps, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button, Wordmark, SegmentedTabs } from '@games/ui';
import { api, passiveApi } from '@/lib/session';
import { RoomDialog } from '@/shared/RoomDialog';
import { SiteHeader } from '@/shared/SiteHeader';
import { keys } from '@/shared/query-keys';
import { rememberedPlayer, rememberPlayer, useHasPlayed } from '@/shared/player-preferences';
import { refreshPlayer } from '@/shared/player-query';
import { formatInviteInput, roomInvite } from '@/shared/room-invite';
import { roomPath } from '@/shared/game-paths';
import { GameLibrary } from './GameLibrary';
import { RoomShortcut } from './RoomShortcut';
import { Invitations } from './Invitations';
import { WelcomeStrip } from './WelcomeStrip';
import { ContinueRail } from './ContinueRail';
import { CollectionRails } from './CollectionRails';
import type { LibraryPreset } from './collections';

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
  const router = useRouter();
  const cache = useQueryClient();
  const [dialog, setDialog] = useState<{
    mode: 'create' | 'join';
    gameId: string;
    withBots?: boolean;
    invite?: string;
  } | null>(null);
  const [tab, setTab] = useState<'games' | 'rooms'>('games');
  // The library view that Play solo or a collection's See all asked for. Each
  // request opens the library afresh with that view and brings it into sight.
  const [view, setView] = useState<{ request: number; preset?: LibraryPreset }>({ request: 0 });
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
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
    if (!view.request) return;
    const library = document.getElementById('games');
    if (!library) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // The chosen filter takes focus, so keyboard and screen-reader users land on it.
    // On a phone it can sit off to the side of the category row: bring it into
    // that row first, then bring the library itself up the page.
    const chosen = library.querySelector<HTMLElement>('.library-categories [aria-pressed="true"]');
    chosen?.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'nearest' });
    chosen?.focus({ preventScroll: true });
    library.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }, [view.request]);
  function showLibrary(preset: LibraryPreset) {
    setTab('games');
    setView((current) => ({ request: current.request + 1, preset }));
  }
  /**
   * The code field beside Join a room, shown on wide screens. Empty (and always
   * on phones, where the field is not shown) the button opens the join dialog.
   * With a code, a player we already know joins at once; anyone else gets the
   * dialog with the code filled in, to add their name.
   */
  async function join(event: FormEvent) {
    event.preventDefault();
    setJoinError('');
    if (!code.trim()) return setDialog({ mode: 'join', gameId: 'uno' });
    let invite: string;
    try {
      invite = roomInvite(code);
    } catch (failure) {
      return setJoinError(failure instanceof Error ? failure.message : 'Please try again.');
    }
    const player = me.data?.profile ?? rememberedPlayer();
    if (!player) return setDialog({ mode: 'join', gameId: 'uno', invite: code });
    setJoining(true);
    try {
      const room = await api.join(invite, player.name, player.avatar);
      rememberPlayer(player.name, player.avatar);
      cache.setQueryData(keys.room(room.id), room);
      // The seat is taken; a failed identity read must not offer to join again.
      await refreshPlayer(cache, () => api.me()).catch(() => undefined);
      router.push(roomPath(room));
    } catch (failure) {
      setJoinError(failure instanceof Error ? failure.message : 'Please try again.');
    } finally {
      setJoining(false);
    }
  }
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
        <WelcomeStrip known={played || Boolean(me.data?.profile)} />
        <section className="hero hero--compact">
          <div>
            <h1 className="hero-title">{tab === 'games' ? 'Choose a game' : 'Your games'}</h1>
            <div className="hero-actions">
              <Button size="lg" onClick={() => showLibrary({ category: 'solo', players: 1 })}>
                Play solo
              </Button>
              <form className="join-inline" onSubmit={join} noValidate>
                <input
                  className="input join-inline-code"
                  aria-label="Room code or invite link"
                  aria-describedby={joinError ? 'join-inline-error' : undefined}
                  aria-invalid={joinError ? true : undefined}
                  value={code}
                  onChange={(event) => {
                    setCode(formatInviteInput(event.target.value));
                    setJoinError('');
                  }}
                  placeholder="Room code"
                  inputMode="text"
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
                <Button size="lg" variant="secondary" type="submit" pending={joining}>
                  Join a room
                </Button>
              </form>
            </div>
            {joinError ? (
              <p className="error-note join-inline-error" id="join-inline-error" role="alert">
                {joinError}
              </p>
            ) : null}
          </div>
        </section>
        <Invitations invitations={me.data?.invitations || []} />
        <ContinueRail rooms={me.data?.rooms || []} />
        <SegmentedTabs
          label="Browse"
          value={tab}
          onValueChange={setTab}
          items={[
            {
              value: 'games',
              label: 'Games',
              content: (
                <>
                  <CollectionRails onSeeAll={(collection) => showLibrary(collection.preset)} />
                  <GameLibrary key={view.request} preset={view.preset} />
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
          withBots={dialog.withBots}
          invite={dialog.invite}
        />
      ) : null}
    </>
  );
}
