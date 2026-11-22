import guide from './generated/tarot-card-guide.json';

export type TarotOrientation = 'upright' | 'reversed';
export type TarotSuit = 'wands' | 'cups' | 'swords' | 'pentacles';

/** One orientation of a card. `short` is the one-line meaning shown beside a drawn card. */
export type TarotCardSide = {
  short: string;
  keywords: readonly string[];
  meaning: string;
  love: string;
  work: string;
  self: string;
  advice: string;
};

export type TarotCorrespondence = { name: string; gloss: string };

export type TarotCardGuide = {
  id: string;
  name: string;
  arcana: 'major' | 'minor';
  suit: TarotSuit | null;
  number_label: string;
  essence: string;
  figure: string;
  symbols: readonly { symbol: string; meaning: string }[];
  upright: TarotCardSide;
  reversed: TarotCardSide;
  correspondences: {
    element: TarotCorrespondence;
    astrology: TarotCorrespondence;
    number: TarotCorrespondence;
  };
  questions: readonly string[];
};

// Static reference text, not a wire response. scripts/export_tarot_card_guide.py validates
// every entry against the backend's strict model before the contracts gate accepts this file.
export const tarotCardGuides = guide as readonly TarotCardGuide[];

const byId: ReadonlyMap<string, TarotCardGuide> = new Map(
  tarotCardGuides.map((card) => [card.id, card]),
);

/** The full guide entry for a card id such as `major-02` or `cups-05`. */
export function tarotCardGuide(cardId: string): TarotCardGuide | undefined {
  return byId.get(cardId);
}

/** The one-line meaning of a card in the orientation it was drawn. */
export function tarotShortMeaning(
  cardId: string,
  orientation: TarotOrientation = 'upright',
): string | undefined {
  return byId.get(cardId)?.[orientation].short;
}
