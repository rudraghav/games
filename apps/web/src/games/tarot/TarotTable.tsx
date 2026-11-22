'use client';
import { usePrivateViewScope } from '@/shared/use-private-view-scope';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useReducedMotion } from 'motion/react';
import { Sparkles, ArrowRight, ArrowUp, RotateCcw, Layers3 } from 'lucide-react';
import { Button, TarotCard } from '@games/ui';
import {
  ApiError,
  type AstrologyInput,
  type AstrologyChart as ChartData,
  type ReadingStyle,
  type ReadingView,
} from '@games/api-client';
import { api } from '@/lib/session';
import { keys } from '@/shared/query-keys';
import type { TableProps } from '../types';
import { useTableDraft } from '../shared/table-draft';
import { readingPath } from '@/shared/game-paths';
import { ReadingSkeleton, TarotReading } from './TarotReading';
import { TarotCardDetail, type DetailCard } from './TarotCardDetail';
import { spreadPositions } from './spread';
import { ReadingStyleSwitch } from './ReadingStyleSwitch';
import { CompletedReadingControls, useCompletedReadingView } from './completed-reading-view';
import { AstrologyForm } from './AstrologyForm';
import { ReadingProgress } from './ReadingProgress';
import { ReadingAction } from './ReadingAction';
import { TarotDeckPicker } from './TarotDeckPicker';
import { TarotDeckGallery } from './TarotDeckGallery';
import { nameWithOrientation, orientationOf } from './orientation';

const positions = spreadPositions.map((position) => position.name);
/** Matches the server's ReadingInput.question limit. */
const QUESTION_LIMIT = 400;

function subscribeToNetwork(notify: () => void) {
  window.addEventListener('online', notify);
  window.addEventListener('offline', notify);
  return () => {
    window.removeEventListener('online', notify);
    window.removeEventListener('offline', notify);
  };
}

function readingErrorMessage(error: unknown) {
  const status = error instanceof ApiError ? error.status : undefined;
  if (status === 401) return 'Reconnect to continue.';
  if (status === 403 || status === 404) return 'This spread is unavailable.';
  if (status === 409) return 'This spread has changed.';
  if (status === 422) return 'Check your question and birth details.';
  if (status === 429) return 'Reading limit reached.';
  return 'The reading couldn’t finish.';
}

export function TarotTable({ match, room, selfId, onAction, pending, imageLoader }: TableProps) {
  // The unsent question survives a refresh in this tab, for this spread only.
  const [questionDraft, setQuestion] = useTableDraft<string | null>(
    `tarot-question:${room.id}:${room.matchId}`,
    null,
  );
  const [styleDraft, setStyle] = useTableDraft<ReadingStyle | null>(
    `tarot-style:${room.id}:${room.matchId}`,
    null,
  );
  const [astrology, setAstrology] = useState<AstrologyInput>();
  const [astrologyChoice, setAstrologyChoice] = useState<'auto' | 'off' | 'new'>('auto');
  const [chart, setChart] = useState<ChartData | null>(null);
  const [exploreDeck, setExploreDeck] = useState(false);
  const [detail, setDetail] = useState<DetailCard | null>(null);
  const offline = useSyncExternalStore(
    subscribeToNetwork,
    () => !navigator.onLine,
    () => false,
  );
  const [drawnNote, setDrawnNote] = useState('');
  const [fresh, setFresh] = useState<number | null>(null);
  const [recovering, setRecovering] = useState(false);
  const [animateAction, setAnimateAction] = useState(false);
  const [clockNow, setClockNow] = useState(() => Date.now() / 1000);
  const localPick = useRef(false);
  const reduced = useReducedMotion();
  const slots = useRef<(HTMLDivElement | null)[]>([]);
  const deck = useRef<HTMLDivElement>(null);
  const cache = useQueryClient();
  const scope = usePrivateViewScope(selfId);
  const queryKey = ['tarot-reading', room.id, room.matchId, scope];
  const progressArea = useRef<HTMLDivElement>(null);
  const showRequestedProgress = useRef(false);
  const generate = useMutation<ReadingView>({
    mutationFn: (): Promise<ReadingView> =>
      api.generateReading(
        room.id,
        room.matchId!,
        question,
        astrology,
        reuseSavedAstrology,
        readingStyle,
      ),
    onSuccess: async (result) => {
      // A late progress poll cannot replace the completed reading with a pending state.
      await cache.cancelQueries({ queryKey, exact: true });
      setQuestion(null);
      setStyle(null);
      setAstrology(undefined);
      setAstrologyChoice('auto');
      setChart(null);
      cache.setQueryData(queryKey, result);
      void cache.invalidateQueries({ queryKey: keys.room(room.id) });
    },
    onError: async (error) => {
      setRecovering(true);
      try {
        if (error instanceof ApiError && error.status === 409)
          await cache.invalidateQueries({ queryKey: keys.room(room.id) });
        await cache.invalidateQueries({ queryKey });
      } finally {
        setRecovering(false);
      }
    },
  });
  const saved = useQuery<ReadingView>({
    queryKey,
    queryFn: () => api.reading(room.id),
    enabled: match.community.length === 3 && !!scope,
    gcTime: 0,
    refetchInterval: (query): number | false =>
      generate.isPending || recovering || query.state.data?.status === 'generating' ? 2000 : false,
  });
  // An explicit empty draft is a user's edit; a missing draft restores the saved question.
  const question: string = questionDraft ?? saved.data?.question ?? '';
  const savedStyle = saved.data?.reading_style ?? 'fun';
  const readingStyle =
    saved.data?.status === 'generating' ? savedStyle : (styleDraft ?? savedStyle);
  const reuseSavedAstrology: boolean =
    astrologyChoice === 'auto' && !astrology && !!saved.data?.astrology_chart;
  // A solo reading starts its next spread in one tap: ready, then start, as room creation does.
  const again = useMutation({
    mutationFn: async () => {
      await api.ready(room.id, true);
      return api.start(room.id);
    },
    onSuccess: (next) => {
      // The new deck replaces a long reading: start at the top, where the first pick is.
      window.scrollTo({ top: 0, behavior: 'auto' });
      cache.setQueryData(keys.room(room.id), next);
    },
    onError: () => void cache.invalidateQueries({ queryKey: keys.room(room.id) }),
  });
  const reading = saved.data?.reading;
  const view = useCompletedReadingView(room.matchId, scope, savedStyle, reading);
  const writing = (generate.isPending && !recovering) || saved.data?.status === 'generating';
  const revealProgress = useCallback(() => {
    if (!showRequestedProgress.current) return;
    showRequestedProgress.current = false;
    progressArea.current?.scrollIntoView({
      block: 'nearest',
      behavior: reduced ? 'auto' : 'smooth',
    });
  }, [reduced]);
  const checking = !reading && (recovering || saved.isPending || saved.isFetching);
  const unavailable = saved.data?.status === 'unavailable';
  const failure = saved.data?.failure ?? undefined;
  const changedBlockedQuestion =
    failure?.code === 'blocked' && question.trim() !== (saved.data?.question || '').trim();
  const activeFailure = changedBlockedQuestion ? undefined : failure;
  const retryAt = activeFailure?.retry_at ?? undefined;
  const coolingDown = retryAt !== undefined && retryAt > clockNow;
  const recheckAvailability = activeFailure?.code === 'unavailable';
  const checkReadingStatus = saved.refetch;
  useEffect(() => {
    if (retryAt === undefined || retryAt <= clockNow) return;
    const timer = window.setTimeout(
      () => {
        const now = Date.now() / 1000;
        setClockNow(now);
        if (recheckAvailability && now >= retryAt) void checkReadingStatus();
      },
      Math.min(2147483647, Math.max(0, retryAt * 1000 - Date.now())),
    );
    return () => window.clearTimeout(timer);
  }, [retryAt, clockNow, recheckAvailability, checkReadingStatus]);
  const providers = saved.data ? (saved.data.provider_names ?? ['Google Gemini']) : [];
  const providerLabel = new Intl.ListFormat('en', { type: 'disjunction' }).format(providers);
  const clientStatus = generate.error instanceof ApiError ? generate.error.status : undefined;
  const clientRetryable =
    !generate.error || clientStatus === undefined || clientStatus === 408 || clientStatus >= 500;
  const retryReading =
    !!activeFailure?.retryable ||
    (!failure && (saved.data?.status === 'failed' || (!!generate.error && clientRetryable)));
  const statusError = saved.isError ? saved.error : undefined;
  const accessStatus =
    statusError instanceof ApiError ? statusError.status : !failure ? clientStatus : undefined;
  const statusMessage =
    checking || writing
      ? ''
      : statusError
        ? accessStatus && [401, 403, 404].includes(accessStatus)
          ? readingErrorMessage(statusError)
          : 'Couldn’t check your reading.'
        : activeFailure
          ? activeFailure.message
          : unavailable
            ? saved.data?.message || 'Readings are unavailable.'
            : !changedBlockedQuestion && generate.error
              ? readingErrorMessage(generate.error)
              : saved.data?.status === 'failed' && !changedBlockedQuestion
                ? saved.data.message || 'The reading couldn’t finish.'
                : '';
  const cannotGenerate =
    writing ||
    checking ||
    !saved.data ||
    saved.isError ||
    unavailable ||
    (!!activeFailure && !activeFailure.retryable) ||
    coolingDown ||
    (!failure && !clientRetryable) ||
    room.paused ||
    (!!astrology && !chart);
  const drawn = match.community.length;
  // A finished room's saved reading is on its way: show its shape, not the question form.
  const openingReading = room.status === 'finished' && !saved.data && !saved.isError;
  // What the table itself says while there is no reading to show yet.
  const tableState =
    reading || openingReading || match.phase === 'choosing'
      ? undefined
      : writing
        ? 'writing'
        : offline
          ? 'offline'
          : unavailable || activeFailure?.code === 'unavailable'
            ? 'unavailable'
            : 'ready';
  const canDrawAgain =
    room.status === 'finished' && room.ownerId === selfId && match.phase !== 'choosing';

  // Reveal each pick where it lands: the spread slot scrolls into view, takes focus
  // and its card is announced. A refresh starts from the saved spread without a reveal.
  // Mark the new card before its first paint, so it never shows face-up ahead of its turn.
  const [shownDrawn, setShownDrawn] = useState(drawn);
  if (drawn !== shownDrawn) {
    setShownDrawn(drawn);
    if (drawn > shownDrawn) setFresh(drawn - 1);
  }
  const seen = useRef(drawn);
  useEffect(() => {
    if (drawn > seen.current) {
      const locallyPicked = localPick.current;
      localPick.current = false;
      const index = drawn - 1;
      const slot = slots.current[index];
      const reduceNow = reduced || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      slot?.scrollIntoView({ block: 'nearest', behavior: reduceNow ? 'auto' : 'smooth' });
      slot?.focus({ preventScroll: true });
      setFresh(index);
      const landed = match.community[index];
      setDrawnNote(
        `You drew ${landed.label}${orientationOf(landed) === 'reversed' ? ', reversed,' : ''} for ${positions[index].toLowerCase()}.`,
      );
      // Optional feedback follows a committed pick, never a failed tap or refresh.
      if (
        locallyPicked &&
        !reduceNow &&
        document.visibilityState === 'visible' &&
        typeof navigator.vibrate === 'function'
      ) {
        try {
          navigator.vibrate(12);
        } catch {
          // Optional device feedback must never interrupt the saved card reveal.
        }
      }
    }
    seen.current = drawn;
  }, [drawn, match.community, reduced]);
  useEffect(() => {
    if (!pending) {
      localPick.current = false;
    }
  }, [pending]);
  useEffect(() => {
    if (fresh === null) return;
    const timer = window.setTimeout(() => setFresh(null), 4000);
    return () => window.clearTimeout(timer);
  }, [fresh]);

  const drawAgain = (top: boolean) =>
    canDrawAgain ? (
      <Button
        size={top ? 'md' : 'lg'}
        variant={top ? 'secondary' : 'primary'}
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
    <div
      className="tarot-table stable-tarot-table"
      data-phase={match.phase}
      data-reading-state={reading ? 'complete' : tableState}
    >
      <div className="tarot-intro">
        <div className="tarot-intro-header">
          <div>
            <p className="eyebrow">
              {match.phase === 'choosing'
                ? `Card ${drawn + 1} of 3`
                : view.alternate
                  ? view.style === 'fun'
                    ? 'Fun view'
                    : 'Classic view'
                  : reading && savedStyle === 'fun'
                    ? 'Fun Tarot reading'
                    : 'Three-card reading'}
            </p>
            <h2
              aria-label={
                match.phase === 'choosing'
                  ? `Choose card ${drawn + 1} of 3 · ${positions[drawn]}`
                  : undefined
              }
            >
              {reading
                ? reading.title
                : match.phase === 'choosing'
                  ? positions[drawn]
                  : tableState === 'writing'
                    ? 'Writing your reading…'
                    : tableState === 'offline'
                      ? 'You’re offline'
                      : tableState === 'unavailable'
                        ? 'Readings are unavailable right now'
                        : 'Your three-card spread'}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Explore the deck"
            title="Explore the deck"
            onClick={() => setExploreDeck(true)}
          >
            <Layers3 size={20} />
          </Button>
        </div>
        {tableState ? (
          // One line in every state, so asking for a reading never moves the form below.
          <p
            className="tarot-reading-status"
            data-state={tableState}
            // Progress announces its own stages; the paused states speak here.
            role={tableState === 'unavailable' || tableState === 'offline' ? 'status' : undefined}
          >
            {tableState === 'writing'
              ? 'Your three cards are saved while the reading is written.'
              : tableState === 'offline'
                ? 'Your cards are saved. Reconnect to ask for your reading.'
                : tableState === 'unavailable'
                  ? 'Your cards are saved. You can ask for your reading once the service is back.'
                  : 'Add a question if you like, then ask for your reading.'}
          </p>
        ) : null}
        {reading && saved.data?.question ? (
          <div className="tarot-asked">
            <span className="eyebrow">You asked</span>
            <p className="tarot-saved-question">{saved.data.question}</p>
          </div>
        ) : null}
        {reading ? (
          <div className="tarot-intro-actions">
            <CompletedReadingControls view={view} />
            {drawAgain(true)}
          </div>
        ) : null}
        {again.error ? (
          <p className="error-note" role="alert">
            Couldn’t start a new spread.
          </p>
        ) : null}
      </div>
      {match.phase === 'choosing' ? (
        <TarotDeckPicker
          key={room.matchId}
          actions={match.actions}
          drawn={drawn}
          position={positions[drawn]}
          pending={pending}
          paused={room.paused}
          deckRef={deck}
          onDraw={(action) => {
            localPick.current = true;
            onAction(action);
          }}
        />
      ) : null}
      <div className="tarot-spread">
        {positions.map((position, i) => {
          const card = match.community[i];
          const orientation = orientationOf(card);
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
              data-orientation={card ? orientation : undefined}
              aria-label={
                card
                  ? `Card ${i + 1}, ${position}: ${nameWithOrientation(card.label, orientation)}. ${card.subtitle || ''}`.trim()
                  : undefined
              }
            >
              <p className="eyebrow">
                0{i + 1} · {position}
              </p>
              {card ? (
                <div className="tarot-flip">
                  <TarotCard
                    id={card.id}
                    name={card.label}
                    // The picture lands the way it was drawn; the name stays readable.
                    reversed={orientation === 'reversed'}
                    imageLoader={imageLoader}
                    // Once the spread is complete, a card opens its full page.
                    {...(match.phase === 'choosing'
                      ? {}
                      : {
                          label: `View ${card.label} card`,
                          tip: 'Open the full card',
                          onClick: () =>
                            setDetail({
                              id: card.id,
                              label: card.label,
                              subtitle: card.subtitle ?? undefined,
                              position,
                              orientation,
                            }),
                        })}
                  />
                  {/* The viewer's own pick turns over from the back they chose. */}
                  {fresh === i ? <span className="tarot-flip-back" aria-hidden="true" /> : null}
                </div>
              ) : (
                <div className="tarot-slot-empty" aria-hidden="true">
                  {next ? <span>Your next card lands here</span> : null}
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
        {pending ? 'Saving your card…' : drawnNote}
      </p>
      {match.phase === 'choosing' ? (
        <>
          {drawn ? (
            <div className="tarot-back-to-deck">
              <Button
                variant="secondary"
                onClick={() =>
                  deck.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus()
                }
              >
                <ArrowUp size={16} />
                Choose card {drawn + 1} of 3
              </Button>
            </div>
          ) : null}
        </>
      ) : reading ? (
        <>
          {view.reading ? (
            <TarotReading
              reading={view.reading}
              readingStyle={view.style}
              cardMeanings={view.alternate && view.style === 'classic'}
              cards={match.community}
              imageLoader={imageLoader}
              summary
              question={saved.data?.question || undefined}
              savedHref={room.matchId ? readingPath(room.matchId) : undefined}
            />
          ) : view.loading ? (
            <ReadingSkeleton />
          ) : null}
          {canDrawAgain ? (
            <div className="tarot-again">
              <p className="small muted">Ready for another question?</p>
              {drawAgain(false)}
            </div>
          ) : null}
        </>
      ) : openingReading ? (
        <ReadingSkeleton label="Opening your reading…" />
      ) : (
        <form
          className="tarot-question"
          onSubmit={(event) => {
            event.preventDefault();
            if (cannotGenerate) return;
            showRequestedProgress.current = true;
            setAnimateAction(true);
            generate.mutate();
          }}
        >
          <ReadingStyleSwitch
            value={readingStyle}
            onChange={setStyle}
            disabled={writing || recovering || !saved.data}
          />
          <label className="field">
            <span className="tarot-question-label">
              What’s on your mind? <span className="muted small">Optional</span>
            </span>
            <textarea
              className="input"
              maxLength={QUESTION_LIMIT}
              rows={3}
              placeholder="Ask your question and add what’s going on. Specifics make the reading more useful."
              value={question}
              aria-describedby={providers.length ? 'tarot-data-use' : undefined}
              onChange={(event) => {
                setQuestion(event.target.value);
                if (!generate.isPending && clientStatus === 422) generate.reset();
              }}
              disabled={writing || recovering}
            />
          </label>
          {/* Shown only near the limit, so the form keeps its height and the progress
              card that replaces the button still opens on screen on a short phone. */}
          {question.length >= QUESTION_LIMIT - 100 ? (
            <p className="tarot-question-count small muted">
              {question.length}/{QUESTION_LIMIT}
            </p>
          ) : null}
          <AstrologyForm
            searchPlaces={(query) => api.astrologyPlaces(room.id, room.matchId!, query)}
            calculateChart={(input) => api.astrologyChart(room.id, room.matchId!, input)}
            value={astrology}
            onChange={(next) => {
              setAstrology(next);
              setAstrologyChoice(next ? 'new' : 'off');
              if (!generate.isPending && clientStatus === 422) generate.reset();
            }}
            chart={chart}
            onChartChange={setChart}
            disabled={writing || recovering}
            savedChart={saved.data?.astrology_chart || null}
            reuseSaved={reuseSavedAstrology}
            onUseSaved={() => {
              setAstrology(undefined);
              setChart(null);
              setAstrologyChoice('auto');
            }}
          />
          {providers.length ? (
            <p className="small muted" id="tarot-data-use">
              Your question, chosen cards and any included calculated chart may be sent to{' '}
              {providerLabel} to write this reading.
              {saved.data?.api_tier === 'free'
                ? providers.includes('Google Gemini')
                  ? ' Google’s free tier may use questions and readings to improve its products. Keep your question non-sensitive.'
                  : ' Keep your question non-sensitive.'
                : null}
            </p>
          ) : null}
          {statusMessage && tableState !== 'unavailable' ? (
            <p className="error-note" role={unavailable ? 'status' : 'alert'}>
              {statusMessage}
              {coolingDown && activeFailure?.retryable && retryAt !== undefined
                ? ` Try again ${new Intl.DateTimeFormat('en', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  }).format(new Date(retryAt * 1000))}.`
                : null}
            </p>
          ) : null}
          <div className="tarot-submit" ref={progressArea}>
            <ReadingAction
              processing={writing || recovering}
              animate={animateAction}
              onExpanded={revealProgress}
              action={
                accessStatus === 401 ? (
                  <Link href="/profile" className="button button--secondary button--lg">
                    Open profile
                  </Link>
                ) : accessStatus === 403 || accessStatus === 404 ? (
                  <Link href="/" className="button button--secondary button--lg">
                    Back to games
                  </Link>
                ) : saved.isError ? (
                  <Button
                    type="button"
                    size="lg"
                    pending={saved.isFetching}
                    onClick={() => void saved.refetch()}
                  >
                    Check status
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="lg"
                    pending={checking && !writing && !recovering}
                    disabled={cannotGenerate}
                    aria-live="polite"
                  >
                    {!checking ? <Sparkles size={17} /> : null}
                    {checking
                      ? 'Checking status…'
                      : retryReading
                        ? 'Retry reading'
                        : 'Read my cards'}
                    {!checking ? <ArrowRight size={17} /> : null}
                  </Button>
                )
              }
            >
              <ReadingProgress
                progress={saved.data?.status === 'generating' ? saved.data.progress : undefined}
                recovering={recovering || saved.isError}
              />
            </ReadingAction>
          </div>
        </form>
      )}
      <p className="tarot-footnote">
        A playful reflection, not a prediction. You’re the one writing your story.
      </p>
      <TarotCardDetail card={detail} onClose={() => setDetail(null)} imageLoader={imageLoader} />
      <TarotDeckGallery
        open={exploreDeck}
        onOpenChange={setExploreDeck}
        imageLoader={imageLoader}
      />
    </div>
  );
}
