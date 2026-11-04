/**
 * Short seat labels that keep similar long names apart.
 *
 * A long name keeps its start and its end around a middle ellipsis
 * ("Alexandra…Montgomery"), so names sharing a long prefix stay distinct.
 * The full name always remains available as the seat's title and accessible name.
 */

const HEAD = 12;
const TAIL = 12;

function head(name: string) {
  const words = name.split(/\s+/);
  let text = '';
  for (const word of words) {
    const next = text ? `${text} ${word}` : word;
    if (next.length > HEAD) break;
    text = next;
  }
  if (text) return text;
  // One long first word: prefer a hyphenated part over a hard cut.
  const part = words[0].split('-')[0];
  return part.length <= HEAD && part.length >= 3 ? part : words[0].slice(0, HEAD - 1);
}

function tail(name: string) {
  const words = name.split(/\s+/);
  let text = '';
  for (const word of [...words].reverse()) {
    const next = text ? `${word} ${text}` : word;
    if (next.length > TAIL) break;
    text = next;
  }
  if (text) return text;
  const last = words.at(-1)!;
  const part = last.split('-').at(-1)!;
  return part.length <= TAIL && part.length >= 3 ? part : last.slice(-(TAIL - 1));
}

export function shortName(name: string, limit = 22) {
  const trimmed = name.trim().replace(/\s+/g, ' ');
  if (trimmed.length <= limit) return trimmed;
  const start = head(trimmed);
  const end = tail(trimmed);
  // A zero-width space lets a two-line seat break right after the ellipsis.
  return start.length + end.length + 1 >= trimmed.length ? trimmed : `${start}…\u200b${end}`;
}

/** Labels for a whole table: a shortened label that would collide stays in full. */
export function distinctNames(names: string[], limit?: number) {
  const short = names.map((name) => shortName(name, limit));
  return short.map((label, index) =>
    short.some(
      (other, otherIndex) =>
        otherIndex !== index && other === label && names[otherIndex] !== names[index],
    )
      ? names[index]
      : label,
  );
}

/** The name a seat shows: bots drop their "Bot" prefix because the seat marks them. */
export function seatName(member: { name: string; isBot?: boolean } | undefined) {
  const name = member?.name || 'Player';
  return member?.isBot ? name.replace(/^Bot\s+/i, '') || name : name;
}
