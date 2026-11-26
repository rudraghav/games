import {
  ArrowRight,
  Check,
  Cherry,
  CircleMinus,
  Crown,
  Eye,
  Flag,
  Flame,
  Hand,
  Landmark,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Star,
  UsersRound,
  Vault,
} from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import type { Game } from '@games/api-client/catalog';
import {
  AzulTileArt,
  BoopPiece,
  GemDistrictArt,
  MancalaPit,
  PaperCardArt,
  PlayingCard,
  ResourceToken,
  TarotCard,
  TokenArt,
  WordTile,
  type TokenKind,
} from '@games/ui';
import { optimizeCardArt } from '@/shared/card-art';
import { Die } from '@/games/liars-dice/Die';
import { tutorialLessons } from './lessons';
import type { LessonPicture, PicturePiece } from './lesson-pictures';
import { rulebookTopics } from './rulebook-topics';
import './illustrated-rules.css';

const symbols = {
  hand: Hand,
  eye: Eye,
  lock: LockKeyhole,
  message: MessageCircle,
  people: UsersRound,
  check: Check,
  star: Star,
  flag: Flag,
  shield: ShieldCheck,
  bank: Landmark,
  vault: Vault,
  crown: Crown,
  flame: Flame,
  arrow: ArrowRight,
};
const discs: Record<string, TokenKind> = { r: 'coral', g: 'gold', b: 'ink', w: 'ivory' };

function PicturePieceView({ item }: { item: PicturePiece }) {
  switch (item.kind) {
    case 'icon': {
      const Icon = symbols[item.icon];
      return (
        <span className="lesson-symbol" data-connector={item.icon === 'arrow' || undefined}>
          <Icon aria-hidden="true" />
          {item.label && <small>{item.label}</small>}
        </span>
      );
    }
    case 'card':
      return (
        <PlayingCard
          compact
          family={item.family}
          card={{
            id: item.family === 'grid' ? 'sky:example' : 'example',
            value: item.value,
            color: item.color,
            suit: item.suit,
            label: item.value + item.suit,
            subtitle: '',
          }}
        />
      );
    case 'property':
      return (
        <PlayingCard
          compact
          family="property"
          card={{
            id: 'example',
            value: item.value,
            color: item.color,
            colors: [item.color],
            suit: 'property',
            label: item.name,
            subtitle: item.name,
            setSize: 2,
            setName: 'Dark blue',
            rentLadder: [3, 8],
          }}
        />
      );
    case 'reel':
      return (
        <span className="lesson-reel" data-symbol={item.symbol}>
          {item.symbol === 'cherry' ? <Cherry /> : <Star />}
        </span>
      );
    case 'back':
      return <PlayingCard faceDown compact />;
    case 'tarot':
      return <TarotCard id={item.id} name={item.name} compact imageLoader={optimizeCardArt} />;
    case 'token':
      return (
        <span className="lesson-token">
          <TokenArt kind={item.color} />
          {item.label && <small>{item.label}</small>}
        </span>
      );
    case 'tile':
      return (
        <span className="lesson-tile">
          <AzulTileArt color={item.color} />
        </span>
      );
    case 'rank-chip':
      return (
        <span className="gang-chip-rack lesson-rank-chip" data-chip-color={item.color}>
          <span className="gang-rank-chip">
            <Star size={15} />
            {item.rank}
          </span>
        </span>
      );
    case 'cat':
      return (
        <BoopPiece
          kind={item.grown ? 'cat' : 'kitten'}
          color="coral"
          label={item.grown ? 'Adult cat' : 'Kitten'}
        />
      );
    case 'pit':
      return (
        <MancalaPit label={item.store ? 'Store' : 'Pit'} count={item.seeds} store={item.store} />
      );
    case 'gem':
      return <ResourceToken color={item.color} />;
    case 'district':
      return <GemDistrictArt color={item.color} />;
    case 'paper':
      return <PaperCardArt kind={item.subject} tone={item.color} />;
    case 'word':
      return (
        <WordTile
          word={item.word}
          revealed={item.revealed}
          tone={item.revealed ? 'coral' : 'unknown'}
        />
      );
    case 'number': {
      const isTrio = item.horns === 0;
      const color = isTrio
        ? item.value === 7
          ? 'yellow'
          : 'violet'
        : { 1: 'green', 2: 'blue', 3: 'yellow', 5: 'red', 7: 'plum' }[item.horns] || 'green';
      return (
        <span className="lesson-number">
          <PlayingCard
            compact
            family="grid"
            card={{
              id: (isTrio ? 'trio-' : 'number-') + item.value,
              value: String(item.value),
              label: String(item.value),
              suit: '',
              color,
              subtitle: '',
            }}
          />
          {!isTrio && (
            <small>
              <CircleMinus size={8} aria-hidden="true" />
              {item.horns}
            </small>
          )}
        </span>
      );
    }
    case 'die':
      return (
        <span className="lesson-die">
          <Die face={item.face} size="sm" counts={item.counts} label="" />
          {item.counts ? <small>{item.counts === 'wild' ? 'wild' : 'counts'}</small> : null}
        </span>
      );
    case 'housie-cell':
      return (
        <span className="lesson-housie-cell" data-stamped={item.stamped || undefined}>
          {item.value}
          {item.stamped ? <Check aria-hidden="true" /> : null}
        </span>
      );
    case 'housie-ball':
      return <span className="lesson-housie-ball">{item.value}</span>;
    case 'full-number-row':
      return (
        <span className="lesson-number-run">
          {item.numbers.map((value) => (
            <span key={value}>{value}</span>
          ))}
        </span>
      );
    case 'board':
      return (
        <span
          className="lesson-board"
          data-checkered={item.checkered || undefined}
          style={{ '--columns': item.rows[0].length } as CSSProperties}
        >
          {item.rows.flatMap((row, y) =>
            Array.from(row, (value, x) => (
              <span
                key={y + ':' + x}
                className="lesson-square"
                data-dark={(x + y) % 2 === 0 || undefined}
              >
                {discs[value] && <TokenArt kind={discs[value]} />}
                {(value === 'k' || value === 'K') && (
                  <BoopPiece
                    kind="kitten"
                    color={value === 'k' ? 'coral' : 'blue'}
                    label="Kitten"
                  />
                )}
              </span>
            )),
          )}
        </span>
      );
  }
}

export function RulePicture({ picture }: { picture: LessonPicture }) {
  return (
    <div className="lesson-picture" role="img" aria-label={picture.description}>
      <div className="lesson-pieces" aria-hidden="true" data-column={picture.column || undefined}>
        {picture.pieces.map((item, index) => (
          <PicturePieceView key={index} item={item} />
        ))}
      </div>
    </div>
  );
}

export function IllustratedRules({ gameId }: { gameId: string }) {
  const lesson = tutorialLessons[gameId];
  if (!lesson) return null;
  return (
    <section className="illustrated-rules" data-game={gameId} aria-label="In pictures">
      <h2 className="game-rulebook__heading">In pictures</h2>
      <div className="illustrated-rules-grid">
        {lesson.rules.map((rule) => (
          <figure key={rule.title} className="illustrated-rule">
            <RulePicture picture={rule.visual} />
            <figcaption>
              <h3>{rule.title}</h3>
              <p>{rule.text}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function GameRulebook({
  game,
  tutorialControl,
}: {
  game: Game;
  tutorialControl?: ReactNode;
}) {
  const lesson = tutorialLessons[game.id];
  const topics = rulebookTopics[game.id] ?? [[0, 'Playing the game'] as const];
  return (
    <article className="game-rulebook" aria-label={`${game.name} rulebook`}>
      <header className="game-rulebook__intro">
        {lesson && (
          <p className="game-rulebook__goal">
            <strong>Your aim</strong>
            {lesson.goal}
          </p>
        )}
        {tutorialControl}
      </header>
      <IllustratedRules gameId={game.id} />
      <section className="game-rulebook__reference" aria-label="Rules reference">
        <h2 className="game-rulebook__heading">Rules reference</h2>
        <div className="game-rulebook__topics">
          {topics.map(([start, heading], index) => (
            <div key={heading}>
              <h3>{heading}</h3>
              <ul>
                {game.rules.slice(start, topics[index + 1]?.[0]).map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
