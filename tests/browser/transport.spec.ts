import { expect, test, type Page } from '@playwright/test';
import { requestAs, TestTransportError, transportTelemetry } from './helpers';

for (const source of ['fetch', 'cookie'] as const) {
  test(`${source} failures conceal authenticated request details`, async () => {
    const privateMarker = 'private-test-session-value';
    const roomId = '11111111-1111-4111-8111-111111111111';
    const page = {
      context: () => ({
        cookies: async () =>
          source === 'cookie' ? [{ name: 'sb-task-auth-token', value: privateMarker }] : [],
      }),
      request: {
        fetch: async () => {
          throw new Error(`Cookie: games-player=${privateMarker}`);
        },
      },
    } as unknown as Page;
    let failure: Error | undefined;
    try {
      await requestAs(page, `rooms/${roomId}`);
    } catch (error) {
      failure = error as Error;
    }
    expect(failure).toBeInstanceOf(TestTransportError);
    const rendered = `${failure?.message}\n${failure?.stack}`;
    expect(rendered).not.toContain(privateMarker);
    expect(rendered).not.toContain(roomId);
    expect(failure?.cause).toBeUndefined();
  });
}

for (const operation of [
  { method: 'GET', path: 'rooms/11111111-1111-4111-8111-111111111111' },
  { method: 'POST', path: 'rooms/11111111-1111-4111-8111-111111111111/heartbeat' },
]) {
  test(`a transient ${operation.method} ${operation.path.endsWith('heartbeat') ? 'heartbeat' : 'snapshot'} gets one bounded recovery`, async () => {
    let calls = 0;
    const page = {
      context: () => ({ cookies: async () => [] }),
      request: {
        fetch: async () => {
          if (++calls === 1) throw new Error('read ECONNRESET Cookie: private-test-session-value');
          return { status: () => 200 };
        },
      },
    } as unknown as Page;
    expect((await requestAs(page, operation.path, operation.method)).status()).toBe(200);
    expect(calls).toBe(2);
  });
}

test('persistent transient reads stop after one retry and reveal only their safe reason', async () => {
  let calls = 0;
  const page = {
    context: () => ({ cookies: async () => [] }),
    request: {
      fetch: async () => {
        calls++;
        throw new Error('read ECONNRESET Cookie: private-test-session-value');
      },
    },
  } as unknown as Page;
  let failure: TestTransportError | undefined;
  try {
    await requestAs(page, 'rooms/11111111-1111-4111-8111-111111111111');
  } catch (error) {
    failure = error as TestTransportError;
  }
  expect(calls).toBe(2);
  expect(failure?.reason).toBe('ECONNRESET');
  expect(`${failure?.message}\n${failure?.stack}`).not.toContain('private-test-session-value');
});

for (const operation of ['rooms', 'rooms/example/actions', 'rooms/example/start', 'rooms/join']) {
  test(`transport failure never repeats ${operation.split('/').at(-1)} mutations`, async () => {
    let calls = 0;
    const page = {
      context: () => ({ cookies: async () => [] }),
      request: {
        fetch: async () => {
          calls++;
          throw new Error('read ECONNRESET Cookie: private-test-session-value');
        },
      },
    } as unknown as Page;
    await expect(requestAs(page, operation, 'POST')).rejects.toBeInstanceOf(TestTransportError);
    expect(calls).toBe(1);
  });
}

test('HTTP errors are never retried', async () => {
  const before = transportTelemetry();
  let calls = 0;
  const page = {
    context: () => ({ cookies: async () => [] }),
    request: {
      fetch: async () => {
        calls++;
        return { status: () => 503 };
      },
    },
  } as unknown as Page;
  expect((await requestAs(page, 'rooms/11111111-1111-4111-8111-111111111111')).status()).toBe(503);
  expect(calls).toBe(1);
  const after = transportTelemetry();
  expect(after.httpFailures - before.httpFailures).toBe(1);
  expect(after.retryAttempts - before.retryAttempts).toBe(0);
  expect(JSON.stringify(after.httpOperations)).not.toContain('11111111');
});
