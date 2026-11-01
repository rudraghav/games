import { AzulTileArt, PlayingCard, type CardPresentation } from '@games/ui';

function numberCard(value: string, color: string): CardPresentation {
  return { id: `modern-art-${value}`, value, label: value, color, subtitle: '', suit: '' };
}

/** Games-owned geometric covers, composed from the same readable game pieces. */
export function ModernArtwork({ gameId }: { gameId: string }) {
  if (gameId === 'azul') {
    const tones = ['blue', 'yellow', 'red', 'black', 'white'];
    return (
      <div className="game-art game-art--azul" aria-hidden="true">
        <div className="azul-cover-mosaic">
          {Array.from({ length: 25 }, (_, index) => {
            const color = ((index % 5) + Math.floor(index / 5) * 4) % 5;
            return (
              <span className="azul-tile" data-color={tones[color]} key={index}>
                <AzulTileArt color={tones[color]} />
              </span>
            );
          })}
        </div>
        <span className="azul-cover-loose azul-tile" data-color="blue">
          <AzulTileArt color="blue" />
        </span>
        <span className="azul-cover-loose azul-tile" data-color="yellow">
          <AzulTileArt color="yellow" />
        </span>
      </div>
    );
  }
  const trio = gameId === 'trio';
  return (
    <div
      className={`game-art game-art--modern-numbers ${trio ? 'game-art--trio' : 'game-art--flip-seven'}`}
      aria-hidden="true"
    >
      {(trio ? ['7', '7', '7'] : ['3', '7', '+10']).map((value, index) => (
        <PlayingCard
          key={index}
          card={numberCard(
            value,
            trio ? ['plum', 'yellow', 'plum'][index] : ['yellow', 'red', 'blue'][index],
          )}
          family="grid"
        />
      ))}
      <span className="modern-cover-star">✳</span>
    </div>
  );
}
