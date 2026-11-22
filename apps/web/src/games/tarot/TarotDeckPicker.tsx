'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type RefObject,
} from 'react';
import { HorizontalRail, TarotCard } from '@games/ui';
import { OracleTableScene } from './OracleTableScene';
import type { Action, ActionOption } from '@games/api-client';

interface TarotDeckPickerProps {
  actions: ActionOption[];
  drawn: number;
  position: string;
  pending: boolean;
  paused: boolean;
  deckRef: RefObject<HTMLDivElement | null>;
  onDraw: (action: Action) => void;
}

/** Rows of overlapped backs. The stylesheet owns the number; this is its first-paint value. */
const DEFAULT_ROWS = 3;

/** Where an arrow key lands. Cards fill each column top to bottom, then the next column. */
export function deckStep(key: string, index: number, count: number, rows: number): number | null {
  const last = count - 1;
  const row = index % rows;
  const steps: Record<string, number> = {
    ArrowRight: index + rows > last ? index : index + rows,
    ArrowLeft: index - rows < 0 ? index : index - rows,
    ArrowDown: row === rows - 1 || index === last ? index : index + 1,
    ArrowUp: row === 0 ? index : index - 1,
    Home: 0,
    End: last,
  };
  return key in steps ? steps[key] : null;
}

export function TarotDeckPicker({
  actions,
  drawn,
  position,
  pending,
  paused,
  deckRef,
  onDraw,
}: TarotDeckPickerProps) {
  // The cards whose lanes are in view: the readout and the oracle's aim follow them.
  const [range, setRange] = useState({ first: 0, last: 0 });
  const [rows, setRows] = useState(DEFAULT_ROWS);
  // How far the deck is scrolled, for the bar a finger can drag.
  const [travel, setTravel] = useState({ left: 0, max: 0 });
  // The deck fans out once when it is laid down, never again as cards regroup.
  const [entering, setEntering] = useState(true);
  const [focusIndex, setFocusIndex] = useState(0);
  // The back that was just chosen stays raised while its draw is saved.
  const [picked, setPicked] = useState<{ turn: number; choice: string } | null>(null);
  const rail = useRef<HTMLDivElement>(null);
  const lastDraw = useRef({ turn: -1, until: 0 });
  const disabled = paused || pending;
  const chosen =
    pending && picked?.turn === drawn
      ? actions.findIndex((opt) => opt.value.choice === picked.choice)
      : -1;
  const roving = Math.min(focusIndex, actions.length - 1);
  const span = range.last - range.first;
  const aim =
    chosen < 0 || span < 1 ? 0 : Math.max(-1, Math.min(1, (2 * (chosen - range.first)) / span - 1));

  useEffect(() => {
    const timer = window.setTimeout(() => setEntering(false), 700);
    return () => window.clearTimeout(timer);
  }, []);

  const viewport = useCallback(
    () => rail.current?.querySelector<HTMLElement>('.tarot-deck') ?? null,
    [],
  );

  // Every remaining card lies in a few overlapped rows, scrolled natively. Which lanes
  // are in view is read back from the layout after a scroll, a resize or a draw.
  const measure = useCallback(() => {
    const view = viewport();
    const fan = deckRef.current?.querySelector<HTMLElement>('.tarot-fan');
    const lanes = deckRef.current?.querySelectorAll<HTMLElement>('[data-card-index]');
    if (!view || !fan || !lanes?.length) return;
    const styled = Number.parseInt(getComputedStyle(fan).getPropertyValue('--fan-rows'), 10);
    if (styled > 0) setRows(styled);
    const bounds = view.getBoundingClientRect();
    let first = -1;
    let last = -1;
    lanes.forEach((lane, index) => {
      const box = lane.getBoundingClientRect();
      const centre = box.left + Math.min(box.width, 44) / 2;
      if (centre < bounds.left || centre > bounds.right) return;
      if (first < 0) first = index;
      last = index;
    });
    if (first < 0) return;
    setRange((current) =>
      current.first === first && current.last === last ? current : { first, last },
    );
    const max = Math.max(0, view.scrollWidth - view.clientWidth);
    const left = Math.min(max, Math.max(0, Math.round(view.scrollLeft)));
    setTravel((current) => (current.left === left && current.max === max ? current : { left, max }));
  }, [deckRef, viewport]);
  const frame = useRef(0);
  const measureSoon = useCallback(() => {
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      measure();
    });
  }, [measure]);
  useLayoutEffect(() => {
    const element = rail.current;
    if (!element) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [measure]);
  useLayoutEffect(() => measure(), [measure, actions.length, rows]);

  // A rejected save re-arms the deck at once, so the same back can be tried again.
  useLayoutEffect(() => {
    if (!pending && lastDraw.current.turn === drawn) lastDraw.current.until = 0;
  }, [pending, drawn]);

  /** `now` is the activating event's own timestamp (the clock performance.now() reads). */
  function draw(index: number, now: number) {
    if (disabled || !actions[index]) return;
    // One click or tap reveals one card. The rest of a double click or a burst of taps
    // is dropped, even when a fast save has already moved on to the next position.
    if (now < lastDraw.current.until) return;
    lastDraw.current = { turn: drawn, until: now + 400 };
    setPicked({ turn: drawn, choice: actions[index].value.choice });
    setFocusIndex(index);
    onDraw(actions[index].value);
  }

  function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (event.repeat && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      return;
    }
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-card-index]');
    if (!target || disabled) return;
    const next = deckStep(event.key, Number(target.dataset.cardIndex), actions.length, rows);
    if (next === null) return;
    event.preventDefault();
    deckRef.current
      ?.querySelector<HTMLButtonElement>(`[data-card-index="${next}"]`)
      ?.focus({ preventScroll: true });
  }

  /** The rail brings a focused lane into view; this brings the rest of its raised back. */
  function showWholeBack(card: HTMLElement) {
    const view = viewport();
    const face = card.querySelector<HTMLElement>('.tarot-fan-face');
    if (!view || !face || !card.matches(':focus-visible')) return;
    const bounds = view.getBoundingClientRect();
    const box = face.getBoundingClientRect();
    const past = box.right - (bounds.right - 6);
    const before = box.left - (bounds.left + 6);
    if (past > 0) view.scrollBy({ left: past, behavior: 'instant' });
    else if (before < 0) view.scrollBy({ left: before, behavior: 'instant' });
  }

  return (
    <section className="tarot-pick-area" aria-busy={pending}>
      <div
        ref={rail}
        className="tarot-fan-stage"
        data-entering={entering || undefined}
        style={{ '--oracle-aim': aim } as CSSProperties}
        onScrollCapture={(event) => {
          if (event.target instanceof HTMLElement && event.target.classList.contains('tarot-deck'))
            measureSoon();
        }}
      >
        <OracleTableScene stage={rail} />
        <HorizontalRail
          label="Choose from your shuffled 78-card deck"
          navigationLabel="tarot cards"
          navigationPosition="below"
          className="tarot-deck-rail"
          viewportClassName="tarot-deck"
          contentClassName="tarot-deck-content"
        >
          <div className="tarot-deck-cards" ref={deckRef} onKeyDown={moveFocus}>
            <div className="tarot-fan">
              {actions.map((option, index) => {
                const row = index % rows;
                const column = Math.floor(index / rows);
                return (
                  <button
                    key={option.value.choice}
                    type="button"
                    className="tarot-card tarot-fan-hit"
                    style={
                      {
                        gridRow: row + 1,
                        gridColumn: column + 1,
                        '--fan-row': row,
                        '--fan-column': column,
                        // Later cards lie on top, so each back shows its left edge, and
                        // each row lies over the one behind it.
                        '--fan-layer': row * 100 + column + 1,
                        // Hand-laid rows: each back sits a touch off true.
                        '--fan-angle': `${(Math.sin(index * 1.7) * 1.3).toFixed(2)}deg`,
                        '--fan-drop': `${((Math.cos(index * 2.3) + 1) * 1.5).toFixed(1)}px`,
                      } as CSSProperties
                    }
                    data-card-index={index}
                    data-row={row}
                    // Nothing overlaps the front row, nor the very last card.
                    data-front-row={row === rows - 1 || index === actions.length - 1 || undefined}
                    data-picked={chosen === index || undefined}
                    aria-label={`Face-down card ${index + 1} of ${actions.length}, for ${position.toLowerCase()}`}
                    tabIndex={index === roving ? 0 : -1}
                    onFocus={(event) => {
                      setFocusIndex(index);
                      showWholeBack(event.currentTarget);
                    }}
                    disabled={disabled}
                    onClick={(event) => draw(index, event.timeStamp)}
                  >
                    <span className="tarot-fan-face" aria-hidden="true">
                      <TarotCard compact />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </HorizontalRail>
        {travel.max > 0 ? (
          <input
            type="range"
            className="tarot-deck-scrub"
            aria-label="Scroll the deck"
            aria-valuetext={`Cards ${range.first + 1} to ${range.last + 1} of ${actions.length}`}
            min={0}
            max={travel.max}
            step={1}
            value={travel.left}
            onChange={(event) => {
              const left = Number(event.currentTarget.value);
              setTravel((current) => ({ ...current, left }));
              viewport()?.scrollTo({ left, behavior: 'instant' });
            }}
          />
        ) : null}
        <p className="tarot-lift-hint" role="status" aria-atomic="true">
          {pending ? (
            'Drawing your card…'
          ) : (
            <>
              <span className="tarot-touch-hint">
                {travel.max > 0 ? 'Swipe the cards or drag the bar. ' : ''}Tap a card to reveal it.
              </span>
              <span className="tarot-pointer-hint">
                Click a card to reveal it, or use the arrow keys and Enter.
              </span>
            </>
          )}
        </p>
        {/* Quiet and not live: every card already says its own place in the deck. */}
        <p className="tarot-deck-range">
          Cards {range.first + 1}–{range.last + 1} of {actions.length}
        </p>
      </div>
    </section>
  );
}
