import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'store');

const grad = `
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6366f1"/>
      <stop offset="1" stop-color="#4f46e5"/>
    </linearGradient>
  </defs>`;

// Logo mark: white note card + amber marker.
const mark = (x, y, s) => `
  <g transform="translate(${x},${y}) scale(${s})">
    <rect x="0" y="0" width="96" height="112" rx="14" fill="#ffffff"/>
    <rect x="18" y="28" width="56" height="12" rx="6" fill="#c7d2fe"/>
    <rect x="18" y="52" width="56" height="12" rx="6" fill="#c7d2fe"/>
    <rect x="18" y="76" width="34" height="12" rx="6" fill="#c7d2fe"/>
    <circle cx="100" cy="16" r="26" fill="#f59e0b" stroke="#ffffff" stroke-width="7"/>
  </g>`;

const note = (x, y, w, h, bg, fg, text) => `
  <g transform="translate(${x},${y})" filter="url(#sh)">
    <rect width="${w}" height="${h}" rx="14" fill="${bg}"/>
    <text x="20" y="40" font-size="20" font-weight="600" fill="${fg}">${text}</text>
  </g>`;

const small = `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="280" viewBox="0 0 440 280" font-family="Inter, system-ui, sans-serif">
  ${grad}
  <rect width="440" height="280" fill="url(#g)"/>
  ${mark(44, 92, 0.85)}
  <text x="190" y="132" font-size="32" font-weight="700" fill="#ffffff">Web Remainder</text>
  <text x="190" y="166" font-size="17" fill="#e0e7ff">Sticky reminders for any page</text>
</svg>`;

const marquee = `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="560" viewBox="0 0 1400 560" font-family="Inter, system-ui, sans-serif">
  ${grad}
  <filter id="sh" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="#0f172a" flood-opacity="0.28"/></filter>
  <rect width="1400" height="560" fill="url(#g)"/>
  ${mark(90, 120, 1.1)}
  <text x="90" y="330" font-size="76" font-weight="800" fill="#ffffff">Web Remainder</text>
  <text x="92" y="388" font-size="30" fill="#e0e7ff">The annotation layer for the web</text>
  <text x="92" y="452" font-size="22" fill="#c7d2fe">Reminders on any page · Shapes, palettes &amp; emoji · Local-only, private</text>
  ${note(880, 150, 340, 90, '#fef9c3', '#713f12', 'Review this API before Friday')}
  ${note(940, 300, 340, 90, '#e0f2fe', '#0c4a6e', 'Migrate this to Node 22')}
  ${note(900, 450, 340, 74, '#dcfce7', '#14532d', 'Ship the release notes')}
</svg>`;

const jobs = [
  ['promo-small-440x280.jpg', small],
  ['promo-marquee-1400x560.jpg', marquee],
];
for (const [name, svg] of jobs) {
  await sharp(Buffer.from(svg)).flatten({ background: '#4f46e5' }).jpeg({ quality: 92 }).toFile(join(outDir, name));
  console.log('docs/store/' + name);
}
