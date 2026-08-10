import { defineBackground } from 'wxt/sandbox';
import { ADD_REMINDER_COMMAND, CONTEXT_MENU_ID } from '../shared/constants';
import { sendToTab } from '../shared/messages';
import { getSettings } from '../shared/storage';
import { log } from '../shared/utils';

async function setupContextMenu(): Promise<void> {
  try {
    const settings = await getSettings();
    await chrome.contextMenus.removeAll();
    if (settings.contextMenuEnabled) {
      chrome.contextMenus.create({
        id: CONTEXT_MENU_ID,
        title: 'Add to Web Remainder',
        contexts: ['selection'],
      });
    }
  } catch (error) {
    log.error('Failed to configure context menu', error);
  }
}

export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener(() => void setupContextMenu());
  chrome.runtime.onStartup.addListener(() => void setupContextMenu());
  chrome.storage.onChanged.addListener((_changes, area) => {
    if (area === 'local') void setupContextMenu();
  });

  chrome.commands.onCommand.addListener(async (command) => {
    if (command !== ADD_REMINDER_COMMAND) return;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) await sendToTab(tab.id, { type: 'START_ADD_MODE' });
  });

  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === CONTEXT_MENU_ID && tab?.id) {
      await sendToTab(tab.id, {
        type: 'ADD_FROM_SELECTION',
        payload: { text: info.selectionText ?? '' },
      });
    }
  });
});
