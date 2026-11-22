'use client';
import { useEffect, useRef, useState } from 'react';
import { CalendarDays, MapPin, Wallet, X } from 'lucide-react';
import { Button } from '@games/ui';
import type { Match, SantaDetails } from '@games/api-client';
import { useTableDraft } from '../shared/table-draft';
import { canDo, tidy, type SantaIntent } from './santa-actions';
import { MAX_DAY, dateInputToDay, dayToDateInput, formatDay } from './santa-date';

type Send = (...intents: SantaIntent[]) => void;

/** How long a picked date waits for more typing before it is saved. */
const DATE_SETTLE_MS = 900;

function TextField({
  id,
  label,
  saved,
  limit,
  placeholder,
  draftKey,
  editable,
  clearable,
  busy,
  paused,
  onSave,
  onClear,
}: {
  id: string;
  label: string;
  saved: string;
  limit: number;
  placeholder: string;
  draftKey: string;
  editable: boolean;
  clearable: boolean;
  busy: boolean;
  paused: boolean;
  onSave: (text: string) => void;
  onClear?: () => void;
}) {
  // Unsaved typing survives a refresh in this tab, for this event only.
  const [draft, setDraft] = useTableDraft<string | null>(draftKey, null);
  const [editing, setEditing] = useState(false);
  const sent = useRef<string | null>(null);
  // Once the server holds what was typed, the field shows the saved value again.
  if (draft !== null && !editing && tidy(draft) === saved) setDraft(null);
  const value = draft ?? saved;
  const unsaved = draft !== null && !editing && tidy(draft) !== saved;
  function commit() {
    if (draft === null) return;
    const text = tidy(draft);
    if (text === saved) return setDraft(null);
    // Enter followed by leaving the field is one save, not two.
    if (busy && sent.current === text) return;
    if (!text) {
      // A title is required; an optional field left empty is cleared.
      if (!onClear) return setDraft(null);
      sent.current = text;
      return onClear();
    }
    sent.current = text;
    onSave(text);
  }
  return (
    <div className="santa-field" data-unsaved={unsaved || undefined}>
      <label className="santa-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="santa-field__row">
        <input
          id={id}
          className="input"
          value={value}
          maxLength={limit}
          placeholder={placeholder}
          disabled={!editable || paused}
          autoComplete="off"
          enterKeyHint="done"
          aria-describedby={`${id}-note`}
          onFocus={() => setEditing(true)}
          onChange={(event) => {
            sent.current = null;
            setDraft(event.target.value);
          }}
          onBlur={() => {
            setEditing(false);
            commit();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
              event.preventDefault();
              commit();
            } else if (event.key === 'Escape' && draft !== null) {
              // Escape gives the saved value back without closing anything else.
              event.stopPropagation();
              setDraft(null);
            }
          }}
        />
        {clearable && saved && onClear ? (
          <Button
            size="icon"
            variant="ghost"
            className="santa-clear"
            aria-label={`Clear ${label.toLowerCase()}`}
            title={`Clear ${label.toLowerCase()}`}
            disabled={paused}
            onClick={() => {
              setDraft(null);
              onClear();
            }}
          >
            <X size={18} aria-hidden="true" />
          </Button>
        ) : null}
      </div>
      <p className="santa-field__note small" id={`${id}-note`}>
        {unsaved ? (busy ? 'Saving…' : 'Not saved yet. Press Enter to save.') : ''}
      </p>
    </div>
  );
}

function DateField({
  id,
  day,
  editable,
  clearable,
  busy,
  paused,
  send,
}: {
  id: string;
  day: number | null;
  editable: boolean;
  clearable: boolean;
  busy: boolean;
  paused: boolean;
  send: Send;
}) {
  const saved = dayToDateInput(day);
  const [draft, setDraft] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const sent = useRef<string | null>(null);
  const settle = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(settle.current), []);
  if (draft !== null && !editing && draft === saved) setDraft(null);
  const value = draft ?? saved;
  const unsaved = draft !== null && !editing && draft !== saved;
  function commit(text: string) {
    window.clearTimeout(settle.current);
    if (text === saved) return;
    if (busy && sent.current === text) return;
    if (!text) {
      if (day === null || !clearable) return;
      sent.current = text;
      return send({ type: 'clear', target: 'day' });
    }
    const next = dateInputToDay(text);
    setInvalid(next === null);
    if (next === null) return;
    sent.current = text;
    send({ type: 'set_day', day: next });
  }
  return (
    <div className="santa-field" data-unsaved={unsaved || undefined}>
      <label className="santa-field__label" htmlFor={id}>
        Date
      </label>
      <div className="santa-field__row">
        <input
          id={id}
          className="input"
          type="date"
          value={value}
          min="2020-01-01"
          max={dayToDateInput(MAX_DAY)}
          disabled={!editable || paused}
          aria-describedby={`${id}-note`}
          aria-invalid={invalid || undefined}
          onFocus={() => setEditing(true)}
          onChange={(event) => {
            const text = event.target.value;
            sent.current = null;
            setInvalid(false);
            setDraft(text);
            // A date chosen in a phone's picker never blurs the field, so a complete
            // date is saved once it has stopped changing.
            window.clearTimeout(settle.current);
            if (dateInputToDay(text) !== null)
              settle.current = window.setTimeout(() => commit(text), DATE_SETTLE_MS);
          }}
          onBlur={(event) => {
            setEditing(false);
            commit(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              commit(event.currentTarget.value);
            }
          }}
        />
        {clearable && day !== null ? (
          <Button
            size="icon"
            variant="ghost"
            className="santa-clear"
            aria-label="Clear date"
            title="Clear date"
            disabled={paused}
            onClick={() => {
              window.clearTimeout(settle.current);
              setDraft(null);
              setInvalid(false);
              send({ type: 'clear', target: 'day' });
            }}
          >
            <X size={18} aria-hidden="true" />
          </Button>
        ) : null}
      </div>
      <p className="santa-field__note small" id={`${id}-note`} data-invalid={invalid || undefined}>
        {invalid
          ? 'Choose a date from 2020 onwards.'
          : unsaved
            ? busy
              ? 'Saving…'
              : 'Not saved yet. Press Enter to save.'
            : formatDay(day)}
      </p>
    </div>
  );
}

/**
 * The event's own details. Each field saves through its own action when the
 * organiser leaves it or presses Enter, and the card always shows what is saved.
 * It stays editable after the draw: the details can change without a redraw.
 */
export function SantaEventCard({
  detail,
  match,
  scope,
  busy,
  paused,
  send,
}: {
  detail: SantaDetails;
  match: Match;
  scope: string;
  busy: boolean;
  paused: boolean;
  send: Send;
}) {
  const date = formatDay(detail.day);
  const editable = canDo(match, 'set_title');
  return (
    <section className="santa-card santa-event" aria-labelledby="santa-event-title">
      <div className="santa-card__heading">
        <h3 id="santa-event-title">The event</h3>
      </div>
      <dl className="santa-summary" aria-label="Saved details">
        <div data-empty={!date || undefined}>
          <dt>
            <CalendarDays size={15} aria-hidden="true" />
            <span className="sr-only">Date</span>
          </dt>
          <dd>{date || 'No date yet'}</dd>
        </div>
        <div data-empty={!detail.location || undefined}>
          <dt>
            <MapPin size={15} aria-hidden="true" />
            <span className="sr-only">Location</span>
          </dt>
          <dd>{detail.location || 'No location yet'}</dd>
        </div>
        <div data-empty={!detail.budget || undefined}>
          <dt>
            <Wallet size={15} aria-hidden="true" />
            <span className="sr-only">Budget</span>
          </dt>
          <dd>{detail.budget || 'No budget yet'}</dd>
        </div>
      </dl>
      {editable || match.phase !== 'finished' ? (
        <div className="santa-fields">
          <TextField
            id="santa-title"
            label="Title"
            saved={detail.title}
            limit={detail.limits.title}
            placeholder="Office party"
            draftKey={`${scope}:title`}
            editable={editable}
            clearable={false}
            busy={busy}
            paused={paused}
            onSave={(text) => send({ type: 'set_title', text })}
          />
          <DateField
            id="santa-date"
            day={detail.day}
            editable={canDo(match, 'set_day')}
            clearable={canDo(match, 'clear', 'day')}
            busy={busy}
            paused={paused}
            send={send}
          />
          <TextField
            id="santa-location"
            label="Location"
            saved={detail.location}
            limit={detail.limits.location}
            placeholder="Where you’ll swap gifts"
            draftKey={`${scope}:location`}
            editable={canDo(match, 'set_location')}
            clearable={canDo(match, 'clear', 'location')}
            busy={busy}
            paused={paused}
            onSave={(text) => send({ type: 'set_location', text })}
            onClear={
              canDo(match, 'clear', 'location')
                ? () => send({ type: 'clear', target: 'location' })
                : undefined
            }
          />
          <TextField
            id="santa-budget"
            label="Budget"
            saved={detail.budget}
            limit={detail.limits.budget}
            placeholder="For example, 10 each"
            draftKey={`${scope}:budget`}
            editable={canDo(match, 'set_budget')}
            clearable={canDo(match, 'clear', 'budget')}
            busy={busy}
            paused={paused}
            onSave={(text) => send({ type: 'set_budget', text })}
            onClear={
              canDo(match, 'clear', 'budget')
                ? () => send({ type: 'clear', target: 'budget' })
                : undefined
            }
          />
        </div>
      ) : null}
    </section>
  );
}
