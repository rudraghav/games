import { BoopPiece, PaperCardArt, PlayingCard } from '@games/ui';

/** Catalogue compositions use the same original pieces as the playable tables. */
export function ContemporaryArtwork({ gameId }: { gameId: string }) {
  if (gameId === 'boop')
    return (
      <div className="game-art contemporary-art contemporary-art--boop" aria-hidden="true">
        <div className="boop-cover-bed" />
        <BoopPiece kind="kitten" color="coral" label="Coral kitten" />
        <BoopPiece kind="cat" color="blue" label="Blue cat" />
      </div>
    );
  if (gameId === 'sea-salt-paper')
    return (
      <div className="game-art contemporary-art contemporary-art--paper" aria-hidden="true">
        <span className="paper-cover-disc" />
        <PaperCardArt kind="crab" />
        <PaperCardArt kind="boat" />
        <PaperCardArt kind="mermaid" />
      </div>
    );
  const gang = gameId === 'the-gang';
  return (
    <div
      className={`game-art contemporary-art contemporary-art--${gang ? 'gang' : 'six'}`}
      aria-hidden="true"
    >
      {(gang ? ['A', 'K'] : ['6', '55', '104']).map((value, index) => (
        <PlayingCard
          key={value}
          family={gang ? 'standard' : 'grid'}
          card={{
            id: `cover-${value}`,
            label: value,
            value,
            color: gang ? 'ink' : ['blue', 'coral', 'yellow'][index],
            suit: gang ? ['♠', '♣'][index] : '',
            subtitle: '',
          }}
        />
      ))}
      {gang ? (
        <span className="gang-cover-chip">★★★</span>
      ) : (
        <span className="six-cover-symbol">🐂</span>
      )}
    </div>
  );
}
