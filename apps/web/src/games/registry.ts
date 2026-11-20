import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';
import { games } from '@games/api-client/catalog';
import type { TableProps } from './types';
import { CardTable } from './shared/CardTable';
import { ChanceTable } from './chance/ChanceTable';
import { CasinoTable } from './casino/CasinoTable';
import { DealTable } from './deal/DealTable';
import { SkyjoTable } from './skyjo/SkyjoTable';
import { RummyTable } from './rummy/RummyTable';
import { BoardTable } from './board/BoardTable';
import { MancalaTable } from './board/MancalaTable';
import { WordsTable } from './words/WordsTable';
import { GemsTable } from './gems/GemsTable';
import { FlipSevenTable } from './modern/FlipSevenTable';
import { TrioTable } from './modern/TrioTable';
import { AzulTable } from './modern/AzulTable';
import { PartyTable } from './party/PartyTable';
import { GangTable } from './coop-number/GangTable';
import { SixNimmtTable } from './coop-number/SixNimmtTable';
import { PaperTable } from './sea/PaperTable';
import { BoopTable } from './boop/BoopTable';
import { ShitheadTable } from './shithead/ShitheadTable';

// The expanded illustrated reference library is needed only by Tarot players.
const TarotTable = dynamic(() => import('./tarot/TarotTable').then((module) => module.TarotTable));

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
  'flip-seven': FlipSevenTable,
  trio: TrioTable,
  azul: AzulTable,
  party: PartyTable,
  'cooperative-poker': GangTable,
  'number-rows': SixNimmtTable,
  paper: PaperTable,
  boop: BoopTable,
  palace: ShitheadTable,
};
export const tableRegistry = Object.fromEntries(
  games.map((game) => {
    const table =
      game.id === 'roulette' || game.id === 'slots' ? ChanceTable : familyTables[game.family];
    if (!table) throw new Error(`No table renderer is registered for ${game.family}.`);
    return [game.id, table];
  }),
);
