'use client';

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
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

export function TarotDeckPicker({
  actions,
  drawn,
  position,
  pending,
  paused,
  deckRef,
  onDraw,
}: TarotDeckPickerProps) {
  const hintId = useId();
  // The cards whose lanes are in view: the readout and the oracle's aim follow them.
  const [range, setRange] = useState({ first: 0, last: 0 });
  // The deck fans out once when it is laid down, never again as cards regroup.
  const [entering, setEntering] = useState(true);
  const [focusIndex, setFocusIndex] = useState(0);
  const [lift, setLift] = useState<{ turn: number; choice: string } | null>(null);
  const [preview, setPreview] = useState<{ turn: number; index: number } | null>(null);
  const rail = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ id: number; start: number; scrubbed: boolean } | null>(null);
  const ignoreClick = useRef(false);
  const lastDraw = useRef({ turn: -1, until: 0 });
  const disabled = paused || pending;
  const selected =
    lift?.turn === drawn ? actions.findIndex((opt) => opt.value.choice === lift.choice) : -1;
  const roving = Math.min(focusIndex, actions.length - 1);
  const activeCard = preview?.turn === drawn ? preview.index : selected;
  const span = range.last - range.first;
  const aim =
    activeCard < 0 || span < 1
      ? 0
      : Math.max(-1, Math.min(1, (2 * (activeCard - range.first)) / span - 1));
  const hasLift = selected >= 0;

  useEffect(() => {
    const timer = window.setTimeout(() => setEntering(false), 700);
    return () => window.clearTimeout(timer);
  }, []);

  // One ribbon of every remaining card, scrolled natively. Which lanes are in view is
  // read back from the layout after a scroll, a resize, a lift or a draw.
  const measure = useCallback(() => {
    const viewport = rail.current?.querySelector<HTMLElement>('.tarot-deck');
    const lanes = deckRef.current?.querySelectorAll<HTMLElement>('[data-card-index]');
    if (!viewport || !lanes?.length) return;
    const bounds = viewport.getBoundingClientRect();
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
  }, [deckRef]);
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
  useLayoutEffect(() => measure(), [measure, actions.length, selected]);

  // A very fast response can advance the turn between taps in the same burst.
  // A rejected save instead re-arms the same lifted card for an immediate retry.
  useLayoutEffect(() => {
    if (!pending && lastDraw.current.turn === drawn) lastDraw.current.until = 0;
  }, [pending, drawn]);
  useLayoutEffect(() => {
    gesture.current = null;
    ignoreClick.current = false;
  }, [drawn]);

  function choose(index: number) {
    if (disabled || !actions[index]) return;
    setLift({ turn: drawn, choice: actions[index].value.choice });
    setFocusIndex(index);
  }

  /** `now` is the activating event's own timestamp (the clock performance.now() reads). */
  function activate(index: number, clickCount: number, now: number) {
    if (disabled || !actions[index]) return;
    const recent = now < lastDraw.current.until;
    if (recent && (lastDraw.current.turn === drawn || clickCount > 2)) return;
    if (selected !== index) {
      choose(index);
      return;
    }
    lastDraw.current = { turn: drawn, until: now + 350 };
    onDraw(actions[index].value);
  }

  function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (event.repeat && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      return;
    }
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-card-index]');
    if (!target || disabled) return;
    const index = Number(target.dataset.cardIndex);
    const steps: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowUp: index - 1,
      Home: 0,
      End: actions.length - 1,
    };
    if (!(event.key in steps)) return;
    event.preventDefault();
    const next = Math.min(actions.length - 1, Math.max(0, steps[event.key]));
    deckRef.current
      ?.querySelector<HTMLButtonElement>(`[data-card-index="${next}"]`)
      ?.focus({ preventScroll: true });
  }

  function cardAt(event: PointerEvent<HTMLDivElement>) {
    const card = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLButtonElement>('[data-card-index]');
    return card && event.currentTarget.contains(card) ? Number(card.dataset.cardIndex) : null;
  }

  function lowerIfHidden(viewport: HTMLElement) {
    if (selected < 0) return;
    const card = deckRef.current?.querySelector<HTMLElement>(`[data-card-index="${selected}"]`);
    if (!card) return;
    const bounds = viewport.getBoundingClientRect();
    const lane = card.getBoundingClientRect();
    if (lane.right <= bounds.left || lane.left >= bounds.right) setLift(null);
  }

  function endGesture() {
    gesture.current = null;
    setPreview(null);
  }

  return (
    <section className="tarot-pick-area" aria-busy={pending}>
      <div
        ref={rail}
        className="tarot-fan-stage"
        data-entering={entering || undefined}
        style={{ '--oracle-aim': aim } as CSSProperties}
        onScrollCapture={(event) => {
          if (
            event.target instanceof HTMLElement &&
            event.target.classList.contains('tarot-deck')
          ) {
            lowerIfHidden(event.target);
            measureSoon();
          }
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
            <div
              data-has-lift={hasLift || undefined}
              className="tarot-fan"
              onPointerDown={(event) => {
                ignoreClick.current = false;
                // A finger drags the ribbon (native scrolling). A mouse or pen can
                // press and slide across the backs to lift the one it stops on.
                if (!event.isPrimary || event.button !== 0 || disabled) return;
                if (event.pointerType === 'touch') return;
                const first = cardAt(event);
                if (first === null) return;
                gesture.current = {
                  id: event.pointerId,
                  start: event.clientX,
                  scrubbed: false,
                };
                setPreview({ turn: drawn, index: first });
              }}
              onPointerMove={(event) => {
                const current = gesture.current;
                if (!current || current.id !== event.pointerId) return;
                const index = cardAt(event);
                if (Math.abs(event.clientX - current.start) > 8) current.scrubbed = true;
                if (index !== (preview?.turn === drawn ? preview.index : null))
                  setPreview(index === null ? null : { turn: drawn, index });
              }}
              onPointerUp={(event) => {
                const current = gesture.current;
                if (!current || current.id !== event.pointerId) return;
                if (current.scrubbed) {
                  // The click that follows a slide belongs to the card under the pointer.
                  ignoreClick.current = true;
                  const index = cardAt(event);
                  if (index !== null) choose(index);
                }
                endGesture();
              }}
              onPointerCancel={endGesture}
              onPointerLeave={(event) => {
                if (event.pointerType === 'mouse') endGesture();
              }}
            >
              {actions.map((option, index) => (
                <button
                  key={option.value.choice}
                  type="button"
                  className="tarot-card tarot-fan-hit"
                  style={
                    {
                      // Later cards lie on top, so each back shows its left edge. After a
                      // lifted card the order turns over and each shows its right edge.
                      '--fan-layer':
                        hasLift && index > selected ? actions.length - index : index + 1,
                      // A hand-laid ribbon: each back sits a touch off true.
                      '--fan-angle': `${(Math.sin(index * 1.7) * 1.3).toFixed(2)}deg`,
                      '--fan-drop': `${((Math.cos(index * 2.3) + 1) * 1.5).toFixed(1)}px`,
                    } as CSSProperties
                  }
                  data-card-index={index}
                  data-after-lift={(hasLift && index > selected) || undefined}
                  data-preview={(preview?.turn === drawn && preview.index === index) || undefined}
                  aria-label={`Face-down card ${index + 1} of ${actions.length}, for ${position.toLowerCase()}`}
                  aria-pressed={selected === index}
                  aria-describedby={selected === index ? hintId : undefined}
                  tabIndex={index === roving ? 0 : -1}
                  onFocus={() => setFocusIndex(index)}
                  disabled={disabled}
                  onClick={(event) => {
                    if (!event.detail || !ignoreClick.current)
                      activate(index, event.detail, event.timeStamp);
                    ignoreClick.current = false;
                  }}
                >
                  <span className="tarot-fan-face" aria-hidden="true">
                    <TarotCard compact />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </HorizontalRail>
        <p id={hintId} className="tarot-lift-hint" role="status" aria-atomic="true">
          {pending ? (
            'Drawing your card…'
          ) : selected < 0 ? (
            <>
              <span className="tarot-touch-hint">Swipe to browse. Tap a card to lift it.</span>
              <span className="tarot-pointer-hint">
                Click to lift, or use the arrow keys and Enter.
              </span>
            </>
          ) : (
            <>
              <span className="sr-only">
                Card {selected + 1} of {actions.length} lifted.{' '}
              </span>
              <span className="tarot-touch-hint">Tap the lifted card again to reveal it.</span>
              <span className="tarot-pointer-hint">
                Click the lifted card again or press Enter to reveal it.
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
