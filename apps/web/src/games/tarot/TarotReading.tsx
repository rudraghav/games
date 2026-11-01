import { Sparkles } from 'lucide-react';
import type { ReadingView } from '@games/api-client';

type Reading = NonNullable<ReadingView['reading']>;
export function TarotReading({
  reading,
  cards,
}: {
  reading: Reading;
  cards: readonly { id: string; label: string }[];
}) {
  const cardNames = new Map(cards.map((card) => [card.id, card.label]));
  return (
    <div className="tarot-reading">
      {reading.cards.map((card) => (
        <article key={card.card_id}>
          <span className="eyebrow">
            {card.position}
            {card.title.toLocaleLowerCase() !== cardNames.get(card.card_id)?.toLocaleLowerCase()
              ? ` · ${cardNames.get(card.card_id) || card.card_id}`
              : ''}
          </span>
          <h3>{card.title}</h3>
          <div
            className="tarot-perspectives"
            data-variant={card.quirky_interpretation ? 'split' : 'single'}
          >
            <section aria-labelledby={`${card.card_id}-grounded`}>
              <h4 id={`${card.card_id}-grounded`}>The grounded read</h4>
              <p>{card.interpretation}</p>
            </section>
            {card.quirky_interpretation ? (
              <section className="tarot-quirky-read" aria-labelledby={`${card.card_id}-quirky`}>
                <h4 id={`${card.card_id}-quirky`}>
                  <Sparkles size={16} aria-hidden="true" /> The plot twist
                </h4>
                <p>{card.quirky_interpretation}</p>
              </section>
            ) : null}
          </div>
          {card.characters?.length ? (
            <div className="tarot-character-connections">
              <h4>Your character energy</h4>
              <ul>
                {card.characters.map((character) => (
                  <li key={`${character.name}-${character.source}`}>
                    <p className="tarot-character-name">
                      {character.name} <span>{character.source}</span>
                    </p>
                    <p>{character.connection}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : card.pop_culture ? (
            <div className="culture-note">
              <Sparkles size={19} aria-hidden="true" />
              <p>{card.pop_culture}</p>
            </div>
          ) : null}
        </article>
      ))}
      <div className="tarot-next-step">
        <span className="eyebrow">Your next small move</span>
        <p>{reading.next_step}</p>
      </div>
    </div>
  );
}
