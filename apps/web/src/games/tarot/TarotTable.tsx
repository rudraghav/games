'use client';
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useReducedMotion } from 'motion/react';
import { Sparkles, ArrowRight, ArrowUp, RotateCcw } from 'lucide-react';
import { Button, ChoiceGroup, Modal, HorizontalRail, TarotCard, tarotArtwork } from '@games/ui';
import { ApiError, type AstrologyInput, type AstrologyChart as ChartData } from '@games/api-client';
import { api } from '@/lib/session';
import { keys } from '@/shared/query-keys';
import type { TableProps } from '../types';
import { useTableDraft } from '../shared/table-draft';
import { TarotReading } from './TarotReading';
import { AstrologyForm } from './AstrologyForm';

const positions = ['Where you are', 'What is shifting', 'Your next move'];
export function TarotTable({ match, room, selfId, onAction, pending, imageLoader }: TableProps) {
  // The unsent question survives a refresh in this tab, for this spread only.
  const [questionDraft, setQuestion] = useTableDraft<string | null>(
    `tarot-question:${room.id}:${room.matchId}`,
    null,
  );
  const [astrology, setAstrology] = useState<AstrologyInput>();
  const [astrologyChoice, setAstrologyChoice] = useState<'auto' | 'off' | 'new'>('auto');
  const [chart, setChart] = useState<ChartData | null>(null);
  const [exploreDeck, setExploreDeck] = useState(false);
  const [deckSuit, setDeckSuit] = useState('all');
  const [deckFocus, setDeckFocus] = useState(0);
  const [drawnNote, setDrawnNote] = useState('');
  const [fresh, setFresh] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const slots = useRef<(HTMLDivElement | null)[]>([]);
  const deck = useRef<HTMLDivElement>(null);
  const filter = useRef<HTMLDivElement>(null);
  const cache = useQueryClient();
  const queryKey = ['tarot-reading', room.id, room.matchId];
  const saved = useQuery({
    queryKey,
    queryFn: () => api.reading(room.id),
    enabled: match.community.length === 3,
    refetchInterval: (query) => (query.state.data?.status === 'generating' ? 3000 : false),
  });
  // An explicit empty draft is a user's edit; a missing draft restores the saved question.
  const question = questionDraft ?? saved.data?.question ?? '';
  const reuseSavedAstrology =
    astrologyChoice === 'auto' && !astrology && !!saved.data?.astrology_chart;
  const generate = useMutation({
    mutationFn: () =>
      api.generateReading(room.id, room.matchId!, question, astrology, reuseSavedAstrology),
    onSuccess: (result) => {
      setQuestion(null);
      setAstrology(undefined);
      setAstrologyChoice('auto');
      setChart(null);
      cache.setQueryData(queryKey, result);
      void cache.invalidateQueries({ queryKey: keys.room(room.id) });
    },
    onError: () => {
      void cache.invalidateQueries({ queryKey });
    },
  });
  // A solo reading starts its next spread in one tap: ready, then start, as room creation does.
  const again = useMutation({
    mutationFn: async () => {
      await api.ready(room.id, true);
      return api.start(room.id);
    },
    onSuccess: (next) => cache.setQueryData(keys.room(room.id), next),
    onError: () => void cache.invalidateQueries({ queryKey: keys.room(room.id) }),
  });
  const reading = saved.data?.reading;
  const writing = generate.isPending || saved.data?.status === 'generating';
  const unavailable = saved.data?.status === 'unavailable';
  const drawn = match.community.length;
  const canDrawAgain =
    room.status === 'finished' && room.ownerId === selfId && match.phase !== 'choosing';

  // Reveal each pick where it lands: the spread slot scrolls into view, takes focus
  // and its card is announced. A refresh starts from the saved spread without a reveal.
  const seen = useRef(drawn);
  useEffect(() => {
    if (drawn > seen.current) {
      const index = drawn - 1;
      const slot = slots.current[index];
      slot?.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
      slot?.focus({ preventScroll: true });
      setFresh(index);
      setDrawnNote(
        `You drew ${match.community[index].label} for ${positions[index].toLowerCase()}.`,
      );
    }
    seen.current = drawn;
  }, [drawn, match.community, reduced]);
  useEffect(() => {
    if (fresh === null) return;
    const timer = window.setTimeout(() => setFresh(null), 4000);
    return () => window.clearTimeout(timer);
  }, [fresh]);

  // The gallery's suit filter stays reachable below the sticky dialog heading.
  useLayoutEffect(() => {
    if (!exploreDeck) return;
    let observer: ResizeObserver | undefined;
    const frame = requestAnimationFrame(() => {
      const heading = filter.current
        ?.closest('.modal')
        ?.querySelector<HTMLElement>('.modal-heading');
      if (!heading || !filter.current) return;
      const place = () =>
        filter.current?.style.setProperty('--tarot-filter-top', `${heading.offsetHeight}px`);
      place();
      observer = new ResizeObserver(place);
      observer.observe(heading);
    });
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [exploreDeck]);

  const deckCards = () =>
    Array.from(deck.current?.querySelectorAll<HTMLButtonElement>('button.tarot-card') || []);
  const focusDeck = (index: number) => {
    const cards = deckCards();
    if (!cards.length) return;
    const next = Math.max(0, Math.min(cards.length - 1, index));
    setDeckFocus(next);
    cards[next].focus({ preventScroll: true });
    cards[next].scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };
  // One Tab stop for the whole deck; arrow keys, Home and End move between cards.
  const deckKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = deckCards().indexOf(event.target as HTMLButtonElement);
    if (index < 0) return;
    const step: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowUp: index - 1,
      Home: 0,
      End: Infinity,
    };
    if (!(event.key in step)) return;
    event.preventDefault();
    focusDeck(step[event.key]);
  };
  const rovingIndex = Math.min(deckFocus, Math.max(0, match.actions.length - 1));
  const drawAgain = canDrawAgain ? (
    <Button
      size="lg"
      className="tarot-draw-again"
      pending={again.isPending}
      disabled={room.paused}
      onClick={() => again.mutate()}
    >
      <RotateCcw size={17} />
      Draw a new spread
    </Button>
  ) : null;
  return (
    <div className="tarot-table stable-tarot-table" data-phase={match.phase}>
      <div className="tarot-intro">
        <p className="eyebrow">Three-card reading</p>
        <h2>
          {reading
            ? reading.title
            : match.phase === 'choosing'
              ? 'Pick three cards'
              : 'Your three-card spread'}
        </h2>
        <p>
          {reading
            ? reading.introduction
            : match.phase === 'choosing'
              ? 'Choose three cards, then add an optional question.'
              : 'Add an optional question for your reading.'}
        </p>
        <div className="tarot-intro-actions">
          {drawAgain}
          <Button variant="ghost" onClick={() => setExploreDeck(true)}>
            Explore the deck
          </Button>
        </div>
        {again.error ? (
          <p className="error-note" role="alert">
            A new spread could not start. {again.error.message}
          </p>
        ) : null}
      </div>
      <div className="tarot-spread">
        {positions.map((position, i) => {
          const card = match.community[i];
          const next = match.phase === 'choosing' && i === drawn;
          return (
            <div
              className="tarot-spread-slot"
              key={position}
              ref={(element) => {
                slots.current[i] = element;
              }}
              tabIndex={card ? -1 : undefined}
              data-fresh={fresh === i || undefined}
              data-next={next || undefined}
              aria-label={
                card
                  ? `Card ${i + 1}, ${position}: ${card.label}. ${card.subtitle || ''}`.trim()
                  : undefined
              }
            >
              <p className="eyebrow">
                0{i + 1} · {position}
              </p>
              {card ? (
                <TarotCard id={card.id} name={card.label} imageLoader={imageLoader} />
              ) : (
                <div className="tarot-slot-empty" aria-hidden="true">
                  <span>{next ? 'Your next card lands here' : 'Lands here'}</span>
                </div>
              )}
              <p className="tarot-card-meaning" aria-hidden={!card}>
                {card?.subtitle || ' '}
              </p>
            </div>
          );
        })}
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {drawnNote}
      </p>
      {match.phase === 'choosing' ? (
        <>
          {drawn ? (
            <div className="tarot-back-to-deck">
              <Button variant="secondary" onClick={() => focusDeck(rovingIndex)}>
                <ArrowUp size={16} />
                Choose card {drawn + 1} of 3
              </Button>
            </div>
          ) : null}
          <section className="tarot-pick-area">
            <div className="section-heading">
              <h3>
                Choose card {drawn + 1} of 3 · {positions[drawn]}
              </h3>
              <p className="small muted">Tap any face-down card. It lands in the spread.</p>
            </div>
            <HorizontalRail
              label="Choose from your shuffled 78-card deck"
              navigationLabel="tarot cards"
              className="tarot-deck-rail"
              viewportClassName="tarot-deck"
              contentClassName="tarot-deck-content"
            >
              <div className="tarot-deck-cards" ref={deck} onKeyDown={deckKeys}>
                {match.actions.map((option, index) => (
                  <TarotCard
                    compact
                    key={option.value.choice}
                    label={`Face-down card ${index + 1} of ${match.actions.length}, for ${positions[drawn].toLowerCase()}`}
                    tabIndex={index === rovingIndex ? 0 : -1}
                    onFocus={() => setDeckFocus(index)}
                    onClick={() => onAction(option.value)}
                    disabled={pending || room.paused}
                  />
                ))}
              </div>
            </HorizontalRail>
            <p className="small muted">Use the arrows, arrow keys or scroll to see more cards.</p>
          </section>
        </>
      ) : reading ? (
        <>
          <TarotReading reading={reading} cards={match.community} imageLoader={imageLoader} />
          {drawAgain ? (
            <div className="tarot-again">
              <p className="small muted">Ready for another question?</p>
              {drawAgain}
            </div>
          ) : null}
        </>
      ) : (
        <form
          className="tarot-question"
          onSubmit={(event) => {
            event.preventDefault();
            if (astrology && !chart) return;
            generate.mutate();
          }}
        >
          <label className="field">
            What’s on your mind? <span className="muted small">Optional</span>
            <textarea
              className="input"
              maxLength={400}
              rows={3}
              placeholder="What would you like to reflect on?"
              value={question}
              aria-describedby="tarot-data-use"
              onChange={(event) => setQuestion(event.target.value)}
              disabled={writing}
            />
          </label>
          <AstrologyForm
            searchPlaces={(query) => api.astrologyPlaces(room.id, room.matchId!, query)}
            calculateChart={(input) => api.astrologyChart(room.id, room.matchId!, input)}
            value={astrology}
            onChange={(next) => {
              setAstrology(next);
              setAstrologyChoice(next ? 'new' : 'off');
            }}
            chart={chart}
            onChartChange={setChart}
            disabled={writing}
            savedChart={saved.data?.astrology_chart || null}
            reuseSaved={reuseSavedAstrology}
            onUseSaved={() => {
              setAstrology(undefined);
              setChart(null);
              setAstrologyChoice('auto');
            }}
          />
          <p className="small muted" id="tarot-data-use">
            Your question, chosen cards and any included calculated chart are sent to Google Gemini
            to write this reading.
            {saved.data?.api_tier === 'free'
              ? ' This version uses the free tier: Google may use questions and readings to improve its products. Keep your question non-sensitive.'
              : null}
          </p>
          {unavailable && saved.data?.message ? (
            <p className="tarot-reading-status" role="status">
              {saved.data.message} Your three cards are saved.
            </p>
          ) : null}
          <div className="tarot-submit">
            <Button
              type="submit"
              size="lg"
              pending={writing}
              disabled={!saved.data || unavailable || (!!astrology && !chart)}
            >
              <Sparkles size={17} />
              {writing ? 'Writing your personal reading…' : 'Read my cards'}
              <ArrowRight size={17} />
            </Button>
          </div>
          {writing ? (
            <p className="tarot-reading-status" role="status">
              Writing your reading. This usually takes under a minute; you can stay on this page.
            </p>
          ) : saved.data?.message && !unavailable ? (
            <p className="small muted" role="status">
              {saved.data.message}
            </p>
          ) : null}
          {generate.error ? (
            <p className="error-note" role="alert">
              {generate.error instanceof ApiError && generate.error.status >= 500
                ? 'Your reading could not be completed. Your cards are saved; please try again.'
                : generate.error.message}
            </p>
          ) : null}
        </form>
      )}
      <p className="tarot-footnote">
        A playful reflection, not a prediction. You’re the one writing your story.
      </p>
      <Modal
        open={exploreDeck}
        onOpenChange={setExploreDeck}
        title="The whole cosmic cast"
        description="Explore all 78 illustrations. Your shuffled cards stay a surprise."
        wide
        stickyHeader
      >
        <div className="tarot-deck-filter" ref={filter}>
          <ChoiceGroup
            label="Tarot suit"
            value={deckSuit}
            onChange={setDeckSuit}
            options={[
              { value: 'all', label: 'All 78' },
              { value: 'major', label: 'Major arcana' },
              { value: 'wands', label: 'Wands' },
              { value: 'cups', label: 'Cups' },
              { value: 'swords', label: 'Swords' },
              { value: 'pentacles', label: 'Pentacles' },
            ]}
          />
        </div>
        <ul className="tarot-deck-gallery" aria-label="Tarot illustrations">
          {Object.entries(tarotArtwork)
            .filter(([id]) => deckSuit === 'all' || id.startsWith(`${deckSuit}-`))
            .map(([id, artwork]) => (
              <li key={id}>
                <TarotCard id={id} name={artwork.name} imageLoader={imageLoader} />
              </li>
            ))}
        </ul>
      </Modal>
    </div>
  );
}
