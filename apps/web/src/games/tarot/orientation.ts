import type { ReadingView } from '@games/api-client';

/** How a drawn card lies. The server decides it at the shuffle and reveals it with the card. */
export type Orientation = 'upright' | 'reversed';

type WireReading = NonNullable<ReadingView['reading']>;
/**
 * A reading as the table renders it. The API always sends each section's orientation;
 * fixtures and readings cached before reversals may not carry it, so it stays optional here.
 */
export type Reading = Omit<WireReading, 'cards'> & {
  cards: (Omit<WireReading['cards'][number], 'orientation'> & { orientation?: Orientation })[];
};

/**
 * The orientation saved with a drawn card or a reading section. Anything saved before
 * reversals has no field and reads upright.
 */
export function orientationOf(source: unknown): Orientation {
  return (source as { orientation?: unknown } | null | undefined)?.orientation === 'reversed'
    ? 'reversed'
    : 'upright';
}

/** A card's name as it is spoken and copied: "Three of Cups, reversed". */
export function nameWithOrientation(name: string, orientation: Orientation) {
  return orientation === 'reversed' ? `${name}, reversed` : name;
}

export const orientationLabel: Record<Orientation, string> = {
  upright: 'Upright',
  reversed: 'Reversed',
};
