/** Static worked examples. None of these pieces come from a player's table. */
export type PicturePiece =
  | {
      kind: 'card';
      family: 'standard' | 'shedding' | 'grid' | 'flip';
      value: string;
      color: string;
      suit: string;
    }
  | { kind: 'back' }
  | { kind: 'reel'; symbol: 'cherry' | 'star' }
  | { kind: 'tarot'; id?: string; name?: string }
  | { kind: 'token'; color: 'ink' | 'ivory' | 'gold' | 'coral' | 'poker'; label?: string }
  | { kind: 'cat'; grown: boolean }
  | { kind: 'tile' | 'gem' | 'district'; color: string }
  | {
      kind: 'paper';
      subject: 'crab' | 'fish' | 'boat' | 'mermaid';
      color: 'green' | 'yellow' | 'navy' | 'white';
    }
  | { kind: 'pit'; seeds: number; store: boolean }
  | { kind: 'property'; color: string; name: string; value: string }
  | { kind: 'rank-chip'; rank: number; color: 'white' | 'yellow' | 'orange' | 'red' }
  | { kind: 'word'; word: string; revealed: boolean }
  | {
      kind: 'icon';
      icon:
        | 'hand'
        | 'eye'
        | 'lock'
        | 'message'
        | 'people'
        | 'check'
        | 'star'
        | 'flag'
        | 'shield'
        | 'bank'
        | 'vault'
        | 'crown'
        | 'flame'
        | 'arrow';
      label: string;
    }
  | { kind: 'full-number-row'; numbers: [number, number, number, number, number, number] }
  | { kind: 'number'; value: number; horns: number }
  | { kind: 'board'; rows: string[]; checkered: boolean }
  | { kind: 'die'; face: number; counts: 'face' | 'wild' | null }
  | { kind: 'housie-cell'; value: number; stamped: boolean }
  | { kind: 'housie-ball'; value: number };

export type LessonPicture = { description: string; pieces: PicturePiece[]; column?: boolean };
export const picture = (description: string, ...pieces: PicturePiece[]): LessonPicture => ({
  description,
  pieces,
});
export const face = (value: string, suit: string): PicturePiece => ({
  kind: 'card',
  family: 'standard',
  value,
  suit,
  color: suit === '♥' || suit === '♦' ? 'red' : 'ink',
});
export const uno = (value: string, color: string): PicturePiece => ({
  kind: 'card',
  family: 'shedding',
  value,
  color,
  suit: '',
});
export const grid = (value: string, color: string): PicturePiece => ({
  kind: 'card',
  family: 'grid',
  value,
  color,
  suit: '',
});
export const flip = (value: string): PicturePiece => ({
  kind: 'card',
  family: 'flip',
  value,
  color: 'yellow',
  suit: '✦',
});
export const reel = (symbol: 'cherry' | 'star'): PicturePiece => ({ kind: 'reel', symbol });
export const back: PicturePiece = { kind: 'back' };
export const tarot = (id?: string, name?: string): PicturePiece => ({ kind: 'tarot', id, name });
export const token = (
  color: Extract<PicturePiece, { kind: 'token' }>['color'],
  label?: string,
): PicturePiece => ({ kind: 'token', color, label });
export const rankChip = (
  rank: number,
  color: Extract<PicturePiece, { kind: 'rank-chip' }>['color'],
): PicturePiece => ({ kind: 'rank-chip', rank, color });
export const cat = (grown: boolean): PicturePiece => ({ kind: 'cat', grown });
export const tile = (color: string): PicturePiece => ({ kind: 'tile', color });
export const gem = (color: string): PicturePiece => ({ kind: 'gem', color });
export const district = (color: string): PicturePiece => ({ kind: 'district', color });
export const paper = (
  subject: Extract<PicturePiece, { kind: 'paper' }>['subject'],
  color: Extract<PicturePiece, { kind: 'paper' }>['color'],
): PicturePiece => ({ kind: 'paper', subject, color });
export const pit = (seeds: number, store = false): PicturePiece => ({ kind: 'pit', seeds, store });
export const property = (color: string, name: string, value: string): PicturePiece => ({
  kind: 'property',
  color,
  name,
  value,
});
export const word = (name: string, revealed = false): PicturePiece => ({
  kind: 'word',
  word: name,
  revealed,
});
export const icon = (
  name: Extract<PicturePiece, { kind: 'icon' }>['icon'],
  label = '',
): PicturePiece => ({ kind: 'icon', icon: name, label });
export const number = (value: number, horns = 1): PicturePiece => ({
  kind: 'number',
  value,
  horns,
});
/** Board cutaways use r/g for coral/gold, b/w for ink/ivory, k/K for coral/blue kittens, and . for empty. */
export const board = (rows: string[], checkered = false): PicturePiece => ({
  kind: 'board',
  rows,
  checkered,
});
export const arrow = icon('arrow');
/** A die face; `counts` rings it as it is ringed in a Liar's Dice reveal. */
export const die = (face: number, counts: 'face' | 'wild' | null = null): PicturePiece => ({
  kind: 'die',
  face,
  counts,
});
/** One number square of a Housie ticket, stamped once it is marked. */
export const housieCell = (value: number, stamped = false): PicturePiece => ({
  kind: 'housie-cell',
  value,
  stamped,
});
/** The number just called. */
export const housieBall = (value: number): PicturePiece => ({ kind: 'housie-ball', value });
