import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_STYLE, SCHEMA_VERSION } from '../src/shared/constants';
import {
  clearAll,
  createReminder,
  deleteReminder,
  exportData,
  getPageReminders,
  getReminder,
  getReminders,
  readState,
  toggleReminder,
  updateReminder,
} from '../src/shared/storage';
import type { MatchMode, Reminder } from '../src/shared/types';
import { pageIdentityFromUrl } from '../src/shared/utils';

function makeReminder(id: string, url: string, matchMode: MatchMode = 'exact'): Reminder {
  return {
    id,
    text: `note ${id}`,
    page: pageIdentityFromUrl(url),
    matchMode,
    anchor: { type: 'element', selector: `#${id}` },
    style: { ...DEFAULT_STYLE },
    positionMode: 'anchored',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    enabled: true,
  };
}

beforeEach(async () => {
  await clearAll();
});

describe('storage defaults', () => {
  it('returns empty state at current schema version', async () => {
    const state = await readState();
    expect(state.schemaVersion).toBe(SCHEMA_VERSION);
    expect(Object.keys(state.reminders)).toHaveLength(0);
    expect(state.settings.defaultMatchMode).toBe('exact');
  });
});

describe('reminder CRUD', () => {
  it('creates and reads back a reminder', async () => {
    await createReminder(makeReminder('a', 'https://x.com/p'));
    const read = await getReminder('a');
    expect(read?.text).toBe('note a');
  });

  it('updates text and bumps updatedAt', async () => {
    const r = makeReminder('a', 'https://x.com/p');
    r.updatedAt = 1;
    await createReminder(r);
    const updated = await updateReminder('a', { text: 'changed' });
    expect(updated?.text).toBe('changed');
    expect(updated!.updatedAt).toBeGreaterThan(1);
  });

  it('toggles enabled state', async () => {
    await createReminder(makeReminder('a', 'https://x.com/p'));
    const toggled = await toggleReminder('a');
    expect(toggled?.enabled).toBe(false);
  });

  it('deletes a reminder', async () => {
    await createReminder(makeReminder('a', 'https://x.com/p'));
    await deleteReminder('a');
    expect(await getReminder('a')).toBeUndefined();
    expect(await getReminders()).toHaveLength(0);
  });
});

describe('getPageReminders', () => {
  it('filters by each reminder match mode', async () => {
    await createReminder(makeReminder('exact', 'https://x.com/a', 'exact'));
    await createReminder(makeReminder('domain', 'https://x.com/other', 'domain'));
    const here = pageIdentityFromUrl('https://x.com/a');
    const matches = (await getPageReminders(here)).map((r) => r.id).sort();
    expect(matches).toEqual(['domain', 'exact']);
  });

  it('excludes reminders from other pages', async () => {
    await createReminder(makeReminder('a', 'https://x.com/a', 'exact'));
    const other = pageIdentityFromUrl('https://y.com/a');
    expect(await getPageReminders(other)).toHaveLength(0);
  });
});

describe('exportData', () => {
  it('produces a versioned backup', async () => {
    await createReminder(makeReminder('a', 'https://x.com/p'));
    const backup = await exportData();
    expect(backup.version).toBe(SCHEMA_VERSION);
    expect(backup.reminders).toHaveLength(1);
    expect(typeof backup.exportedAt).toBe('number');
  });
});
