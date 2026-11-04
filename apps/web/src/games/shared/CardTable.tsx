'use client';
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import {
  Avatar,
  Button,
  CardPile,
  DecisionDock,
  HorizontalRail,
  PlayingCard,
  TableDecisionPanel,
} from '@games/ui';
import { gameById } from '@games/api-client/catalog';
import { sheddingDetails, type ActionOption, type Card } from '@games/api-client';
import { playerName, type TableProps } from '../types';
import { PlayerStrip } from './PlayerStrip';
import { sheddingCardInformation } from './card-information';
import { turnState } from './turn-state';
import { useTableDraft } from './table-draft';
import {
  activeOrder,
  arrangeHand,
  cardConsequence,
  colourCounts,
  colourName,
  describeEvent,
  stackFloor,
  tableSituation,
  unoExtras,
  unplayableReason,
} from './uno-view';

const cardCount = (count: number) => `${count} card${count === 1 ? '' : 's'}`;
// More than this many swap targets open a panel instead of crowding the dock.
const DOCK_TARGETS = 3;

/** Uno and Uno No Mercy: discard and situation, the viewer's hand, then their moves. */
export function CardTable(props: TableProps) {
  const { match, room, selfId, pending } = props;
  const family = gameById(match.id).family === 'shedding' ? 'shedding' : 'standard';
  const details = family === 'shedding' ? sheddingDetails(match.detail) : null;
  const extras = unoExtras(match.detail);
  const mercy = match.id === 'uno-no-mercy';
  const sevenZero = Boolean(room.settings.seven_zero);
  const stackDrawTwo = Boolean(room.settings.stack_draw_two);
  const limit = details?.eliminationLimit ?? null;
  const color = details?.color ?? '';
  const direction = details?.direction ?? 1;
  const penalty = details?.penalty ?? 0;
  const finished = match.phase === 'finished';
  const self = match.players.find((player) => player.id === selfId);
  const isOut = Boolean(self?.eliminated);
  const outCount = extras.out.find((entry) => entry.player === selfId)?.cards ?? self?.count ?? 0;
  const name = (id: string | null | undefined) =>
    id === selfId ? 'you' : id ? playerName(room, id) : 'Player';
  // The viewer's unsent selection survives a refresh but never outlives this version.
  const [selected, setSelected] = useTableDraft<string | null>(
    `uno:${room.id}:${room.matchId}:${room.matchVersion}`,
    null,
  );
  const [dismissedSwap, setDismissedSwap] = useState<string | null>(null);
  const selectedCard = match.hand.find((card) => card.id === selected) || null;
  const playable = useMemo(
    () =>
      new Set(
        match.actions.flatMap((option) =>
          option.value.type === 'play' && option.value.card ? [option.value.card] : [],
        ),
      ),
    [match.actions],
  );
  const hand = useMemo(() => arrangeHand(match.hand, playable), [match.hand, playable]);
  const drawnIds = new Set(extras.youDrew);
  const youDrew = extras.youDrew
    .map((id) => match.hand.find((card) => card.id === id))
    .filter((card): card is Card => Boolean(card));
  const context = { match, room, selfId, mercy, limit };
  const event = describeEvent(extras.lastEvent, { ...context, youDrew, direction, sevenZero });
  const situation = tableSituation({
    ...context,
    penalty,
    pendingKind: details?.pendingKind ?? null,
    actor: extras.lastEvent?.actor ?? null,
    stackDrawTwo,
    canStack: match.actions.some((option) => option.value.type === 'play'),
  });
  const active = activeOrder(match);
  // In a crowded match several moves pass between your turns; the public history
  // lists them so the felt is not the only memory of what changed.
  const since = room.activity.slice(
    room.activity.findLastIndex((move) => move.actorId === selfId) + 1,
  );
  const turn = turnState(match, room, selfId);
  const current = match.currentPlayer;

  // Choices, grouped the way the dock presents them.
  const of = (...types: string[]) =>
    match.actions.filter((option) => types.includes(option.value.type));
  const urgent = of('uno', 'catch_uno');
  const colours = of('choose');
  const general = of('accept', 'challenge', 'draw', 'end_turn');
  const cardMoves = selectedCard
    ? match.actions.filter(
        (option) => option.value.type === 'play' && option.value.card === selectedCard.id,
      )
    : [];
  const wildMoves = cardMoves.filter((option) => option.value.color);
  const swapMoves = cardMoves
    .filter((option) => option.value.target)
    .sort(
      (a, b) =>
        (match.players.find((p) => p.id === a.value.target)?.count ?? 0) -
        (match.players.find((p) => p.id === b.value.target)?.count ?? 0),
    );
  const plainMoves = cardMoves.filter((option) => !option.value.color && !option.value.target);
  const swapKey = selectedCard ? `${selectedCard.id}:${room.matchVersion}` : null;
  const swapPanel = swapMoves.length > DOCK_TARGETS && !pending && dismissedSwap !== swapKey;
  const held = match.hand.length;
  const lastEvent = extras.lastEvent;
  const justDrew =
    lastEvent?.type === 'draw' && lastEvent.actor === selfId && lastEvent.kind !== 'penalty';
  const stackable = penalty > 0 ? playable.size : 0;
  const counts = colourCounts(match.hand);
  // The card an instruction names (a stack on a penalty, the card just drawn) is
  // also a one-tap move here, so it never depends on finding it in a long hand.
  const shortcuts =
    !selectedCard && current === selfId && (penalty > 0 || of('end_turn').length > 0 || justDrew)
      ? hand
          .filter((card) => playable.has(card.id))
          .filter(
            (card, index, list) => list.findIndex((item) => item.label === card.label) === index,
          )
          .slice(0, 2)
      : [];
  const myTurn = current === selfId && match.actions.length > 0 && !finished;
  const handPanel = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const turnSeen = useRef(false);
  // On a short phone the pinned dock can cover the hand; when a turn starts,
  // scroll just enough to show the hand above it.
  useEffect(() => {
    const started = myTurn && !turnSeen.current;
    turnSeen.current = myTurn;
    const panel = handPanel.current;
    const dock = panel?.parentElement?.querySelector<HTMLElement>(':scope > .uno-dock');
    if (!started || !panel || !dock || getComputedStyle(dock).position !== 'sticky') return;
    const reveal = () => {
      const covered = panel.getBoundingClientRect().bottom - dock.getBoundingClientRect().top;
      if (covered > 2)
        window.scrollBy({ top: covered + 8, behavior: reduced ? 'instant' : 'smooth' });
    };
    // Once after layout, and again after a reload restores its old scroll position.
    const frame = requestAnimationFrame(reveal);
    const later = window.setTimeout(reveal, 700);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(later);
    };
  }, [myTurn, reduced]);

  const commit = (action: ActionOption['value']) => {
    props.onAction(action);
    setSelected(null);
    setDismissedSwap(null);
  };

  function instruction() {
    if (pending) return 'Saving your move…';
    if (room.paused) return 'Waiting for players to reconnect.';
    if (isOut)
      return `You were eliminated with ${cardCount(outCount)}${limit ? ` (out at ${limit})` : ''}. You can watch the rest of the match.`;
    if (selectedCard) {
      const effect =
        cardConsequence(selectedCard, {
          ...context,
          hand: match.hand,
          color,
          penalty,
          direction,
          sevenZero,
          stackDrawTwo,
        }) || sheddingCardInformation(selectedCard, mercy, room.settings, active.length);
      if (current !== selfId || !match.actions.some((option) => option.value.type !== 'uno'))
        return `Not your turn yet.${effect ? ` On your turn: ${effect}` : ''}`;
      if (colours.length) return 'Choose a colour first.';
      if (of('challenge').length) return 'Take 4 or challenge first.';
      if (!cardMoves.length)
        return unplayableReason(selectedCard, {
          mercy,
          stackDrawTwo,
          color,
          penalty,
          drawn: current === selfId && (of('end_turn').length > 0 || justDrew),
          discard: match.discard,
        });
      return effect || `Play ${selectedCard.label}.`;
    }
    // On your own turn the last card simply wins, so the turn's decision comes first.
    if (urgent.some((option) => option.value.type === 'uno') && current !== selfId)
      return 'One card left: call UNO! now, or anyone can catch you for 2 cards.';
    const catchable = urgent.find((option) => option.value.type === 'catch_uno')?.value.target;
    if (catchable && current !== selfId)
      return `${playerName(room, catchable)} has one card and didn’t call UNO: catch them for +2.`;
    if (colours.length)
      return details?.pendingKind === 'roulette'
        ? `Choose the colour you will draw until. Wild cards do not stop the draw.${limit ? ` At ${limit} cards you are out. You hold ${held}.` : ''}`
        : 'Choose the colour for the next play.';
    if (of('challenge').length) {
      const play = lastEvent?.type === 'play' ? lastEvent : null;
      const before = play?.from_color && play.from_color !== 'wild' ? play.from_color : null;
      return `Take 4, or challenge: if ${play?.actor ? playerName(room, play.actor) : 'they'} held ${before ? colourName(before) : 'the colour before the +4'}, they draw 4; if not, you draw 6.`;
    }
    if (current === selfId && match.actions.length) {
      if (penalty > 0) {
        const total = held + penalty;
        const fate = limit
          ? total >= limit
            ? ` Drawing puts you out with ${total} cards.`
            : ` You’d hold ${total}; out at ${limit}.`
          : '';
        // With stack buttons below, the instruction only has to carry the consequence.
        if (mercy)
          return stackable
            ? shortcuts.length
              ? `Stack +${stackFloor(match.discard)} or more to pass it on.${fate}`
              : `Stack a draw card of +${stackFloor(match.discard)} or more to pass it on, or draw ${penalty}.${fate}`
            : `Nothing in your hand can stack: draw ${penalty}.${fate}`;
        return stackable
          ? `Stack a +2 to pass it on, or draw ${penalty}.`
          : `Draw ${penalty}; then your turn passes.`;
      }
      if (of('end_turn').length) return 'Play the card you drew, or pass.';
      if (justDrew && playable.size) return 'Play the card you drew.';
      if (playable.size)
        return `Tap a highlighted card to play it${of('draw').length ? ', or draw' : ''}.`;
      if (mercy && limit && held + 1 >= limit)
        return `No card matches. Drawing now puts you out at ${limit} cards.`;
      return mercy ? 'No card matches: draw until you can play.' : 'No card matches: draw a card.';
    }
    if (finished) return '';
    const next = details?.nextPlayer === selfId && current !== selfId ? ' You’re next.' : '';
    return `${situation || turn.message}${next}`;
  }

  const dockHeading = isOut ? 'You’re out' : turn.label;
  const disabled = pending || room.paused;
  const button = (
    option: ActionOption,
    text: string = option.label,
    variant: 'primary' | 'secondary' | 'danger' = 'primary',
    className?: string,
  ) => (
    <div className="decision-control" key={JSON.stringify(option.value)}>
      <Button
        variant={variant}
        className={className}
        disabled={disabled}
        onClick={() => commit(option.value)}
      >
        {text}
      </Button>
    </div>
  );

  return (
    <div className="table-layout stable-game-table card-game-layout uno-workspace">
      <PlayerStrip
        {...props}
        playerCaption={(player) => {
          if (player.eliminated) {
            const at = extras.out.find((entry) => entry.player === player.id)?.cards;
            return at ? `Out at ${at} cards` : 'Out';
          }
          return `${cardCount(player.count)}${player.score ? ` · ${player.score} point${player.score === 1 ? '' : 's'}` : ''}`;
        }}
      />
      <div className="card-table felt-table uno-felt">
        <span className="table-watermark" aria-hidden="true">
          g.
        </span>
        <div className="center-piles">
          <CardPile label="Draw pile" count={match.drawCount} family={family} />
          <CardPile label="Discard" card={match.discard} family={family} />
        </div>
        <div className="uno-felt-info">
          {color && color !== 'wild' ? (
            <span className="table-detail uno-current-colour" data-color={color}>
              <i aria-hidden="true" /> {colourName(color)}
              <span className="sr-only"> is the current colour</span>
            </span>
          ) : null}
          {situation ? (
            <p className="uno-situation" data-you={current === selfId}>
              {situation}
            </p>
          ) : null}
          {event ? (
            <p className="uno-event" aria-live="polite">
              {event}
            </p>
          ) : null}
          {details && !finished && active.length > 2 ? (
            <p className="table-detail" aria-label="Play direction">
              {direction === 1 ? 'Clockwise' : 'Counterclockwise'}
              {details.nextPlayer ? ` · Next: ${playerName(room, details.nextPlayer)}` : ''}
            </p>
          ) : null}
          {limit && !finished && !isOut && details?.pendingKind !== 'roulette' ? (
            <p className="table-detail">
              Out at {limit} cards · you hold {held}
            </p>
          ) : null}
          {extras.out.length ? (
            <p className="table-detail uno-out-list">
              Out:{' '}
              {extras.out
                .map((entry) => `${playerName(room, entry.player)} (${entry.cards})`)
                .join(', ')}
            </p>
          ) : null}
          {!finished && active.length > 3 && since.length > 2 ? (
            <details className="uno-since">
              <summary>
                {since.length} moves{' '}
                {since.length < room.activity.length ? 'since your last turn' : 'so far'}
              </summary>
              <ol>
                {since.slice(-9).map((move) => (
                  <li key={move.version}>
                    <strong>
                      {move.actorId === selfId ? 'You' : playerName(room, move.actorId)}
                    </strong>{' '}
                    {move.label.charAt(0).toLocaleLowerCase() + move.label.slice(1)}
                    {move.cards.length
                      ? `: ${move.cards.map((card) => card.label).join(', ')}`
                      : ''}
                    {move.targets.length
                      ? ` → ${move.targets.map((id) => name(id)).join(', ')}`
                      : ''}
                    {move.destination ? ` · ${move.destination}` : ''}
                    {move.count !== null && move.count > move.cards.length
                      ? ` · ${cardCount(move.count)}`
                      : ''}
                  </li>
                ))}
              </ol>
            </details>
          ) : null}
        </div>
      </div>
      <div className="private-hand uno-hand-panel" ref={handPanel}>
        <div className="hand-heading">
          <h3>
            Your hand <span className="muted">{match.hand.length}</span>
          </h3>
          {counts.length > 1 && !isOut ? (
            <span className="uno-colour-counts">
              <span className="sr-only">
                By colour: {counts.map((entry) => `${entry.count} ${entry.color}`).join(', ')}
              </span>
              {counts.map((entry) => (
                <span key={entry.color} data-color={entry.color} aria-hidden="true">
                  <i />
                  {entry.count}
                </span>
              ))}
            </span>
          ) : null}
          {selectedCard ? <span className="small muted">{selectedCard.label}</span> : null}
        </div>
        {isOut ? (
          <div className="uno-out-notice" role="status">
            <strong>You’re out</strong>
            <p className="small">
              Eliminated with {cardCount(outCount)}
              {limit ? ` (out at ${limit})` : ''}.
              {finished ? '' : ' Your cards no longer count; follow the rest of the match above.'}
            </p>
          </div>
        ) : (
          <UnoHand
            cards={hand}
            family={family}
            playable={playable}
            drawn={drawnIds}
            selectedId={selectedCard?.id ?? null}
            disabled={pending || room.paused}
            revealKey={`${current}:${[...playable].join(',')}:${extras.youDrew.join(',')}`}
            onSelect={(id) => {
              setSelected(id === selected ? null : id);
              setDismissedSwap(null);
            }}
          />
        )}
      </div>
      {finished && !match.actions.length ? null : (
        <DecisionDock
          className="action-panel uno-dock"
          label="Your actions"
          size={match.actions.length ? 'standard' : 'compact'}
          pending={pending}
          data-has-actions={match.actions.length > 0}
        >
          <div className="action-context">
            <strong>{dockHeading}</strong>
            <span className="small muted">{instruction()}</span>
            <button
              className="text-button action-clear"
              data-empty={!selectedCard}
              disabled={!selectedCard}
              tabIndex={selectedCard ? 0 : -1}
              onClick={() => setSelected(null)}
            >
              Clear selection
            </button>
          </div>
          <div className="action-choices uno-choices" data-decision-actions>
            {urgent.map((option) =>
              option.value.type === 'uno'
                ? button(option, 'UNO!', 'primary', 'uno-call')
                : button(
                    option,
                    `Catch ${playerName(room, option.value.target || '')} (+2)`,
                    'primary',
                  ),
            )}
            {colours.length || wildMoves.length ? (
              <ColourChoices
                options={colours.length ? colours : wildMoves}
                hand={match.hand}
                disabled={disabled}
                onChoose={commit}
              />
            ) : null}
            {shortcuts.map((card) => {
              const moves = match.actions.filter(
                (option) => option.value.type === 'play' && option.value.card === card.id,
              );
              const verb = penalty > 0 ? 'Stack' : 'Play';
              return moves.length === 1 && !moves[0].value.color && !moves[0].value.target ? (
                button(moves[0], `${verb} ${card.label}`)
              ) : (
                <div className="decision-control" key={card.id}>
                  <Button disabled={disabled} onClick={() => setSelected(card.id)}>
                    {verb} {card.label}…
                  </Button>
                </div>
              );
            })}
            {plainMoves.map((option) => button(option))}
            {swapMoves.length && swapMoves.length <= DOCK_TARGETS
              ? swapMoves.map((option) =>
                  button(
                    option,
                    `Swap with ${playerName(room, option.value.target || '')} · ${cardCount(
                      match.players.find((p) => p.id === option.value.target)?.count ?? 0,
                    )}`,
                  ),
                )
              : null}
            {swapMoves.length > DOCK_TARGETS ? (
              <div className="decision-control">
                <Button disabled={disabled} onClick={() => setDismissedSwap(null)}>
                  Choose who to swap with
                </Button>
              </div>
            ) : null}
            {general.map((option) =>
              button(
                option,
                option.label,
                option.label.includes('you’re out')
                  ? 'danger'
                  : option.value.type === 'end_turn' ||
                      (cardMoves.length > 0 && option.value.type === 'draw')
                    ? 'secondary'
                    : 'primary',
              ),
            )}
          </div>
        </DecisionDock>
      )}
      {selectedCard && swapMoves.length > DOCK_TARGETS ? (
        <TableDecisionPanel
          open={swapPanel}
          onOpenChange={(open) => setDismissedSwap(open ? null : swapKey)}
          title={`Swap hands · ${selectedCard.label}`}
        >
          <p className="small muted">
            {held - 1 === 0
              ? mercy
                ? 'Your last card wins before any swap.'
                : 'Your empty hand goes to the player you pick, so they win.'
              : `Your other ${cardCount(held - 1)} go to the player you pick; you take theirs. Fewest cards first.`}
          </p>
          <div className="uno-swap-targets" role="group" aria-label="Swap with">
            {swapMoves.map((option) => {
              const target = option.value.target || '';
              const member = room.members.find((item) => item.id === target);
              const count = match.players.find((p) => p.id === target)?.count ?? 0;
              return (
                <Button
                  key={target}
                  variant="secondary"
                  className="uno-swap-target"
                  disabled={disabled}
                  aria-label={`Swap with ${name(target)} · ${cardCount(count)}`}
                  onClick={() => commit(option.value)}
                >
                  <Avatar name={member?.name || 'Player'} seed={member?.avatar} size="sm" />
                  <span className="uno-swap-name">{playerName(room, target)}</span>
                  <span className="uno-swap-count">{cardCount(count)}</span>
                </Button>
              );
            })}
          </div>
        </TableDecisionPanel>
      ) : null}
    </div>
  );
}

/** Four colour swatches with how many of each the viewer holds. */
function ColourChoices({
  options,
  hand,
  disabled,
  onChoose,
}: {
  options: ActionOption[];
  hand: Card[];
  disabled: boolean;
  onChoose: (action: ActionOption['value']) => void;
}) {
  const id = useId();
  return (
    <div className="uno-swatches" role="group" aria-label="Colour">
      {options.map((option) => {
        const chosen = option.value.color || '';
        const count = hand.filter((card) => card.color === chosen).length;
        return (
          <Button
            key={chosen}
            variant="secondary"
            className="uno-swatch"
            data-color={chosen}
            disabled={disabled}
            aria-label={option.label}
            aria-describedby={`${id}-${chosen}`}
            onClick={() => onChoose(option.value)}
          >
            <i aria-hidden="true" />
            <span>{colourName(chosen)}</span>
            <small id={`${id}-${chosen}`}>{count} in hand</small>
          </Button>
        );
      })}
    </div>
  );
}

/**
 * The viewer's hand on one rail. Cards they can play lead the row; when space
 * runs out every card overlaps to its index corner (the selected one opens),
 * so a long hand needs a few rail steps instead of dozens.
 */
function UnoHand({
  cards,
  family,
  playable,
  drawn,
  selectedId,
  disabled,
  revealKey,
  onSelect,
}: {
  cards: Card[];
  family: 'shedding' | 'standard';
  playable: ReadonlySet<string>;
  drawn: ReadonlySet<string>;
  selectedId: string | null;
  disabled: boolean;
  revealKey: string;
  onSelect: (id: string) => void;
}) {
  const wrapper = useRef<HTMLDivElement>(null);
  const open = cards.slice(0, -1).some((card) => card.id === selectedId) ? 1 : 0;
  useLayoutEffect(() => {
    const root = wrapper.current;
    if (!root) return;
    const fit = () => {
      const rail = root.querySelector<HTMLElement>('.hand-rail');
      const viewport = root.querySelector<HTMLElement>('.hand-scroll');
      const first = root.querySelector<HTMLElement>('.card-hand > .playing-card');
      if (!rail || !viewport || !first) return;
      const width = first.offsetWidth;
      const style = getComputedStyle(viewport);
      const available =
        rail.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - 4;
      const closed = cards.length - 1 - open;
      const gap = 6;
      // Over half of each card stays visible: its corner, colour and a centre you can tap.
      const minimum = Math.ceil(width * 0.52) - width;
      const fitting = closed > 0 ? (available - cards.length * width - open * gap) / closed : gap;
      const overlap = Math.max(minimum, Math.min(gap, Math.floor(fitting)));
      root.style.setProperty('--uno-overlap', `${overlap}px`);
      root.dataset.fan = String(overlap < gap);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(root);
    return () => observer.disconnect();
  }, [cards.length, open]);
  // When a turn starts or a card is drawn, bring the card the instruction means into view.
  useLayoutEffect(() => {
    const root = wrapper.current;
    const viewport = root?.querySelector<HTMLElement>('.hand-scroll');
    const target = root?.querySelector<HTMLElement>(
      '.card-hand > [data-playable="true"], .card-hand > .uno-card--new',
    );
    if (!viewport || !target || viewport.scrollWidth <= viewport.clientWidth + 1) return;
    const frame = viewport.getBoundingClientRect();
    const box = target.getBoundingClientRect();
    if (box.left < frame.left + 4 || box.right > frame.right - 4)
      viewport.scrollBy({ left: box.left - frame.left - 4, behavior: 'instant' });
  }, [revealKey]);
  return (
    <div className="uno-hand" ref={wrapper}>
      <HorizontalRail
        className="hand-rail"
        viewportClassName="hand-scroll"
        contentClassName="card-hand"
        label="Your hand"
      >
        {cards.map((card) => {
          const isNew = drawn.has(card.id);
          const canPlay = playable.has(card.id);
          return (
            <PlayingCard
              key={card.id}
              card={card}
              family={family}
              className={isNew ? 'uno-card--new' : undefined}
              label={`${card.label}${canPlay ? ', playable' : ''}${isNew ? ', just drawn' : ''}`}
              selected={card.id === selectedId}
              playable={playable.size ? canPlay : undefined}
              disabled={disabled}
              onClick={() => onSelect(card.id)}
            />
          );
        })}
      </HorizontalRail>
    </div>
  );
}
