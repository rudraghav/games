'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Tip = { text: string; x: number; y: number; below: boolean };
const SELECTOR = '[data-tip], button[title], a[title], [role="img"][title], summary[title]';
const SHOW_DELAY_MS = 350;

/**
 * One tooltip for the whole app. Any element with `data-tip`, and any control that
 * already carries a `title`, gets the same styled bubble on hover or keyboard focus.
 * The tip only repeats or expands a visible or accessible name, so it stays out of the
 * accessibility tree; touch pointers never open it.
 */
export function TooltipLayer() {
  const [tip, setTip] = useState<Tip | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const owner = useRef<Element | null>(null);
  useEffect(() => {
    const restore = () => {
      const element = owner.current;
      const title = element?.getAttribute('data-tip-title');
      // The native title returns once the pointer leaves, for tools that read it.
      if (element && title !== null && title !== undefined) {
        element.setAttribute('title', title);
        element.removeAttribute('data-tip-title');
      }
      owner.current = null;
    };
    const hide = () => {
      window.clearTimeout(timer.current);
      restore();
      setTip(null);
    };
    const show = (target: EventTarget | null, delay: number) => {
      const element = target instanceof Element ? target.closest(SELECTOR) : null;
      if (!element || element === owner.current) return;
      hide();
      const text = element.getAttribute('data-tip') || element.getAttribute('title') || '';
      // A tip that only repeats the control's visible words adds nothing.
      if (!text.trim() || text.trim() === element.textContent?.trim()) return;
      owner.current = element;
      if (element.hasAttribute('title')) {
        element.setAttribute('data-tip-title', element.getAttribute('title') || '');
        element.removeAttribute('title');
      }
      timer.current = window.setTimeout(() => {
        if (!element.isConnected) return hide();
        const box = element.getBoundingClientRect();
        const below = box.top < 56;
        setTip({
          text,
          x: Math.min(Math.max(box.left + box.width / 2, 12), window.innerWidth - 12),
          y: below ? box.bottom + 8 : box.top - 8,
          below,
        });
      }, delay);
    };
    const over = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      show(event.target, SHOW_DELAY_MS);
    };
    const out = (event: PointerEvent) => {
      const next = event.relatedTarget;
      if (owner.current && !(next instanceof Node && owner.current.contains(next))) hide();
    };
    const focus = (event: FocusEvent) => {
      if (event.target instanceof Element && event.target.matches(':focus-visible'))
        show(event.target, 0);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') hide();
    };
    document.addEventListener('pointerover', over);
    document.addEventListener('pointerout', out);
    document.addEventListener('pointerdown', hide);
    document.addEventListener('focusin', focus);
    document.addEventListener('focusout', hide);
    document.addEventListener('keydown', key);
    window.addEventListener('scroll', hide, true);
    return () => {
      hide();
      document.removeEventListener('pointerover', over);
      document.removeEventListener('pointerout', out);
      document.removeEventListener('pointerdown', hide);
      document.removeEventListener('focusin', focus);
      document.removeEventListener('focusout', hide);
      document.removeEventListener('keydown', key);
      window.removeEventListener('scroll', hide, true);
    };
  }, []);
  if (!tip) return null;
  return createPortal(
    <div
      className="tooltip"
      data-below={tip.below || undefined}
      style={{ left: tip.x, top: tip.y }}
      aria-hidden="true"
    >
      {tip.text}
    </div>,
    document.body,
  );
}
