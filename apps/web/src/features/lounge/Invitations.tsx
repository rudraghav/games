'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { Invitation, Me } from '@games/api-client';
import { games } from '@games/api-client/catalog';
import { Avatar, Button } from '@games/ui';
import { api } from '@/lib/session';
import { keys } from '@/shared/query-keys';
import { refreshPlayer } from '@/shared/player-query';
import { roomPath } from '@/shared/game-paths';

/** "Sam invited you to Friday game night · Uno · 2 of 4 players", with Join and Decline. */
export function InvitationList({
  invitations,
  busy,
  error,
  notice,
  onJoin,
  onDecline,
}: {
  invitations: readonly Invitation[];
  /** The room being answered, so only its buttons show progress. */
  busy?: { roomId: string; answer: 'join' | 'decline' } | null;
  error?: string;
  notice?: string;
  onJoin: (invitation: Invitation) => void;
  onDecline: (invitation: Invitation) => void;
}) {
  return (
    <>
      {invitations.length || error ? (
        <section className="invitations" aria-label="Invitations">
          {invitations.length ? (
            <>
              <h2 className="eyebrow">
                {invitations.length === 1 ? 'You’re invited' : `${invitations.length} invitations`}
              </h2>
              <ul className="invitation-list">
                {invitations.map((invitation) => {
                  const game = games.find((item) => item.id === invitation.gameId);
                  const answering = busy?.roomId === invitation.roomId ? busy.answer : null;
                  return (
                    <li className="invitation" key={invitation.roomId}>
                      <Avatar name={invitation.fromName} seed={invitation.fromAvatar} />
                      <p className="invitation-copy">
                        <strong>
                          {invitation.fromName} invited you to {invitation.roomName}
                        </strong>
                        <span>
                          {game?.name ?? 'A game'} · {invitation.players} of {invitation.capacity}{' '}
                          players
                        </span>
                      </p>
                      <div className="invitation-actions">
                        <Button
                          pending={answering === 'join'}
                          disabled={Boolean(busy)}
                          aria-label={`Join ${invitation.roomName}`}
                          onClick={() => onJoin(invitation)}
                        >
                          Join
                        </Button>
                        <Button
                          variant="ghost"
                          pending={answering === 'decline'}
                          disabled={Boolean(busy)}
                          aria-label={`Decline invitation to ${invitation.roomName}`}
                          onClick={() => onDecline(invitation)}
                        >
                          Decline
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : null}
          {error ? (
            <p className="error-note" role="alert">
              {error}
            </p>
          ) : null}
        </section>
      ) : null}
      {/* Outside the region, so a declined last invitation is still announced. */}
      <p className="sr-only" role="status">
        {notice}
      </p>
    </>
  );
}

/** Invitations waiting for this player, answered without leaving the home page. */
export function Invitations({ invitations }: { invitations: readonly Invitation[] }) {
  const router = useRouter();
  const cache = useQueryClient();
  const [busy, setBusy] = useState<{ roomId: string; answer: 'join' | 'decline' } | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  async function answer(invitation: Invitation, kind: 'join' | 'decline') {
    setBusy({ roomId: invitation.roomId, answer: kind });
    setError('');
    setNotice('');
    try {
      if (kind === 'decline') {
        const me = await api.declineInvitation(invitation.roomId);
        await cache.cancelQueries({ queryKey: keys.me, exact: true });
        cache.setQueryData<Me>(keys.me, me);
        setNotice(`Declined ${invitation.fromName}’s invitation.`);
        return;
      }
      const room = await api.acceptInvitation(invitation.roomId);
      cache.setQueryData(keys.room(room.id), room);
      // The seat is taken; a failed identity read must not offer Join again.
      await refreshPlayer(cache, () => api.me()).catch(() => undefined);
      router.push(roomPath(room));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Please try again.');
      // The room may have filled or closed; show what is still on offer.
      void cache.invalidateQueries({ queryKey: keys.me, exact: true });
    } finally {
      setBusy(null);
    }
  }
  if (!invitations.length && !error && !notice) return null;
  return (
    <InvitationList
      invitations={invitations}
      busy={busy}
      error={error}
      notice={notice}
      onJoin={(invitation) => void answer(invitation, 'join')}
      onDecline={(invitation) => void answer(invitation, 'decline')}
    />
  );
}
