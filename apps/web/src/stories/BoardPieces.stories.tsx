import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  AzulTileArt,
  DevelopmentCard,
  GemDistrictArt,
  ResourceToken,
  TokenArt,
  gemColors,
} from '@games/ui';

function BoardPieces() {
  return (
    <main style={{ maxWidth: 1000, display: 'grid', gap: 24 }}>
      <section
        aria-label="Every district illustration"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))',
          gap: 16,
        }}
      >
        {gemColors
          .filter((color) => color !== 'gold')
          .flatMap((color) =>
            [1, 2, 3].map((tier) => (
              <figure key={`${color}-${tier}`} style={{ margin: 0 }}>
                <div style={{ height: 110 }}>
                  <GemDistrictArt color={color} tier={tier} />
                </div>
                <figcaption>
                  {color} · tier{tier}
                </figcaption>
              </figure>
            )),
          )}
        <figure style={{ margin: 0 }}>
          <div style={{ height: 110 }}>
            <GemDistrictArt color="gold" patron />
          </div>
          <figcaption>Patron</figcaption>
        </figure>
      </section>
      <section aria-label="Ceramic tile patterns" style={{ display: 'flex', gap: 16 }}>
        {['blue', 'yellow', 'red', 'black', 'white', 'first'].map((color) => (
          <div key={color} style={{ width: 44, height: 44 }}>
            <AzulTileArt color={color} />
          </div>
        ))}
      </section>
      <section aria-label="Board and casino pieces" style={{ display: 'flex', gap: 16 }}>
        {(['coral', 'gold', 'ivory', 'ink', 'marble', 'poker'] as const).map((kind) => (
          <div key={kind} style={{ width: 54, height: 54 }}>
            <TokenArt kind={kind} />
          </div>
        ))}
      </section>
      <section
        aria-label="Development card variants"
        style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}
      >
        <DevelopmentCard
          name="Pearl Workshop"
          bonus="pearl"
          points={0}
          cost={{ ruby: 2, sapphire: 1 }}
          tier={1}
        />
        <DevelopmentCard
          name="Sapphire Guild"
          bonus="sapphire"
          points={2}
          cost={{ emerald: 3, ruby: 2, onyx: 2 }}
          tier={2}
          selected
          onClick={() => undefined}
        />
        <DevelopmentCard
          name="Ruby Palace"
          bonus="ruby"
          points={5}
          cost={{ pearl: 7 }}
          tier={3}
          disabled
          onClick={() => undefined}
        />
        <DevelopmentCard
          name="Patron"
          bonus="gold"
          points={3}
          cost={{ sapphire: 3, ruby: 3, pearl: 3 }}
        />
      </section>
      <section aria-label="Resource tokens" style={{ display: 'flex', gap: 12 }}>
        {gemColors.map((color) => (
          <ResourceToken key={color} color={color} count={7} />
        ))}
      </section>
    </main>
  );
}
const meta = { title: 'Games/Board pieces', component: BoardPieces } satisfies Meta<
  typeof BoardPieces
>;
export default meta;
export const AllArtwork: StoryObj<typeof meta> = {};
