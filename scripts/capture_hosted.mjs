import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const target = new URL(process.env.GAMES_TEST_URL || 'http://invalid.local');
if (target.protocol !== 'https:' || !(target.hostname === 'games-seven-black.vercel.app' || /^games-[a-z0-9]+-rudraghavs-projects\.vercel\.app$/.test(target.hostname))) throw new Error('Set the personal Games deployment URL.');
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  if (process.env.VERCEL_OIDC_TOKEN) await page.route(`${target.origin}/**`, (route) => route.continue({ headers: { ...route.request().headers(), 'x-vercel-trusted-oidc-idp-token': process.env.VERCEL_OIDC_TOKEN } }));
  const images = [];
  page.on('response', (response) => { if (/\/tarot\/major-\d+\.webp$/.test(response.url())) images.push(response.status()); });
  await page.goto(target.href);
  await page.getByRole('button', { name: 'Create Pop Tarot room', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Create Pop Tarot room', exact: true }).scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.fonts.status === 'loaded');
  await mkdir('docs/evidence/hosted', { recursive: true });
  await page.screenshot({ path: 'docs/evidence/hosted/lounge-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'docs/evidence/hosted/lounge-phone.png', fullPage: true });
  if (!images.length || images.some((status) => status !== 200)) throw new Error('Tarot artwork failed to load.');
  console.log({ screenshots: 2, tarotArtworkResponses: images, pageOverflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth) });
} finally { await browser.close(); }
