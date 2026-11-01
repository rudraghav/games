import { Sparkles } from 'lucide-react';
import type { ReadingView } from '@games/api-client';
import Image from 'next/image';
import { tarotCharacter } from '@games/api-client/characters';

type Reading = NonNullable<ReadingView['reading']>;
export function TarotReading({
  reading,
  cards,
}: {
  reading: Reading;
  cards: readonly { id: string; label: string }[];
}) {
  const cardNames = new Map(cards.map((card) => [card.id, card.label]));
  const portraits = [
    ...new Map(
      reading.cards
        .flatMap((card) => card.characters || [])
        .flatMap((c) => {
          const portrait = tarotCharacter(c.name, c.source);
          return portrait ? [[portrait.id, portrait] as const] : [];
        }),
    ).values(),
  ];
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
                {card.characters.map((character) => {
                  const portrait = tarotCharacter(character.name, character.source);
                  return (
                    <li
                      key={`${character.name}-${character.source}`}
                      data-has-portrait={!!portrait}
                    >
                      {portrait ? (
                        <figure className="tarot-character-portrait">
                          <Image
                            src={portrait.image}
                            width={portrait.width}
                            height={portrait.height}
                            sizes="(max-width: 600px) 88px, 112px"
                            alt={
                              portrait.imageType === 'cosplay'
                                ? `Cosplay depiction of ${character.name}`
                                : `Portrait of ${portrait.performer}`
                            }
                          />
                          <figcaption>
                            {portrait.imageType === 'cosplay'
                              ? 'Cosplay photo'
                              : `${portrait.performerLabel} ${portrait.performer}`}
                          </figcaption>
                        </figure>
                      ) : null}
                      <div className="tarot-character-copy">
                        <p className="tarot-character-name">
                          {character.name} <span>{character.source}</span>
                        </p>
                        <p>{character.connection}</p>
                      </div>
                    </li>
                  );
                })}
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
      {portraits.length ? (
        <details className="tarot-image-credits">
          <summary>Image credits</summary>
          <ul>
            {portraits.map((p) => (
              <li key={p.id}>
                <a href={p.filePage} target="_blank" rel="noopener noreferrer">
                  {p.name}: {p.credit}
                </a>
                {' · '}
                <a href={p.licenseUrl} target="_blank" rel="noopener noreferrer">
                  {p.license}
                </a>
                {' · resized and converted to WebP'}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
      <div className="tarot-next-step">
        <span className="eyebrow">Your next small move</span>
        <p>{reading.next_step}</p>
      </div>
    </div>
  );
}
