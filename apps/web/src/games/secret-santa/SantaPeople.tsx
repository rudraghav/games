'use client';
import { useRef, useState } from 'react';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Avatar, Button } from '@games/ui';
import type { Match, SantaDetails, SantaPerson } from '@games/api-client';
import { useTableDraft } from '../shared/table-draft';
import {
  canDo,
  excludedFor,
  groupsFor,
  hasSeveralNames,
  personName,
  splitNames,
  tidy,
  type SantaIntent,
} from './santa-actions';
import { SantaChecklist } from './SantaChecklist';

type Send = (...intents: SantaIntent[]) => void;

/** The chips under a name: who this person can't draw, and the groups they are in. */
export function PersonRules({ detail, person }: { detail: SantaDetails; person: SantaPerson }) {
  const excluded = excludedFor(detail, person.id);
  const groups = groupsFor(detail, person.id);
  if (!excluded.length && !groups.length) return null;
  return (
    <ul className="santa-chips" aria-label={`Rules for ${person.name}`}>
      {excluded.map((id) => (
        <li key={`pair:${id}`} className="santa-chip" data-kind="pair">
          Can’t draw: {personName(detail, id)}
        </li>
      ))}
      {groups.map((group) => (
        <li key={`group:${group.id}`} className="santa-chip" data-kind="group">
          Group: {group.label}
        </li>
      ))}
    </ul>
  );
}

function PersonRow({
  detail,
  match,
  person,
  index,
  paused,
  send,
  onExclusions,
}: {
  detail: SantaDetails;
  match: Match;
  person: SantaPerson;
  index: number;
  paused: boolean;
  send: Send;
  onExclusions: () => void;
}) {
  const [name, setName] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const renameId = `santa-rename-button-${person.id}`;
  const removeId = `santa-remove-button-${person.id}`;
  // The button is back in the page on the next frame.
  const focusLater = (id: string) =>
    requestAnimationFrame(() => document.getElementById(id)?.focus());
  const canRename = canDo(match, 'rename', person.id);
  const canRemove = canDo(match, 'remove_name', person.id);
  const canExclude = canDo(match, 'set_exclusions', person.id);
  const hasRules =
    excludedFor(detail, person.id).length > 0 || groupsFor(detail, person.id).length > 0;
  const closeRename = () => {
    setName(null);
    focusLater(renameId);
  };
  return (
    <li className="santa-person" data-renaming={name !== null || undefined}>
      <span aria-hidden="true">
        <Avatar name={person.name} seed={index} size="sm" />
      </span>
      <div className="santa-person__main">
        {name !== null ? (
          <form
            className="santa-rename"
            onSubmit={(event) => {
              event.preventDefault();
              const text = tidy(name);
              if (text && text !== person.name) send({ type: 'rename', target: person.id, text });
              closeRename();
            }}
          >
            <label className="sr-only" htmlFor={`santa-rename-${person.id}`}>
              New name for {person.name}
            </label>
            <input
              id={`santa-rename-${person.id}`}
              className="input"
              value={name}
              maxLength={detail.limits.name}
              autoComplete="off"
              autoFocus
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.stopPropagation();
                  closeRename();
                }
              }}
            />
            <Button type="submit" size="icon" variant="secondary" aria-label="Save name">
              <Check size={18} aria-hidden="true" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Cancel renaming"
              onClick={closeRename}
            >
              <X size={18} aria-hidden="true" />
            </Button>
          </form>
        ) : (
          <strong className="santa-person__name">{person.name}</strong>
        )}
        <PersonRules detail={detail} person={person} />
      </div>
      {name === null && (canExclude || canRename || canRemove) ? (
        <div className="santa-person__actions">
          {canExclude ? (
            <Button
              size="sm"
              variant="secondary"
              aria-label={`Choose who ${person.name} can’t draw`}
              disabled={paused}
              onClick={onExclusions}
            >
              Can’t draw
            </Button>
          ) : null}
          {canRename ? (
            <Button
              id={renameId}
              size="icon"
              variant="ghost"
              aria-label={`Rename ${person.name}`}
              title="Rename"
              disabled={paused}
              onClick={() => {
                setConfirmRemove(false);
                setName(person.name);
              }}
            >
              <Pencil size={17} aria-hidden="true" />
            </Button>
          ) : null}
          {canRemove ? (
            confirmRemove ? (
              // A person with rules takes their rules with them: ask once.
              <>
                <Button
                  size="sm"
                  variant="danger"
                  autoFocus
                  disabled={paused}
                  onClick={() => send({ type: 'remove_name', target: person.id })}
                >
                  Remove {person.name}?
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setConfirmRemove(false);
                    focusLater(removeId);
                  }}
                >
                  Keep
                </Button>
              </>
            ) : (
              <Button
                id={removeId}
                size="icon"
                variant="ghost"
                aria-label={`Remove ${person.name}`}
                title="Remove"
                disabled={paused}
                onClick={() => {
                  if (hasRules) setConfirmRemove(true);
                  else send({ type: 'remove_name', target: person.id });
                }}
              >
                <Trash2 size={17} aria-hidden="true" />
              </Button>
            )
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

/**
 * The people in the draw. They are names the organiser types, not players: none
 * of them needs an account. Each row can be renamed, removed or given a list of
 * people it must not be paired with.
 */
export function SantaPeople({
  detail,
  match,
  scope,
  waitingNames,
  paused,
  send,
  onNotice,
}: {
  detail: SantaDetails;
  match: Match;
  scope: string;
  /** Names already queued to be added, so the counter and limit include them. */
  waitingNames: number;
  paused: boolean;
  send: Send;
  onNotice: (message: string) => void;
}) {
  const [text, setText] = useTableDraft(`${scope}:new-name`, '');
  const [excluding, setExcluding] = useState<string | null>(null);
  const field = useRef<HTMLInputElement>(null);
  const canAdd = canDo(match, 'add_name');
  const limit = detail.limits.people;
  const room = Math.max(0, limit - detail.people.length - waitingNames);
  const editing = detail.people.find((person) => person.id === excluding);
  function add(names: string[]) {
    if (!names.length) return;
    const accepted = names.slice(0, room);
    send(...accepted.map((name) => ({ type: 'add_name' as const, text: name })));
    const left = names.length - accepted.length;
    if (left)
      onNotice(
        accepted.length
          ? `Only ${accepted.length} more ${accepted.length === 1 ? 'name fits' : 'names fit'}. ${left} left out: the list holds ${limit}.`
          : `The list is full at ${limit} people.`,
      );
  }
  return (
    <section className="santa-card santa-people" aria-labelledby="santa-people-title">
      <div className="santa-card__heading">
        <h3 id="santa-people-title">People</h3>
        <span className="santa-count" aria-label={`${detail.people.length} of ${limit} people`}>
          {detail.people.length} of {limit}
        </span>
      </div>
      {canAdd ? (
        <form
          className="santa-add"
          onSubmit={(event) => {
            event.preventDefault();
            add(splitNames(text, detail.limits.name));
            setText('');
            // Enter adds and the field is ready for the next name.
            field.current?.focus();
          }}
        >
          <label className="santa-field__label" htmlFor="santa-new-name">
            Add a name
          </label>
          <div className="santa-field__row">
            <input
              ref={field}
              id="santa-new-name"
              className="input"
              value={text}
              // A typed list ("Sam, Priya") may be longer than one name.
              maxLength={hasSeveralNames(text) ? 2000 : detail.limits.name}
              placeholder="Name or nickname"
              autoComplete="off"
              autoCapitalize="words"
              enterKeyHint="enter"
              disabled={paused}
              aria-describedby="santa-new-name-help"
              onChange={(event) => setText(event.target.value)}
              onPaste={(event) => {
                const pasted = event.clipboardData.getData('text');
                if (!hasSeveralNames(pasted)) return;
                // A pasted list goes in one name at a time, in its own order.
                event.preventDefault();
                add(splitNames(pasted, detail.limits.name));
              }}
            />
            <Button type="submit" disabled={paused || !tidy(text) || room === 0}>
              <Plus size={17} aria-hidden="true" />
              Add
            </Button>
          </div>
          <p className="small muted santa-add__help" id="santa-new-name-help">
            {room === 0
              ? `The list is full at ${limit} people.`
              : 'Paste a list separated by commas or new lines to add several at once.'}
          </p>
        </form>
      ) : null}
      {detail.people.length ? (
        <ul className="santa-people-list">
          {detail.people.map((person, index) => (
            <PersonRow
              key={person.id}
              detail={detail}
              match={match}
              person={person}
              index={index}
              paused={paused}
              send={send}
              onExclusions={() => setExcluding(person.id)}
            />
          ))}
        </ul>
      ) : (
        <p className="muted santa-empty">
          No one yet. Add everyone who is taking part, including yourself if you are.
        </p>
      )}
      {editing ? (
        <SantaChecklist
          key={editing.id}
          title={`Who can’t ${editing.name} draw?`}
          description={`${editing.name} won’t draw the people you tick, and they won’t draw ${editing.name}.`}
          people={detail.people
            .filter((person) => person.id !== editing.id)
            .map((person) => {
              const shared = groupsFor(detail, editing.id).find((group) =>
                group.members.includes(person.id),
              );
              return {
                id: person.id,
                name: person.name,
                note: shared ? `Already apart: both in ${shared.label}` : undefined,
              };
            })}
          selected={excludedFor(detail, editing.id)}
          empty="Add more people first."
          disabled={paused}
          onSave={(ids) => {
            send({ type: 'set_exclusions', target: editing.id, ids });
            setExcluding(null);
          }}
          onClose={() => setExcluding(null)}
        />
      ) : null}
    </section>
  );
}
