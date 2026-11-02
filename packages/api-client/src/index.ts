import createClient from 'openapi-fetch';
import { z } from 'zod';
import type { paths } from './generated/schema';
import { mapMe, mapRoom, type Action } from './mappers';
import type { AstrologyInput } from './astrology';
export type { Room, Match, Card, Player, Action, ActionOption, Me, ReadingView } from './mappers';
export { boardDetails, wordsDetails, gemsDetails } from './game-details';
export { trioDetails, flipSevenDetails, azulDetails } from './modern-details';
export { partyDetails } from './party-details';
export { gangDetails, sixNimmtDetails } from './coop-number-details';
export { paperDetails, boopDetails } from './sea-cats-details';
export { blackjackDetails, holdemDetails, skyjoDetails } from './casino-details';
export { shitheadDetails } from './shithead-details';
export { dealDetails, type DealGroup, type DealDetails } from './deal-details';
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
    const message =
      response.status < 500 && detail.success
        ? detail.data.detail
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
  return {
    async me() {
      return mapMe(unwrap(await client.GET('/v1/me')));
    },
    async profile(name: string, avatar: number) {
      return unwrap(await client.PUT('/v1/profile', { body: { name, avatar } }));
    },
    async create(input: {
      name: string;
      avatar: number;
      gameId: string;
      roomName: string;
      capacity: number;
      settings: Record<string, boolean>;
      bots?: number;
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
              bots: input.bots ?? 0,
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
    async room(id: string) {
      return mapRoom(unwrap(await client.GET('/v1/rooms/{room_id}', { params: params(id) })));
    },
    async heartbeat(id: string) {
      return mapRoom(
        unwrap(await client.POST('/v1/rooms/{room_id}/heartbeat', { params: params(id) })),
      );
    },
    async reading(id: string) {
      return unwrap(await client.GET('/v1/rooms/{room_id}/reading', { params: params(id) }));
    },
    async generateReading(
      id: string,
      matchId: string,
      question: string,
      astrology?: AstrologyInput,
      reuseSavedAstrology?: boolean,
    ) {
      return unwrap(
        await client.POST('/v1/rooms/{room_id}/reading', {
          params: params(id),
          body: {
            match_id: matchId,
            question,
            ...(astrology ? { astrology } : {}),
            ...(reuseSavedAstrology ? { reuse_saved_astrology: true } : {}),
          },
        }),
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
    async addBots(id: string, count = 1) {
      return mapRoom(
        unwrap(
          await client.POST('/v1/rooms/{room_id}/bots', { params: params(id), body: { count } }),
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
