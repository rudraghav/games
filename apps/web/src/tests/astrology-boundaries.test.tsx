import { expect, it } from 'vitest';
import { isBackendRoute } from '@/lib/backend-routes';

it('proxies only the two authenticated astrology POST operations', () => {
  const room = 'v1/rooms/00000000-0000-4000-8000-000000000001/astrology';
  for (const operation of ['places', 'chart']) {
    expect(isBackendRoute(`${room}/${operation}`, 'POST')).toBe(true);
    for (const method of ['GET', 'PUT', 'DELETE'])
      expect(isBackendRoute(`${room}/${operation}`, method)).toBe(false);
  }
  for (const path of [
    room,
    `${room}/other`,
    `${room}/chart/extra`,
    'v1/astrology/chart',
    'v1/rooms/not-a-room/astrology/places',
  ])
    expect(isBackendRoute(path, 'POST')).toBe(false);
});
