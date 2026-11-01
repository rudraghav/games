import { expect, test, type Page } from '@playwright/test';
import { requestAs, TestTransportError } from './helpers';

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
