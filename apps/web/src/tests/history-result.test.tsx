import { describe, expect, it } from 'vitest';
import { gameById } from '@games/api-client/catalog';
import { historyResult } from '@/features/profile/history-result';

describe('Saved match outcome labels', () => {
  it('keeps cooperative defeats distinct from competitive losses and draws', () => {
    expect(historyResult(gameById('the-gang'), 2, false)).toBe('Team defeat · 2 vaults');
    expect(historyResult(gameById('the-gang'), 3, true)).toBe('You won together · 3 vaults');
  });
  it('uses declared penalties and net chips rather than inventing points', () => {
    expect(historyResult(gameById('six-nimmt'), 32, false)).toBe('32 penalty points');
    expect(historyResult(gameById('holdem'), -50, false)).toBe('-50 net chips');
  });
  it('omits unscored values while preserving wins and saved Tarot copy', () => {
    expect(historyResult(gameById('boop'), 0, false)).toBe('Match finished');
    expect(historyResult(gameById('boop'), 0, true)).toBe('You won ✦');
    expect(historyResult(gameById('tarot'), 0, false)).toBe('A little perspective');
  });
});
