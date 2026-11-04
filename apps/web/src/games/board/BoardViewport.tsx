'use client';
import { useState, type ReactNode } from 'react';
import { Button, HorizontalRail, Modal } from '@games/ui';

/**
 * Boards fit the viewport whenever they can; the rail (arrows below, never
 * over the squares) is only a fallback for very narrow or zoomed screens. The
 * overview is read-only and never submits a move.
 */
export function BoardViewport({
  children,
  overview,
  label,
}: {
  children: ReactNode;
  overview: ReactNode;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="board-viewport">
      <HorizontalRail
        label={label}
        navigationLabel="board columns"
        navigationPosition="below"
        className="board-rail"
        contentClassName="board-rail-content"
      >
        {children}
      </HorizontalRail>
      <div className="board-overview-tools">
        <span className="small muted board-pan-hint">
          Swipe or use the arrows to see every column.
        </span>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          View whole board
        </Button>
      </div>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title={`${label} overview`}
        description="Read-only overview. Close to return to the full-size move controls."
      >
        {overview}
      </Modal>
    </div>
  );
}
