import { LOG_PREFIX } from './constants';
import type { MatchMode, PageIdentity } from './types';

export function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function now(): number {
  return Date.now();
}

export function pageIdentityFromUrl(rawUrl: string): PageIdentity {
  const u = new URL(rawUrl);
  return {
    url: u.href,
    origin: u.origin,
    hostname: u.hostname,
    pathname: u.pathname,
    search: u.search || undefined,
    hash: u.hash || undefined,
  };
}

/** Decides whether a reminder saved for `saved` should show on `current`,
 *  given the reminder's match mode. */
export function pageMatches(
  saved: PageIdentity,
  current: PageIdentity,
  mode: MatchMode,
): boolean {
  switch (mode) {
    case 'exact':
      return saved.origin === current.origin && saved.pathname === current.pathname
        ? (saved.search ?? '') === (current.search ?? '')
        : false;
    case 'path':
      return saved.origin === current.origin && saved.pathname === current.pathname;
    case 'domain':
      return saved.hostname === current.hostname;
    default:
      return false;
  }
}

export function isSupportedUrl(rawUrl: string | undefined): boolean {
  if (!rawUrl) return false;
  return /^https?:\/\//i.test(rawUrl);
}

export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  wait: number,
): (...args: A) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: A) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

export function throttle<A extends unknown[]>(
  fn: (...args: A) => void,
  wait: number,
): (...args: A) => void {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: A) => {
    const elapsed = Date.now() - last;
    const run = () => {
      last = Date.now();
      fn(...args);
    };
    if (elapsed >= wait) {
      run();
    } else if (!timer) {
      timer = setTimeout(() => {
        timer = undefined;
        run();
      }, wait - elapsed);
    }
  };
}

export function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return 'just now';
  if (diff < hour) return `${Math.floor(diff / minute)} min ago`;
  if (diff < day) return `${Math.floor(diff / hour)} h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)} d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export const log = {
  info: (...args: unknown[]) => {
    if (import.meta.env.DEV) console.warn(LOG_PREFIX, ...args);
  },
  error: (...args: unknown[]) => console.error(LOG_PREFIX, ...args),
};
