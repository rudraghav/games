'use client';
import { useState, useSyncExternalStore } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, Link2, Share2, Smartphone } from 'lucide-react';
import { Avatar, Button, Ticket } from '@games/ui';
import type { Match, Room, SantaDetails, SantaLink } from '@games/api-client';
import { api } from '@/lib/session';
import { usePrivateViewScope } from '@/shared/use-private-view-scope';
import { canDo, santaLinkPath, santaShareText } from './santa-actions';

const never = () => () => undefined;

/** The query that holds the organiser's links for one draw of one event. */
export function santaLinksKey(roomId: string, matchId: string | null | undefined, draw: number) {
  return ['secret-santa-links', roomId, matchId ?? '', draw] as const;
}

/**
 * One row per person: whether they have opened their link, and three ways to
 * give it to them. The page lists people and links only. It never lists who
 * drew whom, and a link is written into the page only when this browser cannot
 * copy it for the organiser.
 */
export function SantaLinks({
  detail,
  match,
  room,
  selfId,
  paused,
  onShow,
}: {
  detail: SantaDetails;
  match: Match;
  room: Room;
  selfId: string;
  paused: boolean;
  /** Start the pass-the-phone reveal for this person. */
  onShow: (personId: string) => void;
}) {
  const scope = usePrivateViewScope(selfId);
  const origin = useSyncExternalStore(
    never,
    () => window.location.origin,
    () => '',
  );
  const canShare = useSyncExternalStore(
    never,
    () => typeof navigator.share === 'function',
    () => false,
  );
  // New links exist after every draw, so the draw number is part of the key.
  const links = useQuery<SantaLink[]>({
    queryKey: [...santaLinksKey(room.id, room.matchId, detail.drawNumber), scope],
    queryFn: () => api.santaLinks(room.id),
    enabled: detail.drawn && !!scope,
    staleTime: Infinity,
    gcTime: 0,
  });
  const [copied, setCopied] = useState('');
  const [status, setStatus] = useState('');
  // Shown only when this browser cannot copy: the address to select by hand.
  const [manual, setManual] = useState('');
  const tokens = new Map((links.data ?? []).map((link) => [link.id, link.token]));
  const opened = detail.people.filter((person) => person.opened).length;
  const address = (personId: string) => {
    const token = tokens.get(personId);
    return token && origin ? `${origin}${santaLinkPath(token)}` : '';
  };
  async function copy(personId: string, name: string) {
    const url = address(personId);
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setManual('');
      setCopied(personId);
      const done = `Link for ${name} copied.`;
      setStatus(done);
      window.setTimeout(() => {
        setCopied((current) => (current === personId ? '' : current));
        setStatus((current) => (current === done ? '' : current));
      }, 4000);
    } catch {
      setCopied('');
      setManual(personId);
      setStatus(`Copying isn’t available here. Select the link for ${name} instead.`);
    }
  }
  async function share(personId: string, name: string) {
    const url = address(personId);
    if (!url) return;
    try {
      await navigator.share({
        title: detail.title || 'Secret Santa',
        text: santaShareText(name, detail.title),
        url,
      });
      setStatus(`Link for ${name} shared.`);
    } catch (failure) {
      // Closing the share sheet is a choice, not a problem to report.
      if (failure instanceof DOMException && failure.name === 'AbortError') return;
      setStatus('Sharing didn’t open. Copy the link instead.');
    }
  }
  const ready = links.isSuccess;
  return (
    <section className="santa-card santa-links" aria-labelledby="santa-links-title">
      <div className="santa-card__heading">
        <h3 id="santa-links-title">Share each person’s link</h3>
        <span className="santa-count">
          {opened} of {detail.people.length} opened
        </span>
      </div>
      <p className="small muted santa-card__lead">
        Each link shows one person the name they drew. Send it to them, or show it on this phone.
      </p>
      {links.isError ? (
        <div className="error-note santa-links-error" role="alert">
          <span>The links couldn’t load.</span>
          <Button
            size="sm"
            variant="secondary"
            pending={links.isFetching}
            onClick={() => void links.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : null}
      <ul className="santa-link-list">
        {detail.people.map((person, index) => {
          const hasLink = ready && tokens.has(person.id);
          return (
            <Ticket
              as="li"
              shape="tag"
              className="santa-link"
              key={person.id}
              data-opened={person.opened}
              variant={person.opened ? 'success' : 'default'}
              stubClassName="santa-link__actions"
              stub={
                <>
                  {canShare ? (
                    <Button
                      size="sm"
                      aria-label={`Share link for ${person.name}`}
                      disabled={!hasLink}
                      onClick={() => void share(person.id, person.name)}
                    >
                      <Share2 size={15} aria-hidden="true" />
                      Share
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant={canShare ? 'secondary' : 'primary'}
                    aria-label={
                      copied === person.id
                        ? `Link copied for ${person.name}`
                        : `Copy link for ${person.name}`
                    }
                    disabled={!hasLink}
                    onClick={() => void copy(person.id, person.name)}
                  >
                    {copied === person.id ? (
                      <Check size={15} aria-hidden="true" />
                    ) : (
                      <Link2 size={15} aria-hidden="true" />
                    )}
                    {copied === person.id ? 'Link copied' : 'Copy link'}
                  </Button>
                  {canDo(match, 'reveal', person.id) ? (
                    <Button
                      id={`santa-show-${person.id}`}
                      size="sm"
                      variant="secondary"
                      aria-label={`Show on this phone for ${person.name}`}
                      disabled={paused}
                      onClick={() => onShow(person.id)}
                    >
                      <Smartphone size={15} aria-hidden="true" />
                      Show on this phone
                    </Button>
                  ) : null}
                </>
              }
            >
              <span aria-hidden="true">
                <Avatar name={person.name} seed={index} size="sm" />
              </span>
              <div className="santa-link__who">
                <strong>{person.name}</strong>
                <span className="santa-opened" data-opened={person.opened}>
                  {person.opened ? (
                    <>
                      <Check size={13} aria-hidden="true" /> Opened
                    </>
                  ) : (
                    'Not opened yet'
                  )}
                </span>
              </div>
              {manual === person.id ? (
                <input
                  className="input santa-link__manual"
                  readOnly
                  aria-label={`Link for ${person.name}`}
                  value={address(person.id)}
                  onFocus={(event) => event.target.select()}
                />
              ) : null}
            </Ticket>
          );
        })}
      </ul>
      <p className="small santa-status" role="status">
        {status || (links.isPending && detail.drawn ? 'Getting the links…' : '')}
      </p>
    </section>
  );
}
