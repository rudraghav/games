import type { ComponentType } from 'react';
import { games } from '@games/api-client/catalog';
import type { TableProps } from './types';
import { CardTable } from './shared/CardTable';
import { CasinoTable } from './casino/CasinoTable';
import { DealTable } from './deal/DealTable';
import { SkyjoTable } from './skyjo/SkyjoTable';
import { TarotTable } from './tarot/TarotTable';
import { RummyTable } from './rummy/RummyTable';
import { BoardTable } from './board/BoardTable';
import { MancalaTable } from './board/MancalaTable';
import { WordsTable } from './words/WordsTable';
import { GemsTable } from './gems/GemsTable';

const familyTables: Record<string, ComponentType<TableProps>> = {
  shedding: CardTable,
  property: DealTable,
  casino: CasinoTable,
  rummy: RummyTable,
  grid: SkyjoTable,
  tarot: TarotTable,
  board: BoardTable,
  mancala: MancalaTable,
  words: WordsTable,
  gems: GemsTable,
};
export const tableRegistry = Object.fromEntries(
  games.map((game) => {
    const table = familyTables[game.family];
    if (!table) throw new Error(`No table renderer is registered for ${game.family}.`);
    return [game.id, table];
  }),
);
