import { gameById } from '@games/api-client/catalog';

export type LaunchMode = 'play' | 'tutorial';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** One explicit choice owns one retry ID. The old key still names the default-size table. */
export function quickPlayIntents(gameId: string) {
  const game = gameById(gameId);
  const minimum = Math.max(1, game.minPlayers - 1);
  const base = `games:launch:${gameId}`;
  const countKey = `${base}:bot-count`;
  const requests = new Map<string, string>();

  function key(mode: LaunchMode, botCount?: number) {
    if (mode === 'tutorial') return `games:launch:tutorial:${gameId}`;
    return botCount === undefined || botCount === minimum ? base : `${base}:bots:${botCount}`;
  }

  function read(name: string) {
    try {
      return sessionStorage.getItem(name);
    } catch {
      return null;
    }
  }

  return {
    resumeBotCount() {
      const count = Number(read(countKey));
      if (!Number.isInteger(count) || count < minimum || count >= game.maxPlayers) return null;
      return uuid.test(read(key('play', count)) ?? '') ? count : null;
    },
    begin(mode: LaunchMode, botCount?: number) {
      const name = key(mode, botCount);
      const saved = requests.get(name) ?? read(name);
      const id = saved && uuid.test(saved) ? saved : crypto.randomUUID();
      requests.set(name, id);
      try {
        sessionStorage.setItem(name, id);
        if (mode === 'play' && botCount !== undefined)
          sessionStorage.setItem(countKey, String(botCount));
      } catch {
        // The same mounted page can still retry when storage is unavailable.
      }
      return id;
    },
    forget(mode: LaunchMode, botCount: number | undefined, id: string) {
      const name = key(mode, botCount);
      if (requests.get(name) === id) requests.delete(name);
      try {
        if (sessionStorage.getItem(name) !== id) return;
        sessionStorage.removeItem(name);
        if (mode === 'play' && botCount !== undefined && read(countKey) === String(botCount)) {
          sessionStorage.removeItem(countKey);
        }
      } catch {
        // Any leftover stored request remains safe to replay.
      }
    },
    /** After a table opens, no other bot count may reopen an older lost start. */
    settle(mode: LaunchMode) {
      if (mode !== 'play') return;
      for (const name of [...requests.keys()]) if (name.startsWith(base)) requests.delete(name);
      try {
        const names = Array.from({ length: sessionStorage.length }, (_, i) => sessionStorage.key(i));
        for (const name of names)
          if (name === base || name?.startsWith(`${base}:`)) sessionStorage.removeItem(name);
      } catch {
        // Storage is unavailable, so nothing older can be replayed from it.
      }
    },
  };
}
