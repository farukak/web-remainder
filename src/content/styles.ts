export const SHADOW_STYLES = /* css */ `
:host, * {
  box-sizing: border-box;
}

.wr-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 2147483000;
  font-family: Inter, system-ui, -apple-system, sans-serif;
}

/* --- Reminder card --- */
.wr-reminder {
  position: fixed;
  pointer-events: auto;
  max-width: 360px;
  min-width: 80px;
  box-shadow: 0 6px 24px rgba(15, 23, 42, 0.18);
  border: 1px solid rgba(15, 23, 42, 0.08);
  white-space: pre-wrap;
  word-break: break-word;
  cursor: default;
  transition: box-shadow 0.15s ease;
}
.wr-reminder:hover {
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.24);
}
.wr-reminder.wr-dragging {
  user-select: none;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.3);
}
.wr-reminder.wr-focus {
  animation: wr-pulse 0.9s ease-in-out 2;
}
@keyframes wr-pulse {
  0%, 100% { outline: 0 solid rgba(99, 102, 241, 0); }
  50% { outline: 3px solid rgba(99, 102, 241, 0.55); outline-offset: 2px; }
}
.wr-reminder.wr-low-confidence {
  border-style: dashed;
  border-color: rgba(217, 119, 6, 0.7);
}
.wr-reminder-text {
  outline: none;
}
.wr-menu-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.65);
  color: #334155;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.12s ease;
}
.wr-reminder:hover .wr-menu-btn {
  opacity: 1;
}
.wr-menu-btn:hover {
  background: #fff;
}

/* --- Shared surface tokens --- */
.wr-surface {
  background: #ffffff;
  color: #0f172a;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.22);
}
@media (prefers-color-scheme: dark) {
  .wr-surface {
    background: #1e293b;
    color: #e2e8f0;
    border-color: rgba(148, 163, 184, 0.2);
  }
}

/* --- Editor --- */
.wr-editor {
  position: fixed;
  pointer-events: auto;
  width: 320px;
  padding: 14px;
  z-index: 2147483001;
}
.wr-editor h2 {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  opacity: 0.7;
}
.wr-editor textarea {
  width: 100%;
  min-height: 72px;
  resize: vertical;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid rgba(100, 116, 139, 0.4);
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 14px;
}
.wr-editor textarea:focus {
  outline: 2px solid #6366f1;
  outline-offset: 1px;
  border-color: transparent;
}
.wr-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin: 12px 0;
}
.wr-field {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 11px;
}
.wr-field label {
  opacity: 0.65;
  font-weight: 500;
}
.wr-field select,
.wr-field input[type='number'] {
  padding: 5px 6px;
  border-radius: 6px;
  border: 1px solid rgba(100, 116, 139, 0.4);
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 12px;
}
.wr-field input[type='color'] {
  width: 100%;
  height: 26px;
  padding: 0;
  border: 1px solid rgba(100, 116, 139, 0.4);
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
}
.wr-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 6px;
}
.wr-btn {
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}
.wr-btn:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}
.wr-btn-primary {
  background: #6366f1;
  color: #fff;
}
.wr-btn-primary:hover {
  background: #4f46e5;
}
.wr-btn-ghost {
  background: transparent;
  color: inherit;
  border-color: rgba(100, 116, 139, 0.4);
}
.wr-btn-danger {
  background: transparent;
  color: #dc2626;
  border-color: rgba(220, 38, 38, 0.4);
}
.wr-btn-danger:hover {
  background: rgba(220, 38, 38, 0.08);
}

.wr-section {
  margin: 12px 0;
}
.wr-section-label {
  display: block;
  font-size: 11px;
  font-weight: 500;
  opacity: 0.65;
  margin-bottom: 5px;
}
.wr-emoji-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 6px;
}
.wr-emoji-tab {
  flex: 1;
  padding: 4px 6px;
  border-radius: 6px;
  border: 1px solid rgba(100, 116, 139, 0.35);
  background: transparent;
  color: inherit;
  font-size: 11px;
  cursor: pointer;
}
.wr-emoji-tab.active {
  background: #6366f1;
  color: #fff;
  border-color: transparent;
}
.wr-emoji-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  max-height: 92px;
  overflow-y: auto;
}
.wr-emoji {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
}
.wr-emoji:hover {
  background: rgba(99, 102, 241, 0.15);
}
.wr-palette-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.wr-palette {
  width: 30px;
  height: 26px;
  border-radius: 6px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}
.wr-palette:hover {
  transform: scale(1.08);
}
.wr-palette:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 1px;
}

/* --- Highlight while picking --- */
.wr-pick-highlight {
  position: fixed;
  pointer-events: none;
  border: 2px solid #6366f1;
  background: rgba(99, 102, 241, 0.12);
  border-radius: 4px;
  z-index: 2147482999;
}
.wr-pick-hint {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 13px;
  z-index: 2147483001;
}
`;
