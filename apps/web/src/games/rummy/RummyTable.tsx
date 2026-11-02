'use client';
import { useState } from 'react';
import { rummyDetails, type Action, type Card } from '@games/api-client';
import { Button, Hand, DecisionDock, Modal } from '@games/ui';
import { playerName, type TableProps } from '../types';
import { PlayerStrip } from '../shared/PlayerStrip';
import { ActionPanel } from '../shared/ActionPanel';
import { TablePile } from '../shared/TablePile';

const buckets = ['Ungrouped', 'Group 1', 'Group 2', 'Group 3', 'Group 4'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '★'];
export function RummyTable(props: TableProps) {
  const { match, room, pending, onAction } = props;
  const [selected, setSelected] = useState<string | null>(null);
  const [groups, setGroups] = useState<Record<string, number>>({});
  const [sort, setSort] = useState('dealt');
  const [declaration, setDeclaration] = useState<{ action: Action; version: number | null } | null>(
    null,
  );
  const data = rummyDetails(match.detail);
  const selectedCard = match.hand.find((card) => card.id === selected);
  const preview = selectedCard ? data.discard_analyses[selectedCard.id] : undefined;
  const analysis = preview ?? data.analysis;
  const cardName = (id: string) => match.hand.find((card) => card.id === id)?.label ?? id;
  const drawStock = match.actions.find((option) => option.value.type === 'draw_stock');
  const drawDiscard = match.actions.find((option) => option.value.type === 'draw_discard');
  const decisionMatch = {
    ...match,
    actions: match.actions.filter(
      (option) => !['draw_stock', 'draw_discard'].includes(option.value.type),
    ),
  };
  function arranged(cards: Card[]) {
    return sort === 'dealt'
      ? cards
      : [...cards].sort((a, b) => {
          const rankDifference = ranks.indexOf(a.value) - ranks.indexOf(b.value);
          return sort === 'suit'
            ? a.suit.localeCompare(b.suit) || rankDifference
            : rankDifference || a.suit.localeCompare(b.suit);
        });
  }
  return (
    <div className="table-layout stable-game-table card-game-layout rummy-layout">
      <PlayerStrip {...props} />
      <div className="card-table felt-table">
        <span className="table-watermark">g.</span>
        <div className="center-piles">
          <TablePile
            label="Draw pile"
            count={match.drawCount}
            action={drawStock}
            onAction={onAction}
            pending={pending}
            paused={room.paused}
          />
          <TablePile
            label="Discard"
            card={match.discard}
            action={drawDiscard}
            onAction={onAction}
            pending={pending}
            paused={room.paused}
          />
        </div>
        <span className="table-detail">Wild rank: {String(match.detail.wild_rank)}</span>
      </div>
      <section className="private-hand" aria-label="Arrange your rummy hand">
        <div className="hand-heading">
          <h3>
            Your hand <span className="muted">{match.hand.length} cards</span>
          </h3>
          <div className="rummy-tools">
            <label className="small">
              Sort
              <select
                className="input input--small"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="dealt">As dealt</option>
                <option value="suit">By suit</option>
                <option value="rank">By rank</option>
              </select>
            </label>
          </div>
        </div>
        <DecisionDock
          className="rummy-group-controls"
          size="compact"
          role="group"
          label={selectedCard ? `Move ${selectedCard.label} to a group` : 'Arrange card groups'}
        >
          <span className="small">
            {selectedCard ? `Group ${selectedCard.label}` : 'Select a card to arrange your groups.'}
          </span>
          <div>
            {buckets.map((label, bucket) => (
              <Button
                key={label}
                size="sm"
                variant={
                  selectedCard && (groups[selectedCard.id] ?? 0) === bucket
                    ? 'primary'
                    : 'secondary'
                }
                aria-pressed={Boolean(selectedCard && (groups[selectedCard.id] ?? 0) === bucket)}
                disabled={!selectedCard || pending || room.paused}
                onClick={() =>
                  selectedCard &&
                  setGroups((previous) => ({ ...previous, [selectedCard.id]: bucket }))
                }
              >
                {label}
              </Button>
            ))}
          </div>
        </DecisionDock>
        <p className="small muted">
          Groups are a visual aid for this visit and reset after refresh. The server checks the best
          valid arrangement, regardless of your groups.
        </p>
        <div className="rummy-groups">
          {buckets.map((label, bucket) => {
            const cards = arranged(match.hand.filter((card) => (groups[card.id] ?? 0) === bucket));
            return cards.length ? (
              <div className="rummy-group" key={label}>
                <span className="eyebrow">{label}</span>
                <Hand
                  cards={cards}
                  disabled={pending || room.paused}
                  label={label}
                  selectedIds={selectedCard ? [selectedCard.id] : []}
                  onSelect={(id) => setSelected(id === selected ? null : id)}
                />
              </div>
            ) : null;
          })}
        </div>
        {analysis ? (
          <details className="game-information-settlement">
            <summary>
              {preview ? `After discarding ${selectedCard?.label}: ` : 'Your hand: '}
              {analysis.valid ? 'valid declaration' : `${analysis.deadwood} loss points`}
            </summary>
            <p className="small">
              {analysis.sequence_count} sequences, {analysis.pure_sequence_count} pure.{' '}
              {analysis.scoring_gate
                ? 'The sequence requirement is met; only unmatched cards count toward loss points.'
                : 'Until you have two sequences including one pure sequence, all non-joker cards count (maximum 80).'}
            </p>
            <ul>
              {analysis.melds.map((meld, i) => (
                <li key={i}>
                  <strong>{meld.kind.replaceAll('_', ' ')}</strong>
                  <span>{meld.cards.map(cardName).join(', ')}</span>
                </li>
              ))}
              {analysis.unmatched.length ? (
                <li>
                  <strong>Unmatched</strong>
                  <span>{analysis.unmatched.map(cardName).join(', ')}</span>
                </li>
              ) : null}
            </ul>
          </details>
        ) : null}
      </section>
      <ActionPanel
        {...props}
        match={decisionMatch}
        selected={selectedCard?.id}
        cardSelectionRequired
        pinSelection
        selectionDetails={
          preview ? (
            <span className="small">
              {preview.valid
                ? 'This discard leaves a valid declaration.'
                : `This discard leaves an invalid declaration. Declaring costs 80 points; discarding continues play.`}
            </span>
          ) : undefined
        }
        instruction={
          match.actions.length
            ? match.phase === 'draw'
              ? 'Draw from either available pile. Arrange your hand at any time.'
              : !selectedCard
                ? 'Select a card to discard or declare.'
                : undefined
            : undefined
        }
        clear={() => setSelected(null)}
        onAction={(action) => {
          if (action.type === 'declare' && !preview?.valid) {
            setDeclaration({ action, version: room.matchVersion });
            return;
          }
          props.onAction(action);
          setSelected(null);
        }}
      />
      <p className="small muted table-help">
        Two sequences, including one pure sequence. A false declaration costs 80 points.
        {match.actions.some((option) => option.value.type === 'fold')
          ? ` Dropping now costs ${data.drop_cost} points.`
          : ''}
      </p>
      {Object.keys(data.settlements).length ? (
        <section className="game-information-settlement" aria-label="Rummy score explanation">
          <h3>
            {data.finish_reason === 'valid_declaration'
              ? 'Valid declaration'
              : data.finish_reason === 'last_active_player'
                ? 'Last active player wins'
                : 'Points settled'}
          </h3>
          <ul>
            {Object.entries(data.settlements).map(([id, result]) => (
              <li key={id}>
                <strong>
                  {playerName(room, id)}: {result.score} points
                </strong>
                <span>
                  {match.winners.includes(id)
                    ? 'Winner collects the opponents’ loss points.'
                    : result.penalty !== null
                      ? `Fixed ${result.penalty}-point drop or false-declaration penalty.`
                      : result.analysis.scoring_gate
                        ? 'Unmatched cards, capped at 80.'
                        : 'Sequence requirement not met; full hand points, capped at 80.'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <Modal
        open={Boolean(declaration && declaration.version === room.matchVersion)}
        onOpenChange={(open) => {
          if (!open) setDeclaration(null);
        }}
        title="Declare an invalid hand?"
        description="The remaining cards do not form a valid declaration. This will end your participation with an 80-point penalty."
      >
        <Button variant="secondary" onClick={() => setDeclaration(null)}>
          Keep playing
        </Button>
        <Button
          disabled={pending || room.paused}
          onClick={() => {
            if (declaration && declaration.version === room.matchVersion)
              onAction(declaration.action);
            setDeclaration(null);
            setSelected(null);
          }}
        >
          Declare for 80 points
        </Button>
      </Modal>
    </div>
  );
}
