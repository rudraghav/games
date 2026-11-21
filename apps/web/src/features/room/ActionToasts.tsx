'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import { PlayingCard } from '@games/ui';
import type { Room } from '@games/api-client';
import { gameById } from '@games/api-client/catalog';
import { describeMove } from './move-description';

type PublicMove = Room['activity'][number];
type Toast = {
  version: number;
  text: string;
  forYou: boolean;
  card: PublicMove['cards'][number] | null;
};

const VISIBLE = 3;
const READ_MS = 5200;
const READ_FOR_YOU_MS = 8000;
/** Moves that change what other seats can do; routine draws, banks and passes stay quiet. */
const NOTABLE = new Set([
  'no',
  'accept',
  'challenge',
  'catch_uno',
  'uno',
  'declare',
  'fold',
  'raise',
  'all_in',
  'show',
  'sideshow',
  'decline',
  'split',
  'double',
  'steal',
  'stop',
  'last_chance',
  'reveal_mermaids',
  'pair',
  'take_row',
  'graduate',
  'patron',
  'buy',
  'stay',
  'target_effect',
  'pickup',
  'clue',
  'pay',
  'spin',
]);
const CARD_FAMILIES: Record<string, 'property' | 'shedding' | 'grid' | 'standard'> = {
  property: 'property',
  shedding: 'shedding',
  grid: 'grid',
  casino: 'standard',
  rummy: 'standard',
  palace: 'standard',
  'cooperative-poker': 'standard',
};

/** Whether a committed public move earns a notification, and whether it is aimed at the viewer. */
export function notable(move: PublicMove, family: string, selfId: string) {
  const forYou = move.actorId !== selfId && move.targets.includes(selfId);
  const show =
    forYou ||
    move.targets.length > 0 ||
    NOTABLE.has(move.type) ||
    (family === 'property' && move.type === 'play') ||
    /burned|took the pile/i.test(move.label);
  return show ? { forYou } : null;
}

/**
 * Small cards in the bottom-right corner for the latest notable public moves. They only
 * repeat room history (never private state), show at most three, and leave by themselves;
 * the turn banner's "Last move" line remains the announced, persistent record.
 */
export function ActionToasts({ room, selfId }: { room: Room; selfId: string }) {
  const reduced = useReducedMotion();
  const family = gameById(room.gameId).family;
  const [toasts, setToasts] = useState<Toast[]>([]);
  const latest = room.activity.at(-1)?.version ?? 0;
  // Start from the moves already on the table: a reload never replays old notifications.
  const seen = useRef({ match: room.matchId, version: latest });
  const held = useRef(false);
  useEffect(() => {
    if (seen.current.match !== room.matchId) {
      seen.current = { match: room.matchId, version: latest };
      setToasts([]);
      return;
    }
    const fresh = room.activity.filter((move) => move.version > seen.current.version);
    if (!fresh.length) return;
    seen.current.version = latest;
    const next = fresh.flatMap((move) => {
      const result = notable(move, family, selfId);
      return result
        ? [
            {
              version: move.version,
              text: describeMove(room, move, selfId),
              forYou: result.forYou,
              card: CARD_FAMILIES[family] ? (move.cards[0] ?? null) : null,
            },
          ]
        : [];
    });
    if (next.length) setToasts((current) => [...current, ...next].slice(-VISIBLE));
  }, [room, latest, family, selfId]);
  const oldest = toasts[0];
  useEffect(() => {
    if (!oldest) return;
    const timer = window.setInterval(
      () => {
        if (!held.current)
          setToasts((current) => current.filter((toast) => toast.version !== oldest.version));
      },
      oldest.forYou ? READ_FOR_YOU_MS : READ_MS,
    );
    return () => window.clearInterval(timer);
  }, [oldest]);
  return (
    <div
      className="action-toasts"
      role="region"
      aria-label="Recent actions"
      onPointerEnter={() => (held.current = true)}
      onPointerLeave={() => (held.current = false)}
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.version}
            layout={!reduced}
            className="action-toast"
            data-for-you={toast.forYou || undefined}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: 24 }}
            transition={{ duration: reduced ? 0 : 0.22 }}
          >
            {toast.card ? (
              <span
                className="action-toast-card"
                data-family={CARD_FAMILIES[family]}
                aria-hidden="true"
              >
                <PlayingCard card={toast.card} family={CARD_FAMILIES[family]} compact />
              </span>
            ) : null}
            <p>
              {toast.forYou ? <strong>Aimed at you</strong> : null}
              <span>{toast.text}</span>
            </p>
            <button
              type="button"
              aria-label="Dismiss this notification"
              onClick={() =>
                setToasts((current) => current.filter((item) => item.version !== toast.version))
              }
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
