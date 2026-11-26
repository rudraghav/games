import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { mapMe, mapProfile, mapRoom } from '@games/api-client/mappers';
import { mapProgress, frameIds, cardBackIds, type Progress } from '@games/api-client';
import type { components } from '@games/api-client/wire';
import { games } from '@games/api-client/catalog';
import {
  Avatar,
  GameTile,
  LevelRing,
  Menu,
  Seat,
  SegmentedTabs,
  Ticket,
  isAvatarFrame,
} from '@games/ui';
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
  teamGames,
  teamsNote,
} from '@/features/lounge/catalogue-search';
import { browseGames, occasionGames, occasions, quickBotPicks } from '@/features/lounge/occasions';
import { ContinueLine, gamesInProgress } from '@/features/lounge/ContinueLine';
import { GameLibrary } from '@/features/lounge/GameLibrary';
import { InvitationList } from '@/features/lounge/Invitations';
import { BadgeGrid } from '@/features/rewards/BadgeGrid';
import { RewardCoupon, removeLabel, rewardStateLabel } from '@/features/rewards/RewardCoupon';
import { RewardsView, rewardNotice } from '@/features/rewards/Rewards';
import { ResultsProgressView } from '@/features/room/ResultsProgress';
import { ProgressChipView } from '@/shared/ProgressChip';

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
      renderToStaticMarkup(<ProgressChipView progress={ended} />) +
      renderToStaticMarkup(<RewardsView progress={ended} player={player} onAction={noop} />) +
      renderToStaticMarkup(<ResultsProgressView progress={ended} />);
    expect(html).not.toMatch(/lost|broke|missed|ended|expired|hurry|last chance|claim now/i);
    expect(html).not.toContain('day streak');
    expect(html).toContain('Best: 9 days');
  });
});

describe('the header progress chip', () => {
  it('shows the level and the streak count as one link to /rewards', () => {
    const html = renderToStaticMarkup(<ProgressChipView progress={progress()} />);
    expect(html).toMatch(
      /^<a class="progress-chip" aria-label="Level 3, 4-day streak\. Open your progress and rewards" href="\/rewards">/,
    );
    // The ring repeats the number beside it, so it is decoration here.
    expect(html).toContain('class="level-ring level-ring--sm" aria-hidden="true"');
    // What is drawn: the ring's number, the level, the flame's day count. No XP, badges or nudge.
    expect(html.replace(/<svg.*?<\/svg>/g, '').replace(/<[^>]+>/g, '')).toBe('3Level 34');
  });
  it('drops the flame when there is no streak', () => {
    const html = renderToStaticMarkup(
      <ProgressChipView
        progress={progress({ streak: { current: 0, best: 6, played_today: false } })}
      />,
    );
    expect(html).toContain('aria-label="Level 3. Open your progress and rewards"');
    expect(html).not.toContain('streak');
    expect(html).not.toContain('progress-chip-streak');
  });
  it('shows nothing at all to someone who has never finished a game', () => {
    const fresh = progress({
      xp: 0,
      level: 1,
      level_xp: 0,
      next_level_xp: 50,
      totals: { games: 0, wins: 0, different_games: 0, with_friends: 0 },
    });
    expect(hasPlayedAGame(fresh)).toBe(false);
    expect(renderToStaticMarkup(<ProgressChipView progress={fresh} />)).toBe('');
    expect(renderToStaticMarkup(<ProgressChipView progress={null} />)).toBe('');
    expect(renderToStaticMarkup(<ProgressChipView />)).toBe('');
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

describe('occasions and the team picks', () => {
  const ids = (occasion: (typeof occasions)[number]['value']) =>
    occasionGames(occasion, games).map((game) => game.id);
  it('offers six occasions in one row, All first', () => {
    expect(occasions.map((item) => item.label)).toEqual([
      'All',
      'Quick with bots',
      'With friends',
      'Two players',
      'Solo',
      'For teams',
    ]);
    for (const { value } of occasions) {
      const shown = occasionGames(value, games);
      expect(shown.length).toBeGreaterThan(0);
      // No game twice, whatever is chosen.
      expect(new Set(shown).size).toBe(shown.length);
    }
  });
  it('All: every game once, in discovery order', () => {
    expect(ids('all')).toHaveLength(games.length);
    expect(new Set(ids('all')).size).toBe(games.length);
    expect(ids('all').slice(0, 4)).toEqual(['the-gang', 'shithead', 'sea-salt-paper', 'boop']);
    expect(ids('all')).toEqual(findGames(games, '', 0, 'all').map((game) => game.id));
  });
  it('Quick with bots: bots supported and twenty minutes at most, plus the quick-turn picks', () => {
    expect(ids('quick-bots').sort()).toEqual(
      ['blackjack', 'bluff', 'four-in-a-row', 'liars-dice', 'mancala', 'trio', 'uno'].sort(),
    );
    for (const id of ids('quick-bots')) {
      const game = games.find((item) => item.id === id)!;
      expect(game.botsSupported).toBe(true);
      if (!quickBotPicks.includes(id)) expect(gameMinutes(game).longest).toBeLessThanOrEqual(20);
    }
    expect(ids('quick-bots')).not.toContain('housie');
    expect(ids('quick-bots')).not.toContain('truth-or-dare');
  });
  it('With friends: party-shelf games that seat four or more', () => {
    const friends = ids('friends');
    expect(friends).toEqual(expect.arrayContaining(['most-likely', 'hot-seat', 'spill-or-chill']));
    expect(friends).toEqual(expect.arrayContaining(['uno', 'flip-7', 'six-nimmt', 'word-agents']));
    expect(friends).not.toContain('secret-santa');
    expect(friends).toEqual(
      expect.arrayContaining(['housie', 'truth-or-dare', 'liars-dice', 'bluff']),
    );
    for (const id of friends)
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
  it('Solo: the games that need nobody else', () => {
    expect(ids('solo').sort()).toEqual(['blackjack', 'roulette', 'slots', 'tarot']);
  });
  it('For teams is the documented allowlist, in order, with nothing unsuitable in it', () => {
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
      'housie',
    ]);
    expect(ids('teams')).toEqual(teamGames);
    expect(findGames(games, '', 0, 'teams').map((game) => game.id)).toEqual(teamGames);
    expect(teamsNote).toBe(
      'Picked for colleagues: no betting games, and drink prompts stay off unless you turn them on.',
    );
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
      // Personal prompts, and an 18+ edition behind a setting.
      'truth-or-dare',
    ])
      expect(teamGames).not.toContain(out);
  });
  it('has no second set of filters inside For teams', () => {
    // The team picks are the allowlist as it stands: nothing narrows it but the search box.
    expect(occasionGames('teams', games).map((game) => game.id)).toEqual(teamGames);
    expect(browseGames(games, '', 'teams').map((game) => game.id)).toEqual(teamGames);
    expect(gameMinutes({ minutes: '10–20' })).toEqual({ shortest: 10, longest: 20 });
    expect(gameMinutes({ minutes: '15' })).toEqual({ shortest: 15, longest: 15 });
    expect(categories).toContainEqual({ value: 'teams', label: 'For teams' });
  });
  it('searches inside the chosen occasion', () => {
    const found = (query: string, occasion: (typeof occasions)[number]['value'] = 'all') =>
      browseGames(games, query, occasion).map((game) => game.id);
    expect(found('santa', 'teams')).toEqual(['secret-santa']);
    expect(found('poker', 'teams')).toEqual([]);
    expect(found('uno', 'quick-bots')).toEqual(['uno']);
    expect(found('uno', 'solo')).toEqual([]);
    expect(found('', 'solo')).toEqual(ids('solo'));
    expect(found('   ')).toHaveLength(games.length);
    expect(found('not a game')).toEqual([]);
    // An ordinary typo still finds the game.
    expect(found('chekers')).toEqual(['checkers']);
  });
  it('finds kinds of game by searching, now that they are not filters', () => {
    const found = (query: string) => browseGames(games, query, 'all').map((game) => game.id);
    // Every game on the cards shelf, plus any whose own description says "cards".
    expect(found('cards')).toEqual(
      expect.arrayContaining(findGames(games, '', 0, 'cards').map((game) => game.id)),
    );
    expect(found('cards')).not.toContain('checkers');
    expect(found('casino').sort()).toEqual(
      ['blackjack', 'holdem', 'roulette', 'slots', 'teen-patti'].sort(),
    );
    expect(found('board games')).toEqual(
      expect.arrayContaining(['checkers', 'reversi', 'four-in-a-row', 'mancala', 'azul', 'boop']),
    );
    expect(found('board games')).not.toContain('uno');
    expect(found('party')).toEqual(
      expect.arrayContaining(['spill-or-chill', 'most-likely', 'hot-seat']),
    );
    expect(found('cooperative')).toEqual(['the-gang']);
    expect(found('co-op')[0]).toBe('the-gang');
    expect(found('poker')).toEqual(expect.arrayContaining(['holdem', 'teen-patti']));
    expect(found('bots')).toEqual(
      games
        .filter((game) => game.minPlayers === 1 || game.botsSupported)
        .map((game) => game.id)
        .sort((a, b) => found('').indexOf(a) - found('').indexOf(b)),
    );
  });
});

describe('the home library', () => {
  const tiles = (html: string) =>
    [...html.matchAll(/aria-label="Open ([^"]+)"/g)].map((match) =>
      match[1].replaceAll('&amp;', '&'),
    );
  it('lists every catalogue game exactly once by default, with nothing repeated around it', () => {
    const html = renderToStaticMarkup(<GameLibrary />);
    expect([...tiles(html)].sort()).toEqual(games.map((game) => game.name).sort());
    expect(html.match(/class="game-tile"/g)).toHaveLength(games.length);
    expect(html).toContain('<section id="games" class="game-library" aria-label="Games">');
    expect(html).toContain('role="group" aria-label="Occasion"');
    expect(html).toContain('<button type="button" aria-pressed="true">All</button>');
    for (const label of ['Quick with bots', 'With friends', 'Two players', 'Solo', 'For teams'])
      expect(html).toContain(`<button type="button" aria-pressed="false">${label}</button>`);
    // One row of six occasions and nothing else to choose from.
    expect(html.match(/aria-pressed=/g)).toHaveLength(6);
    // One featured game, first, and it is not listed a second time.
    expect(tiles(html)[0]).toBe('Pop Tarot');
    expect(tiles(html).slice(1, 5)).toEqual(['The Gang', 'Shithead', 'Sea Salt & Paper', 'boop.']);
    expect(html.match(/data-variant="featured"/g)).toHaveLength(1);
    expect(html.match(/>Featured</g)).toHaveLength(1);
    expect(html.match(/Start reading/g)).toHaveLength(1);
    for (const gone of [
      'team-filters',
      'See all',
      '<select',
      'Modern favourites',
      'Board games',
      'Solo + bots',
      'Reset filters',
      'game-rail-tile',
    ])
      expect(html).not.toContain(gone);
    expect(html).toContain('>34 games</p>');
  });
  it('features Pop Tarot only in the default view, and as an ordinary tile elsewhere', () => {
    const featured = renderToStaticMarkup(<GameLibrary />).match(
      /<a class="game-tile" data-edition="standard" data-variant="featured" aria-label="Open Pop Tarot" href="\/games\/tarot">.*?<\/a>/,
    )![0];
    // Its cover, then an eyebrow, the name, one line, the same quiet meta line, one action.
    expect(
      featured
        .slice(featured.indexOf('<div class="game-featured-body">'))
        .replace(/<svg.*?<\/svg>/g, ''),
    ).toBe(
      '<div class="game-featured-body">' +
        '<span class="eyebrow game-featured-label">Featured</span>' +
        '<h3 class="game-tile-name">Pop Tarot</h3>' +
        '<p class="game-featured-line">Choose three cards for a personal reading</p>' +
        '<p class="game-tile-meta">Solo · 5–10 min</p>' +
        '<span class="game-featured-action">Start reading </span>' +
        '</div></a>',
    );
    // The call to action is part of the one link, not a second control.
    expect(featured).not.toContain('<button');
    expect(featured.match(/<a /g)).toHaveLength(1);
    // Under any other occasion there is no featured card; Solo lists Pop Tarot as a tile.
    for (const occasion of ['quick-bots', 'friends', 'two-players', 'solo', 'teams'] as const) {
      const html = renderToStaticMarkup(<GameLibrary preset={occasion} />);
      expect(html).not.toContain('data-variant="featured"');
      expect(html).not.toContain('Featured');
      expect(html).not.toContain('Start reading');
    }
    const solo = renderToStaticMarkup(<GameLibrary preset="solo" />);
    expect(solo).toContain(
      '<h3 class="game-tile-name">Pop Tarot</h3><p class="game-tile-meta">Solo · 5–10 min</p></a>',
    );
    expect(solo.match(/aria-label="Open Pop Tarot"/g)).toHaveLength(1);
    // With All chosen, the order behind the featured card is plain discovery order.
    expect(occasionGames('all', games)[0].id).toBe('the-gang');
  });
  it('opens with the occasion it was asked for', () => {
    const quick = renderToStaticMarkup(<GameLibrary preset="quick-bots" />);
    expect(quick).toContain('<button type="button" aria-pressed="true">Quick with bots</button>');
    expect(tiles(quick).sort()).toEqual([
      'Blackjack',
      'Bluff',
      'Four in a Row',
      'Liar’s Dice',
      'Mancala',
      'Trio',
      'Uno',
    ]);
    // These open ready to play against bots, and say so.
    expect(quick).toContain('href="/games/uno?mode=bots"');
    expect(quick).toContain('You + bots · 10–20 min');
    expect(quick).toContain('1–7 players · 5–15 min');
    const all = renderToStaticMarkup(<GameLibrary />);
    expect(all).toContain('href="/games/uno"');
    expect(all).not.toContain('mode=bots');
  });
  it('shows the team note, and no second row of filters, only inside For teams', () => {
    const teams = renderToStaticMarkup(<GameLibrary preset="teams" />);
    expect(teams.match(/class="game-tile"/g)).toHaveLength(teamGames.length);
    expect(teams).toContain(`<p class="team-note">${teamsNote}</p>`);
    // One row of filters: the occasions. Group size and Time are gone.
    expect(teams.match(/role="group"/g)).toHaveLength(1);
    expect(teams).not.toContain('aria-label="Group size"');
    expect(teams).not.toContain('aria-label="Time"');
    for (const label of ['2–4', '5–8', '9+', 'Under 15 min', '15–30 min'])
      expect(teams).not.toContain(`>${label}</button>`);
    expect(teams).toContain('<button type="button" aria-pressed="true">For teams</button>');
    for (const occasion of ['all', 'quick-bots', 'friends', 'two-players', 'solo'] as const)
      expect(renderToStaticMarkup(<GameLibrary preset={occasion} />)).not.toContain(teamsNote);
  });
  it('draws a tile as a cover, a name and one quiet line', () => {
    const html = renderToStaticMarkup(
      <GameTile
        name="Azul"
        minPlayers={2}
        maxPlayers={4}
        minutes="25–40"
        tone="sky"
        artwork={null}
        href="/games/azul"
      />,
    );
    expect(html).toBe(
      '<a class="game-tile" data-edition="standard" aria-label="Open Azul" href="/games/azul">' +
        '<div class="game-poster" data-tone="sky"></div>' +
        '<h3 class="game-tile-name">Azul</h3>' +
        '<p class="game-tile-meta">2–4 players · 25–40 min</p></a>',
    );
    const line = (props: Partial<Parameters<typeof GameTile>[0]>) =>
      renderToStaticMarkup(
        <GameTile
          name="Game"
          minPlayers={2}
          maxPlayers={2}
          minutes="5–10"
          tone="sage"
          artwork={null}
          {...props}
        />,
      ).match(/game-tile-meta">([^<]+)</)![1];
    expect(line({})).toBe('2 players · 5–10 min');
    expect(line({ minPlayers: 1, maxPlayers: 1 })).toBe('Solo · 5–10 min');
    expect(line({ groupLabel: 'Any group' })).toBe('Any group · 5–10 min');
    expect(line({ soloMode: true })).toBe('You + bots · 5–10 min');
    // The featured layout keeps the same name, link and meta line.
    const featured = renderToStaticMarkup(
      <GameTile
        variant="featured"
        name="Azul"
        subtitle="Draft tiles"
        actionLabel="Play Azul"
        minPlayers={2}
        maxPlayers={4}
        minutes="25–40"
        tone="sky"
        artwork={null}
        href="/games/azul"
      />,
    );
    expect(featured).toContain(
      '<a class="game-tile" data-edition="standard" data-variant="featured" aria-label="Open Azul" href="/games/azul">',
    );
    expect(featured).toContain('<p class="game-tile-meta">2–4 players · 25–40 min</p>');
    expect(featured).toContain('<p class="game-featured-line">Draft tiles</p>');
    expect(featured).toContain('<span class="game-featured-action">Play Azul ');
    const library = renderToStaticMarkup(<GameLibrary />);
    expect(library).toContain('Any group · 5–10 min');
    // No blurb, arrow or badge on any tile.
    expect(library).not.toContain('tile-arrow');
    expect(library).not.toContain('Match colors and numbers');
  });
  it('offers Continue only for a game in progress: one line, the most recent, and a count', () => {
    const rooms = [
      {
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Tile club',
        gameId: 'azul',
        status: 'lobby',
      },
      {
        id: '22222222-2222-4222-8222-222222222222',
        name: 'Friday table',
        gameId: 'uno',
        status: 'playing',
      },
      {
        id: '33333333-3333-4333-8333-333333333333',
        name: 'Last game',
        gameId: 'holdem',
        status: 'finished',
      },
      {
        id: '44444444-4444-4444-8444-444444444444',
        name: 'Slow chess',
        gameId: 'checkers',
        status: 'playing',
      },
    ];
    expect(gamesInProgress(rooms).map((room) => room.name)).toEqual(['Friday table', 'Slow chess']);
    const html = renderToStaticMarkup(<ContinueLine rooms={rooms} onShowAll={noop} />);
    expect(html).toContain('<section class="continue-line" aria-label="Continue">');
    expect(html.match(/<a /g)).toHaveLength(1);
    expect(html).toContain('href="/games/uno/rooms/22222222-2222-4222-8222-222222222222"');
    expect(html.replace(/<svg.*?<\/svg>/g, '').replace(/<[^>]+>/g, '')).toBe(
      'Continue Friday table · Unoand 1 more',
    );
    const one = renderToStaticMarkup(<ContinueLine rooms={rooms.slice(0, 3)} onShowAll={noop} />);
    expect(one).not.toContain('more');
    expect(one).not.toContain('<button');
    // Waiting and finished rooms never reach the home view.
    expect(
      renderToStaticMarkup(<ContinueLine rooms={[rooms[0], rooms[2]]} onShowAll={noop} />),
    ).toBe('');
    expect(renderToStaticMarkup(<ContinueLine rooms={[]} onShowAll={noop} />)).toBe('');
  });
  it('keeps both tabs and their roles when they are drawn as quiet text', () => {
    const html = renderToStaticMarkup(
      <SegmentedTabs
        label="Browse"
        variant="text"
        heading={<h2>Browse games</h2>}
        value="games"
        onValueChange={noop}
        items={[
          { value: 'games', label: 'Games', content: 'library' },
          { value: 'rooms', label: 'Your games', content: 'rooms' },
        ]}
      />,
    );
    expect(html).toContain('class="segmented-tabs" data-variant="text"');
    // The section heading shares the row with the tabs, and comes first.
    expect(html).toMatch(
      /<div class="segmented-tabs-bar"><h2>Browse games<\/h2><div class="segmented-tabs-list" role="tablist" aria-label="Browse"/,
    );
    expect(html.match(/role="tab"/g)).toHaveLength(2);
    expect(html.match(/role="tabpanel"/g)).toHaveLength(2);
    expect(html).toMatch(/aria-selected="true"[^>]*>Games<\/button>/);
    expect(html).toMatch(/aria-selected="false"[^>]*>Your games<\/button>/);
    expect(
      renderToStaticMarkup(
        <SegmentedTabs
          label="x"
          value="a"
          onValueChange={noop}
          items={[{ value: 'a', label: 'A', content: null }]}
        />,
      ),
    ).toContain('data-variant="segmented"');
  });
});

describe('the header menu', () => {
  it('is a closed menu button until it is opened: named, and saying it has a menu', () => {
    const html = renderToStaticMarkup(
      <Menu
        label="More"
        icon={<span>…</span>}
        items={[
          { label: 'Create room', onSelect: noop },
          { label: 'Your games', onSelect: noop },
          { label: 'Progress and rewards', href: '/rewards' },
        ]}
      />,
    );
    expect(html).toMatch(
      /^<div class="menu" data-open="false"><button type="button" id="[^"]+-button"/,
    );
    expect(html).toContain('aria-label="More"');
    expect(html).toContain('aria-haspopup="menu"');
    expect(html).toContain('aria-expanded="false"');
    // Closed, there is no menu in the page and nothing it controls.
    expect(html).not.toContain('role="menu"');
    expect(html).not.toContain('aria-controls');
    expect(html).not.toContain('Create room');
  });
});

export type { Progress };
