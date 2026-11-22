import type { Game } from '@games/api-client/catalog';
import type { BotSeat } from '@games/api-client';
import { botSeatsRequest, type BotRow } from './bot-seats';

export interface RoomSetupChoice {
  game: Pick<Game, 'id' | 'family' | 'botsSupported' | 'maxPlayers' | 'playMode'>;
  playWith: 'friends' | 'bots';
  capacity: number;
  /** The stepper's value in Friends mode; Bots mode fills every other seat. */
  friendBots: number;
  /** A game page's "Play with friends" has no Bots mode; bots are added by the stepper. */
  friendsOnly?: boolean;
}

/** How many bots the chosen setup seats beside the host. */
export function setupBotCount({
  game,
  playWith,
  capacity,
  friendBots,
  friendsOnly,
}: RoomSetupChoice) {
  if (!game.botsSupported || game.maxPlayers < 2) return 0;
  const open = Math.max(0, capacity - 1);
  return playWith === 'bots' && !friendsOnly ? open : Math.max(0, Math.min(friendBots, open));
}

/** A room starts on its own only when nobody else is expected: solo, or all bots. */
export function startsImmediately(choice: RoomSetupChoice) {
  const bots = setupBotCount(choice);
  return choice.game.playMode === 'solo' || (bots > 0 && bots === choice.capacity - 1);
}

/** The create-room request for the dialog's current choices. */
export function createRoomInput(
  choice: RoomSetupChoice & {
    name: string;
    avatar: number;
    roomName: string;
    settings: Record<string, boolean>;
    botRows: readonly BotRow[];
  },
) {
  const name = choice.name.trim();
  const count = setupBotCount(choice);
  const botSeats: BotSeat[] = botSeatsRequest(choice.botRows.slice(0, count), name);
  return {
    name,
    avatar: choice.avatar,
    gameId: choice.game.id,
    roomName:
      choice.roomName.trim() ||
      `${name}'s ${choice.game.family === 'tarot' ? 'reading' : 'game night'}`,
    capacity: choice.capacity,
    settings: choice.settings,
    bots: count,
    ...(count ? { botSeats } : {}),
  };
}
