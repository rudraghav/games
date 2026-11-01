import { z } from 'zod';
import type { components } from './generated/schema';

type Wire = components['schemas'];
const roomGate = z.object({
  id: z.string().uuid(),
  status: z.enum(['lobby', 'playing', 'finished', 'closed']),
  revision: z.number().int(),
  members: z.array(z.object({ id: z.string().uuid() })),
});

export function mapCard(card: Wire['CardView']) {
  return {
    id: card.id,
    label: card.label,
    value: card.value,
    color: card.color,
    subtitle: card.subtitle,
    suit: card.suit,
  };
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
    paused: wire.paused,
    missingPlayers: wire.missing_players,
    inviteToken: wire.invite_token,
    members: wire.members.map((member) => ({
      id: member.id,
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
