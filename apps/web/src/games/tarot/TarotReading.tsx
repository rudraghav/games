import { Sparkles } from 'lucide-react';
import { TarotCard } from '@games/ui';
import type { ReadingStyle, ReadingView } from '@games/api-client';
import { tarotCharacter } from '@games/api-client/characters';
import { TarotCharacterImage } from './TarotCharacterImage';
import { AstrologyReading } from './AstrologyReading';

type Reading = NonNullable<ReadingView['reading']>;

function characterArtwork(name: string, source: string) {
  const artwork = tarotCharacter(name, source);
  return artwork &&
    ['character', 'illustration', 'person', 'religious_figure', 'meme', 'artwork'].includes(
      artwork.imageType,
    )
    ? artwork
    : undefined;
}

/** Raw source URLs in a credit read as their site name; the link keeps the full source. */
export function readableCredit(credit: string) {
  return credit.replace(/https?:\/\/[^\s]+/g, (url) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  });
}

function CharacterConnections({ card, fun }: { card: Reading['cards'][number]; fun: boolean }) {
  return card.characters?.length ? (
    <div className="tarot-character-connections">
      <h4>{fun ? 'How it could play out' : 'Your connections'}</h4>
      <ul>
        {card.characters.map((character) => {
          const portrait = characterArtwork(character.name, character.source);
          const scene = fun ? character.evidence?.trim() : undefined;
          const move =
            scene && character.connection.startsWith(scene)
              ? character.connection.slice(scene.length).trimStart()
              : character.connection;
          return (
            <li
              key={`${character.name}-${character.source}`}
              data-has-portrait={!!portrait}
              data-reference-kind={portrait?.kind}
              data-artwork-type={portrait?.imageType}
            >
              {portrait ? <TarotCharacterImage character={portrait} /> : null}
              <div className="tarot-character-identity">
                <p className="tarot-character-name">
                  {character.name} <span>{character.source}</span>
                </p>
                {scene ? <p className="tarot-character-scene">{scene}</p> : null}
              </div>
              <div className="tarot-character-copy">
                {move ? <p>{move}</p> : null}
                {!fun && character.evidence ? (
                  <details className="tarot-character-evidence">
                    <summary aria-label={`Background for ${character.name}`}>Background</summary>
                    <p>{character.evidence}</p>
                  </details>
                ) : null}
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
  ) : null;
}

export function TarotReading({
  reading,
  readingStyle = 'classic',
  cards,
  imageLoader,
}: {
  reading: Reading;
  readingStyle?: ReadingStyle;
  cards: readonly { id: string; label: string }[];
  imageLoader?: (path: string) => string;
}) {
  const fun = readingStyle === 'fun';
  const cardNames = new Map(cards.map((card) => [card.id, card.label]));
  const portraits = [
    ...new Map(
      reading.cards
        .flatMap((card) => card.characters || [])
        .flatMap((c) => {
          const portrait = characterArtwork(c.name, c.source);
          return portrait ? [[portrait.id, portrait] as const] : [];
        }),
    ).values(),
  ];
  return (
    <div className="tarot-reading">
      {reading.cards.map((card) => (
        <article key={card.card_id}>
          <header className="tarot-reading-card-heading">
            {cardNames.has(card.card_id) ? (
              <TarotCard
                compact
                id={card.card_id}
                name={cardNames.get(card.card_id)}
                imageLoader={imageLoader}
              />
            ) : null}
            <div>
              <span className="eyebrow">
                {card.position}
                {card.title.toLocaleLowerCase() !== cardNames.get(card.card_id)?.toLocaleLowerCase()
                  ? ` · ${cardNames.get(card.card_id) || card.card_id}`
                  : ''}
              </span>
              <h3>{card.title}</h3>
            </div>
          </header>
          {fun ? <CharacterConnections card={card} fun /> : null}
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
          {!fun ? <CharacterConnections card={card} fun={false} /> : null}
        </article>
      ))}
      {portraits.length ? (
        <details className="tarot-image-credits">
          <summary>Image credits</summary>
          <ul>
            {portraits.map((p) => (
              <li key={p.id}>
                {p.filePage || p.sourcePage ? (
                  <a href={p.filePage || p.sourcePage} target="_blank" rel="noopener noreferrer">
                    {p.name}: {p.artworkTitle ? `${p.artworkTitle}. ` : ''}
                    {readableCredit(p.credit)}
                  </a>
                ) : (
                  <span>
                    {p.name}: {p.artworkTitle ? `${p.artworkTitle}. ` : ''}
                    {readableCredit(p.credit)}
                  </span>
                )}
                {p.licenseUrl && p.license ? (
                  <>
                    {' · '}
                    <a href={p.licenseUrl} target="_blank" rel="noopener noreferrer">
                      {p.license}
                    </a>
                  </>
                ) : null}
                {p.rightsNote ? <> · {p.rightsNote}</> : null}
                {` · framed to ${p.width * 3 === p.height * 4 ? '4:3' : '4:5'} and converted to WebP`}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
      {reading.astrology ? <AstrologyReading astrology={reading.astrology} /> : null}
      <div className="tarot-next-step">
        <span className="eyebrow">Your next small move</span>
        <p>{reading.next_step}</p>
        {reading.astrology?.interpretation.next_step ? (
          <p className="tarot-next-step-chart">
            <strong>From your chart:</strong> {reading.astrology.interpretation.next_step}
          </p>
        ) : null}
      </div>
    </div>
  );
}
