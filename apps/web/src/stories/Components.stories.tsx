import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  Button,
  DevelopmentCard,
  Hand,
  PlayingCard,
  ResourceToken,
  Seat,
  TarotCard,
  WordTile,
} from '@games/ui';
const card = {
  id: 'demo',
  label: 'Ace of hearts',
  value: 'A',
  suit: '♥',
  color: 'red',
  subtitle: '',
};
function Components() {
  return (
    <div style={{ display: 'grid', gap: 30, maxWidth: 900 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {(['primary', 'secondary', 'ghost', 'danger'] as const).map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
        <Button pending>Saving</Button>
        <Button disabled>Disabled</Button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        <PlayingCard card={card} />
        <PlayingCard card={{ ...card, value: '+10', color: 'wild' }} family="shedding" />
        <PlayingCard
          family="property"
          card={{ ...card, value: '3M', subtitle: 'Garden district', color: 'green' }}
        />
        <PlayingCard family="grid" card={{ ...card, value: '-2', color: 'blue' }} />
        <PlayingCard faceDown />
        <TarotCard id="major-02" name="The High Priestess" />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        <Seat name="An exceptionally long player name" avatar={2} active />
        <Seat name="Mira" ready />
        <Seat name="Dev" connected={false} />
        <Seat />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {(['unknown', 'coral', 'blue', 'neutral', 'assassin'] as const).map((tone) => (
          <WordTile key={tone} word="MOON" tone={tone} revealed={tone !== 'unknown'} />
        ))}
        <WordTile word="SATELLITE" selected onClick={() => undefined} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        <DevelopmentCard
          name="Moon workshop"
          bonus="sapphire"
          points={2}
          cost={{ ruby: 3, pearl: 2 }}
        />
        <DevelopmentCard
          name="Sun palace"
          bonus="gold"
          points={3}
          cost={{ onyx: 3, emerald: 3 }}
          selected
          onClick={() => undefined}
        />
        <ResourceToken color="emerald" count={7} />
      </div>
      <Hand
        cards={Array.from({ length: 42 }, (_, i) => ({
          ...card,
          id: `hand-${i}`,
          value: String(i % 10),
        }))}
        selectedIds={['hand-3']}
        onSelect={() => undefined}
      />
    </div>
  );
}
const meta = { title: 'Games/Components', component: Components } satisfies Meta<typeof Components>;
export default meta;
export const Variants: StoryObj<typeof meta> = {};
