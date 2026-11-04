import { cn } from '../lib/cn';

const IDENTITIES: Record<string, { label: string; short: string }> = {
  coral: { label: 'Red agent', short: 'Red' },
  blue: { label: 'Blue agent', short: 'Blue' },
  neutral: { label: 'Bystander', short: 'Neutral' },
  assassin: { label: 'Assassin', short: 'Assassin' },
};

/** Long words may wrap with a visible hyphen on small tiles, never with a bare split. */
function breakable(word: string) {
  if (word.length < 6) return word;
  return (
    word.slice(0, 3) + [...word.slice(3, -3)].map((c) => c + '\u00ad').join('') + word.slice(-3)
  );
}

export function WordTile({
  word,
  tone = 'unknown',
  revealed = false,
  selected = false,
  last = false,
  onClick,
  disabled,
}: {
  word: string;
  tone?: string;
  revealed?: boolean;
  selected?: boolean;
  /** The most recently revealed word, outlined so everyone sees what just happened. */
  last?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const identity = IDENTITIES[tone];
  const props = {
    className: cn('word-tile', selected && 'word-tile--selected'),
    'data-tone': tone,
    'data-revealed': revealed,
    'data-last': last || undefined,
    'aria-label':
      word +
      (identity ? `, ${identity.label}` : '') +
      (revealed ? ', revealed' : '') +
      (last ? ', just revealed' : ''),
  };
  const contents = (
    <>
      {/* Revealed words are covered: a check mark and a striped face, never just a fade. */}
      {revealed ? (
        <i className="word-tile__mark" aria-hidden="true">
          ✓
        </i>
      ) : null}
      <strong lang="en">{breakable(word)}</strong>
      {identity ? (
        <span>
          <span className="word-tile__identity-long">{identity.label}</span>
          <span className="word-tile__identity-short" aria-hidden="true">
            {identity.short}
          </span>
        </span>
      ) : null}
    </>
  );
  return onClick ? (
    <button {...props} type="button" aria-pressed={selected} disabled={disabled} onClick={onClick}>
      {contents}
    </button>
  ) : (
    <div {...props}>{contents}</div>
  );
}
