import type { Action, ActionOption, LiarsDiceDetails } from '@games/api-client';

export const FACES = [1, 2, 3, 4, 5, 6] as const;
const ONE = ['one', 'two', 'three', 'four', 'five', 'six'];
const MANY = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];

/** "four" or "fours": a face named the way a bid is said aloud. */
export function faceName(face: number, count = 2) {
  return (count === 1 ? ONE : MANY)[face - 1] ?? String(face);
}

/** "3 × fours", the way a bid is written on the table. */
export function bidText(quantity: number, face: number) {
  return `${quantity} × ${faceName(face, quantity)}`;
}

export interface FaceRange {
  face: number;
  /** The server's `bid` option for this face, or null when no legal quantity remains. */
  option: ActionOption | null;
  minimum: number;
  maximum: number;
}

/**
 * One entry per face. The range is exactly the offered option's minimum and
 * maximum: the client never works out which bids are legal on its own.
 */
export function bidRanges(actions: ActionOption[]): FaceRange[] {
  return FACES.map((face) => {
    const option =
      actions.find(
        (candidate) => candidate.value.type === 'bid' && candidate.value.choice === String(face),
      ) ?? null;
    const minimum = option?.minimum ?? 0;
    const maximum = option?.maximum ?? minimum;
    return { face, option, minimum, maximum };
  });
}

/** Keeps a chosen quantity inside the face's offered range. */
export function clampQuantity(quantity: number, range: FaceRange) {
  if (!range.option) return 0;
  if (!Number.isFinite(quantity)) return range.minimum;
  return Math.min(range.maximum, Math.max(range.minimum, Math.round(quantity)));
}

/** The action a bid sends: the offered option with the chosen quantity, or null. */
export function bidAction(range: FaceRange | undefined, quantity: number): Action | null {
  if (!range?.option) return null;
  return {
    ...range.option.value,
    type: 'bid',
    choice: String(range.face),
    amount: clampQuantity(quantity, range),
  };
}

/**
 * Whether a die counts for a bid on `face`: its own face always, and a one too
 * when ones are wild and the bid is not on ones. Used only to highlight dice
 * already shown to this viewer (their own, or every die in a reveal).
 */
export function countsFor(die: number, face: number, wildOnes: boolean): 'face' | 'wild' | null {
  if (die === face) return 'face';
  if (wildOnes && face !== 1 && die === 1) return 'wild';
  return null;
}

type Reveal = NonNullable<LiarsDiceDetails['reveal']>;

/**
 * The reveal in words, from the server's count and outcome. `name` returns
 * "You" for the viewer, so the verbs agree ("you lose", "Ada loses").
 */
export function revealSummary(reveal: Reveal, wildOnes: boolean, name: (id: string) => string) {
  const wild =
    wildOnes && reveal.face !== 1
      ? Object.values(reveal.dice)
          .flat()
          .filter((die) => die === 1).length
      : 0;
  const counted = `${reveal.count} ${faceName(reveal.face, reveal.count)} on the table`;
  const wilds = wild ? ` (${wild === 1 ? '1 was a wild one' : `${wild} were wild ones`})` : '';
  const loser = name(reveal.loser);
  const you = loser === 'You';
  const role = reveal.loser === reveal.caller ? 'called liar' : 'made the bid';
  const outcome = `The bid of ${bidText(reveal.quantity, reveal.face)} ${
    reveal.held ? 'held' : 'failed'
  }, so ${you ? 'you' : loser}, who ${role}, ${you ? 'lose' : 'loses'} a die.`;
  const out = reveal.eliminated ? ` ${you ? 'You are' : `${loser} is`} out of dice.` : '';
  return `${counted}${wilds}. ${outcome}${out}`;
}
