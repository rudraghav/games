'use client';
import { useId, useState } from 'react';
import { Button } from '@games/ui';
import type { AstrologyReading as SavedAstrology } from '@games/api-client';
import { AstrologyChart } from './AstrologyChart';
import { formatDegree } from './astrology-presentation';
import { asksOnly } from './reading-text';

/**
 * A chart perspective as its focus points: the computed label, what the placement is
 * traditionally associated with, then what that could mean for the question. Text
 * saved without that shape stays one paragraph, exactly as written.
 */
/** Chart text saved before it had to explain itself: every focus point is a lone question. */
function asksOnlyChart(normal: string) {
  return chartPoints(normal).every((point) => !point.forQuestion && asksOnly(point.meaning));
}

export function chartPoints(normal: string) {
  return normal
    .split(/\n\s*\n|\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => {
      const label = paragraph.match(/^([^:.!?\n]{2,60}?, house \d{1,2}):\s+(?=\S)/);
      const body = label ? paragraph.slice(label[0].length) : paragraph;
      const turn = body.search(/\bFor (?:your question|whatever you are carrying)\b/);
      return {
        label: label?.[1],
        meaning: turn > 0 ? body.slice(0, turn).trim() : body,
        forQuestion: turn > 0 ? body.slice(turn).trim() : undefined,
      };
    });
}

export function AstrologyReading({
  astrology,
  asked = true,
}: {
  astrology: SavedAstrology;
  /** Whether a question was asked; the headings speak to it or to the spread in general. */
  asked?: boolean;
}) {
  const [visible, setVisible] = useState(true);
  const id = useId();
  return (
    <section className="astrology-saved" aria-label="Saved astrology reading">
      <div className="astrology-saved-heading">
        <h3>Your chart reading</h3>
        <Button
          type="button"
          variant="secondary"
          aria-expanded={visible}
          aria-controls={id}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? 'Hide charts' : 'Show charts'}
        </Button>
      </div>
      <div id={id} hidden={!visible}>
        <AstrologyChart chart={astrology.chart} />
      </div>
      <div className="astrology-interpretations">
        {(['western', 'vedic'] as const).map((system) => {
          const section = astrology.interpretation[system];
          const chart = astrology.chart.charts.find((entry) => entry.system === system);
          const points = chart ? [...chart.placements, chart.ascendant, chart.midheaven] : [];
          const anchors =
            section?.focus_points
              .map((id) => points.find((point) => point.id === id))
              .filter((point) => !!point) || [];
          return section ? (
            <section
              className="astrology-interpretation"
              key={system}
              aria-label={`${system === 'western' ? 'Western' : 'Vedic'} interpretation`}
            >
              <h4>{system === 'western' ? 'Western' : 'Vedic'} perspective</h4>
              {anchors.length ? (
                <p
                  className="astrology-reading-anchors"
                  aria-label={`${system === 'western' ? 'Western' : 'Vedic'} reading placements`}
                >
                  {anchors
                    .map(
                      (point) =>
                        `${point.name} in ${point.sign} ${formatDegree(point.degree)} · house ${point.house}`,
                    )
                    .join(' / ')}
                </p>
              ) : null}
              <div className="tarot-perspectives" data-variant="split">
                <section>
                  <h5>
                    {asksOnlyChart(section.normal)
                      ? 'The grounded read'
                      : asked
                        ? 'What these placements say about your question'
                        : 'What these placements say'}
                  </h5>
                  <div className="astrology-points">
                    {chartPoints(section.normal).map((point, index) => (
                      <div className="astrology-point" key={index}>
                        {point.label ? (
                          <p className="astrology-point-label">{point.label}</p>
                        ) : null}
                        <p>{point.meaning}</p>
                        {point.forQuestion ? (
                          <p className="astrology-point-question">{point.forQuestion}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </section>
                <section className="tarot-quirky-read">
                  <h5>The plot twist</h5>
                  <p>{section.quirky}</p>
                </section>
              </div>
            </section>
          ) : null;
        })}
        <section className="astrology-interpretation">
          <h4>How it meets your cards</h4>
          <p>{astrology.interpretation.tarot_connection}</p>
        </section>
      </div>
    </section>
  );
}
