import { AtlasArt } from './AtlasArt';
import { cn } from '../lib/cn';

export const paperCardKinds = [
  'crab',
  'boat',
  'fish',
  'swimmer',
  'shark',
  'mermaid',
  'shell',
  'octopus',
  'penguin',
  'sailor',
  'lighthouse',
  'shoal',
  'penguin-colony',
  'captain',
] as const;
export type PaperCardKind = (typeof paperCardKinds)[number];

export function PaperCardArt({ kind, className }: { kind: PaperCardKind; className?: string }) {
  return (
    <span
      className={cn('paper-card-art', className)}
      role="img"
      aria-label={kind.replaceAll('-', ' ')}
    >
      <AtlasArt
        src="/game-art/paper-symbols-v1.webp"
        index={paperCardKinds.indexOf(kind)}
        columns={4}
        rows={4}
        width={1254}
        height={1254}
      />
    </span>
  );
}
