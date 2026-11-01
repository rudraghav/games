import { cn } from '../lib/cn';
import { Gem, Sparkles } from 'lucide-react';
import { GemDistrictArt } from './GemDistrictArt';

export const gemColors = ['pearl', 'sapphire', 'ruby', 'emerald', 'onyx', 'gold'] as const;
export function ResourceToken({
  color,
  count,
  compact = false,
}: {
  color: string;
  count?: number;
  compact?: boolean;
}) {
  return (
    <span
      className={cn('resource-token', compact && 'resource-token--compact')}
      data-gem={color}
      role="img"
      aria-label={`${count ?? ''} ${color}`.trim()}
    >
      <span aria-hidden="true">
        {color === 'gold' ? <Sparkles size={14} /> : <Gem size={14} />}
      </span>
      {count != null ? <b>{count}</b> : null}
    </span>
  );
}
export function DevelopmentCard({
  name,
  bonus,
  points,
  cost,
  selected = false,
  onClick,
  disabled,
  tier,
}: {
  name: string;
  bonus: string;
  points: number;
  cost: Record<string, number>;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  tier?: number;
}) {
  const label = `${name}, ${points} prestige, ${Object.entries(cost)
    .map(([color, n]) => `${n} ${color}`)
    .join(', ')}`;
  const props = {
    className: cn('playing-card', 'development-card', selected && 'playing-card--selected'),
    'data-gem': bonus,
    'aria-label': label,
  };
  const body = (
    <>
      <span className="development-top">
        <b>{points}</b>
        <ResourceToken color={bonus} compact />
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
          patron={bonus === 'gold'}
        />
      </span>
      <strong>{name}</strong>
      <span className="development-cost">
        {Object.entries(cost).map(([color, count]) => (
          <ResourceToken key={color} color={color} count={count} compact />
        ))}
      </span>
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
