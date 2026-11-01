import registry from './generated/tarot-characters.json';

export const tarotCharacters = registry;
export type TarotCharacter = (typeof registry)[number];
function normalized(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '');
}
/** Match both identity and franchise; never substitute a merely similar name. */
export function tarotCharacter(name: string, source: string): TarotCharacter | undefined {
  return registry.find(
    (c) =>
      [c.name, ...c.aliases].some((n) => normalized(n) === normalized(name)) &&
      [c.source, ...c.sourceAliases].some((s) => normalized(source) === normalized(s)),
  );
}
