'use client';
import { useState } from 'react';
import {
  tarotCardGuide,
  type TarotCardSide,
  type TarotOrientation,
} from '@games/api-client/card-guide';
import { SegmentedTabs, TarotCard } from '@games/ui';

export interface TarotCardGuideProps {
  cardId: string;
  /** Which side to show first. Both sides are always available from the switch. */
  orientation?: TarotOrientation;
  /** The spread position this card was drawn in, for example "Where you are". */
  position?: string;
  imageLoader?: (path: string) => string;
}

const suitNames: Record<string, string> = {
  wands: 'Suit of Wands',
  cups: 'Suit of Cups',
  swords: 'Suit of Swords',
  pentacles: 'Suit of Pentacles',
};
const sideLabels: Record<TarotOrientation, string> = { upright: 'Upright', reversed: 'Reversed' };

function SidePanel({ side, orientation }: { side: TarotCardSide; orientation: TarotOrientation }) {
  return (
    <div className="tarot-guide-side" data-side={orientation}>
      <ul className="tarot-guide-keywords" aria-label={`${sideLabels[orientation]} keywords`}>
        {side.keywords.map((keyword) => (
          <li key={keyword}>{keyword}</li>
        ))}
      </ul>
      <p className="tarot-guide-lead">{side.short}</p>
      <p className="tarot-guide-meaning">{side.meaning}</p>
      <dl className="tarot-guide-areas">
        <div>
          <dt>In love</dt>
          <dd>{side.love}</dd>
        </div>
        <div>
          <dt>In work</dt>
          <dd>{side.work}</dd>
        </div>
        <div>
          <dt>For yourself</dt>
          <dd>{side.self}</dd>
        </div>
      </dl>
      <div className="tarot-guide-advice">
        <h3>Try this</h3>
        <p>{side.advice}</p>
      </div>
    </div>
  );
}

/**
 * The full page for one card: the illustration, both orientations behind a switch, and
 * the parts that do not depend on orientation. Presentational only: the text comes from
 * the generated card guide and nothing here reads or changes a reading.
 */
export function TarotCardGuide({
  cardId,
  orientation = 'upright',
  position,
  imageLoader,
}: TarotCardGuideProps) {
  // The opening side follows the props; a new card or a new drawn side resets the switch.
  const opening = `${cardId}:${orientation}`;
  const [view, setView] = useState({ opening, shown: orientation });
  if (view.opening !== opening) setView({ opening, shown: orientation });
  const shown = view.opening === opening ? view.shown : orientation;

  const card = tarotCardGuide(cardId);
  if (!card)
    return (
      <p className="tarot-guide-missing" role="status">
        There is no guide entry for this card yet.
      </p>
    );

  const reversed = shown === 'reversed';
  const family =
    card.arcana === 'major'
      ? `Major Arcana · ${card.number_label}`
      : `${suitNames[card.suit ?? ''] ?? 'Minor Arcana'} · ${card.number_label}`;
  const correspondences = [
    ['Element', card.correspondences.element],
    ['Astrology', card.correspondences.astrology],
    ['Number', card.correspondences.number],
  ] as const;

  return (
    <article
      className="tarot-guide"
      data-card={card.id}
      data-orientation={shown}
      data-suit={card.suit ?? 'major'}
    >
      <div className="tarot-guide-layout">
        <div className="tarot-guide-stage">
          <div className="tarot-guide-card" data-reversed={reversed ? 'true' : 'false'}>
            <TarotCard
              id={card.id}
              name={card.name}
              label={reversed ? `${card.name}, shown reversed` : card.name}
              imageLoader={imageLoader}
            />
          </div>
          <p className="tarot-guide-showing" aria-live="polite">
            {reversed ? 'Shown reversed' : 'Shown upright'}
          </p>
        </div>

        <div className="tarot-guide-body">
          <header className="tarot-guide-header">
            <p className="tarot-guide-family">{family}</p>
            <h2 className="tarot-guide-name">{card.name}</h2>
            <p className="tarot-guide-essence">{card.essence}</p>
            {position ? (
              <p className="tarot-guide-position">
                <span>Drawn as</span> {position}
              </p>
            ) : null}
          </header>

          <SegmentedTabs
            className="tarot-guide-switch"
            label="Card orientation"
            value={shown}
            onValueChange={(next) => setView({ opening, shown: next })}
            items={(['upright', 'reversed'] as const).map((side) => ({
              value: side,
              label: sideLabels[side],
              content: <SidePanel side={card[side]} orientation={side} />,
            }))}
          />

          <section className="tarot-guide-section" aria-labelledby={`${card.id}-figure`}>
            <h3 id={`${card.id}-figure`}>Who you&rsquo;re looking at</h3>
            <p>{card.figure}</p>
          </section>

          <section className="tarot-guide-section" aria-labelledby={`${card.id}-symbols`}>
            <h3 id={`${card.id}-symbols`}>Symbols in this card</h3>
            <dl className="tarot-guide-symbols">
              {card.symbols.map((item) => (
                <div key={item.symbol}>
                  <dt>{item.symbol}</dt>
                  <dd>{item.meaning}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="tarot-guide-section" aria-labelledby={`${card.id}-correspondences`}>
            <h3 id={`${card.id}-correspondences`}>Correspondences</h3>
            <dl className="tarot-guide-correspondences">
              {correspondences.map(([kind, item]) => (
                <div key={kind}>
                  <dt>
                    <span>{kind}</span> {item.name}
                  </dt>
                  <dd>{item.gloss}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="tarot-guide-section" aria-labelledby={`${card.id}-questions`}>
            <h3 id={`${card.id}-questions`}>Questions to sit with</h3>
            <ul className="tarot-guide-questions">
              {card.questions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </article>
  );
}
