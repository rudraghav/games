'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { BookmarkCheck, Check, Copy, Share2 } from 'lucide-react';
import { Button } from '@games/ui';

const noSubscription = () => () => {};

/**
 * Copy or share the reading as plain text, and open its saved copy. Nothing is sent
 * anywhere unless the viewer chooses a target in their own device's share sheet.
 */
export function ReadingShare({
  text,
  title,
  savedHref,
}: {
  text: () => string;
  title: string;
  savedHref?: string;
}) {
  const [note, setNote] = useState<'' | 'copied' | 'failed'>('');
  // The server and first client render agree on "no share sheet"; the browser then answers.
  const canShare = useSyncExternalStore(
    noSubscription,
    () => typeof navigator.share === 'function',
    () => false,
  );
  useEffect(() => {
    if (!note) return;
    const timer = window.setTimeout(() => setNote(''), 2500);
    return () => window.clearTimeout(timer);
  }, [note]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text());
      setNote('copied');
    } catch {
      setNote('failed');
    }
  }
  async function share() {
    try {
      await navigator.share({ title, text: text() });
    } catch {
      // Closing the share sheet is not an error worth reporting.
    }
  }
  return (
    <div className="tarot-reading-actions" role="group" aria-label="Keep this reading">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        data-copied={note === 'copied' || undefined}
        onClick={() => void copy()}
      >
        {note === 'copied' ? (
          <Check size={15} aria-hidden="true" />
        ) : (
          <Copy size={15} aria-hidden="true" />
        )}
        {note === 'copied' ? 'Copied' : 'Copy reading'}
      </Button>
      {canShare ? (
        <Button type="button" variant="secondary" size="sm" onClick={() => void share()}>
          <Share2 size={15} aria-hidden="true" />
          Share
        </Button>
      ) : null}
      {savedHref ? (
        <Link
          href={savedHref}
          className="button button--ghost button--sm"
          data-tip="Saved privately to your profile"
        >
          <BookmarkCheck size={15} aria-hidden="true" />
          Saved reading
        </Link>
      ) : null}
      <p className="sr-only" role="status" aria-live="polite">
        {note === 'copied'
          ? 'Reading copied.'
          : note === 'failed'
            ? 'Copy isn’t available here.'
            : ''}
      </p>
      {note === 'failed' ? (
        <p className="small tarot-reading-actions-note" aria-hidden="true">
          Copy isn’t available here.
        </p>
      ) : null}
    </div>
  );
}
