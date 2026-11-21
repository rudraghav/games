import type { ReadingView } from '@games/api-client';

type Reading = NonNullable<ReadingView['reading']>;

/**
 * The saved reading as plain text for the clipboard or a share sheet. It carries only
 * what is already on the page; character portraits, credits and charts stay behind.
 */
export function readingAsText({
  reading,
  cards,
  question,
}: {
  reading: Reading;
  cards: readonly { id: string; label: string }[];
  question?: string;
}) {
  const names = new Map(cards.map((card) => [card.id, card.label]));
  const sections = reading.cards.map((card, index) => {
    const name = names.get(card.card_id) || card.title;
    const title = card.title.toLocaleLowerCase() === name.toLocaleLowerCase() ? '' : card.title;
    return [
      `${index + 1}. ${card.position}: ${name} (upright)`,
      ...(title ? [title] : []),
      card.interpretation,
    ].join('\n');
  });
  return [
    reading.title,
    ...(question?.trim() ? [`Question: ${question.trim()}`] : []),
    `In short: ${reading.introduction}`,
    ...sections,
    `Next small move: ${reading.next_step}`,
    'A playful reflection, not a prediction.',
  ].join('\n\n');
}
