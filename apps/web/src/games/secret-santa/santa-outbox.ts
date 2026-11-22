'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import type { Action, Match } from '@games/api-client';
import { buildAction, type SantaIntent } from './santa-actions';

/** How long a sent move may go unacknowledged before the next one is tried. */
const START_TIMEOUT_MS = 2500;

type Table = {
  match: Match;
  version: number | null;
  pending: boolean;
  paused: boolean;
  onAction: (action: Action) => void;
};
type Problem = { count: number; message: string };
type Snapshot = { waiting: readonly SantaIntent[]; problem: Problem; settling: boolean };

/**
 * The room sends one move at a time and drops a second one sent while the first
 * is saving. Organising is many quick edits (a pasted list of names, a title and
 * then a date), so intents wait here and go out in order, each built against the
 * actions the server offers when its turn comes.
 *
 * A person opening their link moves the saved table on without the organiser's
 * page knowing yet, and the organiser's next move is then refused as out of
 * date. So a refused move waits for the refreshed table: if the table did move
 * on, the move is sent once more against it. If nothing changed, the move itself
 * was refused, and the queue is emptied: later edits were made on top of a
 * change that did not happen.
 */
export function createSantaOutbox(startTimeout = START_TIMEOUT_MS) {
  let queue: SantaIntent[] = [];
  let problem: Problem = { count: 0, message: '' };
  let flight: {
    intent: SantaIntent;
    version: number | null;
    sawPending: boolean;
    retried: boolean;
    timer: ReturnType<typeof setTimeout>;
  } | null = null;
  // A refused move, kept until the refreshed table shows whether it was only out of date.
  let refused: {
    intent: SantaIntent;
    version: number | null;
    timer: ReturnType<typeof setTimeout>;
  } | null = null;
  let snapshot: Snapshot = { waiting: queue, problem, settling: false };
  const listeners = new Set<() => void>();
  const emit = () => {
    snapshot = { waiting: queue, problem, settling: Boolean(flight || refused) };
    for (const listener of listeners) listener();
  };
  const fail = (message: string) => {
    queue = [];
    problem = { count: problem.count + 1, message };
  };
  const NOT_SAVED = 'That change wasn’t saved. Check the page and try again.';
  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => snapshot,
    /** Queue what the organiser asked for; it is sent when its turn comes. */
    send(...intents: SantaIntent[]) {
      if (!intents.length) return;
      queue = [...queue, ...intents];
      emit();
    },
    /** Called with every view of the table: settle the move in flight, then send the next. */
    pump({ match, version, pending, paused, onAction }: Table) {
      if (flight) {
        if (version !== flight.version) {
          // The table moved on: the move was saved.
          clearTimeout(flight.timer);
          flight = null;
          if (!queue.length) emit();
        } else if (pending) {
          flight.sawPending = true;
          return;
        } else if (flight.sawPending) {
          // Saving ended on the same version: the server refused it.
          clearTimeout(flight.timer);
          const { intent, retried } = flight;
          flight = null;
          if (retried) {
            fail(NOT_SAVED);
            emit();
            return;
          }
          refused = {
            intent,
            version,
            timer: setTimeout(() => {
              // The refreshed table is the same one: the move itself was refused.
              refused = null;
              fail(NOT_SAVED);
              emit();
            }, startTimeout),
          };
          emit();
          return;
        } else return;
      }
      let retry: SantaIntent | null = null;
      if (refused) {
        if (version === refused.version) return;
        // The table had moved on under the organiser: send the same move once more.
        clearTimeout(refused.timer);
        retry = refused.intent;
        refused = null;
      }
      if (pending || paused) {
        if (retry) queue = [retry, ...queue];
        return;
      }
      if (!retry && !queue.length) return;
      const next = retry ?? queue[0];
      if (!retry) queue = queue.slice(1);
      const action = buildAction(match, next);
      if (!action) {
        fail('That isn’t available right now.');
        emit();
        return;
      }
      flight = {
        intent: next,
        version,
        sawPending: false,
        retried: Boolean(retry),
        // A move the room dropped (for example while reconnecting) must not block the rest.
        timer: setTimeout(() => {
          flight = null;
          emit();
        }, startTimeout),
      };
      emit();
      onAction(action);
    },
    dispose() {
      if (flight) clearTimeout(flight.timer);
      if (refused) clearTimeout(refused.timer);
      flight = null;
      refused = null;
    },
  };
}

export function useSantaOutbox(table: Table) {
  const [outbox] = useState(() => createSantaOutbox());
  const state = useSyncExternalStore(outbox.subscribe, outbox.getSnapshot, outbox.getSnapshot);
  useEffect(() => {
    outbox.pump(table);
  });
  useEffect(() => () => outbox.dispose(), [outbox]);
  return {
    send: outbox.send,
    /** Moves still waiting behind the one being saved. */
    waiting: state.waiting,
    /** Counts refused or unavailable moves, so the table can undo optimistic steps. */
    problem: state.problem,
    /** A move is on its way or being checked against the refreshed table. */
    settling: state.settling,
  };
}
