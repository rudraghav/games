import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError, santaDetails, santaTokenPattern, type Action } from '@games/api-client';
import { mapRoom } from '@games/api-client/mappers';
import { games } from '@games/api-client/catalog';
import { isBackendRoute } from '@/lib/backend-routes';
import { proxyFailure } from '@/lib/proxy-diagnostics';
import { matchesGame } from '@/features/lounge/catalogue-search';
import { describeMove } from '@/features/room/move-description';
import { santaLinkFailure } from '@/features/santa-link/SantaLink';
import { SantaLinkView, type SantaLinkState } from '@/features/santa-link/SantaLinkView';
import { tableRegistry } from '@/games/registry';
import { SecretSantaTable } from '@/games/secret-santa/SecretSantaTable';
import { SantaPassPhone } from '@/games/secret-santa/SantaPassPhone';
import {
  buildAction,
  describeChange,
  excludedFor,
  hasSeveralNames,
  santaLinkPath,
  santaShareText,
  splitNames,
  type SantaIntent,
} from '@/games/secret-santa/santa-actions';
import {
  MAX_DAY,
  dateInputToDay,
  dayToDateInput,
  formatDay,
  localToday,
} from '@/games/secret-santa/santa-date';
import { createSantaOutbox } from '@/games/secret-santa/santa-outbox';
import { GameArt } from '@/shared/GameArt';
import { organiserDirection } from '@/shared/tutorial/organiser-direction';
import { practiceDirection } from '@/shared/tutorial/coach-state';
import { tutorialLessons } from '@/shared/tutorial/lessons';
import { santaFixtures, santaOrganiserId, santaRoom } from '@/stories/fixtures/secret-santa';

const fixture = (label: string) => {
  const found = santaFixtures.find((item) => item.label.endsWith(label));
  if (!found) throw new Error(`No Secret Santa fixture ends with "${label}".`);
  return mapRoom(found.room);
};
const ready = () => fixture('ready to draw');
const drawn = () => fixture('drawn, two opened');

function table(room: ReturnType<typeof mapRoom>, onAction: (action: Action) => void = () => {}) {
  return renderToStaticMarkup(
    <QueryClientProvider client={new QueryClient()}>
      <SecretSantaTable
        room={room}
        match={room.game!}
        selfId={santaOrganiserId}
        pending={false}
        onAction={onAction}
      />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe('Secret Santa organiser view', () => {
  it('accepts the organiser contract and maps it for the table', () => {
    const detail = santaDetails(drawn().game!.detail);
    expect(detail).toMatchObject({
      title: 'Office party',
      day: 2544,
      location: 'The canteen, third floor',
      budget: 'Around 10 each',
      drawn: true,
      drawNumber: 1,
      canDraw: false,
      blocked: null,
      showing: null,
      limits: { people: 30, groups: 8, name: 30, title: 60, location: 80, budget: 30 },
    });
    expect(detail.people[0]).toEqual({ id: 'p1', name: 'Sam', opened: true });
    expect(detail.pairs).toEqual([['p1', 'p2']]);
    expect(detail.groups).toEqual([{ id: 'g1', label: 'The Garcias', members: ['p4', 'p5'] }]);
    expect(santaDetails(fixture('showing one name').game!.detail).showing).toEqual({
      giver: 'p3',
      giverName: 'Jo',
      recipientName: 'Aisha',
    });
    expect(santaDetails(fixture('· empty').game!.detail)).toMatchObject({
      day: null,
      people: [],
      blocked: 'Add at least 3 people.',
    });
  });

  it('refuses any view that carries who drew whom outside the pass-the-phone reveal', () => {
    const detail = drawn().game!.detail as Record<string, unknown>;
    const people = detail.people as Record<string, unknown>[];
    for (const leaked of [
      { ...detail, assignment: { p1: 'p3' } },
      { ...detail, recipients: ['p3'] },
      { ...detail, people: people.map((person) => ({ ...person, recipient: 'p3' })) },
      { ...detail, people: people.map((person) => ({ ...person, recipient_name: 'Jo' })) },
      { ...detail, groups: [{ id: 'g1', label: 'Family', members: [], draws: { p4: 'p5' } }] },
      { ...detail, showing: { giver: 'p1', giver_name: 'Sam', recipient_name: 'Jo', next: 'p2' } },
      { ...detail, limits: { ...(detail.limits as object), assignment: 1 } },
    ])
      expect(() => santaDetails(leaked)).toThrow();
    // A malformed view is refused as well, never half-shown.
    expect(() => santaDetails({ ...detail, day: 2544.5 })).toThrow();
    expect(() => santaDetails({ ...detail, pairs: [['p1']] })).toThrow();
    expect(() => santaDetails({ ...detail, people: undefined })).toThrow();
  });

  it('shows a refusal instead of the table when the view is not the contract', () => {
    const room = drawn();
    room.game!.detail = { ...room.game!.detail, assignment: { p1: 'p3' } };
    const html = table(room);
    expect(html).toContain('role="alert"');
    expect(html).not.toContain('Share each person');
    expect(html).not.toContain('Sam');
  });
});

describe('Secret Santa dates', () => {
  it('converts day numbers and date inputs across leap years with UTC arithmetic', () => {
    for (const [day, date] of [
      [0, '2020-01-01'],
      [59, '2020-02-29'],
      [60, '2020-03-01'],
      [366, '2021-01-01'],
      [1520, '2024-02-29'],
      [1521, '2024-03-01'],
      [2544, '2026-12-19'],
      [MAX_DAY, '2129-07-08'],
    ] as const) {
      expect(dayToDateInput(day), date).toBe(date);
      expect(dateInputToDay(date), date).toBe(day);
    }
    // Every day in the first leap cycle survives a round trip.
    for (let day = 0; day <= 1461; day++) expect(dateInputToDay(dayToDateInput(day))).toBe(day);
    // 2100 is not a leap year; a date that does not exist is refused, not rolled over.
    expect(dateInputToDay('2100-02-29')).toBeNull();
    expect(dateInputToDay('2023-02-29')).toBeNull();
    expect(dateInputToDay('2026-13-01')).toBeNull();
    expect(dateInputToDay('2019-12-31')).toBeNull();
    expect(dateInputToDay('2129-07-09')).toBeNull();
    expect(dateInputToDay('')).toBeNull();
    expect(dateInputToDay('20/12/2026')).toBeNull();
    expect(dayToDateInput(null)).toBe('');
    expect(dayToDateInput(-1)).toBe('');
    expect(dayToDateInput(MAX_DAY + 1)).toBe('');
    expect(formatDay(null)).toBe('');
  });

  it('means the same calendar day in every time zone', () => {
    for (const zone of ['Pacific/Kiritimati', 'Pacific/Pago_Pago', 'Asia/Kolkata', 'UTC']) {
      vi.stubEnv('TZ', zone);
      expect(new Date(2026, 11, 19).getDate(), zone).toBe(19);
      expect(dayToDateInput(2544), zone).toBe('2026-12-19');
      expect(dateInputToDay('2026-12-19'), zone).toBe(2544);
      expect(formatDay(2544), zone).toBe('Saturday 19 December 2026');
      expect(formatDay(59), zone).toBe('Saturday 29 February 2020');
      // "Today" follows the viewer's own calendar, late evening or early morning.
      expect(localToday(new Date(2026, 11, 19, 23, 59)), zone).toBe(2544);
      expect(localToday(new Date(2026, 11, 19, 0, 1)), zone).toBe(2544);
    }
  });
});

describe('Secret Santa moves', () => {
  const build = (room: ReturnType<typeof mapRoom>, intent: SantaIntent) =>
    buildAction(room.game!, intent);

  it('fills in an offered action for every control', () => {
    const setup = ready();
    const after = drawn();
    const showing = fixture('showing one name');
    const cases: [ReturnType<typeof mapRoom>, SantaIntent, Partial<Action>][] = [
      [setup, { type: 'add_name', text: '  Chidi   Anagonye ' }, { choice: 'Chidi Anagonye' }],
      [
        setup,
        { type: 'rename', target: 'p2', text: 'Priya K' },
        { target: 'p2', choice: 'Priya K' },
      ],
      [setup, { type: 'remove_name', target: 'p3' }, { target: 'p3', choice: '' }],
      [
        setup,
        { type: 'set_exclusions', target: 'p1', ids: ['p2', 'p4', 'p2', 'p1'] },
        { target: 'p1', cards: ['p2', 'p4'] },
      ],
      [setup, { type: 'set_exclusions', target: 'p1', ids: [] }, { target: 'p1', cards: [] }],
      [setup, { type: 'add_group', text: 'The Patels' }, { choice: 'The Patels' }],
      [
        setup,
        { type: 'rename_group', target: 'g1', text: 'Family' },
        { target: 'g1', choice: 'Family' },
      ],
      [setup, { type: 'remove_group', target: 'g1' }, { target: 'g1' }],
      [
        setup,
        { type: 'set_group', target: 'g1', ids: ['p4', 'p5', 'p6'] },
        { target: 'g1', cards: ['p4', 'p5', 'p6'] },
      ],
      [setup, { type: 'set_title', text: 'Winter lunch' }, { choice: 'Winter lunch' }],
      [setup, { type: 'set_location', text: 'Room 4' }, { choice: 'Room 4' }],
      [setup, { type: 'set_budget', text: '15' }, { choice: '15' }],
      [setup, { type: 'set_day', day: 2544 }, { amount: 2544 }],
      [setup, { type: 'clear', target: 'day' }, { target: 'day' }],
      [setup, { type: 'clear', target: 'location' }, { target: 'location' }],
      [setup, { type: 'clear', target: 'budget' }, { target: 'budget' }],
      [setup, { type: 'draw' }, {}],
      [after, { type: 'set_title', text: 'New title' }, { choice: 'New title' }],
      [after, { type: 'set_day', day: 0 }, { amount: 0 }],
      [after, { type: 'reveal', target: 'p5' }, { target: 'p5' }],
      [showing, { type: 'hide' }, {}],
      [after, { type: 'redraw' }, {}],
      [after, { type: 'finish' }, {}],
    ];
    for (const [room, intent, filled] of cases) {
      const action = build(room, intent);
      const option = room.game!.actions.find(
        (item) =>
          item.value.type === intent.type &&
          item.value.target === ('target' in intent ? intent.target : ''),
      )!;
      // Exactly the offered action, with only its input filled in.
      expect(action, intent.type).toEqual({ ...option.value, ...filled });
    }
    // Every action type the engine offers has a control that can build it.
    const built = new Set(cases.map(([, intent]) => intent.type));
    for (const room of [setup, after, showing])
      for (const option of room.game!.actions) expect(built).toContain(option.value.type);
  });

  it('never builds a move the server does not offer, or one with unusable input', () => {
    const setup = ready();
    const after = drawn();
    const blocked = fixture('two people, draw blocked');
    expect(build(blocked, { type: 'draw' })).toBeNull();
    expect(build(after, { type: 'add_name', text: 'Late arrival' })).toBeNull();
    expect(build(after, { type: 'set_exclusions', target: 'p1', ids: ['p2'] })).toBeNull();
    expect(build(after, { type: 'hide' })).toBeNull();
    expect(build(setup, { type: 'reveal', target: 'p1' })).toBeNull();
    expect(build(setup, { type: 'rename', target: 'p99', text: 'Nobody' })).toBeNull();
    expect(build(setup, { type: 'add_name', text: '   ' })).toBeNull();
    expect(build(setup, { type: 'set_day', day: MAX_DAY + 1 })).toBeNull();
    expect(build(setup, { type: 'set_day', day: -1 })).toBeNull();
    expect(build(setup, { type: 'set_day', day: 1.5 })).toBeNull();
    for (const option of fixture('finished').game!.actions) throw new Error(option.label);
    expect(build(fixture('finished'), { type: 'finish' })).toBeNull();
    // Only people the server lists for this choice are ever sent.
    expect(
      build(setup, { type: 'set_exclusions', target: 'p1', ids: ['p2', 'ghost'] })?.cards,
    ).toEqual(['p2']);
  });

  it('splits typed or pasted names on commas and new lines', () => {
    expect(splitNames('Sam, Priya,Jo')).toEqual(['Sam', 'Priya', 'Jo']);
    expect(splitNames('Sam\nPriya\r\nJo\n\n')).toEqual(['Sam', 'Priya', 'Jo']);
    expect(splitNames('  Mary   Ann ;Lee,, ,\tKit ')).toEqual(['Mary Ann', 'Lee', 'Kit']);
    expect(splitNames('Sam, sam, Sam')).toEqual(['Sam', 'sam', 'Sam']);
    expect(splitNames('Anne-Marie O’Neil')).toEqual(['Anne-Marie O’Neil']);
    expect(splitNames(`${'x'.repeat(40)}, Jo`)).toEqual(['x'.repeat(30), 'Jo']);
    expect(splitNames(' , \n ')).toEqual([]);
    expect(hasSeveralNames('Sam, Priya')).toBe(true);
    expect(hasSeveralNames('Sam\nPriya')).toBe(true);
    expect(hasSeveralNames('Sam Priya')).toBe(false);
    expect(hasSeveralNames('Sam,')).toBe(false);
  });

  it('reads exclusions both ways and describes each saved change in one sentence', () => {
    const before = { ...santaDetails(ready().game!.detail), phase: 'setup' };
    expect(excludedFor(before, 'p1')).toEqual(['p2']);
    expect(excludedFor(before, 'p2')).toEqual(['p1']);
    expect(excludedFor(before, 'p3')).toEqual([]);
    const change = (next: Partial<typeof before>) => describeChange(before, { ...before, ...next });
    expect(change({})).toBeNull();
    expect(
      change({ people: [...before.people, { id: 'p7', name: 'Sam (2)', opened: false }] }),
    ).toBe('Added Sam (2).');
    expect(change({ people: before.people.slice(1) })).toBe('Removed Sam.');
    expect(change({ pairs: [] })).toBe('Saved who can’t draw whom.');
    expect(change({ groups: [] })).toBe('Removed the group The Garcias.');
    expect(change({ title: 'Lunch' })).toBe('Title saved.');
    expect(change({ day: null })).toBe('Date cleared.');
    expect(change({ budget: '' })).toBe('Budget cleared.');
    expect(change({ location: 'Room 4' })).toBe('Location saved.');
    const after = { ...before, phase: 'drawn', drawn: true, drawNumber: 1 };
    expect(describeChange(before, after)).toBe('Names drawn. Each person now has a private link.');
    expect(describeChange(after, { ...before, drawNumber: 1 })).toContain('no longer work');
    expect(describeChange(after, { ...after, phase: 'finished' })).toContain('Finished');
    const opened = after.people.map((person) => ({ ...person, opened: person.id === 'p4' }));
    expect(describeChange(after, { ...after, people: opened })).toBe(
      'Mateo has opened their link.',
    );
  });

  it('sends queued moves one at a time, in order, and drops the rest after a refusal', () => {
    vi.useFakeTimers();
    const room = ready();
    const sent: Action[] = [];
    const outbox = createSantaOutbox(500);
    const pump = (version: number, pending: boolean, paused = false) =>
      outbox.pump({
        match: room.game!,
        version,
        pending,
        paused,
        onAction: (action) => sent.push(action),
      });
    outbox.send(
      { type: 'add_name', text: 'Ana' },
      { type: 'add_name', text: 'Ben' },
      { type: 'add_name', text: 'Cy' },
    );
    expect(outbox.getSnapshot().waiting).toHaveLength(3);
    pump(1, false, true);
    expect(sent).toHaveLength(0); // paused: nothing leaves
    pump(1, false);
    pump(1, false); // the request has not started yet: still only one move out
    pump(1, true);
    pump(1, true);
    expect(sent.map((action) => action.choice)).toEqual(['Ana']);
    pump(2, true); // saved, the room is still settling
    expect(sent).toHaveLength(1);
    pump(2, false);
    expect(sent.map((action) => action.choice)).toEqual(['Ana', 'Ben']);
    // The second move is refused and the refreshed table is the same one: it was
    // the move itself, so the rest of the queue is dropped and the organiser is told.
    pump(2, true);
    pump(2, false);
    pump(2, false);
    expect(sent).toHaveLength(2);
    expect(outbox.getSnapshot().problem.count).toBe(0);
    vi.advanceTimersByTime(600);
    expect(outbox.getSnapshot().waiting).toHaveLength(0);
    expect(outbox.getSnapshot().problem.count).toBe(1);
    pump(2, false);
    expect(sent).toHaveLength(2);
    // A move the room never started does not block the next one for ever.
    outbox.send({ type: 'set_title', text: 'Lunch' }, { type: 'set_budget', text: '5' });
    pump(2, false);
    pump(2, false);
    expect(sent).toHaveLength(3);
    vi.advanceTimersByTime(600);
    pump(2, false);
    expect(sent.map((action) => action.type)).toEqual([
      'add_name',
      'add_name',
      'set_title',
      'set_budget',
    ]);
    // An intent the server no longer offers is reported, not sent.
    pump(3, false);
    outbox.send({ type: 'reveal', target: 'p1' });
    pump(3, false);
    expect(sent).toHaveLength(4);
    expect(outbox.getSnapshot().problem.count).toBe(2);
    outbox.dispose();
  });

  it('sends a move again, once, when it was refused only because someone opened a link', () => {
    vi.useFakeTimers();
    const room = drawn();
    const sent: Action[] = [];
    const outbox = createSantaOutbox(500);
    const pump = (version: number, pending: boolean) =>
      outbox.pump({
        match: room.game!,
        version,
        pending,
        paused: false,
        onAction: (action) => sent.push(action),
      });
    outbox.send({ type: 'finish' }, { type: 'set_title', text: 'After' });
    pump(14, false);
    pump(14, true);
    pump(14, false); // refused as out of date
    expect(sent.map((action) => action.type)).toEqual(['finish']);
    pump(15, false); // the refreshed table had moved on: the same move goes again
    expect(sent.map((action) => action.type)).toEqual(['finish', 'finish']);
    expect(outbox.getSnapshot().problem.count).toBe(0);
    pump(15, true);
    pump(16, false); // saved, and the queue carries on
    expect(sent.map((action) => action.type)).toEqual(['finish', 'finish', 'set_title']);
    // A second refusal of the same move is final.
    pump(16, true);
    pump(17, false);
    outbox.send({ type: 'redraw' });
    pump(17, false);
    pump(17, true);
    pump(17, false);
    pump(18, false);
    pump(18, true);
    pump(18, false);
    expect(sent.filter((action) => action.type === 'redraw')).toHaveLength(2);
    expect(outbox.getSnapshot().problem.count).toBe(1);
    vi.advanceTimersByTime(2000);
    expect(outbox.getSnapshot().problem.count).toBe(1);
    outbox.dispose();
  });
});

describe('Secret Santa organiser page', () => {
  it('lays out the setup page with labelled fields, the people, their rules and the draw', () => {
    const html = table(ready());
    for (const label of ['Title', 'Date', 'Location', 'Budget', 'Add a name', 'Add a group'])
      expect(html).toMatch(new RegExp(`<label[^>]*>${label}</label>`));
    expect(html).toContain('type="date"');
    expect(html).toContain('value="2026-12-19"');
    expect(html).toContain('Saturday 19 December 2026');
    expect(html).toContain('aria-label="6 of 30 people"');
    expect(html).toContain('1 of 8');
    // The individual exclusion shows on both people, the group on each member.
    expect(html.match(/Can’t draw: Priya/g)).toHaveLength(1);
    expect(html.match(/Can’t draw: Sam/g)).toHaveLength(1);
    expect(html.match(/Group: The Garcias/g)).toHaveLength(2);
    expect(html).toContain('aria-label="Choose who Sam can’t draw"');
    expect(html).toContain('aria-label="Rename Sam"');
    expect(html).toContain('aria-label="Remove Sam"');
    expect(html).toContain(
      'People in the same group never draw each other: couples, households, teams.',
    );
    expect(html).toMatch(/<button[^>]*id="santa-draw-button"[^>]*>.*?Draw names<\/button>/);
    expect(html).not.toMatch(/<button[^>]*id="santa-draw-button"[^>]*disabled/);
    expect(html).toContain('role="status"');
  });

  it('keeps Draw names disabled and says why in the server’s words', () => {
    for (const [label, reason] of [
      ['two people, draw blocked', 'Add at least 3 people.'],
      ['impossible rules', 'Sam has nobody left to draw. Remove an exclusion or a group.'],
    ]) {
      const html = table(fixture(label));
      expect(html).toMatch(/<button[^>]*id="santa-draw-button"[^>]*disabled=""/);
      expect(html).toMatch(
        new RegExp(`<p id="santa-draw-note"[^>]*data-blocked="true"[^>]*>${reason}</p>`),
      );
      expect(html).toContain('aria-describedby="santa-draw-note"');
    }
  });

  it('never names a recipient: after the draw it lists people and links, not who drew whom', () => {
    const room = drawn();
    const html = table(room);
    expect(html).toContain('Only each person can see who they drew.');
    expect(html).toContain('Share each person’s link');
    expect(html).toContain('2 of 6 opened');
    expect(html.match(/Not opened yet/g)).toHaveLength(4);
    expect(html).toContain('aria-label="Copy link for Sam"');
    expect(html).toContain('aria-label="Show on this phone for Sam"');
    expect(html).not.toContain('→');
    expect(html).not.toMatch(/\bdrew\s+<|buying a gift for/);
    // No link address is written into the page.
    expect(html).not.toContain('/santa/');
    // Setup-only controls are gone; the event can still be edited.
    expect(html).not.toContain('Add a name');
    expect(html).not.toContain('santa-draw-button');
    expect(html).toMatch(/<input[^>]*id="santa-title"[^>]*value="Office party"/);
    expect(html).not.toMatch(/<input[^>]*id="santa-title"[^>]*disabled/);
  });

  it('keeps a name the server is showing off the screen until the person says who they are', () => {
    const wire = santaRoom({
      phase: 'drawn',
      people: [
        { id: 'p1', name: 'Sam' },
        { id: 'p2', name: 'Priya' },
        { id: 'p3', name: 'Jo' },
      ],
      showing: { giver: 'p1', giver_name: 'Sam', recipient_name: 'Zebedee-Recipient' },
    });
    // A reload in the middle of a reveal starts again at the handover.
    const html = table(mapRoom(wire));
    expect(html).toContain('Hand the phone to Sam');
    expect(html).toContain('I’m Sam, show who I drew');
    expect(html).not.toContain('Zebedee-Recipient');
    const shown = renderToStaticMarkup(
      <SantaPassPhone
        giverName="Sam"
        recipientName="Zebedee-Recipient"
        step="shown"
        paused={false}
        onConfirm={() => {}}
        onHide={() => {}}
      />,
    );
    expect(shown).toContain('Sam, you’re buying a gift for');
    expect(shown).toContain('Zebedee-Recipient');
    expect(shown).toMatch(/<button[^>]*>.*?Hide<\/button>/);
    for (const step of ['handover', 'waiting', 'hiding'] as const)
      expect(
        renderToStaticMarkup(
          <SantaPassPhone
            giverName="Sam"
            recipientName="Zebedee-Recipient"
            step={step}
            paused={false}
            onConfirm={() => {}}
            onHide={() => {}}
          />,
        ),
        step,
      ).not.toContain('Zebedee-Recipient');
  });

  it('shows a finished event read-only, with the links still listed', () => {
    const html = table(fixture('finished'));
    expect(html).toContain('This Secret Santa is finished and the links keep working.');
    expect(html).toContain('6 of 6 opened');
    expect(html).toContain('Organise another draw');
    expect(html).not.toContain('Show on this phone');
    expect(html).not.toMatch(/>\s*Redraw\s*</);
    expect(html).not.toContain('id="santa-title"');
    expect(html).toContain('Saturday 19 December 2026');
  });

  it('says that the old links stopped working when the organiser goes back to the list', () => {
    const html = table(fixture('back at the list after a draw'));
    expect(html).toContain('its links no longer work');
    expect(html).toContain('Add a name');
  });
});

describe('Secret Santa private link', () => {
  const reveal = {
    title: 'Office party',
    day: 2544,
    location: 'The canteen',
    budget: '10',
    giverName: 'Sam',
    recipientName: 'Zebedee-Recipient',
  };
  const view = (state: SantaLinkState, shown = false) =>
    renderToStaticMarkup(
      <SantaLinkView
        state={state}
        shown={shown}
        onShow={() => {}}
        onHide={() => {}}
        onRetry={() => {}}
      />,
    );

  it('greets the person and keeps the name off the screen until they tap', () => {
    const html = view({ kind: 'ready', reveal });
    expect(html).toContain('Hi Sam');
    expect(html).toMatch(/<button[^>]*>.*?Show who I’m buying for<\/button>/);
    expect(html.match(/<button/g)).toHaveLength(1);
    expect(html).not.toContain('Zebedee-Recipient');
    const shown = view({ kind: 'ready', reveal }, true);
    expect(shown).toContain('Zebedee-Recipient');
    expect(shown).toContain('Office party');
    expect(shown).toContain('Saturday 19 December 2026');
    expect(shown).toContain('The canteen');
    expect(shown).toContain('<dt>Budget</dt><dd>10</dd>');
    expect(shown).toContain('Hide the name');
    // Unset details are left out rather than shown empty.
    const bare = view(
      { kind: 'ready', reveal: { ...reveal, day: null, location: '', budget: '' } },
      true,
    );
    expect(bare).not.toContain('<dt>Date</dt>');
    expect(bare).not.toContain('<dt>Where</dt>');
    expect(bare).not.toContain('<dt>Budget</dt>');
  });

  it('has a plain message for each failure and offers a retry only for a connection problem', () => {
    const invalid = view({ kind: 'invalid' });
    expect(invalid).toContain('This link doesn’t work any more');
    expect(invalid).toContain('role="alert"');
    expect(invalid).not.toContain('<button');
    const limited = view({ kind: 'limited' });
    expect(limited).toContain('Too many tries');
    expect(limited).not.toContain('<button');
    expect(view({ kind: 'failed' })).toMatch(/<button[^>]*>.*?Try again<\/button>/);
    expect(view({ kind: 'loading' })).toContain('role="status"');
    expect(santaLinkFailure(new ApiError(404, 'x'))).toEqual({ kind: 'invalid' });
    expect(santaLinkFailure(new ApiError(422, 'x'))).toEqual({ kind: 'invalid' });
    expect(santaLinkFailure(new ApiError(429, 'x'))).toEqual({ kind: 'limited' });
    expect(santaLinkFailure(new ApiError(503, 'x'))).toEqual({ kind: 'failed' });
    expect(santaLinkFailure(new TypeError('offline'))).toEqual({ kind: 'failed' });
  });

  it('links nowhere near the organiser’s room and sends no referrer', () => {
    for (const html of [
      view({ kind: 'ready', reveal }),
      view({ kind: 'ready', reveal }, true),
      view({ kind: 'invalid' }),
    ]) {
      const links = html.match(/<a\b[^>]*>/g) ?? [];
      expect(links.length).toBeGreaterThan(0);
      for (const link of links) {
        expect(link).toContain('href="/"');
        expect(link).toContain('referrerPolicy="no-referrer"');
      }
      expect(html).not.toMatch(/\/games\/secret-santa\/play|\/rooms\//);
    }
  });

  it('keeps the token in one path segment and out of logs', () => {
    const token = 'Zm9vYmFyYmF6cXV4Zm9vYmFyYmF6cXV4Zm9vYmFyYmF6cXV4';
    expect(santaTokenPattern.test(token)).toBe(true);
    for (const bad of ['short', `${token}/x`, `${token}?a=1`, '../../v1/me', `${token} `, ''])
      expect(santaTokenPattern.test(bad), bad).toBe(false);
    expect(santaLinkPath(token)).toBe(`/santa/${token}`);
    expect(santaShareText('Sam', 'Office party')).toBe(
      'Sam, here is your Secret Santa link for Office party',
    );
    expect(isBackendRoute(`v1/secret-santa/${token}`, 'GET')).toBe(true);
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE'])
      expect(isBackendRoute(`v1/secret-santa/${token}`, method)).toBe(false);
    for (const path of [
      'v1/secret-santa/short',
      `v1/secret-santa/${token}/extra`,
      'v1/secret-santa/%2e%2e%2fme-and-more-padding-here',
      'v1/secret-santa/',
    ])
      expect(isBackendRoute(path, 'GET'), path).toBe(false);
    const room = '6f1f6a4e-6f0c-5d3f-9d0c-3f0a7c1d2e41';
    expect(isBackendRoute(`v1/rooms/${room}/secret-santa/links`, 'GET')).toBe(true);
    expect(isBackendRoute(`v1/rooms/${room}/secret-santa/links`, 'POST')).toBe(false);
    expect(isBackendRoute(`v1/rooms/${room}/secret-santa/assignment`, 'GET')).toBe(false);
    const logged = JSON.stringify(proxyFailure(`v1/secret-santa/${token}`, 'GET', 0, 502));
    expect(logged).not.toContain(token);
    expect(logged).toContain('v1/secret-santa/:token');
    expect(proxyFailure(`v1/rooms/${room}/secret-santa/links`, 'GET', 0, 502).route).toBe(
      'v1/rooms/:room/secret-santa/links',
    );
  });
});

describe('Secret Santa in the catalogue', () => {
  const game = games.find((entry) => entry.id === 'secret-santa')!;

  it('is a solo organiser game with its own table, cover and search words', () => {
    expect(game).toMatchObject({ family: 'organiser', playMode: 'solo', maxPlayers: 1 });
    expect(tableRegistry['secret-santa']).toBe(SecretSantaTable);
    expect(renderToStaticMarkup(<GameArt game={game} />)).toContain('game-art--santa');
    for (const query of ['secret santa', 'gift exchange', 'draw names', 'Kris Kringle', 'santa'])
      expect(matchesGame(game, query, 0, 'all'), query).toBe(true);
    // One organiser runs it for a group of any size.
    for (const players of [1, 6, 10]) expect(matchesGame(game, '', players, 'party')).toBe(true);
    expect(matchesGame(game, '', 0, 'solo')).toBe(true);
    expect(matchesGame(game, '', 0, 'casino')).toBe(false);
    expect(matchesGame(game, 'drinking', 10, 'party')).toBe(false);
  });

  it('explains every action the organiser can be offered and coaches the next useful one', () => {
    const lesson = tutorialLessons['secret-santa'];
    for (const item of santaFixtures)
      for (const option of item.room.game!.actions!)
        expect(lesson.actions[option.action.type], option.action.type).toBeTruthy();
    const direction = (label: string) => {
      const match = fixture(label).game!;
      const found = organiserDirection(match);
      return found ? { ...found, title: practiceDirection(found.option, match).title } : found;
    };
    expect(direction('· empty')).toMatchObject({ title: 'Add a name' });
    expect(direction('two people, draw blocked')).toMatchObject({
      title: 'Add a name',
      tip: 'Add at least 3 people.',
    });
    expect(direction('ready to draw')).toMatchObject({ title: 'Draw the names' });
    // The first person who has not looked yet.
    expect(direction('drawn, two opened')).toMatchObject({ title: 'Show Jo their name' });
    expect(direction('showing one name')).toMatchObject({ title: 'Hide the name' });
    expect(direction('finished')).toBeUndefined();
  });

  it('describes an organiser’s saved move without players, chips or targets', () => {
    const room = { ...ready(), gameId: 'secret-santa' };
    expect(
      describeMove(
        room,
        {
          version: 4,
          actorId: santaOrganiserId,
          type: 'set_day',
          label: 'Set the date',
          targets: ['p1'],
          amount: 2544,
          cards: [],
          destination: null,
          count: null,
        },
        santaOrganiserId,
      ),
    ).toBe('You set the date');
  });
});
