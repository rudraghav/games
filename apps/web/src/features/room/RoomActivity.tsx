'use client';
import { useLayoutEffect, useRef, useState } from 'react';
import { ArrowDown, ChevronDown, History } from 'lucide-react';
import { PlayingCard, Button } from '@games/ui';
import type { Room } from '@games/api-client';
import { gameById } from '@games/api-client/catalog';

export function RoomActivity({ room }: { room: Room }) {
  const latest = useRef<HTMLLIElement>(null);
  const scroller = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const element = scroller.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, []);
  const [seenThrough, setSeenThrough] = useState(room.activity.at(-1)?.version || 0);
  const family = gameById(room.gameId).family;
  const cardFamily =
    family === 'property'
      ? 'property'
      : family === 'shedding'
        ? 'shedding'
        : family === 'grid'
          ? 'grid'
          : 'standard';
  const cardFrames = [
    'property',
    'shedding',
    'grid',
    'casino',
    'rummy',
    'palace',
    'cooperative-poker',
  ].includes(family);
  const name = (id: string) => room.members.find((member) => member.id === id)?.name || 'Player';
  const unread = room.activity.filter((event) => event.version > seenThrough).length;
  return (
    <section ref={scroller} className="room-activity" aria-label="Game activity">
      <header>
        <History size={17} />
        <h2>Game activity</h2>
      </header>
      {room.activity.length === 80 ? <p className="small muted">Latest 80 moves</p> : null}
      {unread ? (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            latest.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
            setSeenThrough(room.activity.at(-1)?.version || 0);
          }}
        >
          <ArrowDown size={14} />
          {unread} new move{unread === 1 ? '' : 's'}
        </Button>
      ) : null}
      {!room.activity.length ? (
        <p className="activity-empty">Moves appear here as you play.</p>
      ) : (
        <ol className="activity-list" aria-label="Committed moves">
          {room.activity.map((event, index) => (
            <li key={event.version} ref={index === room.activity.length - 1 ? latest : undefined}>
              <span className="activity-version" aria-label={`Move ${event.version - 1}`}>
                {event.version - 1}
              </span>
              <div>
                <p>
                  <strong>{name(event.actorId)}</strong> <span>{event.label}</span>
                </p>
                {event.targets.length ? (
                  <p className="activity-targets">To {event.targets.map(name).join(', ')}</p>
                ) : null}
                {event.amount !== null ? (
                  <p className="activity-amount">
                    {event.amount}
                    {family === 'property' ? 'M' : ' chips'}
                  </p>
                ) : null}
                {event.destination ? (
                  <p className="activity-destination">{event.destination}</p>
                ) : null}
                {event.cards.length ? (
                  <p className="activity-card-names">
                    {event.cards
                      .slice(0, 3)
                      .map((card) => card.label)
                      .join(', ')}
                    {event.cards.length > 3 ? ` +${event.cards.length - 3}` : ''}
                  </p>
                ) : null}
                {event.cards.length ? (
                  <details className="activity-cards">
                    <summary>
                      View {event.cards.length === 1 ? 'card' : `${event.cards.length} cards`}
                      <ChevronDown size={13} />
                    </summary>
                    <div>
                      {event.cards.map((card) =>
                        cardFrames ? (
                          <PlayingCard key={card.id} card={card} family={cardFamily} compact />
                        ) : (
                          <span className="activity-piece" key={card.id} data-color={card.color}>
                            <strong>{card.value || card.label}</strong>
                            <span>{card.label}</span>
                          </span>
                        ),
                      )}
                    </div>
                  </details>
                ) : null}
                {event.count !== null && event.count > event.cards.length ? (
                  <p className="activity-count">
                    {event.count} card{event.count === 1 ? '' : 's'}
                    {event.cards.length ? ' involved' : ''}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
