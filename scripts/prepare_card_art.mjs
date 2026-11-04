/** Preserve source artwork; publish deterministic, compact static atlases.
 *
 * `node scripts/prepare_card_art.mjs` rebuilds every derivative.
 * `node scripts/prepare_card_art.mjs tarot` or `... playing-cards` rebuilds one set.
 */
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const only = new Set(process.argv.slice(2));
const wanted = (set) => !only.size || only.has(set);

if (wanted('tarot'))
  for (const atlas of [
    ...['01', '02', '03', '04'].map((sheet) => `major-${sheet}`),
    ...['wands', 'cups', 'swords', 'pentacles'].map((suit) => `minor-${suit}-v1`),
    // Single-card masters that replace atlas cells with corrected symbol counts.
    ...[
      'cups-02',
      'cups-06',
      'cups-08',
      'cups-10',
      'pentacles-05',
      'pentacles-08',
      'pentacles-09',
      'pentacles-10',
      'swords-05',
      'swords-06',
      'swords-08',
      'swords-09',
      'swords-10',
      'wands-05',
      'wands-07',
      'wands-08',
      'wands-09',
    ].map((card) => `minor-${card}-v2`),
  ]) {
    const source = fileURLToPath(new URL(`../apps/web/public/tarot/${atlas}.png`, import.meta.url));
    const output = source.replace(/\.png$/, '.webp');
    await sharp(source)
      .resize({
        width: atlas.endsWith('-v2') ? 512 : atlas.startsWith('minor') ? 1024 : 960,
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toFile(output);
    console.log(`Prepared ${atlas}.webp`);
  }

/*
 * Playing-card faces: the pinned vector masters stay untouched. Tables draw
 * small raster derivatives instead: 0.4-1.1 MB court-card SVGs decode slowly on
 * phones and re-rasterise on every resize. Each derivative is cropped inside
 * the master's own outline (the app frame already draws the card edge) and is
 * wide enough for the largest table card (86 CSS px) at 3x density.
 */
if (wanted('playing-cards')) {
  const folder = new URL('../apps/web/public/playing-cards/', import.meta.url);
  const manifestUrl = new URL('SOURCE.json', folder);
  const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'));
  const width = 288;
  const masterWidth = 167.0869141;
  const masterHeight = 242.6669922;
  const inset = 1; // master units: the printed outline is a 0.5-unit stroke at the edge.
  const scale = width / (masterWidth - 2 * inset);
  const full = { width: Math.round(masterWidth * scale), height: Math.round(masterHeight * scale) };
  const offset = Math.round(inset * scale);
  const height = full.height - 2 * offset;
  await mkdir(new URL('web/', folder), { recursive: true });
  const derived = {};
  for (const name of Object.keys(manifest.files).sort()) {
    const source = fileURLToPath(new URL(name, folder));
    const target = `web/${name.replace(/\.svg$/, '.webp')}`;
    const bytes = await sharp(source, { density: 72 * scale * 1.25 })
      .resize(full.width, full.height, { fit: 'fill' })
      .flatten({ background: '#ffffff' })
      .extract({ left: offset, top: offset, width, height })
      .webp({ quality: 80, effort: 6 })
      .toBuffer();
    await writeFile(fileURLToPath(new URL(target, folder)), bytes);
    derived[target] = createHash('sha256').update(bytes).digest('hex');
  }
  manifest.derived = {
    generator: 'scripts/prepare_card_art.mjs playing-cards',
    note: 'Tables draw these WebP derivatives; the SVG masters above stay pinned and unmodified.',
    size: `${width}x${height}`,
    crop: `${inset} master units inside each edge`,
    files: derived,
  };
  await writeFile(manifestUrl, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Prepared ${Object.keys(derived).length} playing-card faces at ${width}x${height}`);
}
