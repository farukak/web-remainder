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
  min-width: 64px;
  white-space: pre-wrap;
  word-break: break-word;
  cursor: default;
  line-height: 1.35;
}
.wr-reminder-bg {
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.18);
  transition: box-shadow 0.15s ease;
}
.wr-reminder:hover .wr-reminder-bg {
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.26);
}
.wr-reminder.wr-dragging .wr-reminder-bg {
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.32);
}
.wr-reminder.wr-focus {
  animation: wr-pulse 0.9s ease-in-out 2;
}
@keyframes wr-pulse {
  0%, 100% { outline: 0 solid rgba(99, 102, 241, 0); }
  50% { outline: 3px solid rgba(99, 102, 241, 0.55); outline-offset: 3px; }
}
.wr-reminder.wr-low-confidence .wr-reminder-bg {
  outline: 2px dashed rgba(217, 119, 6, 0.8);
  outline-offset: -2px;
}
.wr-reminder-text {
  position: relative;
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
  opacity: 0.55;
  transition: opacity 0.12s ease;
}
.wr-reminder:hover .wr-menu-btn {
  opacity: 1;
}
.wr-menu-btn:hover {
  background: #fff;
}
.wr-shape-heart,
.wr-shape-star,
.wr-shape-cloud {
  text-align: center;
}

/* --- Shapes --- */
.wr-shape-notepad .wr-reminder-bg {
  border-radius: 6px;
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05)),
    repeating-linear-gradient(
      transparent 0,
      transparent 22px,
      rgba(15, 23, 42, 0.08) 23px
    );
  background-size: 100% 10px, 100% 100%;
  border-left: 3px solid rgba(239, 68, 68, 0.45);
}
.wr-shape-postit .wr-reminder-bg {
  border-radius: 2px;
}
.wr-shape-postit .wr-reminder-bg::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0;
  border-width: 0 0 16px 16px;
  border-style: solid;
  border-color: transparent transparent rgba(0, 0, 0, 0.18) transparent;
}
.wr-shape-bubble .wr-reminder-bg {
  border-radius: 16px;
}
.wr-shape-bubble .wr-reminder-bg::after {
  content: '';
  position: absolute;
  left: 18px;
  bottom: -9px;
  border-width: 10px 10px 0 0;
  border-style: solid;
  border-color: var(--wr-bg, #fff) transparent transparent transparent;
}
.wr-shape-cloud .wr-reminder-bg,
.wr-shape-heart .wr-reminder-bg,
.wr-shape-star .wr-reminder-bg {
  box-shadow: none;
  filter: drop-shadow(0 5px 10px rgba(15, 23, 42, 0.28));
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
}
.wr-shape-heart .wr-reminder-bg {
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 29'%3E%3Cpath d='M23.6 0c-3.4 0-6.3 2.7-7.6 5.1C14.7 2.7 11.8 0 8.4 0 3.8 0 0 3.8 0 8.4 0 17.8 16 29 16 29s16-11.2 16-20.6C32 3.8 28.2 0 23.6 0z' fill='%23000'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 29'%3E%3Cpath d='M23.6 0c-3.4 0-6.3 2.7-7.6 5.1C14.7 2.7 11.8 0 8.4 0 3.8 0 0 3.8 0 8.4 0 17.8 16 29 16 29s16-11.2 16-20.6C32 3.8 28.2 0 23.6 0z' fill='%23000'/%3E%3C/svg%3E");
}
.wr-shape-star .wr-reminder-bg {
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17.3 5.8 20.9l1.6-6.8L2.2 8.9l6.9-.6z' fill='%23000'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17.3 5.8 20.9l1.6-6.8L2.2 8.9l6.9-.6z' fill='%23000'/%3E%3C/svg%3E");
}
.wr-shape-cloud .wr-reminder-bg {
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 42'%3E%3Cpath d='M19 40c-8 0-14-6-14-13 0-6 4-11 10-12 1-8 7-13 15-13 7 0 13 5 15 12 6 0 10 5 10 11s-5 12-12 12z' fill='%23000'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 42'%3E%3Cpath d='M19 40c-8 0-14-6-14-13 0-6 4-11 10-12 1-8 7-13 15-13 7 0 13 5 15 12 6 0 10 5 10 11s-5 12-12 12z' fill='%23000'/%3E%3C/svg%3E");
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
  max-height: calc(100vh - 24px);
  overflow-y: auto;
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
.wr-shape-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.wr-shape-btn {
  width: 30px;
  height: 28px;
  border-radius: 7px;
  border: 1px solid rgba(100, 116, 139, 0.35);
  background: transparent;
  color: inherit;
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
}
.wr-shape-btn:hover {
  background: rgba(99, 102, 241, 0.12);
}
.wr-shape-btn.active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.18);
}
.wr-template-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.wr-template {
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.wr-template:hover {
  transform: scale(1.05);
}
.wr-template:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 1px;
}
`;
