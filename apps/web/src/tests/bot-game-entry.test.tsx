import { Children, type MouseEvent } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { gameById } from '@games/api-client/catalog';
import * as ui from '@games/ui';
import { GameEntry } from '@/features/game-entry/GameEntry';
import * as quickPlay from '@/features/game-entry/useQuickPlay';

vi.mock('@/shared/SiteHeader', () => ({ SiteHeader: () => null }));
afterEach(() => vi.restoreAllMocks());

function entry(gameId: string) {
  const game = gameById(gameId);
  const start = vi.fn(async () => {});
  vi.spyOn(quickPlay, 'useQuickPlay').mockReturnValue({
    start,
    resumeBotCount: null,
    pending: null,
    failure: null,
    label: (mode) =>
      mode === 'tutorial'
        ? 'Play tutorial'
        : game.playMode === 'solo'
          ? 'Play solo'
          : 'Play with bots',
  });
  const buttons = vi.spyOn(ui, 'Button');
  renderToStaticMarkup(<GameEntry game={game} />);
  const button = (label: string) =>
    buttons.mock.calls
      .map(([props]) => props)
      .find((props) => Children.toArray(props.children).includes(label))!;
  const click = (label: string) => button(label).onClick!({} as MouseEvent<HTMLButtonElement>);
  return { button, click, start };
}

describe('Bot count on the game page', () => {
  it('opens setup for a variable-size table before starting a session', () => {
    const { button, click, start } = entry('uno');
    expect(button('Play with bots')['aria-haspopup']).toBe('dialog');
    click('Play with bots');
    expect(start).not.toHaveBeenCalled();
    click('Play tutorial');
    expect(start).toHaveBeenCalledExactlyOnceWith('tutorial');
  });

  it('starts a fixed-size table with the count advertised on the button', () => {
    const { button, click, start } = entry('reversi');
    expect(button('Play with 1 bot')['aria-haspopup']).toBeUndefined();
    click('Play with 1 bot');
    expect(start).toHaveBeenCalledExactlyOnceWith('play', 1);
  });

  it('starts solo games without adding bots', () => {
    const { click, start } = entry('roulette');
    click('Play solo');
    expect(start).toHaveBeenCalledExactlyOnceWith('play', undefined);
  });
});
