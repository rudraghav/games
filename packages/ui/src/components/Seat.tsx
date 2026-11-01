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
  nameLayout?: 'truncate' | 'wrap';
  activeLabel?: string;
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
  nameLayout = 'truncate',
  activeLabel = 'Current turn',
}: SeatProps) {
  return (
    <div
      data-name-layout={nameLayout}
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
          <span className="seat-name">{name || 'An open seat'}</span>
          {name && you ? <span className="seat-self">you</span> : null}
        </strong>
        <span>
          {!name
            ? 'Invite a friend'
            : !connected
              ? 'Reconnecting…'
              : ready
                ? 'Ready to play'
                : caption || 'Not ready yet'}
        </span>
      </div>
      {active ? <span className="turn-light" role="img" aria-label={activeLabel} /> : null}
    </div>
  );
}
