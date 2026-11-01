'use client';
import { useState } from 'react';
import { Copy, Check, Link2, ArrowRight, Settings2 } from 'lucide-react';
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
}
export function Lobby({ room, selfId, ready, start, configure, pending }: LobbyProps) {
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
      <div className="lobby-game" data-tone={game.color}>
        <GameArt game={game} />
        <span className="eyebrow">
          {room.status === 'finished' ? 'Another round?' : 'Tonight’s game'}
        </span>
        <h2>{game.name}</h2>
        <p>{game.subtitle}</p>
      </div>
      <div className="lobby-body">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Make yourself comfortable</p>
            <h2 className="heading-md">
              {room.status === 'finished'
                ? 'Keep the good company.'
                : 'The gang’s getting together.'}
            </h2>
          </div>
          {host ? (
            <Button
              size="icon"
              variant="ghost"
              aria-label="Change game and settings"
              onClick={configure}
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
                you={member?.id === selfId}
                avatar={member?.avatar}
                ready={member?.ready}
                connected={member?.connected}
              />
            );
          })}
        </div>
        <div className="invite-panel">
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
        <div className="lobby-start">
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
