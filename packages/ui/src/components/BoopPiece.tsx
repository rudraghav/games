import { cn } from '../lib/cn';
import { AtlasArt } from './AtlasArt';

export function BoopPiece({
  kind,
  color,
  label,
  className,
}: {
  kind: 'kitten' | 'cat';
  color: 'coral' | 'blue';
  label: string;
  className?: string;
}) {
  const index = (kind === 'cat' ? 1 : 0) + (color === 'blue' ? 2 : 0);
  return (
    <span
      className={cn('boop-piece', className)}
      data-kind={kind}
      data-color={color}
      role="img"
      aria-label={label}
    >
      <AtlasArt
        src="/game-art/boop-pieces-v1.webp"
        index={index}
        columns={2}
        rows={2}
        width={1254}
        height={1254}
      />
    </span>
  );
}
