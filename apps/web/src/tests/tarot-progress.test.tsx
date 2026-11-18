import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ReadingView } from '@games/api-client';
import { ReadingProgress, remainingEstimate } from '@/games/tarot/ReadingProgress';

const progress: NonNullable<ReadingView['progress']> = {
  stage: 'writing',
  attempt: 1,
  maxAttempts: 3,
  startedAt: 1000,
  updatedAt: 1010,
  estimatedPercent: 42,
  estimatedSecondsRemaining: 37,
  provider: 'Gemini',
};

describe('Saved reading progress presentation', () => {
  it('does not invent a percentage before an authoritative snapshot exists', () => {
    const html = renderToStaticMarkup(<ReadingProgress />);
    expect(html).toContain('Starting your reading.');
    expect(html).toContain('role="progressbar"');
    expect(html).not.toContain('aria-valuenow');
    expect(html).not.toContain('% estimated');
    expect(html).not.toContain('remaining');
  });

  it('labels real server progress as estimated and announces only concise stage changes', () => {
    const html = renderToStaticMarkup(<ReadingProgress progress={progress} />);
    expect(html).toContain('aria-label="Estimated reading progress"');
    expect(html).toContain('aria-valuenow="42"');
    expect(html).toContain('42% estimated');
    expect(html).toContain('About 40 sec remaining');
    expect(html).toContain('role="status" aria-live="polite" aria-atomic="true"');
    expect(html).toContain('Writing your reading.');
  });

  it('identifies an actual provider retry without claiming a new set of cards', () => {
    const html = renderToStaticMarkup(
      <ReadingProgress
        progress={{ ...progress, stage: 'retrying', attempt: 2, provider: 'Groq' }}
      />,
    );
    expect(html).toContain('Retrying with Groq.');
    expect(html).toContain('aria-valuenow="42"');
    expect(html).not.toContain('Starting your reading.');
  });

  it('never presents a pending reading as complete or promises an expired estimate', () => {
    const html = renderToStaticMarkup(
      <ReadingProgress
        progress={{
          ...progress,
          stage: 'saving',
          estimatedPercent: 100,
          estimatedSecondsRemaining: null,
        }}
      />,
    );
    expect(html).toContain('aria-valuenow="99"');
    expect(html).toContain('Saving your reading.');
    expect(html).toContain('Taking longer than expected…');
    expect(html).not.toContain('100%');
    expect(html).not.toContain('Almost ready');
  });

  it('uses a saved-status check without replaying outdated timing on a lost connection', () => {
    const html = renderToStaticMarkup(<ReadingProgress progress={progress} recovering />);
    expect(html).toContain('Checking your saved reading.');
    expect(html).toContain('Your cards stay saved.');
    expect(html).not.toContain('aria-valuenow');
    expect(html).not.toContain('remaining');
  });

  it('keeps remaining-time estimates coarse rather than claiming exact seconds', () => {
    expect(remainingEstimate(1)).toBe('About 5 sec remaining');
    expect(remainingEstimate(59)).toBe('About 1 min remaining');
    expect(remainingEstimate(61)).toBe('About 2 min remaining');
    expect(remainingEstimate(null)).toBe('Taking longer than expected…');
  });
});
