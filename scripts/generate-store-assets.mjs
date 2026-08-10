import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'store');
mkdirSync(outDir, { recursive: true });

const W = 1280;
const H = 800;

const wrap = (inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Inter, system-ui, sans-serif">${inner}</svg>`;

// Browser window chrome with a page body area.
const browser = (bodyInner, title = 'example.com') => `
  <rect width="${W}" height="${H}" fill="#eef2f7"/>
  <rect x="80" y="70" width="1120" height="660" rx="16" fill="#ffffff" stroke="#e2e8f0"/>
  <rect x="80" y="70" width="1120" height="52" rx="16" fill="#f8fafc"/>
  <rect x="80" y="104" width="1120" height="18" fill="#f8fafc"/>
  <circle cx="108" cy="96" r="6" fill="#f87171"/>
  <circle cx="130" cy="96" r="6" fill="#fbbf24"/>
  <circle cx="152" cy="96" r="6" fill="#34d399"/>
  <rect x="190" y="84" width="820" height="24" rx="12" fill="#eef2f7"/>
  <text x="210" y="101" font-size="13" fill="#64748b">${title}</text>
  ${bodyInner}
`;

const heading = (x, y, text, size = 40) =>
  `<text x="${x}" y="${y}" font-size="${size}" font-weight="700" fill="#0f172a">${text}</text>`;
const sub = (x, y, text) =>
  `<text x="${x}" y="${y}" font-size="20" fill="#475569">${text}</text>`;

// Fake page paragraph lines.
const lines = (x, y, widths, gap = 22, color = '#e2e8f0') =>
  widths
    .map((w, i) => `<rect x="${x}" y="${y + i * gap}" width="${w}" height="10" rx="5" fill="${color}"/>`)
    .join('');

// A sticky note.
const note = (x, y, w, text, bg, fg) => `
  <g>
    <rect x="${x}" y="${y}" width="${w}" height="72" rx="10" fill="${bg}" filter="url(#sh)"/>
    <text x="${x + 16}" y="${y + 30}" font-size="15" font-weight="600" fill="${fg}">${text}</text>
    <text x="${x + 16}" y="${y + 52}" font-size="12" fill="${fg}" opacity="0.7">github.com · 2 min ago</text>
  </g>`;

const defs = `<defs><filter id="sh" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#0f172a" flood-opacity="0.18"/></filter></defs>`;

// --- Screenshot 1: annotate any page ---
const shot1 = wrap(
  defs +
    browser(
      lines(150, 200, [700, 640, 680, 500], 26) +
        lines(150, 360, [700, 660, 620, 690, 540], 26) +
        note(760, 250, 300, 'Review this API before Friday', '#fef9c3', '#713f12') +
        note(700, 470, 320, 'Migrate this to Node 22', '#e0f2fe', '#0c4a6e'),
    ) +
    `<rect x="80" y="70" width="1120" height="660" fill="url(#none)"/>`,
);

// --- Screenshot 2: the editor ---
const chip = (x, y, w, text, bg, fg) =>
  `<rect x="${x}" y="${y}" width="${w}" height="30" rx="15" fill="${bg}"/><text x="${x + w / 2}" y="${y + 20}" font-size="13" font-weight="600" fill="${fg}" text-anchor="middle">${text}</text>`;

const editorPanel = `
  <rect x="440" y="150" width="400" height="520" rx="16" fill="#ffffff" filter="url(#sh)"/>
  <text x="470" y="192" font-size="13" font-weight="700" letter-spacing="1" fill="#64748b">NEW REMINDER</text>
  <rect x="470" y="210" width="340" height="80" rx="10" fill="#fef9c3"/>
  <text x="486" y="240" font-size="15" fill="#713f12">Ship the release notes</text>
  <text x="470" y="322" font-size="12" fill="#94a3b8">Palettes</text>
  ${['#ffedd5', '#ffe4e6', '#dcfce7', '#e0f2fe', '#ede9fe', '#fce7f3'].map((c, i) => `<rect x="${470 + i * 40}" y="332" width="32" height="26" rx="7" fill="${c}"/>`).join('')}
  <text x="470" y="392" font-size="12" fill="#94a3b8">Shape</text>
  ${['▢', '🗒️', '💬', '☁️', '❤️', '⭐'].map((g, i) => `<rect x="${470 + i * 40}" y="402" width="32" height="28" rx="7" fill="#f1f5f9"/><text x="${486 + i * 40}" y="422" font-size="15" text-anchor="middle">${g}</text>`).join('')}
  <text x="470" y="466" font-size="12" fill="#94a3b8">Templates</text>
  ${chip(470, 476, 74, 'Sticky', '#fef08a', '#713f12')}
  ${chip(552, 476, 92, 'Notebook', '#f8fafc', '#1e293b')}
  ${chip(654, 476, 62, 'Idea', '#e0f2fe', '#0c4a6e')}
  ${chip(726, 476, 64, 'Love', '#fecdd3', '#9f1239')}
  <rect x="700" y="622" width="110" height="34" rx="9" fill="#6366f1"/>
  <text x="755" y="644" font-size="14" font-weight="600" fill="#fff" text-anchor="middle">Save</text>
`;

const shot2 = wrap(
  defs +
    `<rect width="${W}" height="${H}" fill="#eef2f7"/>` +
    heading(120, 110, 'Style every reminder your way') +
    sub(120, 145, 'Emoji, colour palettes, eight shapes and one-tap templates.') +
    editorPanel,
);

// --- Screenshot 3: dashboard ---
const card = (x, y, title) => `
  <rect x="${x}" y="${y}" width="620" height="88" rx="12" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="${x + 18}" y="${y + 32}" font-size="16" font-weight="600" fill="#0f172a">${title}</text>
  <text x="${x + 18}" y="${y + 58}" font-size="12" fill="#6366f1">github.com/farukak/web-remainder</text>
  <rect x="${x + 470}" y="${y + 26}" width="120" height="30" rx="8" fill="#eef2ff"/>
  <text x="${x + 530}" y="${y + 46}" font-size="12" font-weight="600" fill="#4f46e5" text-anchor="middle">Open page →</text>`;

const dashboard = `
  <rect x="80" y="80" width="1120" height="640" rx="16" fill="#ffffff" stroke="#e2e8f0"/>
  <rect x="80" y="80" width="280" height="640" rx="16" fill="#f8fafc"/>
  <text x="120" y="130" font-size="18" font-weight="700" fill="#0f172a">Web Remainder</text>
  ${['All', 'Active', 'Disabled'].map((t, i) => `<rect x="120" y="${160 + i * 44}" width="200" height="34" rx="8" fill="${i === 0 ? '#6366f1' : '#eef2f7'}"/><text x="136" y="${182 + i * 44}" font-size="13" fill="${i === 0 ? '#fff' : '#334155'}">${t}</text>`).join('')}
  <text x="120" y="340" font-size="12" fill="#94a3b8">WEBSITES</text>
  ${['github.com', 'jira.company.com', 'notion.so'].map((s, i) => `<text x="120" y="${372 + i * 34}" font-size="14" fill="#334155">${s}</text>`).join('')}
  <rect x="400" y="120" width="760" height="42" rx="10" fill="#f1f5f9"/>
  <text x="420" y="147" font-size="14" fill="#94a3b8">Search reminders…</text>
  ${card(400, 190, 'Review deployment before Friday')}
  ${card(400, 300, 'Fix the ticket in the queue')}
  ${card(400, 410, 'Check TODO: migrate to Node 22')}
`;

const shot3 = wrap(
  defs +
    `<rect width="${W}" height="${H}" fill="#eef2f7"/>` +
    dashboard,
);

const shots = [
  ['screenshot-1-annotate.png', shot1],
  ['screenshot-2-editor.png', shot2],
  ['screenshot-3-dashboard.png', shot3],
];

for (const [name, svg] of shots) {
  await sharp(Buffer.from(svg)).png().toFile(join(outDir, name));
  console.log('docs/store/' + name);
}
