'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  MessageCircle,
  MoreVertical,
  ArrowLeft,
  Wifi,
  WifiOff,
  RefreshCw,
  Settings2,
  Link2,
  Flag,
  LogOut,
  History,
  X,
} from 'lucide-react';
import { Button, Modal, Wordmark, TurnNotice, ChoiceGroup } from '@games/ui';
import { gameById } from '@games/api-client/catalog';
import { cardBackIds } from '@games/api-client';
import { api } from '@/lib/session';
import { RoomDialog } from '@/shared/RoomDialog';
import { tableRegistry } from '@/games/registry';
import { optimizeCardArt } from '@/shared/card-art';
import { turnState } from '@/games/shared/turn-state';
import { useRoom } from './useRoom';
import { Chat } from './Chat';
import { RoomActivity } from './RoomActivity';
import { ActionToasts } from './ActionToasts';
import { Lobby } from './Lobby';
import { RoomResults } from './RoomResults';
import { ResultsProgress } from './ResultsProgress';
import { TurnCoach } from '@/shared/tutorial/TurnCoach';
import { GameRulebook } from '@/shared/tutorial/RulesIllustrations';
import { setGuideEnabled, useGuideEnabled } from '@/shared/tutorial/guide-preference';
import { describeMove, latestMove } from './move-description';
import { useMediaQuery } from '@/shared/use-media-query';
import { forgetRoomMembership } from '@/shared/player-query';
import { gamePath, roomPath } from '@/shared/game-paths';
import './room-rules.css';

/** The shortest time a failed-move note stays up once the table has moved on. */
const ERROR_READ_MS = 6000;

export function RoomScreen({ id, tutorialMatchId }: { id: string; tutorialMatchId?: string }) {
  const cache = useQueryClient();
  const { room: query, me, live, connection, mutation, move, botError, retryBots } = useRoom(id);
  const desktop = useMediaQuery('(min-width: 1100px)');
  const [panel, setPanel] = useState<'chat' | 'activity' | 'rules' | 'menu' | 'configure' | null>(
    null,
  );
  const [confirmAbandon, setConfirmAbandon] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const room = query.data;
  const selfId = me.data?.profile?.id || '';
  const guidePreference = useGuideEnabled(room?.matchId, selfId);
  const openedRulesFromCoach = useRef(false);
  useEffect(() => {
    // A slug is navigation context, never permission or authority over the game.
    // Resolve legacy and stale links only from a successful member-only read.
    if (!room || !selfId || query.isError || me.isError) return;
    const canonical = roomPath(room);
    if (pathname === canonical) return;
    // After a change of game the table is already the right page with a stale slug.
    // Correct the address in place: a navigation would remount the room and drop an
    // open dialog or a move the player has not sent yet.
    const table = /^\/games\/[^/]+\/rooms\/[^/]+$/;
    if (table.test(pathname) && table.test(canonical))
      window.history.replaceState(null, '', canonical + window.location.search);
    else router.replace(canonical, { scroll: false });
  }, [room, selfId, query.isError, me.isError, pathname, router]);
  // A failed move stays readable until the table moves on after it, never for the
  // whole match. A stale move first refreshes the table, so the note belongs to
  // the version shown once that refresh settles, not to the one it was sent from.
  // It also stays up long enough to read when bots keep the table moving.
  const errorVersion = useRef<number | null | undefined>(undefined);
  const errorShownAt = useRef(0);
  const matchVersion = room?.matchVersion ?? null;
  const refreshing = query.isFetching;
  useEffect(() => {
    if (!mutation.error) {
      errorVersion.current = undefined;
      return;
    }
    if (refreshing) return;
    if (errorVersion.current === undefined) {
      errorVersion.current = matchVersion;
      errorShownAt.current = Date.now();
      return;
    }
    if (matchVersion === errorVersion.current) return;
    const timer = window.setTimeout(
      () => mutation.reset(),
      Math.max(0, errorShownAt.current + ERROR_READ_MS - Date.now()),
    );
    return () => window.clearTimeout(timer);
  }, [mutation, matchVersion, refreshing]);
  // A rematch starts while players are scrolled down at the results; bring the
  // new match's turn banner back into view instead of leaving them mid-page.
  const matchId = room?.game?.id ?? null;
  const shownMatch = useRef(matchId);
  useEffect(() => {
    if (shownMatch.current && matchId && matchId !== shownMatch.current)
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    shownMatch.current = matchId;
  }, [matchId]);
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
            ? 'Reconnect to your game'
            : playerUnavailable
              ? 'Player details unavailable'
              : 'Loading game…'}
        </h1>
        <p className="muted">
          {entryError?.message ||
            (playerUnavailable
              ? 'Try again to confirm your place at the table.'
              : 'Connecting to your game.')}
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
  const solo = game.maxPlayers === 1;
  const reading = game.id === 'tarot';
  // One organiser sets up a draw for people who never join the room.
  const organising = game.family === 'organiser';
  // These pages state their own progress and end on their own result.
  const ownsStatus = game.family === 'tarot' || organising;
  const optionsLabel = reading
    ? 'Reading options'
    : organising
      ? 'Event options'
      : solo
        ? 'Table options'
        : 'Room options';
  const host = room.ownerId === selfId;
  const guideAvailable = Boolean(
    room.game &&
    room.matchId &&
    host &&
    (solo || room.members.every((member) => member.id === selfId || member.isBot)),
  );
  const guided = guideAvailable && (guidePreference ?? tutorialMatchId === room.matchId);
  const tutorialControlAvailable = guideAvailable && (room.status === 'playing' || guided);
  const rulesLabel = tutorialControlAvailable ? 'Rules & tutorial' : 'Game rules';
  const enableGuide = (enable: boolean) => {
    if (!room.matchId) return;
    setGuideEnabled(room.matchId, selfId, enable);
    // Keep the choice across reload even when the browser restricts local storage.
    const url = new URL(window.location.href);
    if (enable) url.searchParams.set('tutorial', room.matchId);
    else url.searchParams.delete('tutorial');
    window.history.replaceState(null, '', url);
  };
  const openRules = (fromCoach: boolean) => {
    openedRulesFromCoach.current = fromCoach;
    setPanel('rules');
  };
  const self = room.members.find((member) => member.id === selfId);
  // The viewer's own card back. It restyles face-down cards on this screen only;
  // an id this build cannot draw leaves the standard back in place.
  const wornBack = me.data?.profile?.cardBack;
  const cardBack = (cardBackIds as readonly string[]).includes(wornBack ?? '')
    ? wornBack
    : undefined;
  const Table = tableRegistry[room.gameId];
  const turn = room.game ? turnState(room.game, room, selfId) : null;
  // Offline, the saved table stays readable but stops looking or acting live.
  const offline = connection === 'offline';
  // Move panels can portal outside the inert table frame. Give every table the
  // same local pause without changing the cached server snapshot or pretending
  // that a move is saving. Reconnecting restores the existing draft choices.
  const tableRoom = offline ? { ...room, paused: true } : room;
  // At the end of a match the result and the rematch come first; the final
  // table stays below for review. Tarot's reading is itself the result.
  const resultsFirst = room.status === 'finished' && Boolean(room.game) && !ownsStatus;
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
  const lobby = solo ? (
    <section className="center-state">
      <h2 className="heading-md">{reading ? 'Your next spread' : game.name}</h2>
      <Button
        pending={mutation.isPending}
        onClick={() =>
          operate(async () => {
            await api.ready(id, true);
            return api.start(id);
          })
        }
      >
        {reading
          ? 'Start reading'
          : organising
            ? 'Start organising'
            : room.status === 'finished'
              ? 'Play again'
              : 'Start game'}
      </Button>
    </section>
  ) : (
    <Lobby
      room={room}
      selfId={selfId}
      ready={() => operate(() => api.ready(id, !self?.ready))}
      start={() => operate(() => api.start(id))}
      configure={() => setPanel('configure')}
      pending={mutation.isPending}
      addBots={(count) => operate(() => api.addBots(id, count))}
      removeBot={(botId) => operate(() => api.kick(id, botId))}
      updateBot={(botId, change) => operate(() => api.updateBot(id, botId, change))}
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
    <div className="room-page" data-card-back={cardBack ?? undefined}>
      <header className="room-header">
        <Link
          href={gamePath(room.gameId)}
          aria-label={`Back to ${game.name}`}
          className="room-brand"
        >
          <ArrowLeft size={17} />
          <Wordmark />
        </Link>
        <div className="room-title">
          <h1>{solo ? game.name : room.name}</h1>
          <span>
            {reading
              ? 'Your private reading'
              : organising
                ? 'You’re the organiser'
                : solo
                  ? 'Your private table'
                  : game.name}
          </span>
        </div>
        <div className="room-toolbar">
          <span
            className="connection-state"
            data-state={connection}
            title={
              connection === 'offline'
                ? 'No network connection'
                : connection === 'reconnecting'
                  ? 'Trying to reach the table'
                  : live
                    ? 'Live updates connected'
                    : 'Checking the table regularly'
            }
          >
            {connection === 'offline' ? <WifiOff size={14} /> : <Wifi size={14} />}
            {connection === 'offline'
              ? 'Offline'
              : connection === 'reconnecting'
                ? 'Reconnecting'
                : live
                  ? 'Live'
                  : 'Connected'}
          </span>
          <Button
            id="room-rulebook-button"
            className="room-rulebook-button"
            size="sm"
            variant="ghost"
            aria-label={rulesLabel}
            title={rulesLabel}
            aria-haspopup="dialog"
            onClick={() => openRules(false)}
          >
            <BookOpen size={17} aria-hidden="true" />
            <span>
              Rules
              {tutorialControlAvailable && (
                <span className="room-rulebook-long-label"> &amp; tutorial</span>
              )}
            </span>
          </Button>
          {!solo ? (
            <Button
              size="icon"
              variant="ghost"
              className="room-chat-button"
              aria-label={panel === 'chat' ? 'Close chat' : 'Open chat'}
              title={panel === 'chat' ? 'Close chat' : 'Open chat'}
              aria-expanded={panel === 'chat'}
              onClick={() => setPanel(panel === 'chat' ? null : 'chat')}
            >
              <MessageCircle size={19} />
            </Button>
          ) : null}
          <Button
            size="icon"
            variant="ghost"
            aria-label={optionsLabel}
            title={optionsLabel}
            onClick={() => setPanel('menu')}
          >
            <MoreVertical size={21} />
          </Button>
          {desktop && !solo ? (
            <Button
              size="icon"
              variant="ghost"
              aria-label={panel === 'activity' ? 'Close game activity' : 'Open game activity'}
              title={panel === 'activity' ? 'Close game activity' : 'Open game activity'}
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
        data-chat-open={!solo && desktop && (panel === 'chat' || panel === 'activity')}
      >
        <div className="room-main">
          {mutation.error ? (
            <div className="error-note room-error" role="alert">
              <p>{mutation.error.message}</p>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Dismiss this message"
                onClick={() => mutation.reset()}
              >
                <X size={16} />
              </Button>
            </div>
          ) : null}
          {offline ? (
            <div className="connection-banner room-offline" role="status">
              <WifiOff size={16} aria-hidden="true" />
              <span>
                <strong>You’re offline.</strong>{' '}
                {mutation.isPaused
                  ? 'Your move will be sent when you reconnect.'
                  : organising
                    ? 'Everything you saved is here.'
                    : solo
                      ? 'Your cards are saved.'
                      : 'This is your last saved table. Moves resume when you reconnect.'}
              </span>
            </div>
          ) : query.isError ? (
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
              {(!guided && !ownsStatus) || offline || room.paused ? (
                <TurnNotice
                  label={turn!.label}
                  tone={offline ? 'paused' : turn!.tone}
                  message={
                    offline
                      ? mutation.isPaused
                        ? 'Your move is waiting to be sent.'
                        : 'Moves pause while you’re offline.'
                      : turn!.message
                  }
                  lastMove={latestMove(room, selfId)}
                  pending={mutation.isPending && !mutation.isPaused}
                />
              ) : null}
              {guided ? (
                <TurnCoach
                  key={`${room.matchId}:${selfId}`}
                  room={tableRoom}
                  selfId={selfId}
                  pending={mutation.isPending}
                  offline={offline}
                  botFailed={Boolean(botError)}
                  onAction={move}
                  describeMove={describeMove}
                  onRules={() => openRules(true)}
                  onExit={() => {
                    enableGuide(false);
                    document.getElementById('room-rulebook-button')?.focus();
                  }}
                />
              ) : null}
              {resultsFirst ? (
                <>
                  <RoomResults room={room} game={game} />
                  <ResultsProgress key={room.matchId} />
                  {lobby}
                  <h2 className="final-table-heading">Final table</h2>
                </>
              ) : null}
              <div
                className="room-table-frame"
                id={guided ? 'tutorial-game-table' : undefined}
                tabIndex={guided ? -1 : undefined}
                data-offline={offline}
                inert={offline}
              >
                <Table
                  key={room.matchId}
                  match={room.game}
                  room={tableRoom}
                  selfId={selfId}
                  imageLoader={optimizeCardArt}
                  onAction={move}
                  pending={mutation.isPending || !selfId}
                />
              </div>
            </>
          ) : null}
          {room.status !== 'playing' ? (
            // A finished solo reading offers its own one-tap "Draw a new spread".
            resultsFirst || (room.status === 'finished' && game.maxPlayers === 1) ? null : (
              lobby
            )
          ) : !room.game ? (
            <div className="center-state">
              <h2 className="heading-md">You’re next in.</h2>
              <p className="muted">
                This match is already underway. Chat with the group and join the next round.
              </p>
            </div>
          ) : null}
        </div>
        {!solo && desktop && (panel === 'chat' || panel === 'activity') ? (
          <aside className="desktop-chat">{tablePanel}</aside>
        ) : null}
        {/* A solo table has no one else's moves to report. */}
        {room.game && room.status === 'playing' && !solo ? (
          <ActionToasts room={room} selfId={selfId} />
        ) : null}
      </main>
      <Modal
        open={!solo && !desktop && (panel === 'chat' || panel === 'activity')}
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
        wide
        stickyHeader
        onCloseAutoFocus={(event) => {
          if (openedRulesFromCoach.current && !guided) {
            event.preventDefault();
            document.getElementById('room-rulebook-button')?.focus({ preventScroll: true });
          }
        }}
      >
        <GameRulebook
          game={game}
          tutorialControl={
            tutorialControlAvailable && (
              <Button
                variant="secondary"
                role="switch"
                aria-label="Step-by-step tutorial"
                aria-checked={guided}
                className="room-tutorial-switch"
                onClick={() => enableGuide(!guided)}
              >
                Step-by-step tutorial
                <span aria-hidden="true">{guided ? 'On' : 'Off'}</span>
              </Button>
            )
          }
        />
      </Modal>
      <Modal
        open={panel === 'menu'}
        onOpenChange={(open) => {
          if (!open) {
            setPanel(null);
            setConfirmAbandon(false);
          }
        }}
        title={solo ? optionsLabel : 'Your room'}
        description={
          solo
            ? reading
              ? 'Completed readings stay in your profile.'
              : organising
                ? 'This event stays under Your games on the home page.'
                : 'Your profile keeps the results of each finished session.'
            : 'Manage this room or leave the table.'
        }
      >
        <div className="menu-actions">
          {solo ? (
            <Link href="/profile" className="button button--secondary button--md">
              <History size={17} />
              {reading ? 'Saved readings' : 'Past games'}
            </Link>
          ) : (
            <Button variant="secondary" onClick={() => setPanel('activity')}>
              <History size={17} />
              Game activity
            </Button>
          )}
          {!solo && host ? (
            <section className="room-options-group" aria-label="Host controls">
              <Button
                variant="secondary"
                disabled={room.status === 'playing' || mutation.isPending}
                onClick={() => setPanel('configure')}
              >
                <Settings2 size={17} aria-hidden="true" />
                Change game
              </Button>
              {!solo ? (
                <Button
                  variant="secondary"
                  pending={mutation.isPending}
                  onClick={() => operate(() => api.rotateInvite(id))}
                >
                  <Link2 size={17} aria-hidden="true" />
                  Replace invite link and code
                </Button>
              ) : null}
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
          ) : !solo ? (
            <Button
              variant="secondary"
              pending={mutation.isPending}
              onClick={() => operate(() => api.claim(id))}
            >
              Claim hosting if the host is away
            </Button>
          ) : null}
          {solo ? (
            <Link href={gamePath(room.gameId)} className="button button--ghost button--md">
              <ArrowLeft size={17} aria-hidden="true" />
              Back to {game.name === 'Pop Tarot' ? 'Tarot' : game.name}
            </Link>
          ) : (
            <Button
              variant="ghost"
              pending={mutation.isPending}
              onClick={() => {
                mutation.mutate(() => api.leave(id), {
                  onSuccess: async () => {
                    await forgetRoomMembership(cache, id);
                    router.push('/');
                  },
                });
              }}
            >
              <LogOut size={17} aria-hidden="true" />
              Leave room
            </Button>
          )}
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
