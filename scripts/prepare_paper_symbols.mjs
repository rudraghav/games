/**
 * Derive the padded Sea Salt & Paper delivery atlas from the preserved v1 master.
 *
 * The v1 master's subjects cross its nominal 313.5px cells (crab legs reach the
 * boat cell, the shark snout reaches the mermaid cell, and so on), so exact cell
 * clipping showed neighbour fragments and cut subjects. Each opaque connected
 * component is assigned to the cell holding its centroid, copied alone, and
 * centred in a 320px cell with at least 16px of transparent margin. No pixels are
 * repainted; the master is never modified. Run: node scripts/prepare_paper_symbols.mjs
 */
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const MASTER = fileURLToPath(
  new URL('../apps/web/public/game-art/paper-symbols-v1.png', import.meta.url),
);
const OUTPUT = fileURLToPath(
  new URL('../apps/web/public/game-art/paper-symbols-v2.webp', import.meta.url),
);
const GRID = 4;
const CELL = 320;
const MARGIN = 16;

const { data, info } = await sharp(MASTER)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
if (width !== 1254 || height !== 1254 || channels !== 4)
  throw new Error('paper-symbols-v1 must be the original transparent 1254px square atlas.');
const source = width / GRID;
const solid = (index) => data[index * channels + 3] > 24;

// 8-connected components of opaque pixels; each belongs to the cell of its centroid.
const owner = new Int16Array(width * height).fill(-1);
const stack = new Int32Array(width * height);
const boxes = Array.from({ length: GRID * GRID }, () => ({
  x0: width,
  y0: height,
  x1: -1,
  y1: -1,
}));
const pixels = [];
for (let start = 0; start < width * height; start++) {
  if (!solid(start) || owner[start] !== -1) continue;
  const members = [];
  let top = 0;
  let sumX = 0;
  let sumY = 0;
  stack[top++] = start;
  owner[start] = 99;
  while (top) {
    const index = stack[--top];
    const x = index % width;
    const y = (index - x) / width;
    members.push(index);
    sumX += x;
    sumY += y;
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const next = ny * width + nx;
        if (owner[next] === -1 && solid(next)) {
          owner[next] = 99;
          stack[top++] = next;
        }
      }
  }
  const cell =
    Math.min(GRID - 1, Math.floor(sumY / members.length / source)) * GRID +
    Math.min(GRID - 1, Math.floor(sumX / members.length / source));
  const box = boxes[cell];
  for (const index of members) {
    owner[index] = cell;
    const x = index % width;
    const y = (index - x) / width;
    box.x0 = Math.min(box.x0, x);
    box.y0 = Math.min(box.y0, y);
    box.x1 = Math.max(box.x1, x);
    box.y1 = Math.max(box.y1, y);
  }
  pixels.push(members.length);
}

const layers = [];
for (const [cell, box] of boxes.entries()) {
  if (box.x1 < 0) throw new Error(`Cell ${cell} has no artwork.`);
  const w = box.x1 - box.x0 + 1;
  const h = box.y1 - box.y0 + 1;
  const subject = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const index = (box.y0 + y) * width + box.x0 + x;
      if (owner[index] !== cell) continue;
      data.copy(subject, (y * w + x) * 4, index * channels, index * channels + 4);
    }
  const scale = Math.min(1, (CELL - 2 * MARGIN) / Math.max(w, h));
  const outW = Math.round(w * scale);
  const outH = Math.round(h * scale);
  const input = await sharp(subject, { raw: { width: w, height: h, channels: 4 } })
    .resize(outW, outH, { kernel: 'lanczos3' })
    .png()
    .toBuffer();
  layers.push({
    input,
    left: (cell % GRID) * CELL + Math.round((CELL - outW) / 2),
    top: Math.floor(cell / GRID) * CELL + Math.round((CELL - outH) / 2),
  });
}

const atlas = await sharp({
  create: {
    width: GRID * CELL,
    height: GRID * CELL,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite(layers)
  .png()
  .toBuffer();

// Every cell keeps a fully transparent 2px border, so no neighbour can bleed.
const check = await sharp(atlas).raw().toBuffer();
for (let cell = 0; cell < GRID * GRID; cell++) {
  const x0 = (cell % GRID) * CELL;
  const y0 = Math.floor(cell / GRID) * CELL;
  for (let i = 0; i < CELL; i++)
    for (const [x, y] of [
      [x0 + i, y0],
      [x0 + i, y0 + 1],
      [x0 + i, y0 + CELL - 1],
      [x0 + i, y0 + CELL - 2],
      [x0, y0 + i],
      [x0 + 1, y0 + i],
      [x0 + CELL - 1, y0 + i],
      [x0 + CELL - 2, y0 + i],
    ])
      if (check[(y * GRID * CELL + x) * 4 + 3] !== 0)
        throw new Error(`Cell ${cell} border is not clear.`);
}
await sharp(atlas).webp({ quality: 90, alphaQuality: 100 }).toFile(OUTPUT);
console.log(
  `Prepared paper-symbols-v2.webp from ${pixels.length} components in ${GRID * GRID} cells.`,
);
