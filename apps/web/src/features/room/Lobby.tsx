'use client';
import { useState } from 'react';
import { Copy, Check, Link2, ArrowRight, Settings2, Bot, X } from 'lucide-react';
import { Button, Seat } from '@games/ui';
import type { Room } from '@games/api-client';
import { gameById } from '@games/api-client/catalog';
import { GameArt } from '@/shared/GameArt';

interface LobbyProps {
  room: Room;
  selfId: string;
  ready: () => void;
  start: () => void;
  configure: () => void;
  pending: boolean;
  addBots?: (count: number) => void;
  removeBot?: (id: string) => void;
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
}: LobbyProps) {
  const [copied, setCopied] = useState('');
  const [copyError, setCopyError] = useState('');
  const game = gameById(room.gameId);
  const seated = room.members.filter((member) => member.seated);
  const own = room.members.find((member) => member.id === selfId);
  const host = room.ownerId === selfId;
  const canStart =
    seated.length >= game.minPlayers && seated.every((member) => member.ready && member.connected);
  async function copy(kind: 'link' | 'code') {
    try {
      await navigator.clipboard.writeText(
        kind === 'link' ? `${location.origin}/join/${room.inviteToken || room.code}` : room.code,
      );
      setCopied(kind);
      setCopyError('');
      window.setTimeout(() => setCopied(''), 2500);
    } catch {
      setCopyError('Copy isn’t available here. Select the room code below.');
    }
  }
  return (
    <section className="lobby">
      <div className="lobby-body">
        <div className="section-heading">
          <div className="lobby-summary">
            <div className="lobby-game" data-tone={game.color}>
              <GameArt game={game} />
            </div>
            <div>
              <h2 className="heading-md">Players</h2>
              <p className="small muted">
                {seated.length} of {room.capacity} seats
              </p>
            </div>
          </div>
          {host ? (
            <Button
              size="icon"
              variant="ghost"
              aria-label="Change game and settings"
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
            return (
              <Seat
                key={member?.id || i}
                name={member?.name}
                nameLayout="wrap"
                you={member?.id === selfId}
                avatar={member?.avatar}
                bot={member?.isBot}
                action={
                  host && member?.isBot && removeBot ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={pending}
                      aria-label={`Remove ${member.name} bot`}
                      onClick={() => removeBot(member.id)}
                    >
                      <X size={15} />
                    </Button>
                  ) : undefined
                }
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
        <div className="invite-panel" role="group" aria-label="Invite friends">
          <div>
            <span className="eyebrow">Your room code</span>
            <strong className="room-code">{room.code}</strong>
          </div>
          <div className="invite-actions">
            <Button variant="secondary" size="sm" onClick={() => void copy('code')}>
              {copied === 'code' ? <Check size={15} /> : <Copy size={15} />}Code
            </Button>
            <Button size="sm" onClick={() => void copy('link')}>
              {copied === 'link' ? <Check size={15} /> : <Link2 size={15} />}
              {copied === 'link' ? 'Copied!' : 'Copy invite'}
            </Button>
          </div>
        </div>
        {copyError ? (
          <p className="small muted" role="status">
            {copyError}
          </p>
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
              {room.status === 'finished'
                ? 'Start rematch'
                : game.family === 'tarot'
                  ? 'Open my deck'
                  : 'Start game'}
              <ArrowRight size={16} />
            </Button>
          ) : (
            <p className="small muted">The host starts when everyone’s ready.</p>
          )}
        </div>
        {!canStart && host ? (
          <p className="small muted">
            {seated.length < game.minPlayers
              ? `Bring at least ${game.minPlayers} players to the table.`
              : 'Everyone seated needs to be connected and ready.'}
          </p>
        ) : null}
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
