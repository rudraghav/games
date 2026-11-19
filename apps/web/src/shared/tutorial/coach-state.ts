import type { ActionOption, Match, Room } from '@games/api-client';
import type { TutorialLesson } from './lessons';

export const practiceMoves = 3;
export type PracticeProgress = { start: number; through: number; moves: number };

export const beginPractice = (version: number): PracticeProgress => ({
  start: version,
  through: version,
  moves: 0,
});

export function loadPractice(key: string, version: number): PracticeProgress {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(key) || 'null');
    if (
      saved &&
      [saved.start, saved.through, saved.moves].every(Number.isSafeInteger) &&
      saved.start >= 0 &&
      saved.start <= saved.through &&
      saved.moves >= 0 &&
      saved.moves <= saved.through - saved.start
    )
      return { start: saved.start, through: saved.through, moves: saved.moves };
  } catch {
    // A private browser can still follow the live lesson in memory.
  }
  return beginPractice(version);
}

/** Count only committed actions after enrolment. A refresh or bot replay cannot add a step. */
export function advancePractice(
  progress: PracticeProgress,
  room: Room,
  selfId: string,
): PracticeProgress {
  const through = room.matchVersion ?? progress.through;
  if (through < progress.through) return progress;
  // Azul saves the chosen offer and its destination together. Recount from
  // enrollment when history still covers it, including guides saved before this change.
  const azul = room.gameId === 'azul';
  const recount = azul && (room.activity[0]?.version ?? Infinity) <= progress.start + 1;
  if (!recount && through === progress.through) return progress;
  const since = recount ? progress.start : progress.through;
  const committed = room.activity.filter(
    (move) =>
      move.actorId === selfId &&
      move.version > since &&
      move.version <= through &&
      !(azul && move.type === 'draft_tiles'),
  );
  const moves = (recount ? 0 : progress.moves) + committed.length;
  if (moves === progress.moves && through === progress.through) return progress;
  return {
    ...progress,
    through,
    moves,
  };
}

// These plays have a concrete, visible outcome and no amount, target, or further input to choose.
// Every other move uses the normal hand, board, target picker, wager input or private lock control.
const directTypes: Record<string, readonly string[]> = {
  uno: ['play', 'draw'],
  'uno-no-mercy': ['play', 'draw'],
  'four-in-a-row': ['drop'],
  azul: ['next_round'],
  rummy: ['draw_stock', 'draw_discard'],
  holdem: ['check'],
  skyjo: ['draw_stock', 'draw_discard'],
  'sea-salt-paper': ['take_stock', 'take_discard'],
};

const choiceTitles: Record<string, string> = {
  vote: 'Choose who fits the prompt',
  predict: 'Make your private prediction',
  respond: 'Choose how to answer',
  clue: 'Give your team a clue',
  guess: 'Choose a word with your team',
  claim_chip: 'Choose a chip to rank your hand',
  select_number: 'Choose a number to lock',
  arrange: 'Choose your face-up cards',
  bet: 'Choose your stake',
  raise: 'Choose a raise',
  pay: 'Choose how to pay',
};

function simple(option: ActionOption, game: string) {
  const move = option.value;
  return (
    !!directTypes[game]?.includes(move.type) &&
    !option.input &&
    !move.target &&
    !move.color &&
    !move.cards?.length &&
    !move.groups?.length &&
    (!move.choice || move.type === 'drop' || move.type === 'take_discard')
  );
}

export function offeredMove(match: Match, lesson: TutorialLesson) {
  for (const type of Object.keys(lesson.actions)) {
    const options = match.actions.filter((option) => option.value.type === type);
    if (!options.length) continue;
    // A basic matching card is easier to learn than choosing a wild colour. The centre
    // opening in Four in a Row also puts a first disc in view from either side.
    if (type === 'drop' && match.id === 'four-in-a-row') {
      return options.find((o) => o.value.choice === '3') ?? options[0];
    }
    return options.find((o) => simple(o, match.id)) ?? options[0];
  }
  return match.actions[0];
}

export function practiceDirection(option: ActionOption, match: Match) {
  const { value } = option;
  const card = match.hand.find((item) => item.id === value.card);
  const cardName =
    card && !option.label.toLowerCase().includes(card.label.toLowerCase()) ? card.label : '';
  const title =
    match.id === 'hot-seat' && value.type === 'choose'
      ? 'Choose your private answer'
      : choiceTitles[value.type] || (cardName ? `${option.label} · ${cardName}` : option.label);
  return { title, direct: simple(option, match.id) };
}
