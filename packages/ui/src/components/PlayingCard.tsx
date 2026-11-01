'use client';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '../lib/cn';
import { standardCardAsset } from '../lib/standard-card-art';
import {
  Ban,
  Repeat2,
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
  TrainFront,
  Zap,
  Droplets,
} from 'lucide-react';
import { GemDistrictArt } from './GemDistrictArt';

export interface CardPresentation {
  id: string;
  label: string;
  value: string;
  color: string;
  subtitle: string;
  suit: string;
  colors?: readonly string[];
  effect?: string;
}
interface PlayingCardProps {
  card?: CardPresentation;
  family?: 'standard' | 'shedding' | 'property' | 'grid';
  faceDown?: boolean;
  selected?: boolean;
  compact?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  label?: string;
}

const propertyNames: Record<string, string> = {
  brown: 'Brown',
  sky: 'Light blue',
  pink: 'Pink',
  orange: 'Orange',
  red: 'Red',
  yellow: 'Yellow',
  green: 'Green',
  blue: 'Dark blue',
  rail: 'Railroad',
  utility: 'Utilities',
};
const shortPropertyNames: Record<string, string> = {
  ...propertyNames,
  sky: 'Sky',
  blue: 'Blue',
  rail: 'Rail',
  utility: 'Utility',
};
const districtScenes: Record<string, [string, number]> = {
  brown: ['ruby', 1],
  sky: ['sapphire', 1],
  pink: ['ruby', 2],
  orange: ['pearl', 2],
  red: ['ruby', 3],
  yellow: ['pearl', 3],
  green: ['emerald', 2],
  blue: ['sapphire', 3],
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
function PropertyScene({ color }: { color: string }) {
  if (color === 'rail')
    return (
      <span className="property-infrastructure" data-property-scene="rail">
        <TrainFront />
        <span className="property-track" />
      </span>
    );
  if (color === 'utility')
    return (
      <span className="property-infrastructure property-utilities" data-property-scene="utility">
        <Zap />
        <Droplets />
      </span>
    );
  const [gem, tier] = districtScenes[color] || districtScenes.brown;
  return (
    <span className="property-district" data-property-scene={color}>
      <GemDistrictArt color={gem} tier={tier} />
    </span>
  );
}
function PropertyBands({ colors, active }: { colors: readonly string[]; active?: string }) {
  return (
    <span className="property-band" aria-hidden="true">
      {colors.map((color) => (
        <span key={color} data-property-color={color} data-active={color === active} />
      ))}
    </span>
  );
}
function DealFace({ card }: { card: CardPresentation }) {
  const colors = card.colors?.length ? card.colors : card.suit === 'property' ? [card.color] : [];
  const wild = card.suit === 'property' && colors.length > 1;
  const money = card.subtitle === 'MONEY';
  const effect = card.effect || '';
  const Icon = effectIcons[effect as keyof typeof effectIcons] || HandCoins;
  const colorLabel =
    colors.length === 10
      ? 'Any colour'
      : colors.map((color) => shortPropertyNames[color] || color).join(' / ');
  return (
    <>
      <PropertyBands colors={colors} active={wild ? card.color : undefined} />
      <span className="property-value">{card.value}</span>
      <span
        className="property-symbol"
        data-design={
          money
            ? 'money'
            : card.suit === 'property'
              ? wild
                ? 'wild-property'
                : 'property'
              : effect || 'legacy-action'
        }
        aria-hidden="true"
      >
        {money ? (
          <span className="money-art">
            <svg viewBox="0 0 80 60">
              <ellipse cx="40" cy="30" rx="36" ry="26" />
              <ellipse cx="40" cy="30" rx="30" ry="22" />
              <path d="M4 17Q40 2 76 17M4 43Q40 58 76 43" />
            </svg>
            <strong>{card.value}</strong>
          </span>
        ) : card.suit === 'property' ? (
          <span className="property-scene" data-wild={wild}>
            {(wild ? (colors.length === 10 ? [card.color] : colors) : [card.color]).map((color) => (
              <PropertyScene key={color} color={color} />
            ))}
          </span>
        ) : (
          <span className="deal-action-art" data-effect={effect || 'legacy'}>
            <span className="deal-action-orbit" />
            <Icon />
            {effect === 'rent_double' || effect === 'double' ? <b>×2</b> : null}
            {['forced', 'unfair'].includes(effect) ? <span className="deal-action-cards" /> : null}
          </span>
        )}
      </span>
      <span className="property-footer">
        <span className="property-name">
          {money
            ? 'Money'
            : card.suit === 'property'
              ? wild
                ? 'Wild property'
                : propertyNames[card.color] || card.label
              : card.label}
        </span>
        {colors.length > 1 ? <span className="property-color-label">{colorLabel}</span> : null}
        {wild ? (
          <span className="property-active-label">
            {shortPropertyNames[card.color] || card.color} active
          </span>
        ) : null}
      </span>
    </>
  );
}
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
function SkipAllMark() {
  return (
    <svg className="shedding-all-mark" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="18" />
      <path d="M20 44L44 20" />
      <circle cx="9" cy="12" r="5" />
      <circle cx="55" cy="12" r="5" />
      <circle cx="9" cy="52" r="5" />
      <circle cx="55" cy="52" r="5" />
    </svg>
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

function CardContents({ card, family, faceDown }: PlayingCardProps) {
  if (faceDown || !card)
    return (
      <span className="card-back-pattern">
        <span>g.</span>
      </span>
    );
  if (family === 'property') return <DealFace card={card} />;
  if (family === 'grid') return <span className="grid-card-value">{card.value}</span>;
  if (family === 'standard') {
    const artwork = standardCardAsset(card);
    if (artwork)
      return (
        <svg
          className="standard-card-art"
          viewBox="0 0 167.0869141 242.6669922"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          focusable="false"
        >
          <image href={artwork} width="167.0869141" height="242.6669922" />
        </svg>
      );
  }
  if (family === 'shedding') {
    const symbols: Partial<Record<string, typeof Ban>> = {
      Skip: Ban,
      Reverse: Repeat2,
      'Discard all': Layers,
      'Skip everyone': SkipForward,
      Wild: Sparkles,
      'Reverse +4': Repeat2,
      'Colour roulette': Shuffle,
    };
    const Icon = symbols[card.value];
    const draw = /^\+\d+$/.test(card.value);
    const index =
      card.value === 'Reverse +4' ? '+4' : draw || /^\d+$/.test(card.value) ? card.value : '';
    const name = /^\d$/.test(card.value) ? card.color : card.value;
    return (
      <>
        <span className="shedding-index">{index || (Icon ? <Icon size={13} /> : '')}</span>
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
          ) : card.value === 'Skip everyone' ? (
            <SkipAllMark />
          ) : (
            <>
              {Icon ? <Icon /> : null}
              {index ? <strong>{index}</strong> : null}
            </>
          )}
        </span>
        <span className="card-action-name">{name}</span>
      </>
    );
  }
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

export function PlayingCard(props: PlayingCardProps) {
  const {
    card,
    family = 'standard',
    faceDown = false,
    selected = false,
    compact,
    onClick,
    disabled,
    className,
    label,
  } = props;
  const reduced = useReducedMotion();
  const classes = cn(
    'playing-card',
    `playing-card--${family}`,
    compact && 'playing-card--compact',
    faceDown && 'playing-card--back',
    selected && 'playing-card--selected',
    className,
  );
  const content = <CardContents {...props} family={family} />;
  const appearance = {
    className: classes,
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
