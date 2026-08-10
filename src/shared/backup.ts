import { DEFAULT_STYLE } from './constants';
import type {
  Anchor,
  BackupFile,
  MatchMode,
  PageIdentity,
  PositionMode,
  Reminder,
  ReminderStyle,
} from './types';

const MATCH_MODES: MatchMode[] = ['exact', 'path', 'domain'];
const POSITION_MODES: PositionMode[] = ['anchored', 'offset', 'free'];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function num(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function sanitizePage(value: unknown): PageIdentity | null {
  if (!isObject(value)) return null;
  const url = str(value.url);
  if (!url) return null;
  try {
    const u = new URL(url);
    return {
      url: u.href,
      origin: u.origin,
      hostname: u.hostname,
      pathname: u.pathname,
      search: u.search || undefined,
      hash: u.hash || undefined,
    };
  } catch {
    return null;
  }
}

const SHAPES: ReminderStyle['shape'][] = [
  'rounded',
  'rectangle',
  'notepad',
  'postit',
  'bubble',
  'cloud',
  'heart',
  'star',
];

function sanitizeStyle(value: unknown): ReminderStyle {
  const v = isObject(value) ? value : {};
  return {
    fontFamily: str(v.fontFamily, DEFAULT_STYLE.fontFamily),
    fontSize: num(v.fontSize, DEFAULT_STYLE.fontSize),
    fontWeight: num(v.fontWeight, DEFAULT_STYLE.fontWeight),
    color: str(v.color, DEFAULT_STYLE.color),
    backgroundColor: str(v.backgroundColor, DEFAULT_STYLE.backgroundColor),
    opacity: num(v.opacity, DEFAULT_STYLE.opacity),
    borderRadius: num(v.borderRadius, DEFAULT_STYLE.borderRadius),
    padding: num(v.padding, DEFAULT_STYLE.padding),
    width: typeof v.width === 'number' ? v.width : undefined,
    shape: SHAPES.includes(v.shape as ReminderStyle['shape'])
      ? (v.shape as ReminderStyle['shape'])
      : DEFAULT_STYLE.shape,
  };
}

function sanitizeAnchor(value: unknown): Anchor | null {
  if (!isObject(value)) return null;
  const type =
    value.type === 'text' || value.type === 'element' || value.type === 'free'
      ? value.type
      : null;
  if (!type) return null;
  const anchor: Anchor = { type };
  if (typeof value.selector === 'string') anchor.selector = value.selector;
  if (typeof value.xpath === 'string') anchor.xpath = value.xpath;
  if (isObject(value.textQuote) && typeof value.textQuote.exact === 'string') {
    anchor.textQuote = {
      exact: value.textQuote.exact,
      prefix: str(value.textQuote.prefix) || undefined,
      suffix: str(value.textQuote.suffix) || undefined,
    };
  }
  if (
    isObject(value.textPosition) &&
    typeof value.textPosition.start === 'number' &&
    typeof value.textPosition.end === 'number'
  ) {
    anchor.textPosition = {
      start: value.textPosition.start,
      end: value.textPosition.end,
    };
  }
  if (isObject(value.elementFingerprint)) {
    const fp = value.elementFingerprint;
    anchor.elementFingerprint = {
      tagName: str(fp.tagName) || undefined,
      id: str(fp.id) || undefined,
      classNames: Array.isArray(fp.classNames)
        ? fp.classNames.filter((c): c is string => typeof c === 'string')
        : undefined,
      attributes: isObject(fp.attributes)
        ? Object.fromEntries(
            Object.entries(fp.attributes).filter(
              ([, val]) => typeof val === 'string',
            ) as [string, string][],
          )
        : undefined,
    };
  }
  return anchor;
}

function sanitizeReminder(value: unknown): Reminder | null {
  if (!isObject(value)) return null;
  const id = str(value.id);
  const page = sanitizePage(value.page);
  const anchor = sanitizeAnchor(value.anchor);
  if (!id || !page || !anchor) return null;

  const matchMode = MATCH_MODES.includes(value.matchMode as MatchMode)
    ? (value.matchMode as MatchMode)
    : 'exact';
  const positionMode = POSITION_MODES.includes(value.positionMode as PositionMode)
    ? (value.positionMode as PositionMode)
    : 'anchored';

  return {
    id,
    text: str(value.text),
    page,
    matchMode,
    anchor,
    style: sanitizeStyle(value.style),
    positionMode,
    offsetX: typeof value.offsetX === 'number' ? value.offsetX : undefined,
    offsetY: typeof value.offsetY === 'number' ? value.offsetY : undefined,
    pagePosition:
      isObject(value.pagePosition) &&
      typeof value.pagePosition.x === 'number' &&
      typeof value.pagePosition.y === 'number'
        ? { x: value.pagePosition.x, y: value.pagePosition.y }
        : undefined,
    createdAt: num(value.createdAt, Date.now()),
    updatedAt: num(value.updatedAt, Date.now()),
    enabled: bool(value.enabled, true),
  };
}

/** Parses and validates a backup payload, dropping any entries that don't
 *  conform. Throws if the top-level shape is not a recognizable backup. */
export function validateBackup(data: unknown): BackupFile {
  if (!isObject(data)) {
    throw new Error('Backup must be a JSON object.');
  }
  if (typeof data.version !== 'number') {
    throw new Error('Backup is missing a numeric "version" field.');
  }
  if (!Array.isArray(data.reminders)) {
    throw new Error('Backup is missing a "reminders" array.');
  }
  const reminders = data.reminders
    .map(sanitizeReminder)
    .filter((r): r is Reminder => r !== null);

  return {
    version: data.version,
    exportedAt: num(data.exportedAt, Date.now()),
    reminders,
  };
}

export function parseBackup(json: string): BackupFile {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error('File is not valid JSON.');
  }
  return validateBackup(data);
}
