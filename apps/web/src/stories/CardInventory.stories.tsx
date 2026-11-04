import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CardPile, PlayingCard, type CardPresentation } from '@games/ui';
import inventory from './generated/card-faces.json';

type Family = 'shedding' | 'property' | 'grid' | 'standard' | 'flip';
type Face = {
  key: string;
  game: string;
  family: Family;
  kind: string;
  card: CardPresentation;
};
export const cardInventory = inventory as Face[];

/** Sizes each game really draws (measured in the midgame harness at 320, 390 and 1440). */
type Frame = { label: string; width: number; height: number; compact?: boolean; scale?: number };
const frames: Record<string, Frame[]> = {
  uno: [
    { label: 'hand 1440', width: 82, height: 116 },
    { label: 'hand phone', width: 69, height: 99 },
    { label: 'discard', width: 54, height: 78 },
    { label: 'activity phone', width: 45, height: 65, compact: true },
  ],
  'flip-7': [
    { label: 'row 1440', width: 54, height: 77, compact: true },
    { label: 'row phone', width: 45, height: 65, compact: true },
  ],
  skyjo: [
    { label: 'grid 390', width: 75, height: 112, compact: true },
    { label: 'grid 320', width: 64, height: 96, compact: true },
    { label: 'pile phone', width: 58, height: 84 },
  ],
  trio: [
    { label: 'table', width: 62, height: 88, compact: true },
    { label: 'hand 320', width: 46, height: 65, compact: true },
  ],
  'six-nimmt': [
    { label: 'hand', width: 75, height: 100 },
    { label: 'row 1440', width: 52, height: 70 },
    { label: 'row 390', width: 38, height: 55 },
    { label: 'row 320', width: 30, height: 46 },
  ],
  standard: [
    { label: 'hand 1440', width: 82, height: 116 },
    { label: 'hand phone', width: 69, height: 99 },
    { label: 'pile / board', width: 54, height: 77, compact: true },
    { label: 'phone table', width: 45, height: 65, compact: true },
    { label: 'phone seat', width: 35, height: 50, compact: true },
  ],
  deal: [
    { label: 'hand', width: 126, height: 178 },
    { label: 'board', width: 80, height: 114, compact: true },
    { label: 'discard 1440', width: 80, height: 114, compact: true, scale: 0.675 },
    { label: 'discard phone', width: 80, height: 114, compact: true, scale: 0.5 },
  ],
};
const frameSet = (game: string) =>
  frames[game] ||
  frames[game.replace('-no-mercy', '')] ||
  (game.startsWith('monopoly-deal') ? frames.deal : frames.uno);

function group(face: Face) {
  if (face.family === 'shedding') return face.card.color;
  if (face.family === 'flip')
    return face.kind === 'number' ? 'Numbers' : face.kind === 'modifier' ? 'Modifiers' : 'Actions';
  if (face.family === 'standard')
    return face.kind === 'joker' ? 'Jokers' : `${face.card.suit} ${face.card.color}`;
  if (face.family === 'grid') {
    if (face.game === 'six-nimmt') return `${face.card.subtitle} penalty`;
    return face.card.color;
  }
  if (face.kind === 'money') return 'Money';
  if (face.kind === 'property')
    return (face.card.colors?.length || 0) > 1
      ? `Wild · ${face.card.colors!.join(' / ')}`
      : 'Properties';
  return face.card.effect?.startsWith('rent') ? 'Rent' : 'Actions';
}

const frameStyle = `
.card-inventory-frame > .playing-card {
  width: var(--inventory-width) !important;
  height: var(--inventory-height) !important;
  --card-width: var(--inventory-width) !important;
  --card-height: var(--inventory-height) !important;
}
.card-inventory-frame { display: grid; justify-items: center; gap: 4px; align-content: end; }
.card-inventory-frame[data-scaled] > .playing-card {
  scale: var(--inventory-scale);
  margin: calc((var(--inventory-scale) - 1) * var(--inventory-height) / 2)
    calc((var(--inventory-scale) - 1) * var(--inventory-width) / 2);
}
.card-inventory-frame > small { font-size: 11px; color: var(--color-ink-muted); white-space: nowrap; }
`;

function CardInventory({ game = 'uno', family }: { game?: string; family?: Family }) {
  const faces = cardInventory.filter((face) => face.game === game);
  const groups = [...new Set(faces.map(group))];
  const sizes = frameSet(game);
  return (
    <main style={{ maxWidth: 1280, margin: 'auto', padding: '12px 0', display: 'grid', gap: 24 }}>
      <style>{frameStyle}</style>
      <header>
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>{game} · complete face inventory</h1>
        <p>
          {faces.length} canonical faces and orientations, each at the sizes the game draws:{' '}
          {sizes.map((size) => `${size.label} ${size.width}×${size.height}`).join(', ')}.
        </p>
      </header>
      {groups.map((name) => (
        <section key={name} data-card-group={name}>
          <h2 style={{ fontSize: 16, marginBottom: 12 }}>{name}</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fill,minmax(${Math.max(
                200,
                sizes.reduce((sum, size) => sum + size.width + 10, 24),
              )}px,1fr))`,
              gap: 12,
            }}
          >
            {faces
              .filter((face) => group(face) === name)
              .map((face) => (
                <figure
                  key={face.key}
                  data-face-key={face.key}
                  style={{
                    minWidth: 0,
                    margin: 0,
                    padding: 10,
                    border: '1px solid var(--color-border)',
                    borderRadius: 12,
                    background: 'var(--color-surface)',
                  }}
                >
                  <div
                    className="card-inventory-frames"
                    style={{ display: 'flex', alignItems: 'end', gap: 8, minHeight: 130 }}
                  >
                    {sizes.map((size) => (
                      <div
                        key={size.label}
                        className="card-inventory-frame"
                        data-frame={size.label}
                        data-scaled={size.scale ? true : undefined}
                        style={
                          {
                            '--inventory-width': `${size.width}px`,
                            '--inventory-height': `${size.height}px`,
                            '--inventory-scale': size.scale ?? 1,
                          } as CSSProperties
                        }
                      >
                        <PlayingCard
                          card={face.card}
                          family={family || face.family}
                          compact={size.compact}
                        />
                        <small>
                          {size.scale ? `${Math.round(size.width * size.scale)}` : size.width}
                        </small>
                      </div>
                    ))}
                  </div>
                  <figcaption
                    style={{
                      fontSize: 11,
                      lineHeight: 1.45,
                      marginTop: 8,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {face.card.label}
                    {face.kind === 'property' && (face.card.colors?.length || 0) > 1
                      ? ` · ${face.card.color} active`
                      : ''}
                  </figcaption>
                </figure>
              ))}
          </div>
        </section>
      ))}
      <section data-card-group="Interactive states">
        <h2 style={{ fontSize: 16 }}>Interactive states</h2>
        <div style={{ display: 'flex', gap: 20, padding: '24px 8px 8px' }}>
          <PlayingCard
            card={faces[0].card}
            family={family || faces[0].family}
            selected
            onClick={() => undefined}
          />
          <PlayingCard
            card={faces.at(-1)!.card}
            family={family || faces[0].family}
            disabled
            onClick={() => undefined}
          />
          <PlayingCard
            card={faces[0].card}
            family={family || faces[0].family}
            playable
            onClick={() => undefined}
          />
          <PlayingCard
            card={faces.at(-1)!.card}
            family={family || faces[0].family}
            playable={false}
            onClick={() => undefined}
          />
          <PlayingCard faceDown family={family || faces[0].family} />
        </div>
      </section>
    </main>
  );
}

/** Every pile state a table can show, including an emptied discard. */
function PileStates() {
  const standard = cardInventory.find((face) => face.key === 'standard:JD')!.card;
  const uno = cardInventory.find((face) => face.key === 'uno:classic:green:7')!.card;
  const sky = cardInventory.find((face) => face.key === 'skyjo:-2')!.card;
  const piles: {
    title: string;
    label: string;
    family: Family;
    card?: CardPresentation;
    count?: number;
  }[] = [
    { title: 'Rummy draw pile', label: 'Draw pile', family: 'standard', count: 31 },
    { title: 'Rummy discard', label: 'Discard', family: 'standard', card: standard },
    { title: 'Rummy discard just taken', label: 'Discard', family: 'standard' },
    { title: 'Uno draw pile', label: 'Draw pile', family: 'shedding', count: 70 },
    { title: 'Uno discard', label: 'Discard', family: 'shedding', card: uno },
    { title: 'Empty draw pile', label: 'Draw pile', family: 'shedding', count: 0 },
    { title: 'Skyjo draw', label: 'Draw', family: 'grid', count: 98 },
    { title: 'Skyjo discard', label: 'Discard', family: 'grid', card: sky },
  ];
  return (
    <main style={{ padding: 24, display: 'grid', gap: 18 }}>
      <h1 style={{ fontSize: 22 }}>Pile states</h1>
      <div
        className="card-game-layout"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 28,
          padding: 24,
          borderRadius: 18,
          background: 'var(--color-pine)',
          color: 'var(--color-white)',
        }}
      >
        {piles.map((pile) => (
          <div key={pile.title} data-pile={pile.title} style={{ display: 'grid', gap: 8 }}>
            <CardPile label={pile.label} card={pile.card} count={pile.count} family={pile.family} />
            <small style={{ fontSize: 11, maxWidth: 110 }}>{pile.title}</small>
          </div>
        ))}
      </div>
    </main>
  );
}

const meta = { title: 'Games/Card inventory', component: CardInventory } satisfies Meta<
  typeof CardInventory
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Uno: Story = { args: { game: 'uno' } };
export const UnoNoMercy: Story = { args: { game: 'uno-no-mercy' } };
export const Deal: Story = { args: { game: 'monopoly-deal' } };
export const DealNoMercy: Story = { args: { game: 'monopoly-deal-no-mercy' } };
export const Flip7: Story = { name: 'Flip 7', args: { game: 'flip-7' } };
/** The same faces passed through the Uno family, as older Flip 7 tables did. */
export const Flip7SheddingFamily: Story = {
  name: 'Flip 7 via shedding family',
  args: { game: 'flip-7', family: 'shedding' },
};
export const Skyjo: Story = { args: { game: 'skyjo' } };
export const Trio: Story = { args: { game: 'trio' } };
export const SixNimmt: Story = { name: '6 nimmt!', args: { game: 'six-nimmt' } };
export const StandardDeck: Story = { name: 'Standard deck', args: { game: 'standard' } };
export const Piles: StoryObj = { render: () => <PileStates /> };
