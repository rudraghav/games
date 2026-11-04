import type { MouseEvent } from 'react';
import { cn } from '../lib/cn';
import { Sparkles } from 'lucide-react';
import { GemDistrictArt } from './GemDistrictArt';

export const gemColors = ['pearl', 'sapphire', 'ruby', 'emerald', 'onyx', 'gold'] as const;

/**
 * Each gem has its own cut so colours never carry meaning alone: round pearl,
 * diamond sapphire, trillion ruby, step-cut emerald and hexagonal onyx. Gold
 * keeps the wild sparkle.
 */
const gemShapes: Record<string, { outline: string; facet: string }> = {
  pearl: { outline: 'M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2Z', facet: 'M5.6 6.4a2.4 2.4 0 0 1 2.4-2' },
  sapphire: { outline: 'M8 1.4 14.4 8 8 14.6 1.6 8Z', facet: 'M1.6 8h12.8M8 1.4v13.2' },
  ruby: { outline: 'M1.6 3.2h12.8L8 14.4Z', facet: 'M1.6 3.2 8 7.4l6.4-4.2M8 7.4v7' },
  emerald: {
    outline: 'M4.4 2.6h7.2L14 5v6l-2.4 2.4H4.4L2 11V5Z',
    facet: 'M5.4 5.2h5.2v5.6H5.4Z',
  },
  onyx: {
    outline: 'M8 1.5 13.7 4.8v6.4L8 14.5l-5.7-3.3V4.8Z',
    facet: 'M8 1.5v13M2.3 4.8l11.4 6.4',
  },
};

export function GemShape({ color, size = 14 }: { color: string; size?: number }) {
  if (color === 'gold') return <Sparkles size={size} aria-hidden="true" />;
  const shape = gemShapes[color] || gemShapes.pearl;
  return (
    <svg
      className="gem-shape"
      data-shape={color}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      <path className="gem-shape-body" d={shape.outline} />
      <path className="gem-shape-facet" d={shape.facet} />
    </svg>
  );
}

export function ResourceToken({
  color,
  count,
  compact = false,
  label,
}: {
  color: string;
  count?: number;
  compact?: boolean;
  /** Overrides the spoken name, for example "3 ruby discount". */
  label?: string;
}) {
  return (
    <span
      className={cn('resource-token', compact && 'resource-token--compact')}
      data-gem={color}
      role="img"
      aria-label={label || `${count ?? ''} ${color}`.trim()}
    >
      <span aria-hidden="true">
        <GemShape color={color} size={compact ? 11 : 14} />
      </span>
      {count != null ? <b>{count}</b> : null}
    </span>
  );
}

/** Costs always read in the same colour order, whatever order the data arrives in. */
const inGemOrder = (counts: Record<string, number>) =>
  Object.entries(counts).sort(
    ([a], [b]) =>
      (gemColors as readonly string[]).indexOf(a) - (gemColors as readonly string[]).indexOf(b),
  );
const describe = (counts: Record<string, number>) =>
  inGemOrder(counts)
    .filter(([, n]) => n > 0)
    .map(([color, n]) => `${n} ${color}`)
    .join(', ');

export type DevelopmentStatus =
  { kind: 'affordable' } | { kind: 'short'; amount: number } | { kind: 'eligible' };

export function DevelopmentCard({
  name,
  bonus,
  points,
  cost,
  selected = false,
  onClick,
  disabled,
  tier,
  patron = bonus === 'gold',
  have,
  status,
  compact = false,
  cardId,
}: {
  name: string;
  bonus: string;
  points: number;
  cost: Record<string, number>;
  selected?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  tier?: number;
  /** Patrons grant prestige only: they never show a discount token. */
  patron?: boolean;
  /** The viewer's discounts, shown as progress toward a patron's requirements. */
  have?: Record<string, number>;
  /** Whether the viewer can afford this card, from the server's purchase quote. */
  status?: DevelopmentStatus | null;
  compact?: boolean;
  /** Identifies the card so focus can return to it after a decision. */
  cardId?: string;
}) {
  const statusText = !status
    ? ''
    : status.kind === 'affordable'
      ? 'Affordable'
      : status.kind === 'eligible'
        ? 'Ready to visit'
        : `Need ${status.amount} more`;
  const label = patron
    ? `${name} patron, ${points} prestige, visits when you have ${describe(cost)} discounts${
        have
          ? `; you have ${inGemOrder(cost)
              .map(([color, n]) => `${Math.min(have[color] || 0, n)} of ${n} ${color}`)
              .join(', ')}`
          : ''
      }${statusText ? `; ${statusText.toLocaleLowerCase()}` : ''}`
    : `${name}, ${points} prestige, ${describe(cost)}${statusText ? `; ${statusText.toLocaleLowerCase()}` : ''}`;
  const props = {
    className: cn(
      'playing-card',
      'development-card',
      patron && 'development-card--patron',
      compact && 'development-card--compact',
      selected && 'playing-card--selected',
    ),
    'data-gem': patron ? 'gold' : bonus,
    'data-card': cardId,
    'data-status': status?.kind,
    'aria-label': label,
  };
  const body = (
    <>
      <span className="development-top">
        <b>{patron ? `+${points}` : points}</b>
        {patron ? (
          <span className="development-patron-mark">Patron</span>
        ) : (
          <ResourceToken color={bonus} compact label={`${bonus} discount`} />
        )}
      </span>
      <span className="development-illustration" aria-hidden="true">
        <GemDistrictArt
          color={bonus}
          tier={
            tier ??
            (name.toLowerCase().includes('palace')
              ? 3
              : name.toLowerCase().includes('guild')
                ? 2
                : 1)
          }
          patron={patron}
        />
      </span>
      <strong>{name}</strong>
      <span className="development-cost">
        {inGemOrder(cost).map(([color, count]) =>
          patron && have ? (
            <span
              className="development-requirement"
              key={color}
              data-met={(have[color] || 0) >= count}
            >
              <ResourceToken color={color} compact />
              <small>
                {Math.min(have[color] || 0, count)}/{count}
              </small>
            </span>
          ) : (
            <ResourceToken key={color} color={color} count={count} compact />
          ),
        )}
      </span>
      {statusText ? (
        <span className="development-status" data-status={status?.kind}>
          {statusText}
        </span>
      ) : null}
    </>
  );
  return onClick ? (
    <button {...props} type="button" aria-pressed={selected} onClick={onClick} disabled={disabled}>
      {body}
    </button>
  ) : (
    <div {...props}>{body}</div>
  );
}
