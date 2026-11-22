'use client';
import { useId, useState } from 'react';
import { ArrowDown, Sparkles } from 'lucide-react';
import { TarotCard } from '@games/ui';
import type { ReadingStyle } from '@games/api-client';
import { tarotCharacter } from '@games/api-client/characters';
import { TarotCharacterImage } from './TarotCharacterImage';
import { AstrologyReading } from './AstrologyReading';
import { TarotCardDetail, type DetailCard } from './TarotCardDetail';
import { ReadingShare } from './ReadingShare';
import { asksOnly, readingAsText } from './reading-text';
import { positionMeaning } from './spread';
import {
  nameWithOrientation,
  orientationLabel,
  orientationOf,
  type Orientation,
  type Reading,
} from './orientation';

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

function CharacterConnections({
  card,
  fun,
  asked,
}: {
  card: Reading['cards'][number];
  fun: boolean;
  /** Whether a question was asked: the bridge speaks to it, or to the spread in general. */
  asked: boolean;
}) {
  // Fun: the one generated line about the portrait. The figure, scene and move stay editorial.
  const bridge = fun && card.characters?.length ? card.pop_culture?.trim() : undefined;
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
                {bridge ? (
                  <div className="tarot-figure-bridge">
                    <h5>
                      {asked ? 'What this means for your question' : 'What this could mean for you'}
                    </h5>
                    <p>{bridge}</p>
                  </div>
                ) : null}
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

/**
 * One card, in reading order: what it says about the question, the figure with what
 * its move means for the question, then the image. A Fun reading saved before the
 * bridge keeps its original order and labels.
 */
function CardSections({
  card,
  fun,
  asked,
  meaning,
  classicView,
}: {
  card: Reading['cards'][number];
  fun: boolean;
  asked: boolean;
  /** The card's own meaning, shown in the Classic view of a Fun reading. */
  meaning?: string;
  classicView: boolean;
}) {
  const twist = classicView ? undefined : card.quirky_interpretation;
  const original = fun && !card.pop_culture;
  const figure =
    fun || !classicView ? <CharacterConnections card={card} fun={fun} asked={asked} /> : null;
  const says = (
    <section aria-labelledby={`${card.card_id}-grounded`}>
      <h4 id={`${card.card_id}-grounded`}>
        {original || asksOnly(card.interpretation)
          ? 'The grounded read'
          : asked
            ? 'What this card says about your question'
            : 'What this card says'}
      </h4>
      <p>{card.interpretation}</p>
    </section>
  );
  const plotTwist = twist ? (
    <section className="tarot-quirky-read" aria-labelledby={`${card.card_id}-quirky`}>
      <h4 id={`${card.card_id}-quirky`}>
        <Sparkles size={16} aria-hidden="true" /> The plot twist
      </h4>
      <p>{twist}</p>
    </section>
  ) : null;
  const cardMeaning = meaning ? (
    <section aria-labelledby={`${card.card_id}-meaning`}>
      <h4 id={`${card.card_id}-meaning`}>Card meaning</h4>
      <p>{meaning}</p>
    </section>
  ) : null;
  if (original)
    return (
      <>
        {figure}
        <div className="tarot-perspectives" data-variant={meaning || twist ? 'split' : 'single'}>
          {cardMeaning}
          {says}
          {plotTwist}
        </div>
      </>
    );
  return (
    <>
      <div className="tarot-perspectives" data-variant={meaning ? 'split' : 'single'}>
        {cardMeaning}
        {says}
      </div>
      {figure}
      {plotTwist ? (
        <div className="tarot-perspectives" data-variant="single">
          {plotTwist}
        </div>
      ) : null}
    </>
  );
}

/** A quiet placeholder with the reading's shape while a saved view is being opened. */
export function ReadingSkeleton({ label }: { label?: string }) {
  return (
    <div
      className="tarot-reading-skeleton"
      role={label ? 'status' : undefined}
      aria-hidden={label ? undefined : true}
    >
      {label ? <span className="sr-only">{label}</span> : null}
      {[0, 1, 2].map((block) => (
        <div key={block} aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}

export function TarotReading({
  reading,
  readingStyle = 'classic',
  cardMeanings = false,
  cards,
  imageLoader,
  summary = false,
  question,
  savedHref,
}: {
  reading: Reading;
  readingStyle?: ReadingStyle;
  cardMeanings?: boolean;
  /** The drawn cards. `subtitle` is the meaning for the orientation the card was drawn in. */
  cards: readonly { id: string; label: string; subtitle?: string; orientation?: Orientation }[];
  imageLoader?: (path: string) => string;
  /** Open with "In short": the one-sentence synthesis, the three cards and the next step. */
  summary?: boolean;
  /** The saved question, included when the reading is copied or shared. */
  question?: string;
  /** Where this viewer's private saved copy lives. */
  savedHref?: string;
}) {
  const [detail, setDetail] = useState<DetailCard | null>(null);
  const summaryId = useId();
  const fun = readingStyle === 'fun';
  const asked = !!question?.trim();
  const deckCards = new Map(cards.map((card) => [card.id, card]));
  // The orientation saved with the reading; an older section falls back to the drawn card.
  const drawnAs = (section: Reading['cards'][number]): Orientation =>
    section.orientation ?? orientationOf(deckCards.get(section.card_id));
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
    <div className="tarot-reading" data-summary={summary || undefined}>
      {summary ? (
        <section className="tarot-summary" aria-labelledby={summaryId}>
          <h3 className="eyebrow" id={summaryId}>
            In short
          </h3>
          <p className="tarot-summary-lead">{reading.introduction}</p>
          <div className="tarot-summary-step">
            <span className="eyebrow">Next small move</span>
            <p>{reading.next_step}</p>
          </div>
          <ol className="tarot-summary-cards" aria-label="Jump to a card">
            {reading.cards.map((card) => (
              <li key={card.card_id}>
                <a href={`#reading-${card.card_id}`}>
                  <span>{card.position}</span>
                  <strong>
                    {deckCards.get(card.card_id)?.label || card.title}
                    {drawnAs(card) === 'reversed' ? (
                      <span className="tarot-summary-reversed"> · Reversed</span>
                    ) : null}
                  </strong>
                  <ArrowDown size={14} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
      {reading.cards.map((card) => (
        <article key={card.card_id} id={`reading-${card.card_id}`}>
          <header className="tarot-reading-card-heading">
            {deckCards.has(card.card_id) ? (
              <TarotCard
                compact
                id={card.card_id}
                name={deckCards.get(card.card_id)?.label}
                label={`View ${deckCards.get(card.card_id)?.label} card`}
                reversed={drawnAs(card) === 'reversed'}
                tip="Open the full card"
                imageLoader={imageLoader}
                onClick={() =>
                  setDetail({
                    ...deckCards.get(card.card_id)!,
                    position: card.position,
                    orientation: drawnAs(card),
                  })
                }
              />
            ) : null}
            <div>
              <span className="eyebrow">
                {card.position}
                {card.title.toLocaleLowerCase() !==
                deckCards.get(card.card_id)?.label.toLocaleLowerCase()
                  ? ` · ${nameWithOrientation(deckCards.get(card.card_id)?.label || card.card_id, drawnAs(card))}`
                  : drawnAs(card) === 'reversed'
                    ? ' · Reversed'
                    : ''}
              </span>
              <h3>{card.title}</h3>
              {positionMeaning(card.position) ? (
                <p className="tarot-position-meaning" data-orientation={drawnAs(card)}>
                  <span>{orientationLabel[drawnAs(card)]}</span>
                  {positionMeaning(card.position)}
                </p>
              ) : null}
            </div>
          </header>
          <CardSections
            card={card}
            fun={fun}
            asked={asked}
            meaning={cardMeanings ? deckCards.get(card.card_id)?.subtitle : undefined}
            classicView={cardMeanings}
          />
        </article>
      ))}
      {reading.astrology ? <AstrologyReading astrology={reading.astrology} asked={asked} /> : null}
      <div className="tarot-next-step">
        <span className="eyebrow">Your next small move</span>
        <p>{reading.next_step}</p>
        {reading.astrology?.interpretation.next_step ? (
          <p className="tarot-next-step-chart">
            <strong>From your chart:</strong> {reading.astrology.interpretation.next_step}
          </p>
        ) : null}
      </div>
      <ReadingShare
        title={reading.title}
        savedHref={savedHref}
        text={() => readingAsText({ reading, cards, question })}
      />
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
      <TarotCardDetail card={detail} onClose={() => setDetail(null)} imageLoader={imageLoader} />
    </div>
  );
}
