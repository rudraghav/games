import type { ReactNode } from 'react';
import Link from 'next/link';
import { EyeOff, Gift } from 'lucide-react';
import { Button, Ticket, Wordmark } from '@games/ui';
import type { SantaReveal } from '@games/api-client';
import { SantaArtwork } from '@/shared/SantaArtwork';
import { formatDay } from '@/games/secret-santa/santa-date';

/** Every state the private link page can be in. Only `ready` carries a draw. */
export type SantaLinkState =
  | { kind: 'loading' }
  | { kind: 'invalid' }
  | { kind: 'limited' }
  | { kind: 'failed' }
  | { kind: 'ready'; reveal: SantaReveal };

/**
 * The page's card is a gift tag: an eyelet at the top, and for someone with a
 * draw, a tear-off part that holds the one action and the event details.
 */
function Shell({
  children,
  stub,
  foot,
}: {
  children: ReactNode;
  stub?: ReactNode;
  foot?: ReactNode;
}) {
  return (
    <main className="santa-page">
      {/* Leaving this page never tells the next one which link was open. */}
      <Link
        href="/"
        prefetch={false}
        referrerPolicy="no-referrer"
        rel="noreferrer"
        aria-label="Games home"
      >
        <Wordmark />
      </Link>
      <Ticket
        as="section"
        className="santa-page__card"
        layout="column"
        shape="tag"
        stub={stub}
        stubClassName="santa-page__stub"
      >
        {children}
      </Ticket>
      <footer className="santa-page__foot small muted">{foot}</footer>
    </main>
  );
}

/**
 * One person's private page. The name they drew is put on screen only after
 * they tap, so opening the link in company does not give it away. The page
 * links to nothing that belongs to the organiser.
 */
export function SantaLinkView({
  state,
  shown,
  retrying = false,
  onShow,
  onHide,
  onRetry,
}: {
  state: SantaLinkState;
  /** Whether the person has tapped to see the name. */
  shown: boolean;
  retrying?: boolean;
  onShow: () => void;
  onHide: () => void;
  onRetry: () => void;
}) {
  if (state.kind === 'loading')
    return (
      <Shell>
        <div className="santa-page__art">
          <SantaArtwork />
        </div>
        <h1 className="heading-md">Secret Santa</h1>
        <p className="muted" role="status">
          Opening your link…
        </p>
      </Shell>
    );
  if (state.kind === 'invalid')
    return (
      <Shell>
        <h1 className="heading-md">This link doesn’t work any more</h1>
        <p className="muted" role="alert">
          It may be mistyped, or the names were drawn again and everyone got a new link. Ask the
          person who organised your Secret Santa to send you the new one.
        </p>
      </Shell>
    );
  if (state.kind === 'limited')
    return (
      <Shell>
        <h1 className="heading-md">Too many tries</h1>
        <p className="muted" role="alert">
          Too many links that don’t work were opened from here. Wait ten minutes, then open your own
          link again.
        </p>
      </Shell>
    );
  if (state.kind === 'failed')
    return (
      <Shell>
        <h1 className="heading-md">Your link didn’t open</h1>
        <p className="muted" role="alert">
          Check your connection and try again. Your link still works.
        </p>
        <Button size="lg" pending={retrying} onClick={onRetry}>
          Try again
        </Button>
      </Shell>
    );
  const { reveal } = state;
  const date = formatDay(reveal.day);
  const details: [string, string][] = [
    ['Event', reveal.title],
    ['Date', date],
    ['Where', reveal.location],
    ['Budget', reveal.budget],
  ];
  return (
    <Shell
      stub={
        shown ? (
          <>
            <dl className="santa-page__details">
              {details
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
            </dl>
            <Button variant="secondary" onClick={onHide}>
              <EyeOff size={17} aria-hidden="true" />
              Hide the name
            </Button>
          </>
        ) : (
          <Button size="lg" id="santa-page-show" onClick={onShow}>
            <Gift size={18} aria-hidden="true" />
            Show who I’m buying for
          </Button>
        )
      }
      foot={
        <>
          <span>This link is yours. Anyone who has it can see the name, so don’t pass it on.</span>
          <Link href="/" prefetch={false} referrerPolicy="no-referrer" rel="noreferrer">
            Organise your own Secret Santa
          </Link>
        </>
      }
    >
      {shown ? (
        <>
          <p className="eyebrow">{reveal.giverName}, you’re buying a gift for</p>
          <h1 className="santa-page__name" translate="no" tabIndex={-1} id="santa-page-name">
            {reveal.recipientName}
          </h1>
          <p className="muted">Keep it to yourself until the day.</p>
        </>
      ) : (
        <>
          <div className="santa-page__art">
            <SantaArtwork />
          </div>
          <p className="eyebrow">{reveal.title || 'Secret Santa'}</p>
          <h1 className="heading-md">Hi {reveal.giverName}</h1>
          <p className="muted">
            You’re part of a Secret Santa. Make sure nobody else can see your screen, then tap to
            find out who you’re buying for.
          </p>
        </>
      )}
    </Shell>
  );
}
