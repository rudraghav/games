'use client';
import { useEffect, useRef, useState } from 'react';
import type { Action, Match, Room } from '@games/api-client';

const same = (a: Action, b: Action) =>
  a.type === b.type &&
  (a.amount ?? null) === (b.amount ?? null) &&
  (a.card ?? null) === (b.card ?? null) &&
  (a.choice ?? null) === (b.choice ?? null);

/**
 * Simultaneous decisions: when another seat commits first, the server rejects a
 * move made against the older version even though it is still legal. Keep the
 * viewer's committed intent, and when the table refreshes without that move
 * applied, send the same server-offered action once more. The server still
 * validates it against the new state; nothing is decided here.
 */
export function useRetriedMove({
  match,
  room,
  selfId,
  pending,
  onAction,
  onCommitted,
}: {
  match: Match;
  room: Room;
  selfId: string;
  pending: boolean;
  onAction: (action: Action) => void;
  /** Called once the server has recorded the viewer's move. */
  onCommitted?: () => void;
}) {
  const [attempt, setAttempt] = useState<{
    action: Action;
    version: number;
    at: number;
    retried: boolean;
  } | null>(null);
  const send = useRef(onAction);
  const committedCallback = useRef(onCommitted);
  useEffect(() => {
    send.current = onAction;
    committedCallback.current = onCommitted;
  }, [onAction, onCommitted]);
  const version = room.matchVersion ?? 0;
  useEffect(() => {
    if (!attempt || pending || version === attempt.version) return;
    const committed = room.activity.some(
      (event) =>
        event.actorId === selfId &&
        event.version > attempt.version &&
        event.type === attempt.action.type,
    );
    const offered = match.actions.find((option) => same(option.value, attempt.action));
    if (committed || !offered || attempt.retried || Date.now() - attempt.at > 8000) {
      const clear = window.setTimeout(() => {
        setAttempt(null);
        if (committed) committedCallback.current?.();
      }, 0);
      return () => window.clearTimeout(clear);
    }
    // Let the room drop its stale-version notice first, then resubmit once.
    const timer = window.setTimeout(() => {
      setAttempt({ ...attempt, version, retried: true });
      send.current(offered.value);
    }, 60);
    return () => window.clearTimeout(timer);
  }, [attempt, pending, version, match.actions, room.activity, selfId]);
  return {
    submit(action: Action) {
      setAttempt({ action, version, at: Date.now(), retried: false });
      onAction(action);
    },
    retrying: Boolean(attempt?.retried && pending),
  };
}
