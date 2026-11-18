'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, ChevronDown, Clock3, Link2, Sparkles, UsersRound } from 'lucide-react';
import { Button } from '@games/ui';
import type { Game } from '@games/api-client/catalog';
import { SiteHeader } from '@/shared/SiteHeader';
import { GameArt } from '@/shared/GameArt';
import { RoomDialog } from '@/shared/RoomDialog';
import { useQuickPlay } from './useQuickPlay';

export function GameEntry({
  game,
  preferredMode = 'friends',
}: {
  game: Game;
  preferredMode?: 'friends' | 'bots';
}) {
  const [dialog, setDialog] = useState<'create' | 'join' | null>(null);
  const launch = useQuickPlay(game.id);
  const solo = game.playMode === 'solo';
  const quickPlay = solo || game.botsSupported;
  const start = quickPlay ? (
    <Button
      size="lg"
      variant={solo || preferredMode === 'bots' ? 'primary' : 'secondary'}
      pending={launch.pending}
      onClick={() => void launch.start()}
      aria-describedby={launch.failure ? 'game-start-error' : undefined}
    >
      {!launch.pending ? solo ? <Sparkles size={18} /> : <Bot size={18} /> : null}
      {launch.label}
      {!launch.pending ? <ArrowRight size={18} /> : null}
    </Button>
  ) : null;
  const friends = !solo ? (
    <Button
      size="lg"
      variant={preferredMode === 'bots' && game.botsSupported ? 'secondary' : 'primary'}
      disabled={launch.pending}
      onClick={() => setDialog('create')}
    >
      <UsersRound size={18} />
      Play with friends
      <ArrowRight size={18} />
    </Button>
  ) : null;

  return (
    <>
      <SiteHeader />
      <main className="page-width game-entry" data-game={game.id}>
        <section className="game-entry-main" aria-labelledby="game-entry-title">
          <div className="game-entry-art game-poster" data-tone={game.color}>
            <GameArt game={game} />
          </div>
          <div className="game-entry-content">
            <h1 id="game-entry-title">{game.name}</h1>
            <p className="game-entry-description">
              {solo ? 'Choose three cards for a fresh perspective.' : game.subtitle}
            </p>
            {solo ? (
              <p className="game-entry-detail">Add a question or astrology after you draw.</p>
            ) : (
              <p className="game-entry-meta">
                <span>
                  <UsersRound size={15} aria-hidden="true" />
                  {game.minPlayers === game.maxPlayers
                    ? `${game.minPlayers} players`
                    : `${game.minPlayers}–${game.maxPlayers} players`}
                </span>
                <span>
                  <Clock3 size={15} aria-hidden="true" /> {game.minutes} min
                </span>
              </p>
            )}
            <div className="game-entry-actions">
              {solo || preferredMode === 'bots' ? (
                <>
                  {start}
                  {friends}
                </>
              ) : (
                <>
                  {friends}
                  {start}
                </>
              )}
            </div>
            {launch.failure ? (
              <p id="game-start-error" className="error-note" role="alert">
                {launch.failure.message}
              </p>
            ) : null}
            <div className="game-entry-secondary">
              {solo ? (
                <Link href="/profile">Past readings</Link>
              ) : (
                <Button variant="ghost" disabled={launch.pending} onClick={() => setDialog('join')}>
                  <Link2 size={16} /> Join a room
                </Button>
              )}
            </div>
          </div>
        </section>
        <details className="game-entry-rules">
          <summary>
            {solo ? 'How your reading works' : 'How to play'}
            <ChevronDown size={18} aria-hidden="true" />
          </summary>
          <ol>
            {game.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>
        </details>
      </main>
      {dialog ? (
        <RoomDialog
          open
          mode={dialog}
          gameId={game.id}
          fixedGame
          friendsOnly
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
        />
      ) : null}
    </>
  );
}
