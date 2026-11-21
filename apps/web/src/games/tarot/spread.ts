/**
 * The three positions of the spread, in draw order, and what each one asks. The wording
 * matches the focus the reading service sends with each card (POSITION_FOCUS in
 * backend/app/games/tarot/deck.py): a possibility to reflect on, never a claim.
 */
export const spreadPositions = [
  { name: 'Where you are', meaning: 'A starting point to reflect on.' },
  { name: 'What is shifting', meaning: 'What could be changing or asking for attention.' },
  { name: 'Your next move', meaning: 'One possible direction to consider.' },
] as const;

export function positionMeaning(position: string) {
  return spreadPositions.find((item) => item.name === position)?.meaning;
}

/** This deck is dealt and read upright; a saved card never carries a reversed meaning. */
export const orientationNote = 'Upright. This deck reads every card upright.';
