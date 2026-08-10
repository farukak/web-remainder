import { defineContentScript } from 'wxt/sandbox';
import { AnnotationManager } from '../content/annotation-manager';
import { startPageWatcher } from '../content/mutation-observer';
import type { Message, PingResponse } from '../shared/messages';
import { subscribe } from '../shared/storage';
import { isSupportedUrl, pageIdentityFromUrl } from '../shared/utils';

export default defineContentScript({
  matches: ['http://*/*', 'https://*/*'],
  runAt: 'document_end',
  main() {
    if (!isSupportedUrl(location.href)) return;

    const manager = new AnnotationManager(pageIdentityFromUrl(location.href));
    void manager.init();

    const stopWatcher = startPageWatcher({
      onUrlChange: (url) => void manager.reload(pageIdentityFromUrl(url)),
      onDomChange: () => {
        manager.reposition();
        manager.retryUnresolved();
      },
    });

    const unsubscribe = subscribe(() => {
      void manager.reload(pageIdentityFromUrl(location.href));
    });

    chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
      switch (message.type) {
        case 'START_ADD_MODE':
          manager.startAddMode();
          return false;
        case 'ADD_FROM_SELECTION':
          manager.addFromCurrentSelection(message.payload.text);
          return false;
        case 'FOCUS_REMINDER':
          manager.focusReminder(message.payload.id);
          return false;
        case 'PING':
          sendResponse({
            ok: true,
            page: pageIdentityFromUrl(location.href),
            count: manager.pageCount,
          } satisfies PingResponse);
          return true;
        default:
          return false;
      }
    });

    window.addEventListener('pagehide', () => {
      stopWatcher();
      unsubscribe();
      manager.destroy();
    });
  },
});
