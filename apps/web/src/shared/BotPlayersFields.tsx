'use client';
import type { BotLevel } from '@games/api-client';
import { ChoiceGroup } from '@games/ui';
import { botLevelChoices, botRowNames, type BotRow } from './bot-seats';

const levels = botLevelChoices.map(({ value, label }) => ({ value, label }));

/**
 * One row per bot the room will seat: a name the host may change and how well it
 * plays. The server names and seats the bots; this only collects the choices.
 */
export function BotPlayersFields({
  rows,
  hostName,
  problem,
  onChange,
}: {
  rows: readonly BotRow[];
  hostName: string;
  problem: string | null;
  onChange: (index: number, change: Partial<BotRow>) => void;
}) {
  const names = botRowNames(rows, hostName);
  const shared = rows.every((row) => row.level === rows[0]?.level) ? rows[0]?.level : undefined;
  return (
    <div className="bot-setup" role="group" aria-label="Bot players">
      <div className="bot-setup-heading">
        <span className="field-label">Bot players</span>
        <span className="small muted">
          {botLevelChoices.map(({ label, hint }) => `${label}: ${hint.toLowerCase()}`).join(' · ')}
        </span>
      </div>
      {rows.length > 1 ? (
        <div className="bot-setup-row bot-setup-row--all">
          <span className="bot-setup-all-label">Set all</span>
          <ChoiceGroup<BotLevel | 'mixed'>
            label="Set all bots to"
            variant="segmented"
            options={levels}
            value={shared ?? 'mixed'}
            onChange={(level) => {
              if (level !== 'mixed') rows.forEach((_, index) => onChange(index, { level }));
            }}
          />
        </div>
      ) : null}
      <ol className="bot-setup-list">
        {rows.map((row, index) => (
          <li className="bot-setup-row" key={index}>
            <input
              className="input"
              aria-label={`Bot ${index + 1} name`}
              value={row.name ?? names[index]}
              maxLength={30}
              autoComplete="off"
              onChange={(event) => onChange(index, { name: event.target.value })}
              onBlur={(event) => {
                // An emptied field goes back to the name the bot would be given.
                if (!event.target.value.trim()) onChange(index, { name: null });
              }}
            />
            <ChoiceGroup
              label={`Bot ${index + 1} difficulty`}
              variant="segmented"
              options={levels}
              value={row.level}
              onChange={(level) => onChange(index, { level })}
            />
          </li>
        ))}
      </ol>
      {problem ? (
        <p className="error-note" role="alert">
          {problem}
        </p>
      ) : null}
    </div>
  );
}
