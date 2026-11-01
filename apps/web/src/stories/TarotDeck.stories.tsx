import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TarotCard, tarotArtwork } from '@games/ui';

function TarotDeck({ suit = 'all', pending = false }: { suit?: string; pending?: boolean }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, padding: 20 }}>
      {Object.entries(tarotArtwork)
        .filter(([id]) => suit === 'all' || id.startsWith(`${suit}-`))
        .map(([id, art]) => (
          <TarotCard
            key={id}
            id={id}
            name={art.name}
            disabled={pending}
            onClick={() => undefined}
          />
        ))}
    </div>
  );
}
const meta = { title: 'Games/Tarot Deck', component: TarotDeck } satisfies Meta<typeof TarotDeck>;
export default meta;
type Story = StoryObj<typeof meta>;
export const All78: Story = {};
export const MajorArcana: Story = { args: { suit: 'major' } };
export const Wands: Story = { args: { suit: 'wands' } };
export const Cups: Story = { args: { suit: 'cups' } };
export const Swords: Story = { args: { suit: 'swords' } };
export const Pentacles: Story = { args: { suit: 'pentacles' } };
export const Pending: Story = { args: { suit: 'cups', pending: true } };
