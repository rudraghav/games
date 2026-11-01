'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button, TarotCard } from '@games/ui';
import { ApiError } from '@games/api-client';
import { api } from '@/lib/session';
import { keys } from '@/shared/query-keys';
import type { TableProps } from '../types';

const positions = ['Where you are', 'What is shifting', 'Your next move'];
export function TarotTable({ match, room, onAction, pending, imageLoader }: TableProps) {
  const [question, setQuestion] = useState('');
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
    <div className="tarot-table">
      <div className="tarot-intro">
        <span className="tarot-little-star">✳</span>
        <p className="eyebrow">A little cosmic perspective</p>
        <h2>{reading ? reading.title : 'Let’s see your next plot twist.'}</h2>
        <p>
          {reading
            ? reading.introduction
            : 'A moment for you. Three cards. A fresh way to look at things.'}
        </p>
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
            <p className="tarot-card-meaning">
              {match.community[i]?.subtitle || 'Your card is waiting.'}
            </p>
          </div>
        ))}
      </div>
      {match.phase === 'choosing' ? (
        <section className="tarot-pick-area">
          <div className="section-heading">
            <h3>Choose card {match.community.length + 1} of 3</h3>
            <p className="small muted">Go with the one that catches your eye.</p>
          </div>
          <div
            className="tarot-deck"
            role="group"
            aria-label="Choose from your shuffled 78-card deck"
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
          </div>
          <p className="small muted">
            Scroll through the deck. Every face-down card is a different possibility.
          </p>
        </section>
      ) : reading ? (
        <div className="tarot-reading">
          {reading.cards.map((card, i) => (
            <article key={card.card_id}>
              <span className="eyebrow">
                {positions[i]} · {match.community[i]?.label}
              </span>
              <h3>{card.title}</h3>
              <p>{card.interpretation}</p>
              <div className="culture-note">
                <Sparkles size={19} />
                <p>{card.pop_culture}</p>
              </div>
            </article>
          ))}
          <div className="tarot-next-step">
            <span className="eyebrow">Your next small move</span>
            <p>{reading.next_step}</p>
          </div>
        </div>
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
              placeholder="A decision, a fresh start, or just the general vibe…"
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
    </div>
  );
}
