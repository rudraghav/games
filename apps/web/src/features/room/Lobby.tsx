'use client';
import { Check, ArrowRight, Settings2, Bot } from 'lucide-react';
import { Button, Seat } from '@games/ui';
import type { BotLevel, Room } from '@games/api-client';
import { gameById } from '@games/api-client/catalog';
import { GameArt } from '@/shared/GameArt';
import { BotSeat } from './BotSeat';
import { InvitePanel } from './InvitePanel';

interface LobbyProps {
  room: Room;
  selfId: string;
  ready: () => void;
  start: () => void;
  configure: () => void;
  pending: boolean;
  addBots?: (count: number) => void;
  removeBot?: (id: string) => void;
  /** Host only: rename a bot or change how well it plays. */
  updateBot?: (id: string, change: { name?: string; level?: BotLevel }) => void;
}
export function Lobby({
  room,
  selfId,
  ready,
  start,
  configure,
  pending,
  addBots,
  removeBot,
  updateBot,
}: LobbyProps) {
  const game = gameById(room.gameId);
  const solo = game.maxPlayers === 1;
  const seated = room.members.filter((member) => member.seated);
  const own = room.members.find((member) => member.id === selfId);
  const host = room.ownerId === selfId;
  const canStart =
    seated.length >= game.minPlayers && seated.every((member) => member.ready && member.connected);
  // After a match the rematch controls come first, right under the results;
  // the seats and invite details follow for anyone who wants them.
  const rematch = room.status === 'finished';
  const startControls = (
    <>
      <div className="lobby-start" role="group" aria-label="Get ready to play">
        <Button variant={own?.ready ? 'secondary' : 'primary'} pending={pending} onClick={ready}>
          {own?.ready ? (
            <>
              <Check size={16} />
              You’re ready
            </>
          ) : own?.seated ? (
            'I’m ready'
          ) : (
            'Take an open seat'
          )}
        </Button>
        {host ? (
          <Button onClick={start} disabled={!canStart || pending}>
            {rematch ? 'Start rematch' : game.family === 'tarot' ? 'Open my deck' : 'Start game'}
            <ArrowRight size={16} />
          </Button>
        ) : (
          <p className="small muted">The host starts when everyone’s ready.</p>
        )}
      </div>
      {!canStart && host ? (
        <p className="small muted">
          {solo
            ? game.id === 'tarot'
              ? 'Mark yourself ready, then open your deck.'
              : 'Mark yourself ready, then start your game.'
            : seated.length < game.minPlayers
              ? `Bring at least ${game.minPlayers} players to the table.`
              : 'Everyone seated needs to be connected and ready.'}
        </p>
      ) : null}
    </>
  );
  return (
    <section className="lobby" data-rematch={rematch || undefined}>
      <div className="lobby-body">
        {rematch ? startControls : null}
        <div className="section-heading">
          <div className="lobby-summary">
            <div className="lobby-game" data-tone={game.color}>
              <GameArt game={game} />
            </div>
            <div>
              <h2 className="heading-md">
                {game.id === 'tarot' ? 'Your reading space' : solo ? 'Your table' : 'Players'}
              </h2>
              {!solo ? (
                <p className="small muted">
                  {seated.length} of {room.capacity} seats
                </p>
              ) : null}
            </div>
          </div>
          {host ? (
            <Button
              size="icon"
              variant="ghost"
              aria-label="Change game and settings"
              title="Change game and settings"
              onClick={configure}
              disabled={pending}
            >
              <Settings2 size={19} />
            </Button>
          ) : null}
        </div>
        <div className="lobby-seats">
          {Array.from({ length: room.capacity }, (_, i) => {
            const member = seated[i];
            if (member?.isBot)
              return (
                <BotSeat
                  key={member.id}
                  bot={member}
                  others={room.members.filter((m) => m.id !== member.id).map((m) => m.name)}
                  editable={host}
                  pending={pending}
                  onUpdate={updateBot ? (change) => updateBot(member.id, change) : undefined}
                  onRemove={host && removeBot ? () => removeBot(member.id) : undefined}
                />
              );
            return (
              <Seat
                key={member?.id || i}
                name={member?.name}
                nameLayout="wrap"
                you={member?.id === selfId}
                avatar={member?.avatar}
                frame={member?.frame}
                ready={member?.ready}
                connected={member?.connected}
              />
            );
          })}
        </div>
        {host && addBots && game.botsSupported && seated.length < room.capacity ? (
          <div className="bot-seat-tools">
            <Button variant="secondary" disabled={pending} onClick={() => addBots(1)}>
              <Bot size={16} />
              Add bot
            </Button>
            {room.capacity - seated.length > 1 ? (
              <Button
                variant="ghost"
                disabled={pending}
                onClick={() => addBots(room.capacity - seated.length)}
              >
                Fill seats with bots
              </Button>
            ) : null}
          </div>
        ) : null}
        {room.members.some((member) => member.isBot) && game.family === 'party' ? (
          <p className="small muted">Bots use simulated answers and votes.</p>
        ) : null}
        {!solo ? (
          <InvitePanel room={room} host={host} openSeats={room.capacity - seated.length} />
        ) : null}
        <div className="lobby-rules">
          {game.settings
            .filter((setting) => room.settings[setting.key])
            .map((setting) => (
              <span className="small muted" key={setting.key}>
                {setting.label}
              </span>
            ))}
        </div>
        {rematch ? null : startControls}
        {room.members.some((member) => !member.seated) ? (
          <p className="small muted">
            Waiting for the next seat:{' '}
            {room.members
              .filter((m) => !m.seated)
              .map((m) => m.name)
              .join(', ')}
          </p>
        ) : null}
      </div>
    </section>
  );
}
