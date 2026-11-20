'use client';

import {
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
  const [perFan, setPerFan] = useState(2);
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

  useLayoutEffect(() => {
    const element = rail.current;
    if (!element) return;
    // Keep an exposed finger-width strip for each overlapping card, even in a narrow sidebar.
    const measure = () => {
      const width = element.clientWidth;
      const cardWidth = Math.min(144, Math.max(102, width * 0.28));
      setPerFan(Math.max(2, Math.min(16, Math.floor((width - cardWidth * 1.34) / 44) + 1)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

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

  function activate(index: number, clickCount: number) {
    if (disabled || !actions[index]) return;
    const recent = performance.now() < lastDraw.current.until;
    if (recent && (lastDraw.current.turn === drawn || clickCount > 2)) return;
    if (selected !== index) {
      choose(index);
      return;
    }
    lastDraw.current = { turn: drawn, until: performance.now() + 350 };
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
        onScrollCapture={(event) => {
          if (
            event.target instanceof HTMLElement &&
            event.target.classList.contains('tarot-deck')
          ) {
            lowerIfHidden(event.target);
          }
        }}
      >
        <HorizontalRail
          label="Choose from your shuffled 78-card deck"
          navigationLabel="tarot cards"
          navigationPosition="below"
          className="tarot-deck-rail"
          viewportClassName="tarot-deck"
          contentClassName="tarot-deck-content"
        >
          <div className="tarot-deck-cards" ref={deckRef} onKeyDown={moveFocus}>
            {Array.from({ length: Math.ceil(actions.length / perFan) }, (_, page) => {
              const start = page * perFan;
              const group = actions.slice(start, start + perFan);
              const hasLift = selected >= start && selected < start + group.length;
              return (
                <div
                  key={start}
                  data-has-lift={hasLift || undefined}
                  className="tarot-fan"
                  style={{ '--fan-gaps': perFan - 1 } as CSSProperties}
                  onPointerDown={(event) => {
                    ignoreClick.current = false;
                    if (!event.isPrimary || event.button !== 0 || disabled) return;
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
                      // An implicit touch capture can also dispatch a click to the *first* card.
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
                  {group.map((option, local) => {
                    const index = start + local;
                    const curve = group.length === 1 ? 0 : (2 * local) / (group.length - 1) - 1;
                    return (
                      <button
                        key={option.value.choice}
                        type="button"
                        className="tarot-card tarot-fan-hit"
                        style={
                          {
                            '--fan-layer':
                              hasLift && index > selected ? group.length - local : local + 1,
                            '--fan-angle': `${curve * 8}deg`,
                            '--fan-drop': `${curve * curve * 9}px`,
                          } as CSSProperties
                        }
                        data-card-index={index}
                        data-after-lift={(hasLift && index > selected) || undefined}
                        data-preview={
                          (preview?.turn === drawn && preview.index === index) || undefined
                        }
                        aria-label={`Face-down card ${index + 1} of ${actions.length}, for ${position.toLowerCase()}`}
                        aria-pressed={selected === index}
                        aria-describedby={selected === index ? hintId : undefined}
                        tabIndex={index === roving ? 0 : -1}
                        onFocus={() => setFocusIndex(index)}
                        disabled={disabled}
                        onClick={(event) => {
                          if (!event.detail || !ignoreClick.current) activate(index, event.detail);
                          ignoreClick.current = false;
                        }}
                      >
                        <span className="tarot-fan-face" aria-hidden="true">
                          <TarotCard compact />
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </HorizontalRail>
        <p id={hintId} className="tarot-lift-hint" role="status" aria-atomic="true">
          {pending ? (
            'Drawing your card…'
          ) : selected < 0 ? (
            <>
              <span className="tarot-touch-hint">Tap or slide to lift a card.</span>
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
      </div>
    </section>
  );
}
