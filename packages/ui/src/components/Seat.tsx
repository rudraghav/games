import { Avatar } from './Avatar';
import { cn } from '../lib/cn';

interface SeatProps {
  name?: string;
  avatar?: number;
  active?: boolean;
  ready?: boolean;
  connected?: boolean;
  caption?: string;
  compact?: boolean;
  you?: boolean;
}
export function Seat({
  name,
  avatar = 0,
  active,
  ready,
  connected = true,
  caption,
  compact,
  you,
}: SeatProps) {
  return (
    <div
      className={cn(
        'seat',
        active && 'seat--active',
        !name && 'seat--empty',
        compact && 'seat--compact',
      )}
    >
      {name ? (
        <Avatar name={name} seed={avatar} size={compact ? 'sm' : 'lg'} />
      ) : (
        <span className="empty-avatar">+</span>
      )}
      <div className="seat-copy">
        <strong title={name}>
          {name || 'An open seat'}
          {name && you ? ' (you)' : ''}
        </strong>
        <span>
          {!name
            ? 'Invite a friend'
            : !connected
              ? 'Reconnecting…'
              : ready
                ? 'Ready to play'
                : caption || 'Getting comfortable'}
        </span>
      </div>
      {active ? <span className="turn-light" aria-label="Current turn" /> : null}
    </div>
  );
}
