import { z } from 'zod';
import type { components } from './generated/schema';
import { cardSchema } from './card-schema';

type Wire = components['schemas'];
type WireCard = Wire['CardView'];
// `orientation` (CardView) and a reading section's `orientation` are typed here until
// the generated wire types are regenerated from the backend (pnpm gen:api); the
// intersection stays valid afterwards and can then be removed.
type CompatibleCard = Omit<WireCard, 'colors' | 'effect'> &
  Partial<Pick<WireCard, 'colors' | 'effect'>> & { orientation?: 'upright' | 'reversed' | null };
const memberId = z.union([z.string().uuid(), z.string().regex(/^bot:[a-f0-9]{32}$/)]);
/** How well a bot plays. `hard` is each game's full policy; the others slip on purpose. */
export const botLevels = ['easy', 'medium', 'hard'] as const;
const botLevel = z.enum(botLevels);
const username = z.string().regex(/^[a-z0-9_]{3,20}$/);
const avatar = z.number().int().min(0);
const memberGate = z
  .object({
    id: memberId,
    is_bot: z.boolean().default(false),
    bot_level: botLevel.nullish(),
  })
  .refine(
    (member) => member.id.startsWith('bot:') === member.is_bot,
    'Bot identifiers must match their declared seat kind.',
  )
  .refine((member) => member.is_bot || !member.bot_level, 'Only bots have a playing level.');
/** A player found or invited by username. It never carries an account or room id. */
const playerHit = z.object({ username, name: z.string().min(1), avatar });
const roomGate = z.object({
  id: z.string().uuid(),
  status: z.enum(['lobby', 'playing', 'finished', 'closed']),
  revision: z.number().int(),
  owner_id: z.string().uuid(),
  members: z.array(memberGate),
  pending_invites: z.array(playerHit).default([]),
});
const invitationGate = z.object({
  room_id: z.string().uuid(),
  room_name: z.string(),
  game_id: z.string().min(1),
  from_name: z.string(),
  from_avatar: avatar,
  players: z.number().int().nonnegative(),
  capacity: z.number().int().positive(),
  created_at: z.number().finite().nonnegative(),
});
const profileGate = z.object({
  id: z.string().min(1),
  name: z.string(),
  avatar,
  username: username.nullish(),
});

export function mapCard(card: CompatibleCard) {
  return cardSchema.parse(card);
}

export function mapGame(game: Wire['GameView']) {
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
  const gate = roomGate.parse(wire);
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
    // People invited by username who have not answered yet.
    pendingInvites: gate.pending_invites,
    members: wire.members.map((member) => ({
      id: member.id,
      isBot: member.is_bot ?? false,
      // Bots without a stated level play each game's full policy, as they always have.
      botLevel: member.is_bot ? (member.bot_level ?? 'hard') : null,
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

/** A player's own profile. Only they ever receive their username this way. */
export function mapProfile(wire: Wire['OwnProfileView']) {
  const profile = profileGate.parse(wire);
  return {
    id: profile.id,
    name: profile.name,
    avatar: profile.avatar,
    username: profile.username ?? null,
  };
}

export function mapPlayerSearch(wire: Wire['PlayerSearch']) {
  return z
    .array(playerHit)
    .max(8)
    .parse(wire.players ?? []);
}

/** Where a room code leads for a player who is already in that room. */
export function mapRoomLookup(wire: Wire['RoomLookup']) {
  const room = z.object({ id: z.string().uuid(), game_id: z.string().min(1) }).parse(wire);
  return { id: room.id, gameId: room.game_id };
}

export function mapMe(wire: Wire['MeView']) {
  return {
    profile: wire.profile ? mapProfile(wire.profile) : null,
    anonymous: wire.anonymous,
    invitations: z
      .array(invitationGate)
      .parse(wire.invitations ?? [])
      .map((invitation) => ({
        roomId: invitation.room_id,
        roomName: invitation.room_name,
        gameId: invitation.game_id,
        fromName: invitation.from_name,
        fromAvatar: invitation.from_avatar,
        players: invitation.players,
        capacity: invitation.capacity,
        createdAt: invitation.created_at,
      })),
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

const readingStyleGate = z.enum(['classic', 'fun']);

const savedReadingGate = z.object({
  match_id: z.string().uuid(),
  room_id: z.string().uuid(),
  created_at: z.number().finite().nonnegative(),
  status: z.enum(['complete', 'generating', 'incomplete', 'unavailable']),
  question: z.string().max(400),
  cards: z.array(cardSchema).max(3),
  can_resume: z.boolean(),
  reading_style: readingStyleGate.default('classic'),
  original_reading_style: readingStyleGate.nullish(),
});

export function mapSavedReading(wire: Wire['SavedReadingView']) {
  const parsed = savedReadingGate.parse(wire);
  if (parsed.status === 'complete' && !wire.reading)
    throw new Error('The saved reading is incomplete. Please try again.');
  return {
    matchId: parsed.match_id,
    roomId: parsed.room_id,
    createdAt: parsed.created_at,
    status: parsed.status,
    question: parsed.question,
    cards: parsed.cards,
    reading: wire.reading,
    canResume: parsed.can_resume,
    readingStyle: parsed.reading_style,
    originalReadingStyle: parsed.original_reading_style ?? parsed.reading_style,
  };
}

const readingProgressGate = z.object({
  stage: z.enum(['preparing', 'matching', 'writing', 'retrying', 'checking', 'saving']),
  provider: z.enum(['Gemini', 'Groq', 'Cloudflare']).nullable().optional(),
  attempt: z.number().int().min(0).max(12),
  max_attempts: z.number().int().min(1).max(12),
  started_at: z.number().finite().nonnegative(),
  updated_at: z.number().finite().nonnegative(),
  estimated_percent: z.number().int().min(1).max(99),
  estimated_seconds_remaining: z.number().int().positive().nullable().optional(),
  retry_detail: z.string().min(1).max(160).nullable().optional(),
});

function mapReadingProgress(wire: NonNullable<Wire['ReadingView']['progress']>) {
  const parsed = readingProgressGate.parse(wire);
  return {
    stage: parsed.stage,
    provider: parsed.provider ?? null,
    attempt: parsed.attempt,
    maxAttempts: parsed.max_attempts,
    startedAt: parsed.started_at,
    updatedAt: parsed.updated_at,
    estimatedPercent: parsed.estimated_percent,
    estimatedSecondsRemaining: parsed.estimated_seconds_remaining ?? null,
    ...(parsed.retry_detail ? { retryDetail: parsed.retry_detail } : {}),
  };
}

export function mapReading(wire: Wire['ReadingView']): ReadingView {
  const { progress, ...rest } = wire;
  return {
    ...rest,
    reading_style: readingStyleGate.parse(wire.reading_style ?? 'classic'),
    ...(progress ? { progress: mapReadingProgress(progress) } : {}),
  };
}

export type Room = ReturnType<typeof mapRoom>;
export type Match = NonNullable<Room['game']>;
export type Card = ReturnType<typeof mapCard>;
export type Player = Match['players'][number];
export type Action = Wire['Action'];
export type ActionOption = Match['actions'][number];
export type Me = ReturnType<typeof mapMe>;
export type Profile = ReturnType<typeof mapProfile>;
export type Invitation = Me['invitations'][number];
export type BotLevel = (typeof botLevels)[number];
export type BotSeat = { name: string | null; level: BotLevel };
export type PlayerHit = z.infer<typeof playerHit>;
export type RoomLookup = ReturnType<typeof mapRoomLookup>;
export type ReadingStyle = NonNullable<Wire['ReadingInput']['reading_style']>;
export type ReadingView = Omit<Wire['ReadingView'], 'progress'> & {
  progress?: ReturnType<typeof mapReadingProgress>;
};
export type SavedReading = ReturnType<typeof mapSavedReading>;
