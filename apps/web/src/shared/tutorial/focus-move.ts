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
    const source = value.choice?.split(':')[0];
    target = buttons.find((button) => button.dataset.cell === source);
  }
  if (!target && match.id === 'tarot') {
    target = buttons.find((button) => label(button).startsWith('Face-down card '));
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
  if (!target && option.input === 'amount') {
    target = Array.from(
      table.querySelectorAll<HTMLInputElement>('input[type="number"]:not(:disabled)'),
    ).find((input) => input.getClientRects().length && !input.closest('[inert]'));
  }
  const destination = target ?? table;
  destination.scrollIntoView({ block: target ? 'center' : 'start', inline: 'nearest' });
  destination.focus({ preventScroll: true });
}
