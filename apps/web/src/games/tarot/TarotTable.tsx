'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button, ChoiceGroup, Modal, HorizontalRail, TarotCard, tarotArtwork } from '@games/ui';
import { ApiError } from '@games/api-client';
import { api } from '@/lib/session';
import { keys } from '@/shared/query-keys';
import type { TableProps } from '../types';
import { TarotReading } from './TarotReading';

const positions = ['Where you are', 'What is shifting', 'Your next move'];
export function TarotTable({ match, room, onAction, pending, imageLoader }: TableProps) {
  const [question, setQuestion] = useState('');
  const [exploreDeck, setExploreDeck] = useState(false);
  const [deckSuit, setDeckSuit] = useState('all');
  const cache = useQueryClient();
  const queryKey = ['tarot-reading', room.id, room.matchId];
  const saved = useQuery({
    queryKey,
    queryFn: () => api.reading(room.id),
    enabled: match.community.length === 3,
    refetchInterval: (query) => (query.state.data?.status === 'generating' ? 3000 : false),
  });
  const generate = useMutation({
    mutationFn: () => api.generateReading(room.id, room.matchId!, question),
    onSuccess: (result) => {
      cache.setQueryData(queryKey, result);
      void cache.invalidateQueries({ queryKey: keys.room(room.id) });
    },
    onError: () => {
      void cache.invalidateQueries({ queryKey });
    },
  });
  const reading = saved.data?.reading;
  const writing = generate.isPending || saved.data?.status === 'generating';
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
        <Button variant="ghost" onClick={() => setExploreDeck(true)}>
          Explore the deck
        </Button>
      </div>
      <div className="tarot-spread">
        {positions.map((position, i) => (
          <div className="tarot-spread-slot" key={position}>
            <p className="eyebrow">
              0{i + 1} · {position}
            </p>
            <TarotCard
              id={match.community[i]?.id}
              name={match.community[i]?.label}
              imageLoader={imageLoader}
            />
            <p className="tarot-card-meaning" aria-hidden={!match.community[i]}>
              {match.community[i]?.subtitle || '\u00a0'}
            </p>
          </div>
        ))}
      </div>
      {match.phase === 'choosing' ? (
        <section className="tarot-pick-area">
          <div className="section-heading">
            <h3>Choose card {match.community.length + 1} of 3</h3>
            <p className="small muted">Select a face-down card.</p>
          </div>
          <HorizontalRail
            label="Choose from your shuffled 78-card deck"
            navigationLabel="tarot cards"
            className="tarot-deck-rail"
            viewportClassName="tarot-deck"
            contentClassName="tarot-deck-content"
          >
            {match.actions.map((option) => (
              <TarotCard
                compact
                key={option.value.choice}
                label={option.label}
                onClick={() => onAction(option.value)}
                disabled={pending || room.paused}
              />
            ))}
          </HorizontalRail>
          <p className="small muted">Use the arrows or scroll to see more cards.</p>
        </section>
      ) : reading ? (
        <TarotReading reading={reading} cards={match.community} />
      ) : (
        <form
          className="tarot-question"
          onSubmit={(event) => {
            event.preventDefault();
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
          <p className="small muted" id="tarot-data-use">
            Your question and chosen cards are sent to Google Gemini to write this reading.
            {saved.data?.api_tier === 'free'
              ? ' This version uses the free tier: Google may use questions and readings to improve its products. Keep your question non-sensitive.'
              : null}
          </p>
          <Button
            type="submit"
            size="lg"
            pending={writing}
            disabled={!saved.data || saved.data.status === 'unavailable'}
          >
            <Sparkles size={17} />
            {writing ? 'Writing your personal reading…' : 'Read my cards'}
            <ArrowRight size={17} />
          </Button>
          {saved.data?.message ? (
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
