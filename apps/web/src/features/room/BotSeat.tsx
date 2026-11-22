'use client';
import { useState, type FormEvent } from 'react';
import { Check, Pencil, X } from 'lucide-react';
import type { BotLevel, Room } from '@games/api-client';
import { Button, Seat } from '@games/ui';
import { botLevelChoices, botLevelLabel } from '@/shared/bot-seats';

type Member = Room['members'][number];

/**
 * A bot's seat in the lobby. The host can change how well it plays, rename it in
 * place (Enter saves, Escape cancels) and remove it; everyone else reads its level.
 */
export function BotSeat({
  bot,
  others,
  editable,
  pending,
  onUpdate,
  onRemove,
}: {
  bot: Member;
  /** Names already taken at this table, so a rename cannot repeat one. */
  others: readonly string[];
  editable: boolean;
  pending: boolean;
  onUpdate?: (change: { name?: string; level?: BotLevel }) => void;
  onRemove?: () => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const level = bot.botLevel ?? 'hard';
  const name = draft?.trim().replace(/\s+/g, ' ') ?? '';
  const clash =
    draft !== null && others.some((other) => other.toLowerCase() === name.toLowerCase())
      ? `Someone here is already called “${name}”.`
      : '';
  const renameId = `rename-${bot.id}`;
  function close() {
    setDraft(null);
    // The Rename button returns with the name; hand the keyboard back to it.
    requestAnimationFrame(() => document.getElementById(renameId)?.focus());
  }
  function save(event: FormEvent) {
    event.preventDefault();
    if (!name || clash) return;
    if (name !== bot.name) onUpdate?.({ name });
    close();
  }
  const canEdit = editable && Boolean(onUpdate);
  return (
    <Seat
      name={bot.name}
      nameLayout="wrap"
      avatar={bot.avatar}
      bot
      ready={bot.ready}
      connected={bot.connected}
      badge={canEdit ? undefined : botLevelLabel(level)}
      nameEditor={
        draft !== null ? (
          <form className="bot-rename" onSubmit={save}>
            <input
              className="input"
              aria-label={`New name for ${bot.name}`}
              aria-invalid={clash ? true : undefined}
              aria-describedby={clash ? `${renameId}-problem` : undefined}
              value={draft}
              maxLength={30}
              autoFocus
              autoComplete="off"
              enterKeyHint="done"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== 'Escape') return;
                // Escape leaves the name as it was and stays in the lobby.
                event.preventDefault();
                event.stopPropagation();
                close();
              }}
            />
            <Button type="submit" size="icon" aria-label="Save name" title="Save name">
              <Check size={16} aria-hidden="true" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Cancel rename"
              title="Cancel rename"
              onClick={close}
            >
              <X size={16} aria-hidden="true" />
            </Button>
            {clash ? (
              <p className="small bot-rename-problem" id={`${renameId}-problem`} role="alert">
                {clash}
              </p>
            ) : null}
          </form>
        ) : undefined
      }
      action={
        draft !== null || !(canEdit || onRemove) ? undefined : (
          <span className="bot-seat-controls">
            {canEdit ? (
              <>
                <select
                  className="bot-level-chip"
                  aria-label={`${bot.name} difficulty`}
                  title="How well this bot plays"
                  value={level}
                  disabled={pending}
                  onChange={(event) => onUpdate?.({ level: event.target.value as BotLevel })}
                >
                  {botLevelChoices.map((choice) => (
                    <option key={choice.value} value={choice.value}>
                      {choice.label} · {choice.hint.toLowerCase()}
                    </option>
                  ))}
                </select>
                <Button
                  id={renameId}
                  size="icon"
                  variant="ghost"
                  disabled={pending}
                  aria-label={`Rename ${bot.name}`}
                  title="Rename"
                  onClick={() => setDraft(bot.name)}
                >
                  <Pencil size={15} aria-hidden="true" />
                </Button>
              </>
            ) : null}
            {onRemove ? (
              <Button
                size="icon"
                variant="ghost"
                disabled={pending}
                aria-label={`Remove ${bot.name} bot`}
                onClick={onRemove}
              >
                <X size={15} aria-hidden="true" />
              </Button>
            ) : null}
          </span>
        )
      }
    />
  );
}
