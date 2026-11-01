import {
  DevelopmentCard,
  WordTile,
  PlayingCard,
  TarotCard,
  MancalaPit,
  type CardPresentation,
} from '@games/ui';
import type { Game } from '@games/api-client/catalog';
import { optimizeCardArt } from './card-art';

function card(value: string, color: string, suit = '', subtitle = ''): CardPresentation {
  return { id: `${color}-${value}`, label: value, value, color, suit, subtitle };
}
export function GameArt({ game }: { game: Game }) {
  if (game.id === 'checkers')
    return (
      <div className="game-art game-art--checkers" aria-hidden="true">
        {Array.from({ length: 36 }, (_, i) => (
          <span key={i} data-dark={(Math.floor(i / 6) + (i % 6)) % 2 === 1}>
            <span
              className="board-disc"
              data-color={
                (Math.floor(i / 6) + (i % 6)) % 2 === 1 && (i < 12 || i >= 24)
                  ? i < 12
                    ? 'ivory'
                    : 'coral'
                  : 'empty'
              }
            />
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
      <div className="game-art game-art--board" aria-hidden="true">
        {Array.from({ length: 35 }, (_, i) => (
          <span
            key={i}
            data-disc={
              i > 13 && (i % 3 === 0 || i > 27)
                ? game.id === 'reversi'
                  ? i % 2
                    ? 'ivory'
                    : 'ink'
                  : i % 2
                    ? 'gold'
                    : 'coral'
                : 'empty'
            }
          />
        ))}
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
        <DevelopmentCard
          name="Sapphire Guild"
          bonus="sapphire"
          points={2}
          cost={{ ruby: 2, emerald: 3 }}
        />
        <DevelopmentCard
          name="Emerald Palace"
          bonus="emerald"
          points={4}
          cost={{ sapphire: 3, onyx: 5 }}
        />
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
          card('7', 'red'),
          card(
            game.id.includes('mercy') ? '+10' : '2',
            game.id.includes('mercy') ? 'wild' : 'yellow',
          ),
          card('↻', 'blue'),
        ]
      : game.family === 'property'
        ? [
            card('4M', 'green', 'property', 'Garden district'),
            card(
              game.id.includes('mercy') ? '2M' : '3M',
              'neutral',
              'action',
              game.id.includes('mercy') ? 'Yoink!' : 'Rent',
            ),
            card('4M', 'blue', 'property', 'Park avenue'),
          ]
        : game.id === 'rummy'
          ? [card('6', 'red', '♥'), card('7', 'red', '♥'), card('8', 'red', '♥')]
          : game.id === 'teen-patti'
            ? [card('A', 'ink', '♠'), card('A', 'red', '♥'), card('A', 'ink', '♣')]
            : [card('A', 'ink', '♠'), card('K', 'red', '♥')];
  const family =
    game.family === 'shedding' ? 'shedding' : game.family === 'property' ? 'property' : 'standard';
  return (
    <div className="game-art" aria-hidden="true">
      {cards.map((card, i) => (
        <PlayingCard key={i} card={card} family={family} />
      ))}
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
