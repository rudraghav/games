'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Plus, UsersRound, Link2, Sparkles, Check } from 'lucide-react';
import { Button, Wordmark } from '@games/ui';
import { gameById } from '@games/api-client/catalog';
import { api } from '@/lib/session';
import { RoomDialog } from '@/shared/RoomDialog';
import { SiteHeader } from '@/shared/SiteHeader';
import { keys } from '@/shared/query-keys';
import { useHasPlayed } from '@/shared/player-preferences';
import { HeroScene } from '@/shared/GameArt';
import { GameLibrary } from './GameLibrary';

export function Lounge() {
  const [dialog, setDialog] = useState<{ mode: 'create' | 'join'; gameId: string } | null>(null);
  const played = useHasPlayed();
  const me = useQuery({ queryKey: keys.me, queryFn: () => api.me(), enabled: played });
  return (
    <>
      <SiteHeader>
        <Button size="sm" onClick={() => setDialog({ mode: 'create', gameId: 'uno' })}>
          <Plus size={16} />
          Create room
        </Button>
      </SiteHeader>
      <main className="page-width">
        <section className="hero">
          <div>
            <p className="eyebrow">A little space for your favourite people</p>
            <h1 className="hero-title">
              Good company.
              <br />
              <em>Great games.</em>
            </h1>
            <p className="hero-copy">
              Old favourites. New rivalries. Bring your people together for one more round.
            </p>
            <div className="hero-actions">
              <Button size="lg" onClick={() => setDialog({ mode: 'create', gameId: 'uno' })}>
                Start a game night
                <ArrowRight size={17} />
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => setDialog({ mode: 'join', gameId: 'uno' })}
              >
                Join a room
              </Button>
            </div>
            <p className="hero-footnote">
              <Check size={13} /> Free to play. No downloads. Just your people.
            </p>
          </div>
          <HeroScene />
        </section>
        {me.data?.rooms.length ? (
          <section aria-label="Your recent rooms">
            <div className="section-heading">
              <h2>Pick up where you left off.</h2>
            </div>
            <div className="recent-rooms">
              {me.data.rooms.slice(0, 3).map((room) => (
                <Link key={room.id} href={`/rooms/${room.id}`} className="recent-room">
                  <span className="eyebrow">{gameById(room.gameId).name}</span>
                  <strong>{room.name}</strong>
                  <span className="small muted">
                    {room.players} people ·{' '}
                    {room.status === 'playing' ? 'At the table' : 'Ready for another round'}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
        <GameLibrary onChoose={(gameId) => setDialog({ mode: 'create', gameId })} />
        <section className="home-bottom" id="how-it-works" aria-label="How it works">
          <article>
            <Sparkles size={20} />
            <h3>Find your game.</h3>
            <p>Pick a classic or try something new. Set the table your way.</p>
          </article>
          <article>
            <Link2 size={20} />
            <h3>Send the invite.</h3>
            <p>One link brings everyone together. Choose a name, grab a seat.</p>
          </article>
          <article>
            <UsersRound size={20} />
            <h3>Make a night of it.</h3>
            <p>A rematch, a new game, a familiar group. Stay for one more round.</p>
          </article>
        </section>
      </main>
      <footer className="site-footer page-width">
        <Wordmark />
        <span>Made for the way we play together.</span>
        <Link href="/privacy">Privacy</Link>
        <span>Free play. Real company.</span>
      </footer>
      {dialog ? (
        <RoomDialog
          key={`${dialog.mode}-${dialog.gameId}`}
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          mode={dialog.mode}
          gameId={dialog.gameId}
        />
      ) : null}
    </>
  );
}
