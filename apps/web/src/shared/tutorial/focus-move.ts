import type { ActionOption, Match } from '@games/api-client';

/** Bring an existing table control into view. Focus can preview a move, but never submits it. */
export function focusMove(table: HTMLElement, match: Match, option: ActionOption) {
  const buttons = Array.from(
    table.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'),
  ).filter((button) => button.getClientRects().length && !button.closest('[inert]'));
  const label = (button: HTMLButtonElement) =>
    (button.getAttribute('aria-label') || button.textContent || '').trim();
  const { value } = option;
  let target: HTMLElement | undefined = buttons.find((button) => label(button) === option.label);
  if (!target && match.id === 'checkers' && value.type === 'move') {
    const [source, end] = value.choice.split(':');
    const piece = buttons.find((button) => button.dataset.cell === source);
    target =
      piece?.getAttribute('aria-pressed') === 'true'
        ? (buttons.find((button) => button.dataset.cell === end) ?? piece)
        : piece;
  }
  if (!target && match.id === 'mancala' && value.type === 'sow') {
    target = buttons.find((button) => label(button).startsWith(option.label + ' · '));
  }
  if (!target && match.id === 'six-nimmt' && value.type === 'take_row') {
    target = buttons.find((button) => button.dataset.row === value.choice);
  }
  if (!target && match.id === 'azul') {
    target = buttons.find((button) =>
      value.type === 'draft_tiles'
        ? button.dataset.source === value.choice && button.dataset.color === value.color
        : value.type === 'place_tiles' && button.dataset.azulChoice === value.choice,
    );
  }
  if (!target && match.id === 'tarot') {
    const cards = buttons.filter((button) => label(button).startsWith('Face-down card '));
    target = cards.find((button) => button.tabIndex === 0);
  }
  if (!target && match.id === 'secret-santa') {
    // The organiser's page names its main controls; a suggestion lands on the right one.
    const control =
      value.type === 'add_name'
        ? 'santa-new-name'
        : value.type === 'draw'
          ? 'santa-draw-button'
          : value.type === 'reveal' && value.target
            ? `santa-show-${value.target}`
            : '';
    const named = control ? document.getElementById(control) : null;
    target =
      (named && table.contains(named) && !named.hasAttribute('disabled') ? named : undefined) ??
      (value.type === 'hide' ? buttons.find((button) => label(button) === 'Hide') : undefined) ??
      (value.type === 'reveal'
        ? buttons.find((button) => label(button).startsWith('Show on this phone'))
        : undefined);
  }
  if (!target && value.card) {
    const card = match.hand.find((item) => item.id === value.card);
    target = buttons.find((button) => button.dataset.card === value.card);
    if (card && !target) {
      target = buttons.find(
        (button) =>
          button.classList.contains('playing-card') &&
          (label(button) === card.label || label(button).startsWith(card.label + ',')),
      );
    }
  }
  if (!target && match.id === 'word-agents' && value.type === 'clue') {
    target = table.querySelector<HTMLInputElement>('.clue-form input:not(:disabled)') ?? undefined;
  }
  if (!target && ['spill-or-chill', 'hot-seat', 'most-likely'].includes(match.id)) {
    target = buttons.find((button) => button.classList.contains('party-choice'));
  }
  if (!target && match.id === 'the-gang' && value.type === 'claim_chip') {
    target = buttons.find(
      (button) =>
        button.classList.contains('gang-chip-choice') &&
        button.dataset.rank === String(value.amount),
    );
  }
  if (!target && option.input === 'amount') {
    target = Array.from(
      table.querySelectorAll<HTMLInputElement>('input[type="number"]:not(:disabled)'),
    ).find((input) => input.getClientRects().length && !input.closest('[inert]'));
  }
  if (!target && match.id === 'teen-patti' && value.type === 'bet') {
    target = buttons.find((button) => button.closest('.casino-choice[data-action="bet"]'));
  }
  const destination = target ?? table;
  destination.scrollIntoView({ block: target ? 'center' : 'start', inline: 'nearest' });
  destination.focus({ preventScroll: true });
}
