import { describe, it, expect } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import type { Me } from '@games/api-client';
import { forgetRoomMembership, refreshPlayer } from '@/shared/player-query';
import { keys } from '@/shared/query-keys';

const empty: Me = { profile: null, anonymous: true, rooms: [], history: [] };
const joined: Me = {
  ...empty,
  profile: { id: 'qa-player', name: 'A new friend', avatar: 0 },
};

describe('Authoritative player refresh after room entry', () => {
  it('ignores an initial null profile that arrives after the joined identity', async () => {
    const cache = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: 30000 } },
    });
    let releaseOld!: (value: Me) => void;
    const oldRead = new Promise<Me>((resolve) => {
      releaseOld = resolve;
    });
    const initial = cache
      .fetchQuery({ queryKey: keys.me, queryFn: () => oldRead })
      .catch(() => null);
    const result = await refreshPlayer(cache, async () => joined);
    expect(result.profile?.id).toBe('qa-player');
    releaseOld(empty);
    await initial;
    await Promise.resolve();
    expect(cache.getQueryData<Me>(keys.me)?.profile?.id).toBe('qa-player');
    cache.clear();
  });

  it('requires a new authoritative read even when a cached null profile is fresh', async () => {
    const cache = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: 30000 } },
    });
    cache.setQueryData(keys.me, empty);
    let reads = 0;
    await refreshPlayer(cache, async () => {
      reads++;
      return joined;
    });
    expect(reads).toBe(1);
    expect(cache.getQueryData<Me>(keys.me)?.profile?.name).toBe('A new friend');
    cache.clear();
  });
});

describe('Confirmed room departure', () => {
  it('removes only the departed membership and rejects an older in-flight room list', async () => {
    const cache = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const member: Me = {
      ...joined,
      rooms: ['departed', 'still-member'].map((id) => ({
        id,
        name: id,
        gameId: 'tarot',
        status: 'playing',
        players: 1,
        capacity: 1,
      })),
    };
    cache.setQueryData(keys.me, member);
    let releaseOld!: (value: Me) => void;
    const oldRead = cache
      .fetchQuery({
        queryKey: keys.me,
        queryFn: () =>
          new Promise<Me>((resolve) => {
            releaseOld = resolve;
          }),
        staleTime: 0,
      })
      .catch(() => null);
    await forgetRoomMembership(cache, 'departed');
    releaseOld(member);
    await oldRead;
    await Promise.resolve();
    const current = cache.getQueryData<Me>(keys.me)!;
    expect(current.rooms.map((room) => room.id)).toEqual(['still-member']);
    expect(current.profile).toEqual(member.profile);
    expect(current.history).toEqual(member.history);
    expect(current.anonymous).toBe(member.anonymous);
    expect(cache.getQueryState(keys.me)?.isInvalidated).toBe(true);
    cache.clear();
  });
});
