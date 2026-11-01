/** Preserve source artwork; publish deterministic, compact static atlases. */
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
for (const sheet of ['01', '02', '03', '04']) {
  const source = fileURLToPath(new URL(`../apps/web/public/tarot/major-${sheet}.png`, import.meta.url));
  const output = source.replace(/\.png$/, '.webp');
  await sharp(source).resize({ width: 960, withoutEnlargement: true }).webp({ quality: 85 }).toFile(output);
  console.log(`Prepared major-${sheet}.webp`);
}
