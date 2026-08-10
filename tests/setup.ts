import { beforeEach } from 'vitest';

type Listener = (
  changes: Record<string, { newValue?: unknown; oldValue?: unknown }>,
  area: string,
) => void;

let store: Record<string, unknown> = {};
const listeners: Listener[] = [];

const local = {
  get: async (key?: string | string[] | null) => {
    if (key == null) return { ...store };
    const keys = Array.isArray(key) ? key : [key];
    const result: Record<string, unknown> = {};
    for (const k of keys) if (k in store) result[k] = store[k];
    return result;
  },
  set: async (obj: Record<string, unknown>) => {
    const changes: Record<string, { newValue?: unknown; oldValue?: unknown }> = {};
    for (const [k, v] of Object.entries(obj)) {
      changes[k] = { oldValue: store[k], newValue: v };
      store[k] = v;
    }
    for (const listener of listeners) listener(changes, 'local');
  },
  clear: async () => {
    store = {};
  },
};

// Minimal chrome surface used by the code under test.
(globalThis as unknown as { chrome: unknown }).chrome = {
  storage: {
    local,
    onChanged: {
      addListener: (fn: Listener) => listeners.push(fn),
      removeListener: (fn: Listener) => {
        const i = listeners.indexOf(fn);
        if (i >= 0) listeners.splice(i, 1);
      },
    },
  },
};

beforeEach(() => {
  store = {};
  listeners.length = 0;
});
