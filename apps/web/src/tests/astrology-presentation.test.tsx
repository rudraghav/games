import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AstrologyChart } from '@/games/tarot/AstrologyChart';
import { TarotReading } from '@/games/tarot/TarotReading';
import { formatDegree, planetLabels, wheelPoint } from '@/games/tarot/astrology-presentation';
import { syntheticChart, syntheticAstrologyReading } from '@/stories/fixtures/astrology';
import { tarotReadingCards, tarotReadingExample } from '@/stories/fixtures/tarot-reading';

describe('authoritative astrology presentation', () => {
  it('formats sign-relative degrees without inventing the next sign', () => {
    expect(formatDegree(29.999999)).toBe('29° 59′');
    expect(formatDegree(29.99999999999999)).toBe('29° 59′');
    expect(formatDegree(0)).toBe('0° 00′');
    expect(formatDegree(12.5)).toBe('12° 30′');
  });
  it('spreads crowded labels while retaining every exact calculated anchor', () => {
    const chart = syntheticChart.charts[0];
    const crowded = chart.placements.map((point, index) => ({
      ...point,
      longitude: 359 + index / 100,
    }));
    const labels = planetLabels(crowded, chart.ascendant.longitude);
    expect(labels.map((item) => item.point.id).sort()).toEqual(
      crowded.map((point) => point.id).sort(),
    );
    expect(
      new Set(labels.map((item) => `${item.label.x.toFixed(2)},${item.label.y.toFixed(2)}`)).size,
    ).toBe(crowded.length);
    for (const label of labels)
      expect(label.anchor).toEqual(
        wheelPoint(label.point.longitude, chart.ascendant.longitude, 166),
      );
  });
  it('renders both computed systems with real placement tables and no birth inputs', () => {
    const html = renderToStaticMarkup(<AstrologyChart chart={syntheticChart} />);
    expect(html).toContain('Western tropical birth chart');
    expect(html).toContain('Vedic North Indian house chart');
    expect(html).toContain('Whole-sign houses');
    expect(html).toContain(syntheticChart.charts[1].ayanamsa_name!);
    expect(html).toContain(syntheticChart.charts[1].moon_nakshatra!.name);
    expect(html).not.toContain('birth_date');
    expect(html).not.toContain('2000-01-01');
    for (const chart of syntheticChart.charts)
      for (const point of chart.placements) {
        expect(html).toContain(point.name);
        expect(html).toContain(formatDegree(point.degree));
      }
  });
  it('preserves all card layers and legacy readings independently of the optional chart', () => {
    const ordinary = renderToStaticMarkup(
      <TarotReading reading={tarotReadingExample} cards={tarotReadingCards} />,
    );
    expect(ordinary).not.toContain('Saved astrology reading');
    const extended = renderToStaticMarkup(
      <TarotReading
        reading={{ ...tarotReadingExample, astrology: syntheticAstrologyReading }}
        cards={tarotReadingCards}
      />,
    );
    expect(extended).toContain('Saved astrology reading');
    expect(extended.match(/Your character energy/g)).toHaveLength(3);
    for (const card of tarotReadingExample.cards) expect(extended).toContain(card.interpretation);
    expect(extended).toContain(syntheticAstrologyReading.interpretation.tarot_connection);
  });
});
