/** Preserve source artwork; publish deterministic, compact static atlases. */
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
for (const atlas of [
  ...['01', '02', '03', '04'].map((sheet) => `major-${sheet}`),
  ...['wands', 'cups', 'swords', 'pentacles'].map((suit) => `minor-${suit}-v1`),
  ...['cups-02', 'cups-06', 'cups-08', 'pentacles-08', 'pentacles-09'].map((card) => `minor-${card}-v2`),
]) {
  const source = fileURLToPath(new URL(`../apps/web/public/tarot/${atlas}.png`, import.meta.url));
  const output = source.replace(/\.png$/, '.webp');
  await sharp(source)
    .resize({ width: atlas.endsWith('-v2') ? 512 : atlas.startsWith('minor') ? 1024 : 960, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(output);
  console.log(`Prepared ${atlas}.webp`);
}
