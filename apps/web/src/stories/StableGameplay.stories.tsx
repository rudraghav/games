import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button, DecisionDock, Hand, PlayingCard, TableDecisionPanel } from '@games/ui';
import { mapRoom } from '@games/api-client/mappers';
import { fixtures } from './generated/rooms';

const maximumUno = fixtures.find(
  (fixture) => fixture.room.game_id === 'uno' && fixture.room.capacity === 10,
)!;
const maximumCards = mapRoom(maximumUno.room).game!.hand;
const referenceCards = mapRoom(
  fixtures.find((fixture) => fixture.room.game_id === 'deal' && fixture.room.capacity === 2)!.room,
).game!.hand.slice(0, 3);

type PreviewProps = {
  view?: 'dock' | 'hand' | 'panel';
  size?: 'compact' | 'standard' | 'extended';
  pending?: boolean;
};

function DockPreview({
  size,
  pending,
}: {
  size: NonNullable<PreviewProps['size']>;
  pending: boolean;
}) {
  const [choice, setChoice] = useState<string | null>(null);
  const choices =
    size === 'compact'
      ? ['Draw a card', 'End turn']
      : size === 'standard'
        ? ['Red', 'Yellow', 'Green', 'Blue']
        : maximumUno.room.members.map((member) => member.name);
  return (
    <div style={{ maxWidth: 760, display: 'grid', gap: 14 }}>
      <DecisionDock
        size={size}
        pending={pending}
        label="Move choices"
        style={{ padding: 8, border: '1px solid var(--color-border)', borderRadius: 12 }}
      >
        <p style={{ minHeight: 24, marginBottom: 8 }} aria-live="polite">
          {pending ? 'Saving your move…' : choice || 'Choose your move'}
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {choices.map((label) => (
            <Button
              key={label}
              variant={choice === label ? 'primary' : 'secondary'}
              pending={pending}
              aria-pressed={choice === label}
              onClick={() => setChoice(label)}
            >
              {label}
            </Button>
          ))}
        </div>
      </DecisionDock>
      <p className="small muted">The card row keeps its place while a choice changes.</p>
      <Hand cards={maximumCards.slice(0, 4)} family="shedding" compact />
    </div>
  );
}

function MaximumHandPreview({ pending }: { pending: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div style={{ maxWidth: 840 }}>
      <h2 className="heading-md">Your hand · {maximumCards.length} cards</h2>
      <p className="small muted" style={{ minHeight: 24, marginBlock: 12 }} aria-live="polite">
        {maximumCards.find((card) => card.id === selected)?.label || 'Select a card'}
      </p>
      <Hand
        label="Maximum Uno hand"
        cards={maximumCards}
        family="shedding"
        selectedIds={selected ? [selected] : []}
        disabled={pending}
        onSelect={(id) => setSelected((current) => (current === id ? null : id))}
      />
    </div>
  );
}

function ModelessPanelPreview() {
  const [open, setOpen] = useState(true);
  const [inspections, setInspections] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  return (
    <div
      style={{ maxWidth: 1000, minHeight: 500, display: 'grid', alignContent: 'start', gap: 14 }}
    >
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button onClick={() => setOpen(true)}>Choose a move</Button>
        <Button variant="secondary" disabled={!open} onClick={() => setOpen(false)}>
          Clear move
        </Button>
      </div>
      <section className="card-table" style={{ maxWidth: 570 }} aria-label="Public table preview">
        <div className="center-piles" style={{ flexWrap: 'wrap', gap: 12 }}>
          {referenceCards.map((card) => (
            <PlayingCard key={card.id} card={card} family="property" compact />
          ))}
        </div>
        <Button variant="secondary" onClick={() => setInspections((count) => count + 1)}>
          Inspect public table
        </Button>
      </section>
      <output className="small" aria-live="polite">
        {choice || `Table inspections: ${inspections}`}
      </output>
      <TableDecisionPanel open={open} onOpenChange={setOpen} title="Move options">
        <p className="small muted" style={{ marginBlock: 12 }}>
          Use View table or hold Space to peek. The table controls remain available.
        </p>
        <div style={{ display: 'grid', gap: 8 }}>
          {['Place property', 'Bank card'].map((label) => (
            <Button
              key={label}
              onClick={() => {
                setChoice(label);
                setOpen(false);
              }}
            >
              {label}
            </Button>
          ))}
        </div>
      </TableDecisionPanel>
    </div>
  );
}

function StableGameplayPreview({
  view = 'dock',
  size = 'standard',
  pending = false,
}: PreviewProps) {
  if (view === 'hand') return <MaximumHandPreview pending={pending} />;
  if (view === 'panel') return <ModelessPanelPreview />;
  return <DockPreview key={size} size={size} pending={pending} />;
}

const meta = {
  title: 'Games/Stable gameplay',
  component: StableGameplayPreview,
} satisfies Meta<typeof StableGameplayPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Compact: Story = { args: { size: 'compact' } };
export const Standard: Story = {};
export const Extended: Story = { args: { size: 'extended' } };
export const Pending: Story = { args: { pending: true } };
export const MaximumHand: Story = { args: { view: 'hand' } };
export const MaximumHandPending: Story = { args: { view: 'hand', pending: true } };
export const ModelessPeek: Story = { args: { view: 'panel' } };
