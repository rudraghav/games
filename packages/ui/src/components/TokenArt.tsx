import { AtlasArt } from './AtlasArt';

const tokens = ['coral', 'gold', 'ivory', 'ink', 'marble', 'poker'] as const;
export type TokenKind = (typeof tokens)[number];

/** Decorative original pieces. Counts and ownership remain visible, accessible UI. */
export function TokenArt({ kind }: { kind: TokenKind }) {
  return (
    <span className="token-art" aria-hidden="true">
      <AtlasArt
        src="/game-art/board-tokens-v1.webp"
        index={tokens.indexOf(kind)}
        columns={3}
        rows={2}
        width={1536}
        height={1024}
      />
    </span>
  );
}
