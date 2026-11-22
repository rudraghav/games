'use client';
import { useLayoutEffect, useRef, useState } from 'react';
import { Link2 } from 'lucide-react';
import { formatInviteInput } from './room-invite';

/**
 * The join field. Six digits group themselves as they are typed ("482 913"); a
 * pasted invite link or an older code with letters is kept exactly as entered.
 */
export function RoomCodeField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  // Regrouping moves the caret to the end; put it back after the same digit.
  const caret = useRef<number | null>(null);
  const [letters, setLetters] = useState(() => /[^\d\s-]/.test(value));
  useLayoutEffect(() => {
    if (caret.current === null || !input.current) return;
    let position = 0;
    for (let seen = 0; position < value.length && seen < caret.current; position++)
      if (/\d/.test(value[position])) seen++;
    input.current.setSelectionRange(position, position);
    caret.current = null;
  }, [value]);
  return (
    <div className="room-code-field">
      <label className="field">
        <span>
          <Link2 size={14} className="inline-icon" aria-hidden="true" /> Room code
        </span>
        <input
          ref={input}
          className="input"
          value={value}
          onChange={(event) => {
            const typed = event.target.value;
            const next = formatInviteInput(typed);
            if (next !== typed) {
              const before = typed.slice(0, event.target.selectionStart ?? typed.length);
              caret.current = before.replace(/\D/g, '').length;
            }
            onChange(next);
          }}
          placeholder="482 913"
          required
          inputMode={letters ? 'text' : 'numeric'}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-describedby="room-code-help"
        />
      </label>
      <p className="small muted room-code-help" id="room-code-help">
        Type the 6 digits, or paste an invite link.{' '}
        {letters ? null : (
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setLetters(true);
              input.current?.focus();
            }}
          >
            My code has letters
          </button>
        )}
      </p>
    </div>
  );
}
