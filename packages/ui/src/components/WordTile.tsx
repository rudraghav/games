import { cn } from '../lib/cn';

export function WordTile({
  word,
  tone = 'unknown',
  revealed = false,
  selected = false,
  onClick,
  disabled,
}: {
  word: string;
  tone?: string;
  revealed?: boolean;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const identity = (
    {
      coral: 'Red agent',
      blue: 'Blue agent',
      neutral: 'Bystander',
      assassin: 'Assassin',
    } as Record<string, string>
  )[tone];
  const props = {
    className: cn('word-tile', selected && 'word-tile--selected'),
    'data-tone': tone,
    'data-revealed': revealed,
    'aria-label': word + (identity ? `, ${identity}` : ''),
  };
  const contents = (
    <>
      <strong>{word}</strong>
      {identity ? <span>{identity}</span> : null}
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
