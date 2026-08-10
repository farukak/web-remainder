import { beforeEach, describe, expect, it } from 'vitest';
import { parseBackup, validateBackup } from '../src/shared/backup';
import { DEFAULT_STYLE, SCHEMA_VERSION, STORAGE_KEY } from '../src/shared/constants';
import {
  clearAll,
  createReminder,
  exportData,
  getReminders,
  importData,
  readState,
} from '../src/shared/storage';
import type { Reminder } from '../src/shared/types';
import { pageIdentityFromUrl } from '../src/shared/utils';

function makeReminder(id: string): Reminder {
  return {
    id,
    text: `note ${id}`,
    page: pageIdentityFromUrl('https://x.com/p'),
    matchMode: 'exact',
    anchor: { type: 'element', selector: `#${id}` },
    style: { ...DEFAULT_STYLE },
    positionMode: 'anchored',
    createdAt: 1,
    updatedAt: 2,
    enabled: true,
  };
}

beforeEach(async () => {
  await clearAll();
});

describe('validateBackup', () => {
  it('rejects non-objects and missing fields', () => {
    expect(() => validateBackup(null)).toThrow();
    expect(() => validateBackup({ reminders: [] })).toThrow(/version/);
    expect(() => validateBackup({ version: 1 })).toThrow(/reminders/);
  });

  it('drops malformed reminders but keeps valid ones', () => {
    const result = validateBackup({
      version: 1,
      reminders: [
        makeReminder('good'),
        { id: 'bad' }, // no page/anchor
        { text: 'no id' },
        42,
      ],
    });
    expect(result.reminders).toHaveLength(1);
    expect(result.reminders[0].id).toBe('good');
  });

  it('fills missing style fields with defaults', () => {
    const result = validateBackup({
      version: 1,
      reminders: [
        {
          id: 'a',
          page: { url: 'https://x.com/p' },
          anchor: { type: 'text', textQuote: { exact: 'hi' } },
          style: { color: '#123456' },
        },
      ],
    });
    const style = result.reminders[0].style;
    expect(style.color).toBe('#123456');
    expect(style.fontSize).toBe(DEFAULT_STYLE.fontSize);
    expect(style.fontFamily).toBe(DEFAULT_STYLE.fontFamily);
  });

  it('rejects non-string reminder text via sanitizer coercion', () => {
    const result = validateBackup({
      version: 1,
      reminders: [
        {
          id: 'a',
          text: { evil: '<script>' },
          page: { url: 'https://x.com/p' },
          anchor: { type: 'element', selector: '#a' },
        },
      ],
    });
    expect(result.reminders[0].text).toBe('');
  });
});

describe('parseBackup', () => {
  it('throws on invalid JSON', () => {
    expect(() => parseBackup('{not json')).toThrow(/JSON/);
  });
});

describe('import round-trip', () => {
  it('exports then re-imports identical reminders', async () => {
    await createReminder(makeReminder('a'));
    await createReminder(makeReminder('b'));
    const json = JSON.stringify(await exportData());

    await clearAll();
    expect(await getReminders()).toHaveLength(0);

    const backup = parseBackup(json);
    const count = await importData(backup, 'replace');
    expect(count).toBe(2);
    const ids = (await getReminders()).map((r) => r.id).sort();
    expect(ids).toEqual(['a', 'b']);
  });

  it('merge keeps existing and overwrites by id', async () => {
    await createReminder(makeReminder('a'));
    const backup = validateBackup({
      version: 1,
      reminders: [{ ...makeReminder('a'), text: 'updated' }, makeReminder('c')],
    });
    await importData(backup, 'merge');
    const all = await getReminders();
    expect(all).toHaveLength(2);
    expect(all.find((r) => r.id === 'a')?.text).toBe('updated');
  });
});

describe('schema migration', () => {
  it('upgrades an older schemaVersion to the current one', async () => {
    await chrome.storage.local.set({
      [STORAGE_KEY]: {
        schemaVersion: 0,
        reminders: { a: makeReminder('a') },
        settings: undefined,
      },
    });
    const state = await readState();
    expect(state.schemaVersion).toBe(SCHEMA_VERSION);
    expect(state.reminders.a.text).toBe('note a');
    expect(state.settings.defaultMatchMode).toBe('exact');
  });
});
