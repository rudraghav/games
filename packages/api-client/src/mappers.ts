import { z } from 'zod';
import type { components } from './generated/schema';
import { cardSchema } from './card-schema';

type Wire = components['schemas'];
type WireCard = Wire['CardView'];
type CompatibleCard = Omit<WireCard, 'colors' | 'effect'> &
  Partial<Pick<WireCard, 'colors' | 'effect'>>;
const memberId = z.union([z.string().uuid(), z.string().regex(/^bot:[a-f0-9]{32}$/)]);
const memberGate = z
  .object({ id: memberId, is_bot: z.boolean().default(false) })
  .refine(
    (member) => member.id.startsWith('bot:') === member.is_bot,
    'Bot identifiers must match their declared seat kind.',
  );
const roomGate = z.object({
  id: z.string().uuid(),
  status: z.enum(['lobby', 'playing', 'finished', 'closed']),
  revision: z.number().int(),
  owner_id: z.string().uuid(),
  members: z.array(memberGate),
});

export function mapCard(card: CompatibleCard) {
  return cardSchema.parse(card);
}

function mapGame(game: Wire['GameView']) {
  return {
    id: game.game_id,
    phase: game.phase,
    currentPlayer: game.current_player,
    hand: game.hand.map(mapCard),
    players: game.players.map((player) => ({
      id: player.id,
      count: player.count,
      score: player.score,
      chips: player.chips,
      bet: player.bet,
      folded: player.folded,
      eliminated: player.eliminated,
      removedSlots: player.removed_slots || [],
      cards: (player.cards || []).map((card) => (card ? mapCard(card) : null)),
      bank: (player.bank || []).map(mapCard),
      properties: Object.fromEntries(
        Object.entries(player.properties || {}).map(([key, cards]) => [key, cards.map(mapCard)]),
      ),
    })),
    community: (game.community || []).map(mapCard),
    discard: game.discard ? mapCard(game.discard) : null,
    drawn: game.drawn ? mapCard(game.drawn) : null,
    drawCount: game.draw_count,
    pot: game.pot,
    message: game.message,
    actions: (game.actions || []).map((option) => ({
      label: option.label,
      value: option.action,
      input: option.input,
      minimum: option.minimum,
      maximum: option.maximum,
      step: option.step,
      eligibleCards: option.eligible_cards || [],
    })),
    winners: game.winners || [],
    detail: game.detail || {},
  };
}

export function mapRoom(wire: Wire['RoomView']) {
  roomGate.parse(wire);
  return {
    id: wire.id,
    name: wire.name,
    code: wire.code,
    gameId: wire.game_id,
    ownerId: wire.owner_id,
    capacity: wire.capacity,
    settings: wire.settings,
    status: wire.status,
    revision: wire.revision,
    matchId: wire.match_id,
    matchVersion: wire.match_version,
    lastAction: wire.last_action
      ? {
          version: wire.last_action.version,
          actorId: wire.last_action.actor_id,
          type: wire.last_action.type,
          amount: wire.last_action.amount ?? null,
        }
      : null,
    activity: (wire.activity || []).map((event) => ({
      version: event.version,
      actorId: event.actor_id,
      type: event.type,
      label: event.label,
      targets: event.targets || [],
      amount: event.amount ?? null,
      cards: (event.cards || []).map(mapCard),
      destination: event.destination ?? null,
      count: event.count ?? null,
    })),
    paused: wire.paused,
    botPending: wire.bot_pending ?? false,
    botDueAt: wire.bot_due_at ?? null,
    missingPlayers: wire.missing_players,
    inviteToken: wire.invite_token,
    members: wire.members.map((member) => ({
      id: member.id,
      isBot: member.is_bot ?? false,
      name: member.name,
      avatar: member.avatar,
      ready: member.ready,
      seated: member.seated,
      connected: member.connected,
      lastSeen: member.last_seen,
    })),
    messages: wire.messages.map((message) => ({
      id: message.id,
      userId: message.user_id,
      body: message.body,
      kind: message.kind,
      createdAt: message.created_at,
    })),
    game: wire.game ? mapGame(wire.game) : null,
  };
}

export function mapMe(wire: Wire['MeView']) {
  return {
    profile: wire.profile,
    anonymous: wire.anonymous,
    rooms: wire.rooms.map((room) => ({
      id: room.id,
      name: room.name,
      gameId: room.game_id,
      status: room.status,
      players: room.players,
      capacity: room.capacity,
    })),
    history: wire.history.map((match) => ({
      id: match.id,
      roomId: match.room_id,
      gameId: match.game_id,
      winners: match.winners,
      score: match.score,
      createdAt: match.created_at,
    })),
  };
}

export type Room = ReturnType<typeof mapRoom>;
export type Match = NonNullable<Room['game']>;
export type Card = ReturnType<typeof mapCard>;
export type Player = Match['players'][number];
export type Action = Wire['Action'];
export type ActionOption = Match['actions'][number];
export type Me = ReturnType<typeof mapMe>;
export type ReadingView = Wire['ReadingView'];
