'use client';
import { useRef, useState } from 'react';
import { Hand, Button, CardPile, DecisionDock, TableDecisionPanel } from '@games/ui';
import { dealDetails, type ActionOption } from '@games/api-client';
import { ArrowRight, CircleHelp, Info, ShieldCheck, SlidersHorizontal, X } from 'lucide-react';
import { playerName, type TableProps } from '../types';
import { DealPlayer } from './DealPlayer';
import { DealComposer, optionKey } from './DealComposer';
import { paymentSelection, pileName, suggestBankPayment } from './presentation';
import { DealCardInformation } from './DealCardInformation';
import { dealInfoEntries } from './information';

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
  const [selected, setSelected] = useState<string | null>(null);
  const [target, setTarget] = useState('');
  const [choiceKey, setChoiceKey] = useState<string | null>(null);
  const [payment, setPayment] = useState<{ signature: string; cards: string[] }>({
    signature: '',
    cards: [],
  });
  const own = match.players.find((player) => player.id === selfId);
  const pay = match.actions.find((option) => option.value.type === 'pay');
  const signature = JSON.stringify([
    pay?.eligibleCards,
    details.pendingAction,
    details.paymentBundles,
    room.matchVersion,
  ]);
  const paid = payment.signature === signature ? payment.cards : [];
  const assets = own ? [...own.bank, ...Object.values(own.properties).flat()] : [];
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
  const candidate =
    options.find((option) => optionKey(option) === choiceKey) ||
    (playable.length === 1 ? playable[0] : null);
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
      setPayment({
        signature,
        cards: paid.includes(id) ? paid.filter((item) => item !== id) : [...paid, id],
      });
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
    setPayment({ signature: '', cards: [] });
  };
  const end = match.actions.find((option) => option.value.type === 'end_turn');
  const counter = match.actions.filter((option) => ['accept', 'no'].includes(option.value.type));
  const effect = details.pendingAction;
  const publicCards = match.players.flatMap((player) => [
    ...player.bank,
    ...Object.values(player.properties).flat(),
  ]);
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
      ...quote.carried,
    ],
    targeted: candidate?.value.target || target || effect?.target,
    targetable: [...new Set(options.map((option) => option.value.target).filter(Boolean))],
    onTarget: (id: string) => {
      setTarget(id);
      setChoiceKey(null);
    },
  };
  return (
    <div className="deal-stage-container">
      <div className="table-layout deal-workspace" data-pending={Boolean(details.pending)}>
        <div className="deal-opponents" aria-label="Other players">
          {match.players
            .filter((player) => player.id !== selfId)
            .map((player) => (
              <DealPlayer {...playerProps} key={player.id} player={player} />
            ))}
        </div>
        <div className="deal-center" aria-label="Shared play area">
          <div className="deal-stock">
            <CardPile label="Draw" count={match.drawCount} family="property" compact />
            <CardPile
              label="Discard"
              card={match.discard}
              family="property"
              compact
              empty={!match.discard}
            />
          </div>
          <div className="deal-last-move">
            <span className="eyebrow">On the table</span>
            <p>{match.message}</p>
          </div>
          <div className="deal-turn-controls">
            <span>
              <b>{Math.max(0, details.moves)}</b> {details.moves === 1 ? 'play' : 'plays'} left
            </span>
            {end ? (
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
        <div
          className="deal-board-scroll"
          role="region"
          aria-label="Your bank and property sets"
          tabIndex={0}
        >
          {own ? <DealPlayer {...playerProps} player={own} /> : null}
        </div>
        <DecisionDock
          className="deal-command-dock"
          label="Your actions"
          pending={pending}
          size="compact"
        >
          <div className="deal-command-title">
            <strong>
              {pay
                ? `Pay ${details.paymentAmount}M · ${paidValue}M selected`
                : card
                  ? card.label
                  : details.pending
                    ? 'Your response'
                    : match.currentPlayer === selfId
                      ? 'Your move'
                      : 'At the table'}
            </strong>
            {card || details.pending ? (
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
            ) : details.pending ? (
              <Button
                disabled={pending || room.paused || !match.actions.length}
                onClick={() => setDecisionOpen(true)}
              >
                Review {details.pending.replaceAll('_', ' ')}
              </Button>
            ) : candidate && candidate.value.type !== 'bank' ? (
              <Button disabled={pending || room.paused} onClick={() => commit(candidate.value)}>
                {candidate.value.type === 'property'
                  ? 'Place property'
                  : candidate.value.type === 'rearrange'
                    ? 'Move property'
                    : candidate.value.type === 'discard'
                      ? 'Discard card'
                      : `Play ${card?.label || 'card'}`}
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
              <p className="small muted">
                {match.phase === 'discard' ? 'Discard down to seven.' : 'Select a card to play.'}
              </p>
            )}
          </div>
        </DecisionDock>
        <TableDecisionPanel
          open={
            decisionOpen ||
            Boolean(resolutionKey && match.actions.length && dismissedResolution !== resolutionKey)
          }
          onOpenChange={(open) => {
            setDecisionOpen(open);
            if (!open) setDismissedResolution(resolutionKey);
          }}
          title={pay ? `Pay ${details.paymentAmount}M` : card?.label || 'Your response'}
        >
          {details.pending ? (
            <section className="deal-resolution" aria-label="Pending action" aria-live="polite">
              <div>
                <ShieldCheck size={20} />
                <div>
                  <h3>
                    {pay
                      ? `Pay ${details.paymentAmount}M`
                      : effect?.blocked
                        ? 'Action blocked'
                        : details.pending.replaceAll('_', ' ')}
                  </h3>
                  <p>
                    {effect
                      ? `${playerName(room, effect.actor)} → ${playerName(room, effect.target)}${effect.amount ? ` · ${effect.amount}M` : ''}`
                      : match.message}
                  </p>
                  {effect?.source_collection ? (
                    <p className="small">
                      Rent from {pileName(effect.source_collection, details.propertyGroups)}
                      {effect.multiplier > 1 ? ` · ${effect.multiplier}× rent` : ''}
                    </p>
                  ) : null}
                  {effect?.category ? <p>Take {effect.category} cards from their hand.</p> : null}
                </div>
              </div>
              {effect?.transfers.map((transfer, index) => (
                <div key={`${transfer.source}:${index}`}>
                  <p className="small">
                    {effect.blocked ? 'If restored: ' : ''}
                    {playerName(room, transfer.source)} → {playerName(room, transfer.target)}
                    {effect.collection
                      ? ` · ${pileName(effect.collection, details.propertyGroups)}`
                      : ''}
                  </p>
                  <div className="deal-resolution-actions">
                    {transfer.cards.map((id) => {
                      const asset = publicCards.find((item) => item.id === id);
                      return asset ? (
                        <Button key={id} variant="ghost" size="sm" onClick={() => inspect(id)}>
                          {asset.label} · {asset.value}
                          <Info size={14} />
                        </Button>
                      ) : null;
                    })}
                  </div>
                </div>
              ))}
              {pay ? (
                <>
                  <p>Choose bank cards or properties below. No change is given.</p>
                  <div className="deal-payment-total">
                    <strong>{paidValue}M selected</strong>
                    <span>
                      {paidValue > details.paymentAmount
                        ? `${paidValue - details.paymentAmount}M overpayment`
                        : `${Math.max(0, details.paymentAmount - paidValue)}M remaining`}
                    </span>
                  </div>
                  {quote.ids.length ? (
                    <div aria-label="Payment transfer preview">
                      <p className="small">{paidValue}M will leave your table:</p>
                      <div className="deal-resolution-actions">
                        {quote.ids.map((id) => {
                          const asset = assets.find((item) => item.id === id);
                          return asset ? (
                            <Button key={id} variant="ghost" size="sm" onClick={() => inspect(id)}>
                              {asset.label} · {asset.value}
                              {quote.carried.includes(id) ? ' · attached' : ''}
                              <Info size={14} />
                            </Button>
                          ) : null;
                        })}
                      </div>
                    </div>
                  ) : null}
                  <div className="deal-resolution-actions">
                    {paid.length ? (
                      <Button
                        variant="ghost"
                        disabled={pending}
                        onClick={() => setPayment({ signature, cards: [] })}
                      >
                        Clear payment
                      </Button>
                    ) : null}
                    <Button
                      variant="secondary"
                      disabled={pending || room.paused}
                      onClick={() =>
                        setPayment({
                          signature,
                          cards: suggestBankPayment(
                            own?.bank || [],
                            pay.eligibleCards,
                            details.paymentAmount,
                          ),
                        })
                      }
                    >
                      Select bank money
                    </Button>
                    <Button
                      disabled={pending || room.paused || !paymentValid}
                      onClick={() => commit({ ...pay.value, cards: paid })}
                    >
                      Pay {paidValue}M
                    </Button>
                  </div>
                </>
              ) : counter.length ? (
                <div className="deal-resolution-actions">
                  {counter
                    .filter(
                      (option, index, all) =>
                        all.findIndex((item) => item.value.type === option.value.type) === index,
                    )
                    .map((option) => (
                      <Button
                        key={optionKey(option)}
                        variant={option.value.type === 'no' ? 'primary' : 'secondary'}
                        disabled={pending || room.paused}
                        onClick={() => commit(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                </div>
              ) : (
                <p className="small muted">
                  {match.actions.length
                    ? 'Select a highlighted card on the table to continue.'
                    : 'Waiting for the next decision.'}
                </p>
              )}
            </section>
          ) : null}
          {card && !pay && !counter.length ? (
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
        <section className="deal-hand-dock" aria-label="Your hand and moves">
          <div className="hand-heading">
            <h3>
              Your hand <span className="muted">{match.hand.length}</span>
            </h3>
            <Button
              className="deal-hand-info"
              size="sm"
              variant="ghost"
              disabled={!informationCards.length}
              onClick={() => inspect(selected || match.hand[0]?.id || informationCards[0].card.id)}
            >
              <Info size={16} />
              Card info
            </Button>
          </div>
          <Hand
            cards={match.hand}
            family="property"
            selectedIds={selected ? [selected] : []}
            onSelect={select}
            disabled={pending || room.paused}
            playableIds={match.actions
              .filter((option) => option.value.card)
              .map((option) => option.value.card)}
          />
        </section>
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
