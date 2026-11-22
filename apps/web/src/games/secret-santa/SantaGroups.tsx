'use client';
import { useRef, useState } from 'react';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@games/ui';
import type { Match, SantaDetails, SantaGroup } from '@games/api-client';
import { useTableDraft } from '../shared/table-draft';
import { canDo, nameList, personName, tidy, type SantaIntent } from './santa-actions';
import { SantaChecklist } from './SantaChecklist';

type Send = (...intents: SantaIntent[]) => void;

function GroupRow({
  detail,
  match,
  group,
  paused,
  send,
  onMembers,
}: {
  detail: SantaDetails;
  match: Match;
  group: SantaGroup;
  paused: boolean;
  send: Send;
  onMembers: () => void;
}) {
  const [label, setLabel] = useState<string | null>(null);
  const renameId = `santa-group-rename-button-${group.id}`;
  const canRename = canDo(match, 'rename_group', group.id);
  const canRemove = canDo(match, 'remove_group', group.id);
  const canChoose = canDo(match, 'set_group', group.id);
  const members = group.members.map((id) => personName(detail, id));
  const closeRename = () => {
    setLabel(null);
    requestAnimationFrame(() => document.getElementById(renameId)?.focus());
  };
  return (
    <li className="santa-group">
      <div className="santa-group__main">
        {label !== null ? (
          <form
            className="santa-rename"
            onSubmit={(event) => {
              event.preventDefault();
              const text = tidy(label);
              if (text && text !== group.label)
                send({ type: 'rename_group', target: group.id, text });
              closeRename();
            }}
          >
            <label className="sr-only" htmlFor={`santa-group-rename-${group.id}`}>
              New name for the group {group.label}
            </label>
            <input
              id={`santa-group-rename-${group.id}`}
              className="input"
              value={label}
              maxLength={detail.limits.name}
              autoComplete="off"
              autoFocus
              onChange={(event) => setLabel(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.stopPropagation();
                  closeRename();
                }
              }}
            />
            <Button type="submit" size="icon" variant="secondary" aria-label="Save group name">
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
          <strong className="santa-group__name">{group.label}</strong>
        )}
        <p className="small muted santa-group__members">
          {members.length
            ? members.length === 1
              ? `${members[0]} (add at least one more person)`
              : nameList(members, 6)
            : 'No one in this group yet.'}
        </p>
      </div>
      {label === null && (canChoose || canRename || canRemove) ? (
        <div className="santa-group__actions">
          {canChoose ? (
            <Button
              size="sm"
              variant="secondary"
              aria-label={`Choose who is in ${group.label}`}
              disabled={paused}
              onClick={onMembers}
            >
              Choose people
            </Button>
          ) : null}
          {canRename ? (
            <Button
              id={renameId}
              size="icon"
              variant="ghost"
              aria-label={`Rename the group ${group.label}`}
              title="Rename"
              disabled={paused}
              onClick={() => setLabel(group.label)}
            >
              <Pencil size={17} aria-hidden="true" />
            </Button>
          ) : null}
          {canRemove ? (
            <Button
              size="icon"
              variant="ghost"
              aria-label={`Remove the group ${group.label}`}
              title="Remove"
              disabled={paused}
              onClick={() => send({ type: 'remove_group', target: group.id })}
            >
              <Trash2 size={17} aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

/**
 * Exclusions by group: nobody draws someone who shares a group with them.
 * A person may be in more than one group.
 */
export function SantaGroups({
  detail,
  match,
  scope,
  paused,
  send,
}: {
  detail: SantaDetails;
  match: Match;
  scope: string;
  paused: boolean;
  send: Send;
}) {
  const [text, setText] = useTableDraft(`${scope}:new-group`, '');
  const [choosing, setChoosing] = useState<string | null>(null);
  const field = useRef<HTMLInputElement>(null);
  const canAdd = canDo(match, 'add_group');
  const limit = detail.limits.groups;
  const full = detail.groups.length >= limit;
  const editing = detail.groups.find((group) => group.id === choosing);
  return (
    <section className="santa-card santa-groups" aria-labelledby="santa-groups-title">
      <div className="santa-card__heading">
        <h3 id="santa-groups-title">Groups</h3>
        <span className="santa-count" aria-label={`${detail.groups.length} of ${limit} groups`}>
          {detail.groups.length} of {limit}
        </span>
      </div>
      <p className="small muted santa-card__lead">
        People in the same group never draw each other: couples, households, teams.
      </p>
      {canAdd ? (
        <form
          className="santa-add"
          onSubmit={(event) => {
            event.preventDefault();
            const label = tidy(text);
            if (!label) return;
            send({ type: 'add_group', text: label });
            setText('');
            field.current?.focus();
          }}
        >
          <label className="santa-field__label" htmlFor="santa-new-group">
            Add a group
          </label>
          <div className="santa-field__row">
            <input
              ref={field}
              id="santa-new-group"
              className="input"
              value={text}
              maxLength={detail.limits.name}
              placeholder="For example, The Patels"
              autoComplete="off"
              autoCapitalize="words"
              disabled={paused}
              onChange={(event) => setText(event.target.value)}
            />
            <Button type="submit" variant="secondary" disabled={paused || !tidy(text) || full}>
              <Plus size={17} aria-hidden="true" />
              Add group
            </Button>
          </div>
        </form>
      ) : full ? (
        <p className="small muted">You have {limit} groups, the most a draw can hold.</p>
      ) : null}
      {detail.groups.length ? (
        <ul className="santa-group-list">
          {detail.groups.map((group) => (
            <GroupRow
              key={group.id}
              detail={detail}
              match={match}
              group={group}
              paused={paused}
              send={send}
              onMembers={() => setChoosing(group.id)}
            />
          ))}
        </ul>
      ) : null}
      {editing ? (
        <SantaChecklist
          key={editing.id}
          title={`Who is in ${editing.label}?`}
          description="People in this group won’t draw each other."
          people={detail.people.map((person) => ({ id: person.id, name: person.name }))}
          selected={editing.members}
          empty="Add people to the draw first."
          disabled={paused}
          onSave={(ids) => {
            send({ type: 'set_group', target: editing.id, ids });
            setChoosing(null);
          }}
          onClose={() => setChoosing(null)}
        />
      ) : null}
    </section>
  );
}
