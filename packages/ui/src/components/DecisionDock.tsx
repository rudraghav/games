import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../lib/cn';

type Props = ComponentPropsWithoutRef<'section'> & {
  size?: 'compact' | 'standard' | 'extended';
  label?: string;
  pending?: boolean;
};

/** A stable decision footprint: changing a choice never moves the playing area. */
export function DecisionDock({
  children,
  size = 'standard',
  label = 'Your actions',
  pending,
  className,
  ...props
}: Props) {
  return (
    <section
      {...props}
      className={cn('decision-dock', className)}
      data-size={size}
      aria-label={label}
      aria-busy={pending}
    >
      {children}
    </section>
  );
}
