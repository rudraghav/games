import { expect, it } from 'vitest';
import { mapReading, mapSavedReading } from '@games/api-client/mappers';
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

const generating: Parameters<typeof mapReading>[0] = {
  status: 'generating',
  question: 'A private saved question',
  message: 'Writing your reading…',
};
const wireProgress: NonNullable<Parameters<typeof mapReading>[0]['progress']> = {
  stage: 'retrying',
  provider: 'Groq',
  attempt: 2,
  max_attempts: 3,
  started_at: 1000,
  updated_at: 1020,
  estimated_percent: 48,
  estimated_seconds_remaining: 12,
};

it('keeps legacy readings usable when progress is omitted or null', () => {
  expect(mapReading(generating)).toEqual(generating);
  expect(mapReading({ ...generating, progress: null })).toEqual(generating);
});

it('maps authoritative progress while preserving the reading response', () => {
  expect(mapReading({ ...generating, progress: wireProgress })).toEqual({
    ...generating,
    progress: {
      stage: 'retrying',
      provider: 'Groq',
      attempt: 2,
      maxAttempts: 3,
      startedAt: 1000,
      updatedAt: 1020,
      estimatedPercent: 48,
      estimatedSecondsRemaining: 12,
    },
  });
});

it.each([
  { estimated_percent: 100 },
  { started_at: Number.NaN },
  { updated_at: Number.POSITIVE_INFINITY },
])('rejects unsafe progress values before presentation: %j', (invalid) => {
  expect(() => mapReading({ ...generating, progress: { ...wireProgress, ...invalid } })).toThrow();
});

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
