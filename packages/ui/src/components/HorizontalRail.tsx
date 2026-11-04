'use client';
import {
  useCallback,
  useLayoutEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { cn } from '../lib/cn';

interface HorizontalRailProps {
  children: ReactNode;
  label: string;
  className?: string;
  viewportClassName?: string;
  contentClassName?: string;
  navigationLabel?: string;
  navigationPosition?: 'sides' | 'below';
  /**
   * Keeps the child marked `data-rail-reveal="true"` (or the child at
   * `revealIndex`) fully in view after layout, whenever this key changes and
   * whenever the rail's size or overflow changes.
   */
  revealKey?: string | number | null;
  /** The content child to reveal when children cannot carry `data-rail-reveal`. */
  revealIndex?: number | null;
  /** Optional role for the content row, for example `list` for a roster. */
  contentRole?: HTMLAttributes<HTMLDivElement>['role'];
}

/** Scrolls only the rail (never the page) so `item` sits inside the visible window. */
function revealWithin(frame: HTMLElement, item: HTMLElement, behavior: ScrollBehavior) {
  // A pinned (sticky) item is always in view already.
  if (getComputedStyle(item).position === 'sticky') return;
  const style = getComputedStyle(frame);
  // scroll-padding marks space that pinned items cover inside the viewport.
  const start = parseFloat(style.scrollPaddingLeft) || 0;
  const end = parseFloat(style.scrollPaddingRight) || 0;
  const bounds = frame.getBoundingClientRect();
  const box = item.getBoundingClientRect();
  // Leave a sliver of the neighbour in view, so a tap on it keeps moving along.
  const peek = Math.min(24, Math.max(0, (bounds.width - start - end - box.width) / 2 - 4));
  const left = bounds.left + start + 4 + (item.previousElementSibling ? peek : 0);
  const right = bounds.right - end - 4 - (item.nextElementSibling ? peek : 0);
  const delta =
    box.left < left
      ? box.left - left
      : box.right > right
        ? Math.min(box.right - right, box.left - left)
        : 0;
  if (Math.abs(delta) > 0.5) frame.scrollBy({ left: delta, behavior });
}

/** Native touch scrolling with separate controls that never cover the content. */
export function HorizontalRail({
  children,
  label,
  className,
  viewportClassName,
  contentClassName,
  navigationLabel,
  navigationPosition = 'sides',
  revealKey,
  revealIndex,
  contentRole,
}: HorizontalRailProps) {
  const root = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const railId = useId();
  const navigation = navigationLabel || `cards in ${label.toLowerCase()}`;
  const [position, setPosition] = useState({ overflow: false, start: true, end: true });
  const measure = useCallback(() => {
    const frame = viewport.current;
    if (!frame || !root.current) return;
    // Compare with the full rail, not its gutter-adjusted viewport; otherwise
    // enabling the arrows can make a nearly full hand oscillate between modes.
    const overflow = frame.scrollWidth > root.current.clientWidth + 1;
    const next = {
      overflow,
      start: frame.scrollLeft <= 1,
      end: frame.scrollLeft + frame.clientWidth >= frame.scrollWidth - 1,
    };
    setPosition((current) =>
      current.overflow === next.overflow && current.start === next.start && current.end === next.end
        ? current
        : next,
    );
  }, []);
  const reveal = useCallback(() => {
    const frame = viewport.current;
    if (revealKey == null || !frame || frame.scrollWidth <= frame.clientWidth + 1) return;
    const item =
      revealIndex != null
        ? (content.current?.children[revealIndex] as HTMLElement | undefined)
        : frame.querySelector<HTMLElement>('[data-rail-reveal="true"]');
    if (item) revealWithin(frame, item, 'instant');
  }, [revealKey, revealIndex]);
  // Measure before paint: below-board controls reserve height, so a late
  // overflow update must not move the decision dock on the first selection.
  useLayoutEffect(() => {
    const observer = new ResizeObserver(() => {
      measure();
      reveal();
    });
    if (root.current) observer.observe(root.current);
    if (content.current) observer.observe(content.current);
    measure();
    return () => observer.disconnect();
  }, [measure, reveal]);
  useLayoutEffect(() => measure(), [position.overflow, children, measure]);
  // Runs after the overflow gutters apply, so the revealed item is never left
  // under a control or outside the narrowed viewport.
  useLayoutEffect(() => reveal(), [reveal, position.overflow]);

  function scroll(direction: number) {
    const frame = viewport.current;
    if (!frame) return;
    frame.scrollBy({
      left: direction * Math.max(80, frame.clientWidth * 0.8),
      behavior: reduced ? 'instant' : 'smooth',
    });
  }

  return (
    <div
      ref={root}
      className={cn('horizontal-rail', className)}
      data-overflow={position.overflow}
      data-navigation={navigationPosition}
      data-at-start={position.start}
      data-at-end={position.end}
    >
      {position.overflow ? (
        <button
          type="button"
          className="rail-navigation rail-navigation--previous"
          aria-label={`Previous ${navigation}`}
          aria-controls={railId}
          disabled={position.start}
          onClick={() => scroll(-1)}
        >
          <ChevronLeft size={18} />
        </button>
      ) : null}
      <div
        ref={viewport}
        id={railId}
        className={cn('horizontal-rail-viewport', viewportClassName)}
        role="group"
        aria-label={label}
        onScroll={measure}
        onFocusCapture={(event) => {
          const frame = viewport.current;
          const target = event.target as HTMLElement;
          if (!frame || target === frame) return;
          revealWithin(frame, target, 'instant');
        }}
      >
        <div
          ref={content}
          className={cn('horizontal-rail-content', contentClassName)}
          role={contentRole}
        >
          {children}
        </div>
      </div>
      {position.overflow ? (
        <button
          type="button"
          className="rail-navigation rail-navigation--next"
          aria-label={`Next ${navigation}`}
          aria-controls={railId}
          disabled={position.end}
          onClick={() => scroll(1)}
        >
          <ChevronRight size={18} />
        </button>
      ) : null}
    </div>
  );
}
