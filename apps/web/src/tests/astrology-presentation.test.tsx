import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AstrologyChart } from '@/games/tarot/AstrologyChart';
import { AstrologyReading, chartPoints } from '@/games/tarot/AstrologyReading';
import { TarotReading } from '@/games/tarot/TarotReading';
import {
  formatDegree,
  planetLabels,
  wheelPoint,
  zodiacSign,
} from '@/games/tarot/astrology-presentation';
import { syntheticChart, syntheticAstrologyReading } from '@/stories/fixtures/astrology';
import { tarotReadingCards, tarotReadingExample } from '@/stories/fixtures/tarot-reading';

describe('authoritative astrology presentation', () => {
  it('uses the returned sign in each system and preserves the distinct Vedic emblems', () => {
    const [western, vedic] = syntheticChart.charts;
    const sunIn = (chart: typeof western) => chart.placements.find((point) => point.id === 'sun')!;
    expect(zodiacSign(sunIn(western), 'western')).toMatchObject({
      image: '/art/zodiac/capricorn.webp',
      label: 'Capricorn',
    });
    expect(zodiacSign(sunIn(vedic), 'vedic')).toMatchObject({
      image: '/art/zodiac/dhanu.webp',
      label: 'Dhanu (Sagittarius)',
    });
    const vedicArt = new Map(vedic.houses.map((house) => [house.sign, zodiacSign(house, 'vedic')]));
    expect(vedicArt.get('Gemini')?.image).toBe('/art/zodiac/mithuna.webp');
    expect(vedicArt.get('Capricorn')?.image).toBe('/art/zodiac/makara.webp');
    expect(vedicArt.get('Aquarius')?.image).toBe('/art/zodiac/kumbha.webp');
    for (const chart of [western, vedic]) {
      const images = chart.houses.map((house) => zodiacSign(house, chart.system).image);
      expect(new Set(images).size).toBe(12);
      expect(images).not.toContain(undefined);
    }
  });
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
    const calculationDetails = html.match(
      /<details class="astrology-data astrology-calculation-note">([\s\S]*?)<\/details>/,
    )?.[1];
    expect(calculationDetails).toContain('<summary>How this chart was calculated</summary>');
    expect(calculationDetails).toContain(syntheticChart.source);
    expect(calculationDetails).toContain(syntheticChart.calculation_version);
    expect(calculationDetails).toContain(syntheticChart.precision_note);
    const chartHints = [...html.matchAll(/aria-label="([^"]+)"[^>]*><title>(.*?)<\/title>/g)];
    expect(chartHints).toHaveLength(syntheticChart.charts[0].placements.length + 12);
    for (const [, accessibleLabel, hoverHint] of chartHints)
      expect(hoverHint).toBe(accessibleLabel);
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
    expect(extended.match(/Your connections/g)).toHaveLength(3);
    for (const card of tarotReadingExample.cards) expect(extended).toContain(card.interpretation);
    expect(extended).toContain(syntheticAstrologyReading.interpretation.tarot_connection);
  });
  it('reads each focus point as its label, its meaning, then what it could mean for the question', () => {
    const sun =
      'Sun is traditionally associated with vitality, Sagittarius with distant horizons, and house 9 with long journeys.';
    const forQuestion = 'For your question, this could point to exploring the wider path first.';
    const moon = 'Moon is traditionally associated with feelings and house 7 with partnership.';
    const normal = `Sun in Sagittarius, house 9: ${sun} ${forQuestion}\n\nMoon in Libra, house 7: ${moon}`;
    expect(chartPoints(normal)).toEqual([
      { label: 'Sun in Sagittarius, house 9', meaning: sun, forQuestion },
      { label: 'Moon in Libra, house 7', meaning: moon, forQuestion: undefined },
    ]);
    const astrology = {
      ...syntheticAstrologyReading,
      interpretation: {
        ...syntheticAstrologyReading.interpretation,
        western: { ...syntheticAstrologyReading.interpretation.western!, normal },
      },
    };
    const html = renderToStaticMarkup(<AstrologyReading astrology={astrology} />);
    expect(html).toContain('<h5>What these placements say about your question</h5>');
    expect(html).toContain(
      `<p class="astrology-point-label">Sun in Sagittarius, house 9</p><p>${sun}</p><p class="astrology-point-question">${forQuestion}</p>`,
    );
    expect(
      renderToStaticMarkup(<AstrologyReading astrology={astrology} asked={false} />),
    ).toContain('<h5>What these placements say</h5>');
  });
  it('keeps chart text saved in an older shape exactly as written', () => {
    // One unlabelled paragraph stays one paragraph.
    const { western } = syntheticAstrologyReading.interpretation;
    expect(chartPoints(western!.normal)).toEqual([
      { label: undefined, meaning: western!.normal, forQuestion: undefined },
    ]);
    // Labelled questions from an earlier profile keep their heading and their words.
    const questions =
      'Sun in Capricorn, house 10: What could steady effort offer here?\n\nMoon in Scorpio, house 8: Where might trust need time?';
    const html = renderToStaticMarkup(
      <AstrologyReading
        astrology={{
          ...syntheticAstrologyReading,
          interpretation: {
            ...syntheticAstrologyReading.interpretation,
            western: { ...western!, normal: questions },
          },
        }}
      />,
    );
    expect(html).toContain('<h5>The grounded read</h5>');
    expect(html).toContain(
      '<p class="astrology-point-label">Sun in Capricorn, house 10</p><p>What could steady effort offer here?</p>',
    );
    expect(html).toContain('<p>Where might trust need time?</p>');
  });
});
