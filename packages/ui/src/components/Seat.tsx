import { Avatar } from './Avatar';
import { cn } from '../lib/cn';
import type { ReactNode } from 'react';
import { Bot } from 'lucide-react';

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
  bot?: boolean;
  action?: ReactNode;
  /**
   * A shorter visible label (for example a middle-ellipsis name that still
   * tells similar names apart). `name` stays the full title and avatar name.
   */
  displayName?: string;
  /** A short public status shown before the caption, such as "Next". */
  badge?: string;
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
  bot = false,
  action,
  displayName,
  badge,
}: SeatProps) {
  const plainName = bot ? name?.replace(/^Bot\s+/i, '') : name;
  const status = !name
    ? 'Invite a friend'
    : !connected
      ? // A disconnected player keeps their public count or score beside the status.
        caption
        ? `Reconnecting · ${caption}`
        : 'Reconnecting…'
      : ready
        ? 'Ready to play'
        : caption || 'Not ready yet';
  return (
    <div
      data-name-layout={nameLayout}
      data-connected={name ? connected : undefined}
      className={cn(
        'seat',
        active && 'seat--active',
        !name && 'seat--empty',
        compact && 'seat--compact',
      )}
    >
      {name ? (
        <Avatar name={plainName || name} seed={avatar} size={compact ? 'sm' : 'lg'} />
      ) : (
        <span className="empty-avatar">+</span>
      )}
      <div className="seat-copy">
        <strong title={name}>
          <span className="seat-name">{displayName || plainName || 'Open seat'}</span>
          {name && you ? <span className="seat-self">you</span> : null}
          {name && bot ? (
            <span className="seat-kind">
              <Bot size={12} aria-hidden="true" />
              <span className="seat-kind-label">Bot</span>
            </span>
          ) : null}
        </strong>
        <span>
          {name && badge ? <b className="seat-badge">{badge}</b> : null}
          {status}
        </span>
      </div>
      {active ? <span className="turn-light" role="img" aria-label={activeLabel} /> : null}
      {action ? <span className="seat-action">{action}</span> : null}
    </div>
  );
}
