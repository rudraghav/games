'use client';
import { Modal, PlayingCard, dealCardInstructions } from '@games/ui';
import type { DealDetails } from '@games/api-client';
import type { TableProps } from '../types';
import { dealInfoEntries, rentOptions } from './information';
import { pileName } from './presentation';

interface Props extends TableProps {
  cardId: string;
  details: DealDetails;
  onCardChange: (id: string) => void;
  onClose: () => void;
  restoreFocus: () => void;
}

export function DealCardInformation(props: Props) {
  const { match, room, selfId, details } = props;
  const entries = dealInfoEntries(match, room, selfId, details);
  const entry = entries.find((item) => item.card.id === props.cardId) || entries[0];
  if (!entry) return null;
  const { card } = entry;
  const property = card.suit === 'property';
  const groups = details.propertyGroups.filter(
    (group) => card.colors.includes(group.color) || entry.setKey?.split(':')[0] === group.color,
  );
  const collection = details.collections.find(
    (group) => group.player === entry.owner && group.key === entry.setKey,
  );
  const collectionCards =
    entry.owner && entry.setKey
      ? match.players.find((player) => player.id === entry.owner)?.properties[entry.setKey] || []
      : [];
  const rents = rentOptions(card, match, details, selfId);
  const instruction = entry.banked
    ? 'This card is banked as money. Its printed action cannot be played.'
    : property
      ? card.colors.length > 1
        ? 'Counts as one property in one of its allowed colours at a time.'
        : 'Play this into its colour set. Complete three sets in different colours to win.'
      : card.subtitle === 'MONEY'
        ? 'Put this in your bank to pay rent and other bills.'
        : dealCardInstructions[card.effect] || card.subtitle;
  return (
    <Modal
      open
      onOpenChange={(open) => {
        if (!open) props.onClose();
      }}
      title="Card info"
      onCloseAutoFocus={(event) => {
        event.preventDefault();
        props.restoreFocus();
      }}
    >
      <div className="game-card-information">
        <label className="field">
          Card to inspect
          <select
            className="input"
            value={card.id}
            onChange={(event) => props.onCardChange(event.target.value)}
          >
            {entries.map((item) => (
              <option key={item.card.id} value={item.card.id}>
                {item.location} · {item.card.label}
              </option>
            ))}
          </select>
        </label>
        <div className="game-card-information-heading">
          <PlayingCard card={card} family="property" />
          <div>
            <h3>{card.label}</h3>
            <p className="small muted">{entry.location}</p>
            <dl className="game-information-facts">
              <div>
                <dt>Payment value</dt>
                <dd>{card.value === '✧' ? 'None' : card.value}</dd>
              </div>
              {property ? (
                <div>
                  <dt>Active colour</dt>
                  <dd>
                    {details.propertyGroups.find((group) => group.color === card.color)?.name ||
                      card.setName}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        </div>
        <p className="game-information-effect">{instruction}</p>
        {property ? <p>Properties cannot be banked.</p> : null}
        {property && card.colors.length === 10 ? (
          <p>All-colour wilds have no payment value and cannot collect rent on their own.</p>
        ) : null}
        {collection ? (
          <section className="game-information-context" aria-label="Current property set">
            <h4>{pileName(collection.key, details.propertyGroups)}</h4>
            <p>
              <strong>
                {collection.count} of {collection.setSize} properties
              </strong>{' '}
              ·{' '}
              {collection.complete
                ? 'Complete'
                : `${Math.max(0, collection.setSize - collection.count)} more needed`}
            </p>
            <p>
              Current rent <strong>{collection.rent}M</strong>
            </p>
            {collectionCards
              .filter((item) => item.suit !== 'property')
              .map((item) => (
                <p key={item.id}>
                  {item.label}: {dealCardInstructions[item.effect]}
                </p>
              ))}
          </section>
        ) : null}
        {groups.map((group) => (
          <table className="game-information-rent" key={group.color}>
            <caption>
              {group.name} · {group.setSize} properties to complete
            </caption>
            <thead>
              <tr>
                <th scope="col">Properties in set</th>
                <th scope="col">Base rent</th>
              </tr>
            </thead>
            <tbody>
              {group.rentLadder.map((amount, index) => (
                <tr key={index}>
                  <th scope="row">
                    {index + 1} {index === 0 ? 'property' : 'properties'}
                  </th>
                  <td>{amount}M</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
        {collection ? (
          <section aria-label="Named properties in this set">
            <h4>
              {details.propertyGroups.find((group) => group.color === collection.color)?.name}{' '}
              properties
            </h4>
            <ul>
              {details.propertyGroups
                .find((group) => group.color === collection.color)
                ?.properties.map((name) => (
                  <li key={name}>
                    {collectionCards.some((item) => item.label === name) ? '✓' : '○'} {name}
                  </li>
                ))}
            </ul>
            {collectionCards.some((item) => item.colors.length > 1) ? (
              <p>Wilds count toward completion.</p>
            ) : null}
          </section>
        ) : null}
        {property || ['rent', 'rent_double', 'double'].includes(card.effect) ? (
          <p className="game-information-modifier">
            Rent multiplier this turn: <strong>×{details.rentMultiplier}</strong>
            {card.effect === 'rent_double' ? ' · This card charges double the set’s rent.' : ''}
          </p>
        ) : null}
        {rents.length ? (
          <section aria-label="Available rent charges">
            <h4>Available rent charges</h4>
            <ul>
              {rents.map((rent) => (
                <li key={rent.key}>
                  {rent.label}: <strong>{rent.amount}M</strong>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {details.pendingAction?.amount != null ? (
          <p>
            Current bill: <strong>{details.pendingAction.amount}M</strong>
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
