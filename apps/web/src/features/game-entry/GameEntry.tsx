'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Bot,
  GraduationCap,
  Clock3,
  Gift,
  Link2,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import { Button, Modal } from '@games/ui';
import type { Game } from '@games/api-client/catalog';
import { SiteHeader } from '@/shared/SiteHeader';
import { GameArt } from '@/shared/GameArt';
import { RoomDialog } from '@/shared/RoomDialog';
import { GameRulebook } from '@/shared/tutorial/RulesIllustrations';
import { useQuickPlay } from './useQuickPlay';

export function GameEntry({
  game,
  preferredMode = 'friends',
}: {
  game: Game;
  preferredMode?: 'friends' | 'bots';
}) {
  const [dialog, setDialog] = useState<'create' | 'join' | 'bots' | null>(null);
  const [chosenBotCount, setChosenBotCount] = useState<number | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const learningActions = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const actions = learningActions.current;
    if (rulesOpen && actions && window.innerHeight - actions.getBoundingClientRect().bottom < 160) {
      actions.scrollIntoView({ block: 'start' });
    }
  }, [rulesOpen]);
  const launch = useQuickPlay(game.id);
  const solo = game.playMode === 'solo';
  const reading = game.id === 'tarot';
  const organising = game.family === 'organiser';
  const quickPlay = solo || game.botsSupported;
  const withBots = !solo && game.botsSupported;
  const minimumBots = Math.max(1, game.minPlayers - 1);
  const maximumBots = game.maxPlayers - 1;
  const chooseBots = withBots && minimumBots < maximumBots;
  const botCount = chosenBotCount ?? launch.resumeBotCount ?? minimumBots;
  const playFailure =
    launch.failure?.mode === 'play' && (!withBots || launch.failure.botCount === botCount)
      ? launch.failure
      : null;
  const playLabel = launch.label('play', withBots ? botCount : undefined);
  const fixedBotLabel = `Play with ${minimumBots} ${minimumBots === 1 ? 'bot' : 'bots'}`;
  const start = quickPlay ? (
    <Button
      size="lg"
      variant={solo || preferredMode === 'bots' ? 'primary' : 'secondary'}
      pending={launch.pending === 'play'}
      disabled={launch.pending !== null}
      onClick={() => {
        if (chooseBots) {
          setChosenBotCount(botCount);
          setDialog('bots');
        } else {
          void launch.start('play', withBots ? minimumBots : undefined);
        }
      }}
      aria-haspopup={chooseBots ? 'dialog' : undefined}
      aria-describedby={playFailure && dialog !== 'bots' ? 'game-start-error' : undefined}
    >
      {launch.pending !== 'play' ? (
        reading ? (
          <Sparkles size={18} />
        ) : organising ? (
          <Gift size={18} />
        ) : solo ? null : (
          <Bot size={18} />
        )
      ) : null}
      {chooseBots && launch.pending !== 'play'
        ? 'Play with bots'
        : withBots && !playFailure && launch.pending !== 'play'
          ? fixedBotLabel
          : playLabel}
      {launch.pending !== 'play' ? <ArrowRight size={18} /> : null}
    </Button>
  ) : null;
  const friends = !solo ? (
    <Button
      size="lg"
      variant={preferredMode === 'bots' && game.botsSupported ? 'secondary' : 'primary'}
      disabled={launch.pending !== null}
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
              {reading ? 'Choose three cards for a fresh perspective.' : game.subtitle}
            </p>
            {reading ? (
              <p className="game-entry-detail">Add a question or astrology after you draw.</p>
            ) : organising ? (
              <p className="game-entry-detail">
                Add names, say who can’t draw whom, then send each person a private link. Only you
                need to be here: nobody else needs an account.
              </p>
            ) : (
              <p className="game-entry-meta">
                <span>
                  <UsersRound size={15} aria-hidden="true" />
                  {game.minPlayers === game.maxPlayers
                    ? game.maxPlayers === 1
                      ? '1 player'
                      : `${game.minPlayers} players`
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
            {playFailure && dialog !== 'bots' ? (
              <p id="game-start-error" className="error-note" role="alert">
                {playFailure.message}
              </p>
            ) : null}
            <div className="game-entry-secondary" ref={learningActions}>
              <Button
                variant="ghost"
                aria-expanded={rulesOpen}
                aria-controls="game-entry-rulebook"
                onClick={() => setRulesOpen((open) => !open)}
              >
                <BookOpen size={17} aria-hidden="true" />
                {quickPlay ? 'Rules & tutorial' : 'Rules'}
              </Button>
              {solo ? (
                <Link href="/profile">{reading ? 'Past readings' : 'Past games'}</Link>
              ) : (
                <Button
                  variant="ghost"
                  disabled={launch.pending !== null}
                  onClick={() => setDialog('join')}
                >
                  <Link2 size={16} /> Join a room
                </Button>
              )}
            </div>
          </div>
        </section>
        <div className="game-entry-rules" id="game-entry-rulebook" hidden={!rulesOpen}>
          <GameRulebook
            game={game}
            tutorialControl={
              quickPlay && (
                <>
                  <Button
                    variant="secondary"
                    pending={launch.pending === 'tutorial'}
                    disabled={launch.pending !== null}
                    onClick={() => void launch.start('tutorial')}
                    aria-describedby={
                      launch.failure?.mode === 'tutorial' ? 'tutorial-start-error' : undefined
                    }
                  >
                    {launch.pending !== 'tutorial' && (
                      <GraduationCap size={18} aria-hidden="true" />
                    )}
                    {launch.label('tutorial')}
                  </Button>
                  {launch.failure?.mode === 'tutorial' && (
                    <p id="tutorial-start-error" className="error-note" role="alert">
                      {launch.failure.message}
                    </p>
                  )}
                </>
              )
            }
          />
        </div>
      </main>
      {dialog === 'bots' ? (
        <Modal
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          title="Play with bots"
          description={`${game.name} · Hard difficulty`}
        >
          <form
            className="room-setup-form room-setup-form--simple"
            onSubmit={(event) => {
              event.preventDefault();
              void launch.start('play', botCount);
            }}
          >
            <label className="field">
              Number of bots
              <select
                className="input"
                value={botCount}
                disabled={launch.pending !== null}
                onChange={(event) => setChosenBotCount(Number(event.target.value))}
              >
                {Array.from({ length: maximumBots - minimumBots + 1 }, (_, i) => {
                  const count = minimumBots + i;
                  return (
                    <option key={count} value={count}>
                      {count} {count === 1 ? 'bot' : 'bots'}
                    </option>
                  );
                })}
              </select>
            </label>
            {playFailure ? (
              <p id="bot-start-error" className="error-note" role="alert">
                {playFailure.message}
              </p>
            ) : null}
            <div className="form-footer">
              <Button
                type="submit"
                pending={launch.pending === 'play'}
                disabled={launch.pending !== null}
                aria-describedby={playFailure ? 'bot-start-error' : undefined}
              >
                {playFailure || launch.pending === 'play' ? playLabel : 'Start game'}
              </Button>
            </div>
          </form>
        </Modal>
      ) : dialog ? (
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
