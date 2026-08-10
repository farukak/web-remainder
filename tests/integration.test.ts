import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AnnotationManager } from '../src/content/annotation-manager';
import { ROOT_ID, DEFAULT_STYLE } from '../src/shared/constants';
import {
  clearAll,
  createReminder,
  deleteReminder,
  updateReminder,
} from '../src/shared/storage';
import type { Reminder } from '../src/shared/types';
import { pageIdentityFromUrl } from '../src/shared/utils';

const RECT = {
  x: 10,
  y: 10,
  width: 120,
  height: 20,
  top: 10,
  left: 10,
  bottom: 30,
  right: 130,
  toJSON: () => ({}),
} as DOMRect;

function reminderFor(id: string, selector: string): Reminder {
  return {
    id,
    text: `note ${id}`,
    page: pageIdentityFromUrl(location.href),
    matchMode: 'exact',
    anchor: { type: 'element', selector },
    style: { ...DEFAULT_STYLE },
    positionMode: 'anchored',
    createdAt: 1,
    updatedAt: 2,
    enabled: true,
  };
}

function shadowText(): string[] {
  const host = document.getElementById(ROOT_ID);
  const nodes = host?.shadowRoot?.querySelectorAll('.wr-reminder-text') ?? [];
  return Array.from(nodes).map((n) => n.textContent ?? '');
}

let manager: AnnotationManager | null = null;

beforeEach(async () => {
  await clearAll();
  document.body.innerHTML = '<p id="para">Migrate this service to Node 22</p>';
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(RECT);
});

afterEach(() => {
  manager?.destroy();
  manager = null;
  vi.restoreAllMocks();
});

describe('core loop', () => {
  it('renders a persisted reminder after (re)load', async () => {
    await createReminder(reminderFor('a', '#para'));
    manager = new AnnotationManager(pageIdentityFromUrl(location.href));
    await manager.init();
    expect(shadowText()).toContain('note a');
  });

  it('reflects an edited reminder on the next load', async () => {
    await createReminder(reminderFor('a', '#para'));
    await updateReminder('a', { text: 'changed text' });
    manager = new AnnotationManager(pageIdentityFromUrl(location.href));
    await manager.init();
    expect(shadowText()).toContain('changed text');
    expect(shadowText()).not.toContain('note a');
  });

  it('does not render a deleted reminder', async () => {
    await createReminder(reminderFor('a', '#para'));
    await deleteReminder('a');
    manager = new AnnotationManager(pageIdentityFromUrl(location.href));
    await manager.init();
    expect(shadowText()).toHaveLength(0);
  });

  it('renders multiple reminders on the same page', async () => {
    document.body.innerHTML =
      '<p id="p1">first</p><p id="p2">second</p><p id="p3">third</p>';
    await createReminder(reminderFor('a', '#p1'));
    await createReminder(reminderFor('b', '#p2'));
    await createReminder(reminderFor('c', '#p3'));
    manager = new AnnotationManager(pageIdentityFromUrl(location.href));
    await manager.init();
    expect(shadowText().sort()).toEqual(['note a', 'note b', 'note c']);
  });

  it('does not render reminders belonging to another page', async () => {
    const other = reminderFor('a', '#para');
    other.page = pageIdentityFromUrl('https://different.example.com/x');
    await createReminder(other);
    manager = new AnnotationManager(pageIdentityFromUrl(location.href));
    await manager.init();
    expect(shadowText()).toHaveLength(0);
  });
});
