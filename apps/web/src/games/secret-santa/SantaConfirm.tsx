'use client';
import { Button, Modal } from '@games/ui';

/** One plain question before a step that changes everyone's links. */
export function SantaConfirm({
  title,
  description,
  confirm,
  cancel = 'Not yet',
  danger = false,
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  confirm: string;
  cancel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      open
      title={title}
      description={description}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <div className="santa-dialog-actions">
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
          {confirm}
        </Button>
        <Button variant="secondary" onClick={onClose}>
          {cancel}
        </Button>
      </div>
    </Modal>
  );
}
