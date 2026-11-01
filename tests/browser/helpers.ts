import { expect, type Page } from '@playwright/test';
import type { components } from '../../packages/api-client/src/generated/schema';

// FastAPI emits response defaults, although OpenAPI marks defaulted fields optional.
export type RoomView = Omit<components['schemas']['RoomView'], 'game'> & {
  game: Required<components['schemas']['GameView']> | null;
};

// Read only the session belonging to this isolated test context. Never log it.
export async function requestAs(page: Page, path: string, method = 'GET', data?: unknown) {
  const parts = (await page.context().cookies())
    .filter((cookie) => /^sb-.+-auth-token(?:\.\d+)?$/.test(cookie.name))
    .sort((a, b) => a.name.localeCompare(b.name));
  const encoded = parts.map((part) => part.value).join('');
  const session = encoded
    ? JSON.parse(
        encoded.startsWith('base64-')
          ? Buffer.from(encoded.slice(7), 'base64url').toString()
          : encoded,
      )
    : null;
  return page.request.fetch(`/api/backend/v1/${path}`, {
    method,
    data,
    headers: {
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...(process.env.VERCEL_OIDC_TOKEN && process.env.GAMES_TEST_URL
        ? {
            'x-vercel-trusted-oidc-idp-token': process.env.VERCEL_OIDC_TOKEN,
          }
        : {}),
    },
  });
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
