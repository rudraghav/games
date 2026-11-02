import { expect, type Locator, type Page } from '@playwright/test';
import type { components } from '../../packages/api-client/src/generated/schema';

// FastAPI emits response defaults, although OpenAPI marks defaulted fields optional.
export type RoomView = Omit<components['schemas']['RoomView'], 'game'> & {
  game: Required<components['schemas']['GameView']> | null;
};

const TRANSIENT_REASONS = [
  'ECONNRESET',
  'ERR_NETWORK_CHANGED',
  'ETIMEDOUT',
  'ERR_CONNECTION_RESET',
  'ERR_CONNECTION_CLOSED',
  'ERR_INTERNET_DISCONNECTED',
  'ENETUNREACH',
  'ECONNREFUSED',
  'EAI_AGAIN',
] as const;
type TransportReason = (typeof TRANSIENT_REASONS)[number] | 'OTHER' | 'COOKIE_SESSION';
const transportCounts = { retryAttempts: 0, recovered: 0, failed: 0 };
export function transportTelemetry() {
  return { ...transportCounts };
}

export class TestTransportError extends Error {
  constructor(
    method: string,
    path: string,
    readonly reason: TransportReason = 'OTHER',
  ) {
    const operation =
      path.startsWith('rooms/') && path.split('/').length === 2
        ? 'room snapshot'
        : path.split('/').at(-1);
    super(`Games test transport failed: ${method} ${operation} (${reason})`);
    this.name = 'TestTransportError';
  }
}

// Read only the session belonging to this isolated test context. Never log it.
export async function requestAs(page: Page, path: string, method = 'GET', data?: unknown) {
  let session;
  try {
    const parts = (await page.context().cookies())
      .filter((cookie) => /^sb-.+-auth-token(?:\.\d+)?$/.test(cookie.name))
      .sort((a, b) => a.name.localeCompare(b.name));
    const encoded = parts.map((part) => part.value).join('');
    session = encoded
      ? JSON.parse(
          encoded.startsWith('base64-')
            ? Buffer.from(encoded.slice(7), 'base64url').toString()
            : encoded,
        )
      : null;
  } catch {
    transportCounts.failed++;
    throw new TestTransportError(method, path, 'COOKIE_SESSION');
  }
  const safeToRepeat =
    method === 'GET' || (method === 'POST' && /^rooms\/[^/]+\/heartbeat$/.test(path));
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await page.request.fetch(`/api/backend/v1/${path}`, {
        method,
        data,
        headers: {
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
          ...(process.env.VERCEL_OIDC_TOKEN && process.env.GAMES_TEST_URL
            ? { 'x-vercel-trusted-oidc-idp-token': process.env.VERCEL_OIDC_TOKEN }
            : {}),
        },
      });
      if (attempt) transportCounts.recovered++;
      return response; // HTTP errors are returned untouched and never retried.
    } catch (error) {
      // Retain only an allowlisted code. Playwright's full exception includes
      // authenticated headers/cookies and must never become a cause or output.
      const message = error instanceof Error ? error.message : '';
      const reason = TRANSIENT_REASONS.find((code) => message.includes(code)) || 'OTHER';
      if (safeToRepeat && attempt === 0 && reason !== 'OTHER') {
        transportCounts.retryAttempts++;
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }
      transportCounts.failed++;
      throw new TestTransportError(method, path, reason);
    }
  }
  throw new TestTransportError(method, path);
}

export async function roomAs(page: Page, id: string): Promise<RoomView> {
  const response = await requestAs(page, `rooms/${id}`);
  expect(response.status()).toBe(200);
  return response.json();
}

export async function attachPreviewAccess(page: Page) {
  if (process.env.VERCEL_OIDC_TOKEN && process.env.GAMES_TEST_URL) {
    await page.context().route(`${new URL(process.env.GAMES_TEST_URL).origin}/**`, (route) =>
      route.continue({
        headers: {
          ...route.request().headers(),
          'x-vercel-trusted-oidc-idp-token': process.env.VERCEL_OIDC_TOKEN!,
        },
      }),
    );
  }
}

/** Room setup progressively discloses optional names and game rules. */
export async function openRoomOptions(page: Page | Locator) {
  const options = page.locator('.room-extra-options');
  if (await options.count()) {
    if ((await options.getAttribute('open')) === null)
      await options.locator(':scope > summary').click();
  }
}
