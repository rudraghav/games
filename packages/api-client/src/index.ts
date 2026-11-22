import createClient from 'openapi-fetch';
import { z } from 'zod';
import type { paths } from './generated/schema';
import {
  mapMe,
  mapRoom,
  mapGame,
  mapProfile,
  mapPlayerSearch,
  mapRoomLookup,
  mapReading,
  mapSavedReading,
  type Action,
  type BotLevel,
  type BotSeat,
  type ReadingStyle,
} from './mappers';
import type { AstrologyInput } from './astrology';
import { mapSantaLinks, mapSantaReveal } from './secret-santa-details';
import { mapProgress } from './progress';
export type {
  Room,
  Match,
  Card,
  Player,
  Action,
  ActionOption,
  Me,
  Profile,
  Invitation,
  BotLevel,
  BotSeat,
  PlayerHit,
  RoomLookup,
  ReadingView,
  ReadingStyle,
  SavedReading,
} from './mappers';
export { botLevels } from './mappers';
export {
  mapProgress,
  frameIds,
  cardBackIds,
  type Progress,
  type Badge,
  type Reward,
  type RewardKind,
  type RewardState,
  type FrameId,
  type CardBackId,
} from './progress';
export { boardDetails, wordsDetails, gemsDetails } from './game-details';
export { trioDetails, flipSevenDetails, azulDetails } from './modern-details';
export { partyDetails } from './party-details';
export {
  rouletteDetails,
  slotsDetails,
  type RouletteSpin,
  type SlotSpin,
  type SlotSymbol,
} from './chance-details';
export { gangDetails, sixNimmtDetails } from './coop-number-details';
export { paperDetails, boopDetails } from './sea-cats-details';
export {
  blackjackDetails,
  holdemDetails,
  skyjoDetails,
  rummyDetails,
  teenPattiDetails,
} from './casino-details';
export { sheddingDetails } from './shedding-details';
export { shitheadDetails } from './shithead-details';
export { dealDetails, type DealGroup, type DealDetails } from './deal-details';
export {
  santaDetails,
  santaTokenPattern,
  type SantaDetails,
  type SantaPerson,
  type SantaGroup,
  type SantaLink,
  type SantaReveal,
} from './secret-santa-details';
export type {
  AstrologyInput,
  AstrologyPlace,
  AstrologyPlaces,
  AstrologyChart,
  AstrologyPreview,
  AstrologySystemChart,
  AstrologyPoint,
  AstrologyReading,
  AstrologyIssue,
} from './astrology';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
/**
 * A rejected field carries the server's own sentence after "Value error, ".
 * Schema-level complaints ("String should have at least…") stay generic.
 */
function validationMessage(error: unknown) {
  const parsed = z
    .object({ detail: z.array(z.object({ msg: z.string() })).min(1) })
    .safeParse(error);
  if (!parsed.success) return null;
  const prefix = 'Value error, ';
  const message = parsed.data.detail.find((item) => item.msg.startsWith(prefix))?.msg;
  return message ? message.slice(prefix.length).slice(0, 200) : null;
}
function unwrap<T>({
  data,
  error,
  response,
}: {
  data?: T;
  error?: unknown;
  response: Response;
}): T {
  if (!response.ok || data === undefined) {
    const detail = z.object({ detail: z.string() }).safeParse(error);
    const invalid = response.status === 422 ? validationMessage(error) : null;
    const message =
      response.status < 500 && detail.success
        ? detail.data.detail
        : invalid
          ? invalid
          : response.status === 401
            ? 'Please reconnect your player session.'
            : 'We could not reach the table. Please try again.';
    throw new ApiError(response.status, message);
  }
  return data;
}

export function createApi(accessToken?: () => Promise<string | null>) {
  const client = createClient<paths>({ baseUrl: '/api/backend', credentials: 'same-origin' });
  client.use({
    async onRequest({ request }) {
      const token = await accessToken?.();
      if (token) request.headers.set('Authorization', `Bearer ${token}`);
      return request;
    },
  });
  const params = (id: string) => ({ path: { room_id: id } });
  // A streak follows the player's own midnight: minutes east of UTC, as the server asks.
  const day = () => ({ tz_offset: -new Date().getTimezoneOffset() });
  return {
    async me() {
      return mapMe(unwrap(await client.GET('/v1/me')));
    },
    async profile(name: string, avatar: number) {
      return mapProfile(unwrap(await client.PUT('/v1/profile', { body: { name, avatar } })));
    },
    /** The handle friends can find this player by. Stored lowercase, without the @. */
    async setUsername(username: string) {
      return mapProfile(unwrap(await client.PUT('/v1/profile/username', { body: { username } })));
    },
    async clearUsername() {
      return mapProfile(unwrap(await client.DELETE('/v1/profile/username')));
    },
    /** The player's own level, streak, badges and rewards, computed by the server. */
    async progress() {
      return mapProgress(unwrap(await client.GET('/v1/progress', { params: { query: day() } })));
    },
    /** Redeem an earned reward. Refused with the server's words while it is locked. */
    async redeemReward(rewardId: string) {
      return mapProgress(
        unwrap(
          await client.POST('/v1/rewards/{reward_id}/redeem', {
            params: { path: { reward_id: rewardId }, query: day() },
          }),
        ),
      );
    },
    /** Wear a redeemed frame and card back. Both are always sent; null takes one off. */
    async wearCosmetics(worn: { frame: string | null; cardBack: string | null }) {
      return mapProgress(
        unwrap(
          await client.PUT('/v1/profile/cosmetics', {
            params: { query: day() },
            body: { frame: worn.frame, card_back: worn.cardBack },
          }),
        ),
      );
    },
    /** Prefix search over usernames; at least two characters, at most eight players. */
    async searchPlayers(query: string) {
      return mapPlayerSearch(
        unwrap(await client.GET('/v1/players/search', { params: { query: { q: query } } })),
      );
    },
    async acceptInvitation(roomId: string) {
      return mapRoom(
        unwrap(await client.POST('/v1/invitations/{room_id}/accept', { params: params(roomId) })),
      );
    },
    async declineInvitation(roomId: string) {
      return mapMe(
        unwrap(await client.DELETE('/v1/invitations/{room_id}', { params: params(roomId) })),
      );
    },
    async quickPlay(gameId: string, requestId: string) {
      return mapRoom(
        unwrap(
          await client.POST('/v1/games/{game_id}/play', {
            params: { path: { game_id: gameId } },
            body: { request_id: requestId },
          }),
        ),
      );
    },
    async create(input: {
      name: string;
      avatar: number;
      gameId: string;
      roomName: string;
      capacity: number;
      settings: Record<string, boolean>;
      bots?: number;
      /** One entry per bot. When present it replaces the plain `bots` count. */
      botSeats?: readonly BotSeat[];
    }) {
      return mapRoom(
        unwrap(
          await client.POST('/v1/rooms', {
            body: {
              name: input.name,
              avatar: input.avatar,
              game_id: input.gameId,
              room_name: input.roomName,
              capacity: input.capacity,
              settings: input.settings,
              bots: input.botSeats?.length ?? input.bots ?? 0,
              ...(input.botSeats?.length
                ? { bot_seats: input.botSeats.map(({ name, level }) => ({ name, level })) }
                : {}),
            },
          }),
        ),
      );
    },
    async join(invite: string, name: string, avatar: number) {
      return mapRoom(
        unwrap(await client.POST('/v1/rooms/join', { body: { invite, name, avatar } })),
      );
    },
    /** Answers only for a player already in that room; everyone else gets a 404. */
    async lookup(invite: string) {
      return mapRoomLookup(
        unwrap(await client.GET('/v1/rooms/lookup/{invite}', { params: { path: { invite } } })),
      );
    },
    async room(id: string) {
      return mapRoom(unwrap(await client.GET('/v1/rooms/{room_id}', { params: params(id) })));
    },
    async heartbeat(id: string) {
      return mapRoom(
        unwrap(await client.POST('/v1/rooms/{room_id}/heartbeat', { params: params(id) })),
      );
    },
    async reading(id: string) {
      return mapReading(
        unwrap(await client.GET('/v1/rooms/{room_id}/reading', { params: params(id) })),
      );
    },
    /** The organiser's private links, one per person. Refused until names are drawn. */
    async santaLinks(id: string) {
      return mapSantaLinks(
        unwrap(await client.GET('/v1/rooms/{room_id}/secret-santa/links', { params: params(id) })),
      );
    },
    /** One person's own draw. The token travels only in this request's path. */
    async santaReveal(token: string) {
      return mapSantaReveal(
        unwrap(await client.GET('/v1/secret-santa/{token}', { params: { path: { token } } })),
      );
    },
    async savedChanceSession(matchId: string) {
      return mapGame(
        unwrap(
          await client.GET('/v1/chance-sessions/{match_id}', {
            params: { path: { match_id: matchId } },
          }),
        ),
      );
    },
    async savedReading(matchId: string, style?: ReadingStyle) {
      return mapSavedReading(
        unwrap(
          await client.GET('/v1/readings/{match_id}', {
            params: { path: { match_id: matchId }, query: { style } },
          }),
        ),
      );
    },
    async generateReading(
      id: string,
      matchId: string,
      question: string,
      astrology?: AstrologyInput,
      reuseSavedAstrology?: boolean,
      readingStyle?: ReadingStyle,
    ) {
      return mapReading(
        unwrap(
          await client.POST('/v1/rooms/{room_id}/reading', {
            params: params(id),
            body: {
              match_id: matchId,
              question,
              ...(readingStyle ? { reading_style: readingStyle } : {}),
              ...(astrology ? { astrology } : {}),
              ...(reuseSavedAstrology ? { reuse_saved_astrology: true } : {}),
            },
          }),
        ),
      );
    },
    async astrologyPlaces(id: string, matchId: string, query: string) {
      return unwrap(
        await client.POST('/v1/rooms/{room_id}/astrology/places', {
          params: params(id),
          body: { match_id: matchId, query },
        }),
      );
    },
    async astrologyChart(id: string, matchId: string, astrology: AstrologyInput) {
      return unwrap(
        await client.POST('/v1/rooms/{room_id}/astrology/chart', {
          params: params(id),
          body: { match_id: matchId, astrology },
        }),
      );
    },
    async ready(id: string, ready: boolean) {
      return mapRoom(
        unwrap(
          await client.PUT('/v1/rooms/{room_id}/ready', { params: params(id), body: { ready } }),
        ),
      );
    },
    async configure(
      id: string,
      gameId: string,
      capacity: number,
      settings: Record<string, boolean>,
    ) {
      return mapRoom(
        unwrap(
          await client.PUT('/v1/rooms/{room_id}/settings', {
            params: params(id),
            body: { game_id: gameId, capacity, settings },
          }),
        ),
      );
    },
    async start(id: string) {
      return mapRoom(
        unwrap(await client.POST('/v1/rooms/{room_id}/start', { params: params(id) })),
      );
    },
    async move(
      id: string,
      matchId: string,
      expectedVersion: number,
      action: Action,
      actionId = crypto.randomUUID(),
    ) {
      return mapRoom(
        unwrap(
          await client.POST('/v1/rooms/{room_id}/actions', {
            params: params(id),
            body: {
              match_id: matchId,
              action_id: actionId,
              expected_version: expectedVersion,
              action,
            },
          }),
        ),
      );
    },
    async chat(id: string, body: string, kind: 'message' | 'reaction' = 'message') {
      return mapRoom(
        unwrap(
          await client.POST('/v1/rooms/{room_id}/chat', {
            params: params(id),
            body: { body, kind },
          }),
        ),
      );
    },
    async claim(id: string) {
      return mapRoom(
        unwrap(await client.POST('/v1/rooms/{room_id}/claim-host', { params: params(id) })),
      );
    },
    async rotateInvite(id: string) {
      return mapRoom(
        unwrap(await client.POST('/v1/rooms/{room_id}/invite', { params: params(id) })),
      );
    },
    async abandon(id: string) {
      return mapRoom(
        unwrap(await client.POST('/v1/rooms/{room_id}/abandon', { params: params(id) })),
      );
    },
    async leave(id: string) {
      return mapRoom(
        unwrap(await client.POST('/v1/rooms/{room_id}/leave', { params: params(id) })),
      );
    },
    async kick(id: string, userId: string) {
      return mapRoom(
        unwrap(
          await client.DELETE('/v1/rooms/{room_id}/members/{user_id}', {
            params: { path: { room_id: id, user_id: userId } },
          }),
        ),
      );
    },
    async addBots(id: string, count = 1, level?: BotLevel, name?: string) {
      return mapRoom(
        unwrap(
          await client.POST('/v1/rooms/{room_id}/bots', {
            params: params(id),
            // The server defaults a missing level to hard and names the bot itself.
            body: {
              count,
              ...(level ? { level } : {}),
              ...(name && count === 1 ? { name } : {}),
            } as { count: number; level: BotLevel; name?: string },
          }),
        ),
      );
    },
    async updateBot(id: string, botId: string, change: { name?: string; level?: BotLevel }) {
      return mapRoom(
        unwrap(
          await client.PATCH('/v1/rooms/{room_id}/bots/{bot_id}', {
            params: { path: { room_id: id, bot_id: botId } },
            body: change,
          }),
        ),
      );
    },
    async invite(id: string, username: string) {
      return mapRoom(
        unwrap(
          await client.POST('/v1/rooms/{room_id}/invites', {
            params: params(id),
            body: { username },
          }),
        ),
      );
    },
    async cancelInvite(id: string, username: string) {
      return mapRoom(
        unwrap(
          await client.DELETE('/v1/rooms/{room_id}/invites/{username}', {
            params: { path: { room_id: id, username } },
          }),
        ),
      );
    },
    async driveBots(id: string, matchId: string, expectedVersion: number) {
      return mapRoom(
        unwrap(
          await client.POST('/v1/rooms/{room_id}/bots/drive', {
            params: params(id),
            body: { match_id: matchId, expected_version: expectedVersion },
          }),
        ),
      );
    },
  };
}

export async function startDevelopmentSession() {
  const response = await fetch('/api/dev-session', { method: 'POST', credentials: 'same-origin' });
  if (!response.ok)
    throw new ApiError(response.status, 'Player sessions are not configured on this server.');
}
