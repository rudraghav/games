'use client';
import { useRef, useState } from 'react';
import { Hand, Button, DecisionDock, TableDecisionPanel } from '@games/ui';
import { dealDetails, type ActionOption } from '@games/api-client';
import { ArrowRight, CircleHelp, Eye, Info, SlidersHorizontal, X } from 'lucide-react';
import { type TableProps } from '../types';
import { useTableDraft } from '../shared/table-draft';
import { DealPlayer } from './DealPlayer';
import { DealComposer } from './DealComposer';
import { DealResolution } from './DealResolution';
import { EFFECT_TITLES, commitLabel, optionKey, type DealContext } from './decisions';
import { paymentSelection } from './presentation';
import { DealCardInformation } from './DealCardInformation';
import { dealInfoEntries } from './information';
import { tableStatus } from './table-status';

export function DealTable(props: TableProps) {
  const { match, room, selfId, pending } = props;
  const details = dealDetails(match.detail);
  const informationCards = dealInfoEntries(match, room, selfId, details);
  const [inspected, setInspected] = useState<string | null>(null);
  const infoOpener = useRef<HTMLElement | null>(null);
  const inspect = (id: string) => {
    infoOpener.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setInspected(id);
  };
  const resolutionKey = details.pending
    ? `${room.matchVersion}:${details.pendingAction?.stage || details.pending}`
    : null;
  const [dismissedResolution, setDismissedResolution] = useState<string | null>(null);
  const [decisionOpen, setDecisionOpen] = useState(false);
  // The viewer's unsent card choice survives a refresh, but only for this exact table version.
  const draft = `deal:${room.id}:${room.matchId}:${room.matchVersion}`;
  const [selected, setSelected] = useTableDraft<string | null>(`${draft}:card`, null);
  const [target, setTarget] = useTableDraft(`${draft}:target`, '');
  const [choiceKey, setChoiceKey] = useTableDraft<string | null>(`${draft}:move`, null);
  // A partial payment also survives a refresh, scoped to this exact bill and version.
  const [payment, setPayment] = useTableDraft<string[]>(`${draft}:pay`, []);
  const ctx: DealContext = { match, room, details, selfId };
  const own = match.players.find((player) => player.id === selfId);
  const pay = match.actions.find((option) => option.value.type === 'pay');
  const paid = pay ? payment.filter((id) => pay.eligibleCards.includes(id)) : [];
  const quote = paymentSelection(details.paymentBundles, paid);
  const paidValue = quote.amount;
  const paymentValid =
    pay &&
    quote.valid &&
    details.paymentBundles.length > 0 &&
    (paidValue >= details.paymentAmount || pay.eligibleCards.every((id) => quote.ids.includes(id)));
  const card = [
    ...match.hand,
    ...match.players.flatMap((player) => [
      ...player.bank,
      ...Object.values(player.properties).flat(),
    ]),
  ].find((item) => item.id === selected);
  const options = match.actions.filter((option) => option.value.card === card?.id && Boolean(card));
  const playable = options.filter((option) => option.value.type !== 'bank');
  // Once a player is chosen, a single remaining move needs no second pick.
  const forTarget = target ? playable.filter((option) => option.value.target === target) : playable;
  const candidate =
    match.actions.find((option) => optionKey(option) === choiceKey) ||
    (forTarget.length === 1 ? forTarget[0] : playable.length === 1 ? playable[0] : null);
  const choose = (option: ActionOption) => setChoiceKey(optionKey(option));
  const clear = () => {
    setSelected(null);
    setChoiceKey(null);
    setTarget('');
    setDecisionOpen(false);
    setDismissedResolution(resolutionKey);
  };
  const select = (id: string) => {
    if (pay?.eligibleCards.includes(id)) {
      setPayment(paid.includes(id) ? paid.filter((item) => item !== id) : [...paid, id]);
    } else {
      const moves = match.actions.filter((option) => option.value.card === id);
      const complex = moves.some(
        (option) =>
          option.value.type === 'play' ||
          ['choose', 'keep', 'give', 'settle_debt'].includes(option.value.type),
      );
      setDecisionOpen(id !== selected && complex);
      setSelected(id === selected ? null : id);
      setChoiceKey(null);
      setTarget('');
    }
  };
  const commit: TableProps['onAction'] = (action) => {
    props.onAction(action);
    clear();
    setPayment([]);
  };
  const end = match.actions.find((option) => option.value.type === 'end_turn');
  const counter = match.actions.filter((option) => ['accept', 'no'].includes(option.value.type));
  const staged = match.actions.some((option) =>
    ['choose', 'keep', 'give'].includes(option.value.type),
  );
  const effect = details.pendingAction;
  const effectTitle = effect ? EFFECT_TITLES[effect.kind] || effect.kind : '';
  const armed = details.rentMultiplier > 1 && !details.pending && match.currentPlayer === selfId;
  const bank = options.find((option) => option.value.type === 'bank');
  const placements = options.filter((option) =>
    ['property', 'rearrange'].includes(option.value.type),
  );
  const playerProps = {
    ...props,
    details,
    selected,
    paid,
    paymentEligible: pay?.eligibleCards ?? null,
    placements,
    candidate,
    onSelect: select,
    onInspect: inspect,
    onDestination: choose,
    previewIds: [
      ...(candidate
        ? [candidate.value.choice, ...(candidate.value.cards || [])].filter(Boolean)
        : []),
      ...(effect?.transfers.flatMap((transfer) => transfer.cards) || []),
      // A Super Sly Deal colour takes every matching public property: outline them all.
      ...(card?.effect === 'super_sly' && candidate?.value.color
        ? match.players
            .filter((player) => player.id !== selfId)
            .flatMap((player) => Object.values(player.properties).flat())
            .filter(
              (item) => item.suit === 'property' && item.colors.includes(candidate.value.color),
            )
            .map((item) => item.id)
        : []),
      ...quote.carried,
    ],
    targeted: candidate?.value.target || target || effect?.target,
    targetable: [...new Set(options.map((option) => option.value.target).filter(Boolean))],
    onTarget: (id: string) => {
      setTarget(id);
      const only = playable.filter((option) => option.value.target === id);
      setChoiceKey(only.length === 1 ? optionKey(only[0]) : null);
    },
  };
  const finished = match.phase === 'finished';
  // Only the seat that must answer a pending effect gets the response controls.
  const responding = Boolean(details.pending) && !finished && match.actions.length > 0;
  const status = tableStatus(match, room, selfId, details);
  // A No Mercy debt card handed to this seat: name it, since it joins the end of the hand.
  const gift =
    status.title === 'Card received'
      ? match.hand.find((item) => item.id === match.actions[0]?.value.card) || null
      : null;
  const discard = match.discard;
  const discardColors = discard?.colors?.length
    ? discard.colors
    : discard?.suit === 'property'
      ? [discard.color]
      : [];
  return (
    <div className="deal-stage-container">
      <div
        className="table-layout deal-workspace"
        data-pending={Boolean(details.pending) && !finished}
        data-phase={match.phase}
      >
        <div className="deal-opponents" aria-label="Other players">
          {match.players
            .filter((player) => player.id !== selfId)
            .map((player) => (
              <DealPlayer {...playerProps} key={player.id} player={player} />
            ))}
        </div>
        <div className="deal-center" aria-label="Shared play area">
          <div className="deal-stock">
            <div
              className="deal-draw"
              role="img"
              aria-label={`Draw pile, ${match.drawCount} card${match.drawCount === 1 ? '' : 's'}`}
            >
              <span className="deal-pile-back" aria-hidden="true">
                <span>g.</span>
              </span>
              <span className="deal-pile-copy" aria-hidden="true">
                <b>{match.drawCount}</b>
                <span>Draw</span>
              </span>
            </div>
            {discard ? (
              <button
                type="button"
                className="deal-discard"
                data-card-kind={
                  discard.subtitle === 'MONEY'
                    ? 'money'
                    : discard.suit === 'property'
                      ? 'property'
                      : 'action'
                }
                aria-label={`Top of the discard pile: ${discard.label}, ${discard.value}. Card info`}
                onClick={() => inspect(discard.id)}
              >
                <span className="deal-discard-band" aria-hidden="true">
                  {discardColors.map((color) => (
                    <span key={color} data-property-color={color} />
                  ))}
                </span>
                <span className="deal-discard-copy" aria-hidden="true">
                  <span>Discard</span>
                  <strong>{discard.label}</strong>
                </span>
                <b className="deal-discard-value" aria-hidden="true">
                  {discard.value}
                </b>
              </button>
            ) : (
              <div className="deal-discard" data-empty="true">
                <span className="deal-discard-copy">
                  <span>Discard</span>
                  <strong>Empty</strong>
                </span>
              </div>
            )}
          </div>
          <p className="deal-turn-status" data-tone={status.tone}>
            {status.text}
          </p>
          <div className="deal-turn-controls">
            {status.plays ? (
              <span className="deal-plays" data-mine={status.plays.mine}>
                <span className="deal-play-pips" aria-hidden="true">
                  {[0, 1, 2].map((index) => (
                    <i key={index} data-used={index >= status.plays!.left} />
                  ))}
                </span>
                <span>
                  <b>{status.plays.left}</b> {status.plays.left === 1 ? 'play' : 'plays'} left
                </span>
              </span>
            ) : (
              // Keeps the centre row's height when a response or a discard replaces the plays.
              <span className="deal-plays" data-empty="true" aria-hidden="true" />
            )}
            {end && !finished ? (
              <Button
                variant="secondary"
                disabled={pending || room.paused}
                onClick={() => commit(end.value)}
              >
                End turn
                <ArrowRight size={15} />
              </Button>
            ) : null}
          </div>
        </div>
        <section className="deal-hand-dock" aria-label="Your hand and moves">
          <div className="hand-heading">
            <h3>
              Your hand <span className="muted">{match.hand.length}</span>
            </h3>
            <Button
              className="deal-hand-info"
              size="sm"
              variant="ghost"
              aria-label="Card info"
              disabled={!informationCards.length}
              onClick={() => inspect(selected || match.hand[0]?.id || informationCards[0].card.id)}
            >
              <Info size={16} />
              <span className="deal-hand-info-label">Card info</span>
            </Button>
          </div>
          {match.hand.length ? (
            <Hand
              cards={match.hand}
              family="property"
              selectedIds={selected ? [selected] : []}
              onSelect={select}
              disabled={pending || room.paused || finished}
              playableIds={match.actions
                .filter((option) => option.value.card)
                .map((option) => option.value.card)}
            />
          ) : (
            <p className="deal-hand-empty">
              {finished
                ? 'No cards left in your hand.'
                : 'No cards in hand. You draw 5 at the start of your next turn.'}
            </p>
          )}
        </section>
        <DecisionDock
          className="deal-command-dock"
          label="Your actions"
          pending={pending}
          size="compact"
          hidden={finished}
        >
          <div className="deal-command-title">
            <strong>
              {pay
                ? `Pay ${details.paymentAmount}M · ${paidValue}M selected`
                : card
                  ? card.label
                  : responding
                    ? 'Your response'
                    : armed
                      ? `Rent ×${details.rentMultiplier} armed`
                      : gift
                        ? `Received: ${gift.label}`
                        : status.title}
            </strong>
            {card || responding ? (
              <>
                {card ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Info about ${card.label}`}
                    onClick={() => inspect(card.id)}
                  >
                    <Info size={17} />
                  </Button>
                ) : null}
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Choose move options"
                  onClick={() => setDecisionOpen(true)}
                >
                  <SlidersHorizontal size={17} />
                </Button>
                {card ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Clear card selection"
                    onClick={clear}
                  >
                    <X size={17} />
                  </Button>
                ) : null}
              </>
            ) : details.pending && !finished ? (
              <Button
                size="icon"
                variant="ghost"
                aria-label="View pending action"
                onClick={() => setDecisionOpen(true)}
              >
                <Eye size={17} />
              </Button>
            ) : null}
          </div>
          <div className="deal-command-primary">
            {pay ? (
              <Button
                disabled={pending || room.paused || !paymentValid}
                onClick={() => commit({ ...pay.value, cards: paid })}
              >
                Pay {paidValue}M
              </Button>
            ) : responding && details.pending ? (
              <Button
                disabled={pending || room.paused || !match.actions.length}
                onClick={() => setDecisionOpen(true)}
              >
                {effect?.stage === 'select'
                  ? 'Choose the card to take'
                  : effect?.stage === 'distribution'
                    ? 'Choose what to keep'
                    : effect?.blocked
                      ? 'Answer the block'
                      : `Respond to ${effect?.kind === 'bill' ? `${effect.amount ?? 0}M bill` : effectTitle}`}
              </Button>
            ) : candidate && candidate.value.type !== 'bank' ? (
              <Button disabled={pending || room.paused} onClick={() => commit(candidate.value)}>
                {commitLabel(candidate, ctx)}
              </Button>
            ) : card ? (
              <Button
                disabled={pending || room.paused || !options.length}
                onClick={() => {
                  if (!playable.length && bank) choose(bank);
                  setDecisionOpen(true);
                }}
              >
                {!playable.length && bank ? `Bank for ${card.value}` : 'Choose a move'}
              </Button>
            ) : (
              <p className="deal-command-hint">
                {armed
                  ? `Play a Rent card next: its rent is charged ×${details.rentMultiplier}. End turn returns after that rent.`
                  : status.hint}
              </p>
            )}
          </div>
        </DecisionDock>
        <div
          className="deal-board-scroll"
          role="region"
          aria-label="Your bank and property sets"
          tabIndex={0}
        >
          {own ? <DealPlayer {...playerProps} player={own} /> : null}
        </div>
        <TableDecisionPanel
          open={
            decisionOpen ||
            Boolean(resolutionKey && match.actions.length && dismissedResolution !== resolutionKey)
          }
          onOpenChange={(open) => {
            setDecisionOpen(open);
            if (!open) setDismissedResolution(resolutionKey);
          }}
          title={
            pay
              ? `Pay ${details.paymentAmount}M`
              : responding && details.pending
                ? effect?.kind === 'bill'
                  ? 'Your response'
                  : effectTitle
                : card?.label || (details.pending ? 'Pending action' : 'Your move')
          }
        >
          {details.pending ? (
            <DealResolution
              ctx={ctx}
              blocked={pending || room.paused}
              onCommit={commit}
              onInspect={inspect}
              paid={paid}
              onPaid={setPayment}
              stageChoice={
                choiceKey ??
                (candidate && ['choose', 'keep', 'give'].includes(candidate.value.type)
                  ? optionKey(candidate)
                  : null)
              }
              onStageChoice={(key) => {
                const option = match.actions.find((item) => optionKey(item) === key);
                setSelected(option?.value.card || null);
                setChoiceKey(key);
              }}
            />
          ) : null}
          {card && !pay && !counter.length && !staged ? (
            <DealComposer
              key={card.id}
              {...props}
              card={card}
              options={options}
              details={details}
              candidate={candidate}
              onCandidate={choose}
              target={target}
              onTargetChange={setTarget}
              onResetMove={() => setChoiceKey(null)}
              onClear={clear}
              onAction={commit}
            />
          ) : null}
        </TableDecisionPanel>
        <details className="deal-quick-rules">
          <summary>
            <CircleHelp size={15} />
            Quick rules
          </summary>
          <p>
            Draw two at the start of your turn. Play up to three cards. Build three complete sets in
            different colours to win. Pay bills from your bank and properties, never your hand. A
            banked action is money for the rest of the game.
          </p>
          <p>
            Linked buildings leave with their property and count toward payment. This is the Games
            building convention; review every transferred card before paying.
            {match.id === 'deal'
              ? ' Just Say No never uses an ordinary play.'
              : ' In this No Mercy house format, an own-turn Just Say No uses a play.'}
          </p>
          {match.id === 'deal-no-mercy' ? (
            <p>
              No Mercy uses the Games house deck. Complete sets can be attacked; unpaid bills give
              debt chips. Full edition rules are in the room menu.
            </p>
          ) : null}
        </details>
      </div>
      {inspected ? (
        <DealCardInformation
          {...props}
          details={details}
          cardId={inspected}
          onCardChange={setInspected}
          onClose={() => setInspected(null)}
          restoreFocus={() => infoOpener.current?.focus({ preventScroll: true })}
        />
      ) : null}
    </div>
  );
}
