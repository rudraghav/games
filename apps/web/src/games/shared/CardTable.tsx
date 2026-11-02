'use client';
import { useState } from 'react';
import { CardPile, Hand } from '@games/ui';
import { gameById } from '@games/api-client/catalog';
import type { TableProps } from '../types';
import { ActionPanel } from './ActionPanel';
import { PlayerStrip } from './PlayerStrip';
import { sheddingCardInformation } from './card-information';

export function CardTable(props: TableProps) {
  const { match, room, pending } = props;
  const [selected, setSelected] = useState<string | null>(null);
  const family = gameById(match.id).family === 'shedding' ? 'shedding' : 'standard';
  const selectedCard = match.hand.find((card) => card.id === selected);
  const choosingColour = match.actions.some((option) => option.value.type === 'choose');
  const challenging = match.actions.some((option) => option.value.type === 'challenge');
  const draw = match.actions.find((option) => option.value.type === 'draw');
  const canPlay = match.actions.some((option) => option.value.type === 'play');
  const canPass = match.actions.some((option) => option.value.type === 'end_turn');
  const penalty = Number(match.detail.penalty ?? 0);
  const instruction = choosingColour
    ? 'Choose the colour for the next play.'
    : challenging
      ? 'Accept four cards, or challenge: an illegal play makes them draw four; a failed challenge makes you draw six.'
      : selectedCard
        ? sheddingCardInformation(
            selectedCard,
            match.id === 'uno-no-mercy',
            room.settings,
            match.players.filter((player) => !player.eliminated).length,
          ) || undefined
        : penalty > 0
          ? canPlay
            ? `Draw ${penalty} cards or stack an allowed draw card.`
            : `Draw ${penalty} cards.`
          : canPass
            ? canPlay
              ? 'Play your drawn card or pass.'
              : 'Pass to end your turn.'
            : canPlay
              ? draw
                ? 'Choose a card to play, or draw.'
                : 'Choose a card to play.'
              : draw
                ? `${draw.label}.`
                : undefined;
  return (
    <div className="table-layout stable-game-table card-game-layout uno-workspace">
      <PlayerStrip {...props} />
      <div className="card-table felt-table">
        <span className="table-watermark">g.</span>
        <div className="center-piles">
          <CardPile label="Draw pile" count={match.drawCount} family={family} />
          <CardPile label="Discard" card={match.discard} family={family} />
        </div>
        {match.detail.color ? (
          <span className="table-detail uno-current-colour" data-color={String(match.detail.color)}>
            <i aria-hidden="true" /> {String(match.detail.color)}
            <span className="sr-only"> is the current colour</span>
          </span>
        ) : null}
        {match.detail.wild_rank ? (
          <span className="table-detail">Wild rank: {String(match.detail.wild_rank)}</span>
        ) : null}
      </div>
      <div className="private-hand">
        <div className="hand-heading">
          <h3>
            Your hand <span className="muted">{match.hand.length}</span>
          </h3>
          {selectedCard ? <span className="small muted">{selectedCard.label}</span> : null}
        </div>
        <Hand
          family={family}
          cards={match.hand}
          playableIds={match.actions.flatMap((option) =>
            option.value.card ? [option.value.card] : [],
          )}
          disabled={pending || room.paused}
          selectedIds={selectedCard ? [selectedCard.id] : []}
          onSelect={(id) => setSelected(id === selected ? null : id)}
        />
      </div>
      <ActionPanel
        {...props}
        selected={selectedCard?.id}
        cardSelectionRequired
        pinSelection
        instruction={instruction}
        clear={() => setSelected(null)}
        onAction={(action) => {
          props.onAction(action);
          setSelected(null);
        }}
      />
    </div>
  );
}
