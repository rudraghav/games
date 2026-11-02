'use client';
import { useState, type CSSProperties } from 'react';
import { LockKeyhole, Siren, Star } from 'lucide-react';
import { Button, PlayingCard } from '@games/ui';
import { gangDetails } from '@games/api-client';
import { PlayerStrip } from '../shared/PlayerStrip';
import { playerName, type TableProps } from '../types';

const streets = ['Preflop', 'Flop', 'Turn', 'River'];
const colors = ['white', 'yellow', 'orange', 'red'];

export function GangTable(props: TableProps) {
  const { match, room, selfId, pending, onAction } = props;
  const data = gangDetails(match.detail);
  const blocked = pending || room.paused;
  const roundKey = `${data.heist}:${data.street}`;
  const [selection, setSelection] = useState<{ key: string; rank: number } | null>(null);
  const chosen = selection?.key === roundKey ? selection.rank : null;
  const option = match.actions.find(
    (o) => o.value.type === 'claim_chip' && o.value.amount === chosen,
  );
  const owner = chosen === null ? null : match.players.find((p) => data.chips[p.id] === chosen)?.id;
  const ownChip = data.chips[selfId];
  const closesStreet = data.pending_players.length === 1 && ownChip === null && !owner;
  const reveal = match.actions.find((o) => o.value.type === 'reveal_hand');
  const next = match.actions.find((o) => o.value.type === 'next_heist');
  const giveBack = match.actions.find((o) => o.value.type === 'return_chip');
  const simultaneous = match.phase === 'chips';
  const instruction = !chosen
    ? 'Choose the chip that matches your hand.'
    : owner
      ? `This takes ${playerName(room, owner)}’s chip; they will need another.`
      : closesStreet
        ? data.street === 3
          ? 'Taking this last free chip starts the showdown.'
          : 'Taking this last free chip closes the round and reveals more community cards.'
        : ownChip
          ? 'Your previous chip goes back to the center.'
          : 'Take this chip to show your estimate.';

  return (
    <div className="table-layout coop-number-game gang-game">
      <PlayerStrip
        {...props}
        match={simultaneous ? { ...match, currentPlayer: null } : match}
        playerCaption={(p) =>
          data.chips[p.id] ? `${data.chips[p.id]}-star estimate` : 'Choosing a chip'
        }
      />
      <section className="gang-table" aria-label="The Gang table">
        <header className="coop-number-heading">
          <div>
            <p className="eyebrow">Heist {data.heist} · Basic game</p>
            <h2>{streets[data.street]}</h2>
          </div>
          <div className="gang-counters" aria-label="Crew progress">
            <span>
              <LockKeyhole size={17} aria-hidden="true" /> {data.vaults}/3 vaults
            </span>
            <span>
              <Siren size={17} aria-hidden="true" /> {data.alarms}/3 alarms
            </span>
          </div>
        </header>
        <div className="gang-community" aria-label="Community cards">
          {Array.from({ length: 5 }, (_, i) =>
            match.community[i] ? (
              <PlayingCard key={i} card={match.community[i]} compact />
            ) : (
              <div
                className="gang-empty-card"
                key={i}
                aria-label={`Community card ${i + 1} unrevealed`}
              />
            ),
          )}
        </div>
        <section className="gang-private" aria-label="Your private pocket cards">
          <div>
            <p className="eyebrow">Your pocket cards</p>
            {data.own_hand_name ? <h3>{data.own_hand_name}</h3> : null}
            <p className="small muted">Only you can see these cards.</p>
          </div>
          <div className="gang-pocket-cards">
            {match.hand.map((card) => (
              <PlayingCard key={card.id} card={card} />
            ))}
          </div>
        </section>
        {simultaneous ? (
          <section className="gang-decision" aria-label="Choose your ranking chip">
            <div className="coop-number-heading">
              <h3>Everyone can choose</h3>
              <span className="small muted">
                {match.players.length - data.pending_players.length}/{match.players.length} chips
                taken
              </span>
            </div>
            <div className="gang-rank-scale" aria-hidden="true">
              <span>Weakest</span>
              <span>Strongest</span>
            </div>
            <div
              className="gang-chip-rack"
              data-chip-color={colors[data.street]}
              style={{ '--gang-players': match.players.length } as CSSProperties}
            >
              {match.players.map((_, i) => {
                const rank = i + 1;
                const holder = match.players.find((p) => data.chips[p.id] === rank)?.id;
                const available = match.actions.some(
                  (o) => o.value.type === 'claim_chip' && o.value.amount === rank,
                );
                return (
                  <button
                    key={rank}
                    type="button"
                    className="gang-chip-choice"
                    aria-label={`${rank}-star chip${holder ? ` held by ${playerName(room, holder)}` : ' in the center'}`}
                    aria-pressed={chosen === rank}
                    disabled={blocked || !available}
                    onClick={() => setSelection({ key: roundKey, rank })}
                  >
                    <span className="gang-rank-chip">
                      <Star size={15} aria-hidden="true" />
                      {rank}
                    </span>
                    <small>
                      {holder ? (holder === selfId ? 'You' : playerName(room, holder)) : 'Center'}
                    </small>
                  </button>
                );
              })}
            </div>
            <p className="gang-decision-note" aria-live="polite">
              {instruction}
            </p>
            <div className="coop-number-actions">
              <Button
                disabled={blocked || !option}
                onClick={() => {
                  if (option) {
                    setSelection(null);
                    onAction(option.value);
                  }
                }}
              >
                {chosen ? `Take ${chosen}-star chip` : 'Choose a chip'}
              </Button>
              {giveBack ? (
                <Button
                  variant="ghost"
                  disabled={blocked}
                  onClick={() => {
                    setSelection(null);
                    onAction(giveBack.value);
                  }}
                >
                  Return my chip
                </Button>
              ) : null}
            </div>
          </section>
        ) : null}
        {match.phase === 'showdown' ? (
          <section className="gang-showdown" aria-live="polite">
            <h3>Showdown · weakest chip first</h3>
            <p>
              {reveal
                ? 'Your chip is next. Reveal your pocket cards to the crew.'
                : `Waiting for ${playerName(room, match.currentPlayer || '')} to reveal.`}
            </p>
            {reveal ? (
              <Button disabled={blocked} onClick={() => onAction(reveal.value)}>
                Reveal my hand
              </Button>
            ) : null}
          </section>
        ) : null}
        {data.revealed.length ? (
          <div className="gang-revealed" aria-label="Revealed crew hands">
            {data.revealed.map((id) => (
              <section key={id}>
                <strong>{playerName(room, id)}</strong>
                <span className="small muted">{data.hand_names[id]}</span>
                <div>
                  {match.players
                    .find((p) => p.id === id)
                    ?.cards.map((card, i) =>
                      card ? (
                        <PlayingCard key={card.id} card={card} compact />
                      ) : (
                        <PlayingCard key={i} faceDown compact />
                      ),
                    )}
                </div>
              </section>
            ))}
          </div>
        ) : null}
        {data.history.length ? (
          <section className="gang-history" aria-label="Previous chip estimates">
            <h3>Your estimates</h3>
            <div className="gang-history-grid" role="table" aria-label="Chip history by round">
              <div role="row">
                <span role="columnheader">Crew</span>
                {streets.map((name) => (
                  <span role="columnheader" key={name}>
                    {name}
                  </span>
                ))}
              </div>
              {match.players.map((p) => (
                <div role="row" key={p.id}>
                  <strong role="rowheader">{playerName(room, p.id)}</strong>
                  {streets.map((name, i) => (
                    <span role="cell" key={name}>
                      {data.history[i]?.[p.id] ?? '—'}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </section>
        ) : null}
        {next ? (
          <div className="coop-number-review">
            <p>
              {data.last_success
                ? 'The crew got the order right.'
                : 'An alarm, not the end. Try a new hand together.'}
            </p>
            <Button disabled={blocked} onClick={() => onAction(next.value)}>
              Next heist
            </Button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
