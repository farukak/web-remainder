import type { PageIdentity } from './types';

export type Message =
  | { type: 'START_ADD_MODE' }
  | { type: 'ADD_FROM_SELECTION'; payload: { text: string } }
  | { type: 'FOCUS_REMINDER'; payload: { id: string } }
  | { type: 'PING' };

export interface PingResponse {
  ok: true;
  page: PageIdentity;
  count: number;
}

/** Sends a message to a specific tab's content script, swallowing the
 *  "no receiver" error that occurs on pages where no content script runs. */
export async function sendToTab<T = unknown>(
  tabId: number,
  message: Message,
): Promise<T | undefined> {
  try {
    return (await chrome.tabs.sendMessage(tabId, message)) as T;
  } catch {
    return undefined;
  }
}

export async function sendToActiveTab<T = unknown>(
  message: Message,
): Promise<T | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return undefined;
  return sendToTab<T>(tab.id, message);
}
