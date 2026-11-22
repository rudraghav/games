'use client';
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent as ReactFocusEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { createPortal } from 'react-dom';
import type { TarotCardGuide } from '@games/api-client/card-guide';
import { TarotCard } from '@games/ui';
import { orientationLabel, type Orientation } from './orientation';

/** A drawn card, as much of it as the preview needs. */
export interface PreviewCard {
  id: string;
  label: string;
  /** The one-line meaning for the drawn side. It describes the card until the guide loads. */
  subtitle?: string;
  /** The spread position the card was drawn for, for example "Where you are". */
  position?: string;
  orientation?: Orientation;
}

/** What the preview says: more than the table, clearly less than the card's full page. */
export interface PreviewContent {
  name: string;
  /** "Major Arcana · XIII" or "Suit of Wands · Nine". */
  family: string;
  orientation: Orientation;
  keywords: readonly string[];
  short: string;
  essence: string;
  /** The same extra line in words, for a keyboard or screen reader user. */
  description: string;
}

const suitNames: Record<string, string> = {
  wands: 'Suit of Wands',
  cups: 'Suit of Cups',
  swords: 'Suit of Swords',
  pentacles: 'Suit of Pentacles',
};
/** The preview keeps to a handful of keywords; the card's page lists them all. */
const KEYWORD_LIMIT = 5;

export function tarotPreviewContent(
  guide: TarotCardGuide,
  orientation: Orientation = 'upright',
): PreviewContent {
  const side = guide[orientation];
  const keywords = side.keywords.slice(0, KEYWORD_LIMIT);
  return {
    name: guide.name,
    family:
      guide.arcana === 'major'
        ? `Major Arcana · ${guide.number_label}`
        : `${suitNames[guide.suit ?? ''] ?? 'Minor Arcana'} · ${guide.number_label}`,
    orientation,
    keywords,
    short: side.short,
    essence: guide.essence,
    description: `Keywords: ${keywords.join(', ')}. ${side.short}`,
  };
}

/**
 * The floating panel itself: a larger picture in its drawn orientation, then the card's
 * name and number, how and where it was drawn, a few keywords, the one-line meaning and
 * the essence. Love, work, advice and symbols stay on the card's full page.
 */
export function TarotCardPreviewPanel({
  guide,
  orientation = 'upright',
  position,
  imageLoader,
  panelRef,
}: {
  guide: TarotCardGuide;
  orientation?: Orientation;
  position?: string;
  imageLoader?: (path: string) => string;
  panelRef?: Ref<HTMLDivElement>;
}) {
  const content = tarotPreviewContent(guide, orientation);
  return (
    <div
      className="tarot-preview"
      role="tooltip"
      ref={panelRef}
      data-card={guide.id}
      data-orientation={orientation}
    >
      {/* The picture repeats the card under the pointer: the words beside it carry the rest. */}
      <div className="tarot-preview-stage" aria-hidden="true">
        <TarotCard
          id={guide.id}
          name={guide.name}
          reversed={orientation === 'reversed'}
          imageLoader={imageLoader}
        />
      </div>
      <div className="tarot-preview-head">
        <p className="tarot-preview-family">{content.family}</p>
        <p className="tarot-preview-name">{content.name}</p>
        <p className="tarot-preview-drawn">
          <span className="tarot-preview-orientation">{orientationLabel[orientation]}</span>
          {position ? (
            <span className="tarot-preview-position">
              <span>Drawn as</span> {position}
            </span>
          ) : null}
        </p>
        <ul className="tarot-preview-keywords">
          {content.keywords.map((keyword) => (
            <li key={keyword}>{keyword}</li>
          ))}
        </ul>
      </div>
      <div className="tarot-preview-more">
        <p className="tarot-preview-short">{content.short}</p>
        <p className="tarot-preview-essence">{content.essence}</p>
        <p className="tarot-preview-hint">Click for the full card</p>
      </div>
    </div>
  );
}

/* ---------- Where the panel goes ---------- */

export type PreviewLayout = 'side' | 'stack' | 'compact';
export type PreviewSide = 'right' | 'left' | 'above' | 'below';
export interface PreviewPlacement {
  layout: PreviewLayout;
  side: PreviewSide;
  left: number;
  top: number;
  /** The width the panel was measured at. */
  maxWidth: number;
  /** Set only when no side has room for the whole panel. */
  maxHeight?: number;
}
type Box = { left: number; top: number; right: number; bottom: number };
type Size = { width: number; height: number };

/** The panel never touches the card, even while the card is lifted by its own hover. */
export const PREVIEW_GAP = 12;
/** The panel stays this far inside the viewport. */
export const PREVIEW_MARGIN = 8;
/** The picture-beside-text layout at full size, and the narrowest it is still used at. */
const SIDE_WIDTH = 640;
const SIDE_MIN_WIDTH = 500;
/** The narrow layout: picture and heading on one row, the rest underneath. */
const STACK_WIDTH = 400;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

/**
 * Beside the card when there is room (right first, then left); otherwise above or below
 * it. The panel is always inside the viewport and never over the card it describes.
 * `measure` reports the panel's size in a layout at a given width. The wide layout is
 * tried first, then the narrow one, then a compact one that may be cut short.
 */
export function placePreview(
  anchor: Box,
  viewport: Size,
  measure: (layout: PreviewLayout, maxWidth: number) => Size,
): PreviewPlacement {
  const roomRight = viewport.width - PREVIEW_MARGIN - (anchor.right + PREVIEW_GAP);
  const roomLeft = anchor.left - PREVIEW_GAP - PREVIEW_MARGIN;
  const roomAbove = anchor.top - PREVIEW_GAP - PREVIEW_MARGIN;
  const roomBelow = viewport.height - PREVIEW_MARGIN - (anchor.bottom + PREVIEW_GAP);
  const widest = Math.max(0, viewport.width - PREVIEW_MARGIN * 2);
  const tallest = viewport.height - PREVIEW_MARGIN * 2;
  const centreX = (anchor.left + anchor.right) / 2;
  const centreY = (anchor.top + anchor.bottom) / 2;

  const beside = (layout: PreviewLayout, maxWidth: number): PreviewPlacement | null => {
    const side = roomRight >= maxWidth ? 'right' : roomLeft >= maxWidth ? 'left' : undefined;
    if (!side) return null;
    const size = measure(layout, maxWidth);
    if (size.height > tallest) return null;
    return {
      layout,
      side,
      maxWidth,
      left: side === 'right' ? anchor.right + PREVIEW_GAP : anchor.left - PREVIEW_GAP - size.width,
      top: clamp(
        centreY - size.height / 2,
        PREVIEW_MARGIN,
        viewport.height - PREVIEW_MARGIN - size.height,
      ),
    };
  };
  const stacked = (
    layout: PreviewLayout,
    maxWidth: number,
    cut: boolean,
  ): PreviewPlacement | null => {
    const size = measure(layout, maxWidth);
    const side =
      roomAbove >= size.height
        ? 'above'
        : roomBelow >= size.height
          ? 'below'
          : !cut
            ? undefined
            : roomAbove >= roomBelow
              ? 'above'
              : 'below';
    if (!side) return null;
    const height = Math.max(0, Math.min(size.height, side === 'above' ? roomAbove : roomBelow));
    return {
      layout,
      side,
      maxWidth,
      ...(height < size.height ? { maxHeight: height } : {}),
      left: clamp(
        centreX - size.width / 2,
        PREVIEW_MARGIN,
        Math.max(PREVIEW_MARGIN, viewport.width - PREVIEW_MARGIN - size.width),
      ),
      top: side === 'above' ? anchor.top - PREVIEW_GAP - height : anchor.bottom + PREVIEW_GAP,
    };
  };

  const sideRoom = Math.floor(Math.max(roomRight, roomLeft));
  const narrow = Math.min(STACK_WIDTH, widest);
  return (
    beside('side', SIDE_WIDTH) ??
    (sideRoom >= SIDE_MIN_WIDTH && sideRoom < SIDE_WIDTH ? beside('side', sideRoom) : null) ??
    (widest >= SIDE_MIN_WIDTH ? stacked('side', Math.min(SIDE_WIDTH, widest), false) : null) ??
    beside('stack', narrow) ??
    stacked('stack', narrow, false) ??
    stacked('compact', narrow, true)!
  );
}

/* ---------- The card guide, loaded once a card is on the table ---------- */

type GuideLookup = (cardId: string) => TarotCardGuide | undefined;
let guideLookup: GuideLookup | undefined;
let guideLoading: Promise<void> | undefined;
const guideListeners = new Set<() => void>();

// The guide is about 300 KB of reference text shared with the card's full page. It is
// fetched once the page is idle after a drawn card appears, or at the first sign of
// interest in one, never as part of the first paint.
function loadGuide() {
  guideLoading ??= import('@games/api-client/card-guide')
    .then((guide) => {
      guideLookup = guide.tarotCardGuide;
      guideListeners.forEach((listener) => listener());
    })
    .catch(() => {
      // A failed chunk can be asked for again; the card still opens its full page.
      guideLoading = undefined;
    });
}
function subscribeToGuide(notify: () => void) {
  guideListeners.add(notify);
  const idle =
    typeof window.requestIdleCallback === 'function'
      ? window.requestIdleCallback(loadGuide, { timeout: 2000 })
      : undefined;
  const timer = idle === undefined ? window.setTimeout(loadGuide, 400) : undefined;
  return () => {
    guideListeners.delete(notify);
    if (idle !== undefined) window.cancelIdleCallback(idle);
    window.clearTimeout(timer);
  };
}
const currentGuide = () => guideLookup;
const noGuide = () => undefined;

/* ---------- Showing and hiding ---------- */

const SHOW_DELAY_MS = 120;
/** Moving straight from one card to the next shows its preview at once. */
const SKIP_DELAY_WITHIN_MS = 350;
/** A blur or pointer leave this soon after a press belongs to the dialog that press opened. */
const ACTIVATION_SETTLE_MS = 300;
/**
 * When the card's page closes, focus returns to the card and the browser may report the
 * resting pointer as newly arrived. Neither is a request for the preview.
 */
const AFTER_PAGE_QUIET_MS = 300;
let lastHiddenAt = -Infinity;
// One preview at a time: a card reached by keyboard gives way to one the mouse arrives on.
let hideCurrent: (() => void) | undefined;
// Whether the last thing the user did was press a key: only then does focus show a preview.
let keyboardLast = false;
let modalityUsers = 0;
const sawKey = (event: KeyboardEvent) => {
  if (!event.metaKey && !event.ctrlKey && !event.altKey) keyboardLast = true;
};
const sawPointer = () => {
  keyboardLast = false;
};
function watchModality() {
  if (modalityUsers++ === 0) {
    document.addEventListener('keydown', sawKey, true);
    document.addEventListener('pointerdown', sawPointer, true);
  }
  return () => {
    if (--modalityUsers === 0) {
      document.removeEventListener('keydown', sawKey, true);
      document.removeEventListener('pointerdown', sawPointer, true);
    }
  };
}

function cardButton(target: EventTarget, within: Element) {
  const card = target instanceof Element ? target.closest<HTMLElement>('button.tarot-card') : null;
  return card && within.contains(card) ? card : null;
}
function canHover() {
  return (
    typeof window.matchMedia !== 'function' ||
    window.matchMedia('(hover: hover) and (pointer: fine)').matches
  );
}
function focusRingShown(element: Element) {
  try {
    return element.matches(':focus-visible');
  } catch {
    return true;
  }
}

/**
 * Wraps a drawn card (a `TarotCard` button somewhere inside) and shows its preview while a
 * mouse rests on it or keyboard focus is on it. The preview is supplementary: it never
 * takes focus or a click, a touch or pen never opens it, and pressing the card closes it
 * and opens the card's full page as before. `children` receives the id of a short
 * description to pass to the card as `describedBy`.
 */
export function TarotCardPreview({
  as: Tag = 'div',
  className,
  card,
  paused = false,
  imageLoader,
  children,
}: {
  as?: 'div' | 'header';
  className?: string;
  /** The drawn card inside. Without one this is a plain wrapper. */
  card?: PreviewCard;
  /** True while this card's full page is open: nothing shows until it has closed. */
  paused?: boolean;
  imageLoader?: (path: string) => string;
  children: (describedBy: string | undefined) => ReactNode;
}) {
  const descriptionId = useId();
  const lookup = useSyncExternalStore(subscribeToGuide, currentGuide, noGuide);
  const guide = card ? lookup?.(card.id) : undefined;
  const orientation = card?.orientation ?? 'upright';
  const description = guide
    ? tarotPreviewContent(guide, orientation).description
    : card?.subtitle || undefined;

  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const shown = useRef(false);
  // After a press, nothing shows again until the pointer or focus has left and come back,
  // or the page that press opened has closed.
  const dismissed = useRef(false);
  const pressedAt = useRef(-Infinity);
  const pausedNow = useRef(paused);
  const quietUntil = useRef(-Infinity);
  const blocked = () =>
    dismissed.current || pausedNow.current || performance.now() < quietUntil.current;

  const hide = useCallback(() => {
    window.clearTimeout(timer.current);
    if (shown.current) lastHiddenAt = performance.now();
    shown.current = false;
    if (hideCurrent === hideRef.current) hideCurrent = undefined;
    setAnchor(null);
  }, []);
  const hideRef = useRef(hide);
  const show = useCallback((element: HTMLElement, delay: number) => {
    if (blocked()) return;
    loadGuide();
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      if (!element.isConnected || blocked()) return;
      if (hideCurrent !== hideRef.current) hideCurrent?.();
      hideCurrent = hideRef.current;
      shown.current = true;
      setAnchor(element);
    }, delay);
  }, []);
  const leave = useCallback(() => {
    hide();
    if (!pausedNow.current && performance.now() - pressedAt.current > ACTIVATION_SETTLE_MS)
      dismissed.current = false;
  }, [hide]);
  const press = useCallback(() => {
    dismissed.current = true;
    pressedAt.current = performance.now();
    hide();
  }, [hide]);

  // A press has already put the preview away; this covers a page opened some other way.
  if (paused && anchor) setAnchor(null);
  useEffect(() => {
    if (pausedNow.current && !paused) {
      quietUntil.current = performance.now() + AFTER_PAGE_QUIET_MS;
      dismissed.current = false;
    }
    pausedNow.current = paused;
    if (paused) {
      window.clearTimeout(timer.current);
      shown.current = false;
    }
  }, [paused]);
  useEffect(() => watchModality(), []);
  useEffect(() => {
    const own = hideRef.current;
    return () => {
      window.clearTimeout(timer.current);
      if (hideCurrent === own) hideCurrent = undefined;
    };
  }, []);

  // Anything that moves the card or changes the subject puts the preview away.
  useEffect(() => {
    if (!anchor) return;
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') hide();
    };
    document.addEventListener('keydown', key, true);
    window.addEventListener('scroll', hide, true);
    window.addEventListener('resize', hide);
    window.addEventListener('blur', hide);
    return () => {
      document.removeEventListener('keydown', key, true);
      window.removeEventListener('scroll', hide, true);
      window.removeEventListener('resize', hide);
      window.removeEventListener('blur', hide);
    };
  }, [anchor, hide]);

  // Measured and placed before the first paint, so the panel never jumps.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!anchor || !panel) return;
    const box = anchor.getBoundingClientRect();
    const viewport = {
      width: document.documentElement.clientWidth,
      height: window.innerHeight,
    };
    const placement = placePreview(box, viewport, (layout, maxWidth) => {
      panel.dataset.layout = layout;
      panel.style.maxWidth = `${maxWidth}px`;
      panel.style.maxHeight = '';
      // Layout size: the opening animation scales the panel, which a client rect would see.
      return { width: panel.offsetWidth, height: panel.offsetHeight };
    });
    panel.dataset.layout = placement.layout;
    panel.dataset.side = placement.side;
    panel.style.maxWidth = `${placement.maxWidth}px`;
    panel.style.maxHeight = placement.maxHeight === undefined ? '' : `${placement.maxHeight}px`;
    panel.style.left = `${Math.round(placement.left)}px`;
    panel.style.top = `${Math.round(placement.top)}px`;
    // It grows out of the card it belongs to.
    panel.style.transformOrigin = `${Math.round((box.left + box.right) / 2 - placement.left)}px ${Math.round(
      (box.top + box.bottom) / 2 - placement.top,
    )}px`;
    panel.dataset.placed = 'true';
  }, [anchor, guide, orientation, card?.position]);

  if (!card) return <Tag className={className}>{children(undefined)}</Tag>;
  return (
    <Tag
      className={className}
      data-preview-open={anchor ? 'true' : undefined}
      onPointerOver={(event: ReactPointerEvent<HTMLElement>) => {
        if (event.pointerType !== 'mouse' || !canHover()) return;
        const element = cardButton(event.target, event.currentTarget);
        const from = event.relatedTarget;
        // Moving between the card's own parts is not a new arrival.
        if (!element || (from instanceof Node && element.contains(from))) return;
        show(element, performance.now() - lastHiddenAt < SKIP_DELAY_WITHIN_MS ? 0 : SHOW_DELAY_MS);
      }}
      onPointerOut={(event: ReactPointerEvent<HTMLElement>) => {
        const element = cardButton(event.target, event.currentTarget);
        const to = event.relatedTarget;
        if (!element || (to instanceof Node && element.contains(to))) return;
        leave();
      }}
      onFocus={(event: ReactFocusEvent<HTMLElement>) => {
        const element = cardButton(event.target, event.currentTarget);
        if (!element || event.target !== element) return;
        // The delay lets the browser finish scrolling the focused card into view.
        if (keyboardLast && focusRingShown(element)) show(element, SHOW_DELAY_MS);
      }}
      onBlur={(event: ReactFocusEvent<HTMLElement>) => {
        if (cardButton(event.target, event.currentTarget)) leave();
      }}
      onPointerDown={(event: ReactPointerEvent<HTMLElement>) => {
        if (cardButton(event.target, event.currentTarget)) hide();
      }}
      onClick={(event) => {
        if (cardButton(event.target, event.currentTarget)) press();
      }}
    >
      {children(description ? descriptionId : undefined)}
      {description ? (
        // Hidden text still describes the card that points at it.
        <span id={descriptionId} hidden>
          {description}
        </span>
      ) : null}
      {anchor && guide
        ? createPortal(
            <TarotCardPreviewPanel
              guide={guide}
              orientation={orientation}
              position={card.position}
              imageLoader={imageLoader}
              panelRef={panelRef}
            />,
            document.body,
          )
        : null}
    </Tag>
  );
}
