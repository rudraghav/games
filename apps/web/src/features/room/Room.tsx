'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, MessageCircle, MoreHorizontal, ArrowLeft, Wifi, RefreshCw } from 'lucide-react';
import { Button, Modal, Wordmark } from '@games/ui';
import { gameById } from '@games/api-client/catalog';
import { api } from '@/lib/session';
import { RoomDialog } from '@/shared/RoomDialog';
import { tableRegistry } from '@/games/registry';
import { optimizeCardArt } from '@/shared/card-art';
import { useRoom } from './useRoom';
import { Chat } from './Chat';
import { Lobby } from './Lobby';

export function RoomScreen({ id }: { id: string }) {
  const { room: query, me, live, mutation, move } = useRoom(id);
  const [panel, setPanel] = useState<'chat' | 'rules' | 'menu' | 'configure' | null>(null);
  const [confirmAbandon, setConfirmAbandon] = useState(false);
  const router = useRouter();
  const room = query.data;
  const selfId = me.data?.profile?.id || '';
  if (!room)
    return (
      <main className="center-state">
        <Link href="/">
          <Wordmark />
        </Link>
        <h1 className="heading-md">
          {query.error ? 'This seat needs an invite.' : 'Pulling up your chair…'}
        </h1>
        <p className="muted">{query.error?.message || 'Connecting to your room.'}</p>
        <Link href="/" className="button button--secondary button--md">
          Back to the lounge
        </Link>
      </main>
    );
  const game = gameById(room.gameId);
  const host = room.ownerId === selfId;
  const self = room.members.find((member) => member.id === selfId);
  const Table = tableRegistry[room.gameId];
  const operate = (operation: () => ReturnType<typeof api.room>) => mutation.mutate(operation);
  const chat = (
    <Chat
      room={room}
      selfId={selfId}
      pending={mutation.isPending}
      send={async (body, kind) => {
        await mutation.mutateAsync(() => api.chat(id, body, kind));
      }}
    />
  );
  return (
    <div className="room-page">
      <header className="room-header">
        <Link href="/" aria-label="Back to the lounge" className="room-brand">
          <ArrowLeft size={17} />
          <Wordmark />
        </Link>
        <div className="room-title">
          <h1>{room.name}</h1>
          <span>{game.name}</span>
        </div>
        <div className="room-toolbar">
          <span
            className="connection-state"
            title={live ? 'Live updates connected' : 'Checking the table regularly'}
          >
            <Wifi size={14} />
            {query.isError ? 'Reconnecting' : live ? 'Live' : 'Connected'}
          </span>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Game rules"
            onClick={() => setPanel('rules')}
          >
            <BookOpen size={19} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="mobile-chat-button"
            aria-label="Open chat"
            onClick={() => setPanel('chat')}
          >
            <MessageCircle size={19} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Room options"
            onClick={() => setPanel('menu')}
          >
            <MoreHorizontal size={21} />
          </Button>
        </div>
      </header>
      <main className="room-content">
        <div className="room-main">
          {query.isError ? (
            <div className="connection-banner" role="status">
              The connection is taking a moment. Your last saved table is here.
              <Button variant="ghost" size="sm" onClick={() => void query.refetch()}>
                <RefreshCw size={14} />
                Reconnect
              </Button>
            </div>
          ) : null}
          {room.paused ? (
            <div className="connection-banner" role="status">
              Saving a seat for{' '}
              {room.missingPlayers
                .map((id) => room.members.find((m) => m.id === id)?.name || 'a player')
                .join(', ')}
              . Play resumes when everyone reconnects.
            </div>
          ) : null}
          {room.game ? (
            <>
              <div className="table-announcement" aria-live="polite">
                <span className="eyebrow">{room.game.phase.replaceAll('_', ' ')}</span>
                <p>{room.game.message}</p>
              </div>
              <Table
                key={room.matchId}
                match={room.game}
                room={room}
                selfId={selfId}
                imageLoader={optimizeCardArt}
                onAction={move}
                pending={mutation.isPending || !selfId}
              />
              {room.status === 'finished' && room.game.id !== 'tarot' ? (
                <section className="results">
                  <span className="eyebrow">The results are in</span>
                  <h2 className="heading-md">
                    {room.game.detail.draw === true
                      ? 'An even match. It’s a draw.'
                      : room.game.winners.length
                        ? `${room.game.winners.map((id) => room.members.find((member) => member.id === id)?.name || 'Player').join(' & ')} ${room.game.winners.length === 1 ? 'wins' : 'win'}!`
                        : 'A good round, well played.'}
                  </h2>
                  <div className="scoreboard">
                    {room.game.players.map((player) => (
                      <div key={player.id}>
                        <strong>
                          {room.members.find((member) => member.id === player.id)?.name || 'Player'}
                        </strong>
                        <span>
                          {player.score} points
                          {player.chips != null ? ` · ${player.chips} chips` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          ) : null}
          {room.status !== 'playing' ? (
            <Lobby
              room={room}
              selfId={selfId}
              ready={() => operate(() => api.ready(id, !self?.ready))}
              start={() => operate(() => api.start(id))}
              configure={() => setPanel('configure')}
              pending={mutation.isPending}
            />
          ) : !room.game ? (
            <div className="center-state">
              <h2 className="heading-md">You’re next in.</h2>
              <p className="muted">
                This match is already underway. Chat with the group and join the next round.
              </p>
            </div>
          ) : null}
          {mutation.error ? (
            <p className="error-note room-error" role="alert">
              {mutation.error.message}
            </p>
          ) : null}
        </div>
        <aside className="desktop-chat">{chat}</aside>
      </main>
      <Modal
        open={panel === 'chat'}
        onOpenChange={(open) => {
          if (!open) setPanel(null);
        }}
        title="At the table"
      >
        {chat}
      </Modal>
      <Modal
        open={panel === 'rules'}
        onOpenChange={(open) => {
          if (!open) setPanel(null);
        }}
        title={`How to play ${game.name}`}
      >
        <ol className="rules-list">
          {game.rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ol>
        <p className="small muted">
          {game.minPlayers === game.maxPlayers
            ? game.minPlayers
            : `${game.minPlayers}–${game.maxPlayers}`}{' '}
          players · {game.minutes} minutes
        </p>
      </Modal>
      <Modal
        open={panel === 'menu'}
        onOpenChange={(open) => {
          if (!open) {
            setPanel(null);
            setConfirmAbandon(false);
          }
        }}
        title="Your room"
      >
        <div className="menu-actions">
          {host ? (
            <>
              <Button
                variant="secondary"
                disabled={room.status === 'playing'}
                onClick={() => setPanel('configure')}
              >
                Change game
              </Button>
              <Button variant="secondary" onClick={() => operate(() => api.rotateInvite(id))}>
                Replace invite link and code
              </Button>
              {room.status === 'playing' ? (
                <>
                  <Button
                    variant="danger"
                    onClick={() => {
                      if (confirmAbandon) {
                        operate(() => api.abandon(id));
                        setPanel(null);
                        setConfirmAbandon(false);
                      } else setConfirmAbandon(true);
                    }}
                  >
                    {confirmAbandon ? 'Yes, end this match' : 'End this match'}
                  </Button>
                  {confirmAbandon ? (
                    <p className="small muted">
                      This returns everyone to the lobby. The current match won’t be scored.
                    </p>
                  ) : null}
                </>
              ) : null}
            </>
          ) : (
            <Button variant="secondary" onClick={() => operate(() => api.claim(id))}>
              Claim hosting if the host is away
            </Button>
          )}
          <Button
            variant="ghost"
            pending={mutation.isPending}
            onClick={() => {
              mutation.mutate(() => api.leave(id), { onSuccess: () => router.push('/') });
            }}
          >
            Leave room
          </Button>
        </div>
      </Modal>
      {panel === 'configure' ? (
        <RoomDialog
          key={room.gameId}
          open
          mode="configure"
          roomId={id}
          gameId={room.gameId}
          onOpenChange={(open) => {
            if (!open) setPanel(null);
          }}
        />
      ) : null}
    </div>
  );
}
