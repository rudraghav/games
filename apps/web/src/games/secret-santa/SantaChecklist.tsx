'use client';
import { useState } from 'react';
import { Button, Modal } from '@games/ui';

export interface ChecklistPerson {
  id: string;
  name: string;
  /** A short note beside the name, for example the group that already keeps two people apart. */
  note?: string;
}

/**
 * A dialog with one tick box per person. Saving hands back the complete list, in
 * the order shown, so the caller always sends the whole selection.
 */
export function SantaChecklist({
  title,
  description,
  people,
  selected,
  empty,
  disabled,
  onSave,
  onClose,
}: {
  title: string;
  description: string;
  people: readonly ChecklistPerson[];
  selected: readonly string[];
  empty: string;
  disabled: boolean;
  onSave: (ids: string[]) => void;
  onClose: () => void;
}) {
  const [ticked, setTicked] = useState(() => new Set(selected));
  const chosen = people.filter((person) => ticked.has(person.id));
  return (
    <Modal
      open
      title={title}
      description={description}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <form
        className="santa-checklist-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(chosen.map((person) => person.id));
        }}
      >
        {people.length ? (
          <ul className="santa-checklist">
            {people.map((person) => (
              <li key={person.id}>
                <label className="santa-check">
                  <input
                    type="checkbox"
                    checked={ticked.has(person.id)}
                    disabled={disabled}
                    onChange={(event) =>
                      setTicked((before) => {
                        const next = new Set(before);
                        if (event.target.checked) next.add(person.id);
                        else next.delete(person.id);
                        return next;
                      })
                    }
                  />
                  <span className="santa-check__name">{person.name}</span>
                  {person.note ? <small className="santa-check__note">{person.note}</small> : null}
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted santa-checklist-empty">{empty}</p>
        )}
        <div className="santa-dialog-actions">
          <p className="small muted" aria-live="polite">
            {people.length ? `${chosen.length} of ${people.length} ticked` : ''}
          </p>
          <Button type="submit" disabled={disabled || !people.length}>
            Save
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
