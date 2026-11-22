import type { components } from '@games/api-client/wire';

type Wire = components['schemas'];
type Legal = Wire['LegalAction'];

/**
 * Hand-made Secret Santa rooms for stories and unit tests. They follow the
 * organiser's view exactly as the engine projects it (the same labels, offers
 * and limits), but nothing here is generated from the engine: the recorded
 * engine fixtures live under `stories/generated`.
 */
const ORGANISER = '1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5';
const ROOM = '6f1f6a4e-6f0c-5d3f-9d0c-3f0a7c1d2e41';
const MATCH = '0a6c2f0e-9d1b-5a7e-8c3d-2b4f6a8c0e12';
const LIMITS = { people: 30, groups: 8, name: 30, title: 60, location: 80, budget: 30 };

export interface SantaFixtureState {
  phase: 'setup' | 'drawn' | 'finished';
  title?: string;
  day?: number | null;
  location?: string;
  budget?: string;
  people?: { id: string; name: string; opened?: boolean }[];
  pairs?: [string, string][];
  groups?: { id: string; label: string; members: string[] }[];
  drawNumber?: number;
  blocked?: string | null;
  showing?: { giver: string; giver_name: string; recipient_name: string } | null;
  version?: number;
}

function legal(
  label: string,
  type: string,
  extra: Partial<Pick<Legal, 'input' | 'minimum' | 'maximum' | 'eligible_cards'>> & {
    target?: string;
  } = {},
): Legal {
  return {
    label,
    action: {
      type,
      card: '',
      target: extra.target ?? '',
      color: '',
      choice: '',
      amount: 0,
      slot: 0,
      cards: [],
      groups: [],
    },
    input: extra.input ?? null,
    minimum: extra.minimum ?? null,
    maximum: extra.maximum ?? null,
    step: 1,
    eligible_cards: extra.eligible_cards ?? [],
  };
}

function offers(state: Required<Omit<SantaFixtureState, 'version'>>, canDraw: boolean): Legal[] {
  if (state.phase === 'finished') return [];
  const ids = state.people.map((person) => person.id);
  const details = [
    legal('Set the title', 'set_title', { input: 'text', minimum: 1, maximum: LIMITS.title }),
    legal('Set the location', 'set_location', {
      input: 'text',
      minimum: 1,
      maximum: LIMITS.location,
    }),
    legal('Set the budget', 'set_budget', { input: 'text', minimum: 1, maximum: LIMITS.budget }),
    legal('Set the date', 'set_day', { input: 'amount', minimum: 0, maximum: 40000 }),
    ...['day', 'location', 'budget'].map((field) =>
      legal(`Clear the ${field}`, 'clear', { target: field }),
    ),
  ];
  if (state.phase === 'drawn')
    return [
      ...details,
      ...state.people.map((person) =>
        legal(`Show ${person.name} their name`, 'reveal', { target: person.id }),
      ),
      ...(state.showing ? [legal('Hide the name', 'hide')] : []),
      legal('Change the list and draw again', 'redraw'),
      legal('Finish', 'finish'),
    ];
  const options: Legal[] = [];
  if (state.people.length < LIMITS.people)
    options.push(
      legal('Add a name', 'add_name', { input: 'text', minimum: 1, maximum: LIMITS.name }),
    );
  for (const person of state.people) {
    options.push(
      legal(`Rename ${person.name}`, 'rename', {
        target: person.id,
        input: 'text',
        minimum: 1,
        maximum: LIMITS.name,
      }),
      legal(`Remove ${person.name}`, 'remove_name', { target: person.id }),
    );
    if (state.people.length > 1)
      options.push(
        legal(`Choose who ${person.name} can't draw`, 'set_exclusions', {
          target: person.id,
          input: 'cards',
          eligible_cards: ids.filter((id) => id !== person.id),
        }),
      );
  }
  if (state.groups.length < LIMITS.groups)
    options.push(
      legal('Add a group', 'add_group', { input: 'text', minimum: 1, maximum: LIMITS.name }),
    );
  for (const group of state.groups) {
    options.push(
      legal(`Rename ${group.label}`, 'rename_group', {
        target: group.id,
        input: 'text',
        minimum: 1,
        maximum: LIMITS.name,
      }),
      legal(`Remove ${group.label}`, 'remove_group', { target: group.id }),
    );
    if (state.people.length)
      options.push(
        legal(`Choose who is in ${group.label}`, 'set_group', {
          target: group.id,
          input: 'cards',
          eligible_cards: ids,
        }),
      );
  }
  options.push(...details);
  if (canDraw) options.push(legal('Draw the names', 'draw'));
  return options;
}

/** The organiser's room for one saved state, as the API sends it. */
export function santaRoom(input: SantaFixtureState): Wire['RoomView'] {
  const state = {
    title: 'Secret Santa',
    day: null,
    location: '',
    budget: '',
    people: [],
    pairs: [],
    groups: [],
    drawNumber: input.phase === 'setup' ? 0 : 1,
    showing: null,
    ...input,
    blocked:
      input.blocked !== undefined
        ? input.blocked
        : input.phase === 'setup' && (input.people?.length ?? 0) < 3
          ? 'Add at least 3 people.'
          : null,
  };
  const canDraw = state.phase === 'setup' && state.blocked === null;
  const finished = state.phase === 'finished';
  return {
    id: ROOM,
    name: 'Alex’s Secret Santa',
    code: 'PREVIEW1',
    game_id: 'secret-santa',
    owner_id: ORGANISER,
    capacity: 1,
    settings: {},
    status: finished ? 'finished' : 'playing',
    revision: 1,
    match_id: MATCH,
    match_version: input.version ?? 1,
    paused: false,
    bot_pending: false,
    missing_players: [],
    invite_token: null,
    members: [
      {
        id: ORGANISER,
        name: 'Alex',
        avatar: 0,
        ready: true,
        seated: true,
        connected: true,
        last_seen: 0,
        is_bot: false,
      },
    ],
    messages: [],
    game: {
      game_id: 'secret-santa',
      phase: state.phase,
      current_player: finished ? null : ORGANISER,
      players: [
        {
          id: ORGANISER,
          count: 0,
          score: 0,
          chips: null,
          bet: 0,
          folded: false,
          eliminated: false,
          removed_slots: [],
          cards: [],
          bank: [],
          properties: {},
        },
      ],
      hand: [],
      community: [],
      discard: null,
      drawn: null,
      draw_count: 0,
      pot: 0,
      message: '',
      actions: offers(state, canDraw),
      winners: [],
      detail: {
        title: state.title,
        day: state.day,
        location: state.location,
        budget: state.budget,
        people: state.people.map((person) => ({
          id: person.id,
          name: person.name,
          opened: person.opened ?? false,
        })),
        pairs: state.pairs,
        groups: state.groups,
        drawn: state.phase !== 'setup',
        draw_number: state.drawNumber,
        can_draw: canDraw,
        blocked: state.blocked,
        showing: state.showing,
        limits: LIMITS,
      },
    },
  };
}

const office = [
  { id: 'p1', name: 'Sam' },
  { id: 'p2', name: 'Priya' },
  { id: 'p3', name: 'Jo' },
  { id: 'p4', name: 'Mateo' },
  { id: 'p5', name: 'Aisha' },
  { id: 'p6', name: 'Bartholomew-Alexander Fitzgerald' },
];
const details = {
  title: 'Office party',
  // Saturday 19 December 2026.
  day: 2544,
  location: 'The canteen, third floor',
  budget: 'Around 10 each',
};
const rules = {
  pairs: [['p1', 'p2']] as [string, string][],
  groups: [{ id: 'g1', label: 'The Garcias', members: ['p4', 'p5'] }],
};

export const santaOrganiserId = ORGANISER;
export const santaRoomId = ROOM;
export const santaFixtures = [
  { label: 'Secret Santa · empty', room: santaRoom({ phase: 'setup' }) },
  {
    label: 'Secret Santa · two people, draw blocked',
    room: santaRoom({ phase: 'setup', people: office.slice(0, 2) }),
  },
  {
    label: 'Secret Santa · impossible rules',
    room: santaRoom({
      phase: 'setup',
      ...details,
      people: office.slice(0, 3),
      pairs: [
        ['p1', 'p2'],
        ['p1', 'p3'],
      ],
      blocked: 'Sam has nobody left to draw. Remove an exclusion or a group.',
    }),
  },
  {
    label: 'Secret Santa · ready to draw',
    room: santaRoom({ phase: 'setup', ...details, ...rules, people: office }),
  },
  {
    label: 'Secret Santa · drawn, two opened',
    room: santaRoom({
      phase: 'drawn',
      ...details,
      ...rules,
      people: office.map((person, index) => ({ ...person, opened: index < 2 })),
      version: 14,
    }),
  },
  {
    label: 'Secret Santa · showing one name',
    room: santaRoom({
      phase: 'drawn',
      ...details,
      ...rules,
      people: office.map((person, index) => ({ ...person, opened: index < 3 })),
      showing: { giver: 'p3', giver_name: 'Jo', recipient_name: 'Aisha' },
      version: 15,
    }),
  },
  {
    label: 'Secret Santa · back at the list after a draw',
    room: santaRoom({ phase: 'setup', ...details, ...rules, people: office, drawNumber: 1 }),
  },
  {
    label: 'Secret Santa · finished',
    room: santaRoom({
      phase: 'finished',
      ...details,
      ...rules,
      people: office.map((person) => ({ ...person, opened: true })),
      version: 20,
    }),
  },
] as const;
