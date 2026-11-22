import { orientationOf, type Orientation, type Reading } from './orientation';

/** A reading saved before every part had to say something can hold a lone question. */
export function asksOnly(text: string) {
  const trimmed = text.trim();
  return trimmed.endsWith('?') && !/[.!…]["”’)]?\s/.test(trimmed);
}

/**
 * The saved reading as plain text for the clipboard or a share sheet. It carries the
 * words already on the page, in the page's order: what each card says, its figure and
 * what that means for the question, the plot twist, and any chart perspective.
 * Portraits, credits and the chart drawing stay behind.
 */
export function readingAsText({
  reading,
  cards,
  question,
}: {
  reading: Reading;
  cards: readonly { id: string; label: string; orientation?: Orientation }[];
  question?: string;
}) {
  const names = new Map(cards.map((card) => [card.id, card.label]));
  const drawn = new Map(cards.map((card) => [card.id, card]));
  const asked = !!question?.trim();
  const sections = reading.cards.map((card, index) => {
    const name = names.get(card.card_id) || card.title;
    const title = card.title.toLocaleLowerCase() === name.toLocaleLowerCase() ? '' : card.title;
    const figures = (card.characters || []).map((character) => {
      const scene = character.evidence?.trim();
      // An older Fun reading stored its scene and move together; keep only the move here.
      const move =
        scene && character.connection.startsWith(scene)
          ? character.connection.slice(scene.length).trimStart()
          : character.connection;
      return `${character.name} (${character.source}): ${move}`;
    });
    // With a figure this is its bridge to the question; in older readings, a stored analogy.
    const bridge = card.pop_culture?.trim();
    return [
      // The orientation saved with the section; an older reading falls back to the drawn card.
      `${index + 1}. ${card.position}: ${name} (${card.orientation ?? orientationOf(drawn.get(card.card_id))})`,
      ...(title ? [title] : []),
      card.interpretation,
      ...figures,
      ...(bridge
        ? [
            card.characters?.length
              ? `${asked ? 'What this means for your question' : 'What this could mean for you'}: ${bridge}`
              : bridge,
          ]
        : []),
      ...(card.quirky_interpretation ? [`Plot twist: ${card.quirky_interpretation}`] : []),
    ].join('\n');
  });
  const interpretation = reading.astrology?.interpretation;
  const chart = interpretation
    ? [
        ...(['western', 'vedic'] as const).flatMap((system) => {
          const section = interpretation[system];
          return section
            ? [
                `${system === 'western' ? 'Western' : 'Vedic'} perspective\n${section.normal}\nPlot twist: ${section.quirky}`,
              ]
            : [];
        }),
        `How it meets your cards: ${interpretation.tarot_connection}`,
      ]
    : [];
  return [
    reading.title,
    ...(asked ? [`Question: ${question!.trim()}`] : []),
    `In short: ${reading.introduction}`,
    ...sections,
    ...chart,
    `Next small move: ${reading.next_step}`,
    ...(interpretation?.next_step ? [`From your chart: ${interpretation.next_step}`] : []),
    'A playful reflection, not a prediction.',
  ].join('\n\n');
}
