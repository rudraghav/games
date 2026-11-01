/** Keep the original transparent masters; derive losslessly aligned delivery atlases. */
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

for (const name of ['boop-pieces-v1', 'paper-symbols-v1']) {
  const source = fileURLToPath(new URL(`../apps/web/public/game-art/${name}.png`, import.meta.url));
  const metadata = await sharp(source).metadata();
  if (metadata.width !== 1254 || metadata.height !== 1254 || !metadata.hasAlpha) {
    throw new Error(`${name} must be the original transparent 1254px square atlas.`);
  }
  await sharp(source)
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(source.replace(/\.png$/, '.webp'));
  console.log(`Prepared ${name}.webp`);
}

for (const [name, width, height, alpha] of [
  ['gem-districts-v1', 1254, 1254, true],
  ['ceramic-tiles-v1', 1536, 1024, true],
  ['board-tokens-v1', 1536, 1024, true],
  ['table-surfaces-v1', 1254, 1254, false],
]) {
  const source = fileURLToPath(new URL(`../apps/web/public/game-art/${name}.png`, import.meta.url));
  const metadata = await sharp(source).metadata();
  if (
    metadata.width !== width ||
    metadata.height !== height ||
    Boolean(metadata.hasAlpha) !== alpha
  )
    throw new Error(`Unexpected original dimensions for ${name}`);
  await sharp(source)
    .webp({ quality: 88, alphaQuality: 100 })
    .toFile(source.replace(/\.png$/, '.webp'));
  console.log(`Prepared ${name}.webp`);
}
