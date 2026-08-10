export type MatchMode = 'exact' | 'path' | 'domain';

export type AnchorType = 'text' | 'element' | 'free';

export type PositionMode = 'anchored' | 'offset' | 'free';

export interface PageIdentity {
  url: string;
  origin: string;
  hostname: string;
  pathname: string;
  search?: string;
  hash?: string;
}

export interface Anchor {
  type: AnchorType;
  selector?: string;
  xpath?: string;
  textQuote?: {
    exact: string;
    prefix?: string;
    suffix?: string;
  };
  textPosition?: {
    start: number;
    end: number;
  };
  elementFingerprint?: {
    tagName?: string;
    id?: string;
    classNames?: string[];
    attributes?: Record<string, string>;
  };
  relativeOffset?: {
    x: number;
    y: number;
  };
}

export type ReminderShape =
  | 'rounded'
  | 'rectangle'
  | 'notepad'
  | 'postit'
  | 'bubble'
  | 'cloud'
  | 'heart'
  | 'star';

export interface ReminderStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  backgroundColor: string;
  opacity: number;
  borderRadius: number;
  padding: number;
  width?: number;
  shape: ReminderShape;
}

export interface Reminder {
  id: string;
  text: string;
  page: PageIdentity;
  matchMode: MatchMode;
  anchor: Anchor;
  style: ReminderStyle;
  positionMode: PositionMode;
  offsetX?: number;
  offsetY?: number;
  pagePosition?: { x: number; y: number };
  createdAt: number;
  updatedAt: number;
  enabled: boolean;
}

export interface Settings {
  extensionEnabled: boolean;
  showRemindersAutomatically: boolean;
  highlightOnLoad: boolean;
  defaultMatchMode: MatchMode;
  defaultStyle: ReminderStyle;
  confirmBeforeDelete: boolean;
  contextMenuEnabled: boolean;
}

export interface StorageShape {
  schemaVersion: number;
  reminders: Record<string, Reminder>;
  settings: Settings;
}

export interface BackupFile {
  version: number;
  exportedAt: number;
  reminders: Reminder[];
  settings?: Settings;
}

export interface AnchorResolution {
  element: Element | null;
  confidence: number;
  method: string;
}
