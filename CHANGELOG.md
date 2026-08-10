# Changelog

All notable changes to this project are documented here.

## [1.0.0]

Initial release.

### Added

- Attach reminders to selected text or any element on any web page.
- Resilient multi-strategy anchoring (unique selector, XPath, text quote,
  element fingerprint) with confidence scoring and a low-confidence warning.
- Shadow-DOM annotation layer that never modifies the host page.
- Per-reminder styling: font family/size/weight, text and background color,
  opacity, corner radius, plus preset color palettes and an emoji picker.
- Drag to reposition a reminder while keeping it tied to its anchor.
- URL matching modes: exact, path, or domain.
- Single-page-app support (pushState/replaceState/popstate + debounced DOM
  mutations).
- Popup with the current page's reminders and quick add.
- Dashboard: search, filter by status/website, sort, edit, enable/disable,
  delete, and open-and-focus a reminder's page.
- Settings page: general toggles, default match mode, default style/palette,
  behavior options, keyboard shortcut, and data import/export/clear.
- Context menu entry and Alt+Shift+R keyboard shortcut.
- Local-only storage with a schema version and migration runner; validated
  JSON import/export.
