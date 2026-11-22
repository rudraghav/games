import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { mapMe, mapProfile, mapRoom } from '@games/api-client/mappers';
import { mapProgress, frameIds, cardBackIds, type Progress } from '@games/api-client';
import type { components } from '@games/api-client/wire';
import { games } from '@games/api-client/catalog';
import { Avatar, GameTile, LevelRing, Seat, Ticket, isAvatarFrame } from '@games/ui';
import { fixtures } from '@/stories/generated/rooms';
import { isBackendRoute, progressRoute, utcOffset } from '@/lib/backend-routes';
import {
  badgeCount,
  hasPlayedAGame,
  levelLabel,
  levelProgress,
  streakLine,
  wornCosmetics,
} from '@/shared/progress';
import {
  categories,
  findGames,
  gameMinutes,
  matchesTeamFilters,
  teamGames,
  teamsNote,
} from '@/features/lounge/catalogue-search';
import { collectionGames, collections } from '@/features/lounge/collections';
import { CollectionRails } from '@/features/lounge/CollectionRails';
import { ContinueRail, activeRooms } from '@/features/lounge/ContinueRail';
import { GameLibrary } from '@/features/lounge/GameLibrary';
import { InvitationList } from '@/features/lounge/Invitations';
import { WelcomeStripView } from '@/features/lounge/WelcomeStrip';
import { BadgeGrid } from '@/features/rewards/BadgeGrid';
import { RewardCoupon, removeLabel, rewardStateLabel } from '@/features/rewards/RewardCoupon';
import { RewardsView, rewardNotice } from '@/features/rewards/Rewards';
import { ResultsProgressView } from '@/features/room/ResultsProgress';

type Wire = components['schemas'];

function wireProgress(change: Partial<Wire['ProgressView']> = {}): Wire['ProgressView'] {
  return {
    xp: 190,
    level: 3,
    level_xp: 150,
    next_level_xp: 300,
    streak: { current: 4, best: 6, played_today: false },
    totals: { games: 12, wins: 5, different_games: 4, with_friends: 6 },
    badges: [
      {
        id: 'first-game',
        name: 'First game',
        description: 'Finish your first game',
        earned: true,
        value: 1,
        goal: 1,
      },
      {
        id: 'regular',
        name: 'Regular',
        description: 'Finish 10 games',
        earned: false,
        value: 3,
        goal: 10,
      },
      {
        id: 'a-badge-from-next-year',
        name: 'Night owl',
        description: 'Finish a game after midnight',
        earned: false,
        value: 0,
        goal: 1,
      },
    ],
    rewards: [
      {
        id: 'frame-gold',
        kind: 'frame',
        name: 'Gold frame',
        requirement: 'Reach level 2',
        state: 'redeemed',
        equipped: true,
        value: 2,
        goal: 2,
      },
      {
        id: 'frame-flame',
        kind: 'frame',
        name: 'Flame frame',
        requirement: 'Earn the Three in a row badge',
        state: 'available',
        equipped: false,
        value: 3,
        goal: 3,
      },
      {
        id: 'frame-crown',
        kind: 'frame',
        name: 'Crown frame',
        requirement: 'Reach level 8',
        state: 'locked',
        equipped: false,
        value: 3,
        goal: 8,
      },
      {
        id: 'back-midnight',
        kind: 'card_back',
        name: 'Midnight card back',
        requirement: 'Reach level 3',
        state: 'redeemed',
        equipped: false,
        value: 3,
        goal: 3,
      },
    ],
    ...change,
  };
}
const progress = (change: Partial<Wire['ProgressView']> = {}) => mapProgress(wireProgress(change));
const player = { name: 'Maya Rao', avatar: 2 };
const noop = () => undefined;

describe('progress at the API boundary', () => {
  it('maps every field of the progress reply and keeps the server’s words', () => {
    const mapped = progress();
    expect(mapped).toMatchObject({
      xp: 190,
      level: 3,
      levelXp: 150,
      nextLevelXp: 300,
      streak: { current: 4, best: 6, playedToday: false },
      totals: { games: 12, wins: 5, differentGames: 4, withFriends: 6 },
    });
    expect(mapped.badges[1]).toEqual({
      id: 'regular',
      name: 'Regular',
      description: 'Finish 10 games',
      earned: false,
      value: 3,
      goal: 10,
    });
    expect(mapped.rewards[1]).toEqual({
      id: 'frame-flame',
      kind: 'frame',
      name: 'Flame frame',
      requirement: 'Earn the Three in a row badge',
      state: 'available',
      equipped: false,
      value: 3,
      goal: 3,
    });
  });
  it('accepts a reply without lists, and refuses numbers that cannot be progress', () => {
    const bare = mapProgress({ ...wireProgress(), badges: undefined, rewards: undefined });
    expect(bare.badges).toEqual([]);
    expect(bare.rewards).toEqual([]);
    expect(() => progress({ xp: -1 })).toThrow();
    expect(() => progress({ level: 0 })).toThrow();
    expect(() => progress({ level_xp: 300, next_level_xp: 300 })).toThrow();
    expect(() =>
      mapProgress({
        ...wireProgress(),
        rewards: [{ ...wireProgress().rewards![0], state: 'for-sale' as 'locked' }],
      }),
    ).toThrow();
  });
  it('never reports a reward as worn unless it is redeemed, and caps counts at the goal', () => {
    const mapped = mapProgress({
      ...wireProgress(),
      badges: [{ ...wireProgress().badges![1], value: 14 }],
      rewards: [{ ...wireProgress().rewards![1], equipped: true, value: 9 }],
    });
    expect(mapped.rewards[0].equipped).toBe(false);
    expect(mapped.rewards[0].value).toBe(3);
    expect(mapped.badges[0].value).toBe(10);
  });
  it('carries the worn frame on room members and the frame and card back on the own profile', () => {
    const wire = structuredClone(
      fixtures.find((item) => item.room.game_id === 'uno')!.room,
    ) as Wire['RoomView'];
    expect(mapRoom(wire).members.every((member) => member.frame === null)).toBe(true);
    wire.members[0] = { ...wire.members[0], frame: 'frame-laurel' };
    wire.members[1] = { ...wire.members[1], frame: 'frame-from-next-year' };
    const room = mapRoom(wire);
    expect(room.members[0].frame).toBe('frame-laurel');
    // An id this build does not know is passed on; the avatar draws it as plain.
    expect(room.members[1].frame).toBe('frame-from-next-year');
    // Decoration of the wrong shape reads as nothing worn, never as a broken room.
    wire.members[0] = { ...wire.members[0], frame: 42 as unknown as string };
    expect(mapRoom(wire).members[0].frame).toBeNull();

    const own = { id: 'p', name: 'Maya', avatar: 2 };
    expect(mapProfile(own)).toMatchObject({ frame: null, cardBack: null });
    expect(mapProfile({ ...own, frame: 'frame-gold', card_back: 'back-royal' })).toMatchObject({
      frame: 'frame-gold',
      cardBack: 'back-royal',
    });
    const me = mapMe({
      profile: { ...own, frame: null, card_back: 'back-emerald' },
      anonymous: true,
      rooms: [],
      history: [],
    });
    expect(me.profile).toMatchObject({ frame: null, cardBack: 'back-emerald' });
  });
  it('lets the three progress routes through the proxy with only a valid UTC offset', () => {
    expect(isBackendRoute('v1/progress', 'GET')).toBe(true);
    expect(isBackendRoute('v1/progress', 'POST')).toBe(false);
    expect(isBackendRoute('v1/rewards/frame-gold/redeem', 'POST')).toBe(true);
    expect(isBackendRoute('v1/rewards/frame-gold/redeem', 'GET')).toBe(false);
    expect(isBackendRoute('v1/rewards/Frame_Gold/redeem', 'POST')).toBe(false);
    expect(isBackendRoute('v1/rewards/a/b/redeem', 'POST')).toBe(false);
    expect(isBackendRoute('v1/profile/cosmetics', 'PUT')).toBe(true);
    expect(isBackendRoute('v1/profile/cosmetics', 'DELETE')).toBe(false);
    for (const path of ['v1/progress', 'v1/rewards/back-royal/redeem', 'v1/profile/cosmetics'])
      expect(progressRoute.test(path)).toBe(true);
    expect(progressRoute.test('v1/profile')).toBe(false);
    expect(utcOffset(['330'])).toBe('330');
    expect(utcOffset(['-480'])).toBe('-480');
    expect(utcOffset(['840'])).toBe('840');
    for (const bad of [[], ['841'], ['-721'], ['1e2'], ['5.5'], ['330', '0'], ['abc']])
      expect(utcOffset(bad)).toBeNull();
  });
});

describe('level ring maths', () => {
  it('measures XP inside the current level', () => {
    expect(levelProgress({ xp: 190, levelXp: 150, nextLevelXp: 300 })).toEqual({
      earned: 40,
      span: 150,
      remaining: 110,
      fraction: 40 / 150,
    });
    expect(levelProgress({ xp: 0, levelXp: 0, nextLevelXp: 50 }).fraction).toBe(0);
    expect(levelProgress({ xp: 50, levelXp: 50, nextLevelXp: 150 })).toMatchObject({
      earned: 0,
      remaining: 100,
    });
    expect(levelLabel(progress())).toBe('Level 3, 40 of 150 XP toward level 4');
  });
  it('stays inside the ring when a reply is out of range', () => {
    expect(levelProgress({ xp: 999, levelXp: 150, nextLevelXp: 300 }).fraction).toBe(1);
    expect(levelProgress({ xp: 10, levelXp: 150, nextLevelXp: 300 }).fraction).toBe(0);
    expect(levelProgress({ xp: 10, levelXp: 150, nextLevelXp: 150 })).toMatchObject({
      span: 1,
      fraction: 0,
    });
  });
  it('draws the filled arc from the fraction and clamps it', () => {
    const length = 2 * Math.PI * 42;
    const half = renderToStaticMarkup(<LevelRing level={3} fraction={0.5} label="Level 3" />);
    expect(half).toContain('role="img"');
    expect(half).toContain('aria-label="Level 3"');
    expect(half).toContain(`stroke-dasharray="${(length / 2).toFixed(2)} ${length.toFixed(2)}"`);
    expect(renderToStaticMarkup(<LevelRing level={3} fraction={7} label="x" />)).toContain(
      `stroke-dasharray="${length.toFixed(2)} ${length.toFixed(2)}"`,
    );
    expect(renderToStaticMarkup(<LevelRing level={3} fraction={Number.NaN} label="x" />)).toContain(
      `stroke-dasharray="0.00 ${length.toFixed(2)}"`,
    );
    // Beside written numbers the ring is decoration.
    const quiet = renderToStaticMarkup(<LevelRing level={3} fraction={0.5} />);
    expect(quiet).toContain('aria-hidden="true"');
    expect(quiet).not.toContain('role="img"');
  });
});

describe('streak wording', () => {
  it('names a streak, and nudges only while today has no game yet', () => {
    expect(streakLine({ current: 4, best: 6, playedToday: false })).toEqual({
      label: '4-day streak',
      hint: 'Play today to keep it going',
    });
    expect(streakLine({ current: 4, best: 6, playedToday: true })).toEqual({
      label: '4-day streak',
      hint: null,
    });
    expect(streakLine({ current: 1, best: 1, playedToday: true })?.label).toBe('1-day streak');
  });
  it('says nothing at all when there is no streak', () => {
    expect(streakLine({ current: 0, best: 9, playedToday: false })).toBeNull();
    expect(streakLine({ current: 0, best: 0, playedToday: false })).toBeNull();
  });
  it('never words a streak as lost anywhere it is shown', () => {
    const ended = progress({ streak: { current: 0, best: 9, played_today: false } });
    const html =
      renderToStaticMarkup(<WelcomeStripView state="ready" progress={ended} />) +
      renderToStaticMarkup(<RewardsView progress={ended} player={player} onAction={noop} />) +
      renderToStaticMarkup(<ResultsProgressView progress={ended} />);
    expect(html).not.toMatch(/lost|broke|missed|ended|expired|hurry|last chance|claim now/i);
    expect(html).not.toContain('day streak');
    expect(html).toContain('Best: 9 days');
  });
});

describe('the welcome strip', () => {
  it('shows level, XP to go, the streak nudge and badges as one link to /rewards', () => {
    const html = renderToStaticMarkup(<WelcomeStripView state="ready" progress={progress()} />);
    expect(html).toMatch(/^<a class="welcome-strip"[^>]*href="\/rewards"/);
    expect(html).toContain('Level 3');
    expect(html).toContain('110 XP to level 4');
    expect(html).toContain('4-day streak');
    expect(html).toContain('Play today to keep it going');
    expect(html).toContain('1 of 3 badges');
    expect(html).toContain('Open your progress and rewards');
  });
  it('drops the nudge once today is played, and the streak when there is none', () => {
    const played = renderToStaticMarkup(
      <WelcomeStripView
        state="ready"
        progress={progress({ streak: { current: 4, best: 6, played_today: true } })}
      />,
    );
    expect(played).toContain('4-day streak');
    expect(played).not.toContain('Play today');
    const none = renderToStaticMarkup(
      <WelcomeStripView
        state="ready"
        progress={progress({ streak: { current: 0, best: 6, played_today: false } })}
      />,
    );
    expect(none).not.toContain('streak');
    expect(none).toContain('Level 3');
  });
  it('gives a visitor who has never played one friendly line with no numbers', () => {
    const fresh = progress({
      xp: 0,
      level: 1,
      level_xp: 0,
      next_level_xp: 50,
      totals: { games: 0, wins: 0, different_games: 0, with_friends: 0 },
    });
    expect(hasPlayedAGame(fresh)).toBe(false);
    for (const html of [
      renderToStaticMarkup(<WelcomeStripView state="new" />),
      renderToStaticMarkup(<WelcomeStripView state="ready" progress={fresh} />),
      renderToStaticMarkup(<WelcomeStripView state="ready" progress={null} />),
    ]) {
      expect(html).toContain('Welcome.');
      // The words themselves, without the icon's drawing.
      expect(html.replace(/<svg.*?<\/svg>/g, '').replace(/<[^>]+>/g, '')).not.toMatch(/\d/);
      expect(html).not.toContain('href');
    }
    // Before the browser knows who this is, the strip holds its place and says nothing.
    const pending = renderToStaticMarkup(<WelcomeStripView state="pending" />);
    expect(pending).toContain('data-state="pending"');
    expect(pending.replace(/<[^>]+>/g, '')).toBe('');
    const loading = renderToStaticMarkup(<WelcomeStripView state="loading" />);
    expect(loading).toContain('aria-busy="true"');
    expect(loading).toContain('Loading your progress…');
  });
});

describe('Ticket', () => {
  it('is a shell: a body, a stub, and whatever was passed through to the outer element', () => {
    const html = renderToStaticMarkup(
      <Ticket
        as="li"
        className="invitation"
        variant="success"
        layout="row"
        stubSide="start"
        aria-label="Coupon"
        data-state="redeemed"
        stub={<button type="button">Use</button>}
        stubClassName="actions"
      >
        <h3>Gold frame</h3>
      </Ticket>,
    );
    expect(html).toBe(
      '<li aria-label="Coupon" data-state="redeemed" class="ticket invitation" data-variant="success" data-layout="row" data-stub="start" data-shape="ticket">' +
        '<div class="ticket-body"><h3>Gold frame</h3></div>' +
        '<div class="ticket-stub actions"><button type="button">Use</button></div></li>',
    );
  });
  it('defaults to a plain ticket and has no tear line without a stub', () => {
    const html = renderToStaticMarkup(<Ticket shape="tag">Hello</Ticket>);
    expect(html).toBe(
      '<div class="ticket" data-variant="default" data-layout="auto" data-stub="none" data-shape="tag">' +
        '<div class="ticket-body">Hello</div></div>',
    );
    expect(html).not.toContain('ticket-stub');
    expect(html).not.toContain('<img');
  });
  it('keeps the invitation’s names when it is drawn as a ticket', () => {
    const html = renderToStaticMarkup(
      <InvitationList
        invitations={[
          {
            roomId: '44444444-4444-4444-8444-444444444444',
            roomName: 'Friday game night',
            gameId: 'uno',
            fromName: 'Sam',
            fromAvatar: 1,
            players: 2,
            capacity: 4,
            createdAt: 1,
          },
        ]}
        onJoin={noop}
        onDecline={noop}
      />,
    );
    expect(html).toContain('<section class="invitations" aria-label="Invitations">');
    expect(html).toContain('class="ticket invitation"');
    expect(html).toContain('class="ticket-stub invitation-actions"');
    expect(html).toContain('aria-label="Join Friday game night"');
    expect(html).toContain('aria-label="Decline invitation to Friday game night"');
    expect(html).toContain('Uno · 2 of 4 players');
  });
});

describe('avatar frames', () => {
  it('draws each of the five frames as decoration and keeps the name', () => {
    const drawings = frameIds.map((frame) => {
      const html = renderToStaticMarkup(<Avatar name="Maya Rao" frame={frame} />);
      expect(html).toContain(`data-frame="${frame}"`);
      expect(html).toContain('aria-label="Maya Rao"');
      expect(html).toContain('<span class="avatar-frame" aria-hidden="true"><svg');
      expect(html).toContain('>MR<');
      expect(isAvatarFrame(frame)).toBe(true);
      return html.slice(html.indexOf('<svg'));
    });
    // Five different drawings, not one drawing in five colours.
    expect(new Set(drawings).size).toBe(5);
    const shapes = drawings.map((svg) =>
      [...svg.matchAll(/<(circle|ellipse|path|rect)\b/g)].map((match) => match[1]).join(','),
    );
    expect(new Set(shapes).size).toBe(5);
  });
  it('works at all three sizes', () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const html = renderToStaticMarkup(<Avatar name="Maya" size={size} frame="frame-crown" />);
      expect(html).toContain(`avatar--${size}`);
      expect(html).toContain('avatar-frame');
    }
  });
  it('renders an unknown, empty or missing frame as the plain avatar', () => {
    const plain = renderToStaticMarkup(<Avatar name="Maya Rao" seed={2} />);
    for (const frame of ['frame-from-next-year', '', null, undefined, 'constructor', 'toString'])
      expect(renderToStaticMarkup(<Avatar name="Maya Rao" seed={2} frame={frame} />)).toBe(plain);
    expect(plain).not.toContain('data-frame');
    expect(isAvatarFrame('__proto__')).toBe(false);
  });
  it('reaches the avatar through a seat', () => {
    expect(renderToStaticMarkup(<Seat name="Maya" frame="frame-flame" />)).toContain(
      'data-frame="frame-flame"',
    );
    expect(renderToStaticMarkup(<Seat name="Maya" frame="nope" />)).not.toContain('data-frame');
    expect(renderToStaticMarkup(<Seat frame="frame-flame" />)).not.toContain('avatar-frame');
  });
});

describe('badges', () => {
  const html = renderToStaticMarkup(<BadgeGrid badges={progress().badges} />);
  const items = html.split('<li ').slice(1);
  it('marks an earned badge with a check and the word', () => {
    expect(items[0]).toContain('data-earned="true"');
    expect(items[0]).toContain('First game');
    expect(items[0]).toContain('Finish your first game');
    expect(items[0]).toContain('Earned');
    expect(items[0]).not.toContain('<progress');
  });
  it('shows a badge in progress as a bar with "3 of 10"', () => {
    expect(items[1]).toContain('data-earned="false"');
    expect(items[1]).toContain('<progress value="3" max="10" aria-label="Regular progress">');
    expect(items[1]).toContain('3 of 10');
    expect(items[1]).not.toContain('Earned');
  });
  it('renders a badge it has no picture for', () => {
    expect(items[2]).toContain('Night owl');
    expect(items[2]).toContain('0 of 1');
    expect(badgeCount(progress().badges)).toBe('1 of 3 badges');
  });
});

describe('reward coupons', () => {
  const rewards = progress().rewards;
  const coupon = (index: number, extra: Partial<Parameters<typeof RewardCoupon>[0]> = {}) =>
    renderToStaticMarkup(
      <RewardCoupon reward={rewards[index]} player={player} onAction={noop} {...extra} />,
    );
  it('locked: the requirement, the progress and no button', () => {
    const html = coupon(2);
    expect(html).toContain('data-variant="muted"');
    expect(html).toContain('data-state="locked"');
    expect(html).toContain('Locked');
    expect(html).toContain('Reach level 8');
    expect(html).toContain('<progress value="3" max="8" aria-label="Crown frame progress">');
    expect(html).toContain('3 of 8');
    expect(html).not.toContain('<button');
    expect(rewardStateLabel(rewards[2])).toBe('Locked');
  });
  it('available: Redeem', () => {
    const html = coupon(1);
    expect(html).toContain('data-variant="default"');
    expect(html).toContain('Ready to redeem');
    expect(html).toContain('aria-label="Redeem Flame frame"');
    expect(html).toContain('>Redeem</button>');
    expect(html).not.toContain('aria-label="Use ');
  });
  it('redeemed: Use', () => {
    const html = coupon(3);
    expect(html).toContain('data-variant="success"');
    expect(html).toContain('Redeemed');
    expect(html).toContain('aria-label="Use Midnight card back"');
    expect(html).not.toContain('Redeem<');
  });
  it('in use: says so, and offers to take a frame off or go back to the standard back', () => {
    const frame = coupon(0);
    expect(frame).toContain('data-equipped="true"');
    expect(frame).toContain('In use');
    expect(frame).toContain('aria-label="Take off: Gold frame"');
    expect(frame).toContain('>Take off</button>');
    const back = renderToStaticMarkup(
      <RewardCoupon reward={{ ...rewards[3], equipped: true }} player={player} onAction={noop} />,
    );
    expect(back).toContain('In use');
    expect(back).toContain('>Use standard back</button>');
    expect(removeLabel('frame')).toBe('Take off');
    expect(removeLabel('card_back')).toBe('Use standard back');
  });
  it('previews the cosmetic itself in the stub, as decoration', () => {
    const frame = coupon(1);
    expect(frame).toContain('class="ticket-stub reward-preview"');
    expect(frame).toContain('<span aria-hidden="true"><span class="avatar avatar--lg"');
    expect(frame).toContain('data-frame="frame-flame"');
    const back = coupon(3);
    expect(back).toContain('<span aria-hidden="true" data-card-back="back-midnight">');
    expect(back).toContain('playing-card--back');
  });
  it('shows the server’s refusal on the coupon, and waits while another changes', () => {
    const refused = coupon(2, { error: 'Reach level 8 to redeem this.' });
    expect(refused).toContain('role="alert"');
    expect(refused).toContain('Reach level 8 to redeem this.');
    expect(coupon(1, { disabled: true })).toMatch(/<button[^>]*disabled=""[^>]*>Redeem/);
    expect(coupon(1, { busy: 'redeem' })).toContain('aria-busy="true"');
    expect(coupon(1, { justRedeemed: true })).toContain('data-just-redeemed="true"');
  });
  it('groups rewards by type on the page and announces each change in plain words', () => {
    const html = renderToStaticMarkup(
      <RewardsView
        progress={progress()}
        player={player}
        notice="Gold frame redeemed. It’s yours to use."
        onAction={noop}
      />,
    );
    const frames = html.indexOf('Avatar frames');
    const backs = html.indexOf('Card backs');
    expect(frames).toBeGreaterThan(html.indexOf('>Badges<'));
    expect(backs).toBeGreaterThan(frames);
    expect(html.indexOf('Crown frame')).toBeLessThan(backs);
    expect(html.indexOf('Midnight card back')).toBeGreaterThan(backs);
    expect(html).toContain('<p class="small rewards-status" role="status">Gold frame redeemed.');
    for (const label of ['Games played', 'Wins', 'Different games', 'With friends'])
      expect(html).toContain(label);
    expect(html).toContain('40 of 150 XP');
    expect(rewardNotice('redeem', rewards[1])).toBe('Flame frame redeemed. It’s yours to use.');
    expect(rewardNotice('use', rewards[3])).toBe('Now using the midnight card back.');
    expect(rewardNotice('remove', rewards[0])).toBe('Frame taken off.');
    expect(rewardNotice('remove', rewards[3])).toBe('Back to the standard card back.');
  });
  it('reads what is worn from the rewards themselves', () => {
    expect(wornCosmetics(progress())).toEqual({ frame: 'frame-gold', cardBack: null });
    expect(wornCosmetics({ rewards: [] })).toEqual({ frame: null, cardBack: null });
    expect(cardBackIds).toEqual(['back-midnight', 'back-sunrise', 'back-emerald', 'back-royal']);
  });
});

describe('the progress line under a result', () => {
  it('states level, XP to go and the streak, with a link to /rewards', () => {
    const html = renderToStaticMarkup(<ResultsProgressView progress={progress()} />);
    expect(html).toContain('<section class="results-progress" aria-label="Your progress">');
    expect(html).toContain('Level 3');
    expect(html).toContain('<progress value="40" max="150"');
    expect(html).toContain('110 XP to level 4 · 4-day streak');
    expect(html).toContain('href="/rewards"');
  });
  it('holds its place and keeps the link while loading or unavailable', () => {
    const loading = renderToStaticMarkup(<ResultsProgressView loading />);
    expect(loading).toContain('aria-busy="true"');
    expect(loading).toContain('href="/rewards"');
    const missing = renderToStaticMarkup(<ResultsProgressView progress={null} />);
    expect(missing).not.toContain('aria-busy');
    expect(missing).toContain('Your progress');
  });
});

describe('collections and the team picks', () => {
  const ids = (id: (typeof collections)[number]['id']) =>
    collectionGames(
      collections.find((item) => item.id === id)!,
      games,
    ).map((game) => game.id);
  it('lists the five rails in order, each with a library view behind See all', () => {
    expect(collections.map((item) => [item.title, item.preset])).toEqual([
      ['Quick with bots', { category: 'solo', players: 0 }],
      ['For teams', { category: 'teams', players: 0 }],
      ['Game night', { category: 'party', players: 0 }],
      ['Two players', { category: 'all', players: 2 }],
      ['On your own', { category: 'solo', players: 1 }],
    ]);
    for (const collection of collections) {
      const rail = collectionGames(collection, games);
      expect(rail.length).toBeGreaterThan(0);
      expect(rail.length).toBeLessThanOrEqual(12);
      expect(new Set(rail).size).toBe(rail.length);
      // Everything on a rail is in the view its See all opens.
      const all = findGames(games, '', collection.preset.players, collection.preset.category);
      for (const game of rail) expect(all).toContain(game);
    }
  });
  it('Quick with bots: bots supported and twenty minutes at most', () => {
    expect(ids('quick-bots').sort()).toEqual(
      ['blackjack', 'four-in-a-row', 'mancala', 'trio', 'uno'].sort(),
    );
    for (const id of ids('quick-bots')) {
      const game = games.find((item) => item.id === id)!;
      expect(game.botsSupported).toBe(true);
      expect(gameMinutes(game).longest).toBeLessThanOrEqual(20);
    }
  });
  it('Game night: party-shelf games that seat four or more', () => {
    const night = ids('game-night');
    expect(night).toEqual(expect.arrayContaining(['most-likely', 'hot-seat', 'spill-or-chill']));
    expect(night).toEqual(expect.arrayContaining(['uno', 'flip-7', 'six-nimmt', 'word-agents']));
    expect(night).not.toContain('secret-santa');
    for (const id of night)
      expect(games.find((item) => item.id === id)!.maxPlayers).toBeGreaterThanOrEqual(4);
  });
  it('Two players: only games two can play, the ones made for two first', () => {
    const two = ids('two-players');
    const made = games.filter((game) => game.minPlayers === 2 && game.maxPlayers === 2);
    expect(two.slice(0, made.length).sort()).toEqual(made.map((game) => game.id).sort());
    for (const id of two) {
      const game = games.find((item) => item.id === id)!;
      expect(game.minPlayers).toBeLessThanOrEqual(2);
      expect(game.maxPlayers).toBeGreaterThanOrEqual(2);
    }
  });
  it('On your own: the games that need nobody else', () => {
    expect(ids('solo').sort()).toEqual(['blackjack', 'roulette', 'slots', 'tarot']);
  });
  it('For teams is the documented allowlist, in order, with nothing unsuitable in it', () => {
    expect(categories).toContainEqual({ value: 'teams', label: 'For teams' });
    expect(teamGames).toEqual([
      'most-likely',
      'hot-seat',
      'word-agents',
      'uno',
      'flip-7',
      'six-nimmt',
      'trio',
      'skyjo',
      'secret-santa',
      'sea-salt-paper',
      'azul',
      'gem-market',
    ]);
    expect(ids('teams')).toEqual(teamGames);
    expect(findGames(games, '', 0, 'teams').map((game) => game.id)).toEqual(teamGames);
    expect(teamsNote).toBe('Picked for colleagues: no betting games, and drink prompts stay off unless you turn them on.');
    for (const id of teamGames) {
      const game = games.find((item) => item.id === id)!;
      expect(game, id).toBeDefined();
      // No casino tables, and nothing about drinks unless a host turns it on.
      expect(game.family).not.toBe('casino');
      for (const setting of game.settings)
        if (/sip|drink/i.test(`${setting.key} ${setting.label}`))
          expect(setting.default).toBe(false);
    }
    for (const out of [
      'spill-or-chill',
      'holdem',
      'teen-patti',
      'blackjack',
      'roulette',
      'slots',
      'the-gang',
      'shithead',
      'uno-no-mercy',
      'deal-no-mercy',
    ])
      expect(teamGames).not.toContain(out);
  });
  it('filters the team picks by group size', () => {
    const size = (value: 'small' | 'medium' | 'large') =>
      findGames(games, '', 0, 'teams', { size: value }).map((game) => game.id);
    expect(size('large')).toEqual([
      'most-likely',
      'hot-seat',
      'word-agents',
      'uno',
      'flip-7',
      'six-nimmt',
      'secret-santa',
    ]);
    expect(size('medium')).toEqual([
      'most-likely',
      'hot-seat',
      'word-agents',
      'uno',
      'flip-7',
      'six-nimmt',
      'trio',
      'skyjo',
      'secret-santa',
    ]);
    expect(size('small')).toEqual(teamGames);
    // An organiser's draw fits any group.
    expect(
      matchesTeamFilters(
        games.find((game) => game.id === 'secret-santa')!,
        { size: 'large' },
      ),
    ).toBe(true);
    expect(
      matchesTeamFilters(
        games.find((game) => game.id === 'azul')!,
        { size: 'medium' },
      ),
    ).toBe(false);
  });
  it('filters the team picks by time, alone and together with size', () => {
    const time = (value: 'quick' | 'standard', size?: 'small' | 'medium' | 'large') =>
      findGames(games, '', 0, 'teams', { time: value, size }).map((game) => game.id);
    expect(time('quick')).toEqual(['most-likely', 'hot-seat', 'uno', 'trio', 'secret-santa']);
    expect(time('standard')).toEqual(['word-agents', 'flip-7', 'skyjo', 'sea-salt-paper']);
    expect(time('standard', 'large')).toEqual(['word-agents', 'flip-7']);
    expect(time('quick', 'large')).toEqual(['most-likely', 'hot-seat', 'uno', 'secret-santa']);
    expect(gameMinutes({ minutes: '10–20' })).toEqual({ shortest: 10, longest: 20 });
    expect(gameMinutes({ minutes: '15' })).toEqual({ shortest: 15, longest: 15 });
    // Outside For teams the two filters are ignored.
    expect(findGames(games, '', 0, 'all', { size: 'large', time: 'quick' })).toHaveLength(
      games.length,
    );
  });
  it('still searches and intersects with the Players choice inside For teams', () => {
    expect(findGames(games, 'santa', 0, 'teams').map((game) => game.id)).toEqual(['secret-santa']);
    expect(findGames(games, 'poker', 0, 'teams')).toEqual([]);
    expect(
      findGames(games, '', 9, 'teams').every(
        (game) => game.maxPlayers >= 9 || game.id === 'secret-santa',
      ),
    ).toBe(true);
  });
});

describe('the home page around the library', () => {
  it('still lists every catalogue game exactly once in the default library view', () => {
    const html = renderToStaticMarkup(<GameLibrary />);
    const tiles = [...html.matchAll(/aria-label="Open ([^"]+)"/g)].map((match) =>
      match[1].replaceAll('&amp;', '&'),
    );
    expect(tiles.sort()).toEqual(games.map((game) => game.name).sort());
    expect(html.match(/class="game-tile"/g)).toHaveLength(games.length);
    expect(html).not.toContain('team-filters');
    expect(findGames(games, '', 0, 'all')).toHaveLength(games.length);
  });
  it('opens the library in the view a rail asked for, with the team filters inside For teams', () => {
    const teams = renderToStaticMarkup(<GameLibrary preset={{ category: 'teams', players: 0 }} />);
    expect(teams.match(/class="game-tile"/g)).toHaveLength(teamGames.length);
    expect(teams).toContain(teamsNote);
    expect(teams).toContain('role="group" aria-label="Group size"');
    expect(teams).toContain('role="group" aria-label="Time"');
    for (const label of ['2–4', '5–8', '9+', 'Under 15 min', '15–30 min'])
      expect(teams).toContain(`<button type="button" aria-pressed="false">${label}</button>`);
    expect(teams).toContain('<button type="button" aria-pressed="true">For teams</button>');
    const two = renderToStaticMarkup(<GameLibrary preset={{ category: 'all', players: 2 }} />);
    expect(two).toContain('<option value="2" selected="">2 people</option>');
    // Play solo still opens Solo + bots for one.
    const solo = renderToStaticMarkup(<GameLibrary initialSolo />);
    expect(solo).toContain('<button type="button" aria-pressed="true">Solo + bots</button>');
    expect(solo).toContain('href="/games/uno?mode=bots"');
  });
  it('draws rails with their own cards, so the library keeps the only "Open …" links', () => {
    const html = renderToStaticMarkup(<CollectionRails onSeeAll={noop} />);
    expect(html).not.toContain('class="game-tile"');
    expect(html).not.toContain('aria-label="Open ');
    for (const collection of collections) {
      expect(html).toContain(`>${collection.title}</h2>`);
      expect(html).toContain(`aria-label="See all: ${collection.title}"`);
      expect(html).toContain(`role="group" aria-label="${collection.title} games"`);
    }
    expect(html).toContain(teamsNote);
    // Every card says who and how long, in words and in its name.
    expect(html).toContain('aria-label="Uno, You + bots, 10–20 min"');
    expect(html).toContain('href="/games/uno?mode=bots"');
    expect(html).toContain('aria-label="Word Agents, 4–10 players, 15–30 min"');
    expect(html).toContain('aria-label="Secret Santa, Any group, 5–10 min"');
    expect(html).toContain('aria-label="Checkers, 2 players, 10–25 min"');
    expect(html).toContain('aria-label="Pop Tarot, Solo, 5–10 min"');
    const cards = html.match(/class="game-rail-tile"/g)!;
    expect(cards).toHaveLength(
      collections.reduce((total, item) => total + collectionGames(item, games).length, 0),
    );
  });
  it('names a rail card by game, players and length', () => {
    const html = renderToStaticMarkup(
      <GameTile
        variant="rail"
        name="Azul"
        subtitle="Draft tiles"
        minPlayers={2}
        maxPlayers={4}
        minutes="25–40"
        tone="sky"
        artwork={null}
        href="/games/azul"
      />,
    );
    expect(html).toContain('class="game-rail-tile"');
    expect(html).toContain('aria-label="Azul, 2–4 players, 25–40 min"');
    expect(html).toContain('2–4 players');
    expect(html).toContain('25–40 min');
  });
  it('offers Continue only for rooms in play or waiting, the match in progress first', () => {
    const rooms = [
      {
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Tile club',
        gameId: 'azul',
        status: 'lobby',
        players: 2,
      },
      {
        id: '33333333-3333-4333-8333-333333333333',
        name: 'Last game',
        gameId: 'holdem',
        status: 'finished',
        players: 2,
      },
      {
        id: '22222222-2222-4222-8222-222222222222',
        name: 'Friday table',
        gameId: 'uno',
        status: 'playing',
        players: 3,
      },
    ];
    expect(activeRooms(rooms).map((room) => room.name)).toEqual(['Friday table', 'Tile club']);
    const html = renderToStaticMarkup(<ContinueRail rooms={rooms} />);
    expect(html).toContain('>Continue</h2>');
    expect(html).toContain('aria-label="Continue Friday table, Uno"');
    expect(html).toContain('href="/games/uno/rooms/22222222-2222-4222-8222-222222222222"');
    expect(html).toContain('In progress');
    expect(html).not.toContain('Last game');
    // Its own card, so the Your games tab keeps the only "Open …" room links.
    expect(html).not.toContain('class="room-shortcut"');
    expect(renderToStaticMarkup(<ContinueRail rooms={[rooms[1]]} />)).toBe('');
  });
});

export type { Progress };
