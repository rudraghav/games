import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApi } from '@games/api-client';
import { quickPlayIntents } from '@/features/game-entry/quick-play-intent';
import { fixtures } from '@/stories/generated/rooms';

describe('bot-count launch intents', () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
      key: (index: number) => [...values.keys()][index] ?? null,
      get length() {
        return values.size;
      },
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('reuses the same request for each choice across a lost response, count change and remount', () => {
    const launch = quickPlayIntents('uno');
    const three = launch.begin('play', 3);
    const five = launch.begin('play', 5);
    expect(five).not.toBe(three);
    const afterRefresh = quickPlayIntents('uno');
    expect(afterRefresh.resumeBotCount()).toBe(5);
    expect(afterRefresh.begin('play', 3)).toBe(three);
    afterRefresh.forget('play', 3, three);
    expect(afterRefresh.resumeBotCount()).toBeNull();
    expect(afterRefresh.begin('play', 5)).toBe(five);
    expect(afterRefresh.begin('play', 3)).not.toBe(three);
  });

  it('forgets every older lost start for the game once a table opens', () => {
    const launch = quickPlayIntents('uno');
    const lost = launch.begin('play', 3);
    const tutorial = launch.begin('tutorial');
    const other = quickPlayIntents('uno-no-mercy').begin('play', 2);
    const opened = launch.begin('play', 2);
    launch.forget('play', 2, opened);
    launch.settle('play');
    const later = quickPlayIntents('uno');
    expect(later.resumeBotCount()).toBeNull();
    expect(later.begin('play', 3)).not.toBe(lost);
    expect(later.begin('tutorial')).toBe(tutorial);
    expect(quickPlayIntents('uno-no-mercy').begin('play', 2)).toBe(other);
  });

  it('recovers legacy default and tutorial requests while keeping other sizes independent', () => {
    const old = crypto.randomUUID();
    const tutorial = crypto.randomUUID();
    sessionStorage.setItem('games:launch:uno', old);
    sessionStorage.setItem('games:launch:tutorial:uno', tutorial);
    const launch = quickPlayIntents('uno');
    expect(launch.begin('play', 4)).not.toBe(old);
    expect(launch.begin('play', 1)).toBe(old);
    expect(launch.begin('play')).toBe(old);
    expect(launch.begin('tutorial')).toBe(tutorial);
    expect(quickPlayIntents('uno-no-mercy').resumeBotCount()).toBeNull();
  });

  it('ignores invalid restored choices and keeps same-page retries usable with blocked storage', () => {
    sessionStorage.setItem('games:launch:uno:bot-count', '900');
    const launch = quickPlayIntents('uno');
    expect(launch.resumeBotCount()).toBeNull();
    vi.stubGlobal('sessionStorage', undefined);
    const id = launch.begin('play', 3);
    expect(launch.begin('play', 3)).toBe(id);
    expect(launch.begin('play', 4)).not.toBe(id);
    launch.forget('play', 3, id);
    expect(launch.begin('play', 3)).not.toBe(id);
  });

  it('sends bot_count only when the caller requests a count', async () => {
    const fixture = fixtures.find((item) => item.room.game_id === 'uno')!;
    const bodies: unknown[] = [];
    vi.stubGlobal(
      'Request',
      class extends Request {
        constructor(input: RequestInfo | URL, init?: RequestInit) {
          super(typeof input === 'string' ? new URL(input, 'https://games.test') : input, init);
        }
      },
    );
    vi.stubGlobal('fetch', async (request: Request) => {
      bodies.push(await request.json());
      return Response.json(fixture.room);
    });
    const api = createApi();
    const requestId = crypto.randomUUID();
    await api.quickPlay('uno', requestId, 4);
    await api.quickPlay('uno', requestId);
    expect(bodies).toEqual([{ request_id: requestId, bot_count: 4 }, { request_id: requestId }]);
  });
});
