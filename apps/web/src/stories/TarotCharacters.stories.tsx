import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { tarotCharacters } from '@games/api-client/characters';
import { TarotCharacterImage } from '@/games/tarot/TarotCharacterImage';

function CharacterCatalogue() {
  return (
    <main style={{ padding: 24, maxWidth: 1200, margin: 'auto' }}>
      <h1>Tarot character artwork</h1>
      <div
        role="list"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 24,
        }}
      >
        {tarotCharacters.map((character) => (
          <div role="listitem" key={character.id} data-character={character.id}>
            <TarotCharacterImage character={character} />
            <p style={{ margin: '8px 0 0' }}>
              <strong>{character.name}</strong>
            </p>
            <small>{character.source}</small>
          </div>
        ))}
      </div>
    </main>
  );
}

const meta = { title: 'Games/Tarot characters', component: CharacterCatalogue } satisfies Meta<
  typeof CharacterCatalogue
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const CompleteCast: Story = {};
