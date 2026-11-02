import registry from './generated/tarot-characters.json';

type ReferenceIdentity = {
  id: string;
  name: string;
  source: string;
  lane: string;
  aliases: readonly string[];
  sourceAliases: readonly string[];
};

type ArtworkAsset = {
  image: string;
  width: number;
  height: number;
  bytes: number;
  sha256: string;
  credit: string;
  alt?: string;
  artworkVersion?: string;
  origin?: 'generated' | 'sourced';
  rights?: 'copyright-reference' | 'licensed' | 'public-domain' | 'generated';
  rightsNote?: string;
  license?: string;
  licenseUrl?: string;
  filePage?: string;
  sourcePage?: string;
  remoteImage?: string;
  performer?: string;
  performerLabel?: string;
};

type PhotoArtwork = ArtworkAsset & {
  imageType: 'performer' | 'cosplay';
  performer: string;
  performerLabel: string;
  license: string;
  licenseUrl: string;
  filePage: string;
  sourcePage: string;
  remoteImage: string;
};

type SourcedCharacterArtwork = ArtworkAsset & {
  imageType: 'character';
  origin: 'sourced';
  artworkVersion: string;
  alt: string;
  sourcePage: string;
  filePage: string;
  remoteImage: string;
  performer?: never;
  performerLabel?: never;
} & (
    | { rights: 'copyright-reference'; rightsNote: string; license?: never; licenseUrl?: never }
    | { rights: 'licensed'; license: string; licenseUrl: string }
    | { rights: 'public-domain'; rightsNote: string }
  );

type GeneratedCharacterArtwork = ArtworkAsset & {
  imageType: 'illustration';
  origin: 'generated';
  artworkVersion: string;
  alt: string;
  performer?: never;
  performerLabel?: never;
};

export type TarotCharacter = ReferenceIdentity &
  (PhotoArtwork | SourcedCharacterArtwork | GeneratedCharacterArtwork);

// The exporter validates the public JSON's discriminants, paths and provenance
// before the contracts gate accepts it; no wire response or private data enters it.
export const tarotCharacters = registry as readonly TarotCharacter[];
function normalized(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '');
}
/** Match both identity and franchise; never substitute a merely similar name. */
export function tarotCharacter(name: string, source: string): TarotCharacter | undefined {
  return tarotCharacters.find(
    (c) =>
      [c.name, ...c.aliases].some((n) => normalized(n) === normalized(name)) &&
      [c.source, ...c.sourceAliases].some((s) => normalized(source) === normalized(s)),
  );
}
