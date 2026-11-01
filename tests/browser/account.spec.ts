import { expect, test } from '@playwright/test';
import { requestAs } from './helpers';

test('profile offers Google sign-in and a canceled callback preserves the player', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A familiar face.', exact: true })).toBeVisible();
  const account = page.getByRole('region', { name: 'Your Games account', exact: true });
  await expect(
    account.getByRole('button', { name: 'Continue with Google', exact: true }),
  ).toBeVisible();
  await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Account Test Player');
  await page.getByRole('button', { name: 'Save profile', exact: true }).click();
  await expect(
    page.getByText('Looking good. Your profile is saved.', { exact: true }),
  ).toBeVisible();
  const before = await (await requestAs(page, 'me')).json();
  const canceled = await page.request.get(
    '/auth/callback?error=access_denied&error_description=private-provider-message&next=https://unrelated.example',
    { maxRedirects: 0 },
  );
  expect(canceled.status()).toBe(307);
  expect(canceled.headers()['cache-control']).toBe('private, no-store');
  expect(canceled.headers()['referrer-policy']).toBe('no-referrer');
  const destination = new URL(canceled.headers().location, page.url());
  expect(destination.origin).toBe(new URL(page.url()).origin);
  expect(destination.pathname).toBe('/profile');
  expect(destination.searchParams.get('confirmation')).toBe('canceled');
  expect(destination.href).not.toContain('private-provider-message');
  await page.goto(destination.href);
  await expect(
    page.getByText('Sign-in was canceled. You can keep playing.', { exact: true }),
  ).toBeVisible();
  const after = await (await requestAs(page, 'me')).json();
  expect(after.profile.id).toBe(before.profile.id);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true);
});
