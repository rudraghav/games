'use client';
import { useEffect, useRef } from 'react';
import { EyeOff, Gift } from 'lucide-react';
import { Button } from '@games/ui';

/**
 * The pass-the-phone reveal, as one full-width card in three steps: hand the
 * phone over, see the name, hide it. The name is in the page only during the
 * middle step, after the person holding the phone says who they are.
 */
export function SantaPassPhone({
  giverName,
  recipientName,
  step,
  paused,
  onConfirm,
  onHide,
}: {
  giverName: string;
  /** Present only while the server is showing this person's draw. */
  recipientName: string | null;
  step: 'handover' | 'waiting' | 'shown' | 'hiding';
  paused: boolean;
  onConfirm: () => void;
  onHide: () => void;
}) {
  const card = useRef<HTMLElement>(null);
  useEffect(() => {
    // Each step replaces the last one on screen; keep keyboard and reader users with it.
    card.current?.focus({ preventScroll: true });
    card.current?.scrollIntoView({
      block: 'nearest',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }, [step]);
  return (
    <section
      ref={card}
      tabIndex={-1}
      className="santa-pass"
      data-step={step}
      aria-labelledby="santa-pass-title"
      aria-live="polite"
    >
      <span className="santa-pass__icon" aria-hidden="true">
        {step === 'shown' ? <Gift size={26} /> : <EyeOff size={26} />}
      </span>
      {step === 'shown' && recipientName ? (
        <>
          <p className="eyebrow">{giverName}, you’re buying a gift for</p>
          <h3 id="santa-pass-title" className="santa-pass__name" translate="no">
            {recipientName}
          </h3>
          <p className="muted">Keep it to yourself. Tap Hide before you hand the phone back.</p>
          <Button size="lg" disabled={paused} onClick={onHide}>
            <EyeOff size={18} aria-hidden="true" />
            Hide
          </Button>
        </>
      ) : step === 'hiding' ? (
        <>
          <p className="eyebrow">Pass the phone</p>
          <h3 id="santa-pass-title" className="heading-md">
            Hidden
          </h3>
          <p className="muted">You can hand the phone back now.</p>
        </>
      ) : (
        <>
          <p className="eyebrow">Pass the phone</p>
          <h3 id="santa-pass-title" className="heading-md">
            Hand the phone to {giverName}
          </h3>
          <p className="muted">Only {giverName} should look at the screen for the next step.</p>
          <Button size="lg" pending={step === 'waiting'} disabled={paused} onClick={onConfirm}>
            I’m {giverName}, show who I drew
          </Button>
          <Button variant="ghost" disabled={paused} onClick={onHide}>
            Cancel
          </Button>
        </>
      )}
    </section>
  );
}
