import { DEFAULT_SETTINGS, SCHEMA_VERSION, STORAGE_KEY } from './constants';
import type {
  BackupFile,
  PageIdentity,
  Reminder,
  Settings,
  StorageShape,
} from './types';
import { isContextValid, log, now, pageMatches } from './utils';

function emptyState(): StorageShape {
  return {
    schemaVersion: SCHEMA_VERSION,
    reminders: {},
    settings: { ...DEFAULT_SETTINGS },
  };
}

/** Migration steps keyed by the version they upgrade *from*, run in sequence
 *  until the state reaches SCHEMA_VERSION. Add entries here as the schema grows. */
const migrations: Record<number, (state: StorageShape) => StorageShape> = {};

function migrate(state: StorageShape): StorageShape {
  let current = state;
  while (current.schemaVersion < SCHEMA_VERSION) {
    const step = migrations[current.schemaVersion];
    if (!step) {
      current = { ...current, schemaVersion: SCHEMA_VERSION };
      break;
    }
    current = step(current);
  }
  return current;
}

export async function readState(): Promise<StorageShape> {
  try {
    const raw = await chrome.storage.local.get(STORAGE_KEY);
    const stored = raw[STORAGE_KEY] as StorageShape | undefined;
    if (!stored || typeof stored !== 'object') return emptyState();
    const merged: StorageShape = {
      schemaVersion: stored.schemaVersion ?? SCHEMA_VERSION,
      reminders: stored.reminders ?? {},
      settings: { ...DEFAULT_SETTINGS, ...(stored.settings ?? {}) },
    };
    return migrate(merged);
  } catch (error) {
    if (isContextValid()) log.error('Failed to read storage', error);
    return emptyState();
  }
}

async function writeState(state: StorageShape): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: state });
}

export async function getReminders(): Promise<Reminder[]> {
  const state = await readState();
  return Object.values(state.reminders).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getReminder(id: string): Promise<Reminder | undefined> {
  const state = await readState();
  return state.reminders[id];
}

export async function getPageReminders(page: PageIdentity): Promise<Reminder[]> {
  const reminders = await getReminders();
  return reminders.filter((r) => pageMatches(r.page, page, r.matchMode));
}

export async function createReminder(reminder: Reminder): Promise<Reminder> {
  const state = await readState();
  state.reminders[reminder.id] = reminder;
  await writeState(state);
  return reminder;
}

export async function updateReminder(
  id: string,
  patch: Partial<Omit<Reminder, 'id' | 'createdAt'>>,
): Promise<Reminder | undefined> {
  const state = await readState();
  const existing = state.reminders[id];
  if (!existing) return undefined;
  const updated: Reminder = { ...existing, ...patch, updatedAt: now() };
  state.reminders[id] = updated;
  await writeState(state);
  return updated;
}

export async function deleteReminder(id: string): Promise<void> {
  const state = await readState();
  if (state.reminders[id]) {
    delete state.reminders[id];
    await writeState(state);
  }
}

export async function toggleReminder(id: string): Promise<Reminder | undefined> {
  const existing = await getReminder(id);
  if (!existing) return undefined;
  return updateReminder(id, { enabled: !existing.enabled });
}

export async function getSettings(): Promise<Settings> {
  const state = await readState();
  return state.settings;
}

export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  const state = await readState();
  state.settings = { ...state.settings, ...patch };
  await writeState(state);
  return state.settings;
}

export async function exportData(): Promise<BackupFile> {
  const state = await readState();
  return {
    version: SCHEMA_VERSION,
    exportedAt: now(),
    reminders: Object.values(state.reminders),
    settings: state.settings,
  };
}

export async function clearAll(): Promise<void> {
  await writeState(emptyState());
}

/** Imports a validated backup. In 'merge' mode existing reminders are kept and
 *  overwritten by id; in 'replace' mode the store is reset to the backup. */
export async function importData(
  backup: BackupFile,
  mode: 'merge' | 'replace',
): Promise<number> {
  const state = mode === 'replace' ? emptyState() : await readState();
  for (const reminder of backup.reminders) {
    state.reminders[reminder.id] = reminder;
  }
  await writeState(state);
  return backup.reminders.length;
}

export function subscribe(listener: (state: StorageShape) => void): () => void {
  const handler = (
    changes: Record<string, chrome.storage.StorageChange>,
    area: string,
  ) => {
    if (area === 'local' && changes[STORAGE_KEY]) {
      const next = changes[STORAGE_KEY].newValue as StorageShape | undefined;
      listener(next ?? emptyState());
    }
  };
  chrome.storage.onChanged.addListener(handler);
  return () => chrome.storage.onChanged.removeListener(handler);
}
