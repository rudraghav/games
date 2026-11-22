import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

type TicketElement = 'div' | 'li' | 'article' | 'section';

interface TicketProps extends HTMLAttributes<HTMLElement> {
  /** The element to render, so a ticket can be a list item or a labelled section. */
  as?: TicketElement;
  /** `success` for something redeemed or in use, `muted` for something still locked. */
  variant?: 'default' | 'success' | 'muted';
  /**
   * Where the stub sits. `auto` stacks it under the body on phones and puts it
   * beside the body on wider screens; `row` and `column` hold one arrangement.
   */
  layout?: 'auto' | 'row' | 'column';
  /** Which end the stub tears off from: after the body (default) or before it. */
  stubSide?: 'end' | 'start';
  /** A gift tag adds an eyelet to the body's outer edge. */
  shape?: 'ticket' | 'tag';
  /** The tear-off part. Without it the ticket is one piece with no tear line. */
  stub?: ReactNode;
  stubClassName?: string;
  bodyClassName?: string;
  children: ReactNode;
}

/**
 * A ticket or coupon: a body and a stub joined by a dashed tear line, with a
 * notch cut from each edge where they meet. It is a layout shell only. What
 * goes inside stays ordinary HTML with its own headings, buttons and labels,
 * and any `aria-*`, `role` or `data-*` attribute lands on the outer element.
 */
export function Ticket({
  as: Element = 'div',
  variant = 'default',
  layout = 'auto',
  stubSide = 'end',
  shape = 'ticket',
  stub,
  stubClassName,
  bodyClassName,
  className,
  children,
  ...rest
}: TicketProps) {
  const hasStub = stub !== undefined && stub !== null && stub !== false;
  return (
    <Element
      {...rest}
      className={cn('ticket', className)}
      data-variant={variant}
      data-layout={layout}
      data-stub={hasStub ? stubSide : 'none'}
      data-shape={shape}
    >
      <div className={cn('ticket-body', bodyClassName)}>{children}</div>
      {hasStub ? <div className={cn('ticket-stub', stubClassName)}>{stub}</div> : null}
    </Element>
  );
}
