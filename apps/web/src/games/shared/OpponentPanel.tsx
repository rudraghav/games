'use client';
import { useState, type ReactNode } from 'react';
import { Maximize2 } from 'lucide-react';
import { Button, Modal, Seat } from '@games/ui';
import type { Player, Room } from '@games/api-client';

/** Public-only compact information remains on the table; full assets are inspectable. */
export function OpponentPanel({
  player,
  room,
  active,
  caption,
  summary,
  children,
  className = '',
  highlighted = false,
  onTarget,
  targetLabel = 'Choose player',
  targetDisabled = false,
}: {
  player: Player;
  room: Room;
  active: boolean;
  caption: string;
  summary: ReactNode;
  children: ReactNode;
  className?: string;
  highlighted?: boolean;
  onTarget?: () => void;
  targetLabel?: string;
  targetDisabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const member = room.members.find((item) => item.id === player.id);
  const name = member?.name || 'Player';
  return (
    <article
      className={`opponent-panel ${className}`}
      data-player={player.id}
      data-active={active}
      data-highlighted={highlighted}
    >
      <Seat
        compact
        name={name}
        avatar={member?.avatar}
        bot={member?.isBot}
        connected={member?.connected ?? false}
        active={active}
        caption={caption}
        action={
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Inspect ${name}`}
            onClick={() => setOpen(true)}
          >
            <Maximize2 size={15} />
          </Button>
        }
      />
      <div className="opponent-panel-summary">{summary}</div>
      {onTarget ? (
        <Button
          variant={highlighted ? 'primary' : 'secondary'}
          size="sm"
          onClick={onTarget}
          disabled={targetDisabled}
        >
          {targetLabel}
        </Button>
      ) : null}
      <Modal open={open} onOpenChange={setOpen} title={`${name} · public table`}>
        <div className="opponent-panel-inspection">{children}</div>
      </Modal>
    </article>
  );
}
