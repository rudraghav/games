import type { Action, ActionOption, Match, SantaDetails } from '@games/api-client';

/**
 * One thing the organiser asked for. It is turned into a move only when it is
 * sent, against the actions the server offers at that moment.
 */
export type SantaIntent =
  | { type: 'add_name' | 'add_group' | 'set_title' | 'set_location' | 'set_budget'; text: string }
  | { type: 'rename' | 'rename_group'; target: string; text: string }
  | { type: 'remove_name' | 'remove_group' | 'reveal'; target: string }
  | { type: 'set_exclusions' | 'set_group'; target: string; ids: string[] }
  | { type: 'set_day'; day: number }
  | { type: 'clear'; target: 'day' | 'location' | 'budget' }
  | { type: 'draw' | 'redraw' | 'hide' | 'finish' };

export type SantaActionType = SantaIntent['type'];

/** The offered action of this type, for this person, group or field when it names one. */
export function offered(actions: readonly ActionOption[], type: string, target = '') {
  const ofType = actions.filter((option) => option.value.type === type);
  return (
    ofType.find((option) => option.value.target === target) ??
    // A single open-ended offer takes its target from the organiser's choice.
    (target && ofType.length === 1 && !ofType[0].value.target ? ofType[0] : undefined)
  );
}

export function canDo(match: Match, type: string, target = '') {
  return Boolean(offered(match.actions, type, target));
}

/** Names and labels are single lines: trimmed, with inner runs of space collapsed. */
export function tidy(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

/** Unique ids in the order given; a checklist never sends the same person twice. */
function unique(ids: readonly string[]) {
  return [...new Set(ids)];
}

/**
 * The exact move for an intent: an offered action with its input filled in, or
 * null when the server does not offer it (or the input is not usable).
 */
export function buildAction(match: Match, intent: SantaIntent): Action | null {
  const target = 'target' in intent ? intent.target : '';
  const option = offered(match.actions, intent.type, target);
  if (!option) return null;
  const base: Action = { ...option.value, target: target || option.value.target };
  switch (intent.type) {
    case 'add_name':
    case 'add_group':
    case 'set_title':
    case 'set_location':
    case 'set_budget':
    case 'rename':
    case 'rename_group': {
      const text = tidy(intent.text);
      return text ? { ...base, choice: text } : null;
    }
    case 'set_exclusions':
    case 'set_group': {
      // The complete list every time; nobody is ever paired with themselves.
      const ids = unique(intent.ids).filter(
        (id) => intent.type === 'set_group' || id !== intent.target,
      );
      const eligible = option.eligibleCards;
      return { ...base, cards: eligible.length ? ids.filter((id) => eligible.includes(id)) : ids };
    }
    case 'set_day':
      return Number.isInteger(intent.day) &&
        intent.day >= (option.minimum ?? 0) &&
        intent.day <= (option.maximum ?? 40000)
        ? { ...base, amount: intent.day }
        : null;
    default:
      return base;
  }
}

/**
 * Split typed or pasted text into names: one per line or comma (or semicolon).
 * Blank entries are dropped, long names are cut to the limit and repeats in the
 * same paste are kept, because the server stores a duplicate as "Sam (2)".
 */
export function splitNames(text: string, limit = 30) {
  return text
    .split(/[\n\r,;]+/)
    .map(tidy)
    .filter(Boolean)
    .map((name) => name.slice(0, limit).trim());
}

/** True when pasted or typed text holds more than one name. */
export function hasSeveralNames(text: string) {
  return /[\n\r,;]/.test(text) && splitNames(text).length > 1;
}

/** Everyone this person must not be paired with individually (pairs are mutual). */
export function excludedFor(detail: Pick<SantaDetails, 'pairs'>, personId: string) {
  return detail.pairs.flatMap(([a, b]) => (a === personId ? [b] : b === personId ? [a] : []));
}

export function groupsFor(detail: Pick<SantaDetails, 'groups'>, personId: string) {
  return detail.groups.filter((group) => group.members.includes(personId));
}

export function personName(detail: Pick<SantaDetails, 'people'>, personId: string) {
  return detail.people.find((person) => person.id === personId)?.name ?? 'Someone';
}

/** "Priya", "Priya and Sam", "Priya, Sam and 2 more". */
export function nameList(names: readonly string[], limit = 3) {
  if (names.length <= 1) return names[0] ?? '';
  if (names.length > limit)
    return `${names.slice(0, limit - 1).join(', ')} and ${names.length - limit + 1} more`;
  return `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
}

type Snapshot = Pick<
  SantaDetails,
  | 'title'
  | 'day'
  | 'location'
  | 'budget'
  | 'people'
  | 'pairs'
  | 'groups'
  | 'drawn'
  | 'drawNumber'
  | 'showing'
> & { phase: string };

/**
 * One short sentence for the change between two saved views, for the status
 * line. It reports what the server stored (so "Sam (2)", not what was typed)
 * and never mentions who drew whom.
 */
export function describeChange(before: Snapshot, after: Snapshot): string | null {
  if (after.phase === 'finished' && before.phase !== 'finished')
    return 'Finished. The links keep working.';
  if (after.drawn && (!before.drawn || after.drawNumber !== before.drawNumber))
    return 'Names drawn. Each person now has a private link.';
  // Going back to change the list cancels the draw and every link made for it.
  if (before.drawn && !after.drawn)
    return 'Back to the list. The links you shared no longer work. Draw again when you’re ready.';
  if (after.drawn && !after.showing && !before.showing) {
    const looked = new Set(
      before.people.filter((person) => person.opened).map((person) => person.id),
    );
    const fresh = after.people
      .filter((person) => person.opened && !looked.has(person.id))
      .map((person) => person.name);
    if (fresh.length)
      return `${nameList(fresh)} ${fresh.length === 1 ? 'has' : 'have'} opened their link.`;
  }
  const was = new Map(before.people.map((person) => [person.id, person.name]));
  const now = new Map(after.people.map((person) => [person.id, person.name]));
  const added = after.people.filter((person) => !was.has(person.id)).map((person) => person.name);
  if (added.length) return `Added ${nameList(added)}.`;
  const removed = before.people
    .filter((person) => !now.has(person.id))
    .map((person) => person.name);
  if (removed.length) return `Removed ${nameList(removed)}.`;
  const renamed = after.people.find((person) => was.get(person.id) !== person.name);
  if (renamed) return `Renamed to ${renamed.name}.`;
  const groupsBefore = new Map(before.groups.map((group) => [group.id, group]));
  const groupsNow = new Map(after.groups.map((group) => [group.id, group]));
  const newGroup = after.groups.find((group) => !groupsBefore.has(group.id));
  if (newGroup) return `Added the group ${newGroup.label}.`;
  const goneGroup = before.groups.find((group) => !groupsNow.has(group.id));
  if (goneGroup) return `Removed the group ${goneGroup.label}.`;
  for (const group of after.groups) {
    const old = groupsBefore.get(group.id)!;
    if (old.label !== group.label) return `Group renamed to ${group.label}.`;
    if (old.members.join('|') !== group.members.join('|'))
      return `${group.label} now has ${group.members.length} ${group.members.length === 1 ? 'person' : 'people'}.`;
  }
  const key = (pairs: Snapshot['pairs']) =>
    pairs
      .map((pair) => [...pair].sort().join('+'))
      .sort()
      .join('|');
  if (key(before.pairs) !== key(after.pairs)) return 'Saved who can’t draw whom.';
  if (before.title !== after.title) return 'Title saved.';
  if (before.day !== after.day) return after.day === null ? 'Date cleared.' : 'Date saved.';
  if (before.location !== after.location)
    return after.location ? 'Location saved.' : 'Location cleared.';
  if (before.budget !== after.budget) return after.budget ? 'Budget saved.' : 'Budget cleared.';
  return null;
}

/** The address a person opens to see their own draw. The token is the only secret in it. */
export function santaLinkPath(token: string) {
  return `/santa/${encodeURIComponent(token)}`;
}

/** What a person reads in a shared message. */
export function santaShareText(name: string, title: string) {
  return `${name}, here is your Secret Santa link${title ? ` for ${title}` : ''}`;
}
