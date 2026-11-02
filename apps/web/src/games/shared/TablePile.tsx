'use client';
import { Button, CardPile } from '@games/ui';
import type { ActionOption, Card } from '@games/api-client';
import type { TableProps } from '../types';

/** Keep a pile's legal move beside its cards, with one keyboard/touch target. */
export function TablePile({
  action,
  card,
  count,
  family = 'standard',
  label,
  onAction,
  pending,
  paused,
}: {
  action?: ActionOption;
  card?: Card | null;
  count?: number;
  family?: 'standard' | 'shedding' | 'grid';
  label: string;
  onAction: TableProps['onAction'];
  pending: boolean;
  paused: boolean;
}) {
  const pile = (
    <CardPile card={card} count={count} family={family} label={action?.label ?? label} />
  );
  return action ? (
    <Button
      className="table-pile-button"
      variant="ghost"
      disabled={pending || paused}
      aria-label={action.label}
      onClick={() => onAction(action.value)}
    >
      {pile}
    </Button>
  ) : (
    pile
  );
}
