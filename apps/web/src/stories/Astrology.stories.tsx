import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { AstrologyInput, AstrologyChart as ChartData } from '@games/api-client';
import { AstrologyChart } from '@/games/tarot/AstrologyChart';
import { AstrologyForm } from '@/games/tarot/AstrologyForm';
import { TarotReading } from '@/games/tarot/TarotReading';
import { syntheticChart, syntheticPlace, syntheticAstrologyReading } from './fixtures/astrology';
import { tarotReadingCards, tarotReadingExample } from './fixtures/tarot-reading';

function AstrologyPreview({
  view = 'both',
  pending = false,
}: {
  view?: 'off' | 'western' | 'vedic' | 'both' | 'saved' | 'recovered';
  pending?: boolean;
}) {
  const [input, setInput] = useState<AstrologyInput>();
  const [chart, setChart] = useState<ChartData | null>(null);
  const [reuse, setReuse] = useState(view === 'recovered');
  return (
    <main className="tarot-table" style={{ maxWidth: 1000 }}>
      <p className="small muted">
        Synthetic calculation fixture and clearly labeled layout copy. No personal data or AI
        requests.
      </p>
      {view === 'off' || view === 'recovered' ? (
        <form className="tarot-question" onSubmit={(event) => event.preventDefault()}>
          <AstrologyForm
            value={input}
            onChange={(next) => {
              setInput(next);
              setReuse(false);
            }}
            chart={chart}
            onChartChange={setChart}
            disabled={pending}
            savedChart={view === 'recovered' ? syntheticChart : null}
            reuseSaved={reuse}
            onUseSaved={() => {
              setInput(undefined);
              setReuse(true);
            }}
            searchPlaces={async () => ({
              places: [syntheticPlace],
              attribution: 'Synthetic place for UI review.',
            })}
            calculateChart={async () => ({ status: 'ready', chart: syntheticChart })}
          />
        </form>
      ) : view === 'saved' ? (
        <TarotReading
          cards={tarotReadingCards}
          reading={{ ...tarotReadingExample, astrology: syntheticAstrologyReading }}
        />
      ) : (
        <AstrologyChart
          chart={{
            ...syntheticChart,
            charts: syntheticChart.charts.filter(
              (entry) => view === 'both' || entry.system === view,
            ),
          }}
        />
      )}
    </main>
  );
}
const meta = { title: 'Games/Tarot astrology', component: AstrologyPreview } satisfies Meta<
  typeof AstrologyPreview
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const BothCharts: Story = {};
export const Western: Story = { args: { view: 'western' } };
export const Vedic: Story = { args: { view: 'vedic' } };
export const OptionalOff: Story = { args: { view: 'off' } };
export const SavedWithCards: Story = { args: { view: 'saved' } };
export const RecoveredChart: Story = { args: { view: 'recovered' } };
export const PendingRecovery: Story = { args: { view: 'recovered', pending: true } };
