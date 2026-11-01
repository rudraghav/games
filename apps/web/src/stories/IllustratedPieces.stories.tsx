import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { BoopPiece, PaperCardArt, paperCardKinds, PaperPlayingCard } from '@games/ui';

function IllustratedPieces() {
  return (
    <main style={{ display: 'grid', gap: 24, maxWidth: 900 }}>
      <section style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }} aria-label="Every cat piece">
        {(['coral', 'blue'] as const).flatMap((color) =>
          (['kitten', 'cat'] as const).map((kind) => (
            <div key={`${color}-${kind}`} style={{ width: 120 }}>
              <BoopPiece color={color} kind={kind} label={`${color} ${kind}`} />
            </div>
          )),
        )}
      </section>
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(100px,1fr))',
          gap: 16,
        }}
        aria-label="Every ocean symbol"
      >
        {paperCardKinds.map((kind) => (
          <figure key={kind}>
            <PaperCardArt kind={kind} />
            <figcaption>{kind}</figcaption>
          </figure>
        ))}
      </section>
      <section
        style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
        aria-label="Paper card variants"
      >
        {(['regular', 'selected', 'pending', 'compact'] as const).map((variant) => (
          <PaperPlayingCard
            key={variant}
            card={{
              id: variant,
              label: 'Blue boat',
              suit: 'boat',
              value: 'Boat',
              color: 'blue',
              subtitle: 'Play two boats for an extra turn.',
            }}
            selected={variant === 'selected'}
            disabled={variant === 'pending'}
            compact={variant === 'compact'}
            onClick={() => undefined}
          />
        ))}
      </section>
    </main>
  );
}
const meta = { title: 'Games/Illustrated pieces', component: IllustratedPieces } satisfies Meta<
  typeof IllustratedPieces
>;
export default meta;
export const AllArtwork: StoryObj<typeof meta> = {};
