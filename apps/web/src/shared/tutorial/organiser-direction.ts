import { santaDetails, type Match } from '@games/api-client';

/**
 * Secret Santa offers many edits at once. Point the organiser at the one that
 * moves the draw forward, using only what the organiser's own page shows.
 */
export function organiserDirection(match: Match) {
  if (match.id !== 'secret-santa') return;
  let detail;
  try {
    detail = santaDetails(match.detail);
  } catch {
    return;
  }
  const offered = (type: string, target?: string) =>
    match.actions.find(
      (option) =>
        option.value.type === type && (target === undefined || option.value.target === target),
    );
  const count = detail.people.length;
  if (match.phase === 'setup') {
    const draw = offered('draw');
    if (draw)
      return {
        option: draw,
        tip: `${count} people are in. Set who can’t draw whom first if you need to, then tap Draw names. Nobody draws their own name.`,
      };
    const add = offered('add_name');
    if (add)
      return {
        option: add,
        tip: count
          ? detail.blocked || 'Keep adding names until everyone taking part is on the list.'
          : 'Type a name and press Enter. Add everyone taking part, including yourself if you are.',
      };
    return;
  }
  if (match.phase === 'drawn') {
    const hide = offered('hide');
    if (detail.showing && hide)
      return {
        option: hide,
        tip: 'Tap Hide before the phone goes back, so nobody else sees the name.',
      };
    const next = detail.people.find((person) => !person.opened) ?? detail.people[0];
    const reveal = (next && offered('reveal', next.id)) ?? offered('reveal');
    if (reveal)
      return {
        option: reveal,
        tip: 'Send each person their own link with Share or Copy link. If someone is with you, Show on this phone lets them look in private.',
      };
  }
}
