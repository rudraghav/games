'use client';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, ChoiceGroup, Modal, TarotCard, tarotArtwork } from '@games/ui';
import { focusCardPageHeading, preloadCardGuide, TarotCardPage } from './TarotCardPage';

export const gallerySuits = [
  { value: 'all', label: 'All 78' },
  { value: 'major', label: 'Major arcana' },
  { value: 'wands', label: 'Wands' },
  { value: 'cups', label: 'Cups' },
  { value: 'swords', label: 'Swords' },
  { value: 'pentacles', label: 'Pentacles' },
] as const;
export type GallerySuit = (typeof gallerySuits)[number]['value'];

/** The cards a filter shows, in the deck's printed order (never the shuffled order). */
export function galleryCards(suit: GallerySuit = 'all') {
  return Object.entries(tarotArtwork)
    .filter(([id]) => suit === 'all' || id.startsWith(`${suit}-`))
    .map(([id, artwork]) => ({ id, name: artwork.name }));
}

/** Where an arrow, Home or End key moves in a grid of `count` cards, `columns` to a row. */
export function galleryStep(key: string, index: number, count: number, columns: number) {
  const next: Record<string, number> = {
    ArrowRight: index + 1,
    ArrowLeft: index - 1,
    ArrowDown: index + columns,
    ArrowUp: index - columns,
    Home: 0,
    End: count - 1,
  };
  if (!(key in next) || count < 1) return null;
  // A step off the last row lands on the last card rather than doing nothing.
  if (key === 'ArrowDown' && next[key] >= count)
    return Math.floor(index / columns) === Math.floor((count - 1) / columns) ? index : count - 1;
  if (key === 'ArrowUp' && next[key] < 0) return index;
  return Math.min(count - 1, Math.max(0, next[key]));
}

/** The neighbouring card within a filter; the ends join so neither button ever disables. */
export function galleryNeighbour(index: number, count: number, direction: 1 | -1) {
  return (index + direction + count) % count;
}

/**
 * "Explore the deck": every card in printed order, filtered by suit. A card opens its
 * full page in the same dialog, showing both orientations and opening on Upright.
 * Nothing here knows the player's shuffled deck, its positions or its orientations.
 */
export function TarotDeckGallery({
  open,
  onOpenChange,
  imageLoader,
  initialCard = null,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageLoader?: (path: string) => string;
  /** A card page to open on, for stories and tests. */
  initialCard?: string | null;
}) {
  const [suit, setSuit] = useState<GallerySuit>('all');
  const [page, setPage] = useState<string | null>(initialCard);
  const [focusId, setFocusId] = useState<string | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const view = useRef<HTMLDivElement>(null);
  // Where the gallery was when a card page opened, to put it back exactly on return.
  const returnTo = useRef<{ top: number; card: string } | null>(null);
  const wasPage = useRef<string | null>(null);
  const cards = galleryCards(suit);
  const index = page ? cards.findIndex((card) => card.id === page) : -1;
  const shown = index >= 0 ? cards[index] : null;
  const roving = cards.some((card) => card.id === focusId) ? focusId : cards[0]?.id;
  const scroller = () => bar.current?.closest<HTMLElement>('.modal') ?? null;
  const cardButton = (id: string) =>
    view.current?.querySelector<HTMLButtonElement>(`li[data-card-id="${id}"] > button`) ?? null;

  useEffect(() => {
    if (open) preloadCardGuide();
  }, [open]);

  // The pinned bar (suit filter, or the card page's controls) sits under the sticky heading.
  useLayoutEffect(() => {
    if (!open) return;
    let observer: ResizeObserver | undefined;
    const frame = requestAnimationFrame(() => {
      const heading = scroller()?.querySelector<HTMLElement>('.modal-heading');
      if (!heading || !bar.current) return;
      const place = () =>
        bar.current?.style.setProperty('--tarot-filter-top', `${heading.offsetHeight}px`);
      place();
      observer = new ResizeObserver(place);
      observer.observe(heading);
    });
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [open, page]);

  // Entering a page starts at its top; leaving restores the gallery's scroll and focus.
  useLayoutEffect(() => {
    const previous = wasPage.current;
    wasPage.current = page;
    const frame = scroller();
    if (!frame || previous === page) return;
    if (page) {
      frame.scrollTop = 0;
      // Hold focus inside the dialog while the page loads; its heading takes it next.
      if (!previous) bar.current?.querySelector<HTMLButtonElement>('button')?.focus();
      return;
    }
    const saved = returnTo.current;
    returnTo.current = null;
    if (saved) frame.scrollTop = saved.top;
    const button = previous ? cardButton(previous) : null;
    // The card that was opened is where it was; a card reached with Next may be off screen.
    button?.focus({ preventScroll: saved?.card === previous });
    if (button && saved?.card !== previous) button.scrollIntoView({ block: 'nearest' });
  }, [page]);

  // Opening a card moves focus to its heading. Previous / Next keep focus on the
  // button, so it can be pressed again; the status line announces the new card.
  const headingNext = useRef(initialCard !== null);
  const showHeading = useCallback(() => {
    if (!headingNext.current) return;
    headingNext.current = false;
    focusCardPageHeading(view);
  }, []);

  function openPage(id: string) {
    returnTo.current = { top: scroller()?.scrollTop ?? 0, card: id };
    headingNext.current = true;
    setFocusId(id);
    setPage(id);
  }
  function back() {
    if (page) setFocusId(page);
    setPage(null);
  }
  function turn(direction: 1 | -1) {
    if (index < 0) return;
    const next = cards[galleryNeighbour(index, cards.length, direction)];
    setPage(next.id);
    const frame = scroller();
    if (frame) frame.scrollTop = 0;
  }
  function moveFocus(event: KeyboardEvent<HTMLUListElement>) {
    const current = (event.target as HTMLElement).closest<HTMLElement>('li[data-card-id]');
    const items = [...event.currentTarget.querySelectorAll<HTMLElement>('li[data-card-id]')];
    const at = current ? items.indexOf(current) : -1;
    if (at < 0) return;
    const firstRow = items[0].getBoundingClientRect().top;
    const columns = items.filter(
      (item) => Math.abs(item.getBoundingClientRect().top - firstRow) < 2,
    ).length;
    const next = galleryStep(event.key, at, items.length, Math.max(1, columns));
    if (next === null) return;
    event.preventDefault();
    items[next].querySelector<HTMLButtonElement>('button')?.focus();
  }

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          returnTo.current = null;
          setPage(null);
        }
        onOpenChange(next);
      }}
      // Escape leaves the card page first; a second Escape closes the dialog.
      onEscapeKeyDown={(event) => {
        if (!page) return;
        event.preventDefault();
        back();
      }}
      title="The whole cosmic cast"
      description="Open any of the 78 cards to read what it means, upright and reversed. Your shuffled cards stay a surprise."
      wide
      stickyHeader
    >
      {shown ? (
        <div className="tarot-deck-filter tarot-gallery-bar" ref={bar}>
          <Button variant="secondary" size="sm" className="tarot-gallery-back" onClick={back}>
            <ArrowLeft size={16} aria-hidden="true" />
            All cards
          </Button>
          <p className="tarot-gallery-place" role="status">
            <span className="sr-only">{shown.name}, </span>
            Card {index + 1} of {cards.length}
          </p>
          <div className="tarot-gallery-turn">
            <Button
              variant="secondary"
              size="icon"
              aria-label="Previous card"
              title="Previous card"
              onClick={() => turn(-1)}
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              aria-label="Next card"
              title="Next card"
              onClick={() => turn(1)}
            >
              <ChevronRight size={18} aria-hidden="true" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="tarot-deck-filter" ref={bar}>
          <ChoiceGroup label="Tarot suit" value={suit} onChange={setSuit} options={gallerySuits} />
        </div>
      )}
      <div className="tarot-gallery-view" ref={view} data-view={shown ? 'card' : 'cards'}>
        {shown ? (
          <TarotCardPage cardId={shown.id} imageLoader={imageLoader} onShown={showHeading} />
        ) : (
          <ul className="tarot-deck-gallery" aria-label="Tarot cards" onKeyDown={moveFocus}>
            {cards.map((card) => (
              <li key={card.id} data-card-id={card.id}>
                <TarotCard
                  id={card.id}
                  name={card.name}
                  imageLoader={imageLoader}
                  tip="Open the card page"
                  // One Tab stop for the grid; arrow keys, Home and End move within it.
                  tabIndex={card.id === roving ? 0 : -1}
                  onFocus={() => setFocusId(card.id)}
                  onClick={() => openPage(card.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
