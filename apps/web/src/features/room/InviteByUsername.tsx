'use client';
import { useEffect, useId, useState } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Search, X } from 'lucide-react';
import { ApiError, type PlayerHit, type Room } from '@games/api-client';
import { Avatar, Button } from '@games/ui';
import { api } from '@/lib/session';
import { keys } from '@/shared/query-keys';
import { typedUsername } from '@/shared/username';
import { acceptRoomSnapshot } from './room-snapshot';

const DEBOUNCE_MS = 250;

function useDebounced<T>(value: T, delay: number) {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return settled;
}

/** Invitations this browser tab sent, so their sender can also take them back. */
function useSentInvites(roomId: string) {
  const key = `games:invited:${roomId}`;
  const [sent, setSent] = useState<readonly string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved: unknown = JSON.parse(sessionStorage.getItem(key) || '[]');
      return Array.isArray(saved) ? saved.filter((item) => typeof item === 'string') : [];
    } catch {
      return [];
    }
  });
  function remember(username: string) {
    const next = [...new Set([...sent, username])];
    setSent(next);
    try {
      sessionStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Private browsing may refuse storage; the host can still cancel.
    }
  }
  return [sent, remember] as const;
}

function problem(error: unknown, limited: string, fallback: string) {
  if (error instanceof ApiError && error.status === 429)
    return error.message.startsWith('We could not') ? limited : error.message;
  if (error instanceof ApiError && error.status < 500 && error.status !== 401) return error.message;
  return fallback;
}

/** What the search has to say for the text typed so far. */
export function FriendSearchResults({
  term,
  searching,
  failed,
  players,
  invited,
  ownUsername,
  busy,
  onInvite,
}: {
  term: string;
  searching: boolean;
  failed: string;
  players: readonly PlayerHit[] | undefined;
  invited: readonly string[];
  ownUsername: string | null;
  busy: string | null;
  onInvite: (player: PlayerHit) => void;
}) {
  if (term.length < 2)
    return (
      <p className="small muted friend-search-hint">
        Type the first 2 letters of a friend’s username.
      </p>
    );
  return (
    <div className="friend-results" aria-busy={searching || undefined}>
      {failed ? (
        <p className="small friend-results-state" role="alert">
          {failed}
        </p>
      ) : !players || (searching && players.length === 0) ? (
        <p className="small muted friend-results-state">Searching…</p>
      ) : players.length === 0 ? (
        <p className="small muted friend-results-state">
          No one has a username starting with “{term}”. Check the spelling, or share the link
          instead.
        </p>
      ) : (
        <ul className="friend-list" aria-label="Players found">
          {players.map((player) => {
            const sent = invited.includes(player.username);
            return (
              <li className="friend-row" key={player.username}>
                <Avatar name={player.name} seed={player.avatar} size="sm" />
                <span className="friend-copy">
                  <strong>{player.name}</strong>
                  <span>@{player.username}</span>
                </span>
                {player.username === ownUsername ? (
                  <span className="small muted">That’s you</span>
                ) : (
                  <Button
                    size="sm"
                    variant={sent ? 'ghost' : 'secondary'}
                    disabled={sent || busy !== null}
                    pending={busy === player.username}
                    aria-label={
                      sent
                        ? `${player.name} (@${player.username}) is invited`
                        : `Invite ${player.name} (@${player.username})`
                    }
                    onClick={() => onInvite(player)}
                  >
                    {sent ? (
                      <>
                        <Check size={15} aria-hidden="true" />
                        Invited
                      </>
                    ) : (
                      'Invite'
                    )}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** People invited by username who have not answered yet. */
export function PendingInvites({
  invites,
  canCancel,
  busy,
  onCancel,
}: {
  invites: Room['pendingInvites'];
  canCancel: (username: string) => boolean;
  busy: string | null;
  onCancel: (invite: PlayerHit) => void;
}) {
  if (!invites.length) return null;
  return (
    <div className="pending-invites">
      <h4 className="eyebrow" id="pending-invites-title">
        Invited
      </h4>
      <ul className="friend-list" aria-labelledby="pending-invites-title">
        {invites.map((invite) => (
          <li className="friend-row" key={invite.username}>
            <Avatar name={invite.name} seed={invite.avatar} size="sm" />
            <span className="friend-copy">
              <strong>{invite.name}</strong>
              <span>@{invite.username}</span>
            </span>
            {canCancel(invite.username) ? (
              <Button
                size="sm"
                variant="ghost"
                disabled={busy !== null}
                pending={busy === invite.username}
                aria-label={`Cancel invitation to ${invite.name}`}
                onClick={() => onCancel(invite)}
              >
                <X size={15} aria-hidden="true" />
                Cancel
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Find a friend by username, invite them, and see who has not answered yet. */
export function InviteByUsername({
  room,
  host,
  ownUsername,
}: {
  room: Room;
  host: boolean;
  ownUsername: string | null;
}) {
  const id = useId();
  const cache = useQueryClient();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [sent, rememberSent] = useSentInvites(room.id);
  const term = typedUsername(text);
  const settled = useDebounced(term, DEBOUNCE_MS);
  const search = useQuery({
    queryKey: ['player-search', settled],
    queryFn: () => api.searchPlayers(settled),
    enabled: settled.length >= 2,
    staleTime: 30000,
    retry: false,
    placeholderData: keepPreviousData,
  });
  const waiting = term !== settled || search.isFetching;
  async function change(operation: () => Promise<Room>, username: string, done: string) {
    setBusy(username);
    setError('');
    setNotice('');
    try {
      const snapshot = await operation();
      cache.setQueryData<Room>(keys.room(room.id), (current) =>
        acceptRoomSnapshot(current, snapshot),
      );
      setNotice(done);
      return true;
    } catch (failure) {
      setError(
        problem(
          failure,
          'That’s a lot of invitations. Wait a minute, then try again.',
          'That didn’t go through. Please try again.',
        ),
      );
      return false;
    } finally {
      setBusy(null);
    }
  }
  return (
    <div className="friend-invite">
      <label className="field" htmlFor={`${id}-search`}>
        Find a friend by username
      </label>
      <div className="username-input friend-search-input">
        <Search size={16} aria-hidden="true" />
        <input
          id={`${id}-search`}
          className="input"
          type="search"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setError('');
          }}
          placeholder="username"
          maxLength={21}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
        />
      </div>
      <FriendSearchResults
        term={term}
        searching={waiting}
        failed={
          search.isError && !waiting
            ? problem(
                search.error,
                'That’s a lot of searches. Wait a minute, then try again.',
                'Search isn’t working right now. Try again in a moment.',
              )
            : ''
        }
        // Earlier matches stay in place, dimmed, until the new ones arrive.
        players={search.data}
        invited={room.pendingInvites.map((invite) => invite.username)}
        ownUsername={ownUsername}
        busy={busy}
        onInvite={(player) =>
          void change(
            () => api.invite(room.id, player.username),
            player.username,
            `Invitation sent to ${player.name}.`,
          ).then((ok) => {
            if (ok) rememberSent(player.username);
          })
        }
      />
      <PendingInvites
        invites={room.pendingInvites}
        canCancel={(username) => host || sent.includes(username)}
        busy={busy}
        onCancel={(invite) =>
          void change(
            () => api.cancelInvite(room.id, invite.username),
            invite.username,
            `Invitation to ${invite.name} cancelled.`,
          )
        }
      />
      <p className="small invite-status" role="status">
        {notice}
      </p>
      {error ? (
        <p className="error-note" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
