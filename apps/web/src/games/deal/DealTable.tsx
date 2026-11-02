'use client';
import { useState } from 'react';
import { Hand, Button, CardPile } from '@games/ui';
import { dealDetails, type ActionOption } from '@games/api-client';
import { ArrowRight, CircleHelp, ShieldCheck } from 'lucide-react';
import { playerName, type TableProps } from '../types';
import { DealPlayer } from './DealPlayer';
import { DealComposer, optionKey } from './DealComposer';
import { bankValue, suggestBankPayment } from './presentation';

export function DealTable(props: TableProps) {
  const { match, room, selfId, pending } = props;
  const details = dealDetails(match.detail);
  const [selected, setSelected] = useState<string | null>(null);
  const [choiceKey, setChoiceKey] = useState<string | null>(null);
  const [payment, setPayment] = useState<{ signature: string; cards: string[] }>({
    signature: '',
    cards: [],
  });
  const own = match.players.find((player) => player.id === selfId);
  const pay = match.actions.find((option) => option.value.type === 'pay');
  const signature = JSON.stringify([pay?.eligibleCards, details.pendingAction, room.matchVersion]);
  const paid = payment.signature === signature ? payment.cards : [];
  const assets = own ? [...own.bank, ...Object.values(own.properties).flat()] : [];
  const paidValue = assets
    .filter((card) => paid.includes(card.id))
    .reduce((sum, card) => sum + bankValue(card), 0);
  const paymentValid =
    pay &&
    (paidValue >= details.paymentAmount || pay.eligibleCards.every((id) => paid.includes(id)));
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
  };
  const select = (id: string) => {
    if (pay?.eligibleCards.includes(id)) {
      setPayment({
        signature,
        cards: paid.includes(id) ? paid.filter((item) => item !== id) : [...paid, id],
      });
    } else {
      setSelected(id === selected ? null : id);
      setChoiceKey(null);
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
    onDestination: choose,
  };
  return (
    <div className="table-layout deal-workspace" data-pending={Boolean(details.pending)}>
      <div className="deal-opponents" aria-label="Other players">
        {match.players
          .filter((player) => player.id !== selfId)
          .map((player) => (
            <DealPlayer {...playerProps} key={player.id} player={player} />
          ))}
      </div>
      <div className="deal-center">
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
            </div>
          </div>
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
              <div className="deal-resolution-actions">
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
      {own ? <DealPlayer {...playerProps} player={own} /> : null}
      <section className="deal-hand-dock" aria-label="Your hand and moves">
        {card && !pay && !counter.length ? (
          <DealComposer
            key={card.id}
            {...props}
            card={card}
            options={options}
            details={details}
            candidate={candidate}
            onCandidate={choose}
            onResetMove={() => setChoiceKey(null)}
            onClear={clear}
            onAction={commit}
          />
        ) : null}
        <div className="hand-heading">
          <h3>
            Your hand <span className="muted">{match.hand.length}</span>
          </h3>
          <span className="small muted">
            {match.phase === 'discard'
              ? 'Discard down to 7'
              : pending
                ? 'Saving…'
                : match.hand.length
                  ? 'Select a card to play'
                  : 'No cards in hand'}
          </span>
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
        {match.id === 'deal-no-mercy' ? (
          <p>
            No Mercy uses the Games house deck. Complete sets can be attacked; unpaid bills give
            debt chips. Full edition rules are in the room menu.
          </p>
        ) : null}
      </details>
    </div>
  );
}
