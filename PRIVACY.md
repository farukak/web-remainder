# Privacy Policy — Web Remainder

_Last updated: 2026-08-10_

Web Remainder is built around a simple principle: your data stays on your
device.

## What data is stored

- The reminders and annotations you create: their text, styling, the page
  address they belong to, and the anchoring information used to place them back
  on the page.
- Your extension settings.

## Why it is stored

Solely to provide the extension's core function: showing your reminders again
when you revisit a page, and letting you manage them.

## Where it is stored

Locally, on your device, using Chrome's `chrome.storage.local` API. It never
leaves your browser.

## What is NOT done

- **No external servers.** No reminder content or browsing activity is
  transmitted anywhere.
- **No analytics or telemetry.**
- **No advertising.**
- **No tracking** of your browsing.
- **No selling or sharing** of any data with third parties.

## Your control over your data

- **Export** your data at any time from the Settings page as a JSON file.
- **Import** a previously exported JSON backup.
- **Delete** individual reminders from the popup, dashboard, or on the page, or
  use **Clear all data** in Settings to remove everything at once.
- Removing the extension from Chrome also removes its locally stored data.

## Permissions

Web Remainder requests the minimum permissions needed to work: `storage`
(to save reminders locally), `activeTab` (to read the current tab's URL),
`contextMenus` (the right-click entry), and access to the web pages you
annotate (to display reminders on them). None of this is used to collect or
transmit your data.

## Contact

Questions? Open an issue at
https://github.com/farukak/web-remainder
