import { expect, it } from 'vitest';
import { mapSavedReading } from '@games/api-client/mappers';
import { isBackendRoute } from '@/lib/backend-routes';
import { proxyFailure } from '@/lib/proxy-diagnostics';

const id = '00000000-0000-4000-8000-000000000001';
const saved = {
  match_id: id,
  room_id: id,
  created_at: 1,
  status: 'incomplete' as const,
  question: 'A private saved question',
  cards: [],
  reading: null,
  can_resume: false,
};

it('maps an incomplete saved spread without inventing a reading or enabling room access', () => {
  expect(mapSavedReading(saved)).toEqual({
    matchId: id,
    roomId: id,
    createdAt: 1,
    status: 'incomplete',
    question: saved.question,
    cards: [],
    reading: null,
    canResume: false,
  });
  expect(() => mapSavedReading({ ...saved, status: 'complete' })).toThrow('incomplete');
  expect(() => mapSavedReading({ ...saved, match_id: 'not-a-match' })).toThrow();
});

it('allows only the exact read-only archive route and redacts its identity from diagnostics', () => {
  const route = `v1/readings/${id}`;
  expect(isBackendRoute(route, 'GET')).toBe(true);
  for (const method of ['POST', 'PUT', 'DELETE']) expect(isBackendRoute(route, method)).toBe(false);
  for (const path of [
    'v1/readings',
    'v1/readings/not-a-match',
    `${route}/reading`,
    `${route}/extra`,
  ])
    expect(isBackendRoute(path, 'GET')).toBe(false);
  const diagnostic = proxyFailure(route, 'GET', 0, 404);
  expect(diagnostic.route).toBe('v1/readings/:match');
  expect(JSON.stringify(diagnostic)).not.toContain(id);
});
