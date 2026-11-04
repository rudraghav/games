'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button, DecisionDock, AzulTileArt } from '@games/ui';
import { azulDetails } from '@games/api-client';
import { PlayerStrip } from '../shared/PlayerStrip';
import { useTableDraft } from '../shared/table-draft';
import { playerName, type TableProps } from '../types';

const colors = ['blue', 'yellow', 'red', 'black', 'white'] as const;
const floorPenalties = [1, 1, 2, 2, 2, 3, 3];
const FLOOR_SLOTS = 7;
const wallColumn = (row: number, color: string) =>
  ((colors as readonly string[]).indexOf(color) + row) % 5;
const plural = (n: number, word: string, many = `${word}s`) => `${n} ${n === 1 ? word : many}`;
/** Points lost when `added` tiles join a floor that already holds `start`. */
const floorCost = (start: number, added: number) =>
  floorPenalties
    .slice(Math.min(FLOOR_SLOTS, start), Math.min(FLOOR_SLOTS, start + added))
    .reduce((sum, value) => sum + value, 0);

type Staged = { source: string; color: string };
type Preview = {
  choice: string;
  row: number | null;
  legal: boolean;
  reason: string;
  fits: number;
  overflow: number;
  penalty: number;
  discarded: number;
  completes: boolean;
  /** Tiles on the line after placing. */
  filled: number;
};

/**
 * Where a draft of `count` tiles could go, mirroring the public placement rule so
 * the consequence is visible before anything is sent. The server still decides.
 */
function previews(
  color: string,
  count: number,
  floorStart: number,
  lines: string[][],
  wall: (string | null)[][],
): Preview[] {
  const rows = lines.map((line, row) => {
    const spaces = row + 1 - line.length;
    const legal =
      spaces > 0 && (!line.length || line[0] === color) && !wall[row][wallColumn(row, color)];
    const fits = legal ? Math.min(spaces, count) : 0;
    const overflow = legal ? count - fits : 0;
    return {
      choice: String(row),
      row,
      legal,
      reason: !spaces
        ? 'Full'
        : line.length && line[0] !== color
          ? `Holds ${line[0]}`
          : `${color} on wall`,
      fits,
      overflow,
      penalty: floorCost(floorStart, overflow),
      discarded: Math.max(0, floorStart + overflow - FLOOR_SLOTS),
      completes: legal && line.length + fits === row + 1,
      filled: line.length + fits,
    };
  });
  return [
    ...rows,
    {
      choice: 'floor',
      row: null,
      legal: true,
      reason: '',
      fits: 0,
      overflow: count,
      penalty: floorCost(floorStart, count),
      discarded: Math.max(0, floorStart + count - FLOOR_SLOTS),
      completes: false,
      filled: 0,
    },
  ];
}

function Tile({
  color,
  ghost = false,
  label,
  decorative = false,
}: {
  color: string;
  ghost?: boolean;
  label?: string;
  decorative?: boolean;
}) {
  return (
    <span
      className="azul-tile"
      data-color={color}
      data-ghost={ghost}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={
        decorative
          ? undefined
          : label || (color === 'first' ? 'First-player marker' : `${color} tile`)
      }
    >
      <AzulTileArt color={color} />
    </span>
  );
}

/** A one-glance board: pattern lines on the left, the wall as dots on the right. */
function MiniBoard({ lines, wall }: { lines: string[][]; wall: (string | null)[][] }) {
  const started = lines
    .map((line, row) =>
      line.length ? `line ${row + 1} has ${line.length} of ${row + 1} ${line[0]}` : null,
    )
    .filter(Boolean);
  const placed = wall.flat().filter(Boolean).length;
  return (
    <span
      className="azul-mini-board"
      role="img"
      aria-label={`${started.length ? `Pattern lines: ${started.join(', ')}` : 'Pattern lines empty'}. ${plural(placed, 'wall tile')}.`}
    >
      <span className="azul-mini-lines" aria-hidden="true">
        {lines.map((line, row) => (
          <span key={row}>
            {Array.from({ length: row + 1 }, (_, col) => (
              <i key={col} data-color={col >= row + 1 - line.length ? line[0] : undefined} />
            ))}
          </span>
        ))}
      </span>
      <span className="azul-mini-wall" aria-hidden="true">
        {wall.flatMap((tiles, row) =>
          tiles.map((tile, col) => (
            <i
              key={`${row}-${col}`}
              data-color={tile || undefined}
              data-slot={colors[(col - row + 5) % 5]}
            />
          )),
        )}
      </span>
    </span>
  );
}

function bonusParts(wall: (string | null)[][]) {
  const rows = wall.filter((row) => row.every(Boolean)).length;
  const columns = [0, 1, 2, 3, 4].filter((col) => wall.every((row) => row[col])).length;
  const sets = colors.filter((color) =>
    wall.every((row, index) => row[wallColumn(index, color)]),
  ).length;
  return { rows, columns, sets };
}

export function AzulTable(props: TableProps) {
  const { match, room, selfId, pending, onAction } = props;
  const data = azulDetails(match.detail);
  const blocked = pending || room.paused;
  const name = (id: string) => playerName(room, id);
  const seated = match.players.some((player) => player.id === selfId);
  const myTurn = match.currentPlayer === selfId;
  const actorName = match.currentPlayer ? name(match.currentPlayer) : '';
  // A chosen colour is staged in this tab until a line is picked, so the
  // consequences show before any move is sent and survive a refresh.
  const [stagedDraft, setStaged] = useTableDraft<Staged | null>(
    `azul:${room.id}:${room.matchId}:${room.matchVersion}`,
    null,
  );
  const queued = useRef<{ choice: string; color: string; count: number; version: number } | null>(
    null,
  );
  const focusChoice = useRef(false);
  const sourceTiles = (source: string) =>
    source === 'center' ? data.center : data.factories[Number(source)] || [];
  const draftOption = (source: string, color: string) =>
    match.actions.find(
      (option) =>
        option.value.type === 'draft_tiles' &&
        option.value.choice === source &&
        option.value.color === color,
    );
  const staged =
    match.phase === 'drafting' && stagedDraft && draftOption(stagedDraft.source, stagedDraft.color)
      ? stagedDraft
      : null;
  const stagedCount = staged
    ? sourceTiles(staged.source).filter((tile) => tile === staged.color).length
    : 0;
  const takesMarker = Boolean(staged && staged.source === 'center' && data.marker);
  const ownFloor = seated ? data.floors[selfId] || [] : [];
  const placingMine = match.phase === 'placing' && myTurn && match.actions.length > 0;
  const placeOption = (choice: string) =>
    match.actions.find(
      (option) => option.value.type === 'place_tiles' && option.value.choice === choice,
    );
  // The acting seat always sees its destinations in the dock, so the table never jumps.
  const deciding =
    seated &&
    myTurn &&
    match.actions.length > 0 &&
    (match.phase === 'drafting' || match.phase === 'placing');
  const choiceColor = staged ? staged.color : placingMine ? data.draft[0] : null;
  const choiceCount = staged ? stagedCount : placingMine ? data.draft.length : 0;
  const choices =
    choiceColor && seated
      ? previews(
          choiceColor,
          choiceCount,
          Math.min(FLOOR_SLOTS, ownFloor.length + (takesMarker ? 1 : 0)),
          data.lines[selfId],
          data.walls[selfId],
        ).map((preview) =>
          placingMine ? { ...preview, legal: Boolean(placeOption(preview.choice)) } : preview,
        )
      : [];

  function stage(source: string, color: string) {
    if (staged?.source === source && staged.color === color) {
      setStaged(null);
      return;
    }
    focusChoice.current = true;
    setStaged({ source, color });
  }

  /** One decision, two saved moves: the draft, then the placement it was previewed with. */
  function choose(choice: string) {
    if (placingMine) {
      const option = placeOption(choice);
      if (option) onAction(option.value);
      return;
    }
    if (!staged || room.matchVersion == null) return;
    const option = draftOption(staged.source, staged.color);
    if (!option) return;
    queued.current = {
      choice,
      color: staged.color,
      count: stagedCount,
      version: room.matchVersion,
    };
    setStaged(null);
    onAction(option.value);
  }

  useEffect(() => {
    const next = queued.current;
    if (!next || pending || room.matchVersion == null || room.matchVersion === next.version) return;
    queued.current = null;
    // Only the very next saved state, with exactly the previewed draft, is placed.
    if (
      room.matchVersion !== next.version + 1 ||
      match.phase !== 'placing' ||
      match.currentPlayer !== selfId ||
      data.draft.length !== next.count ||
      data.draft[0] !== next.color
    )
      return;
    const option = match.actions.find(
      (entry) => entry.value.type === 'place_tiles' && entry.value.choice === next.choice,
    );
    if (option) onAction(option.value);
  }, [
    room.matchVersion,
    pending,
    match.phase,
    match.currentPlayer,
    match.actions,
    selfId,
    data.draft,
    onAction,
  ]);

  useEffect(() => {
    if (!focusChoice.current || !staged) return;
    focusChoice.current = false;
    // Keyboard users land on the first legal destination that is on screen.
    const target = Array.from(
      document.querySelectorAll<HTMLButtonElement>('.azul-table [data-azul-choice]:enabled'),
    ).find((element) =>
      typeof element.checkVisibility === 'function'
        ? element.checkVisibility()
        : element.offsetParent !== null,
    );
    if (target && document.activeElement?.closest('.azul-supply'))
      target.focus({ preventScroll: true });
  }, [staged]);

  /** Before a colour is chosen, each destination says what it already holds. */
  const idleFacts = (row: number | null): [string, string | null] => {
    if (row === null)
      return [ownFloor.length ? `−${floorCost(0, ownFloor.length)} so far` : 'empty', null];
    const line = data.lines[selfId][row];
    return [
      line.length === row + 1
        ? 'full'
        : line.length
          ? `${line.length}/${row + 1} ${line[0]}`
          : 'empty',
      null,
    ];
  };
  /** At most two short facts: the line's progress, then any floor cost. */
  const previewFacts = (preview: Preview, compact = false): [string, string | null] => {
    if (!preview.legal) return [preview.reason, null];
    if (preview.row === null)
      return [
        preview.penalty ? `−${preview.penalty}${compact ? ' pts' : ''}` : 'no cost',
        preview.discarded ? `${preview.discarded} discarded` : null,
      ];
    return [
      preview.completes ? 'completes' : `${preview.filled}/${preview.row + 1} filled`,
      preview.overflow
        ? compact
          ? `−${preview.penalty} pts`
          : `${preview.overflow} to floor −${preview.penalty}`
        : null,
    ];
  };
  const previewName = (preview: Preview) =>
    preview.row === null
      ? `Choose the floor: ${plural(choiceCount, 'tile')}${preview.penalty ? `, costing ${plural(preview.penalty, 'point')}` : ', no cost'}`
      : preview.legal
        ? `Choose pattern line ${preview.row + 1}: ${preview.fits} ${preview.fits === 1 ? 'fits' : 'fit'}${preview.completes ? ', completes the line' : ''}${preview.overflow ? `, ${preview.overflow} to the floor costing ${plural(preview.penalty, 'point')}` : ''}`
        : `Pattern line ${preview.row + 1}: ${preview.reason}`;

  function offer(tiles: string[], source: string) {
    const sourceName = source === 'center' ? 'center' : `factory ${Number(source) + 1}`;
    return (
      <section
        className={`azul-factory${source === 'center' ? ' azul-factory--center' : ''}`}
        key={source}
        aria-label={source === 'center' ? 'Center offer' : `Factory ${Number(source) + 1}`}
        data-empty={!tiles.length && !(source === 'center' && data.marker)}
        data-staged={staged?.source === source}
      >
        <span className="small muted azul-factory-label">
          {source === 'center' ? (
            'Center'
          ) : (
            <>
              <span className="azul-factory-word">Factory </span>
              {Number(source) + 1}
            </>
          )}
          {source === 'center' && data.marker ? ' · first player' : ''}
        </span>
        <div className="azul-factory-colors">
          {source === 'center' && data.marker ? (
            <span className="azul-center-marker">
              <Tile color="first" />
            </span>
          ) : null}
          {colors
            .filter((color) => tiles.includes(color))
            .map((color) => {
              const option = draftOption(source, color);
              const count = tiles.filter((t) => t === color).length;
              const chosen = staged?.source === source && staged.color === color;
              // The rest of a staged factory slides to the centre with the draft.
              const moving = staged?.source === source && !chosen && source !== 'center';
              return (
                <button
                  key={color}
                  className="azul-draft-button"
                  type="button"
                  disabled={blocked || !option}
                  aria-pressed={option ? chosen : undefined}
                  data-moving={moving}
                  aria-label={`Take ${count} ${color} from ${sourceName}${source === 'center' && data.marker ? ' and the first-player marker' : ''}`}
                  onClick={() => option && stage(source, color)}
                >
                  <Tile color={color} />
                  <b>×{count}</b>
                </button>
              );
            })}
          {!tiles.length && !(source === 'center' && data.marker) ? (
            <span className="azul-empty-offer">Empty</span>
          ) : null}
        </div>
      </section>
    );
  }

  const orderedPlayers = [...match.players].sort(
    (a, b) => Number(b.id === selfId) - Number(a.id === selfId),
  );
  const next = match.actions.find((option) => option.value.type === 'next_round');
  const roundOver = match.phase === 'round_over';
  const finished = match.phase === 'finished';
  const heading = finished
    ? 'Final walls'
    : roundOver
      ? `Round ${data.round} scored`
      : match.phase === 'placing'
        ? myTurn
          ? 'Place your tiles'
          : `${actorName} is placing tiles`
        : myTurn
          ? 'Your turn: take tiles'
          : `${actorName} is taking tiles`;
  const starterNote = finished
    ? null
    : roundOver
      ? `${name(data.starter)} starts round ${data.round + 1}`
      : data.marker
        ? 'First center taker starts next round'
        : `${name(data.starter)} starts next round`;

  const stagedTiles = staged ? Array.from({ length: stagedCount }, () => staged.color) : [];
  const stagedRemainder =
    staged && staged.source !== 'center'
      ? sourceTiles(staged.source).filter((tile) => tile !== staged.color)
      : [];
  const markerCost =
    takesMarker && ownFloor.length < FLOOR_SLOTS ? floorPenalties[ownFloor.length] : 0;
  const pinned = Boolean(staged) || placingMine || (roundOver && Boolean(next));

  let dockLabel = 'Your drafted tiles';
  let dock: ReactNode;
  if (finished || roundOver) {
    dockLabel = finished ? 'Final scores' : 'Round review';
    dock = (
      <>
        <div className="azul-review" role="list" aria-label={dockLabel}>
          {[...match.players]
            .sort((a, b) => b.score - a.score)
            .map((player) => {
              const last = data.last_scores[player.id];
              const bonus = bonusParts(data.walls[player.id]);
              return (
                <div
                  key={player.id}
                  role="listitem"
                  data-winner={finished && match.winners.includes(player.id)}
                >
                  <strong>
                    {name(player.id)}
                    {player.id === selfId ? ' · you' : ''}
                  </strong>
                  <span>
                    {last
                      ? `+${last.wall} wall${last.floor ? ` · −${last.floor} floor` : ' · no floor loss'}`
                      : 'No change'}
                    {finished
                      ? ` · bonus +${last?.bonus ?? 0} (${plural(bonus.rows, 'row')}, ${plural(bonus.columns, 'column')}, ${plural(bonus.sets, 'colour set')})`
                      : ''}
                    {player.score === 0 && last && last.floor > last.wall
                      ? ' · scores never drop below 0'
                      : ''}
                  </span>
                  <b>{plural(player.score, 'pt', 'pts')}</b>
                </div>
              );
            })}
        </div>
        {finished ? (
          <p className="azul-dock-note">
            Bonuses: row +2, column +7, colour set +10. Ties go to more complete rows.
          </p>
        ) : next ? (
          <div className="azul-dock-actions" data-decision-actions>
            <p>Unfinished lines stay on your board.</p>
            <Button disabled={blocked} onClick={() => onAction(next.value)}>
              Start round {data.round + 1}
            </Button>
          </div>
        ) : (
          <p className="azul-dock-note">
            Waiting for {name(data.starter)} to start round {data.round + 1}. Unfinished lines stay.
          </p>
        )}
      </>
    );
  } else if (staged) {
    dock = (
      <>
        <div className="azul-dock-head">
          <div role="group" aria-label="Selected tiles" className="azul-dock-tiles">
            {stagedTiles.map((color, index) => (
              <Tile key={index} color={color} />
            ))}
            {takesMarker ? <Tile color="first" /> : null}
          </div>
          <p>
            <strong>
              {stagedCount} {staged.color}
            </strong>{' '}
            from{' '}
            {staged.source === 'center' ? 'the centre' : `factory ${Number(staged.source) + 1}`}
            {takesMarker
              ? `, with the first-player marker${markerCost ? ` (−${markerCost})` : ''}`
              : ''}
            .
            {stagedRemainder.length
              ? ` ${plural(stagedRemainder.length, 'other tile')} ${stagedRemainder.length === 1 ? 'goes' : 'go'} to the centre.`
              : ''}
          </p>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Cancel this selection"
            onClick={() => setStaged(null)}
          >
            <X size={18} aria-hidden="true" />
          </Button>
        </div>
      </>
    );
  } else if (match.phase === 'placing') {
    dockLabel = myTurn ? 'Your drafted tiles' : `${actorName}’s drafted tiles`;
    dock = (
      <div className="azul-dock-head">
        <div role="group" aria-label="Drafted tiles" className="azul-dock-tiles">
          {data.draft.map((color, index) => (
            <Tile key={index} color={color} />
          ))}
        </div>
        <p>
          {myTurn ? (
            <>
              <strong>
                {data.draft.length} {data.draft[0]}
              </strong>{' '}
              to place: pick a line or the floor.
            </>
          ) : (
            <>
              {actorName} is placing{' '}
              <strong>
                {data.draft.length} {data.draft[0]}
              </strong>{' '}
              {data.draft.length === 1 ? 'tile' : 'tiles'}.
            </>
          )}
        </p>
      </div>
    );
  } else if (deciding) {
    dock = (
      <div className="azul-dock-head">
        <div className="azul-dock-tiles azul-dock-tiles--empty" aria-hidden="true">
          {[0, 1, 2].map((slot) => (
            <span key={slot} className="azul-tile azul-tile--empty" />
          ))}
        </div>
        <p>Tap a colour in a factory or the centre to preview where it fits.</p>
      </div>
    );
  } else {
    dock = <p className="azul-dock-note">{actorName} is choosing tiles.</p>;
  }

  return (
    <div className="table-layout stable-game-table modern-game">
      <PlayerStrip {...props} playerCaption={(p) => `${p.score} points`} />
      <section className="azul-table" data-phase={match.phase} aria-label="Azul tile table">
        <div className="modern-game-heading">
          <div>
            <p className="eyebrow">Round {data.round}</p>
            <h2>{heading}</h2>
          </div>
          {starterNote ? <span className="small muted">{starterNote}</span> : null}
        </div>
        <div className="azul-supply">
          {offer(data.center, 'center')}
          {data.marker ? (
            <p className="small muted azul-marker-note">
              First from the centre: start next round and add the marker to your floor.
            </p>
          ) : null}
          <div className="azul-factory-navigation">
            <h3>{data.factories.length} factories</h3>
          </div>
          <div className="azul-factories">{data.factories.map((f, i) => offer(f, String(i)))}</div>
        </div>
        <DecisionDock
          className="azul-draft-preview"
          size="fit"
          label={dockLabel}
          data-pinned={pinned}
          data-state={
            finished ? 'finished' : roundOver ? 'review' : staged ? 'staged' : match.phase
          }
        >
          {dock}
          {deciding && choices.length ? (
            <div
              className="azul-dock-choices"
              role="group"
              aria-label="Where the tiles go"
              data-decision-actions
            >
              {choices.map((preview) => (
                <button
                  key={preview.choice}
                  type="button"
                  className="azul-choice"
                  data-azul-choice=""
                  data-overflow={preview.legal && preview.overflow > 0}
                  disabled={blocked || !preview.legal}
                  aria-label={previewName(preview)}
                  onClick={() => choose(preview.choice)}
                >
                  <span>{preview.row === null ? 'Floor' : `Line ${preview.row + 1}`}</span>
                  {previewFacts(preview, true).map((fact, index) =>
                    fact ? (
                      <small key={index} data-cost={index === 1 || preview.row === null}>
                        {fact}
                      </small>
                    ) : null,
                  )}
                </button>
              ))}
            </div>
          ) : deciding ? (
            <div className="azul-dock-choices" role="group" aria-label="Your lines">
              {[0, 1, 2, 3, 4, null].map((row) => (
                <button
                  key={row ?? 'floor'}
                  type="button"
                  className="azul-choice"
                  disabled
                  aria-label={`${row === null ? 'Floor' : `Pattern line ${row + 1}`}: ${idleFacts(row)[0]}`}
                >
                  <span>{row === null ? 'Floor' : `Line ${row + 1}`}</span>
                  <small>{idleFacts(row)[0]}</small>
                </button>
              ))}
            </div>
          ) : null}
        </DecisionDock>
        <div className="azul-player-boards">
          {orderedPlayers.map((player) => {
            const own = player.id === selfId;
            const floor = data.floors[player.id];
            const floorLoss = floorCost(0, floor.length);
            return (
              <details
                key={player.id}
                className="azul-player-board"
                data-own={own}
                data-current={match.currentPlayer === player.id}
                aria-label={`${name(player.id)} board`}
                open={own}
              >
                <summary className="azul-board-name">
                  <strong>
                    {name(player.id)}
                    {own ? ' · you' : ''}
                  </strong>
                  <b>{player.score} pts</b>
                  <span className="azul-board-glance">
                    {own ? null : (
                      <MiniBoard lines={data.lines[player.id]} wall={data.walls[player.id]} />
                    )}
                    <span className="azul-public-progress">
                      {plural(data.walls[player.id].flat().filter(Boolean).length, 'wall tile')} ·{' '}
                      {floor.length ? `floor −${floorLoss}` : 'floor clear'}
                    </span>
                  </span>
                </summary>
                <div className="azul-board-body">
                  <div className="azul-pattern-lines" aria-label="Pattern lines">
                    {data.lines[player.id].map((line, row) => {
                      const spaces = row + 1 - line.length;
                      const preview = own
                        ? choices.find((entry) => entry.choice === String(row))
                        : undefined;
                      const legal = Boolean(preview?.legal);
                      const [consequence, cost] = preview
                        ? previewFacts(preview)
                        : [
                            spaces ? `${spaces} ${spaces === 1 ? 'space' : 'spaces'} open` : 'full',
                            null,
                          ];
                      const contents = line.length ? `${line.length} ${line[0]} tiles` : 'empty';
                      return (
                        <button
                          type="button"
                          className="azul-pattern-line"
                          key={row}
                          data-azul-choice={own ? '' : undefined}
                          aria-label={`Place on pattern line ${row + 1}, ${spaces} spaces available; ${contents}${legal ? `; ${preview!.fits} tiles fit, ${preview!.overflow} go to floor${preview!.overflow ? `, costing ${plural(preview!.penalty, 'point')}` : ''}${preview!.completes ? '; completes the line' : ''}` : ''}`}
                          disabled={blocked || !legal}
                          onClick={() => legal && choose(String(row))}
                        >
                          <small>{row + 1}</small>
                          <span className="azul-pattern-choice">
                            <span className="azul-pattern-tiles">
                              {Array.from({ length: row + 1 }, (_, col) =>
                                col < row + 1 - line.length ? (
                                  <span key={col} className="azul-tile azul-tile--empty" />
                                ) : (
                                  <Tile key={col} color={line[col - (row + 1 - line.length)]} />
                                ),
                              )}
                            </span>
                            <small
                              className="azul-pattern-consequence"
                              data-overflow={legal && preview!.overflow > 0}
                            >
                              {consequence}
                              {cost ? <span> {cost}</span> : null}
                            </small>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="azul-wall" role="group" aria-label="Wall">
                    {data.walls[player.id].flatMap((row, r) =>
                      row.map((color, col) => (
                        <Tile
                          key={`${r}-${col}`}
                          color={color || colors[(col - r + 5) % 5]}
                          ghost={!color}
                          label={`Row ${r + 1}, column ${col + 1}: ${color ? `${color} tile` : `empty ${colors[(col - r + 5) % 5]} space`}`}
                        />
                      )),
                    )}
                  </div>
                </div>
                <div className="azul-floor">
                  <span className="small azul-floor-total">
                    {floor.length
                      ? `Floor · −${floorLoss} ${floorLoss === 1 ? 'point' : 'points'}`
                      : 'Floor · no penalty yet'}
                  </span>
                  <div>
                    {Array.from({ length: FLOOR_SLOTS }, (_, i) => {
                      const color = floor[i];
                      const contents =
                        color === 'first'
                          ? 'first-player marker'
                          : color
                            ? `${color} tile`
                            : 'empty';
                      const penalty = `${floorPenalties[i]} penalty ${floorPenalties[i] === 1 ? 'point' : 'points'}`;
                      return (
                        <span
                          key={i}
                          className="azul-floor-cell"
                          role="img"
                          aria-label={`Floor slot ${i + 1}: ${contents}, ${penalty}${color ? '' : ' when filled'}`}
                        >
                          {color ? (
                            <Tile color={color} decorative />
                          ) : (
                            <span className="azul-floor-empty" aria-hidden="true" />
                          )}
                          <small aria-hidden="true">−{floorPenalties[i]}</small>
                        </span>
                      );
                    })}
                  </div>
                  {own ? (
                    <span className="azul-floor-choice">
                      <Button
                        size="sm"
                        variant="secondary"
                        data-azul-choice=""
                        disabled={blocked || !choiceColor || !choices.at(-1)?.legal}
                        onClick={() => choose('floor')}
                      >
                        Place on floor
                      </Button>
                      <small>
                        {choiceColor
                          ? `${plural(choiceCount, 'tile')} · ${previewFacts(choices.at(-1)!)
                              .filter(Boolean)
                              .join(' · ')}`
                          : null}
                      </small>
                    </span>
                  ) : null}
                </div>
                {data.last_scores[player.id] ? (
                  <p className="small muted azul-round-summary">
                    Last round: +{data.last_scores[player.id].wall} wall · −
                    {data.last_scores[player.id].floor} floor
                    {data.last_scores[player.id].bonus !== undefined
                      ? ` · +${data.last_scores[player.id].bonus} bonuses`
                      : ''}
                    {player.score === 0 && data.last_scores[player.id].floor > 0
                      ? ' (scores never drop below 0)'
                      : ''}
                  </p>
                ) : null}
              </details>
            );
          })}
        </div>
      </section>
    </div>
  );
}
