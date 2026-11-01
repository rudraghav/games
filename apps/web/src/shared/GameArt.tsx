import {
  GemDistrictArt,
  WordTile,
  PlayingCard,
  TarotCard,
  MancalaPit,
  TokenArt,
  type CardPresentation,
} from '@games/ui';
import type { Game } from '@games/api-client/catalog';
import { optimizeCardArt } from './card-art';
import { ModernArtwork } from './ModernArtwork';
import { PartyArtwork } from './PartyArtwork';
import { ContemporaryArtwork } from './ContemporaryArtwork';
import { Flame } from 'lucide-react';

function card(
  value: string,
  color: string,
  suit = '',
  subtitle = '',
  face: Pick<CardPresentation, 'colors' | 'effect'> = {},
): CardPresentation {
  return {
    id: `${color}-${value}`,
    label: subtitle || value,
    value,
    color,
    suit,
    subtitle,
    ...face,
  };
}
export function GameArt({ game }: { game: Game }) {
  if (game.id === 'shithead')
    return (
      <div className="game-art game-art--palace" aria-hidden="true">
        <div className="palace-cover-row palace-cover-row--backs">
          {[0, 1, 2].map((i) => (
            <PlayingCard key={i} faceDown />
          ))}
        </div>
        <div className="palace-cover-row palace-cover-row--faces">
          {[card('2', 'ink', '♣'), card('10', 'red', '♦'), card('K', 'ink', '♠')].map((face) => (
            <PlayingCard key={face.id} card={face} />
          ))}
        </div>
        <Flame className="palace-cover-flame" />
      </div>
    );
  if (['the-gang', 'six-nimmt', 'sea-salt-paper', 'boop'].includes(game.id))
    return <ContemporaryArtwork gameId={game.id} />;
  if (['flip-7', 'trio', 'azul'].includes(game.id)) return <ModernArtwork gameId={game.id} />;
  if (game.family === 'party') return <PartyArtwork gameId={game.id} />;
  if (game.id === 'checkers')
    return (
      <div className="game-art game-art--checkers" aria-hidden="true">
        {Array.from({ length: 64 }, (_, i) => (
          <span key={i} data-dark={(Math.floor(i / 8) + (i % 8)) % 2 === 1}>
            {(Math.floor(i / 8) + (i % 8)) % 2 === 1 && (i < 24 || i >= 40) ? (
              <TokenArt kind={i < 24 ? 'ivory' : 'coral'} />
            ) : null}
          </span>
        ))}
      </div>
    );
  if (game.family === 'mancala')
    return (
      <div className="game-art game-art--mancala" aria-hidden="true">
        <MancalaPit count={12} label="Store" store />
        <div>
          {Array.from({ length: 6 }, (_, i) => (
            <MancalaPit key={i} count={4} label="Pit" />
          ))}
        </div>
        <MancalaPit count={8} label="Store" store />
      </div>
    );
  if (game.family === 'board')
    return (
      <div className="game-art game-art--board" data-board={game.id} aria-hidden="true">
        {Array.from({ length: game.id === 'reversi' ? 64 : 42 }, (_, i) => {
          const piece =
            game.id === 'reversi'
              ? i === 27 || i === 36
                ? 'ivory'
                : i === 28 || i === 35
                  ? 'ink'
                  : null
              : i >= 28 && (i % 3 === 0 || i >= 35)
                ? i % 2
                  ? 'gold'
                  : 'coral'
                : null;
          return (
            <span key={i} data-disc={piece || 'empty'}>
              {piece ? <TokenArt kind={piece} /> : null}
            </span>
          );
        })}
      </div>
    );
  if (game.family === 'words')
    return (
      <div className="game-art game-art--words" aria-hidden="true">
        {['Orbit', 'Coffee', 'Beach', 'Anchor', 'Garden', 'Moon', 'Castle', 'Jazz', 'Key'].map(
          (word, i) => (
            <WordTile
              key={word}
              word={word}
              tone={i === 0 ? 'coral' : i === 5 ? 'blue' : 'unknown'}
            />
          ),
        )}
      </div>
    );
  if (game.family === 'gems')
    return (
      <div className="game-art game-art--gems" aria-hidden="true">
        <GemDistrictArt color="sapphire" tier={2} />
        <GemDistrictArt color="emerald" tier={3} />
      </div>
    );
  if (game.family === 'tarot')
    return (
      <div className="game-art game-art--tarot" aria-hidden="true">
        <TarotCard id="major-01" name="The Magician" imageLoader={optimizeCardArt} />
        <TarotCard id="major-02" name="The High Priestess" imageLoader={optimizeCardArt} />
        <TarotCard id="major-00" name="The Fool" imageLoader={optimizeCardArt} />
      </div>
    );
  if (game.family === 'grid')
    return (
      <div className="game-art game-art--grid" aria-hidden="true">
        {[-2, 3, 0, 5, 7, 0, 2, 1, 4, 0, 9, 6].map((value, index) => (
          <PlayingCard
            key={index}
            family="grid"
            card={card(String(value), ['blue', 'green', 'yellow', 'coral'][index % 4])}
          />
        ))}
      </div>
    );
  const cards =
    game.family === 'shedding'
      ? [
          card(game.id.includes('mercy') ? 'Discard all' : '7', 'red'),
          card(
            game.id.includes('mercy') ? '+10' : '+2',
            game.id.includes('mercy') ? 'wild' : 'yellow',
          ),
          card(game.id.includes('mercy') ? 'Skip everyone' : 'Reverse', 'blue'),
        ]
      : game.family === 'property'
        ? [
            card('4M', 'green', 'property', 'Green property', { colors: ['green'] }),
            card(
              game.id.includes('mercy') ? '2M' : '1M',
              'neutral',
              'action',
              game.id.includes('mercy') ? 'Yoink!' : 'Rent',
              game.id.includes('mercy')
                ? { effect: 'yoink' }
                : { effect: 'rent', colors: ['green', 'blue'] },
            ),
            card('4M', 'blue', 'property', 'Dark blue property', { colors: ['blue'] }),
          ]
        : game.id === 'rummy'
          ? [card('6', 'red', '♥'), card('7', 'red', '♥'), card('8', 'red', '♥')]
          : game.id === 'teen-patti'
            ? [card('A', 'ink', '♠'), card('A', 'red', '♥'), card('A', 'ink', '♣')]
            : [card('A', 'ink', '♠'), card('K', 'red', '♥')];
  const family =
    game.family === 'shedding' ? 'shedding' : game.family === 'property' ? 'property' : 'standard';
  return (
    <div
      className={`game-art${game.family === 'casino' ? ' game-art--casino' : ''}`}
      aria-hidden="true"
    >
      {cards.map((card, i) => (
        <PlayingCard key={i} card={card} family={family} />
      ))}
      {game.family === 'casino' ? (
        <span className="casino-cover-chips">
          <TokenArt kind="poker" />
          <TokenArt kind="poker" />
          <TokenArt kind="poker" />
        </span>
      ) : null}
    </div>
  );
}

export function HeroScene() {
  return (
    <div className="hero-scene" aria-hidden="true">
      <div className="scene-oval" />
      <div className="hero-card">
        <PlayingCard card={card('A', 'ink', '♠')} />
      </div>
      <div className="hero-card">
        <PlayingCard card={card('7', 'red')} family="shedding" />
      </div>
      <div className="hero-card">
        <PlayingCard card={card('K', 'red', '♥')} />
      </div>
      <div className="hero-card">
        <PlayingCard card={card('-2', 'blue')} family="grid" />
      </div>
      <span className="scene-star">✳</span>
      <span className="scene-chip" />
      <span className="scene-caption">Pull up a chair.</span>
    </div>
  );
}
