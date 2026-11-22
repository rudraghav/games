'use client';
import { lazy, Suspense, useEffect, type RefObject } from 'react';
import type { Orientation } from './orientation';

// The card guide is about 300 KB of reference text: it loads when a card page first opens.
const Guide = lazy(() =>
  import('./TarotCardGuide').then((mod) => ({ default: mod.TarotCardGuide })),
);

/** Start fetching the guide before it is needed, for example when a gallery opens. */
export function preloadCardGuide() {
  void import('./TarotCardGuide');
}

/** Runs once the guide beside it has rendered, so focus can move to its heading. */
function Shown({ onShown }: { onShown?: () => void }) {
  useEffect(() => onShown?.(), [onShown]);
  return null;
}

/** Moves focus to the card page's heading, which is not otherwise a Tab stop. */
export function focusCardPageHeading(container: RefObject<HTMLElement | null>) {
  const heading = container.current?.querySelector<HTMLElement>('.tarot-guide-name');
  if (!heading) return;
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
}

/**
 * One card's full page (TarotCardGuide), loaded on demand. Both orientations are always
 * offered; `orientation` only chooses which one opens first.
 */
export function TarotCardPage({
  cardId,
  orientation,
  position,
  imageLoader,
  onShown,
}: {
  cardId: string;
  orientation?: Orientation;
  position?: string;
  imageLoader?: (path: string) => string;
  /** Called after the page for this card has rendered. Keep it stable between renders. */
  onShown?: () => void;
}) {
  return (
    <Suspense
      fallback={
        <p className="tarot-card-page-loading" role="status">
          Opening the card…
        </p>
      }
    >
      <Guide
        cardId={cardId}
        orientation={orientation}
        position={position}
        imageLoader={imageLoader}
      />
      <Shown key={cardId} onShown={onShown} />
    </Suspense>
  );
}
