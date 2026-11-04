'use client';
import type { ComponentType } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '../lib/cn';
import {
  isStandardJoker,
  standardCardArtSize,
  standardCardAsset,
  standardJokerInk,
} from '../lib/standard-card-art';
import {
  dealPropertyNames as propertyNames,
  dealCardInstructions as dealInstructions,
} from '../lib/deal-card-info';
import {
  Ban,
  ArrowRightLeft,
  Layers,
  SkipForward,
  Shuffle,
  Sparkles,
  Banknote,
  HandCoins,
  ArrowRight,
  ArrowLeftRight,
  ShieldX,
  Coins,
  Cake,
  Hand,
  KeyRound,
  House,
  Hotel,
  CopyPlus,
  Repeat1,
  Vault,
  TrendingDown,
  Gavel,
  Tent,
  Landmark,
  CloudLightning,
  Scale,
  Magnet,
  Snowflake,
  HeartPlus,
  Layers3,
} from 'lucide-react';

export interface CardPresentation {
  id: string;
  label: string;
  value: string;
  color: string;
  subtitle: string;
  suit: string;
  colors?: readonly string[];
  effect?: string;
  setName?: string | null;
  setSize?: number | null;
  rentLadder?: readonly number[];
  set_name?: string | null;
  set_size?: number | null;
  rent_ladder?: readonly number[];
}
/**
 * Face families. `flip` is Flip 7 (numbers, score modifiers and action cards);
 * Flip 7 cards passed as `shedding` are recognised by their printed ✦ suit.
 */
export type CardFamily = 'standard' | 'shedding' | 'property' | 'grid' | 'flip';
interface PlayingCardProps {
  card?: CardPresentation;
  family?: CardFamily;
  faceDown?: boolean;
  selected?: boolean;
  compact?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  playable?: boolean;
}

const shortPropertyNames: Record<string, string> = {
  ...propertyNames,
  sky: 'Sky',
  blue: 'Blue',
  rail: 'Rail',
  utility: 'Utility',
};
const effectIcons = {
  pass_go: ArrowRight,
  no: ShieldX,
  debt: Coins,
  birthday: Cake,
  sly: Hand,
  forced: ArrowLeftRight,
  breaker: KeyRound,
  house: House,
  hotel: Hotel,
  double: CopyPlus,
  rent: Banknote,
  rent_double: Banknote,
  forced_debt: HandCoins,
  go_again: Repeat1,
  heist: Vault,
  crash: TrendingDown,
  fill: Layers,
  repossession: Gavel,
  shack: Tent,
  super_sly: Sparkles,
  tax: Landmark,
  tough: CloudLightning,
  unfair: Scale,
  yoink: Magnet,
};

/* ---------- Deal ---------- */

function PropertyBands({ colors, active }: { colors: readonly string[]; active?: string }) {
  return (
    <span className="property-band" data-wild={active ? 'true' : undefined} aria-hidden="true">
      {colors.map((color) => (
        <span key={color} data-property-color={color} data-active={color === active} />
      ))}
    </span>
  );
}
/** Rent is an action: a plum action band carrying the colours it charges, never a property band. */
function RentBand({ colors }: { colors: readonly string[] }) {
  return (
    <span className="property-band deal-rent-band" data-count={colors.length} aria-hidden="true">
      {colors.map((color) => (
        <span key={color} data-property-color={color} />
      ))}
    </span>
  );
}

function DealFace({ card }: { card: CardPresentation }) {
  const colors = card.colors?.length ? card.colors : card.suit === 'property' ? [card.color] : [];
  const property = card.suit === 'property';
  const wild = property && colors.length > 1;
  const money = card.subtitle === 'MONEY';
  const effect = card.effect || '';
  const rent = !property && effect.startsWith('rent');
  const Icon = effectIcons[effect as keyof typeof effectIcons] || HandCoins;
  const ladder = card.rentLadder || card.rent_ladder || [];
  const setSize = card.setSize || card.set_size;
  const noCashValue = card.value === '✧';
  const colorLabel =
    colors.length === 10
      ? 'Any colour'
      : colors.map((color) => propertyNames[color] || color).join(' / ');
  return (
    <>
      {rent ? (
        <RentBand colors={colors} />
      ) : (
        <PropertyBands colors={colors} active={wild ? card.color : undefined} />
      )}
      <span className="deal-card-meta">
        <span>
          {money ? 'BANK' : property ? (wild ? 'WILD' : 'PROPERTY') : rent ? 'RENT' : 'ACTION'}
        </span>
        <span className="property-value" data-no-cash={noCashValue || undefined}>
          {noCashValue ? (
            <>
              <span className="deal-no-cash-glyph" aria-hidden="true">
                {card.value}{' '}
              </span>
              No cash value
            </>
          ) : (
            card.value
          )}
        </span>
      </span>
      <span className="deal-card-body">
        {money ? (
          <span className="money-art" aria-hidden="true">
            <svg viewBox="0 0 80 60">
              <ellipse cx="40" cy="30" rx="36" ry="26" />
              <ellipse cx="40" cy="30" rx="30" ry="22" />
              <path d="M4 17Q40 2 76 17M4 43Q40 58 76 43" />
            </svg>
            <strong>{card.value}</strong>
          </span>
        ) : (
          <>
            {!property ? (
              <span
                className="deal-action-art"
                data-effect={effect || 'legacy-action'}
                aria-hidden="true"
              >
                <Icon />
                {effect === 'rent_double' || effect === 'double' ? <b>×2</b> : null}
              </span>
            ) : null}
            <span className="property-name">{card.label}</span>
            {wild || (colors.length > 0 && !property) ? (
              <span className="property-color-label">{colorLabel}</span>
            ) : null}
            {wild ? (
              <span className="property-active-label" data-property-color={card.color}>
                {propertyNames[card.color] || card.color} active
              </span>
            ) : null}
            {!property ? (
              <span className="deal-card-instruction">
                {dealInstructions[effect] || card.subtitle}
              </span>
            ) : null}
          </>
        )}
      </span>
      <span className="deal-card-foot">
        {property && ladder.length ? (
          <>
            <span className="deal-rent-label">RENT · {setSize} TO COMPLETE</span>
            <span className="deal-rent-ladder">
              {ladder.map((rent, index) => (
                <span key={index}>
                  <small>{index + 1}</small>
                  <b>{rent}M</b>
                </span>
              ))}
            </span>
          </>
        ) : (
          <span>{money ? 'Money' : 'Play it or bank it'}</span>
        )}
      </span>
    </>
  );
}
function propertyAccessibleName(card: CardPresentation) {
  const colors = card.colors || [];
  const value = card.value === '✧' ? 'not bankable' : `bank value ${card.value}`;
  const allowed = colors.length
    ? `, ${colors.length === 10 ? 'any colour: ' : ''}${colors.map((color) => propertyNames[color] || color).join(', ')}`
    : '';
  return `${card.label}, ${value}${allowed}${card.suit === 'property' && colors.length > 1 ? `; ${propertyNames[card.color] || card.color} active` : ''}`;
}

/* ---------- Uno ---------- */

function DrawMark({ value }: { value: string }) {
  return (
    <span className="shedding-draw-mark">
      <svg viewBox="0 0 80 64" aria-hidden="true">
        <rect x="12" y="8" width="34" height="46" rx="5" transform="rotate(-13 29 31)" />
        <rect x="32" y="10" width="34" height="46" rx="5" transform="rotate(12 49 33)" />
      </svg>
      <strong>{value}</strong>
    </span>
  );
}
/** Uno's reverse: two parallel arrows pointing opposite ways. */
function ReverseMark(props: { size?: number }) {
  return (
    <svg
      className="shedding-reverse-mark"
      viewBox="0 0 24 24"
      width={props.size}
      height={props.size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3.5 13.5 13.5 3.5M7.5 3.5h6v6" />
      <path d="M20.5 10.5 10.5 20.5M16.5 20.5h-6v-6" />
    </svg>
  );
}
const unoSymbols: Partial<Record<string, ComponentType<{ size?: number }>>> = {
  Skip: Ban,
  Reverse: ReverseMark,
  'Discard all': Layers,
  'Skip everyone': SkipForward,
  Wild: Sparkles,
  'Reverse +4': ReverseMark,
  'Colour roulette': Shuffle,
};
/** A non-colour cue for every coloured card, so colours never rely on hue alone. */
const unoColourMarks: Record<string, string> = { red: 'R', yellow: 'Y', green: 'G', blue: 'B' };
function unoName(card: CardPresentation) {
  if (/^\d$/.test(card.value)) return card.color.charAt(0).toUpperCase() + card.color.slice(1);
  const draw = card.value.match(/^\+(\d+)$/);
  return draw ? `Draw ${draw[1]}` : card.value;
}
function SheddingFace({ card }: { card: CardPresentation }) {
  const Icon = unoSymbols[card.value];
  const draw = /^\+\d+$/.test(card.value);
  const index =
    card.value === 'Reverse +4' ? '+4' : draw || /^\d+$/.test(card.value) ? card.value : '';
  const mark = unoColourMarks[card.color];
  return (
    <>
      {/* Value and colour letter share the top-left corner: the part a fanned hand leaves visible. */}
      <span className="shedding-index">
        {index || (Icon ? <Icon size={13} /> : '')}
        {mark ? (
          <span className="shedding-colour" aria-hidden="true">
            {mark}
          </span>
        ) : null}
      </span>
      <span
        className="shedding-face"
        data-design={
          card.value === 'Reverse +4'
            ? 'reverse-draw'
            : draw
              ? 'draw'
              : card.value === 'Skip everyone'
                ? 'skip-all'
                : Icon
                  ? 'symbol'
                  : 'number'
        }
        aria-hidden="true"
      >
        {draw ? (
          <DrawMark value={index} />
        ) : (
          <>
            {Icon ? <Icon /> : null}
            {index ? <strong>{index}</strong> : null}
          </>
        )}
      </span>
      <span className="card-action-name">{unoName(card)}</span>
    </>
  );
}

/* ---------- Flip 7 ---------- */

type FlipKind = 'number' | 'modifier' | 'multiplier' | 'freeze' | 'flip-three' | 'second-chance';
const flipActions: Record<string, FlipKind> = {
  Freeze: 'freeze',
  'Flip Three': 'flip-three',
  'Second Chance': 'second-chance',
};
function isFlipSevenCard(card: CardPresentation) {
  return (
    card.suit === '✦' &&
    /^(n-\d+-\d+|plus-\d+|times-2|freeze-\d+|three-\d+|chance-\d+)$/.test(card.id)
  );
}
function flipKind(card: CardPresentation): FlipKind {
  if (flipActions[card.value]) return flipActions[card.value];
  if (/^\+\d+$/.test(card.value)) return 'modifier';
  if (/^[×x]\d+$/.test(card.value)) return 'multiplier';
  return 'number';
}
/** A front card printed 3 over two fanned cards: "the target flips three cards". */
function FlipThreeMark() {
  return (
    <svg className="flip-three-mark" viewBox="0 0 48 48" aria-hidden="true">
      <rect x="4" y="13" width="19" height="27" rx="3" transform="rotate(-17 13.5 26.5)" />
      <rect x="25" y="13" width="19" height="27" rx="3" transform="rotate(17 34.5 26.5)" />
      <rect x="13" y="7" width="22" height="32" rx="3.5" />
      <text x="24" y="31.5" textAnchor="middle">
        3
      </text>
    </svg>
  );
}
function FlipGlyph({ kind, index }: { kind: FlipKind; index?: boolean }) {
  if (kind === 'freeze') return <Snowflake />;
  if (kind === 'second-chance') return <HeartPlus />;
  // Never a bare "3" in the corner: it would read as the number card 3 when scanning for duplicates.
  return index ? <Layers3 /> : <FlipThreeMark />;
}
function FlipFace({ card }: { card: CardPresentation }) {
  const kind = flipKind(card);
  const action = kind === 'freeze' || kind === 'flip-three' || kind === 'second-chance';
  const value = kind === 'multiplier' ? '×2' : card.value;
  const caption =
    kind === 'modifier' ? 'points' : kind === 'multiplier' ? 'double' : action ? card.value : null;
  return (
    <>
      <span className="flip-index" aria-hidden="true">
        {action ? <FlipGlyph kind={kind} index /> : value}
      </span>
      <span className="flip-face" aria-hidden="true">
        {action ? <FlipGlyph kind={kind} /> : <strong data-chars={value.length}>{value}</strong>}
      </span>
      {caption ? (
        <span className="flip-caption" aria-hidden="true">
          {caption}
        </span>
      ) : null}
    </>
  );
}

/* ---------- Skyjo, Trio and 6 nimmt! ---------- */

type GridGame = 'skyjo' | 'trio' | 'six-nimmt';
function gridGame(card: CardPresentation): GridGame | undefined {
  if (card.subtitle === 'SKYJO' || card.id.startsWith('sky:')) return 'skyjo';
  if (card.id.startsWith('trio-')) return 'trio';
  if (card.id.startsWith('number-')) return 'six-nimmt';
  return undefined;
}
/** Skyjo prints -2/-1, 0, 1-4, 5-8 and 9-12 in five different colours. */
function skyjoBand(value: number) {
  return value < 0
    ? 'negative'
    : value === 0
      ? 'zero'
      : value < 5
        ? 'low'
        : value < 9
          ? 'middle'
          : 'high';
}
function GridFace({ card }: { card: CardPresentation }) {
  return (
    <span className="grid-card-value" data-chars={card.value.length}>
      {card.value}
    </span>
  );
}

/* ---------- Standard 52-card deck ---------- */

const suitPaths: Record<string, string> = {
  '♠': 'M12 1.8C9.4 5.6 3.6 8.9 3.6 13.4c0 2.9 2.2 4.9 4.7 4.9 1.4 0 2.6-.6 3.2-1.5-.2 2-1 3.8-2.4 5.4h5.8c-1.4-1.6-2.2-3.4-2.4-5.4.6.9 1.8 1.5 3.2 1.5 2.5 0 4.7-2 4.7-4.9 0-4.5-5.8-7.8-8.4-11.6z',
  '♥': 'M12 21.4S2.8 15.6 2.8 9.1c0-3.2 2.4-5.6 5.3-5.6 1.7 0 3.1.8 3.9 2.1.8-1.3 2.2-2.1 3.9-2.1 2.9 0 5.3 2.4 5.3 5.6 0 6.5-9.2 12.3-9.2 12.3z',
  '♦': 'M12 1.8 20.2 12 12 22.2 3.8 12z',
  '♣': 'M12 2.2a4.6 4.6 0 0 0-4.3 6.3 4.6 4.6 0 1 0 2.9 7.6c-.3 2.1-1.1 4-2.5 5.7h7.8c-1.4-1.7-2.2-3.6-2.5-5.7a4.6 4.6 0 1 0 2.9-7.6A4.6 4.6 0 0 0 12 2.2z',
};
function SuitMark({ suit, className }: { suit: string; className?: string }) {
  const d = suitPaths[suit];
  if (!d) return <i className={className}>{suit}</i>;
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={d} />
    </svg>
  );
}
function standardFace(card: CardPresentation) {
  return isStandardJoker(card) ? 'joker' : /^[JQK]$/.test(card.value) ? 'court' : 'pips';
}
function standardInk(card: CardPresentation) {
  if (isStandardJoker(card)) return standardJokerInk(card);
  return card.suit === '♥' || card.suit === '♦' || card.color === 'red' ? 'red' : 'black';
}
function StandardFace({ card }: { card: CardPresentation }) {
  const artwork = standardCardAsset(card);
  if (!artwork) return <LegacyFace card={card} />;
  const face = standardFace(card);
  return (
    <>
      <svg
        className="standard-card-art"
        viewBox={`0 0 ${standardCardArtSize.width} ${standardCardArtSize.height}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        <image
          href={artwork}
          width={standardCardArtSize.width}
          height={standardCardArtSize.height}
        />
      </svg>
      {/* Small tables cannot read the printed 5-7px corner: a large index replaces it there. */}
      <span className="standard-index" aria-hidden="true">
        {face === 'joker' ? (
          <b>Joker</b>
        ) : (
          <>
            <b>{card.value}</b>
            <SuitMark suit={card.suit} />
          </>
        )}
      </span>
      {face === 'pips' ? <SuitMark suit={card.suit} className="standard-pip" /> : null}
    </>
  );
}
function LegacyFace({ card }: { card: CardPresentation }) {
  const value = card.value;
  return (
    <>
      <span className="card-corner">
        <b>{value}</b>
        <span>{card.suit}</span>
      </span>
      <span className="card-center" data-small={value.length > 2}>
        {card.suit || value}
      </span>
      <span className="card-corner card-corner--bottom">
        <b>{value}</b>
        <span>{card.suit}</span>
      </span>
    </>
  );
}

function faceFamily(card: CardPresentation | undefined, family: CardFamily): CardFamily {
  return card && family === 'shedding' && isFlipSevenCard(card) ? 'flip' : family;
}

function CardContents({
  card,
  family,
  faceDown,
}: {
  card?: CardPresentation;
  family: CardFamily;
  faceDown?: boolean;
}) {
  if (faceDown || !card)
    return (
      <span className="card-back-pattern">
        <span>g.</span>
      </span>
    );
  if (family === 'property') return <DealFace card={card} />;
  if (family === 'grid') return <GridFace card={card} />;
  if (family === 'flip') return <FlipFace card={card} />;
  if (family === 'standard') return <StandardFace card={card} />;
  if (family === 'shedding') return <SheddingFace card={card} />;
  return <LegacyFace card={card} />;
}

function faceAttributes(card: CardPresentation | undefined, family: CardFamily, faceDown: boolean) {
  if (faceDown || !card) return {};
  if (family === 'flip') return { 'data-flip-kind': flipKind(card) };
  if (family === 'standard')
    return standardCardAsset(card)
      ? { 'data-standard-face': standardFace(card), 'data-ink': standardInk(card) }
      : {};
  if (family !== 'grid') return {};
  const game = gridGame(card);
  const number = Number(card.value);
  return {
    'data-grid-game': game,
    'data-grid-band': game === 'skyjo' && Number.isFinite(number) ? skyjoBand(number) : undefined,
    'data-grid-number': game === 'trio' ? card.value : undefined,
  };
}

export function PlayingCard(props: PlayingCardProps) {
  const {
    card,
    family: requestedFamily = 'standard',
    faceDown = false,
    selected = false,
    compact,
    onClick,
    disabled,
    className,
    label,
    playable,
  } = props;
  const reduced = useReducedMotion();
  const family = faceFamily(faceDown ? undefined : card, requestedFamily);
  const classes = cn(
    'playing-card',
    `playing-card--${family}`,
    compact && 'playing-card--compact',
    faceDown && 'playing-card--back',
    selected && 'playing-card--selected',
    className,
  );
  const content = <CardContents card={card} family={family} faceDown={faceDown} />;
  const appearance = {
    className: classes,
    'data-playable': playable,
    'data-color': !faceDown && card ? card.color : 'neutral',
    'data-effect': !faceDown && family === 'property' ? card?.effect : undefined,
    'data-card-kind':
      !faceDown && family === 'property' && card
        ? card.subtitle === 'MONEY'
          ? 'money'
          : card.suit === 'property'
            ? 'property'
            : 'action'
        : undefined,
    ...faceAttributes(card, family, faceDown),
  };
  const accessibleName =
    label ||
    (!faceDown && card
      ? family === 'property'
        ? propertyAccessibleName(card)
        : card.label
      : undefined) ||
    'Face-down card';
  if (onClick)
    return (
      <motion.button
        {...appearance}
        type="button"
        aria-label={accessibleName}
        aria-pressed={selected}
        disabled={disabled}
        onClick={onClick}
        animate={{ y: selected ? -12 : 0 }}
        whileHover={reduced ? undefined : { y: selected ? -14 : -5 }}
        transition={{ duration: reduced ? 0 : 0.18 }}
      >
        {content}
      </motion.button>
    );
  return (
    <div {...appearance} role="img" aria-label={accessibleName}>
      {content}
    </div>
  );
}
