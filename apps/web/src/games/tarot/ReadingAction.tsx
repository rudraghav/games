'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { useReducedMotion } from 'motion/react';

/** One surface changes shape; motion never schedules or delays a request. */
export function ReadingAction({
  processing,
  animate,
  action,
  children,
  onExpanded,
}: {
  processing: boolean;
  animate: boolean;
  action: ReactNode;
  children: ReactNode;
  onExpanded: () => void;
}) {
  const surface = useRef<HTMLDivElement>(null);
  const previous = useRef(processing);
  const ownedFocus = useRef(false);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const node = surface.current;
    if (!node) return;
    if (processing !== previous.current) {
      const active = document.activeElement;
      if (processing && ownedFocus.current && (node.contains(active) || active === document.body)) {
        node.focus({ preventScroll: true });
      } else if (!processing && active === node) {
        node.querySelector<HTMLElement>('button:not(:disabled), a[href]')?.focus({
          preventScroll: true,
        });
      }
      previous.current = processing;
    }
    // CSS also checks this preference, including the first hydrated frame.
    if (
      processing &&
      (!animate || reduced || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    ) {
      onExpanded();
    }
  }, [processing, animate, reduced, onExpanded]);

  return (
    <div
      ref={surface}
      className="tarot-action-surface"
      role="group"
      aria-label="Reading action"
      tabIndex={-1}
      data-processing={processing || undefined}
      data-animate={animate || undefined}
      onFocusCapture={() => {
        ownedFocus.current = true;
      }}
      onBlurCapture={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) {
          ownedFocus.current = false;
        }
      }}
    >
      <div
        className="tarot-action-control"
        inert={processing}
        aria-hidden={processing || undefined}
      >
        {action}
      </div>
      <div
        className="tarot-action-expander"
        inert={!processing}
        aria-hidden={!processing || undefined}
        onTransitionEnd={(event) => {
          if (
            processing &&
            event.target === event.currentTarget &&
            event.propertyName === 'grid-template-rows'
          ) {
            onExpanded();
          }
        }}
      >
        <div className="tarot-action-content">{children}</div>
      </div>
    </div>
  );
}
