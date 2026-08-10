import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'public', 'icons');
const svg = readFileSync(join(dir, 'icon.svg'));
const sizes = [16, 32, 48, 128];

for (const size of sizes) {
  await sharp(svg, { density: 512 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(join(dir, `${size}.png`));
  console.log(`icons/${size}.png`);
}
