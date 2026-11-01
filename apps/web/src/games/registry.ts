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
import { FlipSevenTable } from './modern/FlipSevenTable';
import { TrioTable } from './modern/TrioTable';
import { AzulTable } from './modern/AzulTable';
import { PartyTable } from './party/PartyTable';
import { GangTable } from './coop-number/GangTable';
import { SixNimmtTable } from './coop-number/SixNimmtTable';
import { PaperTable } from './sea/PaperTable';
import { BoopTable } from './boop/BoopTable';
import { ShitheadTable } from './shithead/ShitheadTable';

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
    const table = familyTables[game.family];
    if (!table) throw new Error(`No table renderer is registered for ${game.family}.`);
    return [game.id, table];
  }),
);
