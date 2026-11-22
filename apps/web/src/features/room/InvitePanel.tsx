'use client';
import { useState, useSyncExternalStore } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, Copy, Link2, Share2 } from 'lucide-react';
import type { Room } from '@games/api-client';
import { gameById } from '@games/api-client/catalog';
import { Button } from '@games/ui';
import { api } from '@/lib/session';
import { keys } from '@/shared/query-keys';
import { groupRoomCode, roomShareText, roomShortPath } from '@/shared/room-invite';
import { UsernameField } from '@/shared/UsernameField';
import { InviteByUsername } from './InviteByUsername';

const never = () => () => undefined;

/** The page's own origin, known only in the browser. */
function useOrigin() {
  return useSyncExternalStore(
    never,
    () => window.location.origin,
    () => '',
  );
}

function useCanShare() {
  return useSyncExternalStore(
    never,
    () => typeof navigator.share === 'function',
    () => false,
  );
}

/**
 * Everything needed to bring a friend to this room: the code to read aloud, the
 * short link, share and copy actions, and invitations by username.
 */
export function InvitePanel({
  room,
  host,
  openSeats,
}: {
  room: Room;
  host: boolean;
  openSeats: number;
}) {
  const origin = useOrigin();
  const canShare = useCanShare();
  const me = useQuery({ queryKey: keys.me, queryFn: () => api.me() });
  const [copied, setCopied] = useState<'link' | 'code' | ''>('');
  const [status, setStatus] = useState('');
  const [choosing, setChoosing] = useState(false);
  const game = gameById(room.gameId);
  const path = roomShortPath(room.code);
  const link = `${origin}${path}`;
  const username = me.data?.profile?.username ?? null;
  async function copy(kind: 'link' | 'code') {
    try {
      await navigator.clipboard.writeText(kind === 'link' ? link : room.code);
      setCopied(kind);
      const done = kind === 'link' ? 'Link copied.' : 'Code copied.';
      setStatus(done);
      window.setTimeout(() => {
        setCopied((current) => (current === kind ? '' : current));
        setStatus((current) => (current === done ? '' : current));
      }, 4000);
    } catch {
      setCopied('');
      setStatus('Copying isn’t available here. Select the code or the link instead.');
    }
  }
  async function share() {
    try {
      await navigator.share({
        title: room.name,
        text: roomShareText(game.name, room.code),
        url: link,
      });
      setStatus('Invite shared.');
    } catch (failure) {
      // Closing the share sheet is a choice, not a problem to report.
      if (failure instanceof DOMException && failure.name === 'AbortError') return;
      setStatus('Sharing didn’t open. Copy the link instead.');
    }
  }
  return (
    <div
      className="invite-panel invite-hub"
      role="group"
      aria-label="Invite friends"
      data-open-seats={openSeats > 0 || undefined}
    >
      <div className="invite-hub-share">
        <div className="invite-hub-heading">
          <h3>Invite friends</h3>
          {openSeats > 0 ? (
            <span className="small muted">
              {openSeats} open {openSeats === 1 ? 'seat' : 'seats'}
            </span>
          ) : null}
        </div>
        <div className="invite-hub-code">
          <span className="eyebrow">Room code</span>
          <strong className="room-code">{groupRoomCode(room.code)}</strong>
          <span className="invite-link" translate="no">
            {(origin.replace(/^https?:\/\//, '') || '') + path}
          </span>
        </div>
        <div className="invite-actions invite-hub-actions">
          {canShare ? (
            <Button onClick={() => void share()}>
              <Share2 size={16} aria-hidden="true" />
              Share
            </Button>
          ) : null}
          <Button variant={canShare ? 'secondary' : 'primary'} onClick={() => void copy('link')}>
            {copied === 'link' ? (
              <Check size={16} aria-hidden="true" />
            ) : (
              <Link2 size={16} aria-hidden="true" />
            )}
            {copied === 'link' ? 'Link copied' : 'Copy link'}
          </Button>
          <Button variant="secondary" onClick={() => void copy('code')}>
            {copied === 'code' ? (
              <Check size={16} aria-hidden="true" />
            ) : (
              <Copy size={16} aria-hidden="true" />
            )}
            {copied === 'code' ? 'Code copied' : 'Copy code'}
          </Button>
        </div>
        <p className="small invite-status" role="status">
          {status}
        </p>
      </div>
      <div className="invite-hub-friends">
        <InviteByUsername room={room} host={host} ownUsername={username} />
        {!me.data?.profile ? null : choosing ? (
          <UsernameField username={username} />
        ) : username ? (
          <p className="small muted invite-own-username">
            Friends can find you as <strong translate="no">@{username}</strong>.
          </p>
        ) : (
          <p className="small muted invite-own-username">
            Let friends find you:{' '}
            <button type="button" className="text-button" onClick={() => setChoosing(true)}>
              choose a username
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
