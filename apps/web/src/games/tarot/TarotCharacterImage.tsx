import Image from 'next/image';
import type { TarotCharacter } from '@games/api-client/characters';

/** One frame for both saved readings and the complete character-art review. */
export function TarotCharacterImage({ character }: { character: TarotCharacter }) {
  if (
    character.imageType !== 'character' &&
    character.imageType !== 'illustration' &&
    character.imageType !== 'person' &&
    character.imageType !== 'religious_figure' &&
    character.imageType !== 'meme' &&
    character.imageType !== 'artwork'
  )
    return null;
  return (
    <figure
      className="tarot-character-portrait"
      data-reference-kind={character.kind}
      data-artwork-type={character.imageType}
    >
      <Image
        src={character.image}
        unoptimized
        width={character.width}
        height={character.height}
        sizes={
          character.kind === 'meme' || character.imageType === 'artwork'
            ? '(max-width: 600px) 240px, 176px'
            : '(max-width: 600px) 88px, 112px'
        }
        alt={character.alt}
      />
      {character.origin === 'generated' ? (
        <figcaption>Original illustration</figcaption>
      ) : character.imageType === 'artwork' ? (
        <figcaption>Artwork reference</figcaption>
      ) : null}
    </figure>
  );
}
