'use client';
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
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
}

/** Native touch scrolling with separate controls that never cover the content. */
export function HorizontalRail({
  children,
  label,
  className,
  viewportClassName,
  contentClassName,
  navigationLabel,
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
  useEffect(() => {
    const observer = new ResizeObserver(measure);
    if (root.current) observer.observe(root.current);
    if (content.current) observer.observe(content.current);
    measure();
    return () => observer.disconnect();
  }, [measure]);
  useEffect(() => measure(), [position.overflow, children, measure]);

  function scroll(direction: number) {
    const frame = viewport.current;
    if (!frame) return;
    frame.scrollBy({
      left: direction * Math.max(80, frame.clientWidth * 0.8),
      behavior: reduced ? 'instant' : 'smooth',
    });
  }

  return (
    <div ref={root} className={cn('horizontal-rail', className)} data-overflow={position.overflow}>
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
          const bounds = frame.getBoundingClientRect();
          const item = target.getBoundingClientRect();
          const delta =
            item.left < bounds.left + 4
              ? item.left - bounds.left - 4
              : item.right > bounds.right - 4
                ? item.right - bounds.right + 4
                : 0;
          if (delta) frame.scrollBy({ left: delta, behavior: 'instant' });
        }}
      >
        <div ref={content} className={cn('horizontal-rail-content', contentClassName)}>
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
