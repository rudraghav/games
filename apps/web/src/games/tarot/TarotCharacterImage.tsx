import Image from 'next/image';
import type { TarotCharacter } from '@games/api-client/characters';

/** One frame for both saved readings and the complete character-art review. */
export function TarotCharacterImage({ character }: { character: TarotCharacter }) {
  if (character.imageType !== 'character' && character.imageType !== 'illustration') return null;
  return (
    <figure className="tarot-character-portrait">
      <Image
        src={character.image}
        unoptimized
        width={character.width}
        height={character.height}
        sizes="(max-width: 600px) 88px, 112px"
        alt={character.alt}
      />
    </figure>
  );
}
