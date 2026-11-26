'use client';
import Link from 'next/link';
import { Button, Wordmark } from '@games/ui';

/**
 * Shown once per room (per tab) before anything of a room that uses the 18+
 * edition: no lobby, table, chat or prompt appears until the viewer continues.
 */
export function AdultsOnlyGate({
  gameName,
  onContinue,
  onLeave,
  leaving,
}: {
  gameName: string;
  onContinue: () => void;
  onLeave: () => void;
  leaving: boolean;
}) {
  return (
    <main className="center-state adults-gate" aria-labelledby="adults-gate-title">
      <Link href="/">
        <Wordmark />
      </Link>
      <span className="adults-badge">18+</span>
      <h1 className="heading-md" id="adults-gate-title">
        This room uses the 18+ edition. Continue?
      </h1>
      <p className="muted">
        {gameName}’s naughty edition has prompts for adults only. Continue only if you are 18 or
        older. Anyone can pass on any prompt.
      </p>
      <div className="adults-gate__actions">
        <Button onClick={onContinue} disabled={leaving}>
          Continue
        </Button>
        <Button variant="secondary" pending={leaving} onClick={onLeave}>
          Leave the room
        </Button>
      </div>
    </main>
  );
}
