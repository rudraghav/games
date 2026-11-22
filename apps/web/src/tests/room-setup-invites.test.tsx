import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import {
  mapMe,
  mapPlayerSearch,
  mapProfile,
  mapRoom,
  mapRoomLookup,
} from '@games/api-client/mappers';
import type { components } from '@games/api-client/wire';
import { gameById } from '@games/api-client/catalog';
import { fixtures } from '@/stories/generated/rooms';
import { isBackendRoute } from '@/lib/backend-routes';
import {
  formatInviteInput,
  groupRoomCode,
  roomInvite,
  roomShareText,
  roomShortPath,
} from '@/shared/room-invite';
import {
  botNameProblem,
  botRowNames,
  botSeatsRequest,
  defaultBotNames,
  emptyBotRows,
  type BotRow,
} from '@/shared/bot-seats';
import { createRoomInput, setupBotCount, startsImmediately } from '@/shared/room-setup';
import { typedUsername, usernameProblem } from '@/shared/username';
import { BotPlayersFields } from '@/shared/BotPlayersFields';
import { UsernameField } from '@/shared/UsernameField';
import { InvitationList } from '@/features/lounge/Invitations';
import { Lobby } from '@/features/room/Lobby';
import { FriendSearchResults } from '@/features/room/InviteByUsername';
import { findOwnRoom, shortLinkDestination } from '@/features/room/ShortRoomLink';

type Wire = components['schemas'];
const botId = 'bot:' + 'a'.repeat(32);
const sam = { username: 'sam_plays', name: 'Sam', avatar: 2 };

function lobbyWire(change: Partial<Wire['RoomView']> = {}): Wire['RoomView'] {
  const base = structuredClone(
    fixtures.find((item) => item.room.game_id === 'uno' && item.room.capacity === 2)!.room,
  ) as Wire['RoomView'];
  return {
    ...base,
    code: '482913',
    capacity: 4,
    status: 'lobby',
    game: null,
    match_id: null,
    match_version: null,
    members: [
      base.members[0],
      {
        ...base.members[1],
        id: botId,
        name: 'Bot Ada',
        is_bot: true,
        ready: true,
        bot_level: 'easy',
      },
    ],
    pending_invites: [sam],
    ...change,
  };
}

function render(node: ReactElement) {
  const cache = new QueryClient();
  const html = renderToStaticMarkup(
    <QueryClientProvider client={cache}>{node}</QueryClientProvider>,
  );
  cache.clear();
  return html;
}

const noop = () => undefined;
const uno = gameById('uno');
const rows = (...changed: Partial<BotRow>[]) =>
  emptyBotRows().map((row, index) => ({ ...row, ...changed[index] }));

describe('Room setup, bot levels and invitations', () => {
  it('maps bot levels, pending invitations, usernames and invitations at the client boundary', () => {
    const room = mapRoom(lobbyWire());
    expect(room.members.map((member) => member.botLevel)).toEqual([null, 'easy']);
    expect(room.pendingInvites).toEqual([sam]);
    // A bot from before levels existed plays the full policy, as it always did.
    const legacy = lobbyWire();
    delete legacy.members[1].bot_level;
    delete legacy.pending_invites;
    const mapped = mapRoom(legacy);
    expect(mapped.members[1].botLevel).toBe('hard');
    expect(mapped.pendingInvites).toEqual([]);
    const human = lobbyWire();
    human.members[0].bot_level = 'easy';
    expect(() => mapRoom(human)).toThrow();
    expect(() =>
      mapRoom(lobbyWire({ pending_invites: [{ ...sam, username: 'Not A Handle' }] })),
    ).toThrow();

    const me = mapMe({
      profile: { id: 'player-1', name: 'Raghav', avatar: 3, username: 'raghav' },
      anonymous: true,
      rooms: [],
      history: [],
      invitations: [
        {
          room_id: '11111111-1111-4111-8111-111111111111',
          room_name: 'Friday game night',
          game_id: 'uno',
          from_name: 'Sam',
          from_avatar: 2,
          players: 2,
          capacity: 4,
          created_at: 1700000000,
        },
      ],
    });
    expect(me.profile?.username).toBe('raghav');
    expect(me.invitations).toEqual([
      {
        roomId: '11111111-1111-4111-8111-111111111111',
        roomName: 'Friday game night',
        gameId: 'uno',
        fromName: 'Sam',
        fromAvatar: 2,
        players: 2,
        capacity: 4,
        createdAt: 1700000000,
      },
    ]);
    // An API from before usernames still yields a complete player.
    const older = mapMe({
      profile: { id: 'player-1', name: 'Raghav', avatar: 3 },
      anonymous: true,
      rooms: [],
      history: [],
    });
    expect(older.profile?.username).toBeNull();
    expect(older.invitations).toEqual([]);
    expect(mapProfile({ id: 'p', name: 'Sam', avatar: 1, username: null }).username).toBeNull();
    expect(mapPlayerSearch({ players: [sam] })).toEqual([sam]);
    expect(mapPlayerSearch({})).toEqual([]);
    expect(() => mapPlayerSearch({ players: Array.from({ length: 9 }, () => sam) })).toThrow();
    expect(mapRoomLookup({ id: '11111111-1111-4111-8111-111111111111', game_id: 'uno' })).toEqual({
      id: '11111111-1111-4111-8111-111111111111',
      gameId: 'uno',
    });
    expect(() => mapRoomLookup({ id: 'not-a-room', game_id: 'uno' })).toThrow();
  });

  it('lets exactly the new username, search, invitation, lookup and bot routes through the proxy', () => {
    const room = 'v1/rooms/11111111-1111-4111-8111-111111111111';
    const allowed: [string, string][] = [
      ['v1/profile/username', 'PUT'],
      ['v1/profile/username', 'DELETE'],
      ['v1/players/search', 'GET'],
      ['v1/invitations/11111111-1111-4111-8111-111111111111/accept', 'POST'],
      ['v1/invitations/11111111-1111-4111-8111-111111111111', 'DELETE'],
      ['v1/rooms/lookup/482913', 'GET'],
      ['v1/rooms/lookup/ABCD1234', 'GET'],
      [`${room}/bots/${botId}`, 'PATCH'],
      [`${room}/invites`, 'POST'],
      [`${room}/invites/sam_plays`, 'DELETE'],
    ];
    for (const [path, method] of allowed) expect(isBackendRoute(path, method)).toBe(true);
    const refused: [string, string][] = [
      ['v1/players/search', 'POST'],
      ['v1/players', 'GET'],
      ['v1/rooms/lookup/48291', 'GET'],
      ['v1/rooms/lookup/482913/members', 'GET'],
      [`${room}/bots/${botId}`, 'DELETE'],
      [`${room}/bots/bot:nope`, 'PATCH'],
      [`${room}/invites/Sam Plays`, 'DELETE'],
      [`${room}/invites/ab`, 'DELETE'],
      ['v1/invitations/not-a-room/accept', 'POST'],
    ];
    for (const [path, method] of refused) expect(isBackendRoute(path, method)).toBe(false);
  });

  it('reads six-digit codes, short links, older codes and long invite tokens', () => {
    const token = 'A_private_invite_token_1234567890';
    for (const typed of ['482913', ' 482 913 ', '482-913', '/r/482913', '/r/482913/'])
      expect(roomInvite(typed)).toBe('482913');
    expect(roomInvite('https://games.example/r/482913?from=sam#top')).toBe('482913');
    expect(roomInvite('https://games.example/r/482%20913')).toBe('482913');
    expect(roomInvite('ABCD1234')).toBe('ABCD1234');
    expect(roomInvite('https://games.example/r/ABCD1234')).toBe('ABCD1234');
    expect(roomInvite(token)).toBe(token);
    expect(roomInvite(`https://games.example/join/${token}`)).toBe(token);
    for (const bad of ['48291', '4829134', '48 29 13', 'abc', '', 'https://games.example/x/482913'])
      expect(() => roomInvite(bad)).toThrow('Enter a room code or invite link.');
  });

  it('groups a code for reading aloud and while it is typed, leaving links and older codes alone', () => {
    expect(groupRoomCode('482913')).toBe('482 913');
    expect(groupRoomCode('ABCD1234')).toBe('ABCD1234');
    expect(formatInviteInput('4')).toBe('4');
    expect(formatInviteInput('482')).toBe('482');
    expect(formatInviteInput('4829')).toBe('482 9');
    expect(formatInviteInput('482913')).toBe('482 913');
    expect(formatInviteInput('482-913')).toBe('482 913');
    expect(formatInviteInput('482 ')).toBe('482');
    expect(formatInviteInput('12345678')).toBe('12345678');
    expect(formatInviteInput('ABCD1234')).toBe('ABCD1234');
    expect(formatInviteInput('https://games.example/r/482913')).toBe(
      'https://games.example/r/482913',
    );
    expect(roomShortPath('482913')).toBe('/r/482913');
    expect(roomShareText('Uno', '482913')).toBe('Join my Uno room, code 482 913');
  });

  it('builds the create request: plain friends, all bots, and a mixed table with a renamed Easy bot', () => {
    const base = {
      game: uno,
      capacity: 4,
      name: ' Raghav ',
      avatar: 3,
      roomName: '',
      settings: {},
      botRows: emptyBotRows(),
    };
    const friends = createRoomInput({ ...base, playWith: 'friends', friendBots: 0 });
    expect(friends).toMatchObject({ name: 'Raghav', bots: 0, roomName: "Raghav's game night" });
    expect(friends).not.toHaveProperty('botSeats');

    // Untouched bots keep `null` names, so the server names them itself.
    const allBots = createRoomInput({ ...base, playWith: 'bots', friendBots: 0 });
    expect(allBots.bots).toBe(3);
    expect(allBots.botSeats).toEqual([
      { name: null, level: 'hard' },
      { name: null, level: 'hard' },
      { name: null, level: 'hard' },
    ]);

    const mixed = createRoomInput({
      ...base,
      playWith: 'friends',
      friendBots: 2,
      botRows: rows({}, { name: '  Rookie ', level: 'easy' }),
    });
    expect(mixed.bots).toBe(2);
    expect(mixed.botSeats).toEqual([
      { name: null, level: 'hard' },
      { name: 'Rookie', level: 'easy' },
    ]);

    // After a renamed bot the shown defaults are sent, so none shifts up a slot.
    expect(botSeatsRequest(rows({ name: 'Rookie' }, { level: 'medium' }).slice(0, 2))).toEqual([
      { name: 'Rookie', level: 'hard' },
      { name: 'Bot Bo', level: 'medium' },
    ]);
    // Typing the default back, or clearing the field, is the same as not renaming.
    expect(botSeatsRequest(rows({ name: 'Bot Ada' }, { name: '  ' }).slice(0, 2))).toEqual([
      { name: null, level: 'hard' },
      { name: null, level: 'hard' },
    ]);

    // The stepper never seats more bots than there are other seats.
    expect(setupBotCount({ game: uno, playWith: 'friends', capacity: 3, friendBots: 9 })).toBe(2);
    // A game page's "Play with friends" has no Bots mode, only the stepper.
    expect(
      setupBotCount({ game: uno, playWith: 'bots', capacity: 3, friendBots: 0, friendsOnly: true }),
    ).toBe(0);
    expect(
      setupBotCount({ game: uno, playWith: 'bots', capacity: 3, friendBots: 1, friendsOnly: true }),
    ).toBe(1);
    expect(
      setupBotCount({ game: gameById('tarot'), playWith: 'bots', capacity: 1, friendBots: 0 }),
    ).toBe(0);
    // Only a table with no seat left for a friend starts on its own.
    expect(startsImmediately({ game: uno, playWith: 'bots', capacity: 4, friendBots: 0 })).toBe(
      true,
    );
    expect(startsImmediately({ game: uno, playWith: 'friends', capacity: 4, friendBots: 3 })).toBe(
      true,
    );
    expect(startsImmediately({ game: uno, playWith: 'friends', capacity: 4, friendBots: 2 })).toBe(
      false,
    );
    expect(startsImmediately({ game: uno, playWith: 'friends', capacity: 4, friendBots: 0 })).toBe(
      false,
    );
    expect(
      startsImmediately({
        game: gameById('tarot'),
        playWith: 'friends',
        capacity: 1,
        friendBots: 0,
      }),
    ).toBe(true);
  });

  it('prefills the server’s bot names and explains a duplicate before anything is sent', () => {
    expect(defaultBotNames(3)).toEqual(['Bot Ada', 'Bot Bo', 'Bot Cleo']);
    // The server skips a default the host already uses.
    expect(defaultBotNames(2, 'Bot Ada')).toEqual(['Bot Bo', 'Bot Cleo']);
    expect(botRowNames(rows({}, { name: ' Rookie ' }).slice(0, 2))).toEqual(['Bot Ada', 'Rookie']);
    expect(botNameProblem(rows().slice(0, 3), 'Raghav')).toBeNull();
    expect(botNameProblem(rows({ name: 'Rookie' }, { name: 'rookie ' }).slice(0, 2))).toBe(
      'Two bots are called “Rookie”. Give each bot its own name.',
    );
    expect(botNameProblem(rows({}, { name: 'bot ada' }).slice(0, 2))).toContain('Two bots');
    expect(botNameProblem(rows({ name: 'raghav' }).slice(0, 1), 'Raghav')).toBe(
      '“raghav” is your name. Give that bot a different one.',
    );

    const one = render(
      <BotPlayersFields
        rows={rows().slice(0, 1)}
        hostName="Raghav"
        problem={null}
        onChange={noop}
      />,
    );
    expect(one).toContain('aria-label="Bot players"');
    expect(one).toContain('aria-label="Bot 1 name"');
    expect(one).toContain('value="Bot Ada"');
    expect(one).toContain('aria-label="Bot 1 difficulty"');
    expect(one).toContain('Easy: often slips · Medium: sometimes slips · Hard: plays its best');
    expect(one).not.toContain('Set all');
    const two = render(
      <BotPlayersFields
        rows={rows({ name: 'Rookie', level: 'easy' }).slice(0, 2)}
        hostName="Raghav"
        problem="Two bots are called “Rookie”. Give each bot its own name."
        onChange={noop}
      />,
    );
    expect(two).toContain('aria-label="Set all bots to"');
    expect(two).toContain('value="Rookie"');
    expect(two).toContain('value="Bot Bo"');
    expect(two).toContain('role="alert"');
  });

  it('keeps usernames lowercase, without the @, and states the rule', () => {
    expect(typedUsername('@Sam_Plays')).toBe('sam_plays');
    expect(typedUsername(' @@sam plays ')).toBe('samplays');
    expect(typedUsername('a'.repeat(30))).toHaveLength(20);
    expect(usernameProblem('sam_plays')).toBeNull();
    expect(usernameProblem('a1_')).toBeNull();
    for (const bad of ['', 'ab', 'sam-plays', 'sam.plays', 'séb', 'a'.repeat(21)])
      expect(usernameProblem(bad)).toBe('Use 3 to 20 letters, numbers or underscores.');

    const empty = render(<UsernameField username={null} />);
    expect(empty).toContain('>Username</label>');
    expect(empty).toContain('<span aria-hidden="true">@</span>');
    expect(empty).toContain('3 to 20 letters, numbers or underscores.');
    expect(empty).toContain('Save username');
    expect(empty).not.toContain('Remove username');
    const chosen = render(<UsernameField username="raghav" />);
    expect(chosen).toContain('value="raghav"');
    expect(chosen).toContain('Remove username');
    const guest = render(
      <UsernameField username={null} unavailable="Save your name first, then choose a username." />,
    );
    expect(guest).toContain('Save your name first, then choose a username.');
    expect(guest).toMatch(/<input[^>]*disabled=""/);
  });

  it('lists invitations with who invited, the room, the game and the seats', () => {
    const invitation = {
      roomId: '11111111-1111-4111-8111-111111111111',
      roomName: 'Friday game night',
      gameId: 'uno',
      fromName: 'Sam',
      fromAvatar: 2,
      players: 2,
      capacity: 4,
      createdAt: 1700000000,
    };
    const html = render(
      <InvitationList invitations={[invitation]} onJoin={noop} onDecline={noop} />,
    );
    expect(html).toContain('aria-label="Invitations"');
    expect(html).toContain('Sam invited you to Friday game night');
    expect(html).toContain('Uno · 2 of 4 players');
    expect(html).toContain('aria-label="Join Friday game night"');
    expect(html).toContain('aria-label="Decline invitation to Friday game night"');
    expect(html).toContain('You’re invited');
    const many = render(
      <InvitationList
        invitations={[
          invitation,
          { ...invitation, roomId: '22222222-2222-4222-8222-222222222222', gameId: 'retired-game' },
        ]}
        busy={{ roomId: invitation.roomId, answer: 'join' }}
        onJoin={noop}
        onDecline={noop}
      />,
    );
    expect(many).toContain('2 invitations');
    expect(many).toContain('A game · 2 of 4 players');
    expect(many.match(/disabled=""/g)).toHaveLength(4);
    expect(many.match(/aria-busy="true"/g)).toHaveLength(1);
    // Nothing waiting: no empty region, only the live status for a just-declined one.
    const none = render(
      <InvitationList
        invitations={[]}
        notice="Declined Sam’s invitation."
        onJoin={noop}
        onDecline={noop}
      />,
    );
    expect(none).not.toContain('aria-label="Invitations"');
    expect(none).toContain('role="status"');
    expect(none).toContain('Declined Sam’s invitation.');
    const failed = render(
      <InvitationList invitations={[]} error="That room is full." onJoin={noop} onDecline={noop} />,
    );
    expect(failed).toContain('role="alert"');
    expect(failed).toContain('That room is full.');
  });

  it('gives the host bot controls and shows everyone else the level as text', () => {
    const room = mapRoom(lobbyWire());
    const controls = {
      ready: noop,
      start: noop,
      configure: noop,
      pending: false,
      addBots: noop,
      removeBot: noop,
      updateBot: noop,
    };
    const host = render(<Lobby room={room} selfId={room.ownerId} {...controls} />);
    expect(host).toContain('aria-label="Bot Ada difficulty"');
    expect(host).toMatch(/<option value="easy" selected="">Easy · often slips<\/option>/);
    expect(host).toContain('Hard · plays its best');
    expect(host).toContain('aria-label="Rename Bot Ada"');
    expect(host).toContain('aria-label="Remove Bot Ada bot"');
    expect(host).not.toContain('seat-badge');
    expect(host).toContain('Add bot');
    expect(host).toContain('aria-label="Cancel invitation to Sam"');

    const guest = render(
      <Lobby room={room} selfId="22222222-2222-4222-8222-222222222222" {...controls} />,
    );
    expect(guest).toContain('<b class="seat-badge">Easy</b>');
    expect(guest).not.toContain('difficulty');
    expect(guest).not.toContain('Rename Bot Ada');
    expect(guest).not.toContain('Remove Bot Ada bot');
    expect(guest).not.toContain('Add bot');
    // Any member sees who is invited; only the host (or the sender) can cancel.
    expect(guest).toContain('@sam_plays');
    expect(guest).not.toContain('Cancel invitation to Sam');
  });

  it('centres an unfilled lobby on the grouped code, the short link and the copy actions', () => {
    const room = mapRoom(lobbyWire());
    const props = { ready: noop, start: noop, configure: noop, pending: false };
    const html = render(<Lobby room={room} selfId={room.ownerId} {...props} />);
    expect(html).toContain('aria-label="Invite friends"');
    expect(html).toContain('<strong class="room-code">482 913</strong>');
    expect(html).toContain('/r/482913');
    expect(html).not.toContain('/join/');
    expect(html).toContain('Copy link');
    expect(html).toContain('Copy code');
    expect(html).toContain('2 open seats');
    expect(html).toContain('Find a friend by username');
    // Sharing is offered only where the browser supports it, never during a server render.
    expect(html).not.toContain('>Share<');
    const legacy = render(
      <Lobby
        room={mapRoom(lobbyWire({ code: 'ABCD1234', capacity: 2 }))}
        selfId={room.ownerId}
        {...props}
      />,
    );
    expect(legacy).toContain('<strong class="room-code">ABCD1234</strong>');
    expect(legacy).toContain('/r/ABCD1234');
    expect(legacy).not.toContain('open seat');
  });

  it('says in plain words what the username search found', () => {
    const base = {
      searching: false,
      failed: '',
      players: undefined,
      invited: [] as string[],
      ownUsername: null,
      busy: null,
      onInvite: noop,
    };
    expect(render(<FriendSearchResults {...base} term="s" />)).toContain(
      'Type the first 2 letters of a friend’s username.',
    );
    expect(render(<FriendSearchResults {...base} term="sa" searching />)).toContain('Searching…');
    expect(render(<FriendSearchResults {...base} term="qq" players={[]} />)).toContain(
      'No one has a username starting with “qq”.',
    );
    const limited = render(
      <FriendSearchResults
        {...base}
        term="sa"
        failed="That’s a lot of searches. Wait a minute, then try again."
      />,
    );
    expect(limited).toContain('role="alert"');
    expect(limited).toContain('Wait a minute');
    const found = render(
      <FriendSearchResults
        {...base}
        term="sa"
        players={[
          sam,
          { username: 'samira', name: 'Samira', avatar: 5 },
          { username: 'sara', name: 'Sara', avatar: 1 },
        ]}
        invited={['samira']}
        ownUsername="sara"
      />,
    );
    expect(found).toContain('aria-label="Invite Sam (@sam_plays)"');
    expect(found).toContain('@sam_plays');
    expect(found).toContain('aria-label="Samira (@samira) is invited"');
    expect(found).toContain('That’s you');
    expect(found.match(/<li/g)).toHaveLength(3);
  });

  it('sends a member’s short link to their table, with the old address as a fallback', () => {
    const id = '11111111-1111-4111-8111-111111111111';
    expect(shortLinkDestination({ id, gameId: 'uno' })).toBe(`/games/uno/rooms/${id}`);
    expect(shortLinkDestination({ id, gameId: 'tarot' })).toBe(`/games/tarot/play/${id}`);
    expect(shortLinkDestination({ id, gameId: 'retired-game' })).toBe(`/rooms/${id}`);
  });

  it('asks about a short link once, and only for a visitor who is in some room', async () => {
    const id = '11111111-1111-4111-8111-111111111111';
    const membership = {
      id,
      name: 'Table',
      gameId: 'uno',
      status: 'lobby',
      players: 2,
      capacity: 4,
    };
    const me = (rooms: (typeof membership)[]) => ({
      profile: null,
      anonymous: true,
      invitations: [],
      rooms,
      history: [],
    });
    const asked: string[] = [];
    const client = (rooms: (typeof membership)[], found: boolean) => ({
      me: async () => me(rooms),
      lookup: async (invite: string) => {
        asked.push(invite);
        if (!found) throw new Error('No room of yours matches that code or invite.');
        return { id, gameId: 'uno' };
      },
    });
    // A member: one lookup, with the code as the server expects it.
    expect(await findOwnRoom('482-913', client([membership], true))).toEqual({ id, gameId: 'uno' });
    expect(asked).toEqual(['482913']);
    // In another room but not this one: asked once, then offered the join screen.
    expect(await findOwnRoom('482913', client([membership], false))).toBeNull();
    expect(asked).toEqual(['482913', '482913']);
    // In no room at all, signed out, or a code that cannot be one: nothing is asked.
    expect(await findOwnRoom('482913', client([], true))).toBeNull();
    expect(
      await findOwnRoom('482913', {
        ...client([membership], true),
        me: async () => {
          throw new Error('Session required');
        },
      }),
    ).toBeNull();
    expect(await findOwnRoom('not a code', client([membership], true))).toBeNull();
    expect(asked).toEqual(['482913', '482913']);
  });
});
