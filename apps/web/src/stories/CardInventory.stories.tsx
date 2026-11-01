import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PlayingCard, type CardPresentation } from '@games/ui';
import inventory from './generated/card-faces.json';

type Face = {
  key: string;
  game: string;
  family: 'shedding' | 'property';
  kind: string;
  card: CardPresentation;
};
export const cardInventory = inventory as Face[];
function group(face: Face) {
  if (face.family === 'shedding') return face.card.color;
  if (face.kind === 'money') return 'Money';
  if (face.kind === 'property')
    return (face.card.colors?.length || 0) > 1
      ? `Wild · ${face.card.colors!.join(' / ')}`
      : 'Properties';
  return face.card.effect?.startsWith('rent') ? 'Rent' : 'Actions';
}
function CardInventory({ game = 'uno' }: { game?: string }) {
  const faces = cardInventory.filter((face) => face.game === game);
  const groups = [...new Set(faces.map(group))];
  return (
    <main style={{ maxWidth: 1120, margin: 'auto', padding: '12px 0', display: 'grid', gap: 24 }}>
      <header>
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>{game} · complete face inventory</h1>
        <p>
          {faces.length} canonical faces and orientations. Each face uses normal and compact frames.
        </p>
      </header>
      {groups.map((name) => (
        <section key={name} data-card-group={name}>
          <h2 style={{ fontSize: 16, marginBottom: 12 }}>{name}</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(168px,1fr))',
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
                    style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 130 }}
                  >
                    <PlayingCard card={face.card} family={face.family} />
                    <PlayingCard card={face.card} family={face.family} compact />
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
            family={faces[0].family}
            selected
            onClick={() => undefined}
          />
          <PlayingCard
            card={faces.at(-1)!.card}
            family={faces[0].family}
            disabled
            onClick={() => undefined}
          />
          <PlayingCard faceDown />
        </div>
      </section>
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
