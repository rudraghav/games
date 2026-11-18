import {
  ArrowRight,
  Check,
  CircleMinus,
  Crown,
  Eye,
  Flag,
  Hand,
  Landmark,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Star,
  UsersRound,
  Vault,
} from 'lucide-react';
import type { CSSProperties } from 'react';
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
import { tutorialLessons } from './lessons';
import type { LessonPicture, PicturePiece } from './lesson-pictures';
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

/** This compact primer is paired with the full rules and the live guided match. */
export function IllustratedRules({ gameId }: { gameId: string }) {
  const lesson = tutorialLessons[gameId];
  if (!lesson) return null;
  return (
    <div className="illustrated-rules" data-game={gameId}>
      <div className="illustrated-rules-grid">
        {lesson.rules.map((rule) => (
          <article key={rule.title} className="illustrated-rule">
            <RulePicture picture={rule.visual} />
            <div>
              <h3>{rule.title}</h3>
              <p>{rule.text}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
