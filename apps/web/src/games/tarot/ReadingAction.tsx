'use client';

import { useCallback, useLayoutEffect, useRef, type ReactNode } from 'react';
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
  const content = useRef<HTMLDivElement>(null);
  const previous = useRef(processing);
  const ownedFocus = useRef(false);
  const expanded = useRef(false);
  const following = useRef(false);
  const reduced = useReducedMotion();
  const finishExpansion = useCallback(() => {
    expanded.current = true;
    onExpanded();
  }, [onExpanded]);

  useLayoutEffect(() => {
    const node = surface.current;
    if (!node) return;
    if (processing !== previous.current) {
      expanded.current = false;
      following.current = processing && animate;
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
      finishExpansion();
    }
  }, [processing, animate, reduced, finishExpansion]);

  useLayoutEffect(() => {
    const node = surface.current;
    const progress = content.current?.firstElementChild;
    if (!processing || !animate || !node || !progress) return;
    let previousHeight = progress.getBoundingClientRect().height;
    const observer = new ResizeObserver(() => {
      const height = progress.getBoundingClientRect().height;
      const grew = height > previousHeight + 1;
      previousHeight = height;
      if (
        !grew ||
        !expanded.current ||
        !following.current ||
        !ownedFocus.current ||
        document.activeElement !== node
      ) {
        return;
      }
      const bounds = node.getBoundingClientRect();
      if (bounds.top >= window.innerHeight || bounds.bottom <= 0) return;
      // A new retry explanation can grow after the initial reveal. Keep it visible
      // only while the user is still following this locally submitted reading.
      node.scrollIntoView({
        block: 'nearest',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    });
    observer.observe(progress);
    const stopFollowing = () => {
      following.current = false;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) {
        stopFollowing();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!node.contains(event.target as Node)) stopFollowing();
    };
    window.addEventListener('wheel', stopFollowing, { passive: true });
    window.addEventListener('touchmove', stopFollowing, { passive: true });
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('pointerdown', onPointerDown, true);
    return () => {
      observer.disconnect();
      window.removeEventListener('wheel', stopFollowing);
      window.removeEventListener('touchmove', stopFollowing);
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('pointerdown', onPointerDown, true);
    };
  }, [processing, animate]);

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
            finishExpansion();
          }
        }}
      >
        <div ref={content} className="tarot-action-content">
          {children}
        </div>
      </div>
    </div>
  );
}
