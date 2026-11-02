'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Eye, X } from 'lucide-react';
import { Button } from './Button';

type PanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
};

/** Modeless: the hand and public table stay usable while choosing a move. */
export function TableDecisionPanel({ open, onOpenChange, title, children }: PanelProps) {
  return (
    <Dialog.Root open={open} modal={false} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {open ? (
          <TableDecisionContent onOpenChange={onOpenChange} title={title}>
            {children}
          </TableDecisionContent>
        ) : null}
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Peek and its key listeners belong to one open panel, including controlled closes. */
function TableDecisionContent({ onOpenChange, title, children }: Omit<PanelProps, 'open'>) {
  const [peek, setPeek] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (
        event.code !== 'Space' ||
        (event.target instanceof Element &&
          event.target.closest('input,textarea,select,button,[contenteditable]'))
      )
        return;
      event.preventDefault();
      setPeek(event.type === 'keydown');
    };
    const restore = () => setPeek(false);
    document.addEventListener('keydown', key);
    document.addEventListener('keyup', key);
    window.addEventListener('blur', restore);
    return () => {
      document.removeEventListener('keydown', key);
      document.removeEventListener('keyup', key);
      window.removeEventListener('blur', restore);
    };
  }, []);
  return (
    <Dialog.Content
      className="table-decision-panel"
      data-peeking={peek}
      onInteractOutside={(event) => event.preventDefault()}
      onOpenAutoFocus={() => {
        opener.current =
          document.activeElement instanceof HTMLElement ? document.activeElement : null;
      }}
      onCloseAutoFocus={(event) => {
        event.preventDefault();
        if (opener.current?.isConnected) opener.current.focus({ preventScroll: true });
      }}
    >
      <div className="table-decision-heading">
        <Dialog.Title>{title}</Dialog.Title>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close move options"
          onClick={() => onOpenChange(false)}
        >
          <X size={17} />
        </Button>
      </div>
      <Dialog.Description className="sr-only">
        Choose your move. You can still use the public table, or view it without closing your
        choices.
      </Dialog.Description>
      <div className="table-decision-body" hidden={peek}>
        {children}
      </div>
      <Button
        variant="secondary"
        className="table-peek-button"
        aria-pressed={peek}
        onClick={() => setPeek(!peek)}
      >
        <Eye size={16} />
        {peek ? 'Resume move' : 'View table'}
      </Button>
    </Dialog.Content>
  );
}
