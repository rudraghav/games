'use client';
import { useId, useState } from 'react';
import { Button } from '@games/ui';
import type { AstrologyReading as SavedAstrology } from '@games/api-client';
import { AstrologyChart } from './AstrologyChart';
import { formatDegree } from './astrology-presentation';

export function AstrologyReading({ astrology }: { astrology: SavedAstrology }) {
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
                  <h5>The grounded read</h5>
                  <p>{section.normal}</p>
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
        <section className="astrology-interpretation">
          <h4>A small next move</h4>
          <p>{astrology.interpretation.next_step}</p>
        </section>
      </div>
    </section>
  );
}
