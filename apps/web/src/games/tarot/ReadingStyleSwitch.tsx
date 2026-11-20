import { useId, useState } from 'react';
import { Info } from 'lucide-react';
import { Button } from '@games/ui';
import type { ReadingStyle } from '@games/api-client';

export function ReadingStyleSwitch({
  value,
  onChange,
  disabled = false,
}: {
  value: ReadingStyle;
  onChange: (style: ReadingStyle) => void;
  disabled?: boolean;
}) {
  const [styleHelpOpen, setStyleHelpOpen] = useState(true);
  const hintId = useId();
  return (
    <div className="tarot-reading-style">
      <Button
        type="button"
        variant="ghost"
        className="tarot-style-switch"
        role="switch"
        aria-checked={value === 'fun'}
        aria-describedby={hintId}
        onClick={() => onChange(value === 'fun' ? 'classic' : 'fun')}
        disabled={disabled}
      >
        <span className="tarot-style-track" aria-hidden="true" />
        Fun mode
      </Button>
      <div className="tarot-style-help">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="About Fun mode"
          aria-controls={hintId}
          aria-describedby={styleHelpOpen ? hintId : undefined}
          aria-expanded={styleHelpOpen}
          onClick={() => setStyleHelpOpen((open) => !open)}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && styleHelpOpen) {
              event.stopPropagation();
              setStyleHelpOpen(false);
            }
          }}
        >
          <Info size={17} aria-hidden="true" />
        </Button>
        <p id={hintId} className="small muted" role="tooltip">
          Fun for pop culture, Classic for reflection.
        </p>
      </div>
    </div>
  );
}
