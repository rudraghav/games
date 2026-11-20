'use client';

import { useEffect, type RefObject } from 'react';

export function OracleTableScene({ stage }: { stage: RefObject<HTMLDivElement | null> }) {
  useEffect(() => {
    const table = stage.current;
    if (!table) return;
    const enabled = matchMedia('(any-hover: hover) and (prefers-reduced-motion: no-preference)');
    let frame = 0;
    let clientX = 0;
    let clientY = 0;

    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      table.style.removeProperty('--oracle-look-x');
      table.style.removeProperty('--oracle-look-y');
    };

    const lightFromPointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !enabled.matches) return;
      clientX = event.clientX;
      clientY = event.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const bounds = table.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        const axis = (fraction: number) => Math.max(-1, Math.min(1, fraction * 2 - 1)).toFixed(3);
        table.style.setProperty('--oracle-look-x', axis((clientX - bounds.left) / bounds.width));
        table.style.setProperty('--oracle-look-y', axis((clientY - bounds.top) / bounds.height));
      });
    };

    const resetForTouch = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') reset();
    };
    table.addEventListener('pointerdown', resetForTouch, { passive: true });
    table.addEventListener('pointermove', lightFromPointer, { passive: true });
    table.addEventListener('pointerleave', reset);
    table.addEventListener('keydown', reset);
    enabled.addEventListener('change', reset);
    return () => {
      reset();
      table.removeEventListener('pointerdown', resetForTouch);
      table.removeEventListener('pointermove', lightFromPointer);
      table.removeEventListener('pointerleave', reset);
      table.removeEventListener('keydown', reset);
      enabled.removeEventListener('change', reset);
    };
  }, [stage]);

  return (
    <div className="tarot-oracle-scene" aria-hidden="true">
      <div className="tarot-oracle-instrument">
        <span className="tarot-oracle-shadow" />
        <span className="tarot-oracle-ring tarot-oracle-ring--far" />
        <span className="tarot-oracle-crystal" />
        <span className="tarot-oracle-ring tarot-oracle-ring--near" />
      </div>
    </div>
  );
}
