'use client';
import { useEffect, useMemo, useState, type RefObject, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { PlayingCard, TokenArt, HorizontalRail } from '@games/ui';
import type { Card } from '@games/api-client';
import { cardMotionKey, type CasinoTransition } from './casino-transitions';
import { useMediaQuery } from '@/shared/use-media-query';

export const CASINO_MOTION = { card: 0.28, chips: 0.42, number: 0.18, cue: 0.18 } as const;
const visible = { opacity: 1, y: 0, rotateY: 0 };
function CasinoCard({
  card,
  compact,
  group,
  index,
  event,
  winning,
}: {
  card: Card | null;
  compact: boolean;
  group: string;
  index: number;
  event: CasinoTransition | null;
  winning: boolean;
}) {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const enter = !reduced && Boolean(event?.newCards.includes(cardMotionKey(group, index, card)));
  const animation = useMemo(
    () => (enter ? { opacity: [0, 1], y: [8, 0], rotateY: [65, 0] } : visible),
    [enter],
  );
  return (
    <motion.div
      className="casino-card"
      data-card-enter={enter || undefined}
      data-winning={winning || undefined}
      initial={enter ? { opacity: 0, y: 8, rotateY: 65 } : false}
      animate={animation}
      layout="position"
      layoutId={card ? `card-${card.id}` : undefined}
      transition={{
        duration: enter ? CASINO_MOTION.card : 0,
        delay: enter ? Math.min(index, 3) * 0.045 : 0,
        ease: [0.2, 0.7, 0.2, 1],
        layout:
          event && !reduced ? { type: 'spring', stiffness: 380, damping: 34 } : { duration: 0 },
      }}
    >
      <PlayingCard card={card || undefined} faceDown={!card} compact={compact} />
    </motion.div>
  );
}

/** Card art stays in the shared frame; only permitted new faces receive motion. */
export function CasinoCardRow({
  cards,
  group,
  event,
  label,
  compact = false,
  className = '',
  hand = false,
  highlight,
}: {
  cards: (Card | null)[];
  group: string;
  event: CasinoTransition | null;
  label: string;
  compact?: boolean;
  className?: string;
  hand?: boolean;
  /** Public cards that made a winning hand. */
  highlight?: ReadonlySet<string>;
}) {
  const contents = cards.map((card, index) => (
    <CasinoCard
      key={card?.id || `hidden-${index}`}
      card={card}
      compact={compact}
      group={group}
      index={index}
      event={event}
      winning={Boolean(card && highlight?.has(card.id))}
    />
  ));
  return hand ? (
    <HorizontalRail
      className={`hand-rail casino-hand-rail ${className}`}
      viewportClassName={`hand-scroll casino-hand-scroll ${compact ? 'hand-scroll--compact' : ''}`}
      contentClassName="card-hand casino-card-row"
      label={label}
    >
      {contents}
    </HorizontalRail>
  ) : (
    <div className={className} role="group" aria-label={label}>
      <div className="casino-card-row">{contents}</div>
    </div>
  );
}

type Point = { x: number; y: number };
type Flight = { key: string; from: Point; to: Point; delay: number; direction: 'bet' | 'payout' };
export function CasinoChipFlights({
  event,
  canvas,
  pot,
  seats,
}: {
  event: CasinoTransition | null;
  canvas: RefObject<HTMLDivElement | null>;
  pot: RefObject<HTMLDivElement | null>;
  seats: RefObject<Record<string, HTMLDivElement | null>>;
}) {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [flights, setFlights] = useState<Flight[]>([]);
  useEffect(() => {
    if (!event || reduced || !event.transfers.length) return;
    const frame = window.requestAnimationFrame(() => {
      const surface = canvas.current?.getBoundingClientRect();
      const potBox = pot.current?.getBoundingClientRect();
      if (!surface || !potBox) return;
      const center = {
        x: potBox.left + potBox.width / 2 - surface.left,
        y: potBox.top + potBox.height / 2 - surface.top,
      };
      const next: Flight[] = [];
      for (const transfer of event.transfers) {
        const box = seats.current[transfer.playerId]?.getBoundingClientRect();
        if (!box) continue;
        const seat = {
          x: box.left + box.width / 2 - surface.left,
          y: box.top + box.height / 2 - surface.top,
        };
        const direction = transfer.direction;
        for (let index = 0; index < 3; index++)
          next.push({
            key: `${event.key}:${transfer.playerId}:${direction}:${index}`,
            from: direction === 'bet' ? seat : center,
            to: direction === 'bet' ? center : seat,
            direction,
            delay:
              index * 0.035 +
              (direction === 'payout' && event.transfers.some((t) => t.direction === 'bet')
                ? 0.16
                : 0),
          });
      }
      setFlights(next);
    });
    const timeout = window.setTimeout(() => setFlights([]), 700);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [event, reduced, canvas, pot, seats]);
  if (!event || reduced) return null;
  return (
    <div className="casino-motion-layer" aria-hidden="true" data-event-version={event.key}>
      {flights
        .filter((flight) => flight.key.startsWith(`${event.key}:`))
        .map((flight, index) => (
          <motion.span
            className="casino-flying-chip"
            key={flight.key}
            data-flight={flight.direction}
            initial={{ x: flight.from.x - 9, y: flight.from.y - 9, opacity: 0, scale: 0.7 }}
            animate={{
              x: [
                flight.from.x - 9,
                (flight.from.x + flight.to.x) / 2 + ((index % 3) - 1) * 7,
                flight.to.x - 9,
              ],
              y: [flight.from.y - 9, (flight.from.y + flight.to.y) / 2 - 16, flight.to.y - 9],
              opacity: [0, 1, 1, 0],
              scale: [0.7, 1, 0.7],
            }}
            transition={{
              duration: CASINO_MOTION.chips,
              delay: flight.delay,
              ease: [0.22, 0.6, 0.25, 1],
              opacity: {
                duration: CASINO_MOTION.chips,
                delay: flight.delay,
                times: [0, 0.12, 0.83, 1],
              },
            }}
          >
            <TokenArt kind="poker" />
          </motion.span>
        ))}
    </div>
  );
}

/** The felt's latest move. A long name may shorten; the move and its chips never do. */
export function CasinoActionCue({
  actor = null,
  label,
  cueKey,
  event,
  children,
}: {
  actor?: string | null;
  label: string;
  cueKey: string;
  event: CasinoTransition | null;
  children?: ReactNode;
}) {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  return (
    <div className="casino-last-action" role="status" aria-live="polite" aria-atomic="true">
      <motion.span
        key={cueKey}
        initial={event && !reduced ? { opacity: 0, y: 3 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: event && !reduced ? CASINO_MOTION.cue : 0 }}
      >
        {actor ? <span className="casino-cue-actor">{actor}</span> : null}
        {actor && label ? ' ' : null}
        {label ? <span className="casino-cue-move">{label}</span> : null}
        {children}
      </motion.span>
    </div>
  );
}
