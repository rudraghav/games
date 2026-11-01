import { cn } from '../lib/cn';
interface AvatarProps {
  name: string;
  seed?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
export function Avatar({ name, seed = 0, size = 'md', className }: AvatarProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  return (
    <span
      className={cn('avatar', `avatar--${size}`, className)}
      data-avatar={seed % 8}
      aria-label={name}
    >
      {initials || 'G'}
    </span>
  );
}
