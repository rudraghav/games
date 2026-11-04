'use client';
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { LayoutGroup, MotionConfig, motion } from 'motion/react';
import { Button, Hand, Modal, Seat, TokenArt, HorizontalRail } from '@games/ui';
import { blackjackDetails, holdemDetails, teenPattiDetails } from '@games/api-client';
import { playerName, type TableProps } from '../types';
import { CasinoActionCue, CasinoCardRow, CasinoChipFlights } from './CasinoMotion';
import { CasinoDock } from './CasinoDock';
import { casinoPhaseLabel } from './casino-transitions';
import { useCasinoMotion } from './useCasinoMotion';
import { blackjackValueLabel, visibleBlackjackValue } from './hand-value';
import {
  blackjackSeatHands,
  feltCue,
  holdemCall,
  namer,
  seatMoves,
  seatResult,
  winningCards,
} from './casino-guidance';
import { holdemPublic, teenPublic } from './casino-public';
import { livePotNames } from './casino-pots';
import { useMediaQuery } from '@/shared/use-media-query';

type Spot = [number, number];
// Crowded tables need distinct top, side and bottom bands, not equal ellipse angles.
// The stylesheet clamps every centre so a seat never rises out of the table.
const ringSeats: Record<number, Spot[]> = {
  2: [
    [50, 85],
    [50, 11],
  ],
  3: [
    [50, 85],
    [14, 30],
    [86, 30],
  ],
  4: [
    [50, 85],
    [9, 50],
    [50, 11],
    [91, 50],
  ],
  5: [
    [50, 85],
    [8, 52],
    [30, 18],
    [70, 18],
    [92, 52],
  ],
  6: [
    [35, 85],
    [8, 52],
    [35, 18],
    [65, 18],
    [92, 52],
    [65, 85],
  ],
  7: [
    [35, 85],
    [8, 52],
    [22, 18],
    [50, 18],
    [78, 18],
    [92, 52],
    [65, 85],
  ],
  8: [
    [50, 85],
    [20, 85],
    [8, 52],
    [20, 18],
    [50, 18],
    [80, 18],
    [92, 52],
    [80, 85],
  ],
  9: [
    [50, 85],
    [25, 85],
    [8, 52],
    [17, 18],
    [39, 18],
    [61, 18],
    [83, 18],
    [92, 52],
    [75, 85],
  ],
};
// The Blackjack dealer owns the top centre of the felt, so players sit in an arc
// around the sides and bottom, still clockwise from the viewer.
const dealerSeats: Record<number, Spot[]> = {
  1: [[50, 86]],
  2: [
    [36, 86],
    [64, 86],
  ],
  3: [
    [50, 86],
    [10, 50],
    [90, 50],
  ],
  4: [
    [35, 86],
    [9, 50],
    [91, 50],
    [65, 86],
  ],
  5: [
    [50, 86],
    [10, 62],
    [19, 18],
    [81, 18],
    [90, 62],
  ],
  6: [
    [35, 86],
    [8, 60],
    [18, 18],
    [82, 18],
    [92, 60],
    [65, 86],
  ],
  7: [
    [50, 86],
    [23, 84],
    [7, 52],
    [17, 17],
    [83, 17],
    [93, 52],
    [77, 84],
  ],
};

function seatSpot(game: string, count: number, index: number): Spot {
  const spot = (game === 'blackjack' ? dealerSeats : ringSeats)[count]?.[index];
  if (spot) return spot;
  const angle = (index / count) * Math.PI * 2 + Math.PI / 2;
  return [50 + 40 * Math.cos(angle), 50 + 32 * Math.sin(angle)];
}

/** Small blind and big blind seats, from the public button and seat order. */
function blinds(match: TableProps['match']) {
  if (match.id !== 'holdem' || match.phase !== 'preflop') return {};
  const ids = match.players.map((player) => player.id);
  const button = ids.indexOf(String(match.detail.button));
  if (button < 0) return {};
  const at = (offset: number) => ids[(button + offset) % ids.length];
  return ids.length === 2
    ? { [at(0)]: 'SB', [at(1)]: 'BB' }
    : ({ [at(1)]: 'SB', [at(2)]: 'BB' } as Record<string, string>);
}

export function CasinoTable(props: TableProps) {
  const { match, room, selfId } = props;
  const [inspectedPlayer, setInspectedPlayer] = useState<string | null>(null);
  const inspected = match.players.find((player) => player.id === inspectedPlayer);
  const inspectedCards = inspected?.cards.filter((card) => card !== null) ?? [];
  const inspectedHands = inspected ? blackjackSeatHands(match, inspected.id) : [];
  const instance = useId();
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const event = useCasinoMotion(room, match, selfId, reduced);
  const canvas = useRef<HTMLDivElement>(null);
  const pot = useRef<HTMLDivElement>(null);
  const seats = useRef<Record<string, HTMLDivElement | null>>({});
  const hands = useRef<HTMLDivElement>(null);
  const blackjack = match.id === 'blackjack' ? blackjackDetails(match.detail) : null;
  const holdem = match.id === 'holdem' ? holdemDetails(match.detail) : null;
  const teenPatti = match.id === 'teen-patti' ? teenPattiDetails(match.detail) : null;
  const teen = match.id === 'teen-patti' ? teenPublic(match) : null;
  const finished = match.phase === 'finished';
  const who = namer(room, selfId);
  const callAmount = holdemCall(match, selfId);
  const activeHand =
    match.phase === 'playing' && match.currentPlayer === selfId ? blackjack?.activeHand : null;
  const wager = teenPatti ? match.actions.find((option) => option.value.type === 'bet') : undefined;
  const showOwnHand = blackjack ? blackjack.hands.length > 0 : match.hand.length > 0;
  const viewer = Math.max(
    0,
    match.players.findIndex((player) => player.id === selfId),
  );
  const players = [...match.players.slice(viewer), ...match.players.slice(0, viewer)];
  const action = room.lastAction?.version === room.matchVersion ? room.lastAction : null;
  const cue = feltCue(room, match, selfId);
  const moves = finished ? {} : seatMoves(room, match);
  const winning = winningCards(match);
  const blindSeats = blinds(match);
  // Sideshow parties are marked on the table, not only named in the dock.
  const sideshowRoles: Record<string, string> = teenPatti?.sideshow
    ? {
        [teenPatti.sideshow.actor]: 'Asked for sideshow',
        [teenPatti.sideshow.target]: 'Sideshow decision',
      }
    : teenPatti?.sideshow_target
      ? { [teenPatti.sideshow_target]: 'Your sideshow pick' }
      : {};
  const potWinners = match.winners.map((id) => who(id)).join(' and ');
  const dealerValue = blackjack ? visibleBlackjackValue(match.community) : null;
  const dealerNote = !blackjack
    ? null
    : !match.community.length
      ? null
      : blackjack.dealerHidden
        ? match.community.length === 1 && match.community[0].value === 'A'
          ? 'Dealer shows an ace'
          : `Visible dealer total ${blackjackValueLabel(match.community)}`
        : dealerValue && match.community.length === 2 && dealerValue.total === 21
          ? 'Dealer has blackjack'
          : dealerValue && dealerValue.total > 21
            ? `Dealer busts · ${dealerValue.total}`
            : `Dealer total ${blackjackValueLabel(match.community)}`;
  const spring =
    event && !reduced ? { type: 'spring' as const, stiffness: 380, damping: 34 } : { duration: 0 };
  useEffect(() => {
    const row = hands.current?.querySelector<HTMLElement>('.blackjack-hands');
    const active = row?.querySelector<HTMLElement>('[data-active="true"]');
    if (!row || !active) return;
    const viewport = row.getBoundingClientRect();
    const hand = active.getBoundingClientRect();
    if (hand.left >= viewport.left && hand.right <= viewport.right) return;
    row.scrollTo({
      left: row.scrollLeft + hand.left - viewport.left,
      behavior: event && !reduced ? 'smooth' : 'auto',
    });
  }, [activeHand, event, reduced]);
  const livePots = holdem && !finished ? holdemPublic(match).live_pots : [];
  const liveNames = livePotNames(livePots);
  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
      <LayoutGroup id={`casino-${instance}`}>
        <div
          className="table-layout stable-game-table casino-layout"
          data-phase={match.phase}
          data-game={match.id}
          data-casino-version={room.matchVersion}
          ref={canvas}
        >
          <div className="casino-table" data-players={players.length} data-game={match.id}>
            <div className="casino-felt">
              <span className="table-watermark" aria-hidden="true">
                g.
              </span>
              <div className="casino-felt-head">
                <div className="casino-table-meta">
                  <span className="eyebrow">
                    {match.id === 'blackjack' ? 'Dealer' : casinoPhaseLabel(match.id, match.phase)}
                  </span>
                  {match.id === 'blackjack' ? (
                    <span className="casino-payout-note">Blackjack pays 3:2</span>
                  ) : null}
                  {teenPatti && !finished ? (
                    <span className="casino-payout-note">
                      Stake {teenPatti.stake} · blind {teenPatti.stake}–
                      {Math.min(teenPatti.stake * 2, 64)} · seen {teenPatti.stake * 2}–
                      {Math.min(teenPatti.stake * 4, 128)}
                    </span>
                  ) : null}
                </div>
                <div className="casino-pot-anchor" ref={pot}>
                  <motion.div
                    layout="position"
                    transition={{ layout: spring }}
                    className="pot"
                    aria-label={
                      blackjack
                        ? finished
                          ? 'All wagers settled against the dealer'
                          : 'Main hand wagers, including split and doubled bets'
                        : finished
                          ? `Pot: ${match.pot} chips${potWinners ? `, won by ${potWinners}` : ''}`
                          : `Pot: ${match.pot} chips`
                    }
                  >
                    <span className="casino-chip-stack" aria-hidden="true">
                      <TokenArt kind="poker" />
                      {(
                        blackjack ? match.players.some((player) => player.bet > 0) : match.pot > 0
                      ) ? (
                        <TokenArt kind="poker" />
                      ) : null}
                      {!blackjack && match.pot >= 20 ? <TokenArt kind="poker" /> : null}
                    </span>
                    <motion.strong
                      key={blackjack ? 'wagers' : match.pot}
                      initial={event?.potChanged && !reduced ? { opacity: 0.4, y: 2 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: event && !reduced ? 0.18 : 0 }}
                    >
                      {blackjack
                        ? match.players.reduce((total, player) => total + player.bet, 0)
                        : match.pot}
                    </motion.strong>
                    <span>
                      {blackjack
                        ? finished
                          ? 'wagers settled'
                          : 'hand bets'
                        : finished
                          ? potWinners
                            ? `won by ${potWinners}`
                            : 'settled'
                          : 'in the pot'}
                    </span>
                  </motion.div>
                </div>
              </div>
              {match.community.length || match.detail.dealer_hidden ? (
                <CasinoCardRow
                  cards={[...match.community, ...(match.detail.dealer_hidden ? [null] : [])]}
                  group="community"
                  event={event}
                  label={blackjack ? 'Dealer cards' : 'Community cards'}
                  compact
                  className="community-cards"
                  highlight={winning}
                />
              ) : null}
              {dealerNote ? <span className="casino-dealer-total">{dealerNote}</span> : null}
              <CasinoActionCue
                actor={cue?.actor ?? null}
                label={cue?.text ?? ''}
                cueKey={`${room.matchId}:${action?.version}:${match.phase}`}
                event={event}
              />
            </div>
            <div className="casino-seats">
              {players.map((player, index) => {
                const member = room.members.find((item) => item.id === player.id);
                const [x, y] = seatSpot(match.id, players.length, index);
                const style = { '--seat-x': `${x}%`, '--seat-y': `${y}%` } as CSSProperties;
                const publicCards = player.cards.filter((card) => card !== null);
                const cards =
                  player.id === selfId && !player.cards.length ? match.hand : publicCards;
                const current = !finished && match.currentPlayer === player.id;
                const winner = finished && match.winners.includes(player.id);
                const result = seatResult(match, player.id);
                const grouped = blackjack ? blackjackSeatHands(match, player.id) : [];
                const split = grouped.length > 1;
                const role = sideshowRoles[player.id];
                const out = teen?.out_reasons[player.id];
                const status = player.folded
                  ? out === 'lost_sideshow'
                    ? 'Lost sideshow'
                    : out === 'lost_show'
                      ? 'Lost show'
                      : teenPatti
                        ? 'Packed'
                        : 'Folded'
                  : holdem && !player.chips
                    ? 'All in'
                    : moves[player.id];
                const caption = result
                  ? result.caption
                  : [
                      teenPatti && player.id in teenPatti.seen && !player.folded
                        ? teenPatti.seen[player.id]
                          ? 'Seen'
                          : 'Blind'
                        : null,
                      `${player.chips ?? 0} chips`,
                      status,
                    ]
                      .filter(Boolean)
                      .join(' · ');
                // Folded hands are mucked: no backs stay on the table.
                const showCards =
                  (player.id !== selfId || !showOwnHand) &&
                  !(player.folded && !publicCards.length) &&
                  (cards.length > 0 || player.count > 0);
                const single = blackjack && !split && publicCards.length ? grouped[0] : null;
                return (
                  <div
                    className="casino-seat"
                    style={style}
                    key={player.id}
                    data-player-id={player.id}
                    data-folded={player.folded}
                    data-current={current}
                    data-winner={winner}
                    data-revealed={!blackjack && publicCards.length > 0}
                    data-sideshow={role ? 'true' : undefined}
                  >
                    <div
                      className="casino-seat-surface"
                      ref={(node) => {
                        seats.current[player.id] = node;
                      }}
                    >
                      {current ? (
                        <motion.span
                          className="casino-turn-halo"
                          layoutId="current-player"
                          initial={false}
                          transition={spring}
                          aria-hidden="true"
                        />
                      ) : null}
                      <Seat
                        name={member?.name || 'Player'}
                        you={player.id === selfId}
                        avatar={member?.avatar}
                        bot={member?.isBot}
                        compact
                        nameLayout="wrap"
                        connected={member?.connected ?? false}
                        active={current}
                        caption={caption}
                      />
                      {match.id === 'holdem' && match.detail.button === player.id ? (
                        <span className="casino-dealer-button" aria-label="Dealer button">
                          <TokenArt kind="ivory" />
                          <b>D</b>
                        </span>
                      ) : null}
                    </div>
                    {role ? (
                      <span className="casino-seat-flag" data-flag="sideshow">
                        {role}
                      </span>
                    ) : null}
                    {split && showCards ? (
                      <div className="casino-seat-hands" role="group" aria-label="Player hands">
                        {grouped.map((hand, handIndex) => (
                          <div className="casino-seat-hand" key={handIndex}>
                            <CasinoCardRow
                              cards={hand.cards.slice(0, 3)}
                              group={`seat-${player.id}-${handIndex}`}
                              event={event}
                              label={`Hand ${handIndex + 1}`}
                              compact
                              className="seat-cards"
                            />
                            <span className="casino-seat-total">
                              {hand.total > 21 ? `Bust ${hand.total}` : hand.total}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : showCards ? (
                      <CasinoCardRow
                        cards={
                          cards.length
                            ? cards.slice(0, 3)
                            : Array.from({ length: player.count }, () => null)
                        }
                        group={`seat-${player.id}`}
                        event={event}
                        label="Player cards"
                        compact
                        className="seat-cards"
                        highlight={winning}
                      />
                    ) : null}
                    {single && player.id !== selfId ? (
                      <span className="casino-seat-total">
                        {single.total > 21
                          ? `Bust ${single.total}`
                          : single.cards.length === 2 && single.total === 21
                            ? 'Blackjack'
                            : `Total ${single.soft ? 'soft ' : ''}${single.total}`}
                      </span>
                    ) : null}
                    {player.id !== selfId &&
                    (split ? grouped.some((hand) => hand.cards.length > 3) : cards.length > 3) ? (
                      <Button
                        className="casino-public-cards-trigger"
                        size="sm"
                        variant="secondary"
                        aria-label={`Inspect ${playerName(room, player.id)}'s ${cards.length} public cards`}
                        onClick={() => setInspectedPlayer(player.id)}
                      >
                        {split ? `${grouped.length} hands` : `${cards.length} cards`} · Inspect
                      </Button>
                    ) : null}
                    {result ? (
                      // A seat that folded without losing chips has no result to show.
                      result.chip === '0' && player.folded ? null : (
                        <span className="seat-bet casino-seat-result" data-tone={result.tone}>
                          {result.chip}
                        </span>
                      )
                    ) : player.bet > 0 ? (
                      <motion.span
                        className="seat-bet"
                        key={`bet-${player.bet}`}
                        initial={
                          event && action?.actorId === player.id && !reduced
                            ? { opacity: 0.4, y: 3 }
                            : false
                        }
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: event && !reduced ? 0.18 : 0 }}
                      >
                        <TokenArt kind="poker" />
                        {player.bet}
                        {blindSeats[player.id] ? (
                          <span className="casino-blind-marker">{blindSeats[player.id]}</span>
                        ) : null}
                      </motion.span>
                    ) : teen?.paid && !finished && !player.folded ? (
                      <span className="seat-bet casino-seat-paid">
                        <TokenArt kind="poker" />
                        {teen.paid[player.id] ?? 0} in
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="casino-controls">
            <div className="private-hand casino-own-cards" data-empty={!showOwnHand}>
              <div className="hand-heading">
                <h3>{blackjack ? 'Your hands' : 'Your cards'}</h3>
                {holdem && !finished ? (
                  <span className="small muted">
                    Bet {holdem.currentBet}
                    {match.actions.some((option) => option.value.type === 'call')
                      ? ` · Call ${callAmount}`
                      : ''}{' '}
                    chips
                  </span>
                ) : null}
                {teenPatti && !finished && !match.players.find((p) => p.id === selfId)?.folded ? (
                  <span className="small muted">
                    {teenPatti.blind ? 'Blind' : 'Seen'} · Stake {teenPatti.stake}
                    {wager ? ` · Wager ${wager.minimum}–${wager.maximum}` : ''}
                  </span>
                ) : null}
              </div>
              {teen?.own_evaluation && showOwnHand ? (
                <p className="casino-own-evaluation">
                  <span>Your hand</span> <strong>{teen.own_evaluation.description}</strong>
                </p>
              ) : null}
              {!showOwnHand ? (
                <p className="small muted casino-hand-placeholder">
                  {finished
                    ? 'This hand is complete.'
                    : teen?.out_reasons[selfId] === 'lost_sideshow'
                      ? 'You lost the sideshow, so you’re out of this hand.'
                      : match.id === 'teen-patti' && match.detail.blind
                        ? 'Playing blind. Your cards stay hidden until you choose to look.'
                        : 'Your cards will appear here after betting.'}
                </p>
              ) : blackjack ? (
                <div ref={hands} data-hands={blackjack.hands.length}>
                  <HorizontalRail
                    label="Your blackjack hands"
                    navigationPosition="below"
                    navigationLabel="blackjack hands"
                    viewportClassName="blackjack-hands"
                    contentClassName="blackjack-hands-row"
                  >
                    {blackjack.hands.map((hand, index) => {
                      const settlement = hand.settlement;
                      const value = visibleBlackjackValue(hand.cards);
                      const natural =
                        settlement?.natural ??
                        (blackjack.hands.length === 1 &&
                          hand.cards.length === 2 &&
                          value?.total === 21);
                      const outcome = settlement
                        ? settlement.outcome === 'blackjack'
                          ? `Blackjack ${signed(settlement.net)}`
                          : settlement.outcome === 'push'
                            ? 'Push'
                            : (value?.total ?? 0) > 21
                              ? `Bust ${signed(settlement.net)}`
                              : `${settlement.outcome === 'win' ? 'Win' : 'Loss'} ${signed(settlement.net)}`
                        : null;
                      return (
                        <motion.section
                          className="blackjack-hand"
                          data-active={activeHand === index}
                          data-outcome={settlement?.outcome}
                          key={hand.cards[0]?.id || index}
                          layout="position"
                          transition={{ layout: spring }}
                          aria-label={`Hand ${index + 1}${activeHand === index ? ', active' : ''}`}
                        >
                          <p>
                            <strong>
                              Hand {index + 1}
                              {activeHand === index ? ' · active' : ''}
                            </strong>
                            <span>{hand.bet} chips bet</span>
                          </p>
                          <p className="blackjack-hand-value">
                            Total {blackjackValueLabel(hand.cards)}
                          </p>
                          {outcome || (natural && !settlement) ? (
                            <span
                              className="blackjack-hand-result"
                              data-tone={
                                !settlement
                                  ? 'win'
                                  : settlement.net > 0
                                    ? 'win'
                                    : settlement.net < 0
                                      ? 'loss'
                                      : 'push'
                              }
                            >
                              {outcome ?? 'Blackjack'}
                            </span>
                          ) : null}
                          {/* Cards fan inside the frame: every card's corner stays in view. */}
                          <CasinoCardRow
                            cards={hand.cards}
                            group={`own-${index}`}
                            event={event}
                            label={`Cards in hand ${index + 1}`}
                            compact
                            className="blackjack-fan"
                          />
                        </motion.section>
                      );
                    })}
                  </HorizontalRail>
                </div>
              ) : (
                <CasinoCardRow
                  cards={match.hand}
                  group="own"
                  event={event}
                  label="Your hand"
                  hand
                  highlight={winning}
                />
              )}
            </div>
            <div className="casino-decision-shell">
              <CasinoDock {...props} />
            </div>
          </div>
          {holdem && !finished && livePots.length ? (
            <details className="game-information-settlement casino-pot-details">
              <summary>
                {livePots.length > 1 ? 'Pots and who can win them' : 'Pot and contributions'}
              </summary>
              <p className="small">
                {Object.entries(holdem.contributions)
                  .map(([id, amount]) => `${who(id, true)} ${amount}`)
                  .join(' · ')}
              </p>
              <ul>
                {livePots.map((layer, i) => (
                  <li key={i}>
                    <strong>
                      {liveNames[i]}: {layer.amount} chips
                    </strong>
                    <span>
                      {livePots.length > 1
                        ? `${layer.eligible.map((id) => who(id, true)).join(', ')} can win it${
                            layer.all_in.length
                              ? ` (${layer.all_in.map((id) => who(id, true)).join(', ')} all in)`
                              : ''
                          }`
                        : 'Everyone still in the hand can win it.'}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
          <CasinoChipFlights event={event} canvas={canvas} pot={pot} seats={seats} />
          <Modal
            open={Boolean(inspected)}
            onOpenChange={(open) => !open && setInspectedPlayer(null)}
            title={`${inspected ? playerName(room, inspected.id) : 'Player'} · public cards`}
          >
            {inspected && inspectedHands.length > 1 ? (
              <div className="casino-inspect-hands">
                {inspectedHands.map((hand, index) => (
                  <section key={index} aria-label={`Hand ${index + 1}`}>
                    <h3 className="small">
                      Hand {index + 1} · {hand.bet} chips bet ·{' '}
                      {hand.total > 21 ? `Bust ${hand.total}` : `Total ${hand.total}`}
                    </h3>
                    <Hand
                      cards={hand.cards}
                      label={`${playerName(room, inspected.id)}'s hand ${index + 1}`}
                    />
                  </section>
                ))}
              </div>
            ) : inspected ? (
              <Hand
                cards={inspectedCards}
                label={`${playerName(room, inspected.id)}'s public cards`}
              />
            ) : null}
          </Modal>
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}

const signed = (value: number) => (value > 0 ? `+${value}` : value < 0 ? `−${-value}` : '±0');
