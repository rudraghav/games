import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  assignmentChoice,
  fateAssignments,
  truthOrDareDetails,
  type ActionOption,
} from '@games/api-client';
import { mapRoom } from '@games/api-client/mappers';
import { gameById } from '@games/api-client/catalog';
import type { components } from '@games/api-client/wire';
import { fixtures } from '@/stories/generated/rooms';
import { midgameScenarios } from '@/stories/generated/midgame-scenarios';
import { TruthOrDareTable } from '@/games/truth-or-dare/TruthOrDareTable';
import { assignOption, chooseFate, emptyFates } from '@/games/truth-or-dare/fate-assignment';
import {
  adultsGate,
  adultsOnly,
  adultsOnlyConfirmed,
  rememberAdultsOnly,
} from '@/shared/adults-only';
import { RoomScreen } from '@/features/room/Room';
import { Lobby } from '@/features/room/Lobby';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => currentPath,
}));
vi.mock('@/features/room/useRoom', () => ({
  useRoom: () => ({
    room: { data: currentRoom, error: null, isFetching: false },
    me: { data: { profile: { id: currentSelf } }, isSuccess: true, error: null, isFetching: false },
    mutation: { isPending: false, isPaused: false, error: null },
    live: false,
    connection: 'online',
    move: vi.fn(),
    botError: null,
    retryBots: vi.fn(),
  }),
}));

type Wire = components['schemas']['RoomView'];
let currentRoom: ReturnType<typeof mapRoom>;
let currentSelf = '';
let currentPath = '/';

const scenario = (phase: string) =>
  midgameScenarios.find(
    (item) => item.game === 'truth-or-dare' && item.room.game?.phase === phase,
  )!;
const minimum = fixtures.find((item) => item.label === 'Truth or Dare · minimum seats')!;

function table(wire: Wire, selfId: string, change: Record<string, unknown> = {}) {
  const room = mapRoom(wire);
  const match = { ...room.game!, ...change };
  return renderToStaticMarkup(
    <TruthOrDareTable
      room={room}
      match={match}
      selfId={selfId}
      pending={false}
      onAction={() => undefined}
    />,
  );
}

function assignActions(): ActionOption[] {
  return fateAssignments.map((choice) => ({
    label: choice,
    value: { type: 'assign', choice } as ActionOption['value'],
    input: null,
    minimum: null,
    maximum: null,
    step: 1,
    eligibleCards: [],
  })) as unknown as ActionOption[];
}

describe('Truth or Dare projection', () => {
  it('accepts every generated view and refuses keys outside the README contract', () => {
    const views = [
      ...fixtures.filter((item) => item.room.game_id === 'truth-or-dare').map((item) => item.room),
      ...midgameScenarios.filter((item) => item.game === 'truth-or-dare').map((item) => item.room),
    ];
    expect(views.length).toBeGreaterThan(5);
    for (const view of views) {
      const data = truthOrDareDetails(view.game!.detail);
      expect(data.fates).toHaveLength(3);
      expect(data.edition).toBe('friendly');
    }
    const detail = minimum.room.game!.detail;
    expect(() => truthOrDareDetails({ ...detail, stock: [] })).toThrow();
    expect(() =>
      truthOrDareDetails({
        ...detail,
        prompt: {
          player: 'p',
          kind: 'truth',
          text: 'x',
          candidates: null,
          swapped: false,
          deck: 1,
        },
      }),
    ).toThrow();
    // A candidate is a label or a player, never both or neither.
    const candidates = [
      { label: 'a', player: null },
      { label: null, player: 'p2' },
      { label: 'b', player: 'p3' },
    ];
    expect(() =>
      truthOrDareDetails({
        ...detail,
        prompt: { player: 'p', kind: 'burning', text: null, candidates, swapped: false },
      }),
    ).toThrow();
  });
});

describe('Burning building fates', () => {
  it('keeps fates mutually exclusive and maps all six assignments to the server option', () => {
    let draft = emptyFates;
    draft = chooseFate(draft, 0, 2);
    draft = chooseFate(draft, 1, 2);
    // Row 1 took fate 2; row 0 is left without one rather than sharing it.
    expect(draft).toEqual([null, 2, null]);
    expect(assignOption(assignActions(), draft)).toBeUndefined();
    draft = chooseFate(draft, 0, 0);
    draft = chooseFate(draft, 2, 1);
    expect(assignOption(assignActions(), draft)?.value.choice).toBe('021');
    // Moving a fate onto a row that holds another swaps the two.
    expect(chooseFate([0, 2, 1], 0, 1)).toEqual([1, 2, 0]);
    for (const choice of fateAssignments) {
      const fates = [...choice].map(Number);
      expect(assignmentChoice(fates)).toBe(choice);
      expect(assignOption(assignActions(), fates)?.value.choice).toBe(choice);
    }
    expect(assignmentChoice([0, 0, 1])).toBeNull();
    expect(assignmentChoice([0, 1, null])).toBeNull();
  });

  it('reads fate labels from the projection, names player candidates and keeps Confirm disabled', () => {
    const sample = scenario('assign');
    const wire = structuredClone(sample.room);
    const detail = wire.game!.detail as Record<string, unknown> & {
      prompt: { player: string; candidates: unknown };
    };
    const others = wire.members.filter((member) => member.id !== detail.prompt.player);
    detail.fates = ['Rescue', 'Recruit', 'Wave goodbye'];
    detail.prompt.candidates = [
      { label: null, player: others[0].id },
      { label: 'a lighthouse keeper', player: null },
      { label: 'a stage magician', player: null },
    ];
    const html = table(wire, detail.prompt.player);
    for (const fate of ['Rescue', 'Recruit', 'Wave goodbye']) expect(html).toContain(fate);
    expect(html).not.toContain('Kiss');
    expect(html).toContain(others[0].name.replace(/^Bot\s+/i, ''));
    expect(html).toContain('a lighthouse keeper');
    expect(html.match(/type="radio"/g)).toHaveLength(9);
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Confirm fates/);
    expect(html).toContain('0 of 3 fates given');
    // Everyone else sees the same three, without the controls.
    const watcher = others.find((member) => !member.is_bot) ?? others[0];
    const watching = table(wire, watcher.id, { actions: [] });
    expect(watching).toContain('a stage magician');
    expect(watching).not.toContain('type="radio"');
  });
});

describe('Truth or Dare table', () => {
  it('offers the kinds, then Done as the one filled choice beside Pass and the swap count', () => {
    const room = mapRoom(minimum.room);
    const choose = table(minimum.room, minimum.selfId);
    expect(choose).toContain('truth-or-dare-game');
    for (const label of ['Truth', 'Dare', 'Burning building']) expect(choose).toContain(label);
    expect(choose.match(/button--primary/g)).toHaveLength(1);
    expect(room.game!.phase).toBe('choose');

    const sample = scenario('prompt');
    const active = (sample.room.game!.detail as { prompt: { player: string; text: string } })
      .prompt;
    const html = table(sample.room, active.player);
    expect(html).toContain(active.text);
    expect(html).toMatch(/button--primary[^>]*>Done/);
    expect(html).toContain('Pass');
    expect(html).toContain('Swap for another');
    expect(html).toContain('1 swap left in the match');
    expect(html.match(/button--primary/g)).toHaveLength(1);
    expect(html).not.toContain('18+');
    // A friend sees the same card, who drew it, and no controls.
    const other = sample.room.members.find((member) => member.id !== active.player)!;
    const seen = table(sample.room, other.id, { actions: [] });
    expect(seen).toContain(active.text);
    expect(seen).toContain('Drawn by');
    expect(seen).not.toContain('Swap for another');
  });

  it('shows the result to everyone and marks the 18+ edition in words', () => {
    const sample = scenario('result');
    const html = table(sample.room, sample.room.game!.current_player!);
    expect(html).toContain('chose three fates (+1)');
    expect(html).toMatch(/button--primary[^>]*>Next turn/);
    const fates = truthOrDareDetails(sample.room.game!.detail).fates;
    for (const fate of fates) expect(html).toContain(fate);
    const naughty = structuredClone(minimum.room) as Wire;
    (naughty.game!.detail as Record<string, unknown>).edition = 'naughty';
    expect(table(naughty, minimum.selfId)).toContain('18+');
  });
});

describe('The 18+ gate', () => {
  const storage = new Map<string, string>();
  afterEach(() => {
    storage.clear();
    vi.unstubAllGlobals();
  });
  const stubWindow = () =>
    vi.stubGlobal('window', {
      sessionStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
      },
      dispatchEvent: () => true,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    });

  it('needs the host’s 18+ confirmation before a room with the edition can be created', () => {
    const game = gameById('truth-or-dare');
    expect(adultsGate('create', game.settings, {}, false)).toEqual({
      wanted: false,
      blocked: false,
    });
    expect(adultsGate('create', game.settings, { adults_only: true }, false)).toEqual({
      wanted: true,
      blocked: true,
    });
    expect(adultsGate('create', game.settings, { adults_only: true }, true).blocked).toBe(false);
    expect(adultsGate('configure', game.settings, { adults_only: true }, false).blocked).toBe(true);
    expect(adultsGate('join', game.settings, { adults_only: true }, false).wanted).toBe(false);
    // Another game's settings never ask.
    expect(
      adultsGate('create', gameById('uno').settings, { adults_only: true }, false).wanted,
    ).toBe(false);
  });

  it('remembers a confirmation per room for this tab only', () => {
    stubWindow();
    expect(adultsOnlyConfirmed('room-a')).toBe(false);
    rememberAdultsOnly('room-a');
    expect(adultsOnlyConfirmed('room-a')).toBe(true);
    expect(adultsOnlyConfirmed('room-b')).toBe(false);
    expect([...storage.values()]).toEqual(['confirmed']);
  });

  it('shows the confirmation instead of the table or lobby until the viewer continues', () => {
    const sample = scenario('prompt');
    const prompt = (sample.room.game!.detail as { prompt: { text: string } }).prompt;
    const render = () => {
      const cache = new QueryClient();
      const html = renderToStaticMarkup(
        <QueryClientProvider client={cache}>
          <RoomScreen id={currentRoom.id} />
        </QueryClientProvider>,
      );
      cache.clear();
      return html;
    };
    currentSelf = sample.selfId;
    currentRoom = { ...mapRoom(sample.room), settings: { adults_only: true } };
    currentPath = '/';
    const gated = render();
    expect(gated).toContain('This room uses the 18+ edition. Continue?');
    expect(gated).toContain('Continue');
    expect(gated).toContain('Leave the room');
    expect(gated).not.toContain(prompt.text);
    expect(gated).not.toContain('truth-or-dare-game');
    expect(adultsOnly(currentRoom.settings)).toBe(true);
    // The friendly edition goes straight to the table.
    currentRoom = mapRoom(sample.room);
    const open = render();
    expect(open).not.toContain('18+ edition');
    expect(open).toContain('truth-or-dare-game');
  });

  it('marks the lobby of an 18+ room', () => {
    const room = mapRoom({
      ...minimum.room,
      status: 'lobby',
      game: null,
      match_id: null,
      match_version: null,
    });
    const lobby = (settings: Record<string, boolean>) =>
      renderToStaticMarkup(
        <QueryClientProvider client={new QueryClient()}>
          <Lobby
            room={{ ...room, settings }}
            selfId={minimum.selfId}
            ready={() => undefined}
            start={() => undefined}
            configure={() => undefined}
            pending={false}
          />
        </QueryClientProvider>,
      );
    expect(lobby({ adults_only: true })).toContain('adults-badge');
    expect(lobby({})).not.toContain('adults-badge');
  });
});
