'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  MessageCircle,
  MoreVertical,
  ArrowLeft,
  Wifi,
  RefreshCw,
  Settings2,
  Link2,
  Flag,
  LogOut,
  History,
} from 'lucide-react';
import { Button, Modal, Wordmark, TurnNotice, ChoiceGroup } from '@games/ui';
import { gameById } from '@games/api-client/catalog';
import { api } from '@/lib/session';
import { RoomDialog } from '@/shared/RoomDialog';
import { tableRegistry } from '@/games/registry';
import { optimizeCardArt } from '@/shared/card-art';
import { turnState } from '@/games/shared/turn-state';
import { useRoom } from './useRoom';
import { Chat } from './Chat';
import { RoomActivity } from './RoomActivity';
import { Lobby } from './Lobby';
import { RoomResults } from './RoomResults';
import { useMediaQuery } from '@/shared/use-media-query';

export function RoomScreen({ id }: { id: string }) {
  const { room: query, me, live, mutation, move, botError, retryBots } = useRoom(id);
  const desktop = useMediaQuery('(min-width: 1100px)');
  const [panel, setPanel] = useState<'chat' | 'activity' | 'rules' | 'menu' | 'configure' | null>(
    null,
  );
  const [confirmAbandon, setConfirmAbandon] = useState(false);
  const router = useRouter();
  const room = query.data;
  const selfId = me.data?.profile?.id || '';
  const playerUnavailable = room && me.isSuccess && !selfId;
  const entryError = query.error || me.error;
  if (!room || !selfId)
    return (
      <main className="center-state">
        <Link href="/">
          <Wordmark />
        </Link>
        <h1 className="heading-md">
          {entryError
            ? 'Reconnect to your room'
            : playerUnavailable
              ? 'Player details unavailable'
              : 'Loading room…'}
        </h1>
        <p className="muted">
          {entryError?.message ||
            (playerUnavailable
              ? 'Try again to confirm your place at the table.'
              : 'Connecting to your room.')}
        </p>
        {entryError || playerUnavailable ? (
          <Button
            variant="secondary"
            pending={query.isFetching || me.isFetching}
            onClick={() => void Promise.all([query.refetch(), me.refetch()])}
          >
            Try again
          </Button>
        ) : null}
        <Link href="/" className="button button--secondary button--md">
          Back to the lounge
        </Link>
      </main>
    );
  const game = gameById(room.gameId);
  const host = room.ownerId === selfId;
  const self = room.members.find((member) => member.id === selfId);
  const Table = tableRegistry[room.gameId];
  const turn = room.game ? turnState(room.game, room, selfId) : null;
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
  const tablePanel = (
    <div className="room-panel">
      <div className="room-panel-switch">
        <ChoiceGroup
          label="Table panel"
          value={panel === 'activity' ? 'activity' : 'chat'}
          options={[
            { value: 'chat', label: 'Chat' },
            { value: 'activity', label: 'Activity' },
          ]}
          onChange={setPanel}
        />
      </div>
      {panel === 'activity' ? <RoomActivity key={room.matchId} room={room} /> : chat}
    </div>
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
            className="room-chat-button"
            aria-label={panel === 'chat' ? 'Close chat' : 'Open chat'}
            aria-expanded={panel === 'chat'}
            onClick={() => setPanel(panel === 'chat' ? null : 'chat')}
          >
            <MessageCircle size={19} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Room options"
            onClick={() => setPanel('menu')}
          >
            <MoreVertical size={21} />
          </Button>
          {desktop ? (
            <Button
              size="icon"
              variant="ghost"
              aria-label={panel === 'activity' ? 'Close game activity' : 'Open game activity'}
              aria-expanded={panel === 'activity'}
              onClick={() => setPanel(panel === 'activity' ? null : 'activity')}
            >
              <History size={19} />
            </Button>
          ) : null}
        </div>
      </header>
      <main
        className="room-content"
        data-chat-open={desktop && (panel === 'chat' || panel === 'activity')}
      >
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
          {botError ? (
            <div className="connection-banner" role="alert">
              Bot moves paused.{' '}
              <Button size="sm" variant="secondary" onClick={() => retryBots()}>
                Retry bot moves
              </Button>
            </div>
          ) : null}
          {room.game ? (
            <>
              <TurnNotice
                label={turn!.label}
                tone={turn!.tone}
                message={room.game.message}
                pending={mutation.isPending}
              />
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
                <RoomResults room={room} game={game} />
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
              addBots={(count) => operate(() => api.addBots(id, count))}
              removeBot={(botId) => operate(() => api.kick(id, botId))}
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
        {desktop && (panel === 'chat' || panel === 'activity') ? (
          <aside className="desktop-chat">{tablePanel}</aside>
        ) : null}
      </main>
      <Modal
        open={!desktop && (panel === 'chat' || panel === 'activity')}
        onOpenChange={(open) => {
          if (!open) setPanel(null);
        }}
        title="At the table"
      >
        {tablePanel}
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
        description="Manage this room or leave the table."
      >
        <div className="menu-actions">
          <Button variant="secondary" onClick={() => setPanel('activity')}>
            <History size={17} />
            Game activity
          </Button>
          {host ? (
            <section className="room-options-group" aria-label="Host controls">
              <Button
                variant="secondary"
                disabled={room.status === 'playing' || mutation.isPending}
                onClick={() => setPanel('configure')}
              >
                <Settings2 size={17} aria-hidden="true" />
                Change game
              </Button>
              <Button
                variant="secondary"
                pending={mutation.isPending}
                onClick={() => operate(() => api.rotateInvite(id))}
              >
                <Link2 size={17} aria-hidden="true" />
                Replace invite link and code
              </Button>
              {room.status === 'playing' ? (
                <>
                  <Button
                    variant="danger"
                    pending={mutation.isPending}
                    aria-describedby={confirmAbandon ? 'end-match-confirmation' : undefined}
                    onClick={() => {
                      if (confirmAbandon) {
                        operate(() => api.abandon(id));
                        setPanel(null);
                        setConfirmAbandon(false);
                      } else setConfirmAbandon(true);
                    }}
                  >
                    <Flag size={17} aria-hidden="true" />
                    {confirmAbandon ? 'Yes, end this match' : 'End this match'}
                  </Button>
                  {confirmAbandon ? (
                    <p className="small muted" id="end-match-confirmation">
                      This returns everyone to the lobby. The current match won’t be scored.
                    </p>
                  ) : null}
                </>
              ) : null}
            </section>
          ) : (
            <Button
              variant="secondary"
              pending={mutation.isPending}
              onClick={() => operate(() => api.claim(id))}
            >
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
            <LogOut size={17} aria-hidden="true" />
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
