'use client';
import { useEffect, useId, useRef, type CSSProperties } from 'react';
import { LayoutGroup, MotionConfig, motion } from 'motion/react';
import { Seat, TokenArt, HorizontalRail } from '@games/ui';
import { blackjackDetails, holdemDetails, teenPattiDetails } from '@games/api-client';
import { ActionPanel } from '../shared/ActionPanel';
import { playerName, type TableProps } from '../types';
import { CasinoActionCue, CasinoCardRow, CasinoChipFlights } from './CasinoMotion';
import { casinoActionLabel, casinoPhaseLabel } from './casino-transitions';
import { useCasinoMotion } from './useCasinoMotion';
import { blackjackValueLabel } from './hand-value';
import { useMediaQuery } from '@/shared/use-media-query';

// Crowded tables need distinct top, side and bottom bands, not equal ellipse angles.
const crowdedSeats: Record<number, [number, number][]> = {
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
    [20, 18],
    [50, 18],
    [80, 18],
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

export function CasinoTable(props: TableProps) {
  const { match, room, selfId } = props;
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
  const own = match.players.find((player) => player.id === selfId);
  const callAmount =
    holdem && own ? Math.min(Math.max(0, holdem.currentBet - own.bet), own.chips || 0) : 0;
  const activeHand =
    match.phase === 'playing' && match.currentPlayer === selfId ? blackjack?.activeHand : null;
  const wager = teenPatti ? match.actions.find((option) => option.value.type === 'bet') : undefined;
  const instruction = teenPatti?.sideshow
    ? `${playerName(room, teenPatti.sideshow.actor)} paid ${teenPatti.sideshow.cost} chips to request a sideshow with ${playerName(room, teenPatti.sideshow.target)}. Accept compares these two hands privately; the weaker hand folds. Decline continues play.`
    : teenPatti?.sideshow_target
      ? `Sideshow with ${playerName(room, teenPatti.sideshow_target)} costs ${teenPatti.sideshow_cost} chips. They may accept or decline.`
      : blackjack && activeHand !== null && activeHand !== undefined
        ? `Playing hand ${activeHand + 1} of ${blackjack.hands.length}. Hit, stand or double applies to this hand.`
        : match.phase === 'insurance' && blackjack
          ? 'Insurance is a separate wager. It pays 2:1 if the dealer has blackjack; your hand wager is settled separately.'
          : undefined;
  const showOwnHand = blackjack ? blackjack.hands.length > 0 : match.hand.length > 0;
  const viewer = Math.max(
    0,
    match.players.findIndex((player) => player.id === selfId),
  );
  const players = [...match.players.slice(viewer), ...match.players.slice(0, viewer)];
  const action = room.lastAction?.version === room.matchVersion ? room.lastAction : null;
  const actionLabel = action
    ? `${playerName(room, action.actorId)} · ${casinoActionLabel(match.id, action.type)}${action.amount ? ` ${action.amount}` : ''}`
    : '';
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
  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
      <LayoutGroup id={`casino-${instance}`}>
        <div
          className="table-layout stable-game-table casino-layout"
          data-phase={match.phase}
          data-casino-version={room.matchVersion}
          ref={canvas}
        >
          <div className="casino-table" data-players={players.length}>
            <div className="casino-felt">
              <span className="table-watermark" aria-hidden="true">
                g.
              </span>
              <div className="casino-table-meta">
                <span className="eyebrow">
                  {match.id === 'blackjack' ? 'Dealer' : casinoPhaseLabel(match.id, match.phase)}
                </span>
                {match.id === 'blackjack' ? (
                  <span className="casino-payout-note">Blackjack pays 3:2</span>
                ) : null}
                {blackjack && match.community.length ? (
                  <span className="casino-payout-note">
                    {blackjack.dealerHidden ? 'Visible dealer total' : 'Dealer total'}{' '}
                    {blackjackValueLabel(match.community)}
                  </span>
                ) : null}
              </div>
              {match.community.length || match.detail.dealer_hidden ? (
                <CasinoCardRow
                  cards={[...match.community, ...(match.detail.dealer_hidden ? [null] : [])]}
                  group="community"
                  event={event}
                  label={blackjack ? 'Dealer cards' : 'Community cards'}
                  compact
                  className="community-cards"
                />
              ) : null}
              <div className="casino-pot-anchor" ref={pot}>
                <motion.div
                  layout="position"
                  transition={{ layout: spring }}
                  className="pot"
                  aria-label={
                    blackjack
                      ? 'Main hand wagers, including split and doubled bets'
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
                  <span>{blackjack ? 'hand bets' : 'in the pot'}</span>
                </motion.div>
              </div>
              <CasinoActionCue
                label={actionLabel}
                cueKey={`${room.matchId}:${action?.version}`}
                event={event}
              />
            </div>
            <div className="casino-seats">
              {players.map((player, index) => {
                const member = room.members.find((item) => item.id === player.id);
                const angle = (index / players.length) * Math.PI * 2 + Math.PI / 2;
                const [x, y] = crowdedSeats[players.length]?.[index] ?? [
                  50 + 40 * Math.cos(angle),
                  48 + 37 * Math.sin(angle),
                ];
                const style = { '--seat-x': `${x}%`, '--seat-y': `${y}%` } as CSSProperties;
                const cards =
                  player.id === selfId && !player.cards.length ? match.hand : player.cards;
                const current = match.phase !== 'finished' && match.currentPlayer === player.id;
                const winner = match.phase === 'finished' && match.winners.includes(player.id);
                return (
                  <div
                    className="casino-seat"
                    style={style}
                    key={player.id}
                    data-player-id={player.id}
                    data-folded={player.folded}
                    data-current={current}
                    data-winner={winner}
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
                        connected={member?.connected ?? false}
                        active={current}
                        caption={`${winner ? 'Won · ' : ''}${player.folded ? 'Folded' : `${teenPatti && player.id in teenPatti.seen ? `${teenPatti.seen[player.id] ? 'Seen' : 'Blind'} · ` : ''}${player.chips ?? 0} chips`}`}
                      />
                      {match.id === 'holdem' && match.detail.button === player.id ? (
                        <span className="casino-dealer-button" aria-label="Dealer button">
                          <TokenArt kind="ivory" />
                          <b>D</b>
                        </span>
                      ) : null}
                    </div>
                    {(player.id !== selfId || !showOwnHand) &&
                    (cards.length > 0 || player.count > 0) ? (
                      <CasinoCardRow
                        cards={
                          cards.length ? cards : Array.from({ length: player.count }, () => null)
                        }
                        group={`seat-${player.id}`}
                        event={event}
                        label="Player cards"
                        compact
                        className="seat-cards"
                      />
                    ) : null}
                    {player.bet > 0 ? (
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
                      </motion.span>
                    ) : null}
                    {event?.actorId === player.id && action ? (
                      <motion.span
                        className="casino-seat-action"
                        key={event.key}
                        initial={!reduced ? { opacity: 0, y: 3 } : false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: reduced ? 0 : 0.16 }}
                      >
                        {casinoActionLabel(match.id, action.type)}
                        {action.amount ? ` ${action.amount}` : ''}
                      </motion.span>
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
                {holdem && match.phase !== 'finished' ? (
                  <span className="small muted">
                    Bet {holdem.currentBet}
                    {match.actions.some((option) => option.value.type === 'call')
                      ? ` · Call ${callAmount}`
                      : ''}{' '}
                    chips
                  </span>
                ) : null}
                {teenPatti && match.phase !== 'finished' ? (
                  <span className="small muted">
                    {teenPatti.blind ? 'Blind' : 'Seen'} · Stake {teenPatti.stake}
                    {wager
                      ? ` · Wager ${wager.minimum}–${wager.maximum} chips${teenPatti.blind ? '' : ', even amounts'}`
                      : ''}
                  </span>
                ) : null}
              </div>
              {!showOwnHand ? (
                <p className="small muted casino-hand-placeholder">
                  {match.phase === 'finished'
                    ? 'This hand is complete.'
                    : match.id === 'teen-patti' && match.detail.blind
                      ? 'Playing blind. Your cards stay hidden until you choose to look.'
                      : 'Your cards will appear here after betting.'}
                </p>
              ) : blackjack ? (
                <div ref={hands}>
                  <HorizontalRail
                    label="Your blackjack hands"
                    navigationLabel="blackjack hands"
                    viewportClassName="blackjack-hands"
                    contentClassName="blackjack-hands-row"
                  >
                    {blackjack.hands.map((hand, index) => (
                      <motion.section
                        className="blackjack-hand"
                        data-active={activeHand === index}
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
                        <CasinoCardRow
                          cards={hand.cards}
                          group={`own-${index}`}
                          event={event}
                          label={`Cards in hand ${index + 1}`}
                          compact
                          hand
                        />
                      </motion.section>
                    ))}
                  </HorizontalRail>
                </div>
              ) : (
                <CasinoCardRow
                  cards={match.hand}
                  group="own"
                  event={event}
                  label="Your hand"
                  hand
                />
              )}
            </div>
            <div className="casino-decision-shell">
              <ActionPanel {...props} dockSize="extended" instruction={instruction} />
            </div>
          </div>
          {holdem && match.phase !== 'finished' && holdem.livePots.length ? (
            <details className="game-information-settlement">
              <summary>Contributions and pot eligibility</summary>
              <p className="small">
                {Object.entries(holdem.contributions)
                  .map(([id, amount]) => `${playerName(room, id)} ${amount}`)
                  .join(' · ')}
              </p>
              <ul>
                {holdem.livePots.map((layer, i) => (
                  <li key={i}>
                    <strong>{layer.amount} chips</strong>
                    <span>
                      {layer.refund_to
                        ? `Unmatched so far: ${playerName(room, layer.refund_to)}`
                        : `Eligible: ${layer.eligible.map((id) => playerName(room, id)).join(', ')}`}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
          <CasinoChipFlights event={event} canvas={canvas} pot={pot} seats={seats} />
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}
