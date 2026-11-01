'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/cn';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  wide?: boolean;
  stickyHeader?: boolean;
}
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  wide,
  stickyHeader,
}: ModalProps) {
  const opener = useRef<HTMLElement | null>(null);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content
          className={cn('modal', wide && 'modal--wide', stickyHeader && 'modal--sticky-heading')}
          onOpenAutoFocus={() => {
            opener.current =
              document.activeElement instanceof HTMLElement ? document.activeElement : null;
          }}
          onCloseAutoFocus={(event) => {
            // These controlled dialogs do not use Dialog.Trigger. Restore their
            // actual opener, unless another dialog has just taken its place.
            event.preventDefault();
            if (
              !document.querySelector('[role="dialog"][data-state="open"]') &&
              opener.current?.isConnected
            )
              opener.current.focus({ preventScroll: true });
          }}
        >
          <div className="modal-heading">
            <Dialog.Title className="heading-md">{title}</Dialog.Title>
            <Dialog.Close className="icon-button" aria-label="Close dialog">
              <X size={20} />
            </Dialog.Close>
          </div>
          {description ? (
            <Dialog.Description className="muted modal-description">
              {description}
            </Dialog.Description>
          ) : (
            <Dialog.Description className="sr-only">{title}</Dialog.Description>
          )}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
