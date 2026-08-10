# Web Remainder

Persistent reminders and annotations for any web page. Select text or an
element on a page, attach a styled note, and it reappears in the same place
every time you come back — all stored locally on your device.

> The missing annotation layer for the web.

## Features

- **Annotate anything** — attach a reminder to selected text or to any element
  (paragraph, heading, card, image, list item, table cell…).
- **Resilient anchoring** — a multi-strategy resolver (unique selector → XPath →
  text-quote → element fingerprint) re-locates each reminder even after the page
  changes, with a confidence score and a clear warning when a note can't be
  confidently placed.
- **Isolated overlay** — reminders render in a Shadow DOM layer, so the host
  page's markup, styles, and scripts are never modified.
- **Styling** — per-reminder font family, size, weight, text/background color,
  opacity, and corner radius, with a live preview.
- **Palettes & emoji** — ready-made cute color palettes for quick text/background
  styling, and a categorized emoji picker you can drop into any reminder.
- **Drag to reposition** — move a note while keeping it tied to its anchor.
- **URL matching modes** — show a reminder on the *exact* URL, the *path*
  (ignoring query), or the whole *domain*.
- **SPA support** — tracks `pushState`/`replaceState`/`popstate` and debounced
  DOM mutations, so notes follow route changes on apps like GitHub or Notion.
- **Popup** — see and jump to the current page's reminders; add a new one.
- **Dashboard** — search, filter by status/website, sort, edit, enable/disable,
  delete, and open any reminder's page.
- **Context menu & shortcut** — right-click a selection → *Add to Web Remainder*,
  or press `Alt+Shift+R`.
- **Import / export** — back up and restore all data as validated JSON.
- **Local only** — no backend, no account, no analytics, no tracking.

## Installation (from source)

```bash
npm install
npm run build
```

Then load it in Chrome:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select `.output/chrome-mv3`

## Development

```bash
npm run dev        # start WXT in dev mode with HMR (loads a dev build)
npm run compile    # TypeScript type check
npm run lint       # ESLint
npm run test       # Vitest unit tests
npm run check      # compile + lint + test
```

## Build

```bash
npm run build          # production build → .output/chrome-mv3
npm run build:firefox  # Firefox build → .output/firefox-mv3
npm run zip            # packaged zip for store upload
```

## Architecture

```
src/
├─ entrypoints/
│  ├─ background.ts     Service worker: context menu, keyboard command, routing
│  ├─ content.ts        Injects the annotation layer, wires messaging + watcher
│  ├─ popup/            Current-page reminders (React)
│  ├─ dashboard/        Manage all reminders (React)
│  └─ options/          Settings + import/export (React)
├─ content/
│  ├─ anchor-resolver   Builds and resolves anchors with confidence scoring
│  ├─ selection-manager Add-mode picking (text selection / element click)
│  ├─ annotation-manager Shadow-DOM rendering, positioning, edit/delete/drag
│  ├─ positioning       Anchor-rect → clamped viewport coordinate
│  ├─ mutation-observer SPA navigation + DOM-change watcher (debounced)
│  ├─ editor            Vanilla-DOM floating editor (text set via textContent)
│  └─ styles            CSS injected into the shadow root
├─ shared/              types, storage abstraction, messages, backup, utils
└─ components/          React hooks shared by the UI pages
```

- **Storage** is the single source of truth (`chrome.storage.local`) behind an
  abstraction in `src/shared/storage.ts`; UI never touches `chrome.storage`
  directly. A `schemaVersion` and migration runner allow the schema to evolve.
- **Tech**: TypeScript (strict), React (UI pages only — the content layer is
  vanilla to stay light), Vite via [WXT](https://wxt.dev), Manifest V3.

## Privacy

Web Remainder stores all reminder and annotation data locally on your device
using Chrome's storage APIs. Nothing is sent to any server; there is no
analytics, tracking, or advertising. See [PRIVACY.md](./PRIVACY.md).

## Permissions

- `storage` — save your reminders locally.
- `activeTab` — read the current tab's URL to list its reminders.
- `contextMenus` — the *Add to Web Remainder* right-click entry.
- Host access (`http`/`https`) — required so reminders can be shown on the pages
  you add them to. No page content leaves your device.

## Chrome Web Store

Manifest V3, single-purpose, minimum-permission. Version starts at `1.0.0`.

## Contributing

Issues and pull requests are welcome. Run `npm run check` before submitting.

## License

Apache-2.0. See [LICENSE](./LICENSE).

## Credit

Created by **Faruk AK** — https://github.com/farukak/web-remainder
