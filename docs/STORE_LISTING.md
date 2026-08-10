# Chrome Web Store Listing — Web Remainder

## Name

Web Remainder

## Short description (≤ 132 chars)

Add persistent, styled reminders to any web page. Select text or an element, jot a note — it reappears when you return. Local-only.

## Category

Productivity

## Detailed description

Web Remainder is the missing annotation layer for the web.

Ever wanted to leave yourself a note on a specific part of a web page — a line
in a GitHub issue, a paragraph in a doc, a row in a dashboard — and have it
waiting for you next time? That's exactly what Web Remainder does.

• Select any text or click any element and attach a reminder to it.
• Style each note: font, size, weight, text and background color, opacity,
  corner radius — plus ready-made color palettes and an emoji picker.
• Your notes reappear in the same place every time you revisit the page, thanks
  to a resilient anchoring system that survives most page changes.
• Works on modern single-page apps (GitHub, Notion, Jira, YouTube…), following
  in-app navigation.
• Manage everything from a dashboard: search, filter by site or status, sort,
  edit, enable/disable, and jump straight to any reminder.
• Right-click a selection to add a reminder, or use the Alt+Shift+R shortcut.
• Export and import your data as JSON.

Private by design: everything is stored locally on your device with Chrome's
storage APIs. No account, no servers, no analytics, no tracking, no ads. Your
notes never leave your browser.

## Single purpose

Web Remainder lets a user attach personal text reminders/annotations to
specific locations on web pages and shows them again on later visits. This is
its one and only purpose.

## Permission justifications

- **storage** — Save your reminders and settings locally on your device.
- **activeTab** — Read the current tab's URL (only when you open the popup) to
  show which reminders belong to the page you're on.
- **contextMenus** — Provide the "Add to Web Remainder" right-click entry on
  selected text.
- **Host access (http/https)** — Required to display your reminders on the
  pages where you created them and to let you add new ones. No page content is
  collected or transmitted; it is only used locally to place your notes.

## Privacy policy URL

https://github.com/farukak/web-remainder/blob/main/docs/privacy-policy.md

## Assets

Store-ready promotional screenshots (1280×800) live in `docs/store/`:

- `screenshot-1-annotate.png` — reminders shown on a web page
- `screenshot-2-editor.png` — the editor with palettes, shapes and templates
- `screenshot-3-dashboard.png` — the management dashboard

Regenerate them with `npm run store:assets`. These are clean promo mockups;
you may swap in real captures from the loaded extension for extra authenticity.

The extension icon is included at 16/32/48/128 px (`npm run icons`).

## Packaging

Build the upload zip with:

```bash
npm run zip
```

This produces `.output/web-remainder-1.0.0-chrome.zip`, ready to upload in the
Chrome Web Store Developer Dashboard.

## Submission checklist

- [x] Manifest V3, single purpose, minimum permissions
- [x] Icon 128×128
- [x] At least one 1280×800 screenshot
- [x] Detailed description and short description
- [x] Privacy policy URL
- [x] Permission justifications
- [ ] Upload `web-remainder-1.0.0-chrome.zip` and complete the data-use
      disclosures in the Developer Dashboard
