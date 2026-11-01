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
