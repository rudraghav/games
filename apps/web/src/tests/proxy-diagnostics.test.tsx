import { expect, it } from 'vitest';
import { proxyFailure } from '@/lib/proxy-diagnostics';
it('classifies HTTP, timeout and connection failures without sensitive exception text', () => {
  const path = 'v1/rooms/private-room/members/private-player';
  const http = proxyFailure(path, 'GET', performance.now(), 503);
  expect(http).toMatchObject({
    route: 'v1/rooms/:room/members/:member',
    reason: 'upstream_http',
    status: 503,
  });
  expect(proxyFailure('v1/rooms/join', 'POST', 0, 503).route).toBe('v1/rooms/join');
  const timeout = new Error('secret-token');
  timeout.name = 'TimeoutError';
  expect(proxyFailure(path, 'POST', 0, 503, timeout).reason).toBe('proxy_timeout');
  const connection = new Error('secret-token', { cause: { code: 'ECONNREFUSED' } });
  expect(proxyFailure(path, 'POST', 0, 503, connection).reason).toBe('ECONNREFUSED');
  connection.name = 'secret-token';
  const safe = JSON.stringify(proxyFailure(path, 'POST', 0, 503, connection));
  expect(safe).not.toContain('secret-token');
  expect(safe).not.toContain('private-room');
  expect(safe).not.toContain('private-player');
});
