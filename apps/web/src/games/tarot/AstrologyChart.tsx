'use client';
import { useId, useState } from 'react';
import { SegmentedTabs } from '@games/ui';
import type { AstrologyChart as ChartData, AstrologySystemChart } from '@games/api-client';
import {
  formatDegree,
  planetLabels,
  planetSymbols,
  signSymbols,
  wheelPoint,
} from './astrology-presentation';

type Selection = `planet:${string}` | `house:${number}`;
const vedicHouses = [
  { number: 1, points: '200,20 290,110 200,200 110,110', x: 200, y: 95 },
  { number: 2, points: '20,20 200,20 110,110', x: 110, y: 47 },
  { number: 3, points: '20,20 110,110 20,200', x: 55, y: 104 },
  { number: 4, points: '20,200 110,110 200,200 110,290', x: 104, y: 192 },
  { number: 5, points: '20,200 110,290 20,380', x: 55, y: 280 },
  { number: 6, points: '20,380 110,290 200,380', x: 110, y: 337 },
  { number: 7, points: '200,200 290,290 200,380 110,290', x: 200, y: 285 },
  { number: 8, points: '200,380 290,290 380,380', x: 290, y: 337 },
  { number: 9, points: '380,200 380,380 290,290', x: 345, y: 280 },
  { number: 10, points: '200,200 290,110 380,200 290,290', x: 296, y: 192 },
  { number: 11, points: '380,20 380,200 290,110', x: 345, y: 104 },
  { number: 12, points: '200,20 380,20 290,110', x: 290, y: 47 },
];

function WesternWheel({
  chart,
  selection,
  select,
  aspects,
}: {
  chart: AstrologySystemChart;
  selection: Selection;
  select: (value: Selection) => void;
  aspects: boolean;
}) {
  const id = useId();
  const ascendant = chart.ascendant.longitude;
  const markers = planetLabels(chart.placements, ascendant);
  const signOrder = [...chart.houses].sort((a, b) => a.sign_index - b.sign_index);
  return (
    <svg
      className="astrology-wheel"
      viewBox="0 0 480 480"
      role="group"
      aria-labelledby={`${id}-title ${id}-desc`}
      onClick={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) * 480) / bounds.width;
        const y = ((event.clientY - bounds.top) * 480) / bounds.height;
        const nearest = markers.reduce<(typeof markers)[number] | null>(
          (chosen, marker) =>
            !chosen ||
            Math.hypot(marker.label.x - x, marker.label.y - y) <
              Math.hypot(chosen.label.x - x, chosen.label.y - y)
              ? marker
              : chosen,
          null,
        );
        if (
          nearest &&
          Math.hypot(nearest.label.x - x, nearest.label.y - y) <= (22 * 480) / bounds.width
        )
          select(`planet:${nearest.point.id}`);
      }}
    >
      <title id={`${id}-title`}>Western tropical birth chart</title>
      <desc id={`${id}-desc`}>
        Signs surround the chart. Dots show calculated positions; leaders connect separated planet
        labels. Choose a planet, or use Inspect chart below.
      </desc>
      <circle cx="240" cy="240" r="211" className="astro-zodiac-ring" />
      <circle cx="240" cy="240" r="179" className="astro-inner-ring" />
      <circle cx="240" cy="240" r="164" className="astro-inner-ring" />
      {chart.houses.map((house) => {
        const outer = wheelPoint(house.start_longitude, ascendant, 211);
        const inner = wheelPoint(house.start_longitude, ascendant, 150);
        const label = wheelPoint(house.start_longitude + 15, ascendant, 171);
        return (
          <g key={house.number}>
            <line
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              className="astro-house-line"
            />
            <text x={label.x} y={label.y + 4} className="astro-house-number">
              {house.number}
            </text>
          </g>
        );
      })}
      {signOrder.map((house) => {
        const label = wheelPoint(house.start_longitude + 15, ascendant, 195);
        return (
          <text
            key={house.sign_index}
            x={label.x}
            y={label.y + 7}
            className="astro-sign"
            aria-label={house.sign}
          >
            {signSymbols[house.sign_index]}
            {String.fromCodePoint(0xfe0e)}
          </text>
        );
      })}
      {aspects
        ? chart.aspects
            .filter(
              (aspect) =>
                selection === `planet:${aspect.from_id}` || selection === `planet:${aspect.to_id}`,
            )
            .map((aspect) => {
              const from = chart.placements.find((point) => point.id === aspect.from_id);
              const to = chart.placements.find((point) => point.id === aspect.to_id);
              if (!from || !to) return null;
              const a = wheelPoint(from.longitude, ascendant, 162),
                b = wheelPoint(to.longitude, ascendant, 162);
              return (
                <line
                  key={`${aspect.from_id}-${aspect.to_id}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  className="astro-aspect"
                  data-kind={aspect.name}
                />
              );
            })
        : null}
      {markers.map(({ point, anchor, label }) => (
        <g key={point.id}>
          <line
            x1={anchor.x}
            y1={anchor.y}
            x2={label.x}
            y2={label.y}
            className="astro-planet-leader"
          />
          <circle cx={anchor.x} cy={anchor.y} r="3" className="astro-position-dot" />
          <g
            role="button"
            tabIndex={0}
            className="astro-planet-target"
            aria-pressed={selection === `planet:${point.id}`}
            aria-label={`${point.name}, ${point.sign}, ${formatDegree(point.degree)}, house ${point.house}${point.retrograde ? ', retrograde' : ''}`}
            data-point-id={point.id}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                select(`planet:${point.id}`);
              }
            }}
          >
            <circle
              cx={label.x}
              cy={label.y}
              r="3"
              className="astro-hit-area"
              vectorEffect="non-scaling-stroke"
            />
            <circle cx={label.x} cy={label.y} r="15" className="astro-planet-disc" />
            <text x={label.x} y={label.y + 7} className="astro-planet-symbol">
              {planetSymbols[point.id] || point.name.slice(0, 2)}
            </text>
          </g>
        </g>
      ))}
      <text x="22" y="244" className="astro-angle-label">
        ASC
      </text>
      <text x="240" y="244" className="astro-centre-label">
        Tropical
      </text>
    </svg>
  );
}

function VedicDiamond({
  chart,
  selection,
  select,
}: {
  chart: AstrologySystemChart;
  selection: Selection;
  select: (value: Selection) => void;
}) {
  const id = useId();
  return (
    <svg
      className="astrology-diamond"
      viewBox="0 0 400 400"
      role="group"
      aria-labelledby={`${id}-title ${id}-desc`}
    >
      <title id={`${id}-title`}>Vedic North Indian house chart</title>
      <desc id={`${id}-desc`}>
        House one is the upper central diamond. Houses have fixed positions; labels show each
        returned sidereal sign. Choose a house, or use Inspect chart below.
      </desc>
      {vedicHouses.map((geometry) => {
        const house = chart.houses.find((entry) => entry.number === geometry.number)!;
        const planets = chart.placements.filter((point) => point.house === house.number);
        const chosen =
          selection === `house:${house.number}` ||
          planets.some((point) => selection === `planet:${point.id}`);
        return (
          <g
            key={house.number}
            role="button"
            tabIndex={0}
            className="astro-vedic-house"
            aria-pressed={chosen}
            aria-label={`House ${house.number}, ${house.sign}: ${planets.map((point) => point.name).join(', ') || 'no planets'}`}
            onClick={() => select(`house:${house.number}`)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                select(`house:${house.number}`);
              }
            }}
          >
            <polygon points={geometry.points} />
            <text x={geometry.x} y={geometry.y - 8} className="astro-vedic-sign">
              {house.number} · {house.sign.slice(0, 3)}
            </text>
            <text x={geometry.x} y={geometry.y + 15} className="astro-vedic-planets">
              {planets
                .slice(0, 3)
                .map((point) => planetSymbols[point.id] || point.name.slice(0, 2))
                .join(' ')}
              {planets.length > 3 ? ` +${planets.length - 3}` : ''}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function SystemChart({ chart }: { chart: AstrologySystemChart }) {
  const [selection, setSelection] = useState<Selection>(`planet:${chart.placements[0].id}`);
  const [aspects, setAspects] = useState(false);
  const selectedPoint = chart.placements.find((point) => selection === `planet:${point.id}`);
  const selectedHouse = chart.houses.find((house) => selection === `house:${house.number}`);
  const names = new Map(chart.placements.map((point) => [point.id, point.name]));
  return (
    <section className="astrology-system" aria-label={chart.label}>
      <div className="astrology-chart-layout">
        <figure className="astrology-figure">
          {chart.system === 'western' ? (
            <WesternWheel
              chart={chart}
              selection={selection}
              select={setSelection}
              aspects={aspects}
            />
          ) : (
            <VedicDiamond chart={chart} selection={selection} select={setSelection} />
          )}
          <figcaption>
            {chart.system === 'western'
              ? 'Tropical zodiac'
              : `Sidereal zodiac · ${chart.ayanamsa_name || 'Calculated ayanamsa'}`}{' '}
            · Whole-sign houses
          </figcaption>
        </figure>
        <div className="astrology-chart-details">
          <label className="field">
            Inspect chart
            <select
              className="input"
              value={selection}
              onChange={(event) => setSelection(event.target.value as Selection)}
            >
              <optgroup label="Planets and lunar nodes">
                {chart.placements.map((point) => (
                  <option key={point.id} value={`planet:${point.id}`}>
                    {point.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Houses">
                {chart.houses.map((house) => (
                  <option key={house.number} value={`house:${house.number}`}>
                    House {house.number} · {house.sign}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>
          <div className="astrology-inspection" aria-live="polite">
            <h4>{selectedPoint?.name || `House ${selectedHouse?.number}`}</h4>
            {selectedPoint ? (
              <p>
                {selectedPoint.sign} · {formatDegree(selectedPoint.degree)}
                <br />
                House {selectedPoint.house}
                {selectedPoint.retrograde ? ' · Retrograde' : ''}
              </p>
            ) : (
              <p>
                {selectedHouse?.sign}
                <br />
                {chart.placements
                  .filter((point) => point.house === selectedHouse?.number)
                  .map((point) => point.name)
                  .join(', ') || 'No planets in this house.'}
              </p>
            )}
          </div>
          <dl className="astrology-angles">
            <div>
              <dt>{chart.system === 'vedic' ? 'Lagna / ascendant' : 'Ascendant'}</dt>
              <dd>
                {chart.ascendant.sign} · {formatDegree(chart.ascendant.degree)}
              </dd>
            </div>
            <div>
              <dt>Midheaven</dt>
              <dd>
                {chart.midheaven.sign} · {formatDegree(chart.midheaven.degree)}
              </dd>
            </div>
            {chart.moon_nakshatra ? (
              <div>
                <dt>Moon nakshatra</dt>
                <dd>
                  {chart.moon_nakshatra.name} · Pada {chart.moon_nakshatra.pada}
                </dd>
              </div>
            ) : null}
          </dl>
          {chart.system === 'western' ? (
            <label className="toggle-row astrology-aspect-toggle">
              <input
                type="checkbox"
                checked={aspects}
                onChange={(event) => setAspects(event.target.checked)}
              />
              Show selected planet’s aspects
            </label>
          ) : null}
          <details className="astrology-data">
            <summary>All placements</summary>
            <table>
              <caption>Calculated planet positions</caption>
              <thead>
                <tr>
                  <th>Body</th>
                  <th>Sign / degree</th>
                  <th>House</th>
                </tr>
              </thead>
              <tbody>
                {chart.placements.map((point) => (
                  <tr key={point.id}>
                    <th scope="row">
                      {point.name}
                      {point.retrograde ? <small>Retrograde</small> : null}
                    </th>
                    <td>
                      {point.sign}
                      <br />
                      {formatDegree(point.degree)}
                    </td>
                    <td>{point.house}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <table>
              <caption>Whole-sign houses</caption>
              <thead>
                <tr>
                  <th>House</th>
                  <th>Sign</th>
                </tr>
              </thead>
              <tbody>
                {chart.houses.map((house) => (
                  <tr key={house.number}>
                    <th scope="row">{house.number}</th>
                    <td>{house.sign}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
          <details className="astrology-data">
            <summary>Geometric aspects</summary>
            <p className="small muted">{chart.aspect_model}</p>
            {chart.aspects.length ? (
              <table>
                <caption>Calculated geometric aspects</caption>
                <thead>
                  <tr>
                    <th>Bodies</th>
                    <th>Aspect / orb</th>
                  </tr>
                </thead>
                <tbody>
                  {chart.aspects.map((aspect) => (
                    <tr key={`${aspect.from_id}-${aspect.to_id}`}>
                      <th scope="row">
                        {names.get(aspect.from_id)}
                        <br />
                        {names.get(aspect.to_id)}
                      </th>
                      <td>
                        {aspect.name}
                        <br />
                        {aspect.orb.toFixed(2)}° orb
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No major geometric aspects in this chart.</p>
            )}
          </details>
        </div>
      </div>
    </section>
  );
}

export function AstrologyChart({ chart }: { chart: ChartData }) {
  const [system, setSystem] = useState<'western' | 'vedic'>(chart.charts[0].system);
  const selected = chart.charts.find((entry) => entry.system === system) || chart.charts[0];
  return (
    <section className="astrology-chart" aria-label="Calculated birth charts">
      {chart.charts.length > 1 ? (
        <SegmentedTabs
          label="Birth chart system"
          value={selected.system}
          onValueChange={setSystem}
          items={chart.charts.map((entry) => ({
            value: entry.system,
            label: entry.system === 'western' ? 'Western' : 'Vedic',
            content: <SystemChart key={entry.system} chart={entry} />,
          }))}
        />
      ) : (
        <SystemChart key={selected.system} chart={selected} />
      )}
      <p className="astrology-calculation-note small muted">
        {chart.source} · {chart.calculation_version}
        <br />
        {chart.precision_note}
      </p>
    </section>
  );
}
