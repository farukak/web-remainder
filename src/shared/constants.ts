import type { ReminderStyle, Settings } from './types';

export const SCHEMA_VERSION = 1;

export const STORAGE_KEY = 'webRemainder.state';

export const ROOT_ID = 'web-remainder-root';

export const LOG_PREFIX = '[WebRemainder]';

export const FONT_FAMILIES = [
  'Inter',
  'Arial',
  'Helvetica',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'system-ui',
] as const;

export const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 32] as const;

export const FONT_WEIGHTS = [400, 500, 600, 700] as const;

export const DEFAULT_STYLE: ReminderStyle = {
  fontFamily: 'Inter',
  fontSize: 14,
  fontWeight: 500,
  color: '#0f172a',
  backgroundColor: '#fef9c3',
  opacity: 1,
  borderRadius: 8,
  padding: 10,
};

export const DEFAULT_SETTINGS: Settings = {
  extensionEnabled: true,
  showRemindersAutomatically: true,
  highlightOnLoad: true,
  defaultMatchMode: 'exact',
  defaultStyle: DEFAULT_STYLE,
  confirmBeforeDelete: true,
  contextMenuEnabled: true,
};

export const CONTEXT_MENU_ID = 'web-remainder-add';

export const ADD_REMINDER_COMMAND = 'add-reminder';
